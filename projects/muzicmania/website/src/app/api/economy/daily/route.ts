import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const claimSchema = z.object({ action: z.literal('claim') });

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').rpc('daily_status', { p_user_id: user.userId });
  if (error) return NextResponse.json({ error: 'daily_status_failed' }, { status: 500 });
  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ daily: row ?? { can_claim: true, streak: 0 } }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, claimSchema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').rpc('claim_daily', { p_user_id: user.userId });
  if (error) return NextResponse.json({ error: 'daily_claim_failed' }, { status: 500 });
  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ daily: row });
}
