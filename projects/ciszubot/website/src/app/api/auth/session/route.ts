import { NextResponse } from 'next/server';
import { getSessionData } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Expone la sesión de Discord (cookie HMAC httpOnly) para el cliente.
 * No revela secretos: solo devuelve id/nombre/avatar. Lo usa el AuthProvider
 * para sincronizar la sesión Discord con el store global del navbar.
 */
export async function GET() {
  const session = await getSessionData();
  return NextResponse.json(
    {
      session: session
        ? { id: session.id, name: session.name, avatar: session.avatar, provider: 'discord' as const }
        : null,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}