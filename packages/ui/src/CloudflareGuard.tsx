'use client';

/**
 * CloudflareGuard — guard de acceso con Turnstile para las webs de Ciszu Network.
 *
 * Compartido vía @ciszu/ui. Sin dependencias npm: carga la API global de Turnstile
 * (challenges.cloudflare.com/turnstile/v0/api.js) y renderiza el widget en un div.
 * CSS 100% inline/autocontenido (lección v3: el scanner de Tailwind de cada app NO
 * genera utilidades usadas solo dentro de packages/ui).
 *
 * Uso (en cada layout):
 *   <CloudflareGuard siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
 *     logo="<url isotipo>" title="Ciszu Network" accent="#22d3ee"
 *     storageKey="cf_verified_ciszu">  {children}  </CloudflareGuard>
 *
 * - La verificación server-side se hace en POST <verifyPath> de cada app
 *   (patrón: projects/muzicmania/website/src/app/api/verify-turnstile/route.ts).
 * - Si falta siteKey (env no configurada), NO bloquea: renderiza children directo
 *   (degradación segura; no romper producción).
 * - Persistencia por sesión: sessionStorage[storageKey] = 'true'.
 *
 * Fix 11 ago 2026 (bugs reportados por el usuario):
 *   1. Al fallar el widget, el iframe de error de Cloudflare quedaba montado y
 *      desbordaba el contenedor (widget "a la derecha", CSS roto, icono de retry
 *      gigante). Ahora el contenedor es de ancho FIJO (300px, el del iframe),
 *      con overflow hidden + centrado, y TODO error limpia el iframe del DOM
 *      (turnstile.remove + innerHTML='') antes de mostrar el estado.
 *   2. Auto-retry con backoff (3s/8s/20s, hasta 3 intentos) en error-callback:
 *      el rate limiter del plan free de Turnstile (por IP, "ratelimited: global")
 *      hace fallar el reto si el visitante resolvió otro hace poco en otra web;
 *      con el retry el widget se recrea fresco y pasa solo, sin que el visitante
 *      toque nada. Después del 3er intento muestra el botón REINTENTAR manual.
 *   3. expired-callback ahora recrea el widget (antes dejaba el iframe caducado
 *      pegado, que es lo que daba sensación de "se cancela solo").
 *   4. El estado 'verifying' mantiene el contenedor vacío (sin iframe fantasma).
 *
 * Fix 12 ago 2026 (rediseño visual — pedido del usuario):
 *   5. Fondo = la PÁGINA real desenfocada (blur), NO negro sólido. Los children
 *      se renderizan en flujo normal DETRÁS del overlay (el navegador los pinta
 *      desde el primer HTML → FCP/LCP reales, logos y hero visibles borrosos).
 *   6. Interacción 100% bloqueada mientras el gate está activo: `inert` sobre el
 *      wrapper de children (sin foco/clic/selección/atajos), pointer-events
 *      none, blur del body (sin scroll), y listeners que cancelan atajos de
 *      copia/impresión/selección y el menú contextual.
 *   7. Salida con animación simple: al verificar (leaving) el overlay hace un
 *      fundido de 0.6s (opacity → 0) y los bloqueos se sueltan; luego se desmonta
 *      y queda la página ya cargada. No hay recarga ni cambio de escena.
 *   8. El overlay SIEMPRE por encima del layout (z-index 9999, position fixed,
 *      inset 0): tapa header/footer/botones y cualquier elemento de la UI.
 *   9. Una vez verificado, la sesión es suficiente: sessionStorage + estado
 *      interno permite navegar entre páginas sin re-preguntar (hasta cerrar el
 *      navegador). Cada web/app configura su propia "escena" (logo/título/accent).
 *
 * ⚠️ El rate lining entre webs (verificar en ciszunetwork y luego fallar en
 * ciszubot) es un límite del plan free de Turnstile por IP — no se elimina con
 * código; el auto-retry + backoff lo mitiga (espera y reintenta). Documentado
 * en CLOUDFLARE_SYSTEM.md.
 */

import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react';

