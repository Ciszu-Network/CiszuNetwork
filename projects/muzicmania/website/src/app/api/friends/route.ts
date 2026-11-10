import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });
const createSchema = z.object({ username: z.string().trim().min(1).max(30) });
const actionSchema = z.object({ id: z.string().uuid(), action: z.enum(['accept', 'reject']) });

async function friendData(admin: any, userId: string) {
  const [{ data: received }, { data: sent }] = await Promise.all([
    admin.schema('muzicmania').from('friend_requests')
      .select('id,sender_id,status,created_at')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    admin.schema('muzicmania').from('friend_requests')
      .select('id,recipient_id,status,created_at')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);
  const ids = Array.from(new Set([...(received ?? []).map((row: any) => row.sender_id), ...(sent ?? []).map((row: any) => row.recipient_id)]));
  const { data: people } = ids.length
    ? await admin.schema('muzicmania').from('profiles').select('id,username,display_name,avatar_url').in('id', ids)
    : { data: [] };
  const profiles = Object.fromEntries((people ?? []).map((person: any) => [person.id, person]));
  return {
    received: (received ?? []).map((row: any) => ({ ...row, user: profiles[row.sender_id] ?? null })),
    sent: (sent ?? []).map((row: any) => ({ ...row, user: profiles[row.recipient_id] ?? null })),
  };
}

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json(await friendData(adminClient() as any, user.userId), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, createSchema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const admin = adminClient() as any;
  const username = parsed.data.username.replace(/^@/, '');
  const { data: recipient, error: recipientError } = await admin.schema('muzicmania').from('profiles')
    .select('id,username,display_name')
    .ilike('username', username)
    .maybeSingle();
  if (recipientError) return NextResponse.json({ error: 'friend_lookup_failed' }, { status: 500 });
  if (!recipient) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  if (recipient.id === user.userId) return NextResponse.json({ error: 'self_friend_request' }, { status: 409 });
  const { data, error } = await admin.schema('muzicmania').from('friend_requests')
    .insert({ sender_id: user.userId, recipient_id: recipient.id })
    .select('id,status,created_at')
    .single();
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'friend_request_pending' }, { status: 409 });
    return NextResponse.json({ error: 'friend_request_failed' }, { status: 500 });
  }
  return NextResponse.json({ request: data });
}

export async function PATCH(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const parsed = await parseJsonBody(req, actionSchema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').from('friend_requests')
    .update({ status: parsed.data.action === 'accept' ? 'accepted' : 'rejected', resolved_at: new Date().toISOString() })
    .eq('id', parsed.data.id)
    .eq('recipient_id', user.userId)
    .eq('status', 'pending')
    .select('id,status')
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'friend_update_failed' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'friend_request_not_found' }, { status: 404 });
  return NextResponse.json({ request: data });
}
