import type { Metadata } from 'next';
import PortfolioContent from '@/components/portfolio/PortfolioContent';

export const metadata: Metadata = {
  title: 'Portfolio | Ciszuko Antony',
  description:
    'Portfolio de Ciszuko Antony: proyectos del ecosistema — webs, bots, juego, comunidad, contenido y herramientas — filtrables por categoría. El currículum vive en /curriculum.',
};

/**
 * `/portfolio` — galería de trabajos. El currículum se movió a su propia
 * página (`/curriculum`), que prioriza la previsualización de los CV.
 */
export default function PortfolioPage() {
  return <PortfolioContent />;
}
