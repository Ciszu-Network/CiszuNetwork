'use client';

import React from 'react';

export type CvPreviewProps = {
  /** URL pública del PDF (CDN). */
  href: string;
  /** Nombre del documento, para accesibilidad. */
  label: string;
  /**
   * Orientación del archivo. La vista previa se adapta:
   *  - `portrait`  → marco alto (A4 vertical), ideal para CV.
   *  - `landscape` → marco ancho, para documentos horizontales.
   */
  orientation?: 'portrait' | 'landscape';
  /** Clases extra para el contenedor externo. */
  className?: string;
  /** Clases extra para el marco interior (controla el tamaño). */
  frameClassName?: string;
  /** Oculta la barra de herramientas del visor de PDF. */
  hideToolbar?: boolean;
};

const ASPECT: Record<'portrait' | 'landscape', string> = {
  portrait: 'aspect-[210/297]',
  landscape: 'aspect-[297/210]',
};

/**
 * Vista previa EN LÍNEA de un PDF. Siempre visible (sin depender de un modal):
 * el `<iframe>` usa el visor nativo del navegador y el marco respeta la
 * orientación real del archivo, de modo que un CV vertical se ve alto y no
 * recortado dentro de una caja apaisada.
 */
export default function CvPreview({
  href,
  label,
  orientation = 'portrait',
  className = '',
  frameClassName = '',
  hideToolbar = true,
}: CvPreviewProps) {
  const src = `${href}#${hideToolbar ? 'toolbar=0&navpanes=0&' : ''}view=FitH`;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white ${className}`}>
      <div className={`relative mx-auto w-full max-w-full ${ASPECT[orientation]} ${frameClassName}`}>
        <iframe
          src={src}
          title={`Vista previa de ${label}`}
          className="absolute inset-0 h-full w-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}
