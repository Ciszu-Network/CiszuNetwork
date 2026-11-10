import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';
import { adultStatus } from '@/lib/economy/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
const schema = z.object({
  points: z.coerce.number().int().min(100).max(1000000),
  method: z.enum(['bank', 'paypal']),
  destination: z.string().trim().min(4).max(200),
});

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const admin = adminClient() as any;
  const { data, error } = await admin.schema('pagos').from('withdrawal_requests')
    .select('id,points_amount,method,destination,status,admin_note,created_at,processed_at')
    .eq('user_id', user.userId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) return NextResponse.json({ error: 'withdrawals_load_failed' }, { status: 500 });
  return NextResponse.json({ withdrawals: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const admin = adminClient() as any;
  const adult = await adultStatus(admin, user.userId);
  if (!adult.isAdult || !adult.emailVerified) {
    return NextResponse.json({ error: 'adult_verified_required' }, { status: 403 });
  }

  const { data, error } = await admin.schema('muzicmania').rpc('request_withdrawal', {
    p_user_id: user.userId,
    p_amount: parsed.data.points,
    p_method: parsed.data.method,
    p_destination: parsed.data.destination,
  });
  if (error) {
    const message = String(error.message ?? '');
    if (message.includes('insufficient_points')) return NextResponse.json({ error: 'insufficient_points' }, { status: 409 });
    if (message.includes('withdrawal_minimum')) return NextResponse.json({ error: 'withdrawal_minimum' }, { status: 400 });
    return NextResponse.json({ error: 'withdrawal_failed' }, { status: 500 });
  }
  return NextResponse.json({ request_id: data });
}
