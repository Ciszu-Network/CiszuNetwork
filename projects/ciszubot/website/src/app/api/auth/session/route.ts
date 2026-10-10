import { NextResponse } from 'next/server';
import { getSessionData } from '@/lib/auth';
import { db, ciszubotSchema, eq } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Expone la sesión de Discord (cookie HMAC httpOnly) para el cliente.
 * No revela secretos: solo devuelve id/nombre/avatar. Lo usa el AuthProvider
 * para sincronizar la sesión Discord con el store global del navbar.
 */
export async function GET() {
  const session = await getSessionData();
  let discordUsername: string | null = null;
  if (session) {
    const rows = await db
      .select({ username: ciszubotSchema.discordUsers.username })
      .from(ciszubotSchema.discordUsers)
      .where(eq(ciszubotSchema.discordUsers.id, session.id))
      .limit(1);
    discordUsername = rows[0]?.username ?? null;
  }
  return NextResponse.json(
    {
      session: session
        ? { id: session.id, name: session.name, avatar: session.avatar, username: discordUsername, provider: 'discord' as const }
        : null,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}