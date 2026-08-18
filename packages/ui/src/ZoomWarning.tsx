'use client';

import React, { useSyncExternalStore, useEffect } from 'react';

/* ------------------------------------------------------------------ *
 * Store compartido de estado de zoom (SSR-safe, pub/sub con
 * useSyncExternalStore). Lo usan el banner <ZoomWarning /> y los
 * Navbars de las 4 webs para desplazar el header (mt-8) y desactivar
 * el island cuando el zoom está fuera de rango.
 * ------------------------------------------------------------------ */

export type ZoomStatus = 'normal' | 'zoomed-in' | 'zoomed-out';

export interface ZoomState {
  status: ZoomStatus;
  zoom: number;
  scale: number;
  isMobile: boolean;
  dismissed: boolean;
}

const INITIAL_STATE: ZoomState = {
  status: 'normal',
  zoom: 100,
  scale: 1,
  isMobile: false,
  dismissed: false,
};

let state: ZoomState = INITIAL_STATE;
const listeners = new Set<() => void>();

function emit(next: ZoomState) {
  state = next;
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

/** Detecta el estado de zoom según plataforma:
 * - PC: zoom del navegador vía outerWidth/innerWidth + visualViewport.scale.
 * - Móvil: pinch-zoom vía visualViewport.scale; outerWidth/innerWidth no es fiable.
 */
function computeState(): ZoomState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  const vv = window.visualViewport;
  const scale = vv?.scale ?? 1;
  const inner = window.innerWidth || 1;
  const outer = window.outerWidth || inner;
  const zoom = Math.round((outer / inner) * 100);

  let status: ZoomStatus = 'normal';
  if (isMobile) {
    if (scale >= 1.8) status = 'zoomed-in';
    else if (scale <= 0.6) status = 'zoomed-out';
  } else {
    if (zoom >= 140 || scale >= 1.8) status = 'zoomed-in';
    else if (zoom <= 70) status = 'zoomed-out';
  }

  return { status, zoom, scale, isMobile, dismissed: false };
}

function recompute() {
  const next = computeState();
  // Si el zoom vuelve a rango normal, reactiva el aviso para la próxima vez.
  emit({ ...next, dismissed: next.status === 'normal' ? false : state.dismissed });
}

let attached = false;

export function useZoomStatus(): ZoomState {
  useEffect(() => {
    if (attached) return;
    attached = true;
    const onResize = recompute;
    window.addEventListener('resize', onResize, { passive: true });
    window.visualViewport?.addEventListener('resize', onResize, { passiv: true } as AddEventListenerOptions);
    recompute();
    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      attached = false;
    };
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, () => INITIAL_STATE);
}

/** Oculta el aviso de zoom (hasta que el zoom vuelva a rango normal). */
export function dismissZoomWarning() {
  emit({ ...state, dismissed: true });
}

export const isZoomWarningActive = (s: ZoomState) => !s.dismissed && s.status !== 'normal';

/* ------------------------------------------------------------------ *
 * CSS autocontenido (no depende del scanner de Tailwind de las apps)
 * ------------------------------------------------------------------ */

const ZOOM_WARNING_CSS = `
@keyframes zoom-warning-down {
  0% { opacity: 0; transform: translateY(-100%); }
  100% { opacity: 1; transform: translateY(0); }
}
.zoom-warning-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 16px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  backdrop-filter: blur(8px) saturate(150%);
  -webkit-backdrop-filter: blur(8px) saturate(150%);
  animation: zoom-warning-down 0.2s ease forwards;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}
.zoom-warning-banner .zw-body {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  margin: 0 auto;
}
.zoom-warning-banner .zw-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}
.zoom-warning-banner .zw-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: inherit;
}
.zoom-warning-banner .zw-close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 999px;
  background: rgba(255,255,255,0.14);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.zoom-warning-banner .zw-close:hover { background: rgba(255,255,255,0.28); }
.zoom-warning-banner .zw-close:active { transform: scale(0.9); }

@media (min-width: 640px) {
  .zoom-warning-banner { font-size: 12px; }
}
`;

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Banner global de aviso de zoom, compartido por las 4 webs.
 *
 * Aparece al superar los límites de zoom (máximo o mínimo), adaptado a
 * PC y móvil. Al mostrarse, los Navbars aplican `mt-8` y desactivan el
 * island (leyendo `useZoomStatus()`), igual que hacía muzicmania.
 */
export function ZoomWarning() {
  const s = useZoomStatus();
  const active = isZoomWarningActive(s);
  const zoomedOut = s.status === 'zoomed-out';

  const msg = s.isMobile
    ? zoomedOut
      ? '⚠ ZOOM: Vista muy alejada. Haz zoom para una experiencia óptima.'
      : '⚠ ZOOM: Ampliación excesiva. Reduce el zoom para una experiencia óptima.'
    : zoomedOut
      ? '⚠ SISTEMA: Zoom mínimo detectado (alejado). Acércate (90-120%) para una experiencia óptima.'
      : `⚠ SISTEMA: Zoom crítico detectado (${s.zoom}%). Reduce el zoom (90-120%) para una experiencia óptima.`;

  return (
    <>
      {active && (
        <>
          <style>{ZOOM_WARNING_CSS}</style>
          <div
            className="zoom-warning-banner"
            role="alert"
            style={{
              background: zoomedOut
                ? 'rgba(245,158,11,0.9)'
                : 'rgba(244,63,94,0.9)',
            }}
          >
            <div className="zw-body">
              <AlertTriangleIcon className="zw-icon" />
              <span className="zw-text">{msg}</span>
            </div>
            <button
              onClick={dismissZoomWarning}
              aria-label="Cerrar aviso de zoom"
              className="zw-close"
            >
              <XIcon className="zw-icon" />
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default ZoomWarning;