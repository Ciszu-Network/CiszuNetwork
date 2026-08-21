'use client';

import React, { useSyncExternalStore, useEffect } from 'react';
import { useDisclaimer } from './Disclaimer';

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

/**
 * Aviso de zoom, compartido por las 4 webs.
 *
 * CONSTRUCCIÓN: es un PRODUCTOR del sistema de disclaimers global
 * (packages/ui/src/Disclaimer.tsx): cuando el zoom está fuera de rango
 * registra su aviso en la pila; la posición la decide <DisclaimerStack />.
 * Los Navbars siguen usando `useZoomStatus()` para desplazar el header
 * (`mt-8`) y desactivar el island mientras el aviso está activo.
 */
export function ZoomWarning() {
  const s = useZoomStatus();
  const active = isZoomWarningActive(s);
  const { push, remove } = useDisclaimer();
  const zoomedOut = s.status === 'zoomed-out';

  const msg = s.isMobile
    ? zoomedOut
      ? 'ZOOM: Vista muy alejada. Haz zoom para una experiencia óptima.'
      : 'ZOOM: Ampliación excesiva. Reduce el zoom para una experiencia óptima.'
    : zoomedOut
      ? 'SISTEMA: Zoom mínimo detectado (alejado). Acércate (90-120%) para una experiencia óptima.'
      : `SISTEMA: Zoom crítico detectado (${s.zoom}%). Reduce el zoom (90-120%) para una experiencia óptima.`;

  useEffect(() => {
    if (active) {
      push({
        id: 'zoom',
        kind: 'warning',
        message: msg,
        onClose: dismissZoomWarning,
      });
    } else {
      remove('zoom');
    }
  }, [active, msg, push, remove]);

  return null;
}

export default ZoomWarning;