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
 *   5. La elección local se borra cada 24h. No se guarda en base de datos.
 *
 * Detección (punto 11): se usa SOLO el método de BAITS múltiples con clases de
 * anuncio reales (las mismas que usan las listas de AdGuard/uBlock/EasyList y
 * las páginas de noticias). NO se inyectan scripts de AdSense: eso daba falsos
 * positivos por red lenta. Si NINGÚN bait está oculto, no hay adblocker claro y
 * NO se muestra la advertencia.
 *
 * Bloqueo (punto 12): el overlay bloquea scroll/contexto/copia SOLO mientras el
 * modal está visible; al elegir o al terminar el contador se restaura el
 * overflow SIEMPRE (incluso si el componente se desmonta). Sin setState anidado
 * en updaters (causa del bloqueo falso tras la acción).
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export interface AdBlockerGuardProps {
  children: ReactNode;
  /** Nombre corto de la web (para la clave de localStorage). */
  site: string;
  logo?: string;
  title?: string;
  accent?: string;
  accentAlt?: string;
}

type Screen = 'none' | 'block' | 'disable' | 'continue';

const CHOICE_KEY = 'ciszu_adblock_choice';
const CHOICE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

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
 * Detección "clara" de adblocker — solo baits, sin inyección de scripts.
 * Crea varios divs con clases de anuncio reales que los bloqueadores ocultan.
 * Si AL MENOS UNO queda oculto (tamaño 0 / display:none / oculto), hay bloqueo
 * claro. Si ninguno está oculto, NO hay adblocker (o no es detectable de forma
 * fiable) → se devuelve false (sin advertencia).
 *
 * Método usado por las páginas de noticias reales (AdGuard/uBlock EasyList).
 */
function detectAdBlocker(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const BAIT_CLASSES = [
      'ad-banner ad-placeholder pub_300x250 adbox adsbox',
      'advertisement leaderboard',
      'adsbygoogle ad-slot',
      'sponsor-ad-wrap ad-container',
      'adsbox adsbox-ad',
    ];
    let blocked = false;
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
      if (hidden) { blocked = true; break; }
    }
    return blocked;
  } catch {
    return false;
  }
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

export function AdBlockerGuard({ children, site, logo, title = 'Ciszu Network', accent = '#22d3ee', accentAlt = '#f472b6' }: AdBlockerGuardProps) {
  const [screen, setScreen] = useState<Screen>('none');
  const [disableCount, setDisableCount] = useState(15);
  const [continueCount, setContinueCount] = useState(5);

  // Detección clara: solo si hay adblocker CONFIRMADO y sin elección reciente.
  useEffect(() => {
    const choice = readChoice();
    if (choice) return; // elección válida (≤24h): no molestar
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      const blocked = detectAdBlocker();
      if (!cancelled && blocked) setScreen('block');
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
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const stop = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', stop, true);
    document.addEventListener('copy', stop, true);
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
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
    window.open('https://ciszunetwork.vercel.app/donate', '_blank', 'noopener,noreferrer');
  }, []);

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