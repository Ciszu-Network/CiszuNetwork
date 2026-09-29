import { PROJECTS } from '@/data/projects';
import ProjectDetailPage from './client';

/**
 * Fase 5 (STATIC_MIGRATION_PLAN §14): `/projects/[slug]` pasa de `ƒ` a SSG.
 *
 * `PROJECTS` (`src/data/projects.ts`) es estático, así que cada slug real se
 * pre-renderiza con `generateStaticParams`; `dynamicParams = false` corta en
 * 404 los slugs inexistentes (no se inventan proyectos). Sin `revalidate`: el
 * catálogo solo cambia con cada deploy.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export default function Page() {
  return <ProjectDetailPage />;
}
