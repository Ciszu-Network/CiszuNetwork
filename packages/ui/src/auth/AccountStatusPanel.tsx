'use client';

import React, { useCallback, useEffect, useState } from 'react';

/**
 * Estado de la cuenta (estilo Discord/Steam): barra verde→amarillo→rojo, roadmap
 * "qué te falta", strikes (3 = eliminación), sanciones activas con apelación y
 * registro de hechos/ignorados. Se monta en la configuración de cuenta de las
 * webs y consume /api/auth/account/status. Ver ANTICHEAT_SYSTEM.md §8.
 */

interface AuthLike {
  auth: {
    getSession(): Promise<{ data: { session: { access_token: string } | null } }>;
  };
}

interface Sanction {
  id: string;
  type: string;
  reason: string;
  source: 'anticheat' | 'manual';
  createdAt: string;
  expiresAt: string | null;
  appealable: boolean;
}

interface RoadmapItem {
  key: string;
  title: string;
  detail: string | null;
  status: 'pending' | 'done' | 'ignored';
  level: 'info' | 'recommendation' | 'warning' | 'sanction' | 'critical';
}

interface StatusData {
  color: 'green' | 'yellow' | 'red' | 'minimal' | 'deleted';
  sanctions: Sanction[];
  strikes: { count: number; max: number; nextExpiry: string | null };
  roadmap: RoadmapItem[];
  appealUrl: string;
  deletionPending: boolean;
  deleted: boolean;
}

const COLOR_META: Record<StatusData['color'], { label: string; cls: string; bar: string; why: string }> = {
  green: { label: 'Muy buen estado', cls: 'text-emerald-400', bar: 'from-emerald-400 to-green-500', why: 'Sin sanciones ni pendientes importantes.' },
  yellow: { label: 'Recomendaciones pendientes', cls: 'text-amber-400', bar: 'from-amber-400 to-yellow-500', why: 'Hay configuraciones recomendadas sin completar.' },
  red: { label: 'Sanción activa', cls: 'text-red-400', bar: 'from-red-500 to-rose-600', why: 'Tu cuenta tiene una sanción activa. Puedes apelarla.' },
  minimal: { label: 'En peligro de eliminación', cls: 'text-red-300', bar: 'from-red-700 to-red-900', why: 'La cuenta está en proceso de eliminación (15 días).' },
  deleted: { label: 'Eliminada por el sistema', cls: 'text-gray-400', bar: 'from-gray-700 to-gray-900', why: 'La cuenta fue eliminada por sistema/staff; no es apelable.' },
};

const STRIKE_CARDS: Record<number, string> = {
  0: 'Todo bien: mantén tu correo y tu OTP al día para seguir así.',
  1: 'Primer strike: evita reincidir. Al segundo, la cuenta queda al borde del límite.',
  2: 'Último aviso: un strike más y la cuenta será baneada y eliminada. Apela si fue un error.',
  3: 'Tercer strike: la eliminación por sistema ya no se puede revertir.',
};

