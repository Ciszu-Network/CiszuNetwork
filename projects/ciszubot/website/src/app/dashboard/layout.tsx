import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionUserId, getGuildsForUser, isGuildAdmin, getBotGuildIds } from '@/lib/auth';
import { INVITE_URL } from '@/lib/i18n';
import DashboardShell from '@/components/dashboard/DashboardShell';
import BotOfflineModal from '@/components/status/BotOfflineModal';

export const dynamic = 'force-dynamic';

/**
 * Layout del dashboard: exige sesión de Discord y monta el shell con el
 * sidebar de selección de servidor (solo servidores donde el usuario es admin).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) redirect('/?auth=login');

  const guilds = await getGuildsForUser(userId);
  const botGuildIds = await getBotGuildIds();
  const adminGuilds = guilds
    .filter((g) => isGuildAdmin(g))
    .map((g) => ({ id: g.id, name: g.name, icon: g.icon ?? null, invited: botGuildIds.has(g.id) }));

  const store = await cookies();
  const lang: 'es' | 'en' = (store.get('ciszubot_lang')?.value ?? '')
    .toLowerCase()
    .startsWith('en')
    ? 'en'
    : 'es';

  return (
    <DashboardShell guilds={adminGuilds} lang={lang} inviteUrl={INVITE_URL}>
      <BotOfflineModal />
      {children}
    </DashboardShell>
  );
}
