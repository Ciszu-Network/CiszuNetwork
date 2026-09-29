/**
 * Catálogo de proyectos personales de Ciszuko Antony.
 *
 * Solo obra propia: los proyectos de Ciszu Network (Ciszu Network,
 * Ciszugamens, CiszuBot y MuzicMania) viven en ciszunetwork.vercel.app y no
 * se listan en esta web. Fuente de verdad de /projects, /projects/[slug] y
 * /portfolio.
 */

export type ProjectCategory = 'Web' | 'Bots' | 'Gaming' | 'Comunidad' | 'Contenido';

export type ProjectLink = {
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
};

export type ProjectFeature = {
  icon: string;
  title: string;
  desc: string;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  logo: string;
  preview: string;
  categories: ProjectCategory[];
  stack: string[];
  features: ProjectFeature[];
  links: ProjectLink[];
  status: string;
};

/** Proyectos personales de Ciszuko Antony. */
export const PROJECTS: Project[] = [
  {
    slug: 'ciszukoantony',
    name: 'Ciszuko Antony',
    tagline: 'Youtuber, streamer y desarrollador',
    description:
      'El proyecto artístico y de entretenimiento del CEO de Ciszu Network: contenido gaming, música, tecnología y desarrollo para la comunidad.',
    icon: 'star',
    logo: 'projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png',
    preview: 'projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png',
    categories: ['Contenido'],
    stack: ['YouTube', 'Twitch', 'TikTok', 'Instagram', 'Spotify'],
    features: [
      { icon: 'tv', title: 'Gaming', desc: 'Gameplays, streams y contenido de videojuegos variado.' },
      { icon: 'music', title: 'Música', desc: 'Producción musical y proyectos de audio originales.' },
      { icon: 'monitor', title: 'Tech', desc: 'Tutoriales, desarrollo y contenido tecnológico.' },
    ],
    links: [
      { label: 'YouTube', href: 'https://www.youtube.com/@CiszukoAntony', icon: 'play', external: true },
      { label: 'Twitch', href: 'https://www.twitch.tv/ciszukoantony_', icon: 'tv', external: true },
      { label: 'GitHub', href: 'https://github.com/CiszukoAntony', icon: 'external', external: true },
    ],
    status: 'Activo',
  },
];

/** Categorías presentes en el catálogo personal (filtros de /portfolio). */
export const PROJECT_CATEGORIES: ProjectCategory[] = Array.from(
  new Set(PROJECTS.flatMap((project) => project.categories)),
);

export const getProject = (slug: string): Project | undefined =>
  PROJECTS.find((project) => project.slug === slug);
