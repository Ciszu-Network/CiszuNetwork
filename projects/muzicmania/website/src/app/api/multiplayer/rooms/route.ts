import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });
const MODES = { '1v1': 2, duo: 4, trio: 6 } as const;
const createSchema = z.object({
  mode: z.enum(['1v1', 'duo', 'trio']),
  track_id: z.string().trim().max(80).optional(),
  level_id: z.string().uuid().optional(),
  level_title: z.string().trim().max(120).optional(),
});

type Row = Record<string, any>;

function code() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function profilesFor(admin: any, ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return new Map<string, Row>();
  const { data } = await admin.schema('muzicmania').from('profiles').select('id,username,display_name,avatar_url').in('id', unique);
  return new Map<string, Row>(((data ?? []) as Row[]).map((row) => [row.id, row]));
}

async function shapeRoom(admin: any, room: Row) {
  const { data: players } = await admin
    .schema('muzicmania')
    .from('multiplayer_room_players')
    .select('*')
    .eq('room_id', room.id)
    .order('joined_at', { ascending: true });
  const list = (players ?? []) as Row[];
  const profiles = await profilesFor(admin, list.map((player) => player.user_id));
  return {
    ...room,
    players: list.map((player) => ({ ...player, profile: profiles.get(player.user_id) ?? null })),
  };
}

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const admin = adminClient() as any;
    const { data, error } = await admin
      .schema('muzicmania')
      .from('multiplayer_rooms')
      .select('*')
      .in('status', ['waiting', 'playing'])
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    const rooms = await Promise.all(((data ?? []) as Row[]).map((room) => shapeRoom(admin, room)));
    return NextResponse.json({ rooms }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'rooms_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = await parseJsonBody(req, createSchema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  try {
    const admin = adminClient() as any;
    const { data: existing } = await admin
      .schema('muzicmania')
      .from('multiplayer_room_players')
      .select('room_id, multiplayer_rooms!inner(status)')
      .eq('user_id', user.userId)
      .in('multiplayer_rooms.status', ['waiting', 'playing'])
      .maybeSingle();
    if (existing?.room_id) return NextResponse.json({ error: 'already_in_room', room_id: existing.room_id }, { status: 409 });

    let room: Row | null = null;
    for (let attempt = 0; attempt < 5 && !room; attempt += 1) {
      const { data, error } = await admin
        .schema('muzicmania')
        .from('multiplayer_rooms')
        .insert({
          code: code(),
          host_id: user.userId,
          mode: parsed.data.mode,
          max_players: MODES[parsed.data.mode],
          track_id: parsed.data.track_id ?? null,
          level_id: parsed.data.level_id ?? null,
          level_title: parsed.data.level_title ?? null,
          status: 'waiting',
        })
        .select('*')
        .maybeSingle();
      if (!error && data) room = data as Row;
      else if (error && !String(error.message).includes('duplicate')) throw new Error(error.message);
    }
    if (!room) throw new Error('no_code_available');

    await admin.schema('muzicmania').from('multiplayer_room_players').insert({
      room_id: room.id,
      user_id: user.userId,
      slot: 0,
      team: 0,
      ready: false,
    });
    return NextResponse.json({ room: await shapeRoom(admin, room) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'create_room_error' }, { status: 500 });
  }
}
