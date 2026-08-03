'use client';

import React from 'react';

/**
 * Componente genérico para mostrar banderas desde el sprite central.
 * @param code Código del país (ISO 3166-1 alpha-2) en minúsculas (ej: 've', 'es', 'ar').
 */
export function FlagIcon({ code, className = "w-6 h-6" }: { code: string, className?: string }) {
  const safeCode = /^[a-z]{2}$/.test(code) ? code : 'xx';
  return (
    <span className={`${className} flex-shrink-0 relative overflow-hidden rounded-sm inline-block`}>
      <svg viewBox="0 0 512 512" className="w-full h-full">
        <use href={`/icons/sprites/sprite-flags.svg#flag-${safeCode}`} />
      </svg>
    </span>
  );
}

export default FlagIcon;
