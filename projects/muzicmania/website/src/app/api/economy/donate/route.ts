import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';
import { adultStatus } from '@/lib/economy/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });
const schema = z.object({
  level_id: z.string().uuid(),
  amount: z.number().int().min(1).max(100000),
  message: z.string().trim().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const admin = adminClient() as any;
  const adult = await adultStatus(admin, user.userId);
  if (!adult.isAdult || !adult.emailVerified) return NextResponse.json({ error: 'adult_required' }, { status: 403 });

  const { data, error } = await admin.schema('muzicmania').rpc('donate_to_creator', {
    p_sender_id: user.userId,
    p_level_id: parsed.data.level_id,
    p_amount: parsed.data.amount,
    p_message: parsed.data.message ?? '',
    p_idempotency_key: `donation:${user.userId}:${parsed.data.level_id}:${randomUUID()}`,
  });
  if (error) {
    const message = String(error.message ?? '');
    if (message.includes('insufficient_points')) return NextResponse.json({ error: 'insufficient_points' }, { status: 409 });
    if (message.includes('self_donation')) return NextResponse.json({ error: 'self_donation' }, { status: 409 });
    if (message.includes('level_not_found')) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ error: 'donation_failed' }, { status: 500 });
  }
  return NextResponse.json({ donated: true, points: Number(data ?? 0) });
}
