import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter, parseJsonBody, firstZodMessage, turnstileTokenSchema, verifyTurnstileToken } from '@ciszunetwork/utils';

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

    const result = await verifyTurnstileToken(token, secretKey, 5000);

    if (result.success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 403 }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
