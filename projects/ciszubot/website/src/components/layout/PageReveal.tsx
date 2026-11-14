'use client';

/**
 * Entrada estándar de las páginas de contenido: un único fade + desplazamiento
 * corto al montar, idéntico en todas las páginas. Sustituye las animaciones
 * ad-hoc (motion.header, CSS fade-in-up, etc.) para que no haya saltos entre
 * páginas de la misma web.
 *
 * Se aplica al hero de cada página: el contenido interactivo (modales, docks,
 * paneles fijos) queda fuera del wrapper animado para no romper `position:
 * fixed`.
 */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function PageReveal({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
