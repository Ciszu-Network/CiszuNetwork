/**
 * PwaRegister — componente "use client" que registra el service worker
 * de cada website en producción (offline shell + caché de assets).
 *
 * El SW vive en /sw.js de cada website (copiado por scripts/sync-pwa-assets.js).
 * En desarrollo no se registra para no interferir con HMR.
 */
'use client';

import { useEffect } from 'react';

const SW_PATH = '/sw.js';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register(SW_PATH).catch(() => {
        /* registro opcional — nunca romper la app */
      });
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
    }
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}