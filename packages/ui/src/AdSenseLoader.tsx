'use client';

/**
 * AdSenseLoader — carga el script de Google AdSense (adsbygoogle.js) compartido
 * para las 4 webs. Degradación segura: sin NEXT_PUBLIC_ADSENSE_CLIENT no hace nada.
 *
 * El script habilita el servicio de anuncios de AdSense (publisher ca-pub-...).
 * Las unidades de anuncio (slots) se sirven cuando el sitio pasa la revisión.
 *
 * Uso (en cada layout, junto a GoogleAnalytics/GoogleTagManager):
 *   <AdSenseLoader />
 *   // override por web:
 *   <AdSenseLoader client="ca-pub-3471969072198962" />
 */

import { useEffect } from 'react';

export interface AdSenseLoaderProps {
  /** Publisher ID de AdSense (ca-pub-XXXX). Por defecto: NEXT_PUBLIC_ADSENSE_CLIENT */
  client?: string;
}

function getClient(override?: string) {
  return override || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
}

export default function AdSenseLoader({ client }: AdSenseLoaderProps) {
  useEffect(() => {
    const c = getClient(client);
    if (!c) return;
    if (process.env.NODE_ENV === 'test') return;
    if (document.querySelector(`script[data-adsense="${c}"]`)) return;
    const s = document.createElement('script');
    s.async = true;
    s.dataset.adsense = c;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(c)}`;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }, [client]);

  return null;
}