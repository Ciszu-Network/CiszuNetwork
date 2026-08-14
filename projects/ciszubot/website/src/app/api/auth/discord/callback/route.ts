import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, fetchDiscordUser, setSession } from '@/lib/auth';
import { db, ciszubotSchema } from '@/lib/db';
import { logAudit } from '@/lib/audit';
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
    await logAudit({ event: 'login_failed', ip, detail: { reason: error ?? 'missing_code' } });
    return NextResponse.redirect(new URL('/?auth=error', req.url));
  }

  const tokens = await exchangeCode(code);
  if (!tokens) {
    await logAudit({ event: 'login_failed', ip, detail: { reason: 'exchange_code_failed' } });
    return NextResponse.redirect(new URL('/?auth=error', req.url));
  }

  const user = await fetchDiscordUser(tokens.access_token);
  if (!user) {
    await logAudit({ event: 'login_failed', ip, detail: { reason: 'fetch_user_failed' } });
    return NextResponse.redirect(new URL('/?auth=error', req.url));
  }

  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null;
  const discordUsers = ciszubotSchema.discordUsers;
  await db
    .insert(discordUsers)
    .values({
      id: user.id,
      username: user.username,
      displayName: user.global_name ?? null,
      avatarUrl,
      email: user.email ?? null,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpires: new Date(Date.now() + tokens.expires_in * 1000),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: discordUsers.id,
      set: {
        username: user.username,
        displayName: user.global_name ?? null,
        avatarUrl,
        email: user.email ?? null,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpires: new Date(Date.now() + tokens.expires_in * 1000),
        updatedAt: new Date(),
      },
    });

  await setSession(user.id, { name: user.global_name ?? user.username, avatar: avatarUrl });
  await logAudit({
    event: 'login',
    actorId: user.id,
    actorName: user.global_name ?? user.username,
    ip,
  });
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
