import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionUserId, getGuildsForUser, isGuildAdmin, getBotGuildIds } from '@/lib/auth';
import { db, ciszubotSchema, eq } from '@/lib/db';
import { fetchGuildInfo } from '@/lib/discordGuild';
import DashboardGuildClient from './client';

export const metadata: Metadata = {
  title: 'CiszuBot | DASHBOARD',
  description: 'Configura CiszuBot en tu servidor de Discord.',
};

export const dynamic = 'force-dynamic';

export default async function DashboardGuildPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const userId = await getSessionUserId();
  if (!userId) redirect('/?auth=login');

  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) {
    redirect('/dashboard?error=forbidden');
  }

  const discordUsers = ciszubotSchema.discordUsers;
  const [meRows, guildInfo, botGuildIds] = await Promise.all([
    db
      .select({ username: discordUsers.username })
      .from(discordUsers)
      .where(eq(discordUsers.id, userId))
      .limit(1),
    fetchGuildInfo(guildId),
    getBotGuildIds(),
  ]);

  // null = no se pudo verificar; la UI distingue "sin verificar" de "fuera".
  const hasBotGuild = botGuildIds === null ? null : botGuildIds.has(guildId);

  return (
    <div className="bg-bg min-h-screen">
      <DashboardGuildClient
        guildId={guildId}
        guildName={guild.name}
        guildIcon={guild.icon ?? null}
        username={meRows[0]?.username ?? null}
        guildInfo={guildInfo}
        hasBotGuild={hasBotGuild}
      />
    </div>
  );
}
