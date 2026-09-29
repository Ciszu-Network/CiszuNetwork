'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Modo "desnudo" de /youareanidiot (test no oficial): renderiza `fallback`
 * (el contenido a pantalla completa, sin chrome ni overlays) y en el resto de
 * rutas el árbol normal.
 *
 * Fase 4 (STATIC_MIGRATION_PLAN §4.5): sustituye la lectura del header interno
 * `x-is-bare` en el layout raíz, que hacía dinámica toda la web por visita.
 * `usePathname()` funciona también durante el prerender estático de cada ruta.
 */
export default function BareGate({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === '/youareanidiot') return <>{fallback}</>;
  return <>{children}</>;
}
