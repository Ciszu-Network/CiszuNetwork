import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildDebugStatus } from '@ciszu/ui/server';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate, verifyStaffElevation } from '../../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const schema = z.object({
  badge_id: z.string().trim().min(1).max(64),
  level: z.number().int().min(1).max(50).default(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return NextResponse.json({ error: 'invalid_user' }, { status: 400 });
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  const admin = adminClient() as any;
  const debug = await buildDebugStatus({
    admin,
    user,
    site: 'muzicmania',
    elevationToken: req.headers.get('x-staff-elevation'),
    verifyElevation: verifyStaffElevation,
  });
  if (!debug.authorized || (debug.staff?.role !== 'owner' && debug.staff?.role !== 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const { data: badge, error: badgeError } = await admin.schema('muzicmania').from('badge_definitions')
    .select('id,kind').eq('id', parsed.data.badge_id).maybeSingle();
  if (badgeError) return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  if (!badge || badge.kind !== 'exclusive') return NextResponse.json({ error: 'exclusive_badge_required' }, { status: 400 });

  const { error } = await admin.schema('muzicmania').rpc('grant_badge', {
    p_user_id: userId,
    p_badge_id: parsed.data.badge_id,
    p_level: parsed.data.level,
  });
  if (error) return NextResponse.json({ error: 'grant_failed' }, { status: 500 });
  return NextResponse.json({ success: true });
}
