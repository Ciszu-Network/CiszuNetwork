'use client';

/**
 * GoogleAnalytics — Google Analytics 4 (GA4) compartido para las 4 webs.
 *
 * Integra GA4 vía gtag.js SIN pisar el resto del ecosistema de analítica:
 *   - Cloudflare Web Analytics -> tráfico/marketing (pageviews, referrers) [ya activo]
 *   - PostHog                  -> eventos de producto [ya activo]
 *   - GA4 (este componente)    -> datos de audiencia + eventos de anuncios
 *                                (ad_impression / ad_click / ad_dismiss)
 *
 * Sin dependencias npm: carga el script oficial de gtag.js y usa la API global
 * window.gtag. Degradación segura: si falta NEXT_PUBLIC_GA4_MEASUREMENT_ID no
 * carga nada (patrón PostHogAnalytics/CloudflareGuard).
 *
 * Uso (en cada layout):
 *   <GoogleAnalytics app="ciszunetwork" />
 *
 * - app: nombre corto de la web, se añade a cada evento para separar las 4 webs
 *   en el mismo GA4 property (free tier).
 * - Eventos custom desde cualquier componente client:
 *   import { trackEvent } from '@ciszu/ui';
 *   trackEvent('ad_click', { ad_id: 'x', ad_type: 'intrusive', site: 'muzicmania' });
 */

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export interface GoogleAnalyticsProps {
  /** Nombre corto de la app (se añade como propiedad a cada evento) */
  app: string;
  /** Override del measurement ID (por defecto: NEXT_PUBLIC_GA4_MEASUREMENT_ID) */
  measurementId?: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Evento custom de GA4: no-op si gtag no está cargado o no hay ID */
export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', event, params ?? {});
}

function getMeasurementId(override?: string) {
  return override || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';
}

function GaTracker({ app, measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) Snippet oficial: define window.dataLayer + gtag (stub que encola) y carga
  //    gtag.js. Cuando el script carga, procesa lo encolado (js/config/eventos).
  useEffect(() => {
    const id = getMeasurementId(measurementId);
    if (!id) return;
    if (process.env.NODE_ENV === 'test') return;
    const w = window as Window & typeof globalThis;
    w.dataLayer = w.dataLayer || [];
    if (typeof w.gtag !== 'function') {
      w.gtag = function () {
        w.dataLayer?.push(arguments);
      };
    }
    const scriptSrc = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const s = document.createElement('script');
      s.src = scriptSrc;
      s.async = true;
      document.head.appendChild(s);
    }
    w.gtag('js', new Date());
    w.gtag('config', id, { send_page_view: false });
  }, [measurementId]);

  // 2) page_view manual en cada cambio de ruta (App Router no recarga)
  useEffect(() => {
    if (!getMeasurementId(measurementId)) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '');
    const w = window as Window & typeof globalThis;
    w.dataLayer = w.dataLayer || [];
    if (typeof w.gtag !== 'function') {
      w.gtag = function () {
        w.dataLayer?.push(arguments);
      };
    }
    w.gtag('event', 'page_view', { app, page_location: url, page_title: document.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, app, measurementId]);

  return null;
}

export default function GoogleAnalytics(props: GoogleAnalyticsProps) {
  return (
    <Suspense fallback={null}>
      <GaTracker {...props} />
    </Suspense>
  );
}