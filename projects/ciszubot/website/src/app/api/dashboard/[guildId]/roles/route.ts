import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isGuildAdmin, getGuildsForUser } from '@/lib/auth';
import { fetchGuildInfo } from '@/lib/discordGuild';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Roles reales de un servidor (para los selectores de la zona de roles de
 * /dashboard/bot). Requiere sesión + ser admin del servidor.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'no_auth' }, { status: 401 });

  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const info = await fetchGuildInfo(guildId);
  return NextResponse.json(
    { roles: (info?.roles ?? []).map((r) => ({ id: r.id, name: r.name })) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
