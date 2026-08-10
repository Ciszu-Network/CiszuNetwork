'use client';

/**
 * PostHogAnalytics — analítica de producto compartida para las 4 webs de Ciszu Network.
 *
 * Integra PostHog (product analytics: eventos, embudos, retención, session replay,
 * feature flags, error tracking) SIN pisar el resto del ecosistema de monitoreo:
 *   - Cloudflare Web Analytics  -> tráfico/marketing (pageviews, referrers) [ya activo]
 *   - Vercel Speed Insights     -> Core Web Vitals (solo MuzicMania) [ya activo]
 *   - UptimeRobot               -> disponibilidad 24/7 [ya activo]
 *   - PostHog (este componente) -> eventos de producto + pageviews de SPA
 *
 * Sin dependencias npm: carga el script oficial de PostHog (array.js) y usa la API
 * global window.posthog. Degradación segura: si falta NEXT_PUBLIC_POSTHOG_KEY no
 * carga nada (patrón CloudflareGuard).
 *
 * Uso (en cada layout, junto a PwaRegister):
 *   <PostHogAnalytics app="ciszunetwork" />
 *
 * - app: nombre corto de la web ('ciszunetwork' | 'ciszukoantony' | 'muzicmania' |
 *   'ciszubot') — se envía como propiedad en cada evento para separar las 4 webs
 *   dentro del único proyecto que permite el free tier.
 * - capture_pageview: false — el trackeo de $pageview es manual (usePathname +
 *   useSearchParams) porque Next.js App Router no recarga la página en la navegación.
 * - Eventos custom (fase 2, desde cualquier componente client):
 *   import { captureEvent } from '@ciszu/ui';
 *   captureEvent('submit_score', { score: 12345, track_id: 'x' });
 */

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export interface PostHogAnalyticsProps {
  /** Nombre corto de la app (se añade como propiedad a cada evento) */
  app: string;
}

declare global {
  interface Window {
    posthog?: {
      init: (key: string, config: Record<string, unknown>) => void;
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify?: (id: string, properties?: Record<string, unknown>) => void;
      reset?: () => void;
    };
  }
}

/** Evento custom de producto (fase 2): no-op si PostHog no está cargado */
export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!window.posthog?.capture) return;
  window.posthog.capture(event, properties);
}

function getKey() {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
}

function getHost() {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
}

function PostHogTracker({ app }: PostHogAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  // 1) Cargar array.js una sola vez + init (polling: array.js es async)
  useEffect(() => {
    const key = getKey();
    if (!key) return;
    const host = getHost();
    const scriptSrc = `${host}/static/array.js`;
    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const s = document.createElement('script');
      s.src = scriptSrc;
      s.async = true;
      document.head.appendChild(s);
    }
    const tryInit = () => {
      if (!window.posthog?.init || initialized.current) return;
      initialized.current = true;
      window.posthog.init(key, {
        api_host: host,
        capture_pageview: false,
        persistence: 'localStorage+cookie',
      });
    };
    tryInit();
    const id = window.setInterval(tryInit, 300);
    return () => window.clearInterval(id);
  }, []);

  // 2) $pageview manual en cada cambio de ruta (SPA: App Router no recarga)
  useEffect(() => {
    if (!getKey()) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '');
    const fire = (): boolean => {
      if (!window.posthog?.capture) return false;
      window.posthog.capture('$pageview', { app, path: url });
      return true;
    };
    if (fire()) return;
    const id = window.setInterval(() => {
      if (fire()) window.clearInterval(id);
    }, 300);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, app]);

  return null;
}

/**
 * Suspense obligatorio: useSearchParams fuera de un boundary rompe el prerender
 * estático de Next 15 con "should be wrapped in a suspense boundary".
 */
export default function PostHogAnalytics(props: PostHogAnalyticsProps) {
  return (
    <Suspense fallback={null}>
      <PostHogTracker {...props} />
    </Suspense>
  );
}
