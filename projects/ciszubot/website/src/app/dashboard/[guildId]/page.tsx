import { redirect } from 'next/navigation';
import { getSessionUserId, getGuildsForUser, isGuildAdmin } from '@/lib/auth';
import DashboardGuildClient from './client';

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

  return <DashboardGuildClient guildId={guildId} guildName={guild.name} guildIcon={guild.icon ?? null} />;
}
