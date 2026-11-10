import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 8 });
const schema = z.object({ code: z.string().trim().min(3).max(40) });

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').rpc('redeem_promo_code', {
    p_user_id: user.userId,
    p_code: parsed.data.code,
  });
  if (error) {
    const message = String(error.message ?? '');
    const known = ['promo_not_found', 'promo_expired', 'promo_exhausted', 'promo_already_used', 'invalid_promo_code'];
    const key = known.find((value) => message.includes(value));
    return NextResponse.json({ error: key ?? 'promo_failed' }, { status: key ? 409 : 500 });
  }
  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({
    code: row?.code ?? parsed.data.code,
    credited: Number(row?.credited ?? 0),
    balance: Number(row?.balance ?? 0),
  });
}
