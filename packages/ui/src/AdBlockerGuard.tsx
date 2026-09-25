'use client';

/**
 * AdBlockerGuard — detección de ADBLOCKERS y concienciación (todas las webs).
 *
 * Detecta si el usuario usa un bloqueador de anuncios y, si es CLARO, muestra
 * un modal CENTRAL bloqueando la página por detrás (estilo guard, blur +
 * estética de la web), SIN botón X.
 *
 * Flujo:
 *   1. Modal de bloqueo: explica qué es un adblocker, cómo desactivarlo, por qué
 *      debería desactivarlo (autopatrocinio, monetización y mantenimiento de la
 *      página), SIEMPRE desde el respeto y pidiendo por favor.
 *      Botones: "Desactivar bloqueador" | "Seguir usando bloqueador".
 *   2. "Desactivar bloqueador": modal explicativo + contador CIRCULAR de 15s que
 *      al llegar a 0 recarga la página. Botón "Actualizar ahora" + "Volver".
 *   3. "Seguir usando bloqueador": la elección se guarda LOCALMENTE (localStorage,
 *      expira a las 24h). Modal con contador de 5s, botón DONAR y recordatorio.
 *      Al llegar a 0 se desbloquea la página.
 *   4. Si el usuario intenta CLIC en un anuncio con adblocker → error y vuelve a
 *      aparecer el modal.
 *   5. La elección local se borra cada 12h (concienciación) y ADEMÁS se re-evalúa
 *      en cada RECARGA MANUAL (F5): la mayoría de adblockers se activan/desactivan
 *      recargando la página, así que el guard aprovecha ese momento para volver a
 *      aparecer si el bloqueo sigue activo (punto D). No se guarda en base de datos.
 *      EXCEPCIÓN: las recargas VOLUNTARIAS disparadas por una acción de la UI
 *      (cambiar tema/idioma, cookies…) NO re-evalúan ni vuelven a mostrar el guard
 *      (`markVoluntaryReload()` de appReload.ts), para no molestar al usuario que
 *      él mismo pidió la recarga.
 *
 * Detección (punto 11): TRES señales, se avisa si CUALQUIERA confirma bloqueo y
 * nunca sin evidencia (una red lenta NO debe mostrar el modal):
 *   1. BAITS con clases de anuncio reales (las mismas que usan las listas de
 *      AdGuard/uBlock/EasyList): los filtros cosméticos las ocultan. Se muestrea
 *      varias veces porque las extensiones MV3 aplican el CSS DESPUÉS de cargar.
 *   2. Sonda de RED (fetch sin caché al dominio de AdSense): los bloqueadores de
 *      red (DNS tipo NextDNS/Pi-hole/AdGuard DNS, o extensiones que cortan
 *      peticiones) no ocultan nada y, si el script de AdSense ya está en la
 *      caché HTTP, Chrome lo sirve desde disco y `window.adsbygoogle` acaba
 *      definido → el guard se quedaba en silencio. La sonda con `cache:
 *      'no-store'` y query único no se puede servir de caché.
 *   3. API de AdSense: el tag SSR está en el DOM y `window.adsbygoogle` sigue
 *      sin definirse tras un margen amplio → la petición fue cortada.
 * NO se inyectan scripts de AdSense (la sonda es un fetch): eso daba falsos
 * positivos por red lenta y ejecutaba AdSense dos veces.
 *
 * Bloqueo (punto 12): el overlay bloquea scroll/contexto/copia SOLO mientras el
 * modal está visible; al elegir o al terminar el contador se restaura el
 * overflow SIEMPRE (incluso si el componente se desmonta). Sin setState anidado
 * en updaters (causa del bloqueo falso tras la acción).
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { getCookieConsent } from './cookieConsent';
import { consumeVoluntaryReload } from './appReload';

export interface AdBlockerGuardProps {
  children: ReactNode;
  site: string;
  logo?: string;
  title?: string;
  accent?: string;
  accentAlt?: string;
  donateHref?: string;
}

declare global {
  interface Window {
    /** API que define el script de AdSense; ausente si el script fue bloqueado. */
    adsbygoogle?: unknown[];
  }
}

