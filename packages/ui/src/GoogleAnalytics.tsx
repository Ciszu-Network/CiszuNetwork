'use client';

/**
 * GoogleAnalytics — tracking de Google Analytics 4 (GA4) en el cliente.
 *
 * Los SCRIPTS se renderizan de forma ESTÁTICA vía <GoogleScripts/> (server
 * component, en cada layout) para que los crawlers los vean (verificación de
 * AdSense/GA4). Este componente solo hace el tracking client-side:
 *   - page_view manual por ruta (App Router no recarga).
 *   - trackEvent() para eventos custom (anuncios, etc.).
 *
 * Degradación segura: si no hay gtag definido (sin GA4/GTM) no hace nada.
 *
 * Uso (en cada layout):
 *   <GoogleScripts />
 *   <GoogleAnalytics app="ciszunetwork" />
 */

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { COOKIE_CONSENT_EVENT, getCookieConsent } from './cookieConsent';

export interface GoogleAnalyticsProps {
  /** Nombre corto de la app (se añade como propiedad a cada evento) */
  app: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Asegura window.dataLayer + stub gtag (no-op si ya existe) */
function ensureGtag(): (...args: unknown[]) => void {
  const w = window as Window & typeof globalThis;
  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag !== 'function') {
    w.gtag = function () {
      w.dataLayer?.push(arguments);
    };
  }
  return w.gtag!;
}

/** Evento custom de GA4: no-op si gtag no está cargado o si el usuario rechazó cookies */
export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (getCookieConsent() === 'rejected') return;
  const w = window as Window & typeof globalThis;
  if (typeof w.gtag !== 'function') return;
  w.gtag('event', event, params ?? {});
}

function GaTracker({ app }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Reactivo al consentimiento: si el usuario rechaza en vivo, se deja de
  // trackear al instante (sin recargar).
  const [consentTick, setConsentTick] = useState(0);

  useEffect(() => {
    const onChange = () => setConsentTick((t) => t + 1);
    window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
  }, []);

  useEffect(() => {
    // Cookies rechazadas → Google Analytics desactivado (degradación segura).
    if (getCookieConsent() === 'rejected') return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '');
    const gtag = ensureGtag();
    gtag('event', 'page_view', { app, page_location: url, page_title: document.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, app, consentTick]);

  return null;
}

export default function GoogleAnalytics(props: GoogleAnalyticsProps) {
  return (
    <Suspense fallback={null}>
      <GaTracker {...props} />
    </Suspense>
  );
}