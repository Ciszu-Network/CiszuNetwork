import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionUserId, getGuildsForUser, isGuildAdmin } from '@/lib/auth';
import DashboardGuildClient from './client';
import QuickDocks from '@/components/molecules/QuickDocks';

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

  return (
    <div className="bg-bg min-h-screen">
      <QuickDocks />
      <DashboardGuildClient guildId={guildId} guildName={guild.name} guildIcon={guild.icon ?? null} />
    </div>
  );
}
