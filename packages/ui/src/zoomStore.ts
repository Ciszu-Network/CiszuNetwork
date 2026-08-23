'use client';

import React, { useSyncExternalStore, useEffect } from 'react';

/* ------------------------------------------------------------------ *
 * Store compartido de estado de zoom (SSR-safe, pub/sub con
 * useSyncExternalStore). Lo usan <ZoomWarning />, el <DisclaimerStack />
 * y los Navbars de las 4 webs para desplazar el header (mt-8) y
 * desactivar el island cuando el zoom está fuera de rango.
 *
 * Vive en un módulo propio para evitar el ciclo Disclaimer -> ZoomWarning.
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

/** Hook de conveniencia para que componentes (p.ej. DisclaimerStack) sepan si el header está desplazado por zoom. */
export function useZoomWarningActive(): boolean {
  const s = useZoomStatus();
  return isZoomWarningActive(s);
}