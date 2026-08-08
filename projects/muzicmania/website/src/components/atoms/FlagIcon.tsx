'use client';

import React from 'react';
import { Icon } from '@ciszu/ui';

/**
 * Componente genérico para mostrar banderas desde el sistema de iconos unificado.
 * @param code Código del país (ISO 3166-1 alpha-2) en minúsculas (ej: 've', 'es', 'ar').
 */
export function FlagIcon({ code, className = "w-6 h-6" }: { code: string, className?: string }) {
  const safeCode = /^[a-z]{2}$/.test(code) ? code : 'xx';
  if (safeCode === 'xx') return null;
  return (
    <span className={`${className} flex-shrink-0 relative overflow-hidden rounded-sm inline-block`}>
      <Icon name={safeCode} style="flag" size={24} height={16} className="w-full h-full" />
    </span>
  );
}

export default FlagIcon;
