'use client';

/**
 * BehaviorGuards — Sistemas de aviso globales (TODAS las webs de Ciszu Network).
 *
 * 1) RedirectGuard (aviso AZUL): al hacer clic en un hipervínculo que sale a OTRA
 *    website (dominio distinto; NO aplica al mismo dominio), muestra un aviso
 *    "Redirigiendo a <host> en 3s..." con opción de CANCELAR. Al abrir el enlace,
 *    termina el aviso. Preferencia `redirectGuard` (default activo).
 *
 * 2) ActivityGuard (aviso ROJO): si hay una acción NO RECUPERABLE en curso (jugar
 *    un nivel, registro, edición de perfil, anuncio obligatorio...) y el usuario
 *    intenta navegar/cerrar, muestra un aviso rojo con 2 opciones "Seguir" /
 *    "Quedarme" (sin contador). Pausa la actividad (onPause). Preferencia
 *    `activityGuard` (default activo).
 *
 * Preferencias locales en `localStorage['ciszu_preferences']` (mismo store que el
 * tema/idioma). Ambas se pueden desactivar en ajustes/preferencias.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PREF_KEY = 'ciszu_preferences';

function getPref(key: string, def: boolean): boolean {
  if (typeof window === 'undefined') return def;
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return def;
    const p = JSON.parse(raw);
    return typeof p[key] === 'boolean' ? p[key] : def;
  } catch {
    return def;
  }
}

// ================== 1) RedirectGuard ==================
export function RedirectGuard({ disabled = false }: { disabled?: boolean }) {
  const [pending, setPending] = useState<{ href: string; host: string } | null>(null);
  const [remaining, setRemaining] = useState(3);
  const pendingRef = useRef<typeof pending>(null);
  pendingRef.current = pending;

  useEffect(() => {
    if (disabled) return;
    const onClick = (e: MouseEvent) => {
      if (pendingRef.current) return; // ya hay un aviso activo
      // Preferencia en vivo (permite desactivar/activar sin recargar).
      if (!getPref('redirectGuard', true)) return;
      const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
      if (!a || !a.href) return;
      if (a.target === '_blank') return; // nueva pestaña no interrumpe
      let host = '';
      try { host = new URL(a.href, location.href).host; } catch { return; }
      if (!host || host === location.host) return; // mismo dominio
      e.preventDefault();
      setPending({ href: a.href, host });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [disabled]);

  useEffect(() => {
    if (!pending) return;
    setRemaining(3);
    const iv = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    const t = window.setTimeout(() => { window.location.href = pending.href; }, 3000);
    return () => { window.clearInterval(iv); window.clearTimeout(t); };
  }, [pending]);

  const cancel = useCallback(() => setPending(null), []);

  if (!pending) return null;
  return createPortal(
    <div className="fixed left-1/2 top-4 z-[1500] -translate-x-1/2" style={{ animation: 'ciszu-ad-rise .25s ease-out' }}>
      <style>{`@keyframes ciszu-ad-rise{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
      <div className="flex items-center gap-3 rounded-xl border border-blue-400/40 bg-[#0b1220]/95 px-4 py-3 shadow-xl backdrop-blur">
        <div className="h-9 w-1 shrink-0 rounded-full bg-blue-400" />
        <div>
          <p className="text-sm font-semibold text-blue-200">Redirigiendo a <span className="text-white">{pending.host}</span>...</p>
          <p className="text-xs text-blue-300/70">Cancelar en {remaining}s · los enlaces externos son de terceros</p>
        </div>
        <button onClick={cancel} className="shrink-0 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-blue-400">
          Cancelar
        </button>
      </div>
    </div>,
    document.body
  );
}

// ================== 2) ActivityGuard ==================
interface ActivityGuardCtx {
  begin: (key: string, onPause?: () => void) => void;
  end: (key: string) => void;
  active: boolean;
}
const ActivityContext = createContext<ActivityGuardCtx | null>(null);

export function useActivityGuard(): ActivityGuardCtx {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivityGuard debe usarse dentro de <ActivityGuardProvider>');
  return ctx;
}

export function ActivityGuardProvider({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  const [active, setActive] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const activities = useRef<Map<string, { onPause?: () => void }>>(new Map());

  const begin = useCallback((key: string, onPause?: () => void) => {
    activities.current.set(key, { onPause });
    setActive(true);
  }, []);

  const end = useCallback((key: string) => {
    activities.current.delete(key);
    setActive(activities.current.size > 0);
  }, []);

  const pauseAll = useCallback(() => {
    activities.current.forEach((x) => x.onPause?.());
  }, []);

  // Intercepta clics en enlaces cuando hay una actividad protegida.
  useEffect(() => {
    if (disabled) return;
    const onClick = (e: MouseEvent) => {
      if (!active || pendingNav) return;
      // Preferencia en vivo (permite desactivar/activar sin recargar).
      if (!getPref('activityGuard', true)) return;
      const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
      if (!a || !a.href) return;
      const href = a.href;
      if (a.target === '_blank') return;
      try {
        const sameDoc = new URL(href, location.href).origin === location.origin && new URL(href).pathname === location.pathname && new URL(href).hash;
        if (a.hash && sameDoc) return;
      } catch { /* sigue */ }
      e.preventDefault();
      pauseAll();
      setPendingNav(href);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [active, pendingNav, disabled, pauseAll]);

  // beforeunload nativo (refresh/cerrar): aviso del navegador como respaldo.
  useEffect(() => {
    if (disabled) return;
    const onBefore = (e: BeforeUnloadEvent) => {
      if (active && getPref('activityGuard', true)) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, [active, disabled]);

  const go = useCallback(() => {
    if (pendingNav) { const href = pendingNav; setPendingNav(null); window.location.href = href; }
  }, [pendingNav]);

  const stay = useCallback(() => {
    setPendingNav(null);
  }, []);

  const value = { begin, end, active };

  return (
    <ActivityContext.Provider value={value}>
      {children}
      {pendingNav &&
        createPortal(
          <div className="fixed left-1/2 top-4 z-[1500] -translate-x-1/2" style={{ animation: 'ciszu-ad-rise .25s ease-out' }}>
            <style>{`@keyframes ciszu-ad-rise{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
            <div className="flex w-[min(92vw,440px)] items-center gap-3 rounded-xl border border-red-400/50 bg-[#1a0b0f]/95 px-4 py-3 shadow-xl backdrop-blur">
              <div className="h-10 w-1 shrink-0 rounded-full bg-red-500" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-red-200">Acción no recuperable en curso</p>
                <p className="mt-0.5 text-xs text-red-300/80">Si te vas perderás el progreso o la recompensa.</p>
              </div>
              <div className="ml-auto flex shrink-0 gap-2">
                <button onClick={stay} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10">
                  Quedarme
                </button>
                <button onClick={go} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-red-400">
                  Seguir
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ActivityContext.Provider>
  );
}