'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  /** Valor real a mostrar. `null` = sin datos (se muestra "—"). */
  value: number | null;
  /** Duración de la animación en ms. */
  duration?: number;
  /** Locale para `toLocaleString` (es/en según el idioma activo). */
  locale?: string;
  className?: string;
}

/** Respeta la preferencia del sistema de reducir movimiento. */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Contador animado con IntersectionObserver: cuenta desde 0 hasta el valor
 * real cuando entra en pantalla. Sin dependencias y sin datos inventados:
 * si el valor es `null`, muestra "—".
 */
export default function AnimatedCounter({
  value,
  duration = 1300,
  locale,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  // Arranca cuando el contador entra en pantalla.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (value === null || !started) return;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const from = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, started, duration]);

  if (value === null) {
    return <span className={className}>—</span>;
  }

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {display.toLocaleString(locale)}
    </span>
  );
}
