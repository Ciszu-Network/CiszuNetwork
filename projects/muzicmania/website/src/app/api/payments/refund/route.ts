import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
const schema = z.object({
  order_id: z.string().uuid(),
  reason: z.string().trim().min(5).max(500),
});

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const admin = adminClient() as any;
  const { data: order, error: orderError } = await admin.schema('pagos').from('orders')
    .select('id,status,amount_cents,currency')
    .eq('id', parsed.data.order_id)
    .eq('user_id', user.userId)
    .maybeSingle();
  if (orderError) return NextResponse.json({ error: 'order_lookup_failed' }, { status: 500 });
  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  if (!['fulfilled', 'paid'].includes(order.status)) {
    return NextResponse.json({ error: 'order_not_refundable' }, { status: 409 });
  }

  const { data, error } = await admin.schema('pagos').from('refund_requests')
    .insert({
      order_id: order.id,
      user_id: user.userId,
      amount_cents: order.amount_cents,
      currency: order.currency,
      reason: parsed.data.reason,
    })
    .select('id,status,created_at')
    .single();
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'refund_already_requested' }, { status: 409 });
    return NextResponse.json({ error: 'refund_request_failed' }, { status: 500 });
  }
  return NextResponse.json({ request: data });
}
