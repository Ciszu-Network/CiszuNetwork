/**
 * Resumen validado del CV Custom de Ciszuko Antony (oct 2026).
 *
 * Extraído del documento `CV-Curriculum-Custom-...-2026-Oficial.pdf` (fuente de
 * verdad en `shared/docs/cv/`) y del catálogo real de la web. Se usa en la
 * página `/curriculum` para mostrar, junto a los PDFs, un resumen del contenido
 * del CV principal (el más relevante) y del LinkedIn.
 */

export interface CvHighlight {
  icon: string;
  label: string;
  body: string;
}

export interface CvSummaryBlock {
  id: string;
  title: string;
  tone: 'purple' | 'pink' | 'cyan' | 'green';
  highlights: CvHighlight[];
}

export const CV_CUSTOM_SUMMARY: CvSummaryBlock[] = [
  {
    id: 'perfil',
    title: 'Perfil',
    tone: 'purple',
    highlights: [
      { icon: 'user', label: 'Identidad', body: 'Ciszuko Antony (Francisco Antonio García Menolascina), 17 años, Venezuela.' },
      { icon: 'server', label: 'Cargo', body: 'CEO y fundador de Ciszu Network, desarrollador full-stack y artista digital.' },
      { icon: 'graduation', label: 'Formación', body: 'UPTAG Falcón — Ingeniería de Información y Sistemas (en curso).' },
    ],
  },
  {
    id: 'experiencia',
    title: 'Experiencia',
    tone: 'cyan',
    highlights: [
      { icon: 'rocket', label: 'Ciszu Network', body: '4 webs Next.js, bot de Discord, juego MuzicMania, paquetes compartidos e infraestructura Vercel/Supabase/GCP.' },
      { icon: 'terminal', label: 'Full-stack', body: 'WebApps, bots, CLI y herramientas sobre monorepo propio con Next.js, TypeScript, Python y Supabase.' },
      { icon: 'play', label: 'Contenido', body: 'YouTube/Twitch gaming, tutoriales, mods, servidores y bots de Discord.' },
    ],
  },
  {
    id: 'habilidades',
    title: 'Habilidades destacadas',
    tone: 'pink',
    highlights: [
      { icon: 'chip', label: 'Stack', body: 'Python 80% · HTML/CSS 85% · Git/GitHub 90% · SQL 60% · React 35%.' },
      { icon: 'palette', label: 'Diseño', body: 'Adobe, Affinity, Corel, DaVinci Resolve, Filmora y CapCut.' },
      { icon: 'certificates', label: 'Certificados', body: '55+ documentos reales de Cisco, Microsoft, IBM, HP, EF SET, Penn y más.' },
    ],
  },
  {
    id: 'aspiraciones',
    title: 'Aspiraciones',
    tone: 'green',
    highlights: [
      { icon: 'target', label: 'Meta', body: 'Ingeniero de Información y Sistemas, especialista en full-stack, UI/UX, datos, testing y pentesting.' },
      { icon: 'gamepad', label: 'Sueños', body: 'Crear programas ejecutables, interfaces CLI/GUI y videojuegos.' },
      { icon: 'share', label: 'Comunidad', body: 'Crecimiento del ecosistema Ciszu Network y contenido para la comunidad.' },
    ],
  },
];

export const CV_LINKEDIN_SUMMARY = [
  'Extracto profesional exportado de LinkedIn (actualizado oct 2026).',
  'Aptitudes principales, trayectoria y datos de contacto en formato estándar.',
  'Complementa al CV Custom con una visión concisa y orientada al reclutador.',
];