/**
 * Catálogo de redes sociales REALES de Ciszuko Antony.
 *
 * Fuente de verdad de `/socials` y `/socials/<red>`: cada entrada apunta al
 * perfil verificado que ya se publica en `src/config/navigation.tsx` (SOCIALS)
 * y describe, sin inventar métricas, qué se publica en cada plataforma.
 *
 * COLORES: cada red declara dos tintas de marca —una para fondo oscuro y otra
 * para fondo claro— elegidas para conservar el tono de la marca y superar el
 * mínimo de contraste AA sobre el fondo correspondiente. El tema activo lo
 * resuelve `SocialGlyph`/`useSocialInk`, no el CSS global, para que las redes
 * cuyo color de marca es negro (X, TikTok, GitHub) sigan siendo legibles en
 * modo oscuro y viceversa.
 */

export type SocialPlatformId =
  | 'youtube'
  | 'twitch'
  | 'github'
  | 'discord'
  | 'x'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'spotify'
  | 'linkedin'
  | 'pinterest'
  | 'whatsapp';

/** Plataformas con icono oficial en `@ciszu/ui` (SocialIcon). */
export type UiSocialPlatform = 'github' | 'youtube' | 'instagram' | 'facebook' | 'x' | 'tiktok' | 'discord';

export type SocialFact = { label: string; value: string };
export type SocialPublish = { icon: string; title: string; desc: string };

export type SocialEntry = {
  /** Slug de la subpágina: /socials/<id>. */
  id: SocialPlatformId;
  name: string;
  /** Nombre de usuario real publicado en el perfil. */
  handle: string;
  href: string;
  /** Plataforma para `SocialIcon` de @ciszu/ui (null = path propio). */
  ui: UiSocialPlatform | null;
  /** Path SVG propio para redes sin icono en @ciszu/ui. */
  path?: string;
  /** Tinta de marca legible por tema. */
  ink: { dark: string; light: string };
  /** Color base para degradados y halos (siempre brillante). */
  accent: string;
  /** Segundo color del degradado decorativo. */
  accentAlt: string;
  tagline: string;
  about: string;
  publishes: SocialPublish[];
  facts: SocialFact[];
  cta: { label: string; href: string; external?: boolean };
  /** Redes afines (slugs) para el bloque "sigue explorando". */
  related: SocialPlatformId[];
};

