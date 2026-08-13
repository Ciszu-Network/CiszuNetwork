/**
 * FeedbackFab — botón flotante "Reportar un problema" (widget Sentry).
 *
 * - CSS 100% autocontenido (inline styles, prefijo fb-): NO depende del scanner
 *   de Tailwind de las apps (lección v3 PDWA).
 * - Esquina INFERIOR-IZQUIERDA, justo DEBAJO del botón PDWA (PDWA: left:16
 *   bottom:16 → este: left:16 bottom:62).
 * - Fab circular; en hover expande el texto "Reportar un problema".
 * - ✕ propia: guarda "ciszu-feedback-dismissed" en localStorage → no vuelve a
 *   salir; aviso al cerrar (mini-panel inline) recordando Descargas/Feedback.
 * - Al pulsar → abre el widget de Sentry (Sentry.getFeedback()?.createForm()).
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useFabStack, useFabRestore } from '@ciszu/ui';

interface FeedbackFabProps {
  storageKey?: string;
  accent?: string;
  accentAlt?: string;
}

const DEFAULT_ACCENT = '#22d3ee';
const DEFAULT_ACCENT_ALT = '#a78bfa';

const openFeedback = async () => {
  try {
    const fb = Sentry.getFeedback();
    if (!fb) return;
    const form = await fb.createForm();
    form.open();
  } catch {
    /* feedback no disponible */
  }
};

export default function FeedbackFab({
  storageKey = 'ciszu-feedback-dismissed',
  accent = DEFAULT_ACCENT,
  accentAlt = DEFAULT_ACCENT_ALT,
}: FeedbackFabProps) {
  const [dismissed, setDismissed] = useState(false);
  const [dismissHint, setDismissHint] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(storageKey) === '1') setDismissed(true);
    } catch {
      /* storage no disponible */
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    setDismissHint(true);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      /* noop */
    }
  };

  const handleClick = useCallback(() => {
    void openFeedback();
  }, []);

  const stackBottom = useFabStack('feedback', !dismissed ? { order: 1, height: 36 } : null);
  useFabRestore(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* noop */
    }
    setDismissed(false);
    setDismissHint(false);
  });

  if (dismissed && !dismissHint) return null;

  const vars = {
    '--fb-accent': accent,
    '--fb-accent-alt': accentAlt,
  } as CSSProperties;

  return (
    <div style={{ ...vars, ...containerStyle, bottom: stackBottom }} data-fb-host="true">
      {dismissed && dismissHint && (
        <div style={panelStyle} role="dialog" aria-label="Feedback">
          <div style={panelHeadStyle}>
            <p style={panelTitleStyle}>¿Tienes un problema con CiszuBot?</p>
            <button type="button" aria-label="Cerrar aviso" onClick={() => setDismissHint(false)} style={panelCloseStyle}>
              ✕
            </button>
          </div>
          <p style={panelSubStyle}>
            Puedes reportarlo desde la página de Feedback o consultar la PDWA en Descargas.
          </p>
          <div style={panelLinksStyle}>
            <Link href="/feedback" onClick={() => setDismissHint(false)} style={panelLinkStyle}>
              Feedback
            </Link>
            <Link href="/descargas" onClick={() => setDismissHint(false)} style={panelLinkStyle}>
              Descargas
            </Link>
          </div>
        </div>
      )}

      {!dismissed && (
        <div style={fabRowStyle}>
          <button
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
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={fabIconStyle}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 7v5" />
                <path d="M12 16.2v.1" />
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
  zIndex: 49,
  fontFamily: 'inherit',
  transition: 'bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
};

const panelStyle: CSSProperties = {
  marginBottom: 10,
  width: 264,
  maxWidth: 'calc(100vw - 32px)',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(9,9,14,0.72)',
  padding: 14,
  color: '#e4e4e7',
  fontSize: 12,
  lineHeight: 1.5,
  boxShadow: '0 0 24px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
};

const panelHeadStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 6,
};

const panelTitleStyle: CSSProperties = {
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.3,
  color: 'var(--fb-accent)',
};

const panelCloseStyle: CSSProperties = {
  flexShrink: 0,
  border: 'none',
  background: 'transparent',
  color: '#a1a1aa',
  fontSize: 12,
  cursor: 'pointer',
  borderRadius: 999,
  padding: '0 6px',
};

const panelSubStyle: CSSProperties = {
  margin: '0 0 10px',
  fontSize: 11,
  lineHeight: 1.5,
  color: '#a1a1aa',
};

const panelLinksStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
};

const panelLinkStyle: CSSProperties = {
  borderRadius: 999,
  padding: '5px 12px',
  fontSize: 11,
  fontWeight: 600,
  color: '#000',
  background: 'var(--fb-accent-alt)',
  textDecoration: 'none',
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