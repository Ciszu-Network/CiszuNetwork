'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquareWarning } from 'lucide-react';
import { useFabStack, useFabRestore } from '@ciszu/ui';
import { openSentryFeedback } from '@/lib/sentry';

const STORAGE_KEY = 'ciszu-feedback-dismissed';

/**
 * FeedbackFab — acceso rápido flotante "Reportar un problema" (Sentry Feedback).
 *
 * - Esquina inferior-izquierda, justo encima del botón PDWA (InstallPdwaButton).
 * - Al pulsar el botón principal abre el widget de Sentry (openSentryFeedback).
 * - Tiene su propio ✕: guarda "ciszu-feedback-dismissed" en localStorage y no
 *   vuelve a salir.
 * - Al pulsar ✕ muestra un mini-panel de advertencia con links a Feedback y
 *   Descargas para reactivarlo (quita el flag de localStorage).
 */
export default function FeedbackFab() {
  const [dismissed, setDismissed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') setDismissed(true);
    } catch {
      /* storage no disponible */
    }
  }, []);

  const handleOpen = useCallback(() => {
    void openSentryFeedback();
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setShowWarning(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* noop */
    }
  }, []);

  const handleReenable = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setDismissed(false);
    setShowWarning(false);
  }, []);

  const stackBottom = useFabStack('feedback', !dismissed ? { order: 1, height: 36 } : null);
  useFabRestore(handleReenable);

  if (dismissed && !showWarning) return null;

  return (
    <div className="fixed left-[16px] z-[60]" style={{ bottom: stackBottom, transition: 'bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      {showWarning && (
        <div className="mb-3 w-72 max-w-[calc(100vw-32px)] p-4 rounded-2xl border border-white/15 bg-[#0a0a12]/95 text-[#e4e4e7] text-xs leading-relaxed shadow-[0_0_28px_rgba(250,204,21,0.35)] backdrop-blur-xl animate-fade-in-up">
          <p className="font-bold mb-1" style={{ color: '#fbbf24' }}>
            Feedback ocultado
          </p>
          <p className="text-[#a1a1aa] mb-3">
            Has ocultado el botón de reporte. Siempre puedes reactivarlo o escribirnos
            directamente.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/feedback"
              onClick={handleReenable}
              className="px-3 py-1.5 rounded-full bg-[#22d3ee] text-black font-bold text-[10px] uppercase tracking-widest hover:brightness-110 cursor-pointer"
            >
              Feedback
            </Link>
            <Link
              href="/descargas"
              onClick={handleReenable}
              className="px-3 py-1.5 rounded-full border border-white/25 text-[#e4e4e7] font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 cursor-pointer"
            >
              Descargas
            </Link>
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="px-3 py-1.5 rounded-full border border-white/15 text-[#a1a1aa] font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {!dismissed && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpen}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            onFocus={() => setExpanded(true)}
            onBlur={() => setExpanded(false)}
            aria-label="Reportar un problema"
            title="Reportar un problema"
            className={[
              'flex items-center h-9 rounded-full border backdrop-blur-xl bg-[#0a0a12]/60 text-white cursor-pointer overflow-hidden transition-all duration-500',
              expanded ? 'border-[#22d3ee] w-[168px] shadow-[0_0_18px_rgba(34,211,238,0.5)]' : 'border-white/15 w-9 shadow-[0_0_10px_rgba(0,0,0,0.4)]',
            ].join(' ')}
          >
            <span className="relative flex items-center justify-center w-9 h-9 shrink-0">
              <MessageSquareWarning className="w-4 h-4 relative z-10" style={{ color: expanded ? '#22d3ee' : '#e4e4e7' }} />
              {!expanded && (
                <span
                  className="absolute inset-2 rounded-full"
                  style={{ background: '#22d3ee', filter: 'blur(6px)', opacity: 0.25 }}
                />
              )}
            </span>
            <span
              className={[
                'whitespace-nowrap pr-3 text-[11px] font-bold tracking-wide cursor-pointer',
                expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none',
              ].join(' ')}
              style={{ color: '#22d3ee', transition: 'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)' }}
            >
              Reportar un problema
            </span>
          </button>

          <button
            type="button"
            aria-label="No volver a mostrar"
            title="No volver a mostrar"
            onClick={handleDismiss}
            className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full border border-white/15 bg-[#0a0a12]/60 text-[#a1a1aa] text-[10px] cursor-pointer backdrop-blur-xl hover:border-white/30 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}