export interface CloudflareGuardProps {
  children: ReactNode;
  /** NEXT_PUBLIC_TURNSTILE_SITE_KEY — si falta, el guard no bloquea */
  siteKey?: string;
  /** URL del isotipo a mostrar en la pantalla de verificación */
  logo?: string;
  /** Nombre de la marca (título) */
  title?: string;
  /** Subtítulo bajo el título */
  subtitle?: string;
  /** Color neón del acento (hex) */
  accent?: string;
  /** Clave de sesión única por app (p.ej. 'cf_verified_ciszu') */
  storageKey?: string;
  /** Ruta POST de verificación (default '/api/verify-turnstile') */
  verifyPath?: string;
  /** Delays de reintento automático en ms (testeable; default 3s/8s/20s) */
  retryDelays?: number[];
  /** Callback al completar la verificación (antes de mostrar children) */
  onVerified?: () => void;
  /** Si true, el guard se desactiva y renderiza children directamente (p.ej. apps nativas Tauri) */
  disabled?: boolean;
}

type GuardState = 'loading' | 'verifying' | 'error';

/** Backoff entre reintentos automáticos del widget (ms) */
const RETRY_DELAYS = [3000, 8000, 20000];
/** Ancho del iframe de Turnstile (fijo — el contenedor no debe dejar que desborde) */
const WIDGET_WIDTH = 300;

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const TURNSTILE_GLOBAL = 'turnstile';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset?: (id?: string) => void;
      remove?: (id?: string) => void;
    };
  }
}