const SITE_DONATE_HREF: Record<string, string> = {
  ciszu: 'https://ciszunetwork.vercel.app/donate',
  ciszunetwork: 'https://ciszunetwork.vercel.app/donate',
  ciszubot: 'https://ciszubot.vercel.app/donate',
  ciszukoantony: 'https://ciszukoantony.vercel.app/donate',
  muzicmania: 'https://muzicmania.vercel.app/donate',
};

type Screen = 'none' | 'block' | 'disable' | 'continue';

const CHOICE_KEY = 'ciszu_adblock_choice';
const CHOICE_TTL_MS = 12 * 60 * 60 * 1000; // 12h

interface Choice {
  choice: 'disable' | 'continue';
  at: number;
}

function readChoice(): Choice | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CHOICE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Choice;
    if (Date.now() - c.at > CHOICE_TTL_MS) {
      localStorage.removeItem(CHOICE_KEY);
      return null;
    }
    return c;
  } catch {
    return null;
  }
}

function writeChoice(choice: 'disable' | 'continue') {
  try {
    localStorage.setItem(CHOICE_KEY, JSON.stringify({ choice, at: Date.now() }));
  } catch {
    /* noop */
  }
}

/**
 * ¿La página se cargó por una RECARGA MANUAL (F5 / Ctrl+R / botón recargar)?
 * La mayoría de adblockers se activan/desactivan recargando la página: ahí es
 * donde el guard debe re-evaluar si debe aparecer (punto D). Distinguimos:
 *  - 'reload'  -> recarga manual del usuario (F5) → re-evaluar SIEMPRE
 *  - 'navigate'-> navegación normal (abrir/enlazar) → respetar elección (≤12h)
 *  - 'back_forward' -> volver/avanzar del historial → respetar elección
 */
function isManualReload(): boolean {
  if (typeof window === 'undefined' || !window.performance) return false;
  try {
    const entries = window.performance.getEntriesByType('navigation');
    if (entries && entries.length > 0) {
      const nav = entries[0] as PerformanceNavigationTiming;
      return nav.type === 'reload';
    }
    // Fallback legacy (navegadores sin PerformanceNavigationTiming).
    const legacy = (window.performance as unknown as { navigation?: { type: number } }).navigation;
    if (legacy) return legacy.type === 1; // 1 = reload
  } catch {
    /* noop */
  }
  return false;
}

function clearChoice() {
  try {
    localStorage.removeItem(CHOICE_KEY);
  } catch {
    /* noop */
  }
}

/**
 * Comprobación 1 (síncrona): BAITS.
 * Crea varios divs con clases de anuncio reales que los bloqueadores ocultan
 * por CSS (filtros cosméticos de uBlock/AdGuard/AdBlock/EasyList). Si AL MENOS
 * UNO queda oculto (tamaño 0 / display:none / sin offsetParent), hay bloqueo.
 */
