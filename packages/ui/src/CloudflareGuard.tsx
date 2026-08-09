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
 */

import { useEffect, useState, useCallback, type ReactNode } from 'react';

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
}

type GuardState = 'loading' | 'verifying' | 'error';

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
}: CloudflareGuardProps) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<GuardState>('loading');
  const [statusText, setStatusText] = useState('');
  const [widgetId, setWidgetId] = useState<string | null>(null);

  // Si no hay siteKey configurada, el guard nunca bloquea (degradación segura)
  const enabled = Boolean(siteKey);

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
    if (document.querySelector(`script[src="${TURNSTILE_SCRIPT}"]`)) return;
    const s = document.createElement('script');
    s.src = TURNSTILE_SCRIPT;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, enabled]);

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
          setTimeout(() => setState('verified' as GuardState), 600);
        } else {
          setState('error');
          setStatusText(data.error || 'Error de verificación en el servidor');
        }
      } catch {
        setState('error');
        setStatusText('No se pudo conectar con el servidor de verificación');
      }
    },
    [verifyPath, storageKey]
  );

  const handleError = useCallback(() => {
    setState('error');
    setStatusText('Error al cargar el desafío de seguridad');
  }, []);

  const handleRetry = useCallback(() => {
    setState('loading');
    setStatusText('');
    if (window.turnstile?.reset) window.turnstile.reset();
  }, []);

  // Renderizar el widget dentro del div (efecto único tras cargar el script)
  useEffect(() => {
    if (!enabled || !mounted || state !== 'loading') return;
    const el = document.getElementById('cf-guard-widget');
    if (!el || typeof window === 'undefined') return;
    const tryRender = () => {
      if (!window.turnstile || !el) {
        setTimeout(tryRender, 200);
        return;
      }
      const id = window.turnstile.render(el, {
        sitekey: siteKey,
        theme: 'dark',
        language: 'es',
        callback: (token: string) => handleSuccess(token),
        'error-callback': () => handleError(),
        'expired-callback': () => {
          setState('loading');
          setStatusText('El token expiró, resuelve el desafío nuevamente');
        },
      });
      setWidgetId(id);
    };
    tryRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, enabled, state]);

  // Limpiar el widget al desmontar
  useEffect(() => {
    return () => {
      if (widgetId && window.turnstile?.remove) window.turnstile.remove(widgetId);
    };
  }, [widgetId]);

  if (!mounted) return null;
  if (!enabled || state === ('verified' as GuardState)) return <>{children}</>;

  const iconError = (
    <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
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
              <div id="cf-guard-widget" style={{ minHeight: '65px' }} />
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
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes cfspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
