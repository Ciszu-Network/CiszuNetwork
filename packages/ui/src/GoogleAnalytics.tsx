'use client';

/**
 * GoogleAnalytics — tracking de Google Analytics 4 (GA4) en el cliente.
 *
 * Los SCRIPTS viven en GTM (GoogleScripts solo carga el contenedor). Este
 * componente solo hace el tracking client-side:
 *   - page_view manual por ruta (App Router no recarga).
 *   - trackEvent() para eventos custom (anuncios, etc.).
 *   - setGaUserId() para el User-ID de GA4 (identidad multiplataforma).
 *
 * Degradación segura: si no hay gtag/dataLayer definido (sin GTM) no hace nada.
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

/**
 * Define el User-ID de GA4 para la sesión (identidad cruzada de dispositivos).
 * Debe llamarse cuando el usuario está autenticado; null lo limpia (logout).
 * El comando `gtag('set', {'user_id': id})` va al dataLayer y el tag GA4 de GTM
 * lo aplica a todos los eventos posteriores.
 */
export function setGaUserId(userId: string | null) {
  if (typeof window === 'undefined') return;
  if (getCookieConsent() === 'rejected') return;
  const gtag = ensureGtag();
  if (userId) {
    gtag('set', { user_id: userId });
  } else {
    gtag('set', { user_id: undefined });
  }
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