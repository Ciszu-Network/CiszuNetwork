import { NextRequest, NextResponse } from 'next/server';
import {
  allowedHostnamesFromSiteUrl,
  createRecaptchaHandler,
  type RecaptchaPayload,
} from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Verificación de reCAPTCHA (implementación única en @ciszunetwork/utils).
 * Modo clásico: checkbox v2 visible + score v3 invisible (el badge/checkbox
 * se ve en el formulario, a diferencia del modo Enterprise invisible).
 */
const handler = createRecaptchaHandler({
  v2Secret: process.env.RECAPTCHA_SECRET_KEY_V2_CISZUBOT ?? '',
  v3Secret: process.env.RECAPTCHA_SECRET_KEY_V3_CISZUBOT ?? '',
  minScore: 0.5,
  windowMs: 60_000,
  max: 30,
  allowedHostnames: allowedHostnamesFromSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ciszubot.vercel.app',
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
