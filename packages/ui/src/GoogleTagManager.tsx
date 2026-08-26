'use client';

/**
 * GoogleTagManager — Google Tag Manager (GTM) compartido para las 4 webs.
 *
 * Carga el contenedor GTM (script oficial en <head>) SIN dependencias npm y con
 * degradación segura: si falta NEXT_PUBLIC_GTM_ID no hace nada.
 *
 * Uso (en cada layout, junto a GoogleAnalytics):
 *   <GoogleTagManager />
 *   // override por web:
 *   <GoogleTagManager gtmId="GTM-N7Q8DGX5" />
 *
 * - GTM y GA4 comparten window.dataLayer; ambos pueden convivir (GA4 gestionado
 *   por gtag.js directo + contenedor GTM para etiquetas/marcos extra).
 * - El noscript (iframe) se omite: Next.js es client-side y sin JS no ejecuta el
 *   contenedor de todos modos.
 */

import { useEffect } from 'react';

export interface GoogleTagManagerProps {
  /** Contenedor GTM (GTM-XXXX). Por defecto: NEXT_PUBLIC_GTM_ID */
  gtmId?: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function getGtmId(override?: string) {
  return override || process.env.NEXT_PUBLIC_GTM_ID || '';
}

export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  useEffect(() => {
    const id = getGtmId(gtmId);
    if (!id) return;
    if (process.env.NODE_ENV === 'test') return;
    const w = window as Window & typeof globalThis;
    w.dataLayer = w.dataLayer || [];
    const existing = document.querySelector(`script[data-gtm="${id}"]`);
    if (existing) return;
    // Evento de arranque oficial del snippet de GTM
    w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.async = true;
    s.dataset.gtm = id;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
  }, [gtmId]);

  return null;
}