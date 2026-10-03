/**
 * Catálogo de proyectos personales de Ciszuko Antony.
 *
 * Fuente de verdad de `/projects`, `/projects/[slug]` y `/portfolio`.
 * Los cuatro mundos del artista:
 *  - Ciszuko Antony  → la marca de contenido (él mismo).
 *  - MusicBoard      → el proyecto musical (álbum de estudio + Genesis Neon).
 *  - Francisco García→ la persona: currículums, certificados y trayectoria.
 *  - Ciszu Network   → la empresa que fundó.
 *
 * Reglas:
 * - Solo información real y verificable del repositorio.
 * - Cada proyecto declara su acento como clases Tailwind COMPLETAS (literales)
 *   para que el scanner las detecte; así cada card tiene su propio fondo.
 */

import { CERTIFICATES } from '@/data/certificates';

export type ProjectCategory = 'Contenido' | 'Música' | 'Persona' | 'Empresa';

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

export type ProjectStat = {
  icon: string;
  value: string;
  label: string;
};

export type ProjectAction = {
  label: string;
  href: string;
  icon: string;
  external?: boolean;
  primary?: boolean;
};

export type ProjectAccent = {
  hex: string;
  hex2: string;
  /** Gradiente de la banda/banner: `from-... via-... to-...`. */
  gradient: string;
  /** Gradiente suave del fondo de la card. */
  surface: string;
  text: string;
  chipBg: string;
  chipBorder: string;
  border: string;
  glow: string;
  solid: string;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  icon: string;
  logo: string;
  preview: string;
  banner?: string;
  categories: ProjectCategory[];
  stack: string[];
  features: ProjectFeature[];
  links: ProjectLink[];
  stats: ProjectStat[];
  highlights: { icon: string; label: string }[];
  actions: ProjectAction[];
  keywords: string[];
  status: string;
  accent: ProjectAccent;
};

const CERT_COUNT = String(CERTIFICATES.length);

