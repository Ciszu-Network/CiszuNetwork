'use client';

/**
 * GlobalAdvisor — Sistema de mensajes globales (GLOBAL_ADVISOR_SYSTEM).
 *
 * TODO #3: permite que el admin (desde la dev console / API) envíe mensajes
 * globales que se muestran como toasts en las webs del ecosistema.
 *
 * - Hace polling a ciszunetwork.global_announcements (cada ~20s).
 * - Respeta el KILL SWITCH (global_announcement_settings): si está desactivado
 *   no muestra nada y limpia lo mostrado al instante.
 * - CONFIRMA ENTREGA por sitio (global_announcement_deliveries) en cada fetch
 *   para todo anuncio relevante (target global o lista con el site), de modo
 *   que el devcon pueda esperar la llegada con `--wait` de forma fiable.
 * - Recuerda los mensajes ya vistos/cerrados en localStorage (por web) para
 *   que NO reaparezcan al recargar la página.
 * - Emisores verificados: display_name + @username con badge y enlace a perfil.
 *
 * Uso: <GlobalAdvisor site="ciszu" />  (site: 'ciszu'|'ciszukoantony'|'muzicmania'|'ciszubot')
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
  sender_display_name?: string | null;
  sender_username?: string | null;
  sender_site?: string | null;
}

export interface GlobalAdvisorProps {
  site: 'ciszu' | 'ciszukoantony' | 'muzicmania' | 'ciszubot';
  /** Intervalo de polling en ms (default 20000). */
  pollInterval?: number;
  /** Desactiva el polling (p.ej. modo edición). */
  disabled?: boolean;
}

const POLL_INTERVAL = 20000;
const TOAST_DURATION = 8000;
const SEEN_MAX = 200;

const KIND_STYLES: Record<Announcement['kind'], { dot: string; text: string; shadow: string }> = {
  info: { dot: 'bg-sky-400', text: 'text-sky-300', shadow: 'shadow-[0_4px_30px_rgba(56,189,248,0.35)]' },
  success: { dot: 'bg-emerald-400', text: 'text-emerald-300', shadow: 'shadow-[0_4px_30px_rgba(52,211,153,0.35)]' },
  warning: { dot: 'bg-amber-400', text: 'text-amber-300', shadow: 'shadow-[0_4px_30px_rgba(251,191,36,0.35)]' },
  error: { dot: 'bg-rose-400', text: 'text-rose-300', shadow: 'shadow-[0_4px_30px_rgba(251,113,133,0.4)]' },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function supabaseFetch(path: string, query = '', init?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}?${query}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Profile': 'ciszunetwork',
      ...(init?.headers || {}),
    },
    ...init,
  });
}

// Páginas públicas de perfil por web (solo muzicmania tiene ruta pública hoy).
const PROFILE_HREFS: Record<string, (username: string) => string> = {
  muzicmania: (u) => `https://muzicmania.vercel.app/profile/${u}`,
};

/** Username legible: sin @ y sin guiones bajos finales (ciszukoantony_ -> ciszukoantony). */
function displayUsername(username: string): string {
  return username.replace(/^@/, '').replace(/_+$/, '');
}

function seenKey(site: string): string {
  return `global_advisor_seen_${site}`;
}

function loadSeen(site: string): Set<number> {
  try {
    const raw = window.localStorage.getItem(seenKey(site));
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((n: unknown) => typeof n === 'number') : []);
  } catch {
    return new Set();
  }
}

function persistSeen(site: string, ids: Set<number>) {
  try {
    const list = Array.from(ids).slice(-SEEN_MAX);
    window.localStorage.setItem(seenKey(site), JSON.stringify(list));
  } catch { /* no romper por localStorage */ }
}

