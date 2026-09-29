import type { Metadata } from 'next';
import { metadataForPath } from '@/lib/page-metadata';

/**
 * Metadata SSR estatica por ruta (Fase 4, STATIC_MIGRATION_PLAN §4.5): la
 * pagina es un client component y no puede exportar `metadata`; el layout
 * del segmento la aporta sin leer headers.
 */
export const metadata: Metadata = metadataForPath('/download');

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return children;
}