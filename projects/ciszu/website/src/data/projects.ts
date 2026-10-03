/**
 * Catálogo central de proyectos del ecosistema Ciszu Network.
 *
 * Fuente única de `/projects` (índice con búsqueda, filtros, ordenamiento,
 * cards únicas y modal por proyecto) y de las páginas internas, que lo usan
 * para mostrar hero, stack, estadísticas y enlaces sin duplicar datos.
 *
 * Reglas:
 * - Los assets se declaran con su ruta espejo del CDN (`projects/...`).
 * - Los colores de acento viven aquí como clases Tailwind COMPLETAS (literales)
 *   para que el scanner de Tailwind las detecte: cada proyecto tiene su propio
 *   fondo, borde, brillo y gradiente.
 * - Solo se declara información real y verificable del ecosistema.
 */

export type ProjectStat = {
  icon: string;
  value: string;
  label: string;
};

export type ProjectFeature = {
  icon: string;
  title: string;
  desc: string;
};

export type ProjectAction = {
  label: string;
  href: string;
  icon: string;
  external?: boolean;
  /** El botón principal del modal (ir a la página del proyecto). */
  primary?: boolean;
};

export type ProjectAccent = {
  /** Color base en hex (para estilos inline y sombras). */
  hex: string;
  /** Segundo color del degradado. */
  hex2: string;
  /** Gradiente de banda/banner: `from-... via-... to-...`. */
  gradient: string;
  /** Gradiente suave de fondo de la card. */
  surface: string;
  /** Color de texto acentuado. */
  text: string;
  chipBg: string;
  chipBorder: string;
  border: string;
  glow: string;
  solid: string;
};

export type Project = {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  kicker: string;
  description: string;
  longDescription: string;
  logo: string;
  banner?: string;
  categories: string[];
  status: string;
  launched: string;
  owner: string;
  /** Enlace de comunidad principal (Discord, WhatsApp, etc.). */
  community?: string;
  /** Página oficial externa del proyecto. */
  official?: string;
  accent: ProjectAccent;
  stats: ProjectStat[];
  features: ProjectFeature[];
  highlights: { icon: string; label: string }[];
  stack: string[];
  actions: ProjectAction[];
  keywords: string[];
};

