import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, fetchDiscordUser, setSession, supabaseAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
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
