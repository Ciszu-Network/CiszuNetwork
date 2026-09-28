/**
 * Curriculum de Ciszuko Antony — datos reales del repo.
 *
 * Fuente por defecto de `/portfolio` (pestaña Currículum). El CV completo
 * llegará a `shared/docs/curriculum/`; cuando ese archivo exista, el loader
 * `src/lib/curriculum-source.ts` lo lee en build/server y sobreescribe lo que
 * declare aquí, sin tocar la UI. Mientras tanto, esto es lo verificable:
 * perfil, experiencia, formación, habilidades e idiomas.
 */

import { assetUrl } from '@ciszunetwork/cdn';

export type CvProfile = {
  name: string;
  legalName: string;
  role: string;
  location: string;
  email: string;
  summary: string;
};

export type CvExperience = {
  icon: string;
  period: string;
  role: string;
  org: string;
  desc: string;
};

export type CvEducation = {
  icon: string;
  title: string;
  body: string;
};

export type CvSkill = {
  name: string;
  /** Nivel autodeclarado (0-100). */
  level: number;
};

export type CvLanguage = {
  icon: string;
  title: string;
  body: string;
};

export type CvDocument = {
  id: string;
  label: string;
  description: string;
  /** URL pública en el CDN (ciszu-cdn), ruta espejo de `shared/docs/cv/`. */
  href: string;
  /** Tamaño legible del archivo. */
  size: string;
  pages: number;
  type: 'pdf';
  /**
   * Orientación del documento: define cómo se adapta su vista previa.
   * Un CV vertical (A4/Letter) llena un marco alto; uno horizontal, uno ancho.
   */
  orientation: 'portrait' | 'landscape';
};

export type CurriculumData = {
  profile: CvProfile;
  experience: CvExperience[];
  education: CvEducation[];
  skills: CvSkill[];
  languages: CvLanguage[];
  documents: CvDocument[];
};

/**
 * CVs en PDF subidos al CDN (ciszu-cdn → shared/docs/cv/). Los archivos viven
 * fuera del repo git; aquí solo los metadatos y la URL pública de descarga.
 */
export const CV_DOCUMENTS: CvDocument[] = [
  {
    id: 'completo',
    label: 'CV completo',
    description:
      'Currículum extendido: datos personales, perfil, experiencia, formación, habilidades e idiomas.',
    href: assetUrl('shared/docs/cv/curriculum2.pdf'),
    size: '190 KB',
    pages: 7,
    type: 'pdf',
    orientation: 'portrait',
  },
  {
    id: 'resumido',
    label: 'CV resumido',
    description:
      'Versión breve del currículum, pensada para procesos de selección rápidos y lectura directa.',
    href: assetUrl('shared/docs/cv/curriculum1.pdf'),
    size: '110 KB',
    pages: 5,
    type: 'pdf',
    orientation: 'portrait',
  },
  {
    id: 'linkedin',
    label: 'CV LinkedIn',
    description:
      'Perfil exportado de LinkedIn: aptitudes principales, extracto profesional y datos de contacto.',
    href: assetUrl('shared/docs/cv/curriculum linkedin.pdf'),
    size: '43 KB',
    pages: 2,
    type: 'pdf',
    orientation: 'portrait',
  },
];

export const CURRICULUM: CurriculumData = {
  profile: {
    name: 'Ciszuko Antony',
    legalName: 'Francisco Antonio García Menolascina',
    role: 'CEO & Fundador de Ciszu Network',
    location: 'Coro, Falcón, Venezuela',
    email: 'ciszunetwork@outlook.com',
    summary:
      'Desarrollador full-stack, artista digital y fundador de Ciszu Network. Construyo webs, bots, juegos y herramientas sobre un monorepo propio con Next.js, TypeScript y Supabase, con identidad visual y documentación de ingeniería verificable.',
  },
  experience: [
    {
      icon: 'server',
      period: '2023 — Presente',
      role: 'CEO & Fundador',
      org: 'Ciszu Network',
      desc: 'Dirección de la compañía: 4 webs Next.js, bot de Discord, juego MuzicMania, paquetes compartidos e infraestructura en Vercel y Supabase.',
    },
    {
      icon: 'terminal',
      period: '2022 — Presente',
      role: 'Desarrollo full-stack',
      org: 'Proyectos propios',
      desc: 'Aplicaciones web, bots de Discord/WhatsApp/Telegram, servidores de Minecraft, scripts de automatización y herramientas internas.',
    },
    {
      icon: 'play',
      period: '2024 — Presente',
      role: 'Creador de contenido',
      org: 'Ciszuko Antony',
      desc: 'YouTube, Twitch y redes: contenido gaming, música y tecnología para la comunidad del ecosistema.',
    },
  ],
  education: [
    {
      icon: 'medal',
      title: 'Bachillerato — Diploma de graduación',
      body: 'Institución educativa. Documento de graduación archivado en el catálogo de certificados.',
    },
    {
      icon: 'globe',
      title: 'EF SET English Certificate — B1',
      body: 'EF SET (Education First), 43/100, verificación oficial en cert.efset.org.',
    },
    {
      icon: 'server',
      title: 'Cisco Networking Academy',
      body: 'HTML Essentials, CSS Essentials, Python Essentials 1 y 2, Introduction to Modern AI y Digital Awareness.',
    },
    {
      icon: 'monitor',
      title: 'Microsoft Learn & IBM SkillsBuild',
      body: 'Fundamentos de nube (Microsoft Learn), IT, open source, UX y marketing digital (IBM SkillsBuild).',
    },
    {
      icon: 'money',
      title: 'HP LIFE & cursos profesionales',
      body: 'Ciencia de datos, comunicación de negocios, marketing en redes, finanzas y planificación estratégica con IA (HP Foundation).',
    },
  ],
  skills: [
    { name: 'TypeScript', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'Next.js / React', level: 80 },
    { name: 'Python', level: 75 },
    { name: 'Java', level: 65 },
    { name: 'MongoDB / Postgres', level: 80 },
    { name: 'Docker / Linux', level: 70 },
    { name: 'UI/UX y diseño', level: 75 },
  ],
  languages: [
    { icon: 'comment', title: 'Español', body: 'Idioma nativo. Documentación y comunicación profesional.' },
    { icon: 'globe', title: 'Inglés — B1 (Intermedio)', body: 'EF SET 43/100, certificado verificable. Inglés técnico de desarrollo.' },
  ],
  documents: CV_DOCUMENTS,
};

/** Fusiona un CV externo (p. ej. `shared/docs/curriculum/curriculum.json`) sin perder datos locales. */
export function mergeCurriculum(partial: Partial<CurriculumData> | null | undefined): CurriculumData {
  if (!partial || typeof partial !== 'object') return CURRICULUM;
  return {
    profile: { ...CURRICULUM.profile, ...(partial.profile ?? {}) },
    experience: partial.experience?.length ? partial.experience : CURRICULUM.experience,
    education: partial.education?.length ? partial.education : CURRICULUM.education,
    skills: partial.skills?.length ? partial.skills : CURRICULUM.skills,
    languages: partial.languages?.length ? partial.languages : CURRICULUM.languages,
    documents: partial.documents?.length ? partial.documents : CURRICULUM.documents,
  };
}
