/**
 * FeedbackFab — botón flotante "Reportar un problema" (esquina inferior-izquierda,
 * debajo del botón PDWA de @ciszu/ui).
 *
 * - CSS 100% autocontenido (inline styles + <style> con prefijo fbx-): no depende
 *   del scanner de Tailwind de la web (lección 8 ago 2026 con InstallPdwaButton).
 * - Mismo lenguaje visual que InstallPdwaButton (fab circular 36px + texto que
 *   expande en hover) pero anclado en left:16 bottom:62 para quedar debajo del PDWA.
 * - ✕ propia: guarda "muzicmania-feedback-dismissed" en localStorage → no vuelve a
 *   salir; al cerrar muestra un mini-panel inline recordando Descargas y Feedback.
 * - Al pulsar el botón abre el formulario de Sentry mediante
 *   Sentry.getFeedback().createForm() (autoInject: false en instrumentation-client,
 *   así el trigger automático de Sentry está desactivado).
 * - Oculto en Tauri (la app nativa no necesita reportar desde la web).
 */
'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useFabStack, useFabRestore, FabDismissHint } from '@ciszu/ui';
import { isTauri } from '@/lib/isTauri';

const STORAGE_KEY = 'muzicmania-feedback-dismissed';
const ACCENT = '#ff33cc';

export default function FeedbackFab() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [notice, setNotice] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setIsDesktop(isTauri());
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') setDismissed(true);
    } catch {
      /* storage no disponible */
    }
  }, []);

  const handleOpen = async () => {
    try {
      // import() dinámico en el click: el SDK de análisis no se carga al arrancar
      // la página si no hace falta, y el getFeedback() solo existe tras init.
      const mod = await import('@sentry/nextjs');
      const feedback = mod.getFeedback?.();
      const form = await feedback?.createForm?.();
      if (form) {
        form.appendToDom?.();
        form.open?.();
      }
    } catch {
      /* SDK no disponible: se ignora el click */
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setNotice(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* noop */
    }
  };

  const handleReenable = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setDismissed(false);
    setNotice(false);
  };

  const stackBottom = useFabStack(
    'feedback',
    !isDesktop && !dismissed ? { order: 1, height: 36 } : null
  );
  useFabRestore(handleReenable, [STORAGE_KEY]);

  if (isDesktop || (dismissed && !notice)) return null;

  return (
    <>
      <style>{FAB_CSS}</style>

      {!isDesktop && dismissed && notice && (
        <FabDismissHint
          slotId="feedback"
          accent={ACCENT}
          title="Feedback ocultado"
          message="Has ocultado el botón de reporte. Puedes reactivarlo desde la página de Feedback."
          href="/feedback"
          linkLabel="Reactivar en Feedback"
          onReactivate={handleReenable}
          onClose={() => setNotice(false)}
        />
      )}

      {!isDesktop && !dismissed && (
        <div style={{ ...containerStyle, bottom: stackBottom }}>
          <div style={fabRowStyle}>
            <button
              type="button"
              onClick={handleOpen}
              aria-label="Reportar un problema"
              aria-expanded={false}
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
                  stroke={ACCENT}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={fabIconStyle}
                >
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
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
                Reportar un problema
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
      )}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * CSS autocontenido (no depende del scanner de Tailwind de la web)   *
 * ------------------------------------------------------------------ */

const containerStyle: CSSProperties = {
  position: 'fixed',
  left: 16,
  bottom: 62,
  zIndex: 49,
  fontFamily: 'inherit',
  transition: 'bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
};

const FAB_CSS = `
@keyframes fbx-pop {
  0% { opacity: 0; transform: translateY(10px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
`;

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
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(255,255,255,0.16)',
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
  width: 172,
  borderColor: ACCENT,
  boxShadow: `0 0 18px ${ACCENT}`,
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
  background: ACCENT,
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
  color: ACCENT,
  transition:
    'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)',
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