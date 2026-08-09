import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@ciszunetwork/utils';

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
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAADm0pp4dA0fWiMl2HZkvRNDTKDw';

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });

    const data = await res.json();

    if (data.success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 403 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