export default function CloudflareGuard({
  children,
  siteKey,
  logo,
  title = 'Ciszu Network',
  subtitle = 'Security • Cloudflare',
  accent = '#22d3ee',
  storageKey = 'cf_verified',
  verifyPath = '/api/verify-turnstile',
  retryDelays = RETRY_DELAYS,
  onVerified,
  disabled = false,
}: CloudflareGuardProps) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<GuardState>('loading');
  const [statusText, setStatusText] = useState('');
  const retryCountRef = useRef(0);
  const widgetIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renderSeqRef = useRef(0);
  const [regen, setRegen] = useState(0);
  const [leaving, setLeaving] = useState(false);

  // El guard solo se activa en producción y con siteKey real configurada:
  // - sin siteKey → degradación segura (nunca bloquea).
  // - en desarrollo local (pnpm <app>:dev, NODE_ENV=development) → no bloquea,
  //   porque Turnstile en localhost tarda/no carga y dejaría la pantalla
  //   bloqueada para siempre (overlay). Para probar el guard localmente de forma
  //   puntual, arrancar con NEXT_PUBLIC_TURNSTILE_FORCE=1.
  // - con host local (localhost / 127.0.0.1) → tampoco bloquea, cubriendo
  //   también un build de producción servido localmente (pnpm start, next start),
  //   donde NODE_ENV es 'production' pero el target es un dev box local.
  // - salida de emergencia: añadir ?cf_bypass=1 a la URL fuerza el skip (debug).
  const isDev = process.env.NODE_ENV === 'development';
  const forceInDev = process.env.NEXT_PUBLIC_TURNSTILE_FORCE === '1';
  // Host local (localhost/127.0.0.1/::1): nunca bloquear, sea NODE_ENV dev, start o un
  // túnel de debug. En tests (happy-dom) el hostname es 'localhost' pero es un entorno
  // simulado, no un dev-box real: ahí NO aplicamos el check para que los tests sigan
  // ejerciendo el flujo completo de verificación.
  const isLocalHost =
    process.env.NODE_ENV !== 'test' &&
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1', '::1', '[::1]'].includes(window.location.hostname);
  // Salida de emergencia de debug: ?cf_bypass=1 fuerza el skip (sessionStorage no
  // se toca; solo dura en esa URL). Útil si Turnstile falla en un entorno controlado.
  const urlBypass = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('cf_bypass') === '1';
  const enabled = Boolean(siteKey) && !urlBypass && !isLocalHost && (!isDev || forceInDev) && !disabled;

  useEffect(() => {
    setMounted(true);
    if (!enabled) return;
    const verified = sessionStorage.getItem(storageKey);
    if (verified === 'true') {
      setState('verified' as GuardState);
      setStatusText('');
    } else {
      setState('loading');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar el script de Turnstile (una sola vez por página)
  useEffect(() => {
    if (!enabled || !mounted || state === ('verified' as GuardState)) return;
    // En entorno de test (happy-dom/vitest) no cargar scripts externos
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    if (document.querySelector(`script[src="${TURNSTILE_SCRIPT}"]`)) return;
    // Preload del script: reduce la latencia del widget (el guard bloquea la página)
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'script';
    preload.href = TURNSTILE_SCRIPT;
    document.head.appendChild(preload);
    const s = document.createElement('script');
    s.src = TURNSTILE_SCRIPT;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, enabled, regen]);

  /** Quita el widget del DOM por completo (limpieza total del iframe) */
  const removeWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile?.remove) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // ignore
      }
    }
    widgetIdRef.current = null;
    const el = document.getElementById('cf-guard-widget');
    if (el) el.innerHTML = '';
  }, []);

  /** Limpia también el script de Turnstile del DOM para forzar recarga limpia
   *  (evita listeners huérfanos del script api.js tras expiración/retry). */
  const removeTurnstileScript = useCallback(() => {
    const existing = document.querySelector(`script[src="${TURNSTILE_SCRIPT}"]`);
    if (existing) {
      try {
        existing.remove();
      } catch { /* ignore */ }
    }
    // También limpiar preload si existe
    const preload = document.querySelector(`link[href="${TURNSTILE_SCRIPT}"][rel="preload"]`);
    if (preload) preload.remove();
  }, []);

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      removeWidget();
    };
  }, [removeWidget]);

  const handleSuccess = useCallback(
    async (token: string) => {
      setState('verifying');
      setStatusText('Validando token de seguridad…');
      try {
        const res = await fetch(verifyPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.success) {
          setStatusText('Verificación exitosa');
          sessionStorage.setItem(storageKey, 'true');
          if (onVerified) onVerified();
          // Animación de salida: fundido del overlay y luego desmontar (children detrás)
          setLeaving(true);
          timeoutRef.current = setTimeout(() => setState('verified' as GuardState), 600);
        } else {
          removeWidget();
          setState('error');
          setStatusText(data.error || 'Error de verificación en el servidor');
        }
      } catch {
        removeWidget();
        setState('error');
        setStatusText('No se pudo conectar con el servidor de verificación');
      }
    },
    [verifyPath, storageKey, removeWidget, onVerified]
  );

  const startAutoRetry = useCallback(() => {
    const attempt = retryCountRef.current;
    if (attempt < retryDelays.length) {
      retryCountRef.current = attempt + 1;
      setStatusText(`Reintentando verificación… (${attempt + 1}/${retryDelays.length})`);
      timeoutRef.current = setTimeout(() => {
        removeWidget();
        setRegen((n) => n + 1);
      }, retryDelays[attempt]);
    } else {
      removeWidget();
      // Agotados reintentos automáticos: limpiar script para que el retry manual cargue fresco
      removeTurnstileScript();
      setState('error');
      setStatusText('El desafío falló varias veces. Revisa tu red y reintenta');
    }
  }, [removeWidget, removeTurnstileScript, retryDelays]);

  const handleError = useCallback(() => {
    startAutoRetry();
  }, [startAutoRetry]);

  const handleRetry = useCallback(() => {
    retryCountRef.current = 0;
    removeWidget();
    removeTurnstileScript();
    setState('loading');
    setStatusText('');
  }, [removeWidget, removeTurnstileScript]);

  // Renderizar el widget dentro del div (efecto único tras cargar el script)
  useEffect(() => {
    if (!enabled || !mounted || state !== 'loading') return;
    const el = document.getElementById('cf-guard-widget');
    if (!el || typeof window === 'undefined') return;
    const seq = ++renderSeqRef.current;
    const tryRender = () => {
      // Si cambió el estado mientras esperábamos el script, ya no renderizamos
      if (seq !== renderSeqRef.current) return;
      if (!window.turnstile || !el) {
        timeoutRef.current = setTimeout(tryRender, 200);
        return;
      }
      el.innerHTML = '';
      const id = window.turnstile.render(el, {
        sitekey: siteKey,
        theme: 'dark',
        language: 'es',
        callback: (token: string) => handleSuccess(token),
        'error-callback': () => handleError(),
        'expired-callback': () => {
          // El iframe expiró: recrear el widget limpio para que el visitante
          // no se quede con un reto caducado pegado ("se cancela solo").
          removeWidget();
          removeTurnstileScript();
          setStatusText('El reto expiró, generando uno nuevo…');
          timeoutRef.current = setTimeout(() => setRegen((n) => n + 1), 800);
        },
      });
      widgetIdRef.current = id;
    };
    tryRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, enabled, state, regen]);

  // Mientras el guard está visible (antes de verificar): bloquear TODA interacción
  // con lo que hay detrás — scroll del body, atajos de copia/impresión/navegación
  // y el menú contextual. Al completarse (leaving) se sueltan los bloqueos.
  useEffect(() => {
    if (!enabled || !mounted || state === ('verified' as GuardState) || leaving) return;

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const blockKeys = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (
        ctrl && ['c', 'x', 'p', 's', 'f', 'u', 'a'].includes(key) ||
        e.key === 'ContextMenu'
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const blockContext = (e: Event) => e.preventDefault();
    const blockCopy = (e: ClipboardEvent) => e.preventDefault();

    document.addEventListener('keydown', blockKeys, true);
    document.addEventListener('contextmenu', blockContext, true);
    document.addEventListener('copy', blockCopy, true);
    document.addEventListener('cut', blockCopy, true);
    document.addEventListener('selectstart', blockContext, true);

    return () => {
      document.documentElement.style.overflow = prevOverflow;
      document.removeEventListener('keydown', blockKeys, true);
      document.removeEventListener('contextmenu', blockContext, true);
      document.removeEventListener('copy', blockCopy, true);
      document.removeEventListener('cut', blockCopy, true);
      document.removeEventListener('selectstart', blockContext, true);
    };
  }, [enabled, mounted, state, leaving]);

  if (!mounted || !enabled || state === ('verified' as GuardState)) return <>{children}</>;

  const iconError = (
    <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );

  return (
    <>
      {/* El contenido de la página se renderiza en flujo normal, DETRÁS del gate:
          el navegador lo pinta desde el primer HTML (FCP/LCP reales; logos, hero y
          layout cargan y se ven desenfocados bajo el blur). inline-block no: queda en
          su layout real y solo se bloquea su interacción con inert + pointer-events.
          inert (React 19 lo soporta como prop) elimina foco/clic/selección/atajo. */}
      <div aria-hidden={!leaving} inert={!leaving} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>
      {/* Overlay del gate: SIEMPRE encima (z-index 9999), cubre viewport completo
          con blur del contenido detrás + humo oscuro translúcido. Al verificar
          (leaving) hace fundido y se desmonta, dejando ver la página ya cargada. */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(2, 4, 12, 0.55)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'inherit',
          opacity: leaving ? 0 : 1,
          pointerEvents: leaving ? 'none' : 'auto',
          transition: 'opacity 0.6s ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '100vw', padding: '0 1rem' }}>
          {logo && (
            <img
              src={logo}
              alt={title}
              style={{
                width: '6rem',
                height: '6rem',
                objectFit: 'contain',
                filter: `drop-shadow(0 0 30px ${accent}cc)`,
              }}
            />
          )}
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                color: accent,
                fontWeight: 900,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontSize: '1.25rem',
                margin: 0,
                textShadow: `0 0 10px ${accent}cc`,
              }}
            >
              {state === 'error' ? 'Error de Verificación' : 'Verificando Conexión Segura'}
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0.5rem 0 0' }}>
              {subtitle}
            </p>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '1rem',
              borderRadius: '1rem',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {state === 'error' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '3rem', height: '3rem', color: '#f87171' }}>{iconError}</div>
                <p style={{ color: '#f87171', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', maxWidth: '240px', textAlign: 'center', margin: 0 }}>
                  {statusText}
                </p>
                <button
                  onClick={handleRetry}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: accent,
                    color: '#000',
                    fontWeight: 900,
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.625rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                  }}
                >
                  REINTENTAR
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  id="cf-guard-widget"
                  style={{
                    width: WIDGET_WIDTH,
                    maxWidth: `min(${WIDGET_WIDTH}px, calc(100vw - 3rem))`,
                    minHeight: '65px',
                    display: 'flex',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                />
                {state === 'verifying' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                    <div
                      style={{
                        width: '1rem',
                        height: '1rem',
                        border: `2px solid ${accent}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'cfspin 1s linear infinite',
                      }}
                    />
                    <span style={{ color: '#9ca3af', fontSize: '0.5625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                      {statusText}
                    </span>
                  </div>
                )}
                {state === 'loading' && statusText && (
                  <p style={{ color: '#9ca3af', fontSize: '0.5625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '0.75rem', textAlign: 'center' }}>
                    {statusText}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <style>{`@keyframes cfspin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}