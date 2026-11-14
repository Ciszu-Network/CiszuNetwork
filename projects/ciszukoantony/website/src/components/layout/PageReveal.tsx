'use client';

/**
 * PageReveal — animación de entrada única de las páginas de contenido de
 * Ciszuko Antony (mismo initial/animate/transition en todas las rutas).
 *
 * Va dentro del contenedor canónico (`relative min-h-screen pt-24 pb-20 px-4`)
 * y ENVUELVE el contenido, nunca al `<PageAmbience />`: el `transform` de
 * framer-motion convertiría a un hijo `fixed` en relativo al wrapper.
 */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PageRevealProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageReveal({ children, className = '' }: PageRevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
