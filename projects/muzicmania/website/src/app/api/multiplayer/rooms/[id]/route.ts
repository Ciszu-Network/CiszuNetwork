import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });
const uuid = /^[0-9a-f-]{36}$/i;
const actionSchema = z.object({
  action: z.enum(['join', 'leave', 'ready', 'level', 'start', 'finish']),
  ready: z.boolean().optional(),
  track_id: z.string().trim().max(80).nullable().optional(),
  level_id: z.string().uuid().nullable().optional(),
  level_title: z.string().trim().max(120).nullable().optional(),
  score: z.number().int().min(0).max(999_999_999).optional(),
});

type Row = Record<string, any>;

async function profilesFor(admin: any, ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return new Map<string, Row>();
  const { data } = await admin.schema('muzicmania').from('profiles').select('id,username,display_name,avatar_url').in('id', unique);
  return new Map<string, Row>(((data ?? []) as Row[]).map((row) => [row.id, row]));
}

async function detail(admin: any, id: string): Promise<Row | null> {
  const { data: room, error } = await admin.schema('muzicmania').from('multiplayer_rooms').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!room) return null;
  const { data: players } = await admin
    .schema('muzicmania')
    .from('multiplayer_room_players')
    .select('*')
    .eq('room_id', id)
    .order('joined_at', { ascending: true });
  const list = (players ?? []) as Row[];
  const profiles = await profilesFor(admin, list.map((player) => player.user_id));
  return { ...(room as Row), players: list.map((player) => ({ ...player, profile: profiles.get(player.user_id) ?? null })) } as Row;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.test(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const admin = adminClient() as any;
    const room = await detail(admin, id);
    if (!room) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const member = (room.players as Row[]).some((player) => player.user_id === user.userId);
    if (!member && room.status === 'playing') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    return NextResponse.json({ room }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'room_error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.test(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, actionSchema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  try {
    const admin = adminClient() as any;
    const room = await detail(admin, id);
    if (!room) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const players = room.players as Row[];
    const member = players.find((player) => player.user_id === user.userId);
    const isHost = room.host_id === user.userId;
    const action = parsed.data.action;

    if (action === 'join') {
      if (room.status !== 'waiting') return NextResponse.json({ error: 'room_not_waiting' }, { status: 409 });
      if (member) return NextResponse.json({ room });
      if (players.length >= Number(room.max_players)) return NextResponse.json({ error: 'room_full' }, { status: 409 });
      const usedSlots = new Set(players.map((player) => Number(player.slot)));
      let slot = 0;
      while (usedSlots.has(slot)) slot += 1;
      const { error } = await admin.schema('muzicmania').from('multiplayer_room_players').insert({
        room_id: id,
        user_id: user.userId,
        slot,
        team: Math.floor(slot / 2),
        ready: false,
      });
      if (error) throw new Error(error.message);
    } else if (action === 'leave') {
      if (!member) return NextResponse.json({ error: 'not_in_room' }, { status: 403 });
      if (isHost) {
        await admin.schema('muzicmania').from('multiplayer_rooms').delete().eq('id', id);
        return NextResponse.json({ success: true, closed: true });
      }
      await admin.schema('muzicmania').from('multiplayer_room_players').delete().eq('room_id', id).eq('user_id', user.userId);
    } else if (action === 'ready') {
      if (!member) return NextResponse.json({ error: 'not_in_room' }, { status: 403 });
      await admin.schema('muzicmania').from('multiplayer_room_players').update({ ready: parsed.data.ready === true }).eq('room_id', id).eq('user_id', user.userId);
    } else if (action === 'level') {
      if (!isHost) return NextResponse.json({ error: 'host_only' }, { status: 403 });
      if (room.status !== 'waiting') return NextResponse.json({ error: 'room_not_waiting' }, { status: 409 });
      await admin.schema('muzicmania').from('multiplayer_rooms').update({
        track_id: parsed.data.track_id ?? null,
        level_id: parsed.data.level_id ?? null,
        level_title: parsed.data.level_title ?? null,
      }).eq('id', id);
    } else if (action === 'start') {
      if (!isHost) return NextResponse.json({ error: 'host_only' }, { status: 403 });
      if (room.status !== 'waiting') return NextResponse.json({ error: 'room_not_waiting' }, { status: 409 });
      if (players.length < Number(room.max_players)) return NextResponse.json({ error: 'room_not_full' }, { status: 409 });
      if (players.some((player) => !player.ready)) return NextResponse.json({ error: 'players_not_ready' }, { status: 409 });
      await admin.schema('muzicmania').from('multiplayer_rooms').update({ status: 'playing', started_at: new Date().toISOString() }).eq('id', id);
    } else if (action === 'finish') {
      if (!member) return NextResponse.json({ error: 'not_in_room' }, { status: 403 });
      if (parsed.data.score !== undefined) {
        await admin.schema('muzicmania').from('multiplayer_room_players').update({ score: parsed.data.score }).eq('room_id', id).eq('user_id', user.userId);
      }
      if (isHost) await admin.schema('muzicmania').from('multiplayer_rooms').update({ status: 'finished' }).eq('id', id);
    }

    return NextResponse.json({ room: await detail(admin, id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'room_action_error' }, { status: 500 });
  }
}
