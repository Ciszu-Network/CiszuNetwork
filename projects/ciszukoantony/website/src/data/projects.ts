/**
 * Catálogo de proyectos de Ciszuko Antony.
 *
 * Fuente de verdad de /projects, /projects/[slug] y /portfolio: cada entrada
 * declara datos reales del monorepo (stack, URLs de despliegue y enlaces
 * públicos verificados) para no duplicar contenido entre páginas.
 */

export type ProjectCategory = 'Web' | 'Bots' | 'Gaming' | 'Comunidad' | 'Contenido' | 'Portfolio';

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

export const PROJECTS: Project[] = [
  {
    slug: 'ciszubot',
    name: 'CiszuBot',
    tagline: 'Bot inteligente de Discord',
    description:
      'El bot oficial del ecosistema Ciszu Network: moderación, música, economía, juegos y automatización, con web propia, estado en vivo y soporte.',
    icon: 'robot',
    logo: 'projects/ciszubot/content/logos/images/not-outline/isotype/color/ciszubot_logo_isotipo_color.png',
    preview: 'projects/ciszubot/content/thumbnails/images/thumbnail.png',
    categories: ['Bots', 'Web'],
    stack: ['Discord.js', 'TypeScript', 'Node.js', 'Docker', 'Supabase'],
    features: [
      { icon: 'shield', title: 'Moderación', desc: 'Anti-spam, filtros, roles y herramientas de gestión para el servidor.' },
      { icon: 'music', title: 'Música', desc: 'Reproducción de audio de calidad en los canales de voz.' },
      { icon: 'money', title: 'Economía', desc: 'Monedas, niveles, inventario y tiendas configurables.' },
      { icon: 'settings', title: 'Automatización', desc: 'Bienvenidas, tickets, logs y comandos personalizados.' },
    ],
    links: [
      { label: 'Web oficial', href: 'https://ciszubot.vercel.app', icon: 'globe', external: true },
      { label: 'Invitar al bot', href: 'https://discord.com/oauth2/authorize?client_id=1395532235872141312&permissions=8&scope=bot%20applications.commands', icon: 'robot', external: true },
      { label: 'Top.gg', href: 'https://top.gg/bot/1395532235872141312', icon: 'trophy', external: true },
      { label: 'GitHub', href: 'https://github.com/Ciszu-Network/CiszuNetwork', icon: 'external', external: true },
    ],
    status: 'En producción',
  },
  {
    slug: 'muzicmania',
    name: 'MuzicMania',
    tagline: 'El juego de ritmo definitivo',
    description:
      'Juego de ritmo en la web con estética futurista y álbumes originales, además de app de escritorio con instalador para Windows.',
    icon: 'music',
    logo: 'projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.png',
    preview: 'projects/muzicmania/content/music/albums/genesis_neon/cyber_beat/cover.png',
    categories: ['Gaming', 'Web'],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Web Audio', 'Supabase', 'Tauri'],
    features: [
      { icon: 'gamepad', title: 'Juego rítmico', desc: 'Mecánicas fluidas con puntuación, combos y progresión por canciones.' },
      { icon: 'music', title: 'Música original', desc: 'Álbumes compuestos para el juego, como Genesis Neon.' },
      { icon: 'monitor', title: 'App de escritorio', desc: 'Versión Tauri para Windows con instalador NSIS.' },
      { icon: 'trophy', title: 'Scores online', desc: 'Tablas de puntuación con autenticación CISZU ID y Supabase.' },
    ],
    links: [
      { label: 'Jugar ahora', href: 'https://muzicmania.vercel.app', icon: 'gamepad', external: true },
      { label: 'GitHub', href: 'https://github.com/Ciszu-Network/CiszuNetwork', icon: 'external', external: true },
    ],
    status: 'En producción',
  },
  {
    slug: 'ciszugamens',
    name: 'Ciszugamens',
    tagline: 'La comunidad del ecosistema',
    description:
      'La comunidad gamer y digital de Ciszu Network, unida en Discord, WhatsApp y Telegram: eventos, partidas, soporte y bots.',
    icon: 'gamepad',
    logo: 'projects/ciszugamens/content/logos/images/outline/isotype/gradient/color/ciszugamens_logo_isotipo_degradado_outline_color_cpurple_zblue.svg',
    preview: 'projects/ciszugamens/content/banners/images/banner.png',
    categories: ['Comunidad'],
    stack: ['Discord', 'WhatsApp', 'Telegram', 'Top.gg', 'Disboard'],
    features: [
      { icon: 'users', title: 'Comunidad activa', desc: 'Gamers, creadores y fans del ecosistema en un mismo espacio.' },
      { icon: 'trophy', title: 'Eventos', desc: 'Torneos, partidas y dinámicas para toda la comunidad.' },
      { icon: 'comment', title: 'Soporte directo', desc: 'Atención y ayuda rápida desde cualquiera de las plataformas.' },
    ],
    links: [
      { label: 'Discord', href: 'https://discord.com/invite/W3kMtMMj6E', icon: 'discord', external: true },
      { label: 'WhatsApp', href: 'https://wa.me/584126858111', icon: 'comment', external: true },
      { label: 'Telegram', href: 'https://t.me/CiszukoNetwork', icon: 'share', external: true },
      { label: 'Top.gg', href: 'https://top.gg/es/discord/servers/871620279188504576', icon: 'trophy', external: true },
    ],
    status: 'Activo',
  },
  {
    slug: 'ciszunetwork',
    name: 'Ciszu Network',
    tagline: 'Compañía de innovación digital',
    description:
      'El núcleo del ecosistema: desarrollo web, infraestructura cloud, UI/UX, bots y soluciones digitales de alto rendimiento, fundada por Ciszuko Antony.',
    icon: 'server',
    logo: 'projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zcolor_ccolor.png',
    preview: 'projects/ciszu/content/logos/images/outline/logotype/gradient/color/ciszu_logotipo_outline_zcolor_cwhite_full.png',
    categories: ['Web', 'Portfolio'],
    stack: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Supabase', 'Vercel', 'Turborepo'],
    features: [
      { icon: 'globe', title: '4 webs Next.js', desc: 'Ciszu Network, Ciszuko Antony, MuzicMania y CiszuBot.' },
      { icon: 'robot', title: 'Bot + juego', desc: 'Discord.js en Docker y juego de ritmo con app de escritorio.' },
      { icon: 'server', title: 'Infraestructura', desc: 'Supabase (Postgres, auth y CDN), Vercel y CI/CD con GitHub Actions.' },
      { icon: 'users', title: 'Comunidad', desc: 'Ciszugamens en Discord, WhatsApp y Telegram.' },
    ],
    links: [
      { label: 'Sitio principal', href: 'https://ciszunetwork.vercel.app', icon: 'globe', external: true },
      { label: 'GitHub', href: 'https://github.com/Ciszu-Network/CiszuNetwork', icon: 'external', external: true },
    ],
    status: 'En producción',
  },
  {
    slug: 'ciszukoantony',
    name: 'Ciszuko Antony',
    tagline: 'Youtuber, streamer y desarrollador',
    description:
      'El proyecto artístico y de entretenimiento del CEO de Ciszu Network: contenido gaming, música, tecnología y desarrollo para la comunidad.',
    icon: 'star',
    logo: 'projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png',
    preview: 'shared/images/francisco_selfie/IMG_20251207_001627@869886661.jpg',
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
  {
    slug: 'portfolio',
    name: 'Portfolio Web',
    tagline: 'Este sitio, en abierto',
    description:
      'El portfolio personal construido sobre el monorepo: certificados verificables, proyectos, documentación y app de escritorio (PDWA), con CISZU ID y CDN propio.',
    icon: 'palette',
    logo: 'projects/ciszukoantony/content/logos/images/samples/circle/circle_1_yt.png',
    preview: 'projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png',
    categories: ['Web', 'Portfolio'],
    stack: ['Next.js 15', 'React 19', 'Tailwind CSS 4', 'Supabase (CISZU ID)', 'Puck', 'Vercel'],
    features: [
      { icon: 'certificates', title: 'Certificados', desc: 'Catálogo de documentos verificables con enlaces oficiales.' },
      { icon: 'download', title: 'PDWA', desc: 'Instalación como app de escritorio (PWA/PDWA).' },
      { icon: 'edit', title: 'Editor visual', desc: 'Páginas editables con Puck sobre componentes propios.' },
    ],
    links: [
      { label: 'Ver portfolio', href: '/portfolio', icon: 'palette' },
      { label: 'Certificados', href: '/certificates', icon: 'certificates' },
      { label: 'GitHub', href: 'https://github.com/Ciszu-Network/CiszuNetwork', icon: 'external', external: true },
    ],
    status: 'En producción',
  },
];

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Web',
  'Bots',
  'Gaming',
  'Comunidad',
  'Contenido',
  'Portfolio',
];

export const getProject = (slug: string): Project | undefined =>
  PROJECTS.find((project) => project.slug === slug);