export const PROJECTS: Project[] = [
  {
    id: 'ciszugamens',
    name: 'Ciszugamens',
    shortName: 'Ciszugamens',
    tagline: 'El servidor de la comunidad gamer',
    kicker: 'Comunidad · Gaming',
    description:
      'La comunidad gamer y digital del ecosistema: torneos por rondas, salas de voz multijuego y soporte por tickets en Discord, WhatsApp y Telegram.',
    longDescription:
      'Ciszugamens es el punto de encuentro de la comunidad de Ciszu Network: un servidor de Discord con torneos de eliminación directa (Ronda 1, Ronda 2, Semifinal y Final), salas de voz dedicadas a Roblox, Minecraft, Fortnite y Left 4 Dead 2, canales de música y un equipo de staff que atiende dudas y reportes por tickets. El mismo espacio vive también en WhatsApp y Telegram para que nadie se quede fuera.',
    logo: 'projects/ciszugamens/content/logos/images/outline/isotype/gradient/color/ciszugamens_logo_isotipo_degradado_outline_color_cpurple_zblue.svg',
    categories: ['Comunidad', 'Gaming'],
    status: 'Activo',
    launched: '2024',
    owner: 'Ciszu Network',
    community: 'https://discord.com/invite/W3kMtMMj6E',
    accent: {
      hex: '#a855f7',
      hex2: '#22d3ee',
      gradient: 'from-[#a855f7] via-[#3b82f6] to-[#22d3ee]',
      surface: 'from-[#a855f7]/20 via-transparent to-[#22d3ee]/10',
      text: 'text-[#c084fc]',
      chipBg: 'bg-[#a855f7]/10',
      chipBorder: 'border-[#a855f7]/30',
      border: 'border-[#a855f7]/40',
      glow: 'shadow-[0_0_45px_rgba(168,85,247,0.28)]',
      solid: 'bg-[#a855f7]',
    },
    stats: [
      { icon: 'gamepad', value: '5+', label: 'Juegos en salas de voz' },
      { icon: 'trophy', value: '4', label: 'Rondas por torneo' },
      { icon: 'group', value: '14+', label: 'Edad mínima de la comunidad' },
      { icon: 'comment', value: '3', label: 'Plataformas: Discord, WhatsApp, Telegram' },
    ],
    features: [
      {
        icon: 'trophy',
        title: 'Torneos por rondas',
        desc: 'Formato de eliminación directa con tabla oficial de puntuación y plantilla de hasta 16 participantes.',
      },
      {
        icon: 'gamepad',
        title: 'Salas multijuego',
        desc: 'Roblox, Minecraft, Fortnite, Left 4 Dead 2 y más, con canales de música para acompañar la partida.',
      },
      {
        icon: 'group',
        title: 'Comunidad activa',
        desc: 'Espacio hispanohablante competitivo y casual con eventos, canales de texto, voz y convivencia moderada.',
      },
      {
        icon: 'headset',
        title: 'Soporte por tickets',
        desc: 'Dudas, sugerencias y reportes atendidos por el staff dentro del propio servidor.',
      },
    ],
    highlights: [
      { icon: 'discord', label: 'Discord' },
      { icon: 'comment', label: 'WhatsApp' },
      { icon: 'share', label: 'Telegram' },
      { icon: 'trophy', label: 'Top.gg' },
      { icon: 'gamepad', label: 'Disboard' },
    ],
    stack: ['Discord', 'WhatsApp', 'Telegram', 'Top.gg', 'Disboard', 'Discord Bot List'],
    actions: [
      { label: 'Unirme al servidor', href: 'https://discord.com/invite/W3kMtMMj6E', icon: 'discord', external: true },
      { label: 'Votar en Top.gg', href: 'https://top.gg/es/discord/servers/871620279188504576', icon: 'trophy', external: true },
      { label: 'Canal de Telegram', href: 'https://t.me/CiszukoNetwork', icon: 'share', external: true },
    ],
    keywords: ['discord', 'whatsapp', 'telegram', 'servidor', 'gaming', 'torneos', 'comunidad', 'roblox', 'minecraft'],
  },
  {
    id: 'ciszubot',
    name: 'CiszuBot',
    shortName: 'CiszuBot',
    tagline: 'El bot todo-en-uno de Discord',
    kicker: 'Bot · Discord',
    description:
      'El bot oficial del ecosistema: moderación, música, economía, minijuegos y automatización, con más de 60 comandos, web propia y estado en vivo.',
    longDescription:
      'CiszuBot es el mayordomo del ecosistema dentro de Discord. Modera tu servidor (ban, kick, mute, cierres programados), reproduce música en los canales de voz, mantiene una economía completa con daily, depósitos y tienda, y automatiza el día a día con sorteos, embeds, roles y mensajes. Está programado en TypeScript sobre Discord.js, empaquetado en Docker y listado en los directorios Top.gg y Discord Bot List, con landing propia que muestra su estado en tiempo real.',
    logo: 'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png',
    banner: 'projects/ciszubot/content/banners/banner.webp',
    categories: ['Bot', 'Discord', 'Automatización'],
    status: 'Activo',
    launched: '2024',
    owner: 'Ciszu Network',
    community: 'https://discord.gg/W3kMtMMj6E',
    official: 'https://ciszubot.vercel.app/',
    accent: {
      hex: '#5865F2',
      hex2: '#8b93f8',
      gradient: 'from-[#5865F2] via-[#7289DA] to-[#4752C4]',
      surface: 'from-[#5865F2]/25 via-transparent to-[#4752C4]/10',
      text: 'text-[#8b93f8]',
      chipBg: 'bg-[#5865F2]/10',
      chipBorder: 'border-[#5865F2]/30',
      border: 'border-[#5865F2]/40',
      glow: 'shadow-[0_0_45px_rgba(88,101,242,0.3)]',
      solid: 'bg-[#5865F2]',
    },
    stats: [
      { icon: 'terminal', value: '60+', label: 'Comandos reales' },
      { icon: 'shield', value: '6', label: 'Categorías: moderación, música, economía…' },
      { icon: 'clock', value: '24/7', label: 'Bot en línea' },
      { icon: 'trophy', value: '2', label: 'Directorios: Top.gg y DBL' },
    ],
    features: [
      {
        icon: 'shield',
        title: 'Moderación completa',
        desc: 'Ban, kick, mute, cierre de canales, paneles de control y filtros para mantener el orden.',
      },
      {
        icon: 'music',
        title: 'Música de calidad',
        desc: 'Reproduce, pausa, repite y consulta la canción en curso directamente en los canales de voz.',
      },
      {
        icon: 'money',
        title: 'Economía y niveles',
        desc: 'Balance, daily, depósitos, tienda y leaderboard con perfil y rango por usuario.',
      },
      {
        icon: 'robot',
        title: 'Automatización',
        desc: 'Sorteos, embeds, mensajes directos, prefijos y comandos personalizados por servidor.',
      },
    ],
    highlights: [
      { icon: 'discord', label: 'Discord.js' },
      { icon: 'terminal', label: 'TypeScript' },
      { icon: 'server', label: 'Docker' },
      { icon: 'verified', label: 'Top.gg' },
    ],
    stack: ['Discord.js', 'TypeScript', 'Node.js', 'Docker', 'Supabase', 'Top.gg'],
    actions: [
      {
        label: 'Invitar a mi servidor',
        href: 'https://discord.com/oauth2/authorize?client_id=1395532235872141312&permissions=8&scope=bot%20applications.commands',
        icon: 'robot',
        external: true,
      },
      { label: 'Sitio web oficial', href: 'https://ciszubot.vercel.app/', icon: 'globe', external: true },
      { label: 'Votar en Top.gg', href: 'https://top.gg/bot/1395532235872141312/vote', icon: 'trophy', external: true },
    ],
    keywords: ['bot', 'discord', 'comandos', 'moderacion', 'musica', 'economia', 'topgg', 'automatizacion'],
  },
  {
    id: 'muzicmania',
    name: 'MuzicMania',
    shortName: 'MuzicMania',
    tagline: 'El juego de ritmo definitivo',
    kicker: 'Juego · Música',
    description:
      'Juego de ritmo en la web con estética futurista, álbum original Genesis Neon y app de escritorio. Música compuesta y código programado desde cero.',
    longDescription:
      'MuzicMania convierte la música del ecosistema en un juego: cada pista es un nivel con dificultad propia, la biblioteca incluye el álbum original Genesis Neon y las puntuaciones compiten en un leaderboard global. Corre en el navegador con Next.js y Web Audio, y salta al escritorio con su app de Windows (Tauri + instalador NSIS) para partidas con mejor rendimiento. Cuentas, puntuaciones y logros viven en su propia base de datos.',
    logo: 'projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.png',
    categories: ['Juego', 'Música', 'Web'],
    status: 'Activo',
    launched: '2025',
    owner: 'Ciszu Network',
    official: 'https://muzicmania.vercel.app/',
    accent: {
      hex: '#ff33cc',
      hex2: '#68cfff',
      gradient: 'from-[#4800ff] via-[#ff33cc] to-[#68cfff]',
      surface: 'from-[#4800ff]/25 via-transparent to-[#ff33cc]/15',
      text: 'text-[#ff66dd]',
      chipBg: 'bg-[#ff33cc]/10',
      chipBorder: 'border-[#ff33cc]/30',
      border: 'border-[#ff33cc]/40',
      glow: 'shadow-[0_0_45px_rgba(255,51,204,0.28)]',
      solid: 'bg-[#ff33cc]',
    },
    stats: [
      { icon: 'music', value: '1', label: 'Álbum original: Genesis Neon' },
      { icon: 'music', value: '4', label: 'Pistas jugables verificadas' },
      { icon: 'target', value: '4', label: 'Dificultades: Easy a Expert' },
      { icon: 'trophy', value: 'Global', label: 'Leaderboard de puntuaciones' },
    ],
    features: [
      {
        icon: 'gamepad',
        title: 'Mecánicas de ritmo',
        desc: 'Pistas con BPM real, notas sincronizadas y cuatro niveles de dificultad por canción.',
      },
      {
        icon: 'music',
        title: 'Biblioteca propia',
        desc: 'Álbum Genesis Neon con portadas, banners y audio original producido por Ciszuko Antony.',
      },
      {
        icon: 'trophy',
        title: 'Récords globales',
        desc: 'Tabla de líderes con la mejor puntuación y su jugador por cada pista.',
      },
      {
        icon: 'download',
        title: 'App de escritorio',
        desc: 'Instalador de Windows con Tauri y NSIS para jugar con mayor rendimiento.',
      },
    ],
    highlights: [
      { icon: 'music', label: 'Genesis Neon' },
      { icon: 'headset', label: 'Web Audio' },
      { icon: 'monitor', label: 'Tauri' },
      { icon: 'download', label: 'NSIS' },
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Web Audio', 'Supabase', 'Tauri'],
    actions: [
      { label: 'Jugar ahora', href: 'https://muzicmania.vercel.app/', icon: 'play', external: true },
      { label: 'Ver la biblioteca', href: 'https://muzicmania.vercel.app/library', icon: 'music', external: true },
      { label: 'Descargar app', href: 'https://muzicmania.vercel.app/download', icon: 'download', external: true },
    ],
    keywords: ['juego', 'ritmo', 'musica', 'genesis neon', 'biblioteca', 'leaderboard', 'tauri', 'audio'],
  },
  {
    id: 'ciszunetwork',
    name: 'Ciszu Network',
    shortName: 'Ciszu Network',
    tagline: 'Compañía de innovación digital',
    kicker: 'Empresa · Ecosistema',
    description:
      'El núcleo del ecosistema: desarrollo web, infraestructura cloud, UI/UX, bots y paquetes compartidos para todos los proyectos. Bright Future Promised.',
    longDescription:
      'Ciszu Network es la compañía detrás de todo: diseña, construye y opera las cuatro webs (Ciszu Network, Ciszuko Antony, CiszuBot y MuzicMania), el bot de Discord, el juego de ritmo y los paquetes compartidos del monorepo (@ciszu/ui, cdn, db, email, payments, utils). Trabaja con Next.js 15, React 19, Tailwind 4, Supabase y Vercel, con CI/CD, seguridad y documentación de nivel profesional. Fundada por Ciszuko Antony.',
    logo: 'projects/ciszu/content/logos/images/outline/isotype/gradient/color/ciszu_logo_isotipo_outline_degradado_zwhite_ccolor.svg',
    banner: 'projects/ciszu/content/banners/images/banner.webp',
    categories: ['Empresa', 'Web', 'Cloud'],
    status: 'Activo',
    launched: '2022',
    owner: 'Ciszuko Antony',
    official: 'https://ciszunetwork.vercel.app/',
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
    stats: [
      { icon: 'globe', value: '4', label: 'Webs en producción' },
      { icon: 'terminal', value: '7', label: 'Paquetes compartidos' },
      { icon: 'server', value: '100%', label: 'Infraestructura cloud' },
      { icon: 'shield', value: 'CI/CD', label: 'Seguridad y despliegue automatizado' },
    ],
    features: [
      {
        icon: 'terminal',
        title: 'Desarrollo web',
        desc: 'Aplicaciones Next.js 15 + React 19 con TypeScript, Tailwind 4 y componentes compartidos.',
      },
      {
        icon: 'server',
        title: 'Infraestructura cloud',
        desc: 'Supabase, Vercel y GitHub Actions: base de datos, CDN, despliegues y monitorización.',
      },
      {
        icon: 'palette',
        title: 'Diseño UI/UX',
        desc: 'Sistema visual propio: identidad neon cyan/rosa, iconos, tipografía y accesibilidad.',
      },
      {
        icon: 'group',
        title: 'Equipo y comunidad',
        desc: 'Proyectos abiertos, documentación pública y canales de soporte para la comunidad.',
      },
    ],
    highlights: [
      { icon: 'terminal', label: 'Next.js 15' },
      { icon: 'heart', label: 'React 19' },
      { icon: 'palette', label: 'Tailwind 4' },
      { icon: 'server', label: 'Supabase' },
    ],
    stack: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Supabase', 'Vercel', 'pnpm', 'Turborepo', 'GitHub Actions'],
    actions: [
      { label: 'Web principal', href: 'https://ciszunetwork.vercel.app/', icon: 'globe', external: true },
      { label: 'Servicios', href: '/services', icon: 'palette' },
      { label: 'GitHub del monorepo', href: 'https://github.com/Ciszu-Network/CiszuNetwork', icon: 'external', external: true },
    ],
    keywords: ['empresa', 'compañia', 'cloud', 'desarrollo', 'monorepo', 'paquetes', 'supabase', 'vercel'],
  },
  {
    id: 'ciszukoantony',
    name: 'Ciszuko Antony',
    shortName: 'Ciszuko Antony',
    tagline: 'Youtuber, streamer y desarrollador',
    kicker: 'Contenido · Entretenimiento',
    description:
      'El proyecto artístico del CEO: contenido gaming, música, tecnología y desarrollo, con su propia web de portfolio, currículum y certificados.',
    longDescription:
      'Ciszuko Antony (Francisco García) es la cara creativa del ecosistema: youtuber y streamer que produce contenido de gaming, música y tecnología, y además firma el arte y el código de todos los proyectos de Ciszu Network. Su web personal reúne el portfolio, los currículums, los certificados verificables y el musicboard con su obra musical, incluyendo el álbum Genesis Neon que da vida a MuzicMania.',
    logo: 'projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png',
    banner: 'projects/ciszukoantony/content/banners/images/banner.png',
    categories: ['Contenido', 'Entretenimiento'],
    status: 'Activo',
    launched: '2022',
    owner: 'Ciszu Antony',
    official: 'https://ciszukoantony.vercel.app/',
    community: 'https://www.youtube.com/@CiszukoAntony',
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
    stats: [
      { icon: 'tv', value: '5+', label: 'Plataformas de contenido' },
      { icon: 'music', value: '1', label: 'Álbum original: Genesis Neon' },
      { icon: 'certificates', value: 'CV', label: 'Currículums y certificados públicos' },
      { icon: 'user', value: 'CEO', label: 'Fundador de Ciszu Network' },
    ],
    features: [
      {
        icon: 'gamepad',
        title: 'Gaming',
        desc: 'Gameplays, streams y contenido de videojuegos variado para la comunidad.',
      },
      {
        icon: 'music',
        title: 'Música',
        desc: 'Producción musical original: álbum Genesis Neon y el musicboard del artista.',
      },
      {
        icon: 'terminal',
        title: 'Tech y desarrollo',
        desc: 'Tutoriales, desarrollo y tecnología detrás de cada proyecto del ecosistema.',
      },
      {
        icon: 'certificates',
        title: 'Portfolio y CV',
        desc: 'Web oficial con portfolio visual, currículums en PDF y certificados verificables.',
      },
    ],
    highlights: [
      { icon: 'play', label: 'YouTube' },
      { icon: 'tv', label: 'Twitch' },
      { icon: 'music', label: 'Spotify' },
      { icon: 'camera', label: 'Instagram' },
      { icon: 'share', label: 'TikTok' },
    ],
    stack: ['YouTube', 'Twitch', 'TikTok', 'Instagram', 'Spotify', 'SoundCloud'],
    actions: [
      { label: 'Web oficial', href: 'https://ciszukoantony.vercel.app/', icon: 'globe', external: true },
      { label: 'YouTube', href: 'https://www.youtube.com/@CiszukoAntony', icon: 'play', external: true },
      { label: 'Portfolio', href: 'https://ciszukoantony.vercel.app/portfolio', icon: 'camera', external: true },
    ],
    keywords: ['youtuber', 'streamer', 'contenido', 'gaming', 'musica', 'portfolio', 'curriculum', 'ciszuko', 'antony'],
  },
];

/** Categorías presentes en el catálogo (filtros del índice). */
export const PROJECT_CATEGORIES: string[] = Array.from(
  new Set(PROJECTS.flatMap((project) => project.categories)),
);

/** Número total de tecnologías distintas entre todos los stacks. */
export const PROJECT_STACK_COUNT = new Set(PROJECTS.flatMap((project) => project.stack)).size;

export const getProject = (id: string): Project | undefined =>
  PROJECTS.find((project) => project.id === id);
