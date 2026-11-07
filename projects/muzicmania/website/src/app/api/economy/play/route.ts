import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const schema = z.object({
  track_id: z.string().trim().min(1).max(80),
  reference: z.string().trim().min(1).max(120),
});

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const admin = adminClient() as any;
  const { error } = await admin.schema('muzicmania').rpc('record_task_event', {
    p_user_id: user.userId,
    p_metric: 'play_song',
    p_amount: 1,
    p_reference_id: `${parsed.data.track_id}:${parsed.data.reference}`,
  });
  if (error) return NextResponse.json({ error: 'play_record_failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
