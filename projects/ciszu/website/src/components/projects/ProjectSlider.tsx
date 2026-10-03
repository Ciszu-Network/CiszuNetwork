'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@ciszu/ui';

/**
 * ProjectSlider — carrusel horizontal ligero para las páginas de proyectos.
 *
 * - Scroll nativo con `snap-x` (funciona con rueda, trackpad y táctil).
 * - Flechas anterior/siguiente con estado deshabilitado real (llegan al fin).
 * - Fundidos laterales que aparecen solo cuando hay más contenido en esa dirección.
 * - Sin librerías extra: la animación la hace `scroll-behavior: smooth`.
 */
export default function ProjectSlider({
  title,
  icon,
  subtitle,
  itemClassName = 'w-72',
  ariaLabel,
  children,
}: {
  title?: string;
  icon?: string;
  subtitle?: string;
  itemClassName?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, children]);

  const scrollPage = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const items = React.Children.toArray(children);

  return (
    <section aria-label={ariaLabel ?? title}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        {title ? (
          <div>
            <h2 className="flex items-center gap-3 font-header text-2xl font-black text-white">
              {icon ? <Icon name={icon} size={22} /> : null}
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-widest text-white/40">
                <Icon name="info" size={13} />
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollPage(-1)}
            disabled={!canPrev}
            aria-label="Anterior"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition-all hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span className="rotate-180">
              <Icon name="chevronRight" size={16} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => scrollPage(1)}
            disabled={!canNext}
            aria-label="Siguiente"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition-all hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Fundidos laterales según la posición del scroll. */}
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#05060c] to-transparent transition-opacity duration-300 ${
            canPrev ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#05060c] to-transparent transition-opacity duration-300 ${
            canNext ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((child, index) => (
            <div key={index} className={`snap-start shrink-0 ${itemClassName}`}>
              {child}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
