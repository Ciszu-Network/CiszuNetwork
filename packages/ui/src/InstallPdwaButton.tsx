/**
 * InstallPdwaButton — botón inteligente "PDWA" (App de Escritorio Progresiva).
 *
 * - CSS 100% autocontenido (inline styles + <style> con prefijo pdwa-): NO
 *   depende del scanner de Tailwind de cada web (lección 8 ago 2026: las
 *   utilidades del paquete packages/ui no se generan en todas las apps → el
 *   botón se rompía en ciszukoa/ciszubot/muzicmania; solo ciszunetwork
 *   coincidía por casualidad).
 * - Esquina INFERIOR-IZQUIERDA de la página (position:fixed + left/bottom).
 * - Fab pequeño (36px) circular; en hover expande el texto "Instalar PDWA"
 *   con max-width transicionada (animación fluida).
 * - ✕ separada: guarda "ciszu-pdwa-dismissed" en localStorage → no vuelve a
 *   salir; si no se pulsa, sigue apareciendo.
 * - Detecta navegador: Chrome/Edge/Opera (Chromium) con beforeinstallprompt
 *   lanzan el prompt nativo; Opera GX, Firefox, Safari, iOS y otros muestran
 *   disclaimer explicando POR QUÉ no pueden instalar + alternativa adaptada.
 * - El panel "cómo instalar" se muestra también en compatibles.
 * - Oculto si ya instalada (standalone / appinstalled) o descartada.
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type BrowserId =
  | 'edge' | 'chrome' | 'opera' | 'opera-gx' | 'firefox' | 'safari' | 'ios' | 'other';

export interface PdwaBrowserInfo {
  id: BrowserId;
  label: string;
  nativa: boolean;
}

export function detectPdwaBrowser(ua: string): PdwaBrowserInfo {
  if (/iPhone|iPad|iPod/i.test(ua)) return { id: 'ios', label: 'Safari iOS', nativa: false };
  if (/Edg\//i.test(ua)) return { id: 'edge', label: 'Microsoft Edge', nativa: true };
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    if (/GX/i.test(ua)) return { id: 'opera-gx', label: 'Opera GX', nativa: false };
    return { id: 'opera', label: 'Opera', nativa: true };
  }
  if (/Firefox\//i.test(ua)) return { id: 'firefox', label: 'Firefox', nativa: false };
  if (/Chromium|Chrome\//i.test(ua)) return { id: 'chrome', label: 'Chrome', nativa: true };
  if (/Safari/i.test(ua)) return { id: 'safari', label: 'Safari', nativa: false };
  return { id: 'other', label: 'este navegador', nativa: false };
}

function getBrowser(): PdwaBrowserInfo {
  if (typeof window === 'undefined') return { id: 'other', label: 'este navegador', nativa: false };
  return detectPdwaBrowser(navigator.userAgent);
}

export interface InstallPdwaButtonProps {
  site: string;
  accent?: string;
  accentAlt?: string;
  desktopAppHref?: string;
  desktopAppLabel?: string;
  uaOverride?: string;
  storageKey?: string;
}

const DEFAULT_ACCENT = '#00e5ff';
const DEFAULT_ACCENT_ALT = '#ff2ec4';

export default function InstallPdwaButton({
  site,
  accent = DEFAULT_ACCENT,
  accentAlt = DEFAULT_ACCENT_ALT,
  desktopAppHref,
  desktopAppLabel = `Descargar ${site} para Windows (.exe)`,
  uaOverride,
  storageKey = 'ciszu-pdwa-dismissed',
}: InstallPdwaButtonProps) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [panel, setPanel] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const browser = useMemo<PdwaBrowserInfo>(
    () => (uaOverride ? detectPdwaBrowser(uaOverride) : getBrowser()),
    [uaOverride]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(storageKey) === '1') {
        setDismissed(true);
        return;
      }
    } catch {
      /* storage no disponible */
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      /* noop */
    }
  };

  const handleInstall = useCallback(async () => {
    if (deferred) {
      const promptEvent = deferred;
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setDeferred(null);
      return;
    }
    setPanel((v) => !v);
  }, [deferred]);

  const vars = {
    '--pdwa-accent': accent,
    '--pdwa-accent-alt': accentAlt,
  } as CSSProperties;

  const hasNative = browser.nativa || deferred !== null;

  const panelData = useMemo(() => {
    if (hasNative) {
      return {
        title: 'Instala esta PDWA',
        sub: `Tu navegador (${browser.label}) es compatible: ${site} se instala como App de Escritorio Progresiva (PDWA) sin pestañas.`,
        steps: [
          'Pulsa el botón Instalar (icono de descarga) y confirma el diálogo del navegador, o usa el icono de la barra de direcciones.',
          'La PDWA queda en Inicio / Escritorio / Asígnale tu logo y barra de tareas.',
        ],
      };
    }
    switch (browser.id) {
      case 'opera-gx':
        return {
          title: 'Opera GX no instala PDWA directamente',
          sub: 'Aunque es Chromium, Opera GX no muestra el instalador nativo de apps web. Alternativa sin extensiones:',
          steps: [
            `Abre la web de ${site}. Menú Opera GX (logo rojo ═) → "Guardar y compartir" → "Crear acceso directo".`,
            'Clic derecho en el acceso directo → Propiedades.',
            `Añade al final de la ruta:  --app=\"${typeof window !== 'undefined' ? window.location.origin : ''}\"`,
            'Al abrirlo se ve como una ventana de app independiente, igual que una PDWA. Si ofrece app nativa (ver abajo), mejor aún.',
          ],
        };
      case 'firefox':
        return {
          title: 'Firefox no instala PDWA de escritorio',
          sub: 'Firefox no tiene motor de instalación de apps. Alternativas:',
          steps: [
            'Puedes instalar esta PDWA con Microsoft Edge (ya incluido en Windows) o Chrome: icono de la barra de direcciones.',
            'O si usas la app nativa del proyecto (ver abajo si disponible), instálala y olvídate del navegador.',
          ],
        };
      case 'safari':
        return {
          title: 'Safari puede crear tu PDWA en el Dock',
          sub: 'Safari no tiene botón "Instalar", pero sí crea una app en el Dock:',
          steps: [
            'Menú Archivo → "Añadir al Dock" (o Compartir → "Añadir al Dock").',
            'Se abre la web como ventana independiente con tu logo, como PDWA.',
          ],
        };
      case 'ios':
        return {
          title: `${site} en tu pantalla de inicio (iOS)`,
          sub: 'En iPhone/iPad no se instala como app de escritorio, pero funciona igual:',
          steps: [
            'Abre la web en Safari → botón Compartir (flecha ⬆).',
            'Pulsa "Añadir a pantalla de inicio" → Añadir. Acceso directo con tu logo.',
          ],
        };
      default:
        return {
          title: `Instala ${site} como PDWA`,
          sub: 'Este navegador puede no ofrecer instalación nativa. La vía más fiable:',
          steps: [
            'Abre la web en Microsoft Edge o Chrome (gratis) e instala desde el icono de la barra de direcciones.',
            'Se crea una app de escritorio con la misma experiencia que la PDWA.',
          ],
        };
    }
  }, [browser, hasNative, site]);

  if (installed || dismissed) return null;

  return (
    <div style={{ ...vars, ...containerStyle }} data-pdwa-host="true">
      <style>{PDWA_CSS}</style>
      {panel && (
        <div style={panelStyle} role="dialog" aria-label="Información de instalación PDWA">
          <div style={panelHeadStyle}>
            <p style={panelTitleStyle}>{panelData.title}</p>
            <button type="button" aria-label="Cerrar panel" onClick={() => setPanel(false)} style={panelCloseStyle}>
              ✕
            </button>
          </div>
          <p style={panelSubStyle}>{panelData.sub}</p>
          <ol style={panelOlStyle}>
            {panelData.steps.map((s) => (
              <li key={s} style={panelLiStyle}>{s}</li>
            ))}
          </ol>
          {desktopAppHref && (
            <a href={desktopAppHref} style={appLinkStyle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              {desktopAppLabel}
            </a>
          )}
          <p style={panelFootnoteStyle}>
            PDWA = App de Escritorio Progresiva: tu web sin pestañas ni barra de dirección.
          </p>
        </div>
      )}

      <div style={fabRowStyle}>
        <button
          type="button"
          onClick={handleInstall}
          aria-label={`Instalar ${site} como PDWA`}
          aria-expanded={panel}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          onFocus={() => setExpanded(true)}
          onBlur={() => setExpanded(false)}
          style={expanded ? { ...fabStyle, ...fabExpandedStyle } : fabStyle}
        >
          <span style={fabIconWrapStyle}>
            {!expanded && <span style={fabGlowStyle} />}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--pdwa-accent)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={fabIconStyle}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m7 10 5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
          </span>
          <span
            style={{
              ...fabTextStyle,
              ...(expanded
                ? { opacity: 1, transform: 'translateX(0)' }
                : { opacity: 0, transform: 'translateX(-8px)', pointerEvents: 'none' }),
            }}
          >
            {hasNative ? 'Instalar PDWA' : browser.id === 'opera-gx' ? 'Alternativa PDWA (GX)' : 'Instalar PDWA'}
          </span>
        </button>

        <button
          type="button"
          aria-label="No volver a mostrar"
          onClick={handleDismiss}
          style={dismissStyle}
          title="No volver a mostrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * CSS autocontenido (no depende del scanner de Tailwind de las apps) *
 * ------------------------------------------------------------------ */

const containerStyle: CSSProperties = {
  position: 'fixed',
  left: 16,
  bottom: 16,
  zIndex: 50,
  fontFamily: 'inherit',
};

const PDWA_CSS = `
@keyframes pdwa-pop {
  0% { opacity: 0; transform: translateY(10px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
`;

const panelStyle: CSSProperties = {
  marginBottom: 12,
  width: 288,
  maxWidth: 'calc(100vw - 32px)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(9,9,14,0.72)',
  padding: 16,
  color: '#e4e4e7',
  fontSize: 13,
  lineHeight: 1.5,
  boxShadow: '0 0 28px var(--pdwa-accent)',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  animation: 'pdwa-pop 0.35s ease-out',
};

const panelHeadStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 10,
};

