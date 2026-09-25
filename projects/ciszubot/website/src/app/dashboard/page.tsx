import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Icon } from '@ciszu/ui';
import { getSessionUserId, getGuildsForUser, getBotGuildIds, isGuildAdmin, type DiscordGuild } from '@/lib/auth';
import { db, ciszubotSchema, eq } from '@/lib/db';
import { BOT_PREFIX, DISCORD_SERVER, INVITE_URL, getDict, parseLang, type Dict } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

export const metadata: Metadata = {
  title: 'CiszuBot | DASHBOARD',
  description: 'Panel de control de CiszuBot: configura el bot en tus servidores de Discord.',
};

export const dynamic = 'force-dynamic';

type LinkKey = keyof Dict['dashboardPage']['links'];

const USEFUL_LINKS: { key: LinkKey; href: string; icon: string }[] = [
  { key: 'commands', href: '/commands', icon: 'gamepad' },
  { key: 'stats', href: '/stats', icon: 'chart-bar' },
  { key: 'support', href: '/support', icon: 'life-ring' },
  { key: 'documentation', href: '/documentation', icon: 'file-text' },
  { key: 'invite', href: '/invite', icon: 'discord' },
  { key: 'explore', href: '/explore', icon: 'globe' },
  { key: 'download', href: '/downloads', icon: 'download' },
];

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

  const manageable = guilds.filter((g) => isGuildAdmin(g));
  const activeCount = manageable.filter((g) => botGuilds.has(g.id)).length;
  const icon = (guild: DiscordGuild) =>
    guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : null;

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
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
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
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
                  <dt className="font-bold uppercase tracking-widest text-muted">
                    {t.dashboardPage.accountId}
                  </dt>
                  <dd className="truncate font-mono text-ink/80">{userId}</dd>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <dt className="font-bold uppercase tracking-widest text-muted">
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

        {/* Enlaces útiles */}
        <section className="mt-12">
          <h2 className={`mb-5 text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>
            {t.dashboardPage.linksTitle}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {USEFUL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 hover:-translate-y-0.5 ${THEME.border} ${THEME.card}`}
              >
                <span className={THEME.accent}>
                  <Icon name={link.icon} size={20} />
                </span>
                <span className="text-xs font-bold text-ink/80">
                  {t.dashboardPage.links[link.key]}
                </span>
              </Link>
            ))}
          </div>
        </section>

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
                <a
                  href={INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105 active:scale-95"
                >
                  <Icon name="discord" size={16} className="[&>g]:fill-current" />
                  {t.dashboardPage.inviteCta}
                </a>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {manageable.map((guild) => {
                const hasBot = botGuilds.has(guild.id);
                const iconUrl = icon(guild);
                return (
                  <div
                    key={guild.id}
                    className={`group relative overflow-hidden rounded-2xl border p-5 transition ${
                      hasBot
                        ? `${THEME.border} ${THEME.card} hover:border-neon-blue/70`
                        : 'pointer-events-none border-border bg-card opacity-60'
                    }`}
                  >
                    {hasBot ? (
                      <Link
                        href={`/dashboard/${guild.id}`}
                        className="absolute inset-0 z-10"
                        aria-label={guild.name}
                      />
                    ) : null}
                    <div className="flex items-center gap-3">
                      {iconUrl ? (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                          <img src={iconUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple font-bold text-white">
                          {guild.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">{guild.name}</p>
                        {hasBot ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{' '}
                            {t.dashboardPage.botActive}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">{t.dashboardPage.botMissing}</span>
                        )}
                      </div>
                      {hasBot && (
                        <Icon
                          name="arrow-right"
                          size={18}
                          className="ml-auto text-muted transition group-hover:translate-x-1 group-hover:text-neon-blue"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA final */}
        <div
          className={`mt-14 flex flex-wrap items-center justify-between gap-6 rounded-3xl border p-8 ${THEME.border} ${THEME.card}`}
        >
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>
              {BOT_PREFIX} · {t.nav.dashboard}
            </p>
            <h2 className="mt-1 font-header text-xl font-black text-ink">
              {t.dashboardPage.inviteCta}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">{t.dashboardPage.serversSubtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105 active:scale-95"
            >
              <Icon name="discord" size={16} className="[&>g]:fill-current" />
              {t.dashboardPage.inviteCta}
            </a>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-muted transition hover:border-neon-blue/60 hover:text-ink"
            >
              <Icon name="globe" size={16} />
              {t.nav.explore}
            </Link>
          </div>
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
