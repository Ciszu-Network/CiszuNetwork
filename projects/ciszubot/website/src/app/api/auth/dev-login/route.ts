import { NextRequest, NextResponse } from 'next/server';
import { LOCAL_DEV_AUTH, LOCAL_DEV_GUILD_ID, LOCAL_DEV_USER_ID, LOCAL_DEV_USER_NAME, setSession } from '@/lib/auth';
import { db, ciszubotSchema } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Solo desarrollo local: crea una sesión de dashboard sin Discord OAuth.
 * Nunca existe en producción (LOCAL_DEV_AUTH exige NODE_ENV !== 'production').
 */
export async function GET(req: NextRequest) {
  if (!LOCAL_DEV_AUTH) {
    return NextResponse.json({ error: 'not_found', guild_id: LOCAL_DEV_GUILD_ID }, { status: 404 });
  }

  const discordUsers = ciszubotSchema.discordUsers;
  await db
    .insert(discordUsers)
    .values({
      id: LOCAL_DEV_USER_ID,
      username: 'localdev',
      displayName: LOCAL_DEV_USER_NAME,
      avatarUrl: null,
      email: null,
      accessToken: 'local-dev',
      refreshToken: null,
      tokenExpires: null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: discordUsers.id,
      set: {
        username: 'localdev',
        displayName: LOCAL_DEV_USER_NAME,
        updatedAt: new Date(),
      },
    });

  await setSession(LOCAL_DEV_USER_ID, { name: LOCAL_DEV_USER_NAME, avatar: null });
  return NextResponse.redirect(new URL(`/dashboard/${LOCAL_DEV_GUILD_ID}`, req.url));
}
