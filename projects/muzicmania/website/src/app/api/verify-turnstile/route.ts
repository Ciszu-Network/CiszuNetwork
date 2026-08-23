import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter, parseJsonBody, firstZodMessage, turnstileTokenSchema } from '@ciszunetwork/utils';

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiados intentos. Espera un minuto.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }
  try {
    const parsed = await parseJsonBody(request, turnstileTokenSchema);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: firstZodMessage(parsed.error) },
        { status: 400 }
      );
    }
    const { token } = parsed.data;

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 });
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });

    const data = await res.json();

    if (data.success) {
      return NextResponse.json({ success: true });
    }
    // Devolver los error-codes reales de Cloudflare para diagnóstico (p.ej.
    // invalid-input-secret = secret no corresponde a la sitekey; timeout-or-
    // duplicate = token ya usado). El widget puede resolver bien y aun asi
    // fallar aqui si la env de Vercel quedo con un secret viejo tras rotar.
    const codes = Array.isArray(data['error-codes']) ? data['error-codes'].join(', ') : 'unknown';
    return NextResponse.json({ success: false, error: `Verification failed (${codes})` }, { status: 403 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
