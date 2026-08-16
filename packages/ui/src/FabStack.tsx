/**
 * FabStack — sistema de botones flotantes apilados (esquina inferior-izquierda).
 *
 * Coordina los botones flotantes (InstallPdwaButton, FeedbackFab…) para que
 * funcionen como una pila con entradas y salidas animadas:
 *  - Cada botón registra un slot { order, height }. order 0 = más abajo.
 *  - El proveedor calcula el `bottom` de cada slot como la suma de los slots
 *    que quedan debajo: baseBottom + Σ(height + gap).
 *  - Cuando un botón se cierra (X) o se oculta, se des-registra y los que
 *    quedan encima BAJAN con animación (transition en `bottom`).
 *  - Cuando un botón aparece/reactiva, se registra y los demás SUBEN con
 *    animación.
 *
 * Uso:
 *   <FabStackProvider>            // en el layout, alrededor de los FABs
 *     <InstallPdwaButton ... />
 *     <FeedbackFab ... />
 *   </FabStackProvider>
 *
 *   const bottom = useFabStack('pdwa', visible ? { order: 0, height: 36 } : null);
 *   // usar `bottom` en el style del contenedor position:fixed
 *
 * Reactivación: `restoreFabButtons()` limpia los flags de dismiss del
 * localStorage y emite el evento `ciszu:fabs-restore` para que los botones
 * flotantes vuelvan a aparecer al instante (sin recargar). Úsalo desde una
 * página (p. ej. Descargas/Feedback) con el componente <FabRestore />.
 */
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export const FAB_BASE_BOTTOM = 16;
export const FAB_GAP = 8;
export const FAB_RESTORE_EVENT = 'ciszu:fabs-restore';

export const DISMISS_KEYS = [
  'ciszu-pdwa-dismissed',
  'ciszu-feedback-dismissed',
  'muzicmania-feedback-dismissed',
];

interface FabSlot {
  order: number;
  height: number;
}

interface FabStackValue {
  slots: Record<string, FabSlot>;
  baseBottom: number;
  gap: number;
  register: (id: string, slot: FabSlot) => void;
  unregister: (id: string) => void;
}

const FabStackContext = createContext<FabStackValue | null>(null);

