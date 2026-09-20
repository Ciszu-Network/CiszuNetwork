import { NextRequest, NextResponse } from 'next/server';
import {
  allowedHostnamesFromSiteUrl,
  createRecaptchaHandler,
  type RecaptchaPayload,
} from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Verificación de reCAPTCHA v2 + v3 (implementación única en @ciszunetwork/utils).
 * Acepta el formato nuevo `{ v2Token, v3Token }` y el legado `{ token, version }`.
 */
const handler = createRecaptchaHandler({
  v2Secret:
    process.env.RECAPTCHA_SECRET_KEY_V2_CISZUKOANTONY ??
    process.env.RECAPTCHA_SECRET_KEY_V2 ??
    '',
  v3Secret:
    process.env.RECAPTCHA_SECRET_KEY_V3_CISZUKOANTONY ??
    process.env.RECAPTCHA_SECRET_KEY_V3 ??
    '',
  minScore: 0.5,
  windowMs: 60_000,
  max: 30,
  allowedHostnames: allowedHostnamesFromSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ciszukoantony.vercel.app',
    (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? '')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean),
  ),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const payload = (await request.json().catch(() => ({}))) as RecaptchaPayload;
  const { status, body, headers } = await handler(payload, ip);
  return NextResponse.json(body, { status, headers });
}
