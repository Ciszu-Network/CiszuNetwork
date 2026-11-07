import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const uuid = /^[0-9a-f-]{36}$/i;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.test(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').rpc('like_level', {
    p_user_id: user.userId,
    p_level_id: id,
  });
  if (error) {
    const message = typeof error.message === 'string' ? error.message : '';
    if (message.includes('self_like')) return NextResponse.json({ error: 'self_like' }, { status: 409 });
    if (message.includes('level_not_found')) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ error: 'like_failed' }, { status: 500 });
  }
  return NextResponse.json({ likes: Number(data ?? 0) });
}
