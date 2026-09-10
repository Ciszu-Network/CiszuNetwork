import type { Metadata } from 'next';
import QuickDocks from '@/components/molecules/QuickDocks';
import { Icon } from '@ciszu/ui';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'CiszuBot | STATS',
  description: 'Estadísticas de CiszuBot: visitantes, vistas, reseñas, tickets y rating.',
};

async function getStats() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://obwzzmbvkrcscqwptlqo.supabase.co';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    const res = await fetch(
      `${url}/rest/v1/ciszubot_stats?select=visitors,page_views,reviews_count,tickets_open,avg_rating,updated_at&id=eq.1`,
      {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Accept-Profile': 'ciszubot' },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

const statCards = [
  { key: 'visitors', label: 'Visitantes', sub: 'Visitors', icon: 'users' },
  { key: 'page_views', label: 'Vistas', sub: 'Page views', icon: 'flame' },
  { key: 'reviews_count', label: 'Reseñas', sub: 'Reviews', icon: 'star' },
  { key: 'tickets_open', label: 'Tickets abiertos', sub: 'Open tickets', icon: 'warning' },
  { key: 'avg_rating', label: 'Rating promedio', sub: 'Average rating', icon: 'verified' },
  { key: 'uptime', label: 'Uptime', sub: 'Uptime', icon: 'clock' },
] as const;

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <div className="bg-bg py-16">
      <div className="max-w-screen-xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-400/12 text-brand-600 dark:text-brand-300 mb-6 shadow-[0_0_20px_rgba(35,63,146,0.25)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20V14" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-ink mb-4">
                Stats
              </h1>
              <p className="text-muted max-w-xl mx-auto text-sm uppercase tracking-widest">
                Estadísticas de CiszuBot
              </p>
            </div>

          {!stats ? (
            <div className="text-center">
              <p className="text-muted text-sm">No hay métricas disponibles aún.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statCards.map((s) => (
                <div key={s.key} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center hover:border-brand-400/30 transition-all">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-400/10 text-brand-600 dark:text-brand-300 mb-3">
                    <Icon name={s.icon} size={20} />
                  </div>
                  <div className="text-4xl md:text-5xl font-header font-black text-white mb-2">
                    {s.key === 'avg_rating' ? (stats[s.key] ?? 0).toFixed(1) : (stats[s.key] ?? 0).toLocaleString()}
                  </div>
                  <div className="text-white font-bold text-sm mb-1">{s.label}</div>
                  <div className="text-muted text-xs uppercase tracking-widest">{s.sub}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <QuickDocks />
      </div>
    </div>
  );
}