function baitHidden(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const BAIT_CLASSES = [
      'ad-banner ad-placeholder pub_300x250 adbox adsbox',
      'advertisement leaderboard',
      'adsbygoogle ad-slot',
      'sponsor-ad-wrap ad-container',
      'adsbox adsbox-ad',
      'pub_300x250m pub_728x90 textads banner-ad',
      'google-ad ad-wrapper ad-unit',
    ];
    for (const cls of BAIT_CLASSES) {
      const bait = document.createElement('div');
      bait.innerHTML = '&nbsp;';
      bait.className = cls;
      bait.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:300px;height:250px;';
      document.body.appendChild(bait);
      const h = bait.offsetHeight;
      const w = bait.offsetWidth;
      const parent = bait.offsetParent;
      const st = getComputedStyle(bait);
      const hidden =
        h === 0 || w === 0 ||
        parent === null ||
        st.display === 'none' ||
        st.visibility === 'hidden' ||
        st.opacity === '0';
      document.body.removeChild(bait);
      if (hidden) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Muestreo de BAITS (señal 1) con reintentos.
 *
 * Los filtros cosméticos de las extensiones MV3 (uBlock Origin Lite, AdGuard) se
 * aplican DESPUÉS de que arranca el documento, así que una sola lectura a los
 * 400 ms veía los divs señuelo todavía visibles y el guard se quedaba en
 * silencio. Se muestrea durante ~6 s y en cuanto UNO queda oculto (display:none,
 * tamaño 0, sin offsetParent o eliminado por un scriptlet) hay bloqueo claro.
 */
function waitForCosmeticBait(deadlineMs = 6000): Promise<boolean> {
  return new Promise((resolve) => {
    const started = Date.now();
    const sample = () => {
      if (baitHidden()) return resolve(true);
      if (Date.now() - started >= deadlineMs) return resolve(false);
      window.setTimeout(sample, 600);
    };
    sample();
  });
}

/**
 * Sonda de RED (señal 2): ¿el navegador puede pedir recursos del dominio de
 * anuncios?
 *
 * Es la única comprobación que atrapa a los bloqueadores de RED cuando el script
 * de AdSense YA ESTÁ EN LA CACHÉ HTTP (DNS tipo NextDNS/Pi-hole/AdGuard DNS, o
 * extensiones que cortan peticiones): no ocultan nada y Chrome sirve el script
 * desde disco sin volver a pedirlo, así que `window.adsbygoogle` acaba definido
 * y el guard no se mostraba nunca.
 *
 * Detalles: `fetch` (NO <script>: no ejecuta AdSense ni lo inicializa dos
 * veces), `mode:'no-cors'` + `cache:'no-store'` + query único (inmune a la
 * caché).
 *   - Resuelve            → la petición salió del navegador: sin bloqueo.
 *   - Rechaza (TypeError) → cortada por extensión/DNS: bloqueo.
 *   - AbortError (<2.5s)  → sin respuesta: red lenta, SIN evidencia (nunca se
 *                           avisa por red lenta).
 *   - navigator.onLine === false → sin evidencia tampoco.
 * Se exige doble intento para descartar un corte puntual de red.
 */
function probeAdNetwork(origin: string): Promise<boolean> {
  if (typeof fetch !== 'function') return Promise.resolve(false);
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(false);
  const url = `${origin}/pagead/js/adsbygoogle.js?ciszu_probe=${Date.now()}`;

  const attempt = async (): Promise<boolean> => {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? window.setTimeout(() => controller.abort(), 2500) : null;
    try {
      await fetch(url, {
        mode: 'no-cors',
        cache: 'no-store',
        credentials: 'omit',
        ...(controller ? { signal: controller.signal } : {}),
      });
      return false; // respondió: la petición NO fue bloqueada
    } catch (err) {
      // Sin respuesta en el margen (AbortError) = red lenta, no bloqueo.
      return (err as Error | undefined)?.name === 'AbortError' ? false : true;
    } finally {
      if (timer !== null) window.clearTimeout(timer);
    }
  };

  return (async () => {
    if (!(await attempt())) return false;
    await new Promise((r) => window.setTimeout(r, 250));
    return attempt();
  })();
}

/**
 * API de AdSense (señal 3): el tag SSR está en el DOM y tras un margen amplio
 * `window.adsbygoogle` sigue sin definirse → la petición fue cortada (cubre una
 * regla que solo bloquee el tipo `script`). Margen amplio a propósito: una red
 * lenta no debe confundirse con un bloqueo.
 */
function waitForAdsenseApi(timeoutMs = 2500): Promise<boolean> {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const check = () => {
      // El script cargó y definió la API → no hay bloqueo de red.
      if (typeof window.adsbygoogle !== 'undefined') return resolve(false);
      // Margen agotado sin API → la petición fue bloqueada.
      if (Date.now() >= deadline) return resolve(true);
      window.setTimeout(check, 150);
    };
    check();
  });
}

/**
 * Detección "clara" de adblocker: lanza las tres señales y resuelve `true` en
 * cuanto UNA confirma bloqueo; si ninguna confirma antes del margen máximo se
 * considera que NO hay bloqueo claro (nunca se avisa sin evidencia).
 *
 * Las señales 2 y 3 solo se evalúan si el script de AdSense está en la página
 * (sin env de AdSense no hay anuncios que bloquear y avisar sería un falso
 * positivo en local o en webs sin ads).
 */
