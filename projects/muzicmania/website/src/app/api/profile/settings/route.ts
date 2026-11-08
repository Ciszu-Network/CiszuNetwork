import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

const LANGUAGES = ['es', 'en', 'pt', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'hi'] as const;
const safeText = (max: number) => z.string().trim().max(max).refine(
  (value) => !/[<>\u0000-\u001F]/.test(value),
  'invalid_characters',
);
const httpsUrl = z.string().trim().max(500).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}, 'invalid_url');
const nullableUrl = z.union([httpsUrl, z.literal(''), z.null()]).optional();

const schema = z.object({
  display_name: safeText(40).min(1).optional(),
  bio: safeText(160).optional(),
  banner_url: nullableUrl,
  avatar_url: nullableUrl,
  country: z.union([z.string().regex(/^[A-Z]{2}$/), z.literal(''), z.null()]).optional(),
  languages: z.array(z.enum(LANGUAGES)).max(10).optional(),
});

function normalizeUrl(value: string | null | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').from('profiles')
    .select('display_name,bio,banner_url,avatar_url,country,languages,role,created_at,email_verified')
    .eq('id', user.userId).maybeSingle();
  if (error) return NextResponse.json({ error: 'profile_load_failed' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ profile: data }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (parsed.data.display_name !== undefined) update.display_name = parsed.data.display_name;
  if (parsed.data.bio !== undefined) update.bio = parsed.data.bio;
  if (parsed.data.banner_url !== undefined) update.banner_url = normalizeUrl(parsed.data.banner_url);
  if (parsed.data.avatar_url !== undefined) update.avatar_url = normalizeUrl(parsed.data.avatar_url);
  if (parsed.data.country !== undefined) update.country = parsed.data.country || null;
  if (parsed.data.languages !== undefined) update.languages = Array.from(new Set(parsed.data.languages));
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'empty_update' }, { status: 400 });

  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').from('profiles')
    .update(update).eq('id', user.userId)
    .select('display_name,bio,banner_url,avatar_url,country,languages,role,created_at,email_verified')
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'profile_update_failed' }, { status: 500 });
  return NextResponse.json({ profile: data });
}
