import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Icon } from '@ciszu/ui';
import { getSessionUserId, getGuildsForUser, getBotGuildIds, isGuildAdmin, supabaseAdmin, type DiscordGuild } from '@/lib/auth';
import { INVITE_URL } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/?auth=login');
  }

  const db = supabaseAdmin();
  const { data: me } = await db.from('discord_users').select('username, display_name, avatar_url').eq('id', userId).maybeSingle();

  const [guilds, botGuilds] = await Promise.all([getGuildsForUser(userId), getBotGuildIds()]);

  const manageable = guilds.filter((g) => isGuildAdmin(g));
  const icon = (guild: DiscordGuild) =>
    guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : null;

  return (
    <div className="bg-bg min-h-screen pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-10">
        {/* Header de cuenta */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#5865F2]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={me?.avatar_url ?? `https://cdn.discordapp.com/embed/avatars/${Number(userId) % 5}.png`}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-white">
              {me?.display_name ?? me?.username ?? 'Cuenta'}
            </h1>
            <p className="text-sm text-white/60">Elige un servidor para configurar a CiszuBot</p>
          </div>
          <Link
            href="/api/auth/logout"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-[#ff33cc]/60 hover:text-white"
          >
            Cerrar sesión
          </Link>
        </div>

        {/* Lista de servidores */}
        <h2 className="mt-10 mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Icon name="server" size={20} className="text-neon-blue" />
          Tus servidores
        </h2>

        {manageable.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/80">
              No tienes servidores administrables. {guilds.length === 0 ? 'Necesitas iniciar sesión con Discord en un servidor.' : ''}
            </p>
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-2.5 font-bold text-white transition hover:scale-105"
            >
              Invitar a CiszuBot a un servidor
            </a>
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
                        ? 'border-white/15 bg-white/5 hover:border-neon-blue/70 hover:bg-white/10'
                        : 'pointer-events-none border-white/10 bg-white/[0.03] opacity-60'
                    }`}
                  >
                    {hasBot ? (
                      <Link href={`/dashboard/${guild.id}`} className="absolute inset-0 z-10" aria-label={guild.name} />
                    ) : null}
                    <div className="flex items-center gap-3">
                      {iconUrl ? (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={iconUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple font-bold text-white">
                          {guild.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">{guild.name}</p>
                        {hasBot ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Bot activo
                          </span>
                        ) : (
                          <span className="text-xs text-white/50">Bot no presente</span>
                        )}
                      </div>
                      {hasBot && (
                        <Icon
                          name="arrow-right"
                          size={18}
                          className="ml-auto text-white/40 transition group-hover:translate-x-1 group-hover:text-neon-blue"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
