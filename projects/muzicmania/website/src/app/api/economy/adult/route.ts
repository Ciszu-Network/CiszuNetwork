import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { isAdultBirthDate } from '@/lib/economy/format';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
const schema = z.object({
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  terms_version: z.string().trim().min(1).max(20),
});

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  const adult = isAdultBirthDate(parsed.data.birth_date);
  if (!adult) return NextResponse.json({ error: 'minor', adult: false }, { status: 403 });

  const admin = adminClient() as any;
  const { error } = await admin.schema('muzicmania').from('profiles').update({
    birth_date: parsed.data.birth_date,
    purchase_terms_version: parsed.data.terms_version,
    purchase_terms_accepted_at: new Date().toISOString(),
    birth_date_locked_at: new Date().toISOString(),
    adult_confirmed_at: new Date().toISOString(),
  }).eq('id', user.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ adult: true });
}
