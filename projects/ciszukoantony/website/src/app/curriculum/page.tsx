import type { Metadata } from 'next';
import CurriculumContent from '@/components/curriculum/CurriculumContent';
import { loadCurriculum } from '@/lib/curriculum-source';

export const metadata: Metadata = {
  title: 'Curriculum | Ciszuko Antony',
  description:
    'Currículum de Ciszuko Antony (Francisco García): los 3 CV en PDF con previsualización en pantalla, experiencia, formación, habilidades, idiomas y certificaciones verificables.',
};

/**
 * `/curriculum` — página independiente del portfolio, centrada en los
 * currículums. Muestra los 3 CV en PDF con previsualización completa, sus
 * datos y la trayectoria profesional. El CV se resuelve en servidor para poder
 * leer `shared/docs/curriculum/` cuando exista.
 */
export default function CurriculumPage() {
  const cv = loadCurriculum();
  return <CurriculumContent cv={cv} />;
}
