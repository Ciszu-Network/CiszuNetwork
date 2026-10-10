import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionUserId, getGuildsForUser, isGuildAdmin, getBotGuildIds } from '@/lib/auth';
import { db, ciszubotSchema, eq } from '@/lib/db';
import { INVITE_URL } from '@/lib/i18n';
import DashboardShell from '@/components/dashboard/DashboardShell';
import BotOfflineModal from '@/components/status/BotOfflineModal';
import InviteThanksModal from '@/components/dashboard/InviteThanksModal';
import PreQuickDocks from '@/components/dashboard/PreQuickDocks';

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
    .map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon ?? null,
      invited: botGuildIds === null ? null : botGuildIds.has(g.id),
    }));

  const discordUsers = ciszubotSchema.discordUsers;
  const meRows = await db
    .select({
      username: discordUsers.username,
      displayName: discordUsers.displayName,
      avatarUrl: discordUsers.avatarUrl,
    })
    .from(discordUsers)
    .where(eq(discordUsers.id, userId))
    .limit(1);
  const me = meRows[0]
    ? { username: meRows[0].username ?? null, displayName: meRows[0].displayName ?? null, avatarUrl: meRows[0].avatarUrl ?? null }
    : null;

  const store = await cookies();
  const lang: 'es' | 'en' = (store.get('ciszubot_lang')?.value ?? '')
    .toLowerCase()
    .startsWith('en')
    ? 'en'
    : 'es';

  return (
    <DashboardShell guilds={adminGuilds} lang={lang} inviteUrl={INVITE_URL} me={me} footer={<PreQuickDocks />}>
      <BotOfflineModal />
      <InviteThanksModal />
      {children}
    </DashboardShell>
  );
}
