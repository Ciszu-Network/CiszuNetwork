/**
 * FabDismissHint — aviso al cerrar un botón flotante (PDWA / Feedback).
 *
 * Compartido entre las webs: cuando el usuario pulsa ✕ en un FAB, muestra un
 * mini-aviso que:
 *  - Dice exactamente que puede reactivar el botón desde una página concreta
 *    (descargas / feedback) — ni más ni menos.
 *  - Tiene un contador visual de 3 segundos y se auto-cierra al terminar.
 *  - Al pulsar el enlace reactiva el botón (borra el flag + evento restore) y
 *    navega a la página.
 * - CSS 100% autocontenido (inline): no depende del scanner de Tailwind.
 * - Se registra como slot del FabStack para apilarse sobre los botones
 *   que sigan visibles (sin superponerse).
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  FAB_HINT_ORDER_BASE,
  useFabStack,
} from './FabStack';

/** Contador de módulo: cada hint montado ocupa un order único creciente. */
let hintSeq = 0;

export interface FabDismissHintProps {
  /** Id único del aviso para el slot del FabStack. */
  slotId: string;
  accent: string;
  title: string;
  message: ReactNode;
  /** Página donde se puede reactivar el botón (p. ej. /descargas). */
  href: string;
  linkLabel: string;
  /** Borra el flag de dismiss + dispara el evento de restauración. */
  onReactivate: () => void;
  /** Milisegundos de duración del contador (default 3000). */
  duration?: number;
  onClose: () => void;
}

const HINT_DURATION = 3000;

export default function FabDismissHint({
  slotId,
  accent,
  title,
  message,
  href,
  linkLabel,
  onReactivate,
  duration = HINT_DURATION,
  onClose,
}: FabDismissHintProps) {
  const [paused, setPaused] = useState(false);
  // Order único por hint: los avisos se apilan entre sí y siempre por encima de
  // los botones flotantes (FAB_HINT_ORDER_BASE).
  const [order] = useState(() => FAB_HINT_ORDER_BASE + hintSeq++);
  const bottom = useFabStack(`dismiss-hint-${slotId}`, { order, height: 92 });

  // Cuenta atrás fluida por timestamp (requestAnimationFrame), no por
  // setInterval: evita que el contador se trabe. Cada frame calcula el tiempo
  // restante real y cierra cuando llega a 0. Al pausar (hover) se conserva el
  // tiempo restante y la cuenta se reanuda desde ahí.
  const endRef = useRef<number>(0);
  const remainingRef = useRef(duration);
  const [remaining, setRemaining] = useState(duration);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const advance = (left: number) => {
      remainingRef.current = left;
      setRemaining(left);
    };
    if (paused) {
      // Congela el tiempo restante actual (lo que quede cuando se pausa).
      const left = Math.max(0, endRef.current - Date.now());
      advance(left || remainingRef.current);
      return;
    }
    endRef.current = Date.now() + remainingRef.current;
    let raf = 0;
    const tick = () => {
      const left = Math.max(0, endRef.current - Date.now());
      advance(left);
      if (left <= 0) {
        onCloseRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const seconds = Math.ceil(remaining / 1000);

  const handleReactivate = () => {
    onReactivate();
  };

  const width = (remaining / duration) * 100;

  return (
    <div
      style={{ ...containerStyle, bottom }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`@keyframes fdh-pop { 0% { opacity: 0; transform: translateY(10px) scale(0.96); } 100% { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
      <div style={{ ...cardStyle, borderColor: `${accent}55`, boxShadow: `0 0 24px ${accent}50` }}>
        <div style={headStyle}>
          <p style={{ ...titleStyle, color: accent }}>{title}</p>
          <button type="button" aria-label="Cerrar aviso" onClick={onClose} style={closeStyle}>
            ✕
          </button>
        </div>

        <p style={messageStyle}>{message}</p>

        <a href={href} onClick={handleReactivate} style={{ ...linkStyle, background: accent }}>
          {linkLabel}
        </a>

        {/* Contador visual: barra que se vacía en `duration` ms */}
        <div style={countWrapStyle}>
          <span style={countTextStyle}>{seconds}</span>
          <div style={countTrackStyle}>
            <div style={{ ...countFillStyle, background: accent, width: `${width}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const containerStyle: CSSProperties = {
  position: 'fixed',
  left: 16,
  zIndex: 60,
  fontFamily: 'inherit',
  transition: 'bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
};

const cardStyle: CSSProperties = {
  position: 'relative',
  width: 276,
  maxWidth: 'calc(100vw - 32px)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(9,9,14,0.8)',
  padding: 14,
  color: '#e4e4e7',
  fontSize: 12,
  lineHeight: 1.5,
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  animation: 'fdh-pop 0.3s ease-out',
};

const headStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 6,
};

const titleStyle: CSSProperties = {
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.3,
};

const closeStyle: CSSProperties = {
  flexShrink: 0,
  border: 'none',
  background: 'transparent',
  color: '#a1a1aa',
  fontSize: 12,
  cursor: 'pointer',
  borderRadius: 999,
  padding: '0 6px',
};

const messageStyle: CSSProperties = {
  margin: '0 0 10px',
  fontSize: 11,
  lineHeight: 1.5,
  color: '#d4d4d8',
};

const linkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '6px 14px',
  fontSize: 11,
  fontWeight: 700,
  color: '#000',
  textDecoration: 'none',
  transition: 'filter 0.2s',
};

const countWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 12,
};

const countTextStyle: CSSProperties = {
  flexShrink: 0,
  fontSize: 10,
  fontWeight: 700,
  color: '#a1a1aa',
  minWidth: 14,
  textAlign: 'center',
};

const countTrackStyle: CSSProperties = {
  flex: 1,
  height: 4,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.12)',
  overflow: 'hidden',
};

const countFillStyle: CSSProperties = {
  height: '100%',
  borderRadius: 999,
  transition: 'width 1s linear',
};