/** Proyectos personales de Ciszuko Antony. */
export const PROJECTS: Project[] = [
  {
    slug: 'ciszukoantony',
    name: 'Ciszuko Antony',
    tagline: 'Youtuber, streamer y desarrollador',
    description:
      'La marca artística del CEO: contenido gaming, música, tecnología y desarrollo para la comunidad, con web oficial, portfolio y certificados.',
    longDescription:
      'Ciszuko Antony es la cara creativa del ecosistema: youtuber y streamer que produce contenido de gaming, música y tecnología, y además firma el arte y el código de todos los proyectos de Ciszu Network. Su web personal reúne el portfolio, los currículums, los certificados verificables y el musicboard con su obra musical, incluyendo Genesis Neon, el álbum que da vida a MuzicMania.',
    icon: 'star',
    logo: 'projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png',
    preview: 'projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png',
    banner: 'projects/ciszukoantony/content/banners/images/banner.png',
    categories: ['Contenido'],
    stack: ['YouTube', 'Twitch', 'TikTok', 'Instagram', 'Spotify', 'SoundCloud'],
    features: [
      { icon: 'tv', title: 'Gaming', desc: 'Gameplays, streams y contenido de videojuegos variado para la comunidad.' },
      { icon: 'music', title: 'Música', desc: 'Producción musical original: álbum Genesis Neon y el musicboard del artista.' },
      { icon: 'monitor', title: 'Tech y desarrollo', desc: 'Tutoriales y la tecnología detrás de cada proyecto del ecosistema.' },
      { icon: 'certificates', title: 'Portfolio y CV', desc: 'Portfolio visual, currículums en PDF y certificados verificables.' },
    ],
    links: [
      { label: 'Web oficial', href: 'https://ciszukoantony.vercel.app/', icon: 'globe', external: true },
      { label: 'YouTube', href: 'https://www.youtube.com/@CiszukoAntony', icon: 'play', external: true },
      { label: 'Twitch', href: 'https://www.twitch.tv/ciszukoantony_', icon: 'tv', external: true },
      { label: 'GitHub', href: 'https://github.com/CiszukoAntony', icon: 'external', external: true },
    ],
    stats: [
      { icon: 'tv', value: '5+', label: 'Plataformas de contenido' },
      { icon: 'music', value: '1', label: 'Álbum original: Genesis Neon' },
      { icon: 'certificates', value: CERT_COUNT, label: 'Certificados verificables' },
      { icon: 'user', value: 'CEO', label: 'Fundador de Ciszu Network' },
    ],
    highlights: [
      { icon: 'play', label: 'YouTube' },
      { icon: 'tv', label: 'Twitch' },
      { icon: 'music', label: 'Spotify' },
      { icon: 'camera', label: 'Instagram' },
      { icon: 'share', label: 'TikTok' },
    ],
    actions: [
      { label: 'Web oficial', href: 'https://ciszukoantony.vercel.app/', icon: 'globe', external: true },
      { label: 'Portfolio', href: '/portfolio', icon: 'portfolio' },
      { label: 'Certificados', href: '/certificates', icon: 'certificates' },
    ],
    keywords: ['youtuber', 'streamer', 'contenido', 'gaming', 'musica', 'ciszuko', 'antony', 'creador'],
    status: 'Activo',
    accent: {
      hex: '#4a7dff',
      hex2: '#ff33cc',
      gradient: 'from-[#4a7dff] via-[#68cfff] to-[#ff33cc]',
      surface: 'from-[#4a7dff]/25 via-transparent to-[#ff33cc]/15',
      text: 'text-[#68cfff]',
      chipBg: 'bg-[#4a7dff]/10',
      chipBorder: 'border-[#4a7dff]/30',
      border: 'border-[#4a7dff]/40',
      glow: 'shadow-[0_0_45px_rgba(74,125,255,0.3)]',
      solid: 'bg-[#4a7dff]',
    },
  },
  {
    slug: 'musicboard',
    name: 'MusicBoard',
    tagline: 'El proyecto musical del artista',
    description:
      'La obra musical de Ciszuko Antony: el álbum de estudio FL Studio Track Practice 2024 y la banda sonora Genesis Neon, con reproductor propio.',
    longDescription:
      'MusicBoard es el hogar musical de Ciszuko Antony: un reproductor integrado en la web con la obra propia, desde el álbum de práctica de estudio FL Studio Track Practice 2024 (compuesto y producido durante 2024) hasta Genesis Neon, la banda sonora que se juega en MuzicMania. Incluye además las playlists y el podcast oficiales en YouTube Music, y los canales donde publica su música en SoundCloud y Spotify.',
    icon: 'music',
    logo: '/musicboard/covers/fl-studio-track-practice-2024.png',
    preview: '/musicboard/covers/fl-studio-track-practice-2024.png',
    categories: ['Música'],
    stack: ['FL Studio', 'SoundCloud', 'YouTube Music', 'Spotify', 'MuzicMania'],
    features: [
      { icon: 'headset', title: 'Reproductor propio', desc: 'Escucha la obra completa sin salir de la web, con portadas y visuales reales.' },
      { icon: 'music', title: 'Álbum de estudio', desc: 'FL Studio Track Practice 2024: cuatro pistas maestras compuestas por el artista.' },
      { icon: 'gamepad', title: 'Genesis Neon', desc: 'La banda sonora de MuzicMania, jugable como niveles de ritmo.' },
      { icon: 'share', title: 'Distribución oficial', desc: 'Publicaciones reales en SoundCloud, YouTube Music y Spotify.' },
    ],
    links: [
      { label: 'Musicboard', href: '/musicboard', icon: 'music' },
      { label: 'SoundCloud', href: 'https://soundcloud.com/ciszukoantony', icon: 'music', external: true },
      { label: 'YouTube Music', href: 'https://music.youtube.com/@CiszukoAntony', icon: 'headset', external: true },
      { label: 'Spotify', href: 'https://open.spotify.com/user/317nxlvcrrlwfxjogyirixsqjmfi', icon: 'headset', external: true },
    ],
    stats: [
      { icon: 'music', value: '2', label: 'Álbumes: práctica 2024 y Genesis Neon' },
      { icon: 'headset', value: '5', label: 'Plataformas de escucha' },
      { icon: 'play', value: 'Playlist', label: 'YouTube Music oficial' },
      { icon: 'signal', value: 'FL', label: 'Producido en FL Studio' },
    ],
    highlights: [
      { icon: 'music', label: 'FL Studio' },
      { icon: 'headset', label: 'SoundCloud' },
      { icon: 'play', label: 'YouTube Music' },
      { icon: 'gamepad', label: 'MuzicMania' },
    ],
    actions: [
      { label: 'Abrir Musicboard', href: '/musicboard', icon: 'music' },
      { label: 'SoundCloud', href: 'https://soundcloud.com/ciszukoantony', icon: 'music', external: true },
      { label: 'Biblioteca MuzicMania', href: 'https://muzicmania.vercel.app/library', icon: 'gamepad', external: true },
    ],
    keywords: ['musica', 'musicboard', 'album', 'fl studio', 'genesis neon', 'soundcloud', 'spotify', 'canciones'],
    status: 'Activo',
    accent: {
      hex: '#b400ff',
      hex2: '#ff33cc',
      gradient: 'from-[#4800ff] via-[#b400ff] to-[#ff33cc]',
      surface: 'from-[#b400ff]/25 via-transparent to-[#ff33cc]/15',
      text: 'text-[#d97bff]',
      chipBg: 'bg-[#b400ff]/10',
      chipBorder: 'border-[#b400ff]/30',
      border: 'border-[#b400ff]/40',
      glow: 'shadow-[0_0_45px_rgba(180,0,255,0.3)]',
      solid: 'bg-[#b400ff]',
    },
  },
  {
    slug: 'francisco-garcia',
    name: 'Francisco García',
    tagline: 'La persona detrás del artista',
    description:
      'El perfil profesional de Francisco García: 3 currículums en PDF, certificados verificables y la trayectoria real que sostiene cada proyecto.',
    longDescription:
      'Detrás de Ciszuko Antony está Francisco García, desarrollador y profesional autodidacta. Esta página reúne su identidad profesional: los tres currículums en PDF con previsualización, los certificados verificables de instituciones y plataformas reales (Cisco, Microsoft, IBM, EF SET y más) y las áreas técnicas y personales que estudia y aplica a diario en el ecosistema.',
    icon: 'user',
    logo: 'shared/images/francisco_selfie/IMG_20251207_001627@869886661.jpg',
    preview: 'shared/images/francisco_selfie/IMG_20251207_001627@869886661.jpg',
    categories: ['Persona'],
    stack: ['Currículum', 'Certificaciones', 'Desarrollo', 'Idiomas'],
    features: [
      { icon: 'terms', title: 'Currículums', desc: '3 CV en PDF con previsualización completa, orientación y datos verificables.' },
      { icon: 'certificates', title: 'Certificaciones', desc: 'Documentos reales con enlace de verificación cuando la institución lo ofrece.' },
      { icon: 'terminal', title: 'Áreas técnicas', desc: 'Programación, datos, web, cloud, IA y diseño aplicadas a los proyectos.' },
      { icon: 'language', title: 'Idiomas', desc: 'Español nativo e inglés certificado (EF SET), en mejora continua.' },
    ],
    links: [
      { label: 'Currículum', href: '/curriculum', icon: 'certificates' },
      { label: 'Certificados', href: '/certificates', icon: 'certificates' },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/ciszuko', icon: 'external', external: true },
      { label: 'GitHub', href: 'https://github.com/CiszukoAntony', icon: 'external', external: true },
    ],
    stats: [
      { icon: 'terms', value: '3', label: 'Currículums en PDF' },
      { icon: 'certificates', value: CERT_COUNT, label: 'Certificados registrados' },
      { icon: 'users', value: '8+', label: 'Emisores: Cisco, IBM, Microsoft…' },
      { icon: 'language', value: 'ES/EN', label: 'Idiomas con certificación' },
    ],
    highlights: [
      { icon: 'certificates', label: 'Verificables' },
      { icon: 'terms', label: 'CV en PDF' },
      { icon: 'language', label: 'EF SET' },
      { icon: 'terminal', label: 'Stack técnico' },
    ],
    actions: [
      { label: 'Ver currículum', href: '/curriculum', icon: 'certificates' },
      { label: 'Ver certificados', href: '/certificates', icon: 'certificates' },
      { label: 'Contacto', href: '/contact', icon: 'mail' },
    ],
    keywords: ['francisco', 'garcia', 'persona', 'curriculum', 'cv', 'certificados', 'profesional', 'empleo'],
    status: 'Activo',
    accent: {
      hex: '#22d3ee',
      hex2: '#4a7dff',
      gradient: 'from-[#22d3ee] via-[#68cfff] to-[#4a7dff]',
      surface: 'from-[#22d3ee]/20 via-transparent to-[#4a7dff]/15',
      text: 'text-[#67e8f9]',
      chipBg: 'bg-[#22d3ee]/10',
      chipBorder: 'border-[#22d3ee]/30',
      border: 'border-[#22d3ee]/40',
      glow: 'shadow-[0_0_45px_rgba(34,211,238,0.28)]',
      solid: 'bg-[#22d3ee]',
    },
  },
  {
    slug: 'ciszunetwork',
    name: 'Ciszu Network',
    tagline: 'La empresa que fundó',
    description:
      'La compañía de innovación digital creada por Ciszuko Antony: cuatro webs, bot de Discord, juego de ritmo y paquetes compartidos.',
    longDescription:
      'Ciszu Network es la empresa que Ciszuko Antony fundó y donde aplica todo su trabajo: desarrolla y opera las cuatro webs del ecosistema (Ciszu Network, Ciszuko Antony, CiszuBot y MuzicMania), el bot de Discord, el juego de ritmo y los paquetes compartidos del monorepo. Desde aquí también se ofrecen servicios de desarrollo web, automatización, bots y diseño a la medida.',
    icon: 'portfolio',
    logo: 'projects/ciszu/content/logos/images/outline/isotype/gradient/color/ciszu_logo_isotipo_outline_degradado_zwhite_ccolor.svg',
    preview: 'projects/ciszu/content/logos/images/outline/isotype/gradient/color/ciszu_logo_isotipo_outline_degradado_zwhite_ccolor.svg',
    banner: 'projects/ciszu/content/banners/images/banner.webp',
    categories: ['Empresa'],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel'],
    features: [
      { icon: 'terminal', title: 'Desarrollo web', desc: 'Webs rápidas y accesibles con Next.js, React y TypeScript.' },
      { icon: 'robot', title: 'Bots y automatización', desc: 'CiszuBot y herramientas a medida para Discord y otros flujos.' },
      { icon: 'palette', title: 'Identidad y diseño', desc: 'Marcas, logos, flyers y sistemas visuales completos.' },
      { icon: 'server', title: 'Infraestructura', desc: 'Cloud, base de datos, CDN y despliegues automatizados.' },
    ],
    links: [
      { label: 'Web principal', href: 'https://ciszunetwork.vercel.app/', icon: 'globe', external: true },
      { label: 'Comisiones', href: '/commissions', icon: 'money' },
      { label: 'Contacto', href: '/contact', icon: 'mail' },
      { label: 'GitHub', href: 'https://github.com/Ciszu-Network', icon: 'external', external: true },
    ],
    stats: [
      { icon: 'globe', value: '4', label: 'Webs en producción' },
      { icon: 'terminal', value: '7', label: 'Paquetes compartidos' },
      { icon: 'robot', value: '1', label: 'Bot de Discord propio' },
      { icon: 'gamepad', value: '1', label: 'Juego de ritmo: MuzicMania' },
    ],
    highlights: [
      { icon: 'terminal', label: 'Next.js' },
      { icon: 'server', label: 'Supabase' },
      { icon: 'robot', label: 'CiszuBot' },
      { icon: 'gamepad', label: 'MuzicMania' },
    ],
    actions: [
      { label: 'Web de la empresa', href: 'https://ciszunetwork.vercel.app/', icon: 'globe', external: true },
      { label: 'Comisiones', href: '/commissions', icon: 'money' },
      { label: 'Ver proyectos', href: 'https://ciszunetwork.vercel.app/projects', icon: 'rocket', external: true },
    ],
    keywords: ['empresa', 'compania', 'ciszu', 'network', 'servicios', 'desarrollo', 'negocio', 'fundador'],
    status: 'Activo',
    accent: {
      hex: '#3a6bf0',
      hex2: '#68cfff',
      gradient: 'from-[#3a6bf0] via-[#59b4ff] to-[#68cfff]',
      surface: 'from-[#3a6bf0]/25 via-transparent to-[#68cfff]/10',
      text: 'text-[#59b4ff]',
      chipBg: 'bg-[#3a6bf0]/10',
      chipBorder: 'border-[#3a6bf0]/30',
      border: 'border-[#3a6bf0]/40',
      glow: 'shadow-[0_0_45px_rgba(58,107,240,0.3)]',
      solid: 'bg-[#3a6bf0]',
    },
  },
];

/** Categorías presentes en el catálogo personal (filtros de /projects y /portfolio). */
export const PROJECT_CATEGORIES: ProjectCategory[] = Array.from(
  new Set(PROJECTS.flatMap((project) => project.categories)),
) as ProjectCategory[];

export const getProject = (slug: string): Project | undefined =>
  PROJECTS.find((project) => project.slug === slug);
