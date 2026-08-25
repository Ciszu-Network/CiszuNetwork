'use client';

/* ------------------------------------------------------------------ *
 * Toast — sistema de notificación unificado (compartido entre las 4 webs).
 *
 * Reemplaza los sistemas divergentes de cada web (píldoras inline con
 * posición/estilo distinto, toasts "antiguos" abajo-derecha, etc.) por un
 * único ToastProvider con stack centrado inferior y colores por tipo.
 *
 * Uso:
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 *
 *   const { toast } = useToast();
 *   toast('Mensaje');                      // info (cyan)
 *   toast('Listo', 'success');             // verde
 *   toast('Ojo', 'warning');               // ámbar
 *   toast('Error', 'error');               // rojo
 *
 * El stack vive en `fixed bottom-10` centrado con z-[1000], por debajo del
 * GlobalAdvisor (bottom-14, z-[1100]) para no pisar los anuncios del admin.
 * ------------------------------------------------------------------ */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

export interface ToastContextValue {
  /** Muestra un toast. `type` default 'info' (cyan). */
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_STYLES: Record<ToastType, { color: string; border: string; shadow: string }> = {
  info: { color: '#22d3ee', border: 'rgba(34,211,238,0.4)', shadow: 'rgba(34,211,238,0.35)' },
  success: { color: '#34d399', border: 'rgba(52,211,153,0.4)', shadow: 'rgba(52,211,153,0.35)' },
  warning: { color: '#fbbf24', border: 'rgba(251,191,36,0.45)', shadow: 'rgba(251,191,36,0.35)' },
  error: { color: '#fb7185', border: 'rgba(251,113,133,0.45)', shadow: 'rgba(251,113,133,0.35)' },
};

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Duración visible en ms (default 3500). */
  duration?: number;
  /** Máximo de toasts apilados visibles a la vez (default 3). */
  max?: number;
  /** Clases extra para el viewport (stack centrado inferior). */
  viewportClassName?: string;
}

export function ToastProvider({
  children,
  duration = 3500,
  max = 3,
  viewportClassName = '',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const idRef = useRef(0);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++idRef.current;
      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        return next.length > max ? next.slice(next.length - max) : next;
      });
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [duration, max],
  );

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className={`fixed bottom-10 left-1/2 z-[1000] flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none ${viewportClassName}`}
      >
        {toasts.map((t) => {
          const style = TYPE_STYLES[t.type];
          return (
            <div
              key={t.id}
              className="animate-fade-in-up pointer-events-auto flex max-w-[90vw] items-center gap-3 rounded-full border bg-[#05050a]/95 px-5 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md sm:px-6 sm:py-3"
              style={{ borderColor: style.border, boxShadow: `0 4px 30px ${style.shadow}` }}
            >
              <span
                className="h-2 w-2 shrink-0 animate-pulse rounded-full"
                style={{ background: style.color }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-widest sm:text-xs"
                style={{ color: style.color }}
              >
                {t.message}
              </span>
              <button
                type="button"
                aria-label="Cerrar aviso"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="ml-1 shrink-0 rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}

export default ToastProvider;