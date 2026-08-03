import { NextResponse } from 'next/server';
import { oauthUrl } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const state = Buffer.from(Math.random().toString(36).slice(2) + Date.now().toString(36)).toString('base64url');
  return NextResponse.redirect(oauthUrl(state));
}
