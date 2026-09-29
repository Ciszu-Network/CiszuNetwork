import { CHANGELOG_DATA } from '@/data/changelog';
import ChangelogDetail from './client';

/**
 * Fase 5 (STATIC_MIGRATION_PLAN §14): el detalle deja de ser `ƒ`.
 *
 * El contenido real lo componen `src/data/changelog.ts` (estático, ya horneado
 * en el HTML) y el almacén vivo del devcon (`usePublishedChangelogs`, cliente).
 * `generateStaticParams` pre-renderiza los ids conocidos; las entradas nuevas
 * publicadas desde el devcon siguen funcionando por render bajo demanda
 * (`dynamicParams` por defecto), por eso NO se fija en `false`.
 *
 * `revalidate` acota la caché de las rutas generadas bajo demanda (devcon) a
 * 1 h; el shell de los ids estáticos solo cambia con cada deploy.
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return CHANGELOG_DATA.map((entry) => ({ id: entry.id }));
}

export default function Page() {
  return <ChangelogDetail />;
}