function detectAdBlocker(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    try {
      const adScript = document.querySelector<HTMLScriptElement>('script[src*="pagead2.googlesyndication.com"]');

      let settled = false;
      const finish = (blocked: boolean, via: string) => {
        if (settled) return;
        settled = true;
        // Diagnóstico: en DevTools (nivel Verbose) se ve qué señal decidió.
        console.debug(`[AdBlockerGuard] deteccion (${via}) →`, blocked ? 'BLOQUEO' : 'sin bloqueo');
        resolve(blocked);
      };

      // Lectura inmediata (filtros cosméticos ya aplicados en la carga previa).
      if (baitHidden()) return finish(true, 'baits');

      waitForCosmeticBait().then((v) => { if (v) finish(true, 'baits'); });

      if (adScript) {
        waitForAdsenseApi().then((v) => { if (v) finish(true, 'adsense-api'); });
        try {
          const origin = new URL(adScript.src).origin;
          probeAdNetwork(origin).then((v) => { if (v) finish(true, 'red'); });
        } catch {
          /* src no parseable: se sigue con las otras señales */
        }
      }

      window.setTimeout(() => finish(false, 'sin-evidencia'), 6500);
    } catch {
      resolve(false);
    }
  });
}

const CSS = `
@keyframes ab-pop { from { opacity: 0; transform: translate(-50%,-46%) scale(.92); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
@keyframes ab-fade { from { opacity: 0; } to { opacity: 1; } }
.ab-ring { transition: stroke-dashoffset 1s linear; }
.ab-modal { animation: ab-pop .35s cubic-bezier(.16,1,.3,1); }
`;

/** Contador circular (SVG) con el número de segundos restantes. */
function CircularCountdown({ seconds, accent }: { seconds: number; accent: string }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(100, (seconds / 15) * 100));
  return (
    <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={R} fill="none"
          stroke={accent} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (pct / 100) * C}
          transform="rotate(-90 60 60)"
          className="ab-ring"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{seconds}</span>
      </div>
    </div>
  );
}

