import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

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

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600).optional(),
  track_id: z.string().trim().min(1).max(80),
  difficulty: z.enum(['Easy', 'Normal', 'Hard', 'Expert']),
  bpm: z.number().min(40).max(400),
  chart_offset: z.number().min(-30).max(30).optional(),
  chart: chartSchema,
});

type Row = Record<string, any>;

function safeQuery(value: string | null): string {
  return (value ?? '').replace(/[%_(),]/g, ' ').trim().slice(0, 80);
}

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

export async function GET(req: NextRequest) {
  let sb: any;
  try {
    sb = adminClient();
  } catch {
    return NextResponse.json({ error: 'supabase_not_configured' }, { status: 500 });
  }

  const url = new URL(req.url);
  const scope = url.searchParams.get('scope') === 'mine' ? 'mine' : 'public';
  const q = safeQuery(url.searchParams.get('q'));
  const difficulty = url.searchParams.get('difficulty');
  const track = safeQuery(url.searchParams.get('track'));
  const includeArchived = url.searchParams.get('archived') === '1';

  let query = sb
    .schema('muzicmania')
    .from('custom_levels')
    .select('id,user_id,title,description,track_id,difficulty,bpm,chart_offset,status,archived,plays,likes,created_at,updated_at,published_at');

  if (scope === 'mine') {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    query = query.eq('user_id', user.userId).order('updated_at', { ascending: false });
    if (!includeArchived) query = query.eq('archived', false);
  } else {
    query = query.eq('status', 'published').eq('archived', false).order('published_at', { ascending: false });
  }

  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (difficulty && ['Easy', 'Normal', 'Hard', 'Expert'].includes(difficulty)) query = query.eq('difficulty', difficulty);
  if (track) query = query.eq('track_id', track);

  const { data, error } = await query.limit(60);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ levels: (data ?? []) as Row[] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = await parseJsonBody(req, createSchema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const chart = normalizeChart(parsed.data.chart, parsed.data.chart_offset ?? 0);
  if (!chart) return NextResponse.json({ error: 'invalid_chart' }, { status: 400 });

  try {
    const sb = adminClient() as any;
    const { data, error } = await sb
      .schema('muzicmania')
      .from('custom_levels')
      .insert({
        user_id: user.userId,
        title: parsed.data.title,
        description: parsed.data.description ?? '',
        track_id: parsed.data.track_id,
        difficulty: parsed.data.difficulty,
        bpm: parsed.data.bpm,
        chart_offset: chart.offset,
        chart,
        status: 'draft',
        archived: false,
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ id: data.id, level: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'create_level_error' }, { status: 500 });
  }
}
