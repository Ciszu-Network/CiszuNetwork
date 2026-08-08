/**
 * InstallPdwaButton — botón inteligente "PDWA" (Desktop Web App Progresiva).
 *
 * Reemplaza a InstallPwaButton (ago 2026). PDWA = Aplicación Web de Escritorio
 * Progresiva (terminología propia de Ciszu Network).
 *
 * - Esquina INFERIOR IZQUIERDA siempre: fab pequeño; icono + en hover expande texto.
 * - ✕ permanente: guarda "ciszu-pdwa-dismissed" en localStorage → no vuelve a salir.
 * - Detección de navegador: Chrome/Edge/Opera (Chromium desktop) con
 *   `beforeinstallprompt` lanzan el prompt nativo; incompatibles (Opera GX,
 *   Firefox, Safari desktop, iOS, otros) muestran disclaimer con POR QUÉ y
 *   alternativa según contexto (acceso directo con --app, Edge, Añadir al Dock,
 *   pantalla de inicio o app nativa vía `desktopAppHref`).
 * - El panel "cómo instalar" se muestra SIEMPRE (también en compatibles).
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
  /** Nombre del sitio para los textos (p.ej. "MuzicMania") */
  site: string;
  /** Color acento principal (hex) según tema de cada web */
  accent?: string;
  /** Color acento secundario (halo) */
  accentAlt?: string;
  /** Enlace a la PDWA de escritorio nativa (solo páginas que la ofrecen, p.ej. MuzicMania .exe) */
  desktopAppHref?: string;
  /** Texto CTA app nativa */
  desktopAppLabel?: string;
  /** Override user-agent (solo tests) */
  uaOverride?: string;
  /** Key localStorage del dismiss */
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

  const accentStyle = {
    '--pdwa-accent': accent,
    '--pdwa-accent-alt': accentAlt,
  } as CSSProperties;

return (
    <div
      className="fixed left-4 bottom-4 z-50"
      style={accentStyle}
      data-pdwa-host="true"
    >
      <style>{`@keyframes pdwa-pop{0%{opacity:0;transform:translateY(10px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}`}</style>
{panel && (
        <div
          className="mb-3 w-72 max-w-[calc(100vw-2rem)] animate-[pdwa-pop_0.35s_ease-out] rounded-2xl border border-[rgba(255,255,255,0.14)] bg-zinc-950/70 p-4 text-sm text-zinc-200 shadow-[0_0_28px_var(--pdwa-accent)] backdrop-blur-xl backdrop-saturate-150"
          role="dialog"
          aria-label="Información de instalación PDWA"
        >
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <p className="font-semibold leading-snug" style={{ color: 'var(--pdwa-accent)' }}>
              {panelData.title}
            </p>
            <button
              type="button"
              aria-label="Cerrar panel"
              className="shrink-0 rounded-full px-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              onClick={() => setPanel(false)}
            >
              ✕
            </button>
          </div>
          <p className="mb-2 text-xs leading-relaxed text-zinc-400">{panelData.sub}</p>
          <ol className="mb-3 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed">
            {panelData.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {desktopAppHref && (
            <a
              href={desktopAppHref}
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-black transition hover:opacity-85"
              style={{ background: 'var(--pdwa-accent)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              {desktopAppLabel}
            </a>
          )}
          <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">
            PDWA = App de Escritorio Progresiva: tu web sin pestañas ni barra de dirección.
          </p>
        </div>
      )}

<div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleInstall}
          aria-label={`Instalar ${site} como PDWA`}
          aria-expanded={panel}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          onFocus={() => setExpanded(true)}
          onBlur={() => setExpanded(false)}
          className="group relative flex h-9 items-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.16)] bg-zinc-950/35 text-white shadow-[0_0_10px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[var(--pdwa-accent)] hover:shadow-[0_0_18px_var(--pdwa-accent)]"
          style={{ width: expanded ? '9.5rem' : '2.25rem' }}
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            {!expanded && (
              <span
                className="absolute inset-2 rounded-full opacity-30 blur-md transition-opacity duration-500"
                style={{ background: 'var(--pdwa-accent)' }}
              />
            )}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--pdwa-accent)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-y-0.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m7 10 5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
          </span>
          <span
            className={`whitespace-nowrap pr-3 text-[11px] font-bold tracking-wide transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              expanded ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-2 opacity-0'
            }`}
            style={{ color: 'var(--pdwa-accent)' }}
          >
            {hasNative ? 'Instalar PDWA' : browser.id === 'opera-gx' ? 'Alternativa PDWA (GX)' : 'Instalar PDWA'}
          </span>
        </button>

        <button
          type="button"
          aria-label="No volver a mostrar"
          onClick={handleDismiss}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 bg-zinc-950/35 text-[10px] text-zinc-400 shadow-[0_0_8px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-out hover:scale-110 hover:border-red-400/70 hover:text-red-400"
          title="No volver a mostrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

