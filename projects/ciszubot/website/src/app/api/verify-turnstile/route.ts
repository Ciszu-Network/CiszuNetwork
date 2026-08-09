import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 });
    }

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
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 403 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
