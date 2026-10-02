import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import {
  allowedHostnamesFromSiteUrl,
  createRecaptchaHandler,
  type RecaptchaPayload,
} from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Verificación de reCAPTCHA Enterprise (implementación única en @ciszunetwork/utils).
 * Valida el token vía assessments (API key por proyecto, sin secretos).
 */
const handler = createRecaptchaHandler({
  siteKey: process.env.RECAPTCHA_ENTERPRISE_SITE_KEY_CISZU ?? '',
  apiKey: process.env.RECAPTCHA_ENTERPRISE_API_KEY_CISZU ?? '',
  projectId: process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID_CISZU ?? 'ciszunetwork',
  minScore: 0.5,
  windowMs: 60_000,
  max: 30,
  allowedHostnames: allowedHostnamesFromSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ciszunetwork.vercel.app',
    (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? '')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean),
  ),
});

export async function POST(request: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const payload = (await request.json().catch(() => ({}))) as RecaptchaPayload;
  const { status, body, headers } = await handler(payload, ip);
  return NextResponse.json(body, { status, headers });
}