export function FabStackProvider({
  children,
  baseBottom = FAB_BASE_BOTTOM,
  gap = FAB_GAP,
}: {
  children: ReactNode;
  baseBottom?: number;
  gap?: number;
}) {
  const [slots, setSlots] = useState<Record<string, FabSlot>>({});

  const register = useCallback((id: string, slot: FabSlot) => {
    setSlots((prev) => {
      const cur = prev[id];
      if (cur && cur.order === slot.order && cur.height === slot.height) return prev;
      return { ...prev, [id]: slot };
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setSlots((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const value = useMemo<FabStackValue>(
    () => ({ slots, baseBottom, gap, register, unregister }),
    [slots, baseBottom, gap, register, unregister]
  );

  return <FabStackContext.Provider value={value}>{children}</FabStackContext.Provider>;
}

/**
 * Hook para registrar un slot de FAB y obtener su `bottom` calculado.
 * Pasa `slot = null` para des-registrar (botón oculto/cerrado).
 */
export function useFabStack(id: string, slot: FabSlot | null): number {
  const ctx = useContext(FabStackContext);

  // El bottom se calcula en cada render desde el mapa de slots (re-activo cuando
  // cambia cualquier slot del stack). Sin proveedor → fallback a la base.
  const bottom = useMemo(() => {
    if (!ctx) return FAB_BASE_BOTTOM;
    const thisSlot = ctx.slots[id];
    if (!thisSlot) return ctx.baseBottom;
    let b = ctx.baseBottom;
    const below = Object.entries(ctx.slots)
      .filter(([k, s]) => k !== id && s.order < thisSlot.order)
      .sort((a, b2) => a[1].order - b2[1].order);
    for (const [, s] of below) b += s.height + ctx.gap;
    return b;
  }, [ctx, id]);

  // El registro se hace en un efecto cuya vida NO depende de `ctx` (que cambia de
  // identidad en cada registro → loop infinito si se usa como dep). Un ref
  // conserva la última instancia del contexto y el efecto solo se dispara cuando
  // cambian el id o la geometría del slot.
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  useEffect(() => {
    const c = ctxRef.current;
    if (!c) return;
    if (!slot) {
      c.unregister(id);
      return;
    }
    c.register(id, slot);
    return () => c.unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, slot?.order, slot?.height, slot ? 'visible' : 'hidden']);

  return bottom;
}

/**
 * Hook para escuchar el evento de restauración de botones flotantes.
 * Al dispararse, el botón que lo usa debe limpiar su estado de dismiss y
 * re-aparecer (con su animación de entrada).
 *
 * Si se pasa `keys`, el callback solo se invoca cuando entre las claves
 * restauradas hay alguna de las suyas (reactivación acotada por página).
 * Sin `keys`, el callback responde a cualquier restauración (comportamiento
 * original de restauración global).
 */
export function useFabRestore(onRestore: () => void, keys?: string[]): void {
  const cbRef = useRef(onRestore);
  cbRef.current = onRestore;
  const keysRef = useRef(keys);
  keysRef.current = keys;

  useEffect(() => {
    const handler = (e: Event) => {
      const cleared = (e as CustomEvent<{ keys?: string[] }>).detail?.keys ?? DISMISS_KEYS;
      const mine = keysRef.current;
      if (mine && !mine.some((k) => cleared.includes(k))) return;
      cbRef.current();
    };
    window.addEventListener(FAB_RESTORE_EVENT, handler);
    return () => window.removeEventListener(FAB_RESTORE_EVENT, handler);
  }, []);
}

/**
 * Restaura botones flotantes: limpia los flags de dismiss de las claves
 * indicadas (o todas si no se pasan) del localStorage y emite el evento para
 * que reaparezcan sin recargar. Pasar `keys` permite reactivar SOLO el botón
 * de una página concreta.
 */
export function restoreFabButtons(keys: string[] = [...DISMISS_KEYS]): void {
  if (typeof window !== 'undefined') {
    try {
      for (const k of keys) localStorage.removeItem(k);
    } catch {
      /* noop */
    }
    window.dispatchEvent(new CustomEvent(FAB_RESTORE_EVENT, { detail: { keys } }));
  }
}

const fabRestoreBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 999,
  padding: '10px 18px',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  color: '#e4e4e7',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.18)',
  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
};

/**
 * Botón compartido "Restaurar botón flotante". Se coloca en páginas
 * (Descargas / Feedback / Soporte) para que el usuario pueda volver a mostrar
 * los botones flotantes que cerró con la X. Estilo autocontenido (inline).
 *
 * `keys` acota la reactivación a un botón concreto (p. ej. `['ciszu-pdwa-dismissed']`);
 * sin él se restauran todos (comportamiento original).
 */
export function FabRestore({ accent = '#00e5ff', keys }: { accent?: string; keys?: string[] }) {
  const [done, setDone] = useState(false);

  const handle = () => {
    restoreFabButtons(keys);
    setDone(true);
    setTimeout(() => setDone(false), 2600);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handle}
        aria-label="Restaurar botones flotantes"
        style={{
          ...fabRestoreBtnStyle,
          borderColor: done ? accent : undefined,
          boxShadow: done ? `0 0 16px ${accent}66` : undefined,
        }}
      >
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={done ? accent : 'currentColor'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          {done ? (
            <polyline points="20 6 9 17 4 12" />
          ) : (
            <>
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </>
          )}
        </svg>
        {done ? 'Botones restaurados' : 'Restaurar botón flotante'}
      </button>
    </div>
  );
}
