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

import { useEffect, useState } from 'react';
import { useAdsSafe } from './Ads';

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
  const ads = useAdsSafe();
  const [isPhone, setIsPhone] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsPhone(mq.matches);
    const onScroll = () => setScrolled(window.scrollY > 160);
    update();
    onScroll();
    mq.addEventListener('change', update);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Si hay un anuncio de esquina activo, sube los botones para que NO se
  // superpongan: se desplazan por encima del anuncio con transición fluida.
  const cornerActive = ads?.current?.type === 'particulares' || ads?.floatingActive;
  // En móvil el anuncio ocupa casi todo el ancho y no hay sitio para dos
  // columnas de flotantes: se ocultan las flechas mientras el anuncio está vivo.
  const lift = cornerActive ? (isPhone ? 0 : 340) : 0;
  if (hidden || !scrolled || (isPhone && cornerActive)) return null;

  return (
    <div
      className={`fixed right-3 sm:right-8 z-40 flex flex-col gap-2 sm:gap-3 ${className}`}
      style={{
        bottom: `calc(1rem + ${lift}px + env(safe-area-inset-bottom, 0px))`,
        transition: 'bottom .45s cubic-bezier(.16,1,.3,1)',
        ['--btn-accent' as string]: accent,
        ['--btn-accent-hover' as string]: accentAlt,
      }}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Ir arriba"
        className="p-2.5 sm:p-3 rounded-full bg-black/60 backdrop-blur-md border-2 border-[var(--btn-accent)] text-[var(--btn-accent)] shadow-[0_0_15px_var(--btn-accent)] hover:border-[var(--btn-accent-hover)] hover:text-[var(--btn-accent-hover)] hover:shadow-[0_0_15px_var(--btn-accent-hover)] transition-all active:scale-95 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        aria-label="Ir abajo"
        className="p-2.5 sm:p-3 rounded-full bg-black/60 backdrop-blur-md border-2 border-[var(--btn-accent)] text-[var(--btn-accent)] shadow-[0_0_15px_var(--btn-accent)] hover:border-[var(--btn-accent-hover)] hover:text-[var(--btn-accent-hover)] hover:shadow-[0_0_15px_var(--btn-accent-hover)] transition-all active:scale-95 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}

export default ScrollNavButton;