import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Icon } from '@ciszu/ui';
import { getDict, type Lang } from '@/lib/i18n';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Estado — CiszuBot',
  description:
    'Estado en vivo de CiszuBot: servidores conectados, comandos ejecutados, uptime y versión.',
};

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
  const s = diff % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default async function StatusPage() {
  const store = await cookies();
  const lang = (store.get('ciszubot_lang')?.value ?? 'es') as Lang;
  const t = getDict(lang);
  const locale = lang === 'es' ? 'es' : 'en';

  const status = await getBotStatus();
  const now = Date.now();
  const lastSeenMs = status?.last_seen ? Date.parse(status.last_seen) : 0;
  const heartbeatFresh = now - lastSeenMs < 3 * 60 * 1000;
  const isOnline = Boolean(status?.online) && heartbeatFresh;

  const stats = [
    { icon: 'server', label: t.statusPage.servers, value: status ? String(status.guilds) : '—', filled: true },
    { icon: 'terminal', label: t.statusPage.commandsRun, value: status ? status.commands_total.toLocaleString(locale) : '—', filled: true },
    { icon: 'clock', label: t.statusPage.uptime, value: formatUptime(status?.started_at ?? null, now), filled: false },
    { icon: 'verified', label: t.statusPage.version, value: status?.version ?? '—', filled: false },
  ];

  return (
    <div className="bg-bg py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-ink">{t.statusPage.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t.statusPage.subtitle}</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div
            className={`soft-card rounded-3xl p-8 border ${
              isOnline ? 'border-success/30' : 'border-danger/30'
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <span
                className={`w-4 h-4 rounded-full ${
                  isOnline ? 'bg-success animate-pulse shadow-[0_0_12px_var(--success)]' : 'bg-danger shadow-[0_0_12px_var(--danger)]'
                }`}
              />
              <span className={`font-semibold text-2xl ${isOnline ? 'text-ink' : 'text-danger'}`}>
                {isOnline ? t.statusPage.online : t.statusPage.offline}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-400/12 text-brand-600 dark:text-brand-300 mb-3">
                    <Icon name={s.icon} style={s.filled ? 'filled' : 'outline'} size={20} />
                  </span>
                  <div className="text-xl md:text-2xl font-bold text-ink break-all">{s.value}</div>
                  <div className="text-[10px] text-faint font-medium uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border grid sm:grid-cols-2 gap-4 text-sm">
              {status?.started_at && (
                <p className="text-muted">
                  <span className="font-semibold text-ink">{t.statusPage.startedAt}:</span>{' '}
                  {new Date(status.started_at).toLocaleString(locale)}
                </p>
              )}
              <p className="text-muted">
                <span className="font-semibold text-ink">{t.statusPage.lastSeen}:</span>{' '}
                {status?.last_seen ? new Date(status.last_seen).toLocaleString(locale) : '—'}
              </p>
              {status?.prefix && (
                <p className="text-muted">
                  <span className="font-semibold text-ink">{t.statusPage.version}:</span>{' '}
                  <code className="text-brand-600 dark:text-brand-300 bg-card border border-border px-1.5 py-0.5 rounded">{status.prefix}</code>
                </p>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-faint">
            {t.statusPage.refresh} {t.statusPage.updated}
          </p>

          <div className="text-center mt-8">
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold btn-ghost">
              {t.statusPage.back}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
