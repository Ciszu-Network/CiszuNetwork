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
export function RedirectGuard({ disabled = false, debug = false }: { disabled?: boolean; debug?: boolean }) {
    const [pending, setPending] = useState<{
        href: string;
        host: string;
        targetBlank: boolean;
    } | null>(null);
    const [remaining, setRemaining] = useState(3);
    const pendingRef = useRef<typeof pending>(null);
    pendingRef.current = pending;

    const log = useCallback((...args: unknown[]) => {
        if (debug) console.log('[RedirectGuard]', ...args);
    }, [debug]);

    useEffect(() => {
        if (disabled) return;
        const onClick = (e: MouseEvent) => {
            if (pendingRef.current) return; // ya hay un aviso activo
            // Preferencia en vivo (permite desactivar/activar sin recargar).
            if (!getPref('redirectGuard', true)) return;
            const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
            if (!a || !a.href) return;

            // Omitir enlaces que son solo anclas (#) o javascript:
            if (a.href.startsWith('#') || a.href.startsWith('javascript:')) return;

            let targetHost = '';
            try {
                const url = new URL(a.href, location.href);
                targetHost = url.hostname.toLowerCase();
            } catch {
                return; // URL inválida
            }

            if (!targetHost) return;

            const currentHost = location.hostname.toLowerCase();

            // Determinar si es el mismo dominio (incluye subdominios del mismo dominio raíz)
            // Ej: "ciszunetwork.vercel.app" vs "ciszunetwork.vercel.app" (mismo)
            // Ej: "app.ciszunetwork.vercel.app" vs "ciszunetwork.vercel.app" (subdominio)
            // Ej: "ciszukoantony.vercel.app" vs "ciszunetwork.vercel.app" (diferente)
            const isSameDomain =
                targetHost === currentHost ||
                targetHost.endsWith('.' + currentHost) ||
                currentHost.endsWith('.' + targetHost);

            if (isSameDomain) {
                log('Same domain - skip', { targetHost, currentHost });
                return; // mismo dominio o subdominio
            }

            const targetBlank = a.target === '_blank';

            log('External link detected - showing guard', { href: a.href, host: targetHost, targetBlank, currentHost });
            e.preventDefault();
            e.stopPropagation();
            setPending({ href: a.href, host: targetHost, targetBlank });
        };
        document.addEventListener('click', onClick, true);
        log('RedirectGuard listener attached');
        return () => {
            document.removeEventListener('click', onClick, true);
            log('RedirectGuard listener removed');
        };
    }, [disabled, log]);

    useEffect(() => {
        if (!pending) return;
        setRemaining(3);
        const iv = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
        const t = window.setTimeout(() => {
            if (pending.targetBlank) {
                window.open(pending.href, '_blank', 'noopener,noreferrer');
            } else {
                window.location.href = pending.href;
            }
            setPending(null);
        }, 3000);
        return () => {
            window.clearInterval(iv);
            window.clearTimeout(t);
        };
    }, [pending]);

    const cancel = useCallback(() => setPending(null), []);

    const proceedNow = useCallback(() => {
        if (!pending) return;
        if (pending.targetBlank) {
            window.open(pending.href, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = pending.href;
        }
        setPending(null);
    }, [pending]);

    if (!pending) return null;
    return createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0a0a0a] border border-blue-500/30 rounded-[2rem] max-w-sm w-full shadow-2xl relative p-8 text-center">
                {/* Icono de advertencia */}
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <svg
                        className="w-7 h-7 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                </div>

                {/* Título */}
                <h3 className="text-lg font-bold text-white uppercase mb-2">REDIRECCIONAMIENTO</h3>

                {/* Mensaje */}
                <p className="text-sm text-gray-400 mb-2">
                    Vas a salir hacia{' '}
                    <span className="text-blue-400 font-bold">{pending.host}</span>
                    {pending.targetBlank ? ' en nueva pestaña' : ''} en{' '}
                    <span className="text-blue-400 font-bold">{remaining}</span> segundos
                </p>

                {/* URL */}
                <div className="mb-6 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-blue-300 font-mono truncate" title={pending.href}>
                        {pending.href}
                    </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                    <button
                        onClick={cancel}
                        className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-2xl text-sm font-bold uppercase text-white hover:bg-white/15 transition-all cursor-pointer"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={proceedNow}
                        className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-sm font-bold uppercase text-white hover:scale-105 transition-all cursor-pointer"
                    >
                        CONTINUAR ({remaining})
                    </button>
                </div>
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

export function ActivityGuardProvider({
    children,
    disabled = false,
}: {
    children: React.ReactNode;
    disabled?: boolean;
}) {
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
                const sameDoc =
                    new URL(href, location.href).origin === location.origin &&
                    new URL(href).pathname === location.pathname &&
                    new URL(href).hash;
                if (a.hash && sameDoc) return;
            } catch {
                /* sigue */
            }
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
            if (active && getPref('activityGuard', true)) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', onBefore);
        return () => window.removeEventListener('beforeunload', onBefore);
    }, [active, disabled]);

    const go = useCallback(() => {
        if (pendingNav) {
            const href = pendingNav;
            setPendingNav(null);
            window.location.href = href;
        }
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
                    <div
                        className="fixed left-1/2 top-4 z-[1500] -translate-x-1/2"
                        style={{ animation: 'ciszu-ad-rise .25s ease-out' }}
                    >
                        <style>{`@keyframes ciszu-ad-rise{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
                        <div className="flex w-[min(92vw,440px)] items-center gap-3 rounded-xl border border-red-400/50 bg-[#1a0b0f]/95 px-4 py-3 shadow-xl backdrop-blur">
                            <div className="h-10 w-1 shrink-0 rounded-full bg-red-500" />
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-red-200">
                                    Acción no recuperable en curso
                                </p>
                                <p className="mt-0.5 text-xs text-red-300/80">
                                    Si te vas perderás el progreso o la recompensa.
                                </p>
                            </div>
                            <div className="ml-auto flex shrink-0 gap-2">
                                <button
                                    onClick={stay}
                                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10"
                                >
                                    Quedarme
                                </button>
                                <button
                                    onClick={go}
                                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-red-400"
                                >
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
