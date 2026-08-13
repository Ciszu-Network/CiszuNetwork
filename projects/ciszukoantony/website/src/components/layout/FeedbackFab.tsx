/**
 * FeedbackFab — botón flotante "Reportar un problema" (esquina INFERIOR-IZQUIERDA,
 * justo encima del botón PDWA del layout).
 *
 * - position:fixed + left/bottom inline (PDWA está en left:16 bottom:16 →
 *   este va en bottom:62 para quedar encima).
 * - Al pulsarlo abre el diálogo de Feedback de Sentry vía `attachTo` (guard: si
 *   Sentry no está disponible, redirige a /feedback).
 * - ✕ propia: guarda "ciszu-feedback-dismissed" en localStorage → no vuelve a salir.
 * - Al cerrarlo muestra un mini-panel recordando las páginas Descargas / Feedback.
 * - CSS 100% autocontenido (inline + <style> con prefijo fb-): no depende del
 *   scanner de Tailwind (lección PDWA v3).
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useFabStack, useFabRestore } from '@ciszu/ui';
import { attachFeedback } from '@/lib/feedback';

const STORAGE_KEY = 'ciszu-feedback-dismissed';

export default function FeedbackFab() {
  const router = useRouter();
  const fabRef = useRef<HTMLButtonElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const [panel, setPanel] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        setDismissed(true);
        return;
      }
    } catch {
      /* storage no disponible */
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;
    // Conecta el botón para abrir el diálogo de Sentry; si no está configurado,
    // el fallback es redirigir a /feedback.
    return attachFeedback(fabRef.current, () => setUnavailable(true));
  }, [dismissed]);

  const handleClick = () => {
    if (unavailable) {
      router.push('/feedback');
    }
    // Si Sentry está disponible, attachTo ya abrió el diálogo con el click.
  };

  const handleDismiss = () => {
    setDismissed(true);
    setPanel(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* noop */
    }
  };

  const stackBottom = useFabStack('feedback', !dismissed ? { order: 1, height: 36 } : null);
  useFabRestore(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setDismissed(false);
    setPanel(false);
  });

  if (dismissed && !panel) return null;

  return (
    <div style={{ ...containerStyle, bottom: stackBottom }} data-feedback-host="true">
      <style>{FEEDBACK_CSS}</style>

      {panel && (
        <div style={panelStyle} role="dialog" aria-label="Feedback y descargas">
          <div style={panelHeadStyle}>
            <p style={panelTitleStyle}>¿Quieres reportar un problema o probar la app?</p>
            <button type="button" aria-label="Cerrar aviso" onClick={() => setPanel(false)} style={panelCloseStyle}>
              ✕
            </button>
          </div>
          <p style={panelSubStyle}>
            Recuerda que siempre puedes dejar tu feedback o instalar Ciszuko Antony como app de escritorio:
          </p>
          <div style={panelLinksStyle}>
            <a href="/feedback" style={linkStyle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={linkIconStyle}>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="m9 14 2 2 4-4" />
              </svg>
              Feedback
            </a>
            <a href="/descargas" style={linkStyle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={linkIconStyle}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargas
            </a>
          </div>
        </div>
      )}

      {!dismissed && (
        <div style={fabRowStyle}>
          <button
            ref={fabRef}
            type="button"
            onClick={handleClick}
            aria-label="Reportar un problema"
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
                stroke="var(--fb-accent)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={fabIconStyle}
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
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

          <button type="button" aria-label="No volver a mostrar" onClick={handleDismiss} style={dismissStyle} title="No volver a mostrar">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * CSS autocontenido (no depende del scanner de Tailwind de las apps) *
 * ------------------------------------------------------------------ */

const containerStyle: CSSProperties = {
  position: 'fixed',
  left: 16,
  bottom: 62,
  zIndex: 50,
  fontFamily: 'inherit',
  transition: 'bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
  '--fb-accent': '#a78bfa',
  '--fb-accent-alt': '#22d3ee',
} as CSSProperties;

const FEEDBACK_CSS = `
@keyframes fb-pop {
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
  boxShadow: '0 0 28px var(--fb-accent)',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  animation: 'fb-pop 0.35s ease-out',
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
  color: 'var(--fb-accent)',
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
  margin: '0 0 12px',
  fontSize: 12,
  lineHeight: 1.5,
  color: '#a1a1aa',
};

const panelLinksStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};

const linkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 999,
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--fb-accent-alt)',
  border: '1px solid rgba(34,211,238,0.35)',
  background: 'rgba(34,211,238,0.08)',
  textDecoration: 'none',
  transition: 'opacity 0.2s, transform 0.2s',
};

const linkIconStyle: CSSProperties = {
  width: 13,
  height: 13,
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
  border: '1px rgba(255,255,255,0.16) solid',
  background: 'rgba(9,9,14,0.35)',
  color: '#fff',
  cursor: 'pointer',
  overflow: 'hidden',
  width: 36,
  padding: 0,
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  boxShadow: '0 0 10px rgba(0,0,0,0.4)',
  transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.3s, box-shadow 0.3s',
};

const fabExpandedStyle: CSSProperties = {
  width: 176,
  borderColor: 'var(--fb-accent)',
  boxShadow: '0 0 18px var(--fb-accent)',
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
  background: 'var(--fb-accent)',
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
  color: 'var(--fb-accent)',
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
  border: '1px rgba(255,255,255,0.15) solid',
  background: 'rgba(9,9,14,0.35)',
  color: '#a1a1aa',
  fontSize: 10,
  cursor: 'pointer',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  boxShadow: '0 0 8px rgba(0,0,0,0.4)',
  transition: 'transform 0.3s ease-out, border-color 0.2s, color 0.2s',
};