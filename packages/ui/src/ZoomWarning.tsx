'use client';

import React, { useEffect } from 'react';
import { useDisclaimer } from './Disclaimer';
import { useZoomStatus, dismissZoomWarning, isZoomWarningActive } from './zoomStore';
import type { ZoomState, ZoomStatus } from './zoomStore';

export type { ZoomState, ZoomStatus } from './zoomStore';
export { useZoomStatus, dismissZoomWarning, isZoomWarningActive } from './zoomStore';

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