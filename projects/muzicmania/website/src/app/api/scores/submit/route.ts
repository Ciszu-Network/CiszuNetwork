import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const schema = z.object({
  session_id: z.string().uuid(),
  score: z.number().int().min(0).max(9_999_999),
  accuracy: z.number().min(0).max(100),
  max_combo: z.number().int().min(0).max(10_000_000),
  perfect: z.number().int().min(0).max(10_000_000),
  great: z.number().int().min(0).max(10_000_000),
  good: z.number().int().min(0).max(10_000_000),
  miss: z.number().int().min(0).max(10_000_000),
  grade: z.string().trim().max(16).optional(),
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
  const now = new Date().toISOString();
  const { data: session, error: sessionError } = await admin
    .schema('muzicmania')
    .from('score_sessions')
    .update({ consumed_at: now })
    .eq('id', parsed.data.session_id)
    .eq('user_id', user.userId)
    .is('consumed_at', null)
    .gt('expires_at', now)
    .select('id, track_id, difficulty')
    .maybeSingle();

  if (sessionError) return NextResponse.json({ error: 'session_lookup_failed' }, { status: 500 });
  if (!session) return NextResponse.json({ error: 'invalid_or_used_session' }, { status: 409 });

  const { error } = await admin.schema('muzicmania').rpc('submit_game_score_as', {
    p_user_id: user.userId,
    p_track_id: session.track_id,
    p_score: parsed.data.score,
    p_combo: parsed.data.max_combo,
    p_accuracy: parsed.data.accuracy,
    p_grade: parsed.data.grade ?? null,
    p_max_combo: parsed.data.max_combo,
    p_perfect: parsed.data.perfect,
    p_great: parsed.data.great,
    p_good: parsed.data.good,
    p_miss: parsed.data.miss,
    p_difficulty: session.difficulty,
  });

  if (error) {
    return NextResponse.json({ error: 'score_save_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
