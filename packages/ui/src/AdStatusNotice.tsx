'use client';

/**
 * AdStatusNotice — aviso DINÁMICO del estado real de los anuncios (AdSense).
 *
 * No es un texto fijo: comprueba la realidad y solo aparece cuando los anuncios
 * NO pueden mostrarse, explicando el motivo exacto:
 *
 *   1. Cookies de publicidad RECHAZADAS → los scripts de Google están
 *      desactivados por el guard de consentimiento: se avisa de eso.
 *   2. AdBlocker → NO se muestra aquí (lo gestiona AdBlockerGuard con su modal).
 *   3. Sin bloqueo y con consentimiento, pero AdSense no ha inyectado ningún
 *      anuncio tras el margen → la cuenta/webs siguen en revisión de Google
 *      (aprobación/tráfico): se muestra el estado con enlace de donación.
 *   4. Anuncios DETECTADOS (ins filled o iframe aswift visible) → se oculta:
 *      si existen, se muestran; no hay nada que decir.
 *
 * El usuario puede cerrar el aviso (X) y no vuelve en 24h (localStorage).
 * Re-evalúa una vez más a los ~20s por si las auto-ads entran tarde.
 */

import { useEffect, useState } from 'react';
import { getCookieConsent } from './cookieConsent';

const DISMISS_KEY = 'ciszu_adstatus_dismissed_v1';
const FIRST_CHECK_MS = 8_000;
const SECOND_CHECK_MS = 20_000;

type AdState = 'checking' | 'hidden' | 'no-consent' | 'blocked' | 'waiting';

function adsAreFilled(): boolean {
  try {
    if (document.querySelector('ins.adsbygoogle[data-ad-status="filled"]')) return true;
    return Array.from(document.querySelectorAll('iframe[id^="aswift"]')).some(
      (f) => (f as HTMLElement).offsetHeight > 20,
    );
  } catch {
    return false;
  }
}

export interface AdStatusNoticeProps {
  /** Enlace de donación mostrado mientras no hay anuncios. */
  donateHref?: string;
  accent?: string;
}

export default function AdStatusNotice({ donateHref, accent = '#22d3ee' }: AdStatusNoticeProps) {
  const [state, setState] = useState<AdState>('checking');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const d = Number(localStorage.getItem(DISMISS_KEY) ?? '0');
      if (d && Date.now() - d < 24 * 3600_000) return; // cerrado hace menos de 24h
    } catch {
      /* sin storage */
    }

    if (getCookieConsent() === 'rejected') {
      setState('no-consent');
      setVisible(true);
      return;
    }

    let cancelled = false;
    let secondTimer: ReturnType<typeof setTimeout> | null = null;

    // Sonda de red: si el script de AdSense está cortado es un adblocker y de
    // eso se encarga AdBlockerGuard (aquí no duplicamos aviso).
    fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3471969072198962', {
      cache: 'no-store',
    })
      .then(() => {
        if (cancelled) return;
        const firstTimer = setTimeout(() => {
          if (cancelled) return;
          if (adsAreFilled()) {
            setState('hidden');
            return;
          }
          setState('waiting');
          setVisible(true);
          secondTimer = setTimeout(() => {
            if (cancelled) return;
            if (adsAreFilled()) {
              setState('hidden');
              setVisible(false);
            }
          }, SECOND_CHECK_MS - FIRST_CHECK_MS);
        }, FIRST_CHECK_MS);
        return () => clearTimeout(firstTimer);
      })
      .catch(() => {
        if (!cancelled) setState('blocked');
      });

    return () => {
      cancelled = true;
      if (secondTimer) clearTimeout(secondTimer);
    };
  }, []);

  if (!visible || state === 'hidden' || state === 'blocked' || state === 'checking') return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* sin storage */
    }
    setVisible(false);
  };

  const text =
    state === 'no-consent'
      ? 'Los anuncios están desactivados porque rechazaste las cookies de publicidad. Si las activas, apoyas el mantenimiento del proyecto.'
      : 'Los anuncios todavía no se muestran: Google AdSense está revisando estas webs (aprobación y tráfico pendientes). Aparecerán automáticamente cuando Google los apruebe.';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-[700] w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-black/85 p-3.5 text-xs text-white/80 shadow-2xl backdrop-blur-md"
      style={{ borderColor: `${accent}66` }}
    >
      <div className="flex items-start gap-2">
        <span aria-hidden className="mt-0.5 text-sm">
          {state === 'no-consent' ? '🔕' : '⏳'}
        </span>
        <p className="flex-1 leading-snug">
          {text}
          {state === 'waiting' && donateHref && (
            <>
              {' '}
              <a href={donateHref} className="font-bold underline decoration-dotted" style={{ color: accent }}>
                Donar
              </a>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar aviso de anuncios"
          className="shrink-0 rounded-md px-1 text-white/50 transition hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
