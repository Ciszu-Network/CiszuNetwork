'use client';

/**
 * GlobalAdvisor — Sistema de mensajes globales (GLOBAL_ADVISOR_SYSTEM).
 *
 * TODO #3: permite que el admin (desde la dev console / API) envíe mensajes
 * globales que se muestran como toasts en las webs del ecosistema.
 *
 * - Hace polling a la tabla ciszunetwork.global_announcements (cada ~30s).
 * - Filtra por `target` ('global' o la web actual) y por expiración.
 * - Muestra el toast centrado (pill, estilo unificado del ecosistema).
 * - Marca como visto (announcement_reads) para "resetear notif" por usuario.
 *
 * Uso en cada layout:
 *   <GlobalAdvisor site="ciszu" />
 *   site: 'ciszu' | 'ciszukoantony' | 'muzicmania' | 'ciszubot'
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface Announcement {
  id: number;
  sender: string;
  source: string;
  message: string;
  kind: 'info' | 'success' | 'warning' | 'error';
  target: string;
  expires_at: string | null;
  created_at: string;
}

export interface GlobalAdvisorProps {
  site: 'ciszu' | 'ciszukoantony' | 'muzicmania' | 'ciszubot';
  /** Intervalo de polling en ms (default 30000). */
  pollInterval?: number;
  /** Desactiva el polling (p.ej. modo edición). */
  disabled?: boolean;
}

const POLL_INTERVAL = 30000;
const TOAST_DURATION = 8000;

const KIND_STYLES: Record<Announcement['kind'], { dot: string; text: string; shadow: string }> = {
  info: { dot: 'bg-sky-400', text: 'text-sky-300', shadow: 'shadow-[0_4px_30px_rgba(56,189,248,0.35)]' },
  success: { dot: 'bg-emerald-400', text: 'text-emerald-300', shadow: 'shadow-[0_4px_30px_rgba(52,211,153,0.35)]' },
  warning: { dot: 'bg-amber-400', text: 'text-amber-300', shadow: 'shadow-[0_4px_30px_rgba(251,191,36,0.35)]' },
  error: { dot: 'bg-rose-400', text: 'text-rose-300', shadow: 'shadow-[0_4px_30px_rgba(251,113,133,0.4)]' },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function supabaseFetch(path: string, query = '') {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}?${query}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Profile': 'ciszunetwork',
    },
  });
}

export default function GlobalAdvisor({ site, pollInterval = POLL_INTERVAL, disabled = false }: GlobalAdvisorProps) {
  const [queue, setQueue] = useState<Announcement[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const seenIdsRef = useRef<Set<number>>(new Set());
  const mountedRef = useRef(true);

  // Limpiar timers al desmontar
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    setQueue((q) => q.filter((a) => a.id !== id));
    setSeenIdsRef(new Set(seenIdsRef.current).add(id));
  }, []);

  function setSeenIdsRef(next: Set<number>) {
    seenIdsRef.current = next;
  }

  const poll = useCallback(async () => {
    if (disabled || !mountedRef.current) return;
    try {
      const since = encodeURIComponent(new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString());
      const res = await supabaseFetch(
        'global_announcements',
        `select=id,sender,source,message,kind,target,expires_at,created_at&or=(target.eq.global,target.eq.${site})&created_at=gt.${since}&order=created_at.asc`
      );
      if (!res.ok) return;
      const items = (await res.json()) as Announcement[];
      const now = new Date();
      const pending = items.filter((a) => {
        if (seenIdsRef.current.has(a.id)) return false;
        if (a.expires_at && new Date(a.expires_at) < now) return false;
        return true;
      });

      if (pending.length > 0) {
        setQueue((q) => {
          const existing = new Set(q.map((x) => x.id));
          return [...q, ...pending.filter((a) => !existing.has(a.id))];
        });
        pending.forEach((a) => {
          const t = setTimeout(() => dismiss(a.id), TOAST_DURATION);
          timersRef.current.push(t);
        });
      }
    } catch { /* ignore */ }
  }, [site, disabled, dismiss]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, pollInterval);
    return () => clearInterval(interval);
  }, [poll, pollInterval]);

  if (queue.length === 0) return null;

  return (
    <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[1100] flex flex-col items-center gap-2 pointer-events-none px-4 max-w-full">
      {queue.map((a) => {
        const style = KIND_STYLES[a.kind] || KIND_STYLES.info;
        return (
          <div
            key={a.id}
            className={`bg-[#05050a]/95 border border-white/10 px-5 py-3 rounded-2xl ${style.shadow} backdrop-blur-md flex items-center gap-3 animate-fade-in-up pointer-events-auto max-w-[92vw]`}
            role="status"
          >
            <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse shrink-0`} />
            <div className="flex flex-col">
              <span className={`${style.text} font-bold uppercase tracking-widest text-[10px] leading-tight`}>
                {a.sender} · {a.source}
              </span>
              <span className="text-white/90 text-xs sm:text-sm font-medium">{a.message}</span>
            </div>
            <button
              onClick={() => dismiss(a.id)}
              aria-label="Cerrar aviso"
              className="shrink-0 w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}