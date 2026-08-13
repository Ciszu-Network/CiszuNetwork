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
import { useFabStack, useFabRestore } from '@ciszu/ui';
import { isTauri } from '@/lib/isTauri';

const STORAGE_KEY = 'muzicmania-feedback-dismissed';
const ACCENT = '#ff33cc';
const ACCENT_ALT = '#00f0ff';

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

  const stackBottom = useFabStack(
    'feedback',
    !isDesktop && !dismissed ? { order: 1, height: 36 } : null
  );
  useFabRestore(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setDismissed(false);
    setNotice(false);
  });

  if (isDesktop || dismissed) return null;

  return (
    <>
      <style>{FAB_CSS}</style>

      {notice && (
        <div style={noticeStyle} role="dialog" aria-label="Descargas y Feedback">
          <div style={noticeHeadStyle}>
            <p style={noticeTitleStyle}>RECURSOS DISPONIBLES</p>
            <button
              type="button"
              aria-label="Cerrar aviso"
              onClick={() => setNotice(false)}
              style={noticeCloseStyle}
            >
              ✕
            </button>
          </div>
          <div style={noticeBodyStyle}>
            <a href="/download" style={noticeLinkStyle}>
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              Descargas (app nativa · PDWA)
            </a>
            <a href="/feedback" style={noticeLinkStyle}>
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="m7 8 5 3V8" />
                <path d="M16 8h.01" />
              </svg>
              Página de Feedback
            </a>
          </div>
        </div>
      )}

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

const noticeStyle: CSSProperties = {
  position: 'fixed',
  left: 16,
  bottom: 128,
  zIndex: 49,
  width: 232,
  maxWidth: 'calc(100vw - 32px)',
  borderRadius: 14,
  border: `1px solid ${ACCENT}44`,
  background: 'rgba(9,9,14,0.78)',
  padding: 14,
  color: '#e4e4e7',
  fontSize: 12,
  lineHeight: 1.5,
  boxShadow: `0 0 24px ${ACCENT}55`,
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  animation: 'fbx-pop 0.35s ease-out',
};

const noticeHeadStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 8,
};

const noticeTitleStyle: CSSProperties = {
  fontWeight: 700,
  margin: 0,
  fontSize: 10,
  letterSpacing: '0.12em',
  color: ACCENT_ALT,
};

const noticeCloseStyle: CSSProperties = {
  flexShrink: 0,
  border: 'none',
  background: 'transparent',
  color: '#a1a1aa',
  fontSize: 12,
  cursor: 'pointer',
  borderRadius: 999,
  padding: '0 5px',
};

const noticeBodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const noticeLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  borderRadius: 10,
  padding: '7px 10px',
  fontSize: 11,
  fontWeight: 600,
  color: '#d4d4d8',
  background: 'rgba(255,255,255,0.06)',
  border: `1px solid ${ACCENT}33`,
  textDecoration: 'none',
  transition: 'border-color 0.2s, color 0.2s, background 0.2s',
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