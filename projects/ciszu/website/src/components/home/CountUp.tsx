'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface CountUpProps {
  /** Valor final del contador. */
  value: number;
  /** Duración de la animación en ms. */
  duration?: number;
  className?: string;
}

/**
 * Contador animado de la home.
 *
 * Se activa la primera vez que entra en el viewport (IntersectionObserver de
 * `react-intersection-observer`, ya en el stack) y avanza con
 * `requestAnimationFrame` + easing cúbico. Sin dependencias nuevas.
 */
export function CountUp({ value, duration = 1400, className = '' }: CountUpProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [current, setCurrent] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * value));
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {current}
    </span>
  );
}

export default CountUp;