export function AdBlockerGuard({ children, site, logo, title = 'Ciszu Network', accent = '#22d3ee', accentAlt = '#f472b6', donateHref }: AdBlockerGuardProps) {
  // Botón DONAR del estado "seguir usando bloqueador": SIEMPRE lleva a la
  // página de donación de LA MISMA web (nunca a la de ciszunetwork), para que
  // el usuario siga dentro del sitio (se abre en otra pestaña).
  const resolvedDonateHref = donateHref || SITE_DONATE_HREF[site] || 'https://ciszunetwork.vercel.app/donate';
  // Cookies rechazadas → el usuario ya eligió no ver anuncios: el guard de
  // adblocker se bypasea por completo (no molesta, no bloquea, sin errores).
  const [consentTick, setConsentTick] = useState(0);
  useEffect(() => {
    const onChange = () => setConsentTick((t) => t + 1);
    window.addEventListener('ciszu:cookies-changed', onChange);
    return () => window.removeEventListener('ciszu:cookies-changed', onChange);
  }, []);
  const [screen, setScreen] = useState<Screen>('none');
  const [disableCount, setDisableCount] = useState(15);
  const [continueCount, setContinueCount] = useState(5);

  // Cookies rechazadas → adblocker guard desactivado (bypass completo).
  useEffect(() => {
    if (getCookieConsent() === 'rejected') {
      setScreen('none');
    }
  }, [consentTick]);

  // Detección clara: solo si hay adblocker CONFIRMADO.
  // - Recarga VOLUNTARIA de la UI (tema/idioma/cookies): el antiadblock NO se
  //   prioriza. Es una recarga pedida por el usuario desde una acción suya, así
  //   que no se vuelve a mostrar el guard (se respeta su elección previa).
  // - Recarga MANUAL (F5): se borra la elección previa y se re-evalúa SIEMPRE,
  //   porque el usuario pudo activar/desactivar su adblocker al recargar.
  // - Navegación normal: se respeta la elección guardada (≤12h).
  useEffect(() => {
    // Cookies rechazadas → el usuario ya eligió no ver anuncios: bypass total.
    if (getCookieConsent() === 'rejected') {
      // Diagnóstico: explica en consola por qué el guard no se muestra.
      console.debug('[AdBlockerGuard] sin deteccion: cookies rechazadas (bypass)');
      return;
    }
    // Recarga VOLUNTARIA (tema/idioma/cookies): no se prioriza el antiadblock.
    if (consumeVoluntaryReload()) {
      console.debug('[AdBlockerGuard] sin deteccion: recarga voluntaria de la UI');
      return;
    }
    if (isManualReload()) {
      clearChoice();
    } else {
      const choice = readChoice();
      if (choice) {
        console.debug('[AdBlockerGuard] sin deteccion: eleccion guardada (12h)');
        return; // elección válida (≤12h): no molestar
      }
    }
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      // Re-check: el usuario pudo rechazar cookies mientras corría el timeout.
      if (getCookieConsent() === 'rejected') return;
      detectAdBlocker().then((blocked) => {
        if (cancelled || !blocked) return;
        // Re-check final: el usuario pudo rechazar cookies durante la detección.
        if (getCookieConsent() === 'rejected') return;
        setScreen('block');
      });
    };
    // Pequeño retraso para que el CSS del navegador ya haya ocultado los baits.
    const t = window.setTimeout(run, 400);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, []);

  // Si el usuario con adblocker (elección "continue") intenta hacer CLIC en un
  // anuncio, las webs emiten 'ciszu:adblock-click' → volver a mostrar el modal.
  useEffect(() => {
    const onAdClick = () => setScreen('block');
    window.addEventListener('ciszu:adblock-click', onAdClick);
    return () => window.removeEventListener('ciszu:adblock-click', onAdClick);
  }, []);

  // Contador de 15s para "desactivar bloqueador" (recarga al llegar a 0).
  useEffect(() => {
    if (screen !== 'disable') return;
    const iv = window.setInterval(() => {
      setDisableCount((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(iv);
  }, [screen]);
  useEffect(() => {
    if (screen !== 'disable') return;
    if (disableCount <= 0) window.location.reload();
  }, [screen, disableCount]);

  // Contador de 5s para "Seguir usando bloqueador" (desbloquea al llegar a 0).
  useEffect(() => {
    if (screen !== 'continue') return;
    const iv = window.setInterval(() => {
      setContinueCount((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(iv);
  }, [screen]);
  useEffect(() => {
    if (screen !== 'continue') return;
    if (continueCount <= 0) setScreen('none');
  }, [screen, continueCount]);

  // ── Bloqueo de scroll/interacción SOLO mientras el modal está visible. ──
  // Se restaura el overflow SIEMPRE al cambiar de pantalla o desmontar (punto 12).
  useEffect(() => {
    if (screen === 'none') return;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const stop = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', stop, true);
    document.addEventListener('copy', stop, true);
    return () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      document.removeEventListener('contextmenu', stop, true);
      document.removeEventListener('copy', stop, true);
    };
  }, [screen]);

  const onDisable = useCallback(() => {
    setDisableCount(15);
    setScreen('disable');
  }, []);

  const onContinue = useCallback(() => {
    writeChoice('continue');
    setContinueCount(5);
    setScreen('continue');
  }, []);

  const onBackToBlock = useCallback(() => {
    setScreen('block');
  }, []);

  const onManualRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const onDonate = useCallback(() => {
    window.open(resolvedDonateHref, '_blank', 'noopener,noreferrer');
  }, [resolvedDonateHref]);

  if (screen === 'none') return <>{children}</>;

  const share = { logo, title, accent, accentAlt };

  return (
    <>
      <div aria-hidden style={{ pointerEvents: 'none', userSelect: 'none', filter: 'blur(14px)' }}>
        {children}
      </div>
      <style>{CSS}</style>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(2,4,12,0.6)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit',
        }}
      >
        <div className="ab-modal" style={{ position: 'fixed', top: '50%', left: '50%', width: 'min(92vw, 500px)', transform: 'translate(-50%,-50%)', background: '#0b0e14', border: `1px solid ${accent}44`, borderRadius: '1.5rem', padding: '2rem', boxShadow: `0 0 60px ${accent}22` }}>
          {screen === 'block' && (
            <BlockScreen share={share} onDisable={onDisable} onContinue={onContinue} />
          )}
          {screen === 'disable' && (
            <DisableScreen share={share} count={disableCount} onRefresh={onManualRefresh} onBack={onBackToBlock} />
          )}
          {screen === 'continue' && (
            <ContinueScreen share={share} count={continueCount} onDonate={onDonate} />
          )}
        </div>
      </div>
    </>
  );
}

function Logo({ share }: { share: { logo?: string; title: string; accent: string } }) {
  return share.logo ? (
    <img src={share.logo} alt={share.title} style={{ width: '5rem', height: '5rem', objectFit: 'contain', filter: `drop-shadow(0 0 24px ${share.accent}aa)`, margin: '0 auto 1rem', display: 'block' }} />
  ) : null;
}

function BlockScreen({ share, onDisable, onContinue }: {
  share: { logo?: string; title: string; accent: string; accentAlt: string };
  onDisable: () => void;
  onContinue: () => void;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Logo share={share} />
      <span style={{ display: 'inline-block', background: share.accent, color: '#000', fontWeight: 900, fontSize: '0.625rem', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999 }}>
        ADBLOCKER DETECTADO
      </span>
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.4rem', margin: '1rem 0 0.5rem' }}>
        Detectamos un bloqueador de anuncios
      </h2>
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
        Los <strong style={{ color: '#fff' }}>bloqueadores de anuncios</strong> son extensiones o
        herramientas que impiden que las páginas muestren publicidad. En {share.title} usamos
        anuncios para <strong style={{ color: '#fff' }}>autopatrocinar nuestro ecosistema</strong>,
        <strong style={{ color: '#fff' }}> monetizar</strong> y <strong style={{ color: '#fff' }}>mantener
        la página funcionando</strong>. Te pedimos por favor que nos apoyes desactivándolo en esta web.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button onClick={onDisable} style={{ padding: '0.9rem', background: share.accent, color: '#000', fontWeight: 900, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Desactivar bloqueador
        </button>
        <button onClick={onContinue} style={{ padding: '0.9rem', background: 'rgba(255,255,255,0.08)', color: '#e4e4e7', fontWeight: 700, borderRadius: '0.75rem', border: `1px solid ${share.accentAlt}66`, cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Seguir usando bloqueador
        </button>
      </div>
    </div>
  );
}

function DisableScreen({ share, count, onRefresh, onBack }: {
  share: { logo?: string; title: string; accent: string };
  count: number;
  onRefresh: () => void;
  onBack: () => void;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Logo share={share} />
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.2rem', margin: '0 0 0.5rem' }}>
        Cómo desactivar tu bloqueador
      </h2>
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
        Busca el icono de tu bloqueador (uBlock, AdBlock, Brave…), selecciona
        <strong style={{ color: '#fff' }}> "Desactivar en este sitio"</strong> o añade {share.title} a tu
        lista de permitidos y recarga. La página se actualizará sola en
        <strong style={{ color: '#fff' }}> 15 segundos</strong>.
      </p>
      <CircularCountdown seconds={count} accent={share.accent} />
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button onClick={onBack} style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.08)', color: '#e4e4e7', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase' }}>
          Volver
        </button>
        <button onClick={onRefresh} style={{ flex: 1, padding: '0.8rem', background: share.accent, color: '#000', fontWeight: 900, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase' }}>
          Actualizar ahora
        </button>
      </div>
    </div>
  );
}

function ContinueScreen({ share, count, onDonate }: {
  share: { logo?: string; title: string; accent: string; accentAlt: string };
  count: number;
  onDonate: () => void;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Logo share={share} />
      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.2rem', margin: '0 0 0.5rem' }}>
        Puedes seguir usando la página
      </h2>
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
        Podrás navegar <strong style={{ color: '#fff' }}>sin anuncios</strong>, sin problemas. Eso sí:
        no nos hacemos cargo de errores de anuncios ni mal funcionamiento relacionados con el
        bloqueo, y esto puede <strong style={{ color: '#fff' }}>perjudicar el futuro</strong> del ecosistema.
      </p>
      <CircularCountdown seconds={count} accent={share.accent} />
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button onClick={onDonate} style={{ flex: 1, padding: '0.8rem', background: '#f59e0b', color: '#000', fontWeight: 900, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase' }}>
          Donar a la página
        </button>
      </div>
    </div>
  );
}

export default AdBlockerGuard;