import { NextResponse } from 'next/server';
import { oauthUrl } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const state = Buffer.from(Math.random().toString(36).slice(2) + Date.now().toString(36)).toString('base64url');
  const res = NextResponse.redirect(oauthUrl(state));
  res.cookies.set('ciszubot_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}
