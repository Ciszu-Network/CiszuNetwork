'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * `main` con padding dependiente de la ruta: sin padding superior en el editor
 * (`/edit/*`), con padding para la navbar en el resto. Fase 4
 * (STATIC_MIGRATION_PLAN §4.5): sustituye la lectura de `x-is-edit` en el
 * layout raíz para no forzar render dinámico por visita.
 */
export default function SiteMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isEdit = pathname === '/edit' || pathname.startsWith('/edit/');
  return <main className={isEdit ? 'flex-grow' : 'flex-grow pt-[60px]'}>{children}</main>;
}
