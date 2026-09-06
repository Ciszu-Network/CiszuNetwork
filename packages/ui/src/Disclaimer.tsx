'use client';

/* ------------------------------------------------------------------ *
 * SISTEMA DE DISCLAIMERS (ciszu network — paquete @ciszu/ui)
 *
 * Sustituye los banners sueltos (BetaDisclaimer, ZoomWarning) por un
 * sistema global apilable que SE ADAPTA AL HEADER de cada web:
 *
 *  - Header estático (full): el disclaimer se ancla DEBAJO del header,
 *    en una banda de extremo a extremo, sin sobreponerse a él.
 *  - Header island (flotante): el disclaimer pasa a tarjeta flotante
 *    con los mismos márgenes horizontales que el island.
 *
 * Los disclaimers se muestran apilados sin solaparse, comparten el mismo
 * botón X, no repiten iconos (según su tipo) y se pueden cerrar con el
 * mismo gesto. Los Navbars publican su modo (island/full) vía pub/sub.
 * ------------------------------------------------------------------ */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSyncExternalStore } from 'react';
import { useZoomWarningActive } from './zoomStore';

export type DisclaimerKind = 'info' | 'beta' | 'warning';

export interface DisclaimerItem {
  id: string;
  kind: DisclaimerKind;
  message: string;
  onClose: () => void;
  /** false = obligatorio (sin botón X). Default true. */
  dismissible?: boolean;
  /** Fecha ISO de culminación: si llega, el disclaimer se cierra solo y no
   *  vuelve (temporal con fecha). Si es null, es temporal SIN fecha de fin. */
  expiresAt?: string | null;
  /** Imagen opcional (URL) para disclaimers con creatividad (eventos). */
  image?: string;
  /** Mostrar contador de tiempo restante (solo si expiresAt). Default true. */
  showCountdown?: boolean;
}

interface DisclaimerContextValue {
  items: DisclaimerItem[];
  push: (item: DisclaimerItem) => void;
  remove: (id: string) => void;
}

const DisclaimerContext = createContext<DisclaimerContextValue | null>(null);

/** Registro global de disclaimers activos (contexto del provider). */
export function DisclaimerProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DisclaimerItem[]>([]);

  const push = useCallback((item: DisclaimerItem) => {
    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const value = useMemo(() => ({ items, push, remove }), [items, push, remove]);

  return <DisclaimerContext.Provider value={value}>{children}</DisclaimerContext.Provider>;
}

/** Hook para que los productores (BetaDisclaimer, ZoomWarning, etc.) publiquen/retiren disclaimers. */
export function useDisclaimer() {
  const ctx = useContext(DisclaimerContext);
  if (!ctx) throw new Error('useDisclaimer debe usarse dentro de <DisclaimerProvider>.');
  return ctx;
}

/* ------------------------------------------------------------------ *
 * Modo del header (island/full) — pub/sub SSR-safe
 * ------------------------------------------------------------------ */

export type HeaderMode = 'full' | 'island';

const INITIAL_HEADER: HeaderMode = 'full';
let headerMode: HeaderMode = INITIAL_HEADER;
const headerListeners = new Set<() => void>();

function emitHeaderMode(mode: HeaderMode) {
  headerMode = mode;
  headerListeners.forEach((l) => l());
}

/** Los Navbars llaman a esta función cuando su modo island cambia. */
export function publishHeaderMode(mode: HeaderMode) {
  if (typeof window === 'undefined') return;
  emitHeaderMode(mode);
}

const subscribeHeader = (listener: () => void) => {
  headerListeners.add(listener);
  return () => headerListeners.delete(listener);
};

const getHeaderSnapshot = () => headerMode;

/** Hook para que el DisclaimerStack sepa si el header es island o estático. */
export function useHeaderMode(): HeaderMode {
  return useSyncExternalStore(subscribeHeader, getHeaderSnapshot, () => INITIAL_HEADER);
}

/* ------------------------------------------------------------------ *
 * Iconos centralizados (uno por tipo; el X es único y compartido)
 * ------------------------------------------------------------------ */

const ICONS: Record<DisclaimerKind, React.ReactNode> = {
  info: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z" />
    </svg>
  ),
  beta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8h.01" />
      <path d="M12 12v4" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
};

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * CSS autocontenido (usa las variables de tema de cada web con fallbacks)
 * ------------------------------------------------------------------ */