export function AccountStatusPanel({
  supabase,
  apiBase = '/api/auth/2fa',
  site,
}: {
  supabase: AuthLike;
  apiBase?: string;
  site: string;
}) {
  const [data, setData] = useState<StatusData | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const base = apiBase.replace(/\/2fa$/, '');

  const load = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) return;
      const res = await fetch(`${base}/account/status?site=${encodeURIComponent(site)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = (await res.json()) as { status?: StatusData };
      if (json.status) setData(json.status);
    } catch {
      setError('No se pudo cargar el estado de la cuenta.');
    }
  }, [supabase, base, site]);

  useEffect(() => {
    void load();
  }, [load]);

  const setItem = async (item: RoadmapItem, status: 'done' | 'ignored' | 'pending') => {
    setBusy(item.key);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch(`${base}/account/status?site=${encodeURIComponent(site)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({ key: item.key, status, title: item.title, level: item.level, detail: item.detail ?? undefined }),
      });
      if (!res.ok) throw new Error('save_failed');
      await load();
    } catch {
      setError('No se pudo guardar el cambio.');
    } finally {
      setBusy(null);
    }
  };

  if (!data) {
    return <p className="text-xs text-muted">{error ?? 'Cargando estado de la cuenta…'}</p>;
  }

  const meta = COLOR_META[data.color];
  const done = data.roadmap.filter((i) => i.status === 'done').length;
  const ignored = data.roadmap.filter((i) => i.status === 'ignored').length;
  const total = data.roadmap.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const activeSanctions = data.sanctions;

  return (
    <div className="space-y-4">
      {/* Barra de estado */}
      <div>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-black uppercase tracking-widest ${meta.cls}`}>{meta.label}</span>
          <span className="text-[10px] text-muted">{pct}% configurado</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full bg-gradient-to-r ${meta.bar}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">{meta.why}</p>
      </div>

      {/* Strikes */}
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-ink">Strikes: {data.strikes.count}/{data.strikes.max}</p>
          {data.strikes.nextExpiry && (
            <p className="text-[10px] text-muted">El más antiguo expira {new Date(data.strikes.nextExpiry).toLocaleDateString()}</p>
          )}
        </div>
        <div className="mt-2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-2 flex-1 rounded-full ${i < data.strikes.count ? 'bg-red-500' : 'bg-white/10'}`} />
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">{STRIKE_CARDS[Math.min(3, data.strikes.count)]}</p>
      </div>

      {/* Sanciones activas */}
      {activeSanctions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Sanciones activas</p>
          {activeSanctions.map((s) => (
            <div key={`${s.source}-${s.id}`} className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-ink">
                  {s.type.toUpperCase()} · {s.source === 'anticheat' ? 'Ciszu Anti-Cheat' : 'Moderación'}
                </p>
                {s.appealable ? (
                  <a href="/appeal" className="rounded-lg border border-red-500/40 px-2.5 py-1 text-[10px] font-bold text-red-300 transition hover:bg-red-500/10">
                    Apelar
                  </a>
                ) : (
                  <span className="text-[10px] font-bold text-muted">No apelable</span>
                )}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{s.reason}</p>
              {s.expiresAt && (
                <p className="mt-1 text-[10px] text-muted">Hasta {new Date(s.expiresAt).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {data.deletionPending && (
        <p className="rounded-xl border border-red-700/40 bg-red-900/10 p-3 text-[11px] leading-relaxed text-muted">
          Tu cuenta está en proceso de eliminación (15 días). Inicia sesión dentro del plazo para recuperarla.
        </p>
      )}
      {data.deleted && (
        <p className="rounded-xl border border-border bg-surface p-3 text-[11px] leading-relaxed text-muted">
          Esta cuenta fue eliminada por el sistema/staff. No es apelable y no puede reactivarse desde aquí.
        </p>
      )}

      {/* Roadmap / qué te falta */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">
          Qué te falta por hacer ({done}/{total} · {ignored} ignorada{ignored === 1 ? '' : 's'})
        </p>
        {data.roadmap.map((item) => (
          <div key={item.key} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-black ${
                item.status === 'done'
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                  : item.status === 'ignored'
                    ? 'border-border bg-white/5 text-muted'
                    : 'border-amber-400/60 text-amber-300'
              }`}
            >
              {item.status === 'done' ? '✓' : item.status === 'ignored' ? '–' : '!'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink">{item.title}</p>
              {item.detail && <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{item.detail}</p>}
            </div>
            <div className="flex shrink-0 gap-1.5">
              {item.status !== 'done' && (
                <button
                  type="button"
                  disabled={busy === item.key}
                  onClick={() => void setItem(item, 'done')}
                  className="rounded-lg border border-emerald-400/40 px-2 py-1 text-[10px] font-bold text-emerald-300 transition hover:bg-emerald-400/10 disabled:opacity-50"
                >
                  Hecho
                </button>
              )}
              {item.status === 'pending' && (
                <button
                  type="button"
                  disabled={busy === item.key}
                  onClick={() => void setItem(item, 'ignored')}
                  className="rounded-lg border border-border px-2 py-1 text-[10px] font-bold text-muted transition hover:text-ink disabled:opacity-50"
                >
                  Ignorar
                </button>
              )}
              {item.status !== 'pending' && (
                <button
                  type="button"
                  disabled={busy === item.key}
                  onClick={() => void setItem(item, 'pending')}
                  className="rounded-lg border border-border px-2 py-1 text-[10px] font-bold text-muted transition hover:text-ink disabled:opacity-50"
                >
                  Reabrir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-[11px] font-bold text-red-400">{error}</p>}
    </div>
  );
}

export default AccountStatusPanel;
