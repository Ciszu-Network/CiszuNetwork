import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';
import { adultStatus } from '@/lib/economy/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const schema = z.object({
  recipient_username: z.string().trim().min(1).max(20),
  amount: z.number().int().min(1).max(100000).optional(),
  item_id: z.string().uuid().optional(),
  message: z.string().trim().max(200).optional(),
}).refine((value) => Boolean(value.amount) !== Boolean(value.item_id), { message: 'amount_or_item_required' });

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const admin = adminClient() as any;
  const sender = await adultStatus(admin, user.userId);
  if (!sender.isAdult || !sender.emailVerified) return NextResponse.json({ error: 'adult_required' }, { status: 403 });

  const { data: recipient, error: recipientError } = await admin.schema('muzicmania').from('profiles')
    .select('id,username,email_verified').ilike('username', parsed.data.recipient_username).maybeSingle();
  if (recipientError) return NextResponse.json({ error: 'recipient_lookup_failed' }, { status: 500 });
  if (!recipient) return NextResponse.json({ error: 'recipient_not_found' }, { status: 404 });
  if (recipient.id === user.userId) return NextResponse.json({ error: 'self_gift' }, { status: 409 });
  const receiver = await adultStatus(admin, recipient.id);
  if (!receiver.isAdult || !receiver.emailVerified) return NextResponse.json({ error: 'recipient_not_eligible' }, { status: 403 });

  const idempotency = `gift:${user.userId}:${recipient.id}:${randomUUID()}`;
  if (parsed.data.item_id) {
    const { error } = await admin.schema('muzicmania').rpc('gift_item', {
      p_sender_id: user.userId,
      p_recipient_id: recipient.id,
      p_item_id: parsed.data.item_id,
      p_message: parsed.data.message ?? '',
      p_idempotency_key: idempotency,
    });
    if (error) {
      const message = String(error.message ?? '');
      if (message.includes('not_owned')) return NextResponse.json({ error: 'not_owned' }, { status: 409 });
      if (message.includes('recipient_owns_item')) return NextResponse.json({ error: 'recipient_owns_item' }, { status: 409 });
      return NextResponse.json({ error: 'gift_failed' }, { status: 500 });
    }
    return NextResponse.json({ gifted: true, item: parsed.data.item_id });
  }

  const { data, error } = await admin.schema('muzicmania').rpc('gift_points', {
    p_sender_id: user.userId,
    p_recipient_id: recipient.id,
    p_amount: parsed.data.amount,
    p_message: parsed.data.message ?? '',
    p_idempotency_key: idempotency,
  });
  if (error) {
    const message = String(error.message ?? '');
    if (message.includes('insufficient_points')) return NextResponse.json({ error: 'insufficient_points' }, { status: 409 });
    return NextResponse.json({ error: 'gift_failed' }, { status: 500 });
  }
  return NextResponse.json({ gifted: true, points: Number(data ?? 0) });
}
