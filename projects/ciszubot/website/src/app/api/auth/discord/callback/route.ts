import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, fetchDiscordUser, setSession, supabaseAdmin } from '@/lib/auth';
import { createRateLimiter } from '@ciszunetwork/utils';

export const runtime = 'nodejs';

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.redirect(new URL('/?auth=rate_limited', req.url));
  }
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/?auth=error', req.url));
  }

  const tokens = await exchangeCode(code);
  if (!tokens) {
    return NextResponse.redirect(new URL('/?auth=error', req.url));
  }

  const user = await fetchDiscordUser(tokens.access_token);
  if (!user) {
    return NextResponse.redirect(new URL('/?auth=error', req.url));
  }

  const db = supabaseAdmin();
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null;
  await db.from('discord_users').upsert({
    id: user.id,
    username: user.username,
    display_name: user.global_name ?? null,
    avatar_url: avatarUrl,
    email: user.email ?? null,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });

  await setSession(user.id, { name: user.global_name ?? user.username, avatar: avatarUrl });
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
