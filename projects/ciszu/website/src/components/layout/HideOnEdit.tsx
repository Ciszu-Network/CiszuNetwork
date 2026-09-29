'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Oculta el chrome del sitio en las rutas del editor (`/edit/*`).
 *
 * Fase 4 (STATIC_MIGRATION_PLAN §4.5): el layout raíz ya no lee el header
 * interno `x-is-edit` (eso hacía dinámica toda la web); el pathname se resuelve
 * en cliente con `usePathname()`, que también está disponible durante el
 * prerender estático de cada ruta.
 */
export default function HideOnEdit({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/edit' || pathname.startsWith('/edit/')) return null;
  return <>{children}</>;
}
