import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { buildDebugStatus } from '@ciszu/ui/server';
import { adminClient, authenticate, verifyStaffElevation } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 40 });
const uuid = /^[0-9a-f-]{36}$/i;

const noteSchema = z.object({
  time: z.number().min(0).max(3600),
  lane: z.number().int().min(0).max(3),
  type: z.enum(['tap', 'hold', 'mine']),
  endTime: z.number().min(0).max(3600).optional(),
});

const chartSchema = z.object({
  formatVersion: z.string().max(12).optional(),
  offset: z.number().min(-30).max(30).optional(),
  notes: z.array(noteSchema).max(5000),
});

const patchSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(600).optional(),
    difficulty: z.enum(['Easy', 'Normal', 'Hard', 'Expert']).optional(),
    bpm: z.number().min(40).max(400).optional(),
    chart_offset: z.number().min(-30).max(30).optional(),
    chart: chartSchema.optional(),
    status: z.enum(['draft', 'published']).optional(),
    archived: z.boolean().optional(),
    official: z.boolean().optional(),
    official_slot: z.string().trim().max(80).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'empty_update' });

type Row = Record<string, any>;

function normalizeChart(raw: unknown, fallbackOffset = 0) {
  const parsed = chartSchema.safeParse(raw);
  if (!parsed.success) return null;
  return {
    formatVersion: parsed.data.formatVersion ?? '1.0',
    offset: parsed.data.offset ?? fallbackOffset,
    notes: parsed.data.notes
      .slice()
      .sort((a, b) => a.time - b.time)
      .map((note) => ({
        time: Math.round(note.time * 1000) / 1000,
        lane: note.lane,
        type: note.type,
        ...(note.type === 'hold' && note.endTime !== undefined
          ? { endTime: Math.round(Math.max(note.time + 0.05, note.endTime) * 1000) / 1000 }
          : {}),
      })),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.test(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  try {
    const sb = adminClient() as any;
    const { data, error } = await sb
      .schema('muzicmania')
      .from('custom_levels')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const row = data as Row;
    const publicLevel = row.status === 'published' && !row.archived;
    if (!publicLevel) {
      const user = await authenticate(req);
      if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });
      if (user.userId !== row.user_id) {
        const debug = await buildDebugStatus({
          admin: sb,
          user,
          site: 'muzicmania',
          elevationToken: req.headers.get('x-staff-elevation'),
          verifyElevation: verifyStaffElevation,
        });
        const adminEditor = debug.authorized
          && (debug.staff?.role === 'owner' || debug.staff?.role === 'admin')
          && debug.features.officialEditor;
        if (!adminEditor) return NextResponse.json({ error: 'not_found' }, { status: 404 });
      }
    } else {
      void sb
        .schema('muzicmania')
        .from('custom_levels')
        .update({ plays: Number(row.plays ?? 0) + 1 })
        .eq('id', id);
    }

    return NextResponse.json({ level: row }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'level_error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.test(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = await parseJsonBody(req, patchSchema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }

  try {
    const sb = adminClient() as any;
    const { data: current, error: readError } = await sb
      .schema('muzicmania')
      .from('custom_levels')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const isOwner = current.user_id === user.userId;
    const needsOfficialAccess = current.official === true || parsed.data.official === true || parsed.data.official_slot !== undefined;
    let adminEditor = false;
    if (!isOwner || needsOfficialAccess) {
      const debug = await buildDebugStatus({
        admin: sb,
        user,
        site: 'muzicmania',
        elevationToken: req.headers.get('x-staff-elevation'),
        verifyElevation: verifyStaffElevation,
      });
      adminEditor = debug.authorized
        && (debug.staff?.role === 'owner' || debug.staff?.role === 'admin')
        && debug.features.officialEditor;
      if (!isOwner && !adminEditor) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
      }
      if (needsOfficialAccess && !adminEditor) {
        return NextResponse.json({ error: 'forbidden_official_editor' }, { status: 403 });
      }
    }

    const update: Row = {};
    if (parsed.data.title !== undefined) update.title = parsed.data.title;
    if (parsed.data.description !== undefined) update.description = parsed.data.description;
    if (parsed.data.difficulty !== undefined) update.difficulty = parsed.data.difficulty;
    if (parsed.data.bpm !== undefined) update.bpm = parsed.data.bpm;
    if (parsed.data.archived !== undefined) update.archived = parsed.data.archived;
    if (needsOfficialAccess && parsed.data.official !== undefined) update.official = parsed.data.official;
    if (needsOfficialAccess && parsed.data.official_slot !== undefined) update.official_slot = parsed.data.official_slot;

    if (parsed.data.chart !== undefined || parsed.data.chart_offset !== undefined) {
      const chart = normalizeChart(parsed.data.chart ?? current.chart, parsed.data.chart_offset ?? current.chart_offset);
      if (!chart) return NextResponse.json({ error: 'invalid_chart' }, { status: 400 });
      update.chart = chart;
      update.chart_offset = chart.offset;
    }

    const nextStatus = parsed.data.status ?? current.status;
    const nextArchived = parsed.data.archived ?? current.archived;
    if (nextStatus === 'published') {
      const chart = update.chart ?? current.chart;
      const notes = Array.isArray(chart?.notes) ? chart.notes : [];
      if (notes.length === 0) {
        return NextResponse.json({ error: 'empty_chart' }, { status: 400 });
      }
      if (nextArchived) {
        return NextResponse.json({ error: 'archived_cannot_publish' }, { status: 400 });
      }
    }
    if (parsed.data.status !== undefined) update.status = parsed.data.status;

    let updateQuery = sb
      .schema('muzicmania')
      .from('custom_levels')
      .update(update)
      .eq('id', id);
    if (!adminEditor) updateQuery = updateQuery.eq('user_id', user.userId);
    const { data, error } = await updateQuery
      .select('id,title,description,track_id,difficulty,bpm,chart_offset,status,archived,official,official_slot,plays,likes,created_at,updated_at,published_at')
      .single();
    if (error) throw new Error(error.message);
    if (nextStatus === 'published') {
      const { error: rewardError } = await sb.schema('muzicmania').rpc('grant_level_upload_reward', {
        p_user_id: user.userId,
        p_level_id: id,
      });
      if (rewardError) console.error('[levels/reward]', { levelId: id, message: String(rewardError.message ?? '').slice(0, 200) });
    }
    return NextResponse.json({ level: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'update_level_error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.test(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  try {
    const sb = adminClient() as any;
    const { data: current } = await sb
      .schema('muzicmania')
      .from('custom_levels')
      .select('user_id,official')
      .eq('id', id)
      .maybeSingle();
    if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const isOwner = current.user_id === user.userId;
    let adminEditor = false;
    if (!isOwner || current.official === true) {
      const debug = await buildDebugStatus({
        admin: sb,
        user,
        site: 'muzicmania',
        elevationToken: req.headers.get('x-staff-elevation'),
        verifyElevation: verifyStaffElevation,
      });
      adminEditor = debug.authorized
        && (debug.staff?.role === 'owner' || debug.staff?.role === 'admin')
        && debug.features.officialEditor;
      if (!isOwner && !adminEditor) return NextResponse.json({ error: 'not_found' }, { status: 404 });
      if (current.official === true && !adminEditor) return NextResponse.json({ error: 'forbidden_official_editor' }, { status: 403 });
    }
    let deleteQuery = sb
      .schema('muzicmania')
      .from('custom_levels')
      .delete()
      .eq('id', id);
    if (!adminEditor) deleteQuery = deleteQuery.eq('user_id', user.userId);
    const { error } = await deleteQuery;
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'delete_level_error' }, { status: 500 });
  }
}
