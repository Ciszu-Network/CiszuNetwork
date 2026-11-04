import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 40 });
const postSchema = z.object({
  scope: z.enum(['global', 'room', 'dm']),
  content: z.string().trim().min(1).max(1000),
  room_id: z.string().uuid().optional(),
  to: z.string().uuid().optional(),
});
const readSchema = z.object({ scope: z.literal('dm'), with: z.string().uuid() });
type Row = Record<string, any>;

async function profilesFor(admin: any, ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return new Map<string, Row>();
  const { data } = await admin.schema('muzicmania').from('profiles').select('id,username,display_name,avatar_url').in('id', unique);
  return new Map<string, Row>(((data ?? []) as Row[]).map((row) => [row.id, row]));
}

async function withProfiles(admin: any, rows: Row[]) {
  const profiles = await profilesFor(admin, rows.map((row) => row.sender_id));
  return rows.map((row) => ({ ...row, sender: profiles.get(row.sender_id) ?? null }));
}

async function roomMember(admin: any, roomId: string, userId: string) {
  const { data } = await admin.schema('muzicmania').from('multiplayer_room_players').select('room_id').eq('room_id', roomId).eq('user_id', userId).maybeSingle();
  return Boolean(data);
}

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const scope = url.searchParams.get('scope') ?? 'global';
  try {
    const admin = adminClient() as any;
    if (scope === 'threads') {
      const { data, error } = await admin
        .schema('muzicmania')
        .from('chat_messages')
        .select('*')
        .eq('scope', 'dm')
        .or(`sender_id.eq.${user.userId},recipient_id.eq.${user.userId}`)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as Row[];
      const byUser = new Map<string, Row>();
      const unreadByUser = new Map<string, number>();
      for (const row of rows) {
        const other = row.sender_id === user.userId ? row.recipient_id : row.sender_id;
        if (!other) continue;
        if (!byUser.has(other)) byUser.set(other, row);
        if (row.recipient_id === user.userId && !row.read_at) unreadByUser.set(other, (unreadByUser.get(other) ?? 0) + 1);
      }
      const profiles = await profilesFor(admin, Array.from(byUser.keys()));
      const { count: unread } = await admin
        .schema('muzicmania')
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('scope', 'dm')
        .eq('recipient_id', user.userId)
        .is('read_at', null);
      return NextResponse.json({
        threads: Array.from(byUser.entries()).map(([other, last]) => ({
          user: profiles.get(other) ?? { id: other, username: null, display_name: null, avatar_url: null },
          lastMessage: last.content,
          lastAt: last.created_at,
          unread: unreadByUser.get(other) ?? 0,
        })),
        unread: Number(unread ?? 0),
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (scope === 'room') {
      const roomId = url.searchParams.get('room_id') ?? '';
      if (!roomId || !(await roomMember(admin, roomId, user.userId))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
      const { data, error } = await admin.schema('muzicmania').from('chat_messages').select('*').eq('scope', 'room').eq('room_id', roomId).order('created_at', { ascending: false }).limit(80);
      if (error) throw new Error(error.message);
      return NextResponse.json({ messages: (await withProfiles(admin, (data ?? []) as Row[])).reverse() }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (scope === 'dm') {
      const withUser = url.searchParams.get('with') ?? '';
      if (!/^[0-9a-f-]{36}$/i.test(withUser)) return NextResponse.json({ error: 'invalid_user' }, { status: 400 });
      const { data, error } = await admin
        .schema('muzicmania')
        .from('chat_messages')
        .select('*')
        .eq('scope', 'dm')
        .or(`and(sender_id.eq.${user.userId},recipient_id.eq.${withUser}),and(sender_id.eq.${withUser},recipient_id.eq.${user.userId})`)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return NextResponse.json({ messages: (await withProfiles(admin, (data ?? []) as Row[])).reverse() }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const { data, error } = await admin.schema('muzicmania').from('chat_messages').select('*').eq('scope', 'global').order('created_at', { ascending: false }).limit(80);
    if (error) throw new Error(error.message);
    return NextResponse.json({ messages: (await withProfiles(admin, (data ?? []) as Row[])).reverse() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'chat_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, postSchema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  try {
    const admin = adminClient() as any;
    if (parsed.data.scope === 'room') {
      if (!parsed.data.room_id || !(await roomMember(admin, parsed.data.room_id, user.userId))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    if (parsed.data.scope === 'dm' && !parsed.data.to) return NextResponse.json({ error: 'recipient_required' }, { status: 400 });
    const { data, error } = await admin.schema('muzicmania').from('chat_messages').insert({
      scope: parsed.data.scope,
      room_id: parsed.data.scope === 'room' ? parsed.data.room_id : null,
      sender_id: user.userId,
      recipient_id: parsed.data.scope === 'dm' ? parsed.data.to : null,
      content: parsed.data.content,
    }).select('*').single();
    if (error) throw new Error(error.message);
    const profile = (await profilesFor(admin, [user.userId])).get(user.userId) ?? null;
    return NextResponse.json({ message: { ...data, sender: profile } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'chat_send_error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const parsed = await parseJsonBody(req, readSchema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  try {
    const admin = adminClient() as any;
    await admin.schema('muzicmania').from('chat_messages').update({ read_at: new Date().toISOString() }).eq('scope', 'dm').eq('sender_id', parsed.data.with).eq('recipient_id', user.userId).is('read_at', null);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'chat_read_error' }, { status: 500 });
  }
}