const panelTitleStyle: CSSProperties = {
  fontWeight: 600,
  margin: 0,
  lineHeight: 1.3,
  color: 'var(--pdwa-accent)',
};

const panelCloseStyle: CSSProperties = {
  flexShrink: 0,
  border: 'none',
  background: 'transparent',
  color: '#a1a1aa',
  fontSize: 13,
  cursor: 'pointer',
  borderRadius: 999,
  padding: '0 6px',
};

const panelSubStyle: CSSProperties = {
  margin: '0 0 8px',
  fontSize: 12,
  lineHeight: 1.5,
  color: '#a1a1aa',
};

const panelOlStyle: CSSProperties = {
  margin: '0 0 12px',
  paddingLeft: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const panelLiStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: '#d4d4d8',
};

const appLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 999,
  padding: '6px 14px',
  fontSize: 12,
  fontWeight: 600,
  color: '#000',
  background: 'var(--pdwa-accent)',
  textDecoration: 'none',
  transition: 'opacity 0.2s',
};

const panelFootnoteStyle: CSSProperties = {
  marginTop: 12,
  fontSize: 10,
  lineHeight: 1.4,
  color: '#71717a',
};

const fabRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const fabStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 36,
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(9,9,14,0.35)',
  color: '#fff',
  cursor: 'pointer',
  overflow: 'hidden',
  width: 36,
  padding: 0,
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  boxShadow: '0 0 10px rgba(0,0,0,0.4)',
  transition:
    'width 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.3s, box-shadow 0.3s',
};

const fabExpandedStyle: CSSProperties = {
  width: 152,
  borderColor: 'var(--pdwa-accent)',
  boxShadow: '0 0 18px var(--pdwa-accent)',
};

const fabIconWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  flexShrink: 0,
};

const fabGlowStyle: CSSProperties = {
  position: 'absolute',
  inset: 8,
  borderRadius: 999,
  opacity: 0.3,
  background: 'var(--pdwa-accent)',
  filter: 'blur(6px)',
  transition: 'opacity 0.5s',
};

const fabIconStyle: CSSProperties = {
  position: 'relative',
  width: 16,
  height: 16,
  transition: 'transform 0.5s ease-out',
};

const fabTextStyle: CSSProperties = {
  whiteSpace: 'nowrap',
  paddingRight: 12,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: 'var(--pdwa-accent)',
  transition: 'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)',
};

const dismissStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  flexShrink: 0,
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(9,9,14,0.35)',
  color: '#a1a1aa',
  fontSize: 10,
  cursor: 'pointer',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  boxShadow: '0 0 8px rgba(0,0,0,0.4)',
  transition: 'transform 0.3s ease-out, border-color 0.2s, color 0.2s',
};