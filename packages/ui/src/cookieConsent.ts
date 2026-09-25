'use client';

/**
 * cookieConsent — consentimiento de cookies compartido (4 webs de Ciszu Network).
 *
 * Modelo:
 *   - localStorage['cookies_accepted']:
 *       'true'  → ACEPTADO (cookies propias + terceros permitidas)
 *       'false' → RECHAZADO (se desactivan los servicios opcionales/externos)
 *       ausente → sin decidir (el banner debe aparecer)
 *   - getCookieConsent()  → 'accepted' | 'rejected' | null
 *   - setCookieConsent()  → persiste y emite el evento 'ciszu:cookies-changed'
 *   - clearCookieConsent()→ borra la decisión (reaparece el banner)
 *   - useCookieConsent()  → hook reactivo (componentes client)
 *   - COOKIE_CONSENT_GUARD_JS → script inline para layouts: define la variable
 *     global ANTES de que carguen los scripts de terceros y elimina del DOM los
 *     scripts marcados con data-cookie-consent="optional" si el usuario rechazó.
 *
 * Degradación segura: si el usuario rechaza, los scripts opcionales se eliminan
 * del DOM y los componentes client consultan getCookieConsent() → no-op. Ningún
 * servicio desactivado rompe la página (try/catch y no-ops en todo el flujo).
 */

import { useEffect, useState } from 'react';

export type CookieConsent = 'accepted' | 'rejected' | null;

/** Clave histórica (mismo formato que usaban los banners: 'true'/'false'). */
export const COOKIE_CONSENT_KEY = 'cookies_accepted';
/** Evento que se emite cuando cambia el consentimiento (persistido). */
export const COOKIE_CONSENT_EVENT = 'ciszu:cookies-changed';

declare global {
  interface Window {
    /** Definida por COOKIE_CONSENT_GUARD_JS antes de cargar scripts de terceros. */
    __ciszuCookieConsent?: CookieConsent;
  }
}

/** Lee el consentimiento persistido. Nunca lanza (localStorage puede fallar). */
export function getCookieConsent(): CookieConsent {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (v === 'true') return 'accepted';
    if (v === 'false') return 'rejected';
    return null;
  } catch {
    return null;
  }
}

/** Persiste el consentimiento y notifica a todos los componentes en vivo. */
export function setCookieConsent(consent: 'accepted' | 'rejected') {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, consent === 'accepted' ? 'true' : 'false');
  } catch {
    /* localStorage no disponible: el banner seguirá mostrándose */
  }
  window.__ciszuCookieConsent = consent;
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

/** Borra la decisión → el banner de cookies vuelve a aparecer. */
export function clearCookieConsent() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(COOKIE_CONSENT_KEY);
  } catch {
    /* noop */
  }
  window.__ciszuCookieConsent = null;
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

/** true si el usuario rechazó explícitamente las cookies opcionales. */
export function isCookieConsentRejected(): boolean {
  return getCookieConsent() === 'rejected';
}

/** true si el usuario aceptó explícitamente las cookies. */
export function isCookieConsentAccepted(): boolean {
  return getCookieConsent() === 'accepted';
}

/**
 * Hook reactivo: devuelve el consentimiento actual y se actualiza cuando
 * cambia (setCookieConsent / clearCookieConsent desde cualquier componente).
 */
export function useCookieConsent(): CookieConsent {
  const [consent, setConsent] = useState<CookieConsent>(() => getCookieConsent());

  useEffect(() => {
    const onChange = () => setConsent(getCookieConsent());
    window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
  }, []);

  return consent;
}

/**
 * Script de guardia para los layouts (head, lo primero que corre):
 *   1. Define window.__ciszuCookieConsent leyendo localStorage (try/catch).
 *   2. Si el usuario RECHAZÓ, elimina del DOM los scripts opcionales en cuanto
 *      se insertan (MutationObserver) y de nuevo en DOMContentLoaded. Un script
 *      async eliminado antes de ejecutarse nunca llega a correr.
 *
 * Qué se elimina:
 *   - INLINE de configuración: por el atributo data-cookie-consent="optional"
 *     (GTM/gtag config, beacon de Cloudflare…), porque no tienen src.
 *   - EXTERNOS de Google: por PATRÓN DE URL (AdSense, GTM/gtag y GA4). Su tag NO
 *     lleva data-cookie-consent a propósito: adsbygoogle.js inspecciona su
 *     propio tag y avisa en consola si ve atributos que no soporta.
 *
 * Incluirlo SIEMPRE ANTES de <GoogleScripts /> en cada layout:
 *   <script dangerouslySetInnerHTML={{ __html: COOKIE_CONSENT_GUARD_JS }} />
 */
export const COOKIE_CONSENT_GUARD_JS = `(function () {
  try {
    var c = null;
    try { c = window.localStorage.getItem('cookies_accepted'); } catch (e) {}
    window.__ciszuCookieConsent = c === 'true' ? 'accepted' : c === 'false' ? 'rejected' : null;
    if (window.__ciszuCookieConsent === 'rejected') {
      var SEL = [
        'script[data-cookie-consent="optional"]',
        'script[src*="pagead2.googlesyndication.com"]',
        'script[src*="googletagmanager.com"]',
        'script[src*="google-analytics.com"]',
      ];
      var kill = function () {
        for (var i = 0; i < SEL.length; i++) {
          document.querySelectorAll(SEL[i]).forEach(function (s) {
            if (s.parentNode) s.parentNode.removeChild(s);
          });
        }
      };
      // El observer solo actúa si el nodo añadido es un <script>: antes corría
      // querySelectorAll en TODA mutación del DOM (renders de React incluidos).
      var addedScript = function (records) {
        for (var i = 0; i < records.length; i++) {
          var nodes = records[i].addedNodes;
          for (var j = 0; j < nodes.length; j++) {
            if (nodes[j] && nodes[j].tagName === 'SCRIPT') return true;
          }
        }
        return false;
      };
      kill();
      document.addEventListener('DOMContentLoaded', kill);
      if (window.MutationObserver) {
        new MutationObserver(function (records) {
          if (addedScript(records)) kill();
        }).observe(document.documentElement, { childList: true, subtree: true });
      }
    }
  } catch (e) {}
})();`;