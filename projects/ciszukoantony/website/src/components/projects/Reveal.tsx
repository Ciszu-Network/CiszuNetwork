'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reveal — entrada suave al hacer scroll (opacidad + desplazamiento vertical).
 * Se usa con `delay` creciente para escalonar tarjetas y secciones.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Floating — flotación continua suave (logos, isotipos y retratos destacados).
 */
export function Floating({
  children,
  className,
  amplitude = 8,
  duration = 5,
}: {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * GlowOrb — orbe de luz pulsante para fondos de sección.
 */
export function GlowOrb({
  color,
  className,
  duration = 6,
}: {
  color: string;
  className?: string;
  duration?: number;
}) {
  return (
    <motion.div
      animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.08, 1] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className={`pointer-events-none absolute rounded-full blur-[130px] ${className ?? ''}`}
      style={{ background: color }}
    />
  );
}
