import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const schema = z.object({ item_id: z.string().uuid() });

function logFailure(stage: string, details: Record<string, string>) {
  console.error(`[shop/equip] ${stage}`, details);
}

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  const admin = adminClient() as any;
  const { error } = await admin.schema('muzicmania').rpc('equip_item', {
    p_user_id: user.userId,
    p_item_id: parsed.data.item_id,
  });
  if (error) {
    const message = typeof error.message === 'string' ? error.message : '';
    if (message.includes('not_owned')) return NextResponse.json({ error: 'not_owned' }, { status: 409 });
    logFailure('rpc failed', { userId: user.userId, message: message.slice(0, 200) });
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
