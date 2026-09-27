import type { Metadata } from 'next';
import PortfolioContent from '@/components/portfolio/PortfolioContent';
import { loadCurriculum } from '@/lib/curriculum-source';

export const metadata: Metadata = {
  title: 'Portfolio & CV | Ciszuko Antony',
  description:
    'Portfolio interactivo y currículum de Ciszuko Antony: proyectos del ecosistema, experiencia, formación, habilidades, idiomas y certificaciones verificables.',
};

/**
 * `/portfolio` — la única página de portfolio: fusiona la galería de trabajos
 * y el currículum (antes `/curriculum`) en una ficha con pestañas. El CV se
 * resuelve en servidor para poder leer `shared/docs/curriculum/` cuando exista.
 */
export default function PortfolioPage() {
  const cv = loadCurriculum();
  return <PortfolioContent cv={cv} />;
}
