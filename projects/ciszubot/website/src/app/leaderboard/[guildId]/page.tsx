import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { db, ciszubotSchema, eq, desc, or, sql } from '@ciszunetwork/db';
import { getBotGuilds } from '@/lib/auth';
import { fetchGuildInfo } from '@/lib/discordGuild';
import { Icon } from '@ciszu/ui';
import { getDict, parseLang } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';

export const metadata: Metadata = {
  title: 'CiszuBot | LEADERBOARD',
  description: 'Leaderboard público de niveles de CiszuBot por servidor.',
};

export const dynamic = 'force-dynamic';

const XP_PER_LEVEL = 100;
const LEVEL_MULT = 5;

function xpForLevel(level: number): number {
  return XP_PER_LEVEL * level * LEVEL_MULT;
}

/** Misma fórmula que el bot (services/levels.ts): nivel y progreso por XP. */
function levelFromXp(xp: number): { level: number; current: number; needed: number; progress: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, current: remaining, needed: xpForLevel(level), progress: remaining / xpForLevel(level) };
}

const RANK_STYLES = [
  'border-amber-400/60 bg-amber-400/10 text-amber-300',
  'border-slate-300/60 bg-slate-300/10 text-slate-200',
  'border-orange-400/60 bg-orange-400/10 text-orange-300',
];

/**
 * Leaderboard público de NIVELES por servidor (`/leaderboard/<id-o-slug>`).
 * Se activa desde el dashboard (Funciones/Niveles). La URL personalizada es
 * una sub-opción Premium (gratis durante la beta). Solo usuarios de Discord
 * con XP registrado por el bot.
 */
export default async function ServerLeaderboardPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId: raw } = await params;
  const key = decodeURIComponent(raw);

  const configs = ciszubotSchema.guildConfigs;
  const cfgRows = await db
    .select({ guildId: configs.guildId, enabled: configs.leaderboardEnabled, slug: configs.leaderboardSlug })
    .from(configs)
    .where(or(eq(configs.guildId, key), sql`lower(${configs.leaderboardSlug}) = ${key.toLowerCase()}`))
    .limit(1);
  const cfg = cfgRows[0];

  const store = await cookies();
  const dict = getDict(parseLang(store.get('ciszubot_lang')?.value));
  const t = dict.serverLeaderboard;

  // Leaderboard desactivado (o servidor sin configurar): pantalla de privado.
  if (!cfg || !cfg.enabled) {
    return (
      <div className="relative min-h-screen pt-24 pb-20 px-4">
        <div className="mx-auto max-w-xl pt-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10">
            <Icon name="lock" size={22} className="text-amber-400" />
          </div>
          <h1 className="font-header text-2xl font-black text-white">{t.privateTitle}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">{t.privateBody}</p>
          <a
            href="https://ciszubot.vercel.app"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
          >
            <Icon name="globe" size={15} />
            {t.privateCta}
          </a>
        </div>
      </div>
    );
  }

  const levels = ciszubotSchema.levels;
  const users = ciszubotSchema.discordUsers;
  const rows = await db
    .select({
      userId: levels.userId,
      xp: levels.xp,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(levels)
    .leftJoin(users, eq(users.id, levels.userId))
    .where(eq(levels.guildId, cfg.guildId))
    .orderBy(desc(levels.xp))
    .limit(100);

  const botGuilds = await getBotGuilds();
  const botGuild = botGuilds?.find((g) => g.id === cfg.guildId);
  const guildName = botGuild?.name ?? cfg.guildId;
  const guildIcon = botGuild?.icon ?? null;
  const info = await fetchGuildInfo(cfg.guildId).catch(() => null);
  const memberCount = info?.memberCount ?? null;

  const entries = rows.map((r) => {
    const xp = Number(r.xp ?? 0);
    const lv = levelFromXp(xp);
    return {
      userId: r.userId,
      name: r.displayName ?? r.username ?? r.userId,
      avatar: r.avatarUrl ?? `https://cdn.discordapp.com/embed/avatars/${Number(r.userId) % 5}.png`,
      xp,
      ...lv,
    };
  });

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <div className="mx-auto max-w-screen-xl">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-neon-blue">{t.kicker}</p>
            <div className="mt-4 flex flex-col items-center gap-3">
              {guildIcon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${cfg.guildId}/${guildIcon}.png`}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-2xl border border-white/15"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple text-2xl font-black text-white">
                  {guildName.charAt(0).toUpperCase()}
                </span>
              )}
              <h1 className="font-header text-3xl font-black text-white md:text-4xl">{guildName}</h1>
              <p className="font-mono text-[11px] text-white/40">{cfg.guildId}</p>
              {memberCount !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/60">
                  <Icon name="users" size={11} /> {memberCount} {t.members}
                </span>
              )}
            </div>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/60">{t.subtitle}</p>
            <span className="mt-4 inline-block rounded-full border border-neon-purple/50 bg-neon-purple/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-neon-purple">
              {t.badge}
            </span>
          </div>

          {entries.length === 0 ? (
            <p className="mt-12 rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center text-sm text-white/50">
              {t.empty}
            </p>
          ) : (
            <ol className="mt-10 space-y-3">
              {entries.map((e, i) => (
                <li
                  key={e.userId}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${
                      i < 3 ? RANK_STYLES[i] : 'border-white/10 bg-black/20 text-white/50'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <img src={e.avatar} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full border border-white/15" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{e.name}</p>
                    <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink"
                        style={{ width: `${Math.round(e.progress * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-header text-lg font-black text-neon-blue">
                      {t.level} {e.level}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {e.xp.toLocaleString()} {t.xp}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-widest text-white/30">
            {t.poweredBy}
          </p>
        </div>
      </div>
      <QuickDocks />
    </div>
  );
}
