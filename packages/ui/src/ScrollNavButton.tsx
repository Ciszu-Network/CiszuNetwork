'use client';

/* ------------------------------------------------------------------ *
 * ScrollNavButton — botones flotantes "ir arriba / ir abajo".
 *
 * Compartido entre las 4 webs (antes duplicado inline en cada Footer).
 * Se posiciona en la esquina inferior-derecha (fixed bottom-8 right-8).
 * Colores por props (accent / accentAlt) para adaptarse a la marca de
 * cada web; el hover usa CSS vars para no depender de clases Tailwind
 * de un tema concreto.
 * ------------------------------------------------------------------ */

import React from 'react';

export interface ScrollNavButtonProps {
  /** Color base (borde/texto/sombra). Default #22d3ee (cyan). */
  accent?: string;
  /** Color en hover. Default #f472b6 (rosa). */
  accentAlt?: string;
  /** Clases extra para el contenedor fijo (p.ej. `[.is-fullscreen_&]:hidden`). */
  className?: string;
  /** Si true no renderiza nada (p.ej. oculto en /play). */
  hidden?: boolean;
}

export function ScrollNavButton({
  accent = '#22d3ee',
  accentAlt = '#f472b6',
  className = '',
  hidden = false,
}: ScrollNavButtonProps) {
  if (hidden) return null;

  return (
    <div
      className={`fixed bottom-8 right-8 z-40 flex flex-col gap-3 ${className}`}
      style={{
        ['--btn-accent' as string]: accent,
        ['--btn-accent-hover' as string]: accentAlt,
      }}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Ir arriba"
        className="p-3 rounded-full bg-black/60 backdrop-blur-md border-2 border-[var(--btn-accent)] text-[var(--btn-accent)] shadow-[0_0_15px_var(--btn-accent)] hover:border-[var(--btn-accent-hover)] hover:text-[var(--btn-accent-hover)] hover:shadow-[0_0_15px_var(--btn-accent-hover)] transition-all active:scale-95 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        aria-label="Ir abajo"
        className="p-3 rounded-full bg-black/60 backdrop-blur-md border-2 border-[var(--btn-accent)] text-[var(--btn-accent)] shadow-[0_0_15px_var(--btn-accent)] hover:border-[var(--btn-accent-hover)] hover:text-[var(--btn-accent-hover)] hover:shadow-[0_0_15px_var(--btn-accent-hover)] transition-all active:scale-95 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}

export default ScrollNavButton;