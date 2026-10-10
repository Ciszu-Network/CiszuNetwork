import { NextResponse } from 'next/server';
import { getSessionUserId, getGuildsForUser, isGuildAdmin } from '@/lib/auth';
import { fetchGuildInfo } from '@/lib/discordGuild';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;

  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const info = await fetchGuildInfo(guildId);
  if (!info) return NextResponse.json({ error: 'unavailable' }, { status: 502 });

  return NextResponse.json(info);
}
