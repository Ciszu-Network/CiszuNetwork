import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Icon } from '@ciszu/ui';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { COMMANDS, CATEGORIES, CATEGORY_ICONS } from '@/data/commands';
import {
  GITHUB_REPO,
  INVITE_URL,
  LOGO_ISOTIPO_CIRCLE,
  LOGO_LOGOTIPO,
  BOT_PREFIX,
  getDict,
  type Lang,
} from '@/lib/i18n';

export const revalidate = 60;

interface BotStatus {
  online: boolean;
  last_seen: string | null;
  started_at: string | null;
  version: string | null;
  guilds: number;
  commands_total: number;
  prefix: string;
}

async function getBotStatus(): Promise<BotStatus | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://obwzzmbvkrcscqwptlqo.supabase.co';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    const res = await fetch(
      `${url}/rest/v1/bot_status?select=online,last_seen,started_at,version,guilds,commands_total,prefix&id=eq.1`,
      {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Accept-Profile': 'ciszubot' },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as BotStatus[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

function formatUptime(startedAt: string | null, now: number): string {
  if (!startedAt) return '—';
  const diff = Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${diff}s`;
}

const STAT_ICONS = ['server', 'terminal', 'clock', 'message'] as const;

export default async function Home() {
  const store = await cookies();
  const lang = (store.get('ciszubot_lang')?.value ?? 'es') as Lang;
  const t = getDict(lang);

  const status = await getBotStatus();
  const now = Date.now();
  const lastSeenMs = status?.last_seen ? Date.parse(status.last_seen) : 0;
  const heartbeatFresh = now - lastSeenMs < 3 * 60 * 1000;
  const isOnline = Boolean(status?.online) && heartbeatFresh;

  const stats = [
    { icon: STAT_ICONS[0], label: t.stats.servers, value: status ? String(status.guilds) : '—' },
    { icon: STAT_ICONS[1], label: t.stats.commandsRun, value: status ? status.commands_total.toLocaleString(lang === 'es' ? 'es' : 'en') : '—' },
    { icon: STAT_ICONS[2], label: t.stats.uptime, value: formatUptime(status?.started_at ?? null, now) },
    { icon: STAT_ICONS[3], label: t.stats.commands, value: `${COMMANDS.length}` },
  ];

  return (
    <div className="bg-bg">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-400/15 blur-[110px]" />
        <div className="absolute top-32 -right-24 w-96 h-96 rounded-full bg-violet-400/15 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-brand-300/10 blur-[100px]" />

        <div className="relative max-w-screen-xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full chip mb-8 animate-fade-in-up">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-success animate-pulse shadow-[0_0_10px_var(--success)]' : 'bg-danger'
              }`}
            />
            <span className="text-xs font-semibold tracking-wide uppercase">
              {isOnline ? t.hero.online : t.hero.offline}
              {status?.version ? ` · ${status.version}` : ''}
            </span>
          </div>

          <div className="flex flex-col items-center gap-7 mb-9">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-surface border border-border shadow-[0_10px_40px_-10px_rgba(35,63,146,0.35)] overflow-hidden animate-float">
              <Image
                src={resolveAssetPath(LOGO_ISOTIPO_CIRCLE)}
                alt="CiszuBot isotipo"
                width={144}
                height={144}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="sr-only">CiszuBot</h1>
            <Image
              src={resolveAssetPath(LOGO_LOGOTIPO)}
              alt="CiszuBot logotipo"
              width={420}
              height={80}
              priority
              className="w-[280px] md:w-[420px] h-auto drop-shadow-sm animate-fade-in-up"
            />
          </div>

          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted mb-10">
            {t.hero.tagline}{' '}
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-300 font-semibold hover:underline"
            >
              {t.hero.description.split('.')[0]}.
            </a>{' '}
            <span className="text-muted">{t.hero.description.split('.').slice(1).join('.').trim()}</span>
            {' '}
            <code className="text-brand-600 dark:text-brand-300 bg-card border border-border px-2 py-0.5 rounded">{BOT_PREFIX}</code>
            {' '}
            <code className="text-violet-500 dark:text-violet-300 bg-card border border-border px-2 py-0.5 rounded">/comandos</code>
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-14">
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide btn-discord"
            >
              <Icon name="discord" size={20} className="[&>g]:fill-current" />
              {t.hero.ctaInvite}
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide btn-ghost"
            >
              <Icon name="favorite" size={18} />
              {t.hero.ctaGithub}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="soft-card rounded-2xl p-5 hover-card">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-400/12 text-brand-600 dark:text-brand-300 mb-3">
                  <Icon name={s.icon} style={s.icon === 'server' || s.icon === 'terminal' ? 'filled' : 'outline'} size={20} />
                </span>
                <div className="text-2xl font-bold text-ink">{s.value}</div>
                <div className="text-xs text-faint font-medium uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative py-16 border-t border-border">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink">{t.features.title}</h2>
            <p className="mt-3 text-muted">{t.features.subtitle}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              { icon: 'rocket', style: 'filled' },
              { icon: 'globe', style: 'outline' },
              { icon: 'gamepad', style: 'outline' },
              { icon: 'shield', style: 'filled' },
            ].map((f, i) => (
              <div key={i} className="soft-card rounded-2xl p-6 hover-card">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-violet-400/12 text-violet-500 dark:text-violet-300 mb-4">
                  <Icon name={f.icon} style={f.style as 'outline' | 'filled'} size={22} />
                </span>
                <h3 className="font-semibold text-ink mb-1.5">{t.features.items[i].title}</h3>
                <p className="text-sm text-muted leading-relaxed">{t.features.items[i].desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMANDOS ═══ */}
      <section id="comandos" className="relative py-16 border-t border-border">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-brand-600 dark:text-brand-300 font-semibold uppercase tracking-[0.25em] text-xs mb-3">
              {t.commandsSection.kicker}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-ink">{t.commandsSection.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              {t.commandsSection.subtitle}
            </p>
          </div>

          {CATEGORIES.map((category) => {
            const cmds = COMMANDS.filter((c) => c.category === category);
            return (
              <div key={category} className="mb-10">
                <h3 className="font-semibold uppercase tracking-widest text-sm mb-4 flex items-center gap-3 text-ink">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-400/12 text-brand-600 dark:text-brand-300">
                    <Icon name={CATEGORY_ICONS[category]} size={16} />
                  </span>
                  {t.commandsSection.categories[category]}
                  <span className="w-px h-4 bg-border" />
                  <span className="text-faint text-xs">{cmds.length}</span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cmds.map((cmd) => (
                    <div key={cmd.name} className="soft-card rounded-2xl p-5 hover-card">
                      <div className="flex items-center justify-between mb-3">
                        <code className="text-sm font-semibold text-brand-600 dark:text-brand-300 bg-brand-400/10 px-2.5 py-1 rounded-lg border border-brand-400/25">
                          {status?.prefix ?? BOT_PREFIX}{cmd.name}
                        </code>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-400/12 text-violet-500 dark:text-violet-300">
                          <Icon name={cmd.icon} style={cmd.icon === 'server' ? 'filled' : 'outline'} size={16} />
                        </span>
                      </div>
                      <p className="text-sm text-muted mb-3">{cmd.description}</p>
                      <p className="text-xs text-faint font-medium">
                        {t.commandsSection.usage}: <code className="text-ink bg-card border border-border px-1.5 py-0.5 rounded">{cmd.usage}</code>
                      </p>
                      {cmd.aliases.length > 0 && (
                        <p className="text-xs text-faint mt-2">
                          {t.commandsSection.aliases}: {cmd.aliases.slice(0, 4).map((a) => (
                            <code key={a} className="bg-card border border-border px-1 py-0.5 rounded mr-1">{a}</code>
                          ))}
                          {cmd.aliases.length > 4 && <span className="text-faint/60">+{cmd.aliases.length - 4}</span>}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="text-center mt-12">
            <Link href="/comandos" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold btn-ghost">
              {t.commandsSection.viewAll}
              <Icon name="arrow-right" style="filled" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ ESTADO EN VIVO ═══ */}
      <section id="estado" className="relative py-16 bg-surface border-y border-border">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">{t.statusSection.title}</h2>
          <p className="mx-auto mb-10 max-w-xl text-muted">{t.statusSection.subtitle}</p>

          <div className="soft-card rounded-3xl p-8 max-w-2xl mx-auto border border-border">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span
                className={`w-4 h-4 rounded-full ${
                  isOnline ? 'bg-success animate-pulse shadow-[0_0_12px_var(--success)]' : 'bg-danger shadow-[0_0_12px_var(--danger)]'
                }`}
              />
              <span className={`font-semibold text-xl ${isOnline ? 'text-ink' : 'text-danger'}`}>
                {isOnline ? t.statusSection.online : t.statusSection.offline}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: t.statusSection.servers, value: status ? String(status.guilds) : '—' },
                { label: t.statusSection.commands, value: status ? status.commands_total.toLocaleString(lang === 'es' ? 'es' : 'en') : '—' },
                { label: t.statusSection.uptime, value: formatUptime(status?.started_at ?? null, now) },
                { label: t.statusSection.version, value: status?.version ?? '—' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-bold text-ink">{s.value}</div>
                  <div className="text-[10px] text-faint font-medium uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-faint">
              {status?.last_seen
                ? `${t.statusSection.lastSeen}: ${new Date(status.last_seen).toLocaleString(lang === 'es' ? 'es' : 'en')} · ${t.statusSection.heartbeat}`
                : t.statusSection.noStatus}
            </p>

            <Link
              href="/estado"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-lg text-sm font-semibold btn-ghost"
            >
              {t.statusSection.viewPage}
              <Icon name="arrow-right" style="filled" size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ ECOSISTEMA ═══ */}
      <section id="ecosistema" className="relative py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink">{t.ecosystem.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">{t.ecosystem.subtitle}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {t.ecosystem.items.map((eco, i) => {
              const href = i === 0 ? 'https://ciszunetwork.vercel.app' : 'https://ciszukoantony.vercel.app';
              return (
                <a
                  key={eco.name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="soft-card rounded-2xl p-7 hover-card text-left group"
                >
                  <h3 className="font-bold text-xl text-ink mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                    {eco.name}
                  </h3>
                  <p className="text-sm text-muted">{eco.desc}</p>
                  <span className="inline-flex items-center gap-2 mt-5 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
                    {t.ecosystem.visit}
                    <Icon name="arrow-right" style="filled" size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="relative py-20 text-center border-t border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-400/5 to-transparent" />
        <div className="relative max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">{t.cta.title}</h2>
          <p className="mx-auto mb-8 max-w-lg text-muted">{t.cta.description}</p>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-xl text-sm font-bold tracking-wide btn-discord"
          >
            <Icon name="discord" size={20} className="[&>g]:fill-current" />
            {t.cta.button}
          </a>
        </div>
      </section>
    </div>
  );
}
