'use client';

// Disclaimer BETA de extremo a extremo (TODO Cambios Generales): avisa que la
// web/app está en construcción en versión BETA y es descartable con una X.
// El estado de descarte se guarda en localStorage por web (clave única).
//
// CONSTRUCCIÓN: es un PRODUCTOR del sistema de disclaimers global
// (packages/ui/src/Disclaimer.tsx): al montar registra su aviso en la pila;
// la posición la decide <DisclaimerStack /> según el modo del header
// (estático → banda debajo del header; island → tarjeta flotante).
import { useEffect, useState } from 'react';
import { useDisclaimer } from './Disclaimer';

function loadDismissed(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function saveDismissed(key: string) {
  try {
    window.localStorage.setItem(key, '1');
  } catch {
    /* storage no disponible: no persistir */
  }
}

export interface BetaDisclaimerProps {
  /** Mensaje a mostrar. Default: "Esta web/app está siendo construida en versión BETA." */
  message?: string;
  /** Clave de localStorage propia de cada web para no colisionar. */
  storageKey?: string;
  /** Texto del botón de continuar navegando. */
  ctaLabel?: string;
}

export default function BetaDisclaimer({
  message = 'Esta web/app está siendo construida en versión BETA. Algunas funciones pueden fallar o cambiar sin previo aviso.',
  storageKey = 'betadisclaimer_dismissed',
}: BetaDisclaimerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { push, remove } = useDisclaimer();

  useEffect(() => {
    setHydrated(true);
    const isDismissed = loadDismissed(storageKey);
    if (isDismissed) setDismissed(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    if (dismissed) return;
    const id = `beta:${storageKey}`;
    push({
      id,
      kind: 'beta',
      message,
      onClose: () => {
        saveDismissed(storageKey);
        setDismissed(true);
        remove(id);
      },
    });
    return () => {
      remove(id);
    };
  }, [hydrated, dismissed, storageKey, message, push, remove]);

  return null;
}