const DISCLAIMER_CSS = `
@keyframes disclaimer-down {
  0% { opacity: 0; transform: translateY(-14px); }
  100% { opacity: 1; transform: translateY(0); }
}
.disclaimer-stack {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 45;
  display: flex;
  flex-direction: column;
  gap: 6px;
  pointer-events: none;
  padding: 0 12px;
}
.disclaimer-stack.island {
  gap: 8px;
}
.disclaimer-item {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 6px 8px 6px 12px;
  border: 1px solid var(--border, rgba(255,255,255,0.1));
  background: var(--card, var(--bg-card, #0a0a0f));
  color: var(--ink, #fff);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  animation: disclaimer-down 0.22s ease forwards;
}
.disclaimer-item.full {
  border-left: none;
  border-right: none;
  border-top: none;
  border-radius: 0;
}
.disclaimer-item.island {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
}
.disclaimer-item .disc-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  color: var(--accent, #22d3ee);
}
.disclaimer-item.warning .disc-icon { color: var(--warn, #f59e0b); }
.disclaimer-item.beta .disc-icon { color: var(--accent, #22d3ee); }
.disclaimer-item .disc-body {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin: 0 auto;
}
.disclaimer-item .disc-img {
  flex-shrink: 0;
  height: 24px;
  width: 24px;
  object-fit: contain;
  border-radius: 4px;
}
.disclaimer-item .disc-countdown {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  color: var(--accent, #22d3ee);
}
.disclaimer-item .disc-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.85;
}
.disclaimer-item .disc-decon-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 1px 6px;
}
.disclaimer-item .disc-close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: -10px;
  border: none;
  border-radius: 999px;
  background: rgba(128,128,128,0.15);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.disclaimer-item .disc-close:hover { background: rgba(128,128,128,0.32); }
.disclaimer-item .disc-close:active { transform: scale(0.9); }
.disclaimer-item .disc-close svg { width: 11px; height: 11px; }

@media (min-width: 640px) {
  .disclaimer-item { font-size: 12px; }
}
`;

export interface DisclaimerStackProps {
  /** Altura de la barra del header en modo full (px). */
  headerHeight?: number;
  /** Compensa zoom fuera de rango: el header se desplaza 32px (mt-8). */
  zoomShift?: number;
}

/**
 * Render del stack: debe montarse tras el <Navbar /> de cada web.
 * - modo full  → banda de extremo a extremo anclada DEBAJO del header.
 * - modo island → tarjetas flotantes con los márgenes del header island.
 *
 * Soporta: imagen opcional, contador de expiración (temporal con fecha) y
 * disclaimers obligatorios (sin X). Al llegar a la fecha de culminación, el
 * disclaimer se auto-cierra y no vuelve a aparecer (onClose).
 */
