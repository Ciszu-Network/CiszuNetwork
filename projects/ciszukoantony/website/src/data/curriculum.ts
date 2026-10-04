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
  /** Icono del lenguaje/tecnología (registro de @ciszu/ui). */
  icon?: string;
  /** Familia agrupadora (Lenguaje, Frontend, Backend, Bases de datos, DevOps, Herramientas, Otros). */
  family?: string;
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
  /** Fecha ISO (yyyy-mm-dd) de la última actualización del documento. */
  updated?: string;
  /** true = versión destacada/prioritaria (se muestra primero y resaltada). */
  featured?: boolean;
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
 *
 * SOLO 2 versiones oficiales (03 oct 2026): la Custom (prioritaria, primera) y
 * la de LinkedIn. Las versiones antiguas viven en `shared/docs/cv/olds-cvs/`.
 */
export const CV_DOCUMENTS: CvDocument[] = [
  {
    id: 'custom',
    label: 'CV Oficial',
    description:
      'Currículum profesional customizado: perfil completo, experiencia, formación, habilidades con logos, FODA y todo el ecosistema Ciszu Network.',
    href: assetUrl('shared/docs/cv/CV-Curriculum-Custom-Francisco_Garcia_Menolascina_Antonio-2026-Oficial.pdf'),
    size: '1.2 MB',
    pages: 2,
    type: 'pdf',
    orientation: 'portrait',
    updated: '2026-10-03',
    featured: true,
  },
  {
    id: 'linkedin',
    label: 'CV LinkedIn',
    description:
      'Versión exportada del perfil de LinkedIn (actualizada): aptitudes principales, extracto profesional y datos de contacto.',
    href: assetUrl('shared/docs/cv/CV-Curriculum-LinkedinFrancisco_Garcia_Menolascina_Antonio-2026-Oficial.pdf'),
    size: '47 KB',
    pages: 2,
    type: 'pdf',
    orientation: 'portrait',
    updated: '2026-10-03',
  },
];

export const CURRICULUM: CurriculumData = {
  profile: {
    name: 'Ciszuko Antony',
    legalName: 'Francisco Antonio García Menolascina',
    role: 'CEO & Fundador de Ciszu Network · Full-stack y artista digital',
    location: 'Coro, Falcón, Venezuela',
    email: 'ciszunetwork@outlook.com',
    summary:
      'Desarrollador full-stack y fundador de Ciszu Network. Construyo webs, bots, juegos y herramientas sobre un monorepo propio con Next.js, TypeScript, Python y Supabase, con identidad visual y documentación de ingeniería verificable. Cumplo años el 11 de noviembre, soy de Venezuela y trabajo como programador, publisher, diseñador, editor e ilustrador.',
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
      desc: 'Aplicaciones web, bots de Discord, servidores, scripts de automatización (.bat/.ps1), librerías propias publicadas con Pip (CiszuPy) y herramientas internas.',
    },
    {
      icon: 'play',
      period: '2024 — Presente',
      role: 'Creador de contenido',
      org: 'Ciszuko Antony',
      desc: 'YouTube y Twitch: contenido gaming variado, tutoriales, mods y texturas de juegos, servidores y bots de Discord para la comunidad.',
    },
    {
      icon: 'palette',
      period: '2024 — Presente',
      role: 'Diseñador, editor e ilustrador',
      org: 'Multiplataforma',
      desc: 'Suite completa de Adobe, Affinity y Corel para diseño; Davinci Resolve, Filmora y CapCut para edición; ilustración digital para el ecosistema.',
    },
  ],
  education: [
    {
      icon: 'medal',
      title: 'Bachillerato — Diploma de graduación',
      body: 'Graduado entre los mejores estudiantes. Documento de graduación archivado en el catálogo de certificados.',
    },
    {
      icon: 'graduation',
      title: 'Universidad — UPTAG (Falcón)',
      body: 'Estudiante universitario orientado a Ingeniería de Información y Sistemas, centrado en full-stack de WebApps, UI/UX, análisis de datos, bases de datos, testing y pentesting.',
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
    { name: 'Python', level: 80, icon: 'python', family: 'Lenguajes' },
    { name: 'JavaScript', level: 20, icon: 'javascript', family: 'Lenguajes' },
    { name: 'TypeScript', level: 25, icon: 'typescript', family: 'Lenguajes' },
    { name: 'HTML', level: 85, icon: 'html', family: 'Frontend' },
    { name: 'CSS', level: 85, icon: 'css', family: 'Frontend' },
    { name: 'XML', level: 30, icon: 'xml', family: 'Frontend' },
    { name: 'SASS', level: 70, icon: 'sass', family: 'Frontend' },
    { name: 'React', level: 35, icon: 'react', family: 'Frontend' },
    { name: 'Java', level: 10, icon: 'java', family: 'Lenguajes' },
    { name: 'C', level: 10, icon: 'c', family: 'Lenguajes' },
    { name: 'C++', level: 10, icon: 'cpp', family: 'Lenguajes' },
    { name: 'C#', level: 10, icon: 'csharp', family: 'Lenguajes' },
    { name: 'Lua / Luau', level: 25, icon: 'lua', family: 'Lenguajes' },
    { name: 'Julia', level: 60, icon: 'julia', family: 'Lenguajes' },
    { name: 'Ruby', level: 7, icon: 'ruby', family: 'Lenguajes' },
    { name: 'Perl', level: 7, icon: 'perl', family: 'Lenguajes' },
    { name: 'R', level: 7, icon: 'rlang', family: 'Lenguajes' },
    { name: 'Rust', level: 7, icon: 'rust', family: 'Lenguajes' },
    { name: 'ASM', level: 7, icon: 'asm', family: 'Lenguajes' },
    { name: 'Kotlin', level: 5, icon: 'kotlin', family: 'Lenguajes' },
    { name: 'Swift', level: 5, icon: 'swift', family: 'Lenguajes' },
    { name: 'SQL (SQLite)', level: 60, icon: 'sql', family: 'Bases de datos' },
    { name: 'Node.js', level: 40, icon: 'nodejs', family: 'Backend' },
    { name: 'Express.js', level: 30, icon: 'express', family: 'Backend' },
    { name: 'Django', level: 35, icon: 'django', family: 'Backend' },
    { name: 'Next.js', level: 40, icon: 'nextjs', family: 'Backend' },
    { name: 'Git / GitHub', level: 90, icon: 'github', family: 'Herramientas' },
    { name: 'npm / pnpm', level: 70, icon: 'npm', family: 'Herramientas' },
    { name: 'Docker', level: 10, icon: 'docker', family: 'DevOps' },
    { name: 'Linux / Bash', level: 25, icon: 'linux', family: 'DevOps' },
    { name: 'Prettier', level: 75, icon: 'prettier', family: 'Herramientas' },
    { name: 'ESLint', level: 70, icon: 'eslint', family: 'Herramientas' },
    { name: 'Ruff', level: 70, icon: 'ruff', family: 'Herramientas' },
    { name: 'TOML / JSON / YAML', level: 70, icon: 'config', family: 'Herramientas' },
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
