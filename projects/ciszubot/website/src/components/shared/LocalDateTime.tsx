'use client';

import { useEffect, useState } from 'react';

interface LocalDateTimeProps {
  /** ISO, epoch o Date. */
  value: string | number | Date | null | undefined;
  /** Locale BCP-47 (p. ej. 'es', 'en-US'). */
  locale?: string;
  /** Opciones de Intl.DateTimeFormat (p. ej. solo fecha). */
  options?: Intl.DateTimeFormatOptions;
  /** Texto mientras no se ha montado (el SSR no conoce la zona del usuario). */
  placeholder?: string;
  className?: string;
}

/**
 * Fecha/hora en la zona DEL USUARIO sin romper la hidratación.
 *
 * El servidor (Vercel, UTC) no puede saber la zona horaria del navegador:
 * formatear con `toLocaleString` en SSR produce un texto distinto al del
 * cliente (`19:20:31` vs `3:20:31 PM`) y React tira la hidratación COMPLETA de
 * la página (error #418) — ningún botón responde. Por eso el SSR y el primer
 * render muestran el placeholder; el valor formateado aparece al montar.
 */
export default function LocalDateTime({
  value,
  locale,
  options,
  placeholder = '—',
  className,
}: LocalDateTimeProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (value === null || value === undefined) return <span className={className}>{placeholder}</span>;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return <span className={className}>{placeholder}</span>;

  return (
    <time className={className} dateTime={date.toISOString()}>
      {mounted ? date.toLocaleString(locale, options) : placeholder}
    </time>
  );
}
