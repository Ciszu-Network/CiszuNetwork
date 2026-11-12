import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const schema = z.object({
  track_id: z.string().trim().min(1).max(80),
  difficulty: z.string().trim().max(32).optional(),
});

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }

  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').from('score_sessions').insert({
    user_id: user.userId,
    track_id: parsed.data.track_id,
    difficulty: parsed.data.difficulty ?? null,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }).select('id, expires_at').single();

  if (error) return NextResponse.json({ error: 'session_create_failed' }, { status: 500 });
  return NextResponse.json({ session: data }, { headers: { 'Cache-Control': 'no-store' } });
}