export const SOCIAL_ENTRIES: SocialEntry[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@CiszukoAntony',
    href: 'https://www.youtube.com/@CiszukoAntony',
    ui: 'youtube',
    ink: { dark: '#FF4D4D', light: '#B6060B' },
    accent: '#FF0033',
    accentAlt: '#ff33cc',
    tagline: 'Vídeo y música',
    about:
      'El canal principal de Ciszuko Antony. Aquí aterrizan los vídeos del ecosistema: gameplays, música propia y contenido de tecnología y desarrollo.',
    publishes: [
      { icon: 'play', title: 'Gaming', desc: 'Gameplays y partidas del ecosistema y de los juegos que sigue la comunidad.' },
      { icon: 'music', title: 'Música', desc: 'Piezas musicales propias y material del álbum Genesis Neon de MuzicMania.' },
      { icon: 'monitor', title: 'Tech y desarrollo', desc: 'Vídeos sobre los proyectos, herramientas y la construcción del ecosistema.' },
    ],
    facts: [
      { label: 'Canal', value: '@CiszukoAntony' },
      { label: 'Contenido', value: 'Gaming · Música · Tech' },
      { label: 'Avatar oficial', value: 'circle_1_yt en el CDN' },
    ],
    cta: { label: 'Ver el canal', href: 'https://www.youtube.com/@CiszukoAntony', external: true },
    related: ['twitch', 'tiktok', 'spotify'],
  },
  {
    id: 'twitch',
    name: 'Twitch',
    handle: 'ciszukoantony_',
    href: 'https://www.twitch.tv/ciszukoantony_',
    ui: null,
    path: 'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.428l-3 3v-3H6.857V1.714h13.714Z',
    ink: { dark: '#A970FF', light: '#5C2D91' },
    accent: '#9146FF',
    accentAlt: '#3d6adf',
    tagline: 'Directos en vivo',
    about:
      'El espacio de directos de Ciszuko Antony: sesiones de juego en vivo, avances del ecosistema y conversación con la comunidad en tiempo real.',
    publishes: [
      { icon: 'gamepad', title: 'Streams de juego', desc: 'Partidas en directo con chat abierto y comunidad del ecosistema.' },
      { icon: 'flame', title: 'Eventos', desc: 'Sesiones especiales y retos que se anuncian en Discord y redes.' },
      { icon: 'message', title: 'Chat en vivo', desc: 'Preguntas, feedback y conversación directa durante la emisión.' },
    ],
    facts: [
      { label: 'Canal', value: 'ciszukoantony_' },
      { label: 'Formato', value: 'Directos con chat' },
      { label: 'Avisos', value: 'Discord Ciszugamens' },
    ],
    cta: { label: 'Abrir Twitch', href: 'https://www.twitch.tv/ciszukoantony_', external: true },
    related: ['youtube', 'discord', 'x'],
  },
  {
    id: 'github',
    name: 'GitHub',
    handle: 'CiszukoAntony',
    href: 'https://github.com/CiszukoAntony',
    ui: 'github',
    ink: { dark: '#E6EDF3', light: '#181717' },
    accent: '#e6edf3',
    accentAlt: '#3d6adf',
    tagline: 'Código en abierto',
    about:
      'La cuenta personal de desarrollo de Ciszuko Antony, conectada a la organización Ciszu Network: aquí vive el monorepo del ecosistema con las cuatro webs, el bot, el juego y los paquetes compartidos.',
    publishes: [
      { icon: 'terminal', title: 'Monorepo', desc: 'CiszuNetwork: ciszu, ciszukoantony, muzicmania y ciszubot en un solo repositorio.' },
      { icon: 'robot', title: 'Bots y juego', desc: 'CiszuBot (Discord.js) y MuzicMania (Next.js + Tauri) con su infraestructura.' },
      { icon: 'server', title: 'Paquetes compartidos', desc: '@ciszu/ui, @ciszunetwork/cdn, db, email, payments y utils.' },
    ],
    facts: [
      { label: 'Cuenta', value: 'github.com/CiszukoAntony' },
      { label: 'Organización', value: 'Ciszu-Network' },
      { label: 'Stack', value: 'Next.js · TypeScript · Supabase' },
    ],
    cta: { label: 'Ver GitHub', href: 'https://github.com/CiszukoAntony', external: true },
    related: ['discord', 'x', 'linkedin'],
  },
  {
    id: 'discord',
    name: 'Discord',
    handle: 'Ciszugamens',
    href: 'https://discord.com/invite/W3kMtMMj6E',
    ui: 'discord',
    ink: { dark: '#7C8BFF', light: '#4551BF' },
    accent: '#5865F2',
    accentAlt: '#ff33cc',
    tagline: 'La comunidad',
    about:
      'El servidor de Discord del ecosistema, hogar de la comunidad Ciszugamens: eventos, soporte, avisos de bots y el punto de encuentro de Ciszu Network.',
    publishes: [
      { icon: 'users', title: 'Comunidad', desc: 'Gamers, creadores y usuarios del ecosistema reunidos por intereses comunes.' },
      { icon: 'trophy', title: 'Eventos', desc: 'Torneos, dinámicas y anuncios de directos y lanzamientos.' },
      { icon: 'support', title: 'Soporte', desc: 'Atención directa y reportes de los proyectos del ecosistema.' },
    ],
    facts: [
      { label: 'Invitación', value: 'discord.com/invite/W3kMtMMj6E' },
      { label: 'Comunidad', value: 'Ciszugamens' },
      { label: 'Proyectos', value: 'CiszuBot · MuzicMania · Ciszugamens' },
    ],
    cta: { label: 'Unirse al Discord', href: 'https://discord.com/invite/W3kMtMMj6E', external: true },
    related: ['twitch', 'youtube', 'x'],
  },
  {
    id: 'x',
    name: 'X',
    handle: '@CiszukoAntony',
    href: 'https://x.com/CiszukoAntony',
    ui: 'x',
    ink: { dark: '#E7E9EA', light: '#000000' },
    accent: '#e7e9ea',
    accentAlt: '#3d6adf',
    tagline: 'Anuncios y contacto',
    about:
      'La cuenta de X de Ciszuko Antony: anuncios cortos, avances de los proyectos y el canal rápido para contacto público.',
    publishes: [
      { icon: 'bell', title: 'Anuncios', desc: 'Novedades breves de lanzamientos, cambios y eventos del ecosistema.' },
      { icon: 'star', title: 'Avances', desc: 'Capturas y adelantos de lo que se está construyendo.' },
      { icon: 'message', title: 'Interacción', desc: 'Respuestas y conversación pública con la comunidad.' },
    ],
    facts: [
      { label: 'Usuario', value: '@CiszukoAntony' },
      { label: 'Uso', value: 'Anuncios y contacto' },
      { label: 'Ecosistema', value: 'Ciszu Network' },
    ],
    cta: { label: 'Seguir en X', href: 'https://x.com/CiszukoAntony', external: true },
    related: ['instagram', 'youtube', 'discord'],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@itz.ciszukoant0nyz',
    href: 'https://www.instagram.com/itz.ciszukoant0nyz/',
    ui: 'instagram',
    ink: { dark: '#FF6B8A', light: '#AC295A' },
    accent: '#E4405F',
    accentAlt: '#f09433',
    tagline: 'Visual y día a día',
    about:
      'El perfil visual de Ciszuko Antony: imágenes del trabajo, la marca y el día a día del ecosistema, con piezas gráficas de los proyectos.',
    publishes: [
      { icon: 'camera', title: 'Contenido visual', desc: 'Fotos, capturas y piezas de la identidad visual de la marca.' },
      { icon: 'palette', title: 'Diseño', desc: 'Muestras de logos, paletas y material gráfico de los proyectos.' },
      { icon: 'heart', title: 'Comunidad', desc: 'Publicaciones del día a día y momentos del ecosistema.' },
    ],
    facts: [
      { label: 'Usuario', value: 'itz.ciszukoant0nyz' },
      { label: 'Formato', value: 'Foto y piezas gráficas' },
      { label: 'Marca', value: 'Ciszuko Antony' },
    ],
    cta: { label: 'Abrir Instagram', href: 'https://www.instagram.com/itz.ciszukoant0nyz/', external: true },
    related: ['tiktok', 'facebook', 'pinterest'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@ciszukoantonY',
    href: 'https://www.tiktok.com/@ciszukoantonY',
    ui: 'tiktok',
    ink: { dark: '#25F4EE', light: '#000000' },
    accent: '#25f4ee',
    accentAlt: '#ff33cc',
    tagline: 'Clips cortos',
    about:
      'El canal de vídeo corto de Ciszuko Antony: clips de gaming, música y momentos del ecosistema en formato vertical.',
    publishes: [
      { icon: 'tv', title: 'Clips', desc: 'Vídeos breves de partidas, proyectos y novedades.' },
      { icon: 'music', title: 'Música', desc: 'Fragmentos musicales y material promocional de los álbumes.' },
      { icon: 'flame', title: 'Tendencias', desc: 'Formatos cortos al ritmo de la plataforma sin perder la identidad.' },
    ],
    facts: [
      { label: 'Usuario', value: '@ciszukoantonY' },
      { label: 'Formato', value: 'Vídeo vertical' },
      { label: 'Marca', value: 'Ciszuko Antony' },
    ],
    cta: { label: 'Abrir TikTok', href: 'https://www.tiktok.com/@ciszukoantonY', external: true },
    related: ['youtube', 'instagram', 'twitch'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'ciszukoantony',
    href: 'https://www.facebook.com/ciszukoantony',
    ui: 'facebook',
    ink: { dark: '#4C9AFF', light: '#155AB5' },
    accent: '#1877F2',
    accentAlt: '#3d6adf',
    tagline: 'Página oficial',
    about:
      'La página de Facebook de Ciszuko Antony: el escaparate público donde se comparten las novedades del ecosistema a otra audiencia.',
    publishes: [
      { icon: 'globe', title: 'Novedades', desc: 'Anuncios de proyectos y publicaciones del portfolio.' },
      { icon: 'share', title: 'Contenido cruzado', desc: 'Vídeos e imágenes que también viven en las demás redes.' },
      { icon: 'team', title: 'Comunidad', desc: 'Punto de contacto para familia, seguidores y colaboradores.' },
    ],
    facts: [
      { label: 'Página', value: 'facebook.com/ciszukoantony' },
      { label: 'Uso', value: 'Difusión y contacto' },
      { label: 'Marca', value: 'Ciszuko Antony' },
    ],
    cta: { label: 'Abrir Facebook', href: 'https://www.facebook.com/ciszukoantony', external: true },
    related: ['instagram', 'youtube', 'x'],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    handle: 'Perfil de Ciszuko Antony',
    href: 'https://open.spotify.com/user/317nxlvcrrlwfxjogyirixsqjmfi?si=50c43b75eb6e47db',
    ui: null,
    path: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
    ink: { dark: '#1ED760', light: '#0F7A36' },
    accent: '#1DB954',
    accentAlt: '#00ff88',
    tagline: 'Música en streaming',
    about:
      'El perfil oficial de Ciszuko Antony en Spotify. Las canciones aún no están subidas a la plataforma: por ahora el enlace lleva solo al perfil, y la escucha completa vive en SoundCloud, YouTube Music y el musicboard.',
    publishes: [
      { icon: 'music', title: 'Álbumes (próximamente)', desc: 'Genesis Neon y la obra del estudio se publicarán en el perfil cuando estén subidos.' },
      { icon: 'headset', title: 'Perfil', desc: 'Cuenta oficial de streaming, con la actividad pública del artista.' },
      { icon: 'play', title: 'Escucha', desc: 'Mientras el catálogo no esté subido, la música se escucha en el musicboard, SoundCloud y YouTube Music.' },
    ],
    facts: [
      { label: 'Perfil', value: 'Público en Spotify' },
      { label: 'Canciones', value: 'Aún no publicadas' },
      { label: 'Escucha', value: '/musicboard · SoundCloud · YouTube Music' },
    ],
    cta: {
      label: 'Escuchar en Spotify',
      href: 'https://open.spotify.com/user/317nxlvcrrlwfxjogyirixsqjmfi?si=50c43b75eb6e47db',
      external: true,
    },
    related: ['youtube', 'tiktok', 'twitch'],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'in/ciszuko',
    href: 'https://linkedin.com/in/ciszukoantony',
    ui: null,
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    ink: { dark: '#70B5F9', light: '#0A66C2' },
    accent: '#0A66C2',
    accentAlt: '#3d6adf',
    tagline: 'Perfil profesional',
    about:
      'El perfil profesional de Ciszuko Antony como CEO y fundador de Ciszu Network: trayectoria, proyectos y contacto corporativo.',
    publishes: [
      { icon: 'monitor', title: 'Trayectoria', desc: 'Experiencia al frente de Ciszu Network y del desarrollo full-stack.' },
      { icon: 'person', title: 'Proyectos', desc: 'Resumen profesional del ecosistema: webs, bots, juego e infraestructura.' },
      { icon: 'mail', title: 'Contacto profesional', desc: 'Canal para colaboraciones, comisiones y alianzas.' },
    ],
    facts: [
      { label: 'Perfil', value: 'linkedin.com/in/ciszukoantony' },
      { label: 'Cargo', value: 'CEO & Fundador · Ciszu Network' },
      { label: 'Área', value: 'Desarrollo y dirección' },
    ],
    cta: { label: 'Abrir LinkedIn', href: 'https://linkedin.com/in/ciszukoantony', external: true },
    related: ['github', 'x', 'facebook'],
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    handle: 'ciszukoantony',
    href: 'https://es.pinterest.com/ciszukoantony',
    ui: null,
    path: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.22.604 2.184 1.824 2.184 2.136 0 3.776-2.25 3.776-5.5 0-2.873-2.063-4.883-5.008-4.883-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.698-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z',
    ink: { dark: '#FF5C77', light: '#B6001C' },
    accent: '#E60023',
    accentAlt: '#ff33cc',
    tagline: 'Referencia visual',
    about:
      'El tablero público de Ciszuko Antony: recopilación de referencias, arte digital e identidad visual que inspira la marca y los proyectos.',
    publishes: [
      { icon: 'palette', title: 'Referencias', desc: 'Colecciones de arte, color y composición que alimentan la identidad.' },
      { icon: 'camera', title: 'Diseño', desc: 'Piezas gráficas y visuales de los proyectos del ecosistema.' },
      { icon: 'heart', title: 'Inspiración', desc: 'Tableros guardados sobre tech, gaming y diseño.' },
    ],
    facts: [
      { label: 'Perfil', value: 'es.pinterest.com/ciszukoantony' },
      { label: 'Uso', value: 'Referencia visual' },
      { label: 'Marca', value: 'Ciszuko Antony' },
    ],
    cta: { label: 'Abrir Pinterest', href: 'https://es.pinterest.com/ciszukoantony', external: true },
    related: ['instagram', 'tiktok', 'youtube'],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    handle: '+58 412 6858111',
    href: 'https://wa.me/584126858111',
    ui: null,
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z',
    ink: { dark: '#25D366', light: '#186A43' },
    accent: '#25D366',
    accentAlt: '#00ff88',
    tagline: 'Contacto directo',
    about:
      'El canal de contacto directo por WhatsApp: atención de Ciszuko Antony para soporte, comisiones y consultas del ecosistema.',
    publishes: [
      { icon: 'comment', title: 'Atención directa', desc: 'Respuesta personal para dudas, soporte y propuestas.' },
      { icon: 'money', title: 'Comisiones', desc: 'Canal para cotizar trabajos de desarrollo, diseño y automatización.' },
      { icon: 'team', title: 'Comunidad', desc: 'Enlace de la comunidad Ciszugamens en WhatsApp.' },
    ],
    facts: [
      { label: 'Número', value: '+58 412 6858111' },
      { label: 'Uso', value: 'Soporte y comisiones' },
      { label: 'Base', value: 'Venezuela (GMT-4)' },
    ],
    cta: { label: 'Escribir por WhatsApp', href: 'https://wa.me/584126858111', external: true },
    related: ['discord', 'linkedin', 'x'],
  },
];

export const getSocial = (id: string): SocialEntry | undefined =>
  SOCIAL_ENTRIES.find((entry) => entry.id === id);

export const SOCIAL_IDS = SOCIAL_ENTRIES.map((entry) => entry.id);

export const socialHref = (id: SocialPlatformId | string): string => `/socials/${id}`;