export function DisclaimerStack({ headerHeight = 64, zoomShift = 32 }: DisclaimerStackProps) {
  const { items, remove } = useDisclaimer();
  const mode = useHeaderMode();
  const zoomActive = useZoomWarningActive();

  // Auto-cierre de temporales con fecha de culminación + tick de contador.
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (items.length === 0) return;
    const iv = window.setInterval(() => forceTick((t) => t + 1), 1000);
    const checkExpired = () => {
      for (const item of items) {
        if (item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now()) {
          item.onClose();
          remove(item.id);
        }
      }
    };
    checkExpired();
    const exp = window.setInterval(checkExpired, 2000);
    return () => { window.clearInterval(iv); window.clearInterval(exp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, remove]);

  if (items.length === 0) return null;

  const island = mode === 'island';
  const top = headerHeight + (island ? 14 : 0) + (zoomActive ? zoomShift : 0);

  return (
    <>
      <style>{DISCLAIMER_CSS}</style>
      <div
        className={`disclaimer-stack${island ? ' island' : ''}`}
        style={{ top }}
        role="status"
      >
        {items.map((item) => {
          const dismissible = item.dismissible !== false;
          const remainingMs = item.expiresAt ? new Date(item.expiresAt).getTime() - Date.now() : null;
          const remaining = remainingMs !== null && remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
          const isDevcon = item.message.startsWith('[DEVCON] ');
          const message = isDevcon ? item.message.slice('[DEVCON] '.length) : item.message;
          return (
            <div
              key={item.id}
              className={`disclaimer-item ${item.kind} ${island ? 'island' : 'full'}`}
              role={item.kind === 'warning' ? 'alert' : 'status'}
            >
              <span className="disc-icon">{ICONS[item.kind]}</span>
              <span className="disc-body">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="disc-img" />
                )}
                {isDevcon && (
                  <span className="disc-decon-badge">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Devcon
                  </span>
                )}
                <span className="disc-text">{message}</span>
                {item.expiresAt && remaining > 0 && item.showCountdown !== false && (
                  <span className="disc-countdown" title={item.expiresAt}>
                    {remaining}s
                  </span>
                )}
              </span>
              {dismissible && (
                <button
                  type="button"
                  onClick={item.onClose}
                  aria-label="Cerrar aviso"
                  title="Cerrar aviso"
                  className="disc-close"
                >
                  <XIcon />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * DisclaimerDebug — inyecta disclaimers de DEBUG (devcon) en desarrollo.
 * Lee test/website/debug/local-logs/disclaimers_debug.json vía
 * /api/disclaimers/debug (solo responde en dev). Cada web puede filtrar
 * por su site (`site` prop). En producción no hace nada.
 * ------------------------------------------------------------------ */
export interface DebugDisclaimer {
  id: string;
  kind: DisclaimerKind;
  message: string;
  site?: string;
  dismissible?: boolean;
  expiresAt?: string | null;
  image?: string;
  showCountdown?: boolean;
}

export function DisclaimerDebug({ site }: { site: string }) {
  const { push, remove } = useDisclaimer();
  const [items, setItems] = useState<DebugDisclaimer[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const poll = () => {
      fetch('/api/disclaimers/debug', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((data: { items?: DebugDisclaimer[] }) => {
          // i.site es un array de site IDs (escrito por devcon con Resolve-SiteIds).
          // Filtrar: si no tiene site (undefined) -> se muestra en todas; si tiene array, verificar que incluye el site actual.
          const filtered = (data.items ?? []).filter((i) => !i.site || (Array.isArray(i.site) ? i.site.includes(site) : i.site === site));
          console.log('[DisclaimerDebug] Poll result for', site, ':', filtered.length, 'items');
          setItems(filtered);
        })
        .catch((e) => console.log('[DisclaimerDebug] Poll error:', e));
    };
    poll();
    const iv = window.setInterval(poll, 2000);
    return () => window.clearInterval(iv);
  }, [site]);

  // Sincroniza los items de debug con la pila global de disclaimers.
  useEffect(() => {
    console.log('[DisclaimerDebug] Syncing items for', site, ':', items.length);
    const active = new Set<string>();
    for (const item of items) {
      active.add(item.id);
      push({
        id: item.id,
        kind: item.kind,
        message: '[DEVCON] ' + item.message,
        dismissible: item.dismissible,
        expiresAt: item.expiresAt,
        image: item.image,
        showCountdown: item.showCountdown,
        onClose: () => remove(item.id),
      });
    }
    return () => {
      for (const id of active) remove(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, push, remove]);

  return null;
}

/* ------------------------------------------------------------------ *
 * GlobalDisclaimer — disclaimers GLOBALES (replica de GLOBAL_ADVISOR_SYSTEM).
 *
 * Hace polling a ciszunetwork.global_disclaimers (cada ~20s). Respeta el
 * kill switch (global_disclaimer_settings). Confirma entrega por sitio
 * (global_disclaimer_deliveries) para que el devcon pueda esperar con --wait.
 * Los disclaimers recibidos se inyectan en el DisclaimerProvider (stack), por
 * lo que se muestran apilados en la cabecera como los locales.
 *
 * Uso: <GlobalDisclaimer site="ciszu" />  (site: 'ciszu'|'ciszukoantony'|'muzicmania'|'ciszubot')
 * ------------------------------------------------------------------ */
export interface GlobalDisclaimerProps {
  site: 'ciszu' | 'ciszukoantony' | 'muzicmania' | 'ciszubot';
  pollInterval?: number;
  disabled?: boolean;
}

const GD_POLL_INTERVAL = 20000;
const GD_SEEN_MAX = 100;

const GD_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const GD_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function gdFetch(path: string, query = '', init?: RequestInit) {
  return fetch(`${GD_SUPABASE_URL}/rest/v1/${path}?${query}`, {
    headers: {
      apikey: GD_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${GD_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Profile': 'ciszunetwork',
      ...(init?.headers || {}),
    },
    ...init,
  });
}

export interface GlobalDisclaimerRow {
  id: number;
  sender: string;
  source: string;
  message: string;
  kind: 'info' | 'beta' | 'warning';
  target: string;
  dismissible: boolean;
  expires_at: string | null;
  image: string | null;
  created_at: string;
}

function gdSeenKey(site: string): string {
  return `global_disclaimer_seen_${site}`;
}

function gdLoadSeen(site: string): Set<number> {
  try {
    const raw = window.localStorage.getItem(gdSeenKey(site));
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((n: unknown) => typeof n === 'number') : []);
  } catch {
    return new Set();
  }
}

function gdPersistSeen(site: string, ids: Set<number>) {
  try {
    window.localStorage.setItem(gdSeenKey(site), JSON.stringify(Array.from(ids).slice(-GD_SEEN_MAX)));
  } catch { /* no romper */ }
}

export function GlobalDisclaimer({ site, pollInterval = GD_POLL_INTERVAL, disabled = false }: GlobalDisclaimerProps) {
  const { push, remove } = useDisclaimer();
  const seenRef = useRef<Set<number>>(new Set());
  const [rows, setRows] = useState<GlobalDisclaimerRow[]>([]);

  useEffect(() => {
    seenRef.current = gdLoadSeen(site);
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const settingsRes = await gdFetch('global_disclaimer_settings', 'id=eq.1&select=enabled');
        const settings = settingsRes.ok ? (await settingsRes.json()) : [];
        const enabled = Array.isArray(settings) && settings.length ? settings[0].enabled !== false : true;
        if (!enabled) {
          setRows([]);
          return;
        }
        const res = await gdFetch('global_disclaimers', 'select=*&order=created_at.desc&limit=50');
        if (!res.ok) return;
        const data = (await res.json()) as GlobalDisclaimerRow[];
        const relevant = data.filter((d) => {
          if (d.expires_at && new Date(d.expires_at).getTime() <= Date.now()) return false;
          if (d.target === 'global') return true;
          const list = String(d.target).split(',').map((s) => s.trim()).filter(Boolean);
          return list.includes(site);
        });
        // Confirmar entrega por sitio (upsert) para el --wait del devcon.
        for (const d of relevant) {
          gdFetch('global_disclaimer_deliveries', '', {
            method: 'POST',
            body: JSON.stringify({
              disclaimer_id: d.id,
              site: site,
              delivered_at: new Date().toISOString(),
            }),
            headers: {
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates',
            },
          }).catch(() => {});
        }
        setRows(relevant);
      } catch {
        /* red/API: no romper */
      }
    };

    poll();
    const iv = window.setInterval(poll, pollInterval);
    return () => { cancelled = true; window.clearInterval(iv); };
  }, [site, pollInterval]);

  // Inyecta los disclaimers globales en el stack (no vistos aún o con fecha futura).
  // Los disclaimers enviados por devcon SIEMPRE se muestran (sin filtro seen).
  useEffect(() => {
    const active = new Set<string>();
    for (const row of rows) {
      const key = `gd_${row.id}`;
      const isDevcon = row.sender === 'devcon';
      if (!isDevcon && seenRef.current.has(row.id)) continue;
      active.add(key);
      push({
        id: key,
        kind: row.kind,
        message: isDevcon ? `[DEVCON] ${row.message}` : row.message,
        dismissible: row.dismissible,
        expiresAt: row.expires_at,
        image: row.image ?? undefined,
        onClose: () => {
          if (!isDevcon) {
            seenRef.current.add(row.id);
            gdPersistSeen(site, seenRef.current);
          }
          remove(key);
        },
      });
    }
    return () => { for (const id of active) remove(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, push, remove, site]);

  return null;
}

export default DisclaimerStack;