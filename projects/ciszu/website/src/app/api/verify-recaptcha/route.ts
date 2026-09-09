import { NextRequest, NextResponse } from 'next/server';

const limiter = new Map<string, { count: number; resetAt: number }>();

function createRateLimiter(windowMs: number, max: number) {
  return {
    allow(ip: string) {
      const now = Date.now();
      const entry = limiter.get(ip);
      if (!entry || now > entry.resetAt) {
        limiter.set(ip, { count: 1, resetAt: now + windowMs });
        return { allowed: true, resetInMs: windowMs };
      }
      if (entry.count >= max) {
        return { allowed: false, resetInMs: entry.resetAt - now };
      }
      entry.count += 1;
      return { allowed: true, resetInMs: entry.resetAt - now };
    },
  };
}

const rateLimiter = createRateLimiter(60_000, 30);

const SITE_KEYS: Record<string, string> = {
  '6LevELAtAAAAAKhSQwTFpXrpIMeRtcDjmIFbC9op': process.env.RECAPTCHA_SECRET_KEY_V2_CISZU || process.env.RECAPTCHA_SECRET_KEY_V3_CISZU || '',
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = rateLimiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiados intentos. Espera un minuto.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === 'string' ? body.token : '';
    const siteKey = typeof body.siteKey === 'string' ? body.siteKey : '';
    const version = typeof body.version === 'string' ? body.version : 'v2';

    if (!token || !siteKey) {
      return NextResponse.json({ success: false, error: 'token y siteKey requeridos' }, { status: 400 });
    }

    const secretKey = SITE_KEYS[siteKey];
    if (!secretKey) {
      return NextResponse.json({ success: false, error: 'siteKey no autorizada' }, { status: 403 });
    }

    const verifyUrl = new URL('https://www.google.com/recaptcha/api/siteverify');
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const res = await fetch(verifyUrl.toString(), {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      if (version === 'v3') {
        const score = typeof data.score === 'number' ? data.score : 0;
        if (score < 0.5) {
          return NextResponse.json({ success: false, error: `Score bajo (${score})` }, { status: 403 });
        }
      }
      return NextResponse.json({ success: true });
    }

    const codes = Array.isArray(data['error-codes']) ? data['error-codes'].join(', ') : 'unknown';
    return NextResponse.json({ success: false, error: `Verification failed (${codes})` }, { status: 403 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
