import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Icon } from '@ciszu/ui';
import { getSessionUserId, getGuildsForUser, getBotGuildIds, isGuildAdmin, DISCORD_CLIENT_ID, type DiscordGuild } from '@/lib/auth';
import { db, ciszubotSchema, eq } from '@/lib/db';
import { BOT_PREFIX, DISCORD_SERVER, INVITE_URL, getDict, parseLang } from '@/lib/i18n';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';
import { DualLoginCard } from '@/components/dashboard/DualLoginCard';
import InviteLink from '@/components/dashboard/InviteLink';
import ServersGrid from '@/components/dashboard/ServersGrid';
import { BOT_STATUS_SELECT, resolveBotStatus, type BotStatus } from '@/lib/botStatus';

export const metadata: Metadata = {
  title: 'CiszuBot | DASHBOARD',
  description: 'Panel de control de CiszuBot: configura el bot en tus servidores de Discord.',
};

export const dynamic = 'force-dynamic';

const USER_INSTALL_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=applications.commands&integration_type=1`;

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** Lee el estado real del bot (público) con revalidación de 60s. */
async function getBotStatusRow(): Promise<BotStatus | null> {
  if (!SB_KEY) return null;
  try {
    const res = await fetch(`${SB_URL}/rest/v1/bot_status?select=${BOT_STATUS_SELECT}&id=eq.1`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Accept-Profile': 'ciszubot' },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as BotStatus[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/?auth=login');
  }

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
  const me = meRows[0];

  const [guilds, botGuilds] = await Promise.all([getGuildsForUser(userId), getBotGuildIds()]);
  const botRow = await getBotStatusRow();
  const bot = resolveBotStatus(botRow, Date.now());
  const botReason = t.botStatus.reasons[bot.reason ?? 'unknown'];

  const manageable = guilds.filter((g) => isGuildAdmin(g));
  // null = no se pudo verificar (nunca marcar como activo por un fallo de red).
  const botPresence = (id: string): boolean | null => (botGuilds === null ? null : botGuilds.has(id));
  const activeCount = manageable.filter((g) => botPresence(g.id) === true).length;
  const icon = (guild: DiscordGuild) =>
    guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : null;

  return (
    <div className="relative min-h-screen pt-4 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <PageReveal>
          {/* Cabecera de cuenta: estado de sesión + datos del usuario */}
          <div className={`flex flex-wrap items-center gap-5 rounded-3xl border p-6 ${THEME.border} ${THEME.card}`}>
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#5865F2]">
              <img
                src={me?.avatarUrl ?? `https://cdn.discordapp.com/embed/avatars/${Number(userId) % 5}.png`}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>
                {t.dashboardPage.kicker}
              </p>
              <h1 className="truncate text-2xl font-header font-black text-ink">
                {me?.displayName ?? me?.username ?? 'CiszuBot'}
              </h1>
              <p className="text-sm text-muted">{t.dashboardPage.subtitle}</p>
              <DualLoginCard discordUsername={me?.username ?? null} />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  <Icon name="verified" size={11} />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  {t.dashboardPage.sessionActive}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                  <Icon name="discord" size={12} className="[&>g]:fill-current" />
                  {t.dashboardPage.providerDiscord}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[240px]">
              <dl className="rounded-2xl border border-border bg-bg px-4 py-3 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <dt className="inline-flex items-center gap-1.5 font-bold uppercase tracking-widest text-muted">
                    <Icon name="person" size={11} />
                    {t.dashboardPage.accountId}
                  </dt>
                  <dd className="truncate font-mono text-ink/80">{userId}</dd>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <dt className="inline-flex items-center gap-1.5 font-bold uppercase tracking-widest text-muted">
                    <Icon name="discord" size={11} className="[&>g]:fill-current" />
                    {t.dashboardPage.providerLabel}
                  </dt>
                  <dd className="text-ink/80">{t.dashboardPage.providerDiscord}</dd>
                </div>
              </dl>
              <a
                href="/api/auth/logout"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted transition hover:border-neon-pink/60 hover:text-ink"
              >
                <Icon name="logout" size={15} />
                {t.dashboardPage.logout}
              </a>
            </div>
          </div>
        </PageReveal>

        {/* Aviso beta trial */}
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-neon-pink/30 bg-neon-pink/5 px-5 py-3">
          <span className="rounded-full border border-neon-pink/50 bg-neon-pink/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neon-pink">
            {t.dashboardPage.betaBadge}
          </span>
          <p className="min-w-0 flex-1 text-xs text-ink/70">{t.dashboardPage.betaNote}</p>
        </div>

        {/* Lista de servidores */}
        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-header font-black text-ink">
                <Icon name="server" size={20} className={THEME.accent} />
                {t.dashboardPage.serversTitle}
              </h2>
              <p className="text-sm text-muted">{t.dashboardPage.serversSubtitle}</p>
            </div>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted">
              {activeCount} / {manageable.length}
            </span>
          </div>

          {manageable.length === 0 ? (
            <div className={`rounded-3xl border p-8 text-center ${THEME.border} ${THEME.card}`}>
              <p className="font-bold text-ink">{t.dashboardPage.noServers}</p>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
                {t.dashboardPage.noServersHint}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <InviteLink
                  href={INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105 active:scale-95"
                >
                  <Icon name="discord" size={16} className="[&>g]:fill-current" />
                  {t.dashboardPage.inviteCta}
                </InviteLink>
                <a
                  href={DISCORD_SERVER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-muted transition hover:border-neon-blue/60 hover:text-ink"
                >
                  <Icon name="life-ring" size={16} />
                  {t.dashboardPage.supportCta}
                </a>
              </div>
            </div>
          ) : (
            <ServersGrid
              guilds={manageable.map((g) => ({
                id: g.id,
                name: g.name,
                icon: g.icon ?? null,
                invited: botPresence(g.id),
              }))}
              inviteUrl={INVITE_URL}
            />
          )}
        </section>

      </div>
    </div>
  );
}