export default function GlobalAdvisor({ site, pollInterval = POLL_INTERVAL, disabled = false }: GlobalAdvisorProps) {
  const [queue, setQueue] = useState<Announcement[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const seenIdsRef = useRef<Set<number>>(new Set());
  const mountedRef = useRef(true);
  const enabledRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    seenIdsRef.current = loadSeen(site);
    return () => {
      mountedRef.current = false;
      timersRef.current.forEach(clearTimeout);
    };
  }, [site]);

  const dismiss = useCallback(
    (id: number) => {
      setQueue((q) => q.filter((a) => a.id !== id));
      const next = new Set(seenIdsRef.current);
      next.add(id);
      seenIdsRef.current = next;
      persistSeen(site, next);
    },
    [site],
  );

  // Confirma la entrega del anuncio en este sitio (upsert por PK, idempotente).
  const confirmDelivery = useCallback(
    async (id: number) => {
      try {
        await supabaseFetch(
          'global_announcement_deliveries',
          `announcement_id=eq.${id}&site=eq.${site}`,
          {
            method: 'POST',
            headers: {
              'Content-Profile': 'ciszunetwork',
              Prefer: 'resolution=merge-duplicates,return=minimal',
            },
            body: JSON.stringify({ announcement_id: id, site }),
          }
        );
      } catch { /* telemetría: no debe romper el toast */ }
    },
    [site],
  );

  const poll = useCallback(async () => {
    if (disabled || !mountedRef.current) return;

    // Kill switch: si está apagado, no mostrar nada y limpiar lo mostrado.
    try {
      const settingsRes = await supabaseFetch('global_announcement_settings', 'id=eq.1&select=enabled');
      if (settingsRes.ok) {
        const settings = (await settingsRes.json()) as { enabled: boolean }[];
        const enabled = Array.isArray(settings) && settings.length ? settings[0].enabled : true;
        enabledRef.current = enabled;
        if (!enabled) {
          setQueue([]);
          return;
        }
      }
    } catch { /* si falla settings, seguir como activo (fail-open) */ }

    try {
      const since = encodeURIComponent(new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString());
      const res = await supabaseFetch(
        'global_announcements',
        `select=id,sender,source,message,kind,target,expires_at,created_at,sender_display_name,sender_username,sender_site&created_at=gt.${since}&order=created_at.asc`
      );
      if (!res.ok) return;
      const items = (await res.json()) as Announcement[];
      const now = new Date();
      const relevant = items.filter((a) => {
        if (a.expires_at && new Date(a.expires_at) < now) return false;
        const targets = String(a.target || 'global').split(',').map((t) => t.trim());
        return a.target === 'global' || targets.includes(site);
      });

      // Confirmar entrega de TODOS los relevantes (la web ya los recibió),
      // independientemente de si el usuario los cerró antes o en esta visita.
      relevant.forEach((a) => void confirmDelivery(a.id));

      // Mostrar solo los no vistos (persistidos en localStorage).
      const pending = relevant.filter((a) => !seenIdsRef.current.has(a.id));
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
  }, [site, disabled, dismiss, confirmDelivery]);

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
        const verified = Boolean(a.sender_username);
        const profileHref = a.sender_site ? PROFILE_HREFS[a.sender_site]?.(a.sender_username!) : undefined;
        return (
          <div
            key={a.id}
            className={`bg-[#05050a]/95 border border-white/10 px-5 py-3 rounded-2xl ${style.shadow} backdrop-blur-md flex items-center gap-3 animate-fade-in-up pointer-events-auto max-w-[92vw]`}
            role="status"
          >
            <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse shrink-0`} />
            <div className="flex flex-col">
              <span className={`${style.text} font-bold uppercase tracking-widest text-[10px] leading-tight`}>
                {verified ? (
                  <span className="inline-flex items-center gap-1.5">
                    {profileHref ? (
                      <a
                        href={profileHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-dotted underline-offset-2 hover:text-white transition-colors"
                        title={`Ver perfil de ${a.sender_display_name}`}
                      >
                        {a.sender_display_name || displayUsername(a.sender_username!)}
                      </a>
                    ) : (
                      <span>{a.sender_display_name || displayUsername(a.sender_username!)}</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-sky-400" title="Cuenta verificada">
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                        <path d="M12 1.5 14.6 4l3.3-.5.5 3.3 3 1.5-1.5 3 1.5 3-3 1.5-.5 3.3-3.3-.5L12 22.5 9.4 20l-3.3.5-.5-3.3-3-1.5 1.5-3-1.5-3 3-1.5.5-3.3 3.3.5z"/>
                        <path d="m8.7 12 2.1 2.1 4.5-4.5" fill="none" stroke="#05050a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {displayUsername(a.sender_username!)}
                    </span>
                    <span className="text-white/50">· {a.source}</span>
                  </span>
                ) : (
                  <span>{a.sender} · {a.source}</span>
                )}
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