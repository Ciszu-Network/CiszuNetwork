import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { oauthUrl } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const state = randomBytes(32).toString('base64url');
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
