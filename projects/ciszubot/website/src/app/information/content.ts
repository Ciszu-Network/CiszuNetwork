import { BOT_PREFIX, BOT_VERSION, INVITE_URL, DISCORD_SERVER, type Dict } from '@/lib/i18n';

export type AccentKey = 'blue' | 'cyan' | 'purple' | 'pink';

type NavKey = keyof Dict['nav'];

export interface Note {
  title: string;
  body: string;
  accent: AccentKey;
}

export interface Phase {
  period: string;
  label: string;
  accent: AccentKey;
  items: string[];
}

export interface Pillar {
  title: string;
  icon: string;
  accent: AccentKey;
  body: string;
}

export interface QuoteCard {
  label: string;
  accent: AccentKey;
  quote: string;
}

export interface TechItem {
  name: string;
  icon: string;
  accent: AccentKey;
  href: string;
  role: string;
  detail: string;
}

export interface FormatCategory {
  category: string;
  icon: string;
  accent: AccentKey;
  formats: string[];
  body: string;
}

export interface IconLibraryEntry {
  name: string;
  label: string;
}

export interface ArchCard {
  title: string;
  icon: string;
  accent: AccentKey;
  body: string;
}

export interface Swatch {
  token: string;
  hex: string;
  note: string;
}

export interface SwatchGroup {
  title: string;
  body: string;
  swatches: Swatch[];
}

export interface LinkGroupData {
  title: string;
  items: {
    navKey: NavKey;
    href: string;
    icon: string;
    body: string;
  }[];
}

export const HERO = {
  kicker: `${BOT_VERSION} · Ciszu Network`,
  subtitle:
    'Identidad, marca y arquitectura de CiszuBot: la guía completa del bot de Discord de Ciszu Network, su paleta, su stack y todas las secciones del sitio.',
};

export const SECTION_TITLES = {
  colorology: 'Colorología de Marca',
  formats: 'Formatos de Archivo',
  explore: 'Explora el Proyecto',
};

export const IDENTITY = {
  title: 'Identidad Visual',
  isotype: {
    src: 'projects/ciszubot/content/logos/images/not-outline/isotype/color/ciszubot_logo_isotipo_color.png',
    alt: 'Isotipo de CiszuBot',
    title: 'Isotipo',
    notes: [
      {
        title: 'Visión artística',
        body: 'Un brote de conversación digital que combina el azul de marca con el cian del ecosistema: un bot cercano, rápido y siempre presente en el servidor.',
        accent: 'blue' as AccentKey,
      },
      {
        title: 'Especificación técnica',
        body: 'Pieza vectorial con variantes color y monocroma, contorno opcional y muestras sobre fondo, círculo y contorno. Entrega en .svg, .png y .webp vía CDN.',
        accent: 'cyan' as AccentKey,
      },
    ] satisfies Note[],
  },
  logotype: {
    src: 'projects/ciszubot/content/logos/images/not-outline/logotype/color/ciszubot_logotipo_outline_color.svg',
    alt: 'Logotipo de CiszuBot',
    title: 'Logotipo',
    notes: [
      {
        title: 'Tipografía de marca',
        body: 'El logotipo «ciszubot» con trazo outline, disponible en color, degradado y monocromo (black/white) para fondos claros y oscuros.',
        accent: 'purple' as AccentKey,
      },
    ] satisfies Note[],
  },
  composition: {
    src: 'projects/ciszubot/content/logos/images/samples/background/imagotype/horizontal/ciszubot_outline_color.png',
    alt: 'Imagotipo horizontal de CiszuBot sobre fondo',
    title: 'Composición Maestra',
    body: 'El imagotipo horizontal (isotipo + logotipo) sobre fondo es la pieza de cabecera y de ancho completo. Reglas: no deformar, no rotar, no recomponer el símbolo y respetar el contraste en cada fondo.',
    principles: [
      {
        title: 'Contraste garantizado',
        body: 'Variantes black y white para fondos claros y oscuros, listas para cualquier superficie.',
        accent: 'blue' as AccentKey,
      },
      {
        title: 'Trazo consistente',
        body: 'Familia outline para máxima visibilidad y not-outline para superficies planas.',
        accent: 'cyan' as AccentKey,
      },
      {
        title: 'Uso en cabeceras',
        body: 'El imagotipo horizontal se reserva para cabeceras y piezas de ancho completo.',
        accent: 'purple' as AccentKey,
      },
    ] satisfies Note[],
  },
};

export const PALETTE: SwatchGroup[] = [
  {
    title: 'Acentos neón · tema oscuro',
    body: 'Valores activos con la clase .dark (tema por defecto de la web).',
    swatches: [
      { token: '--neon-blue', hex: '#00d4ff', note: 'Enlaces, bordes y glows azules' },
      { token: '--neon-cyan', hex: '#22d3ee', note: 'Gradientes y brillos fríos' },
      { token: '--neon-purple', hex: '#a855f7', note: 'Acentos de ecosistema y hover' },
      { token: '--neon-pink', hex: '#ff33cc', note: 'Highlight principal de la marca' },
      { token: '--brand-500', hex: '#7ea0ea', note: 'Azul de marca en tema oscuro' },
    ],
  },
  {
    title: 'Acentos neón · tema claro',
    body: 'Mismos tokens, oscurecidos lo mínimo para mantener contraste AA.',
    swatches: [
      { token: '--neon-blue', hex: '#0675b1', note: 'Enlaces, bordes y glows azules' },
      { token: '--neon-cyan', hex: '#0c7795', note: 'Gradientes y brillos fríos' },
      { token: '--neon-purple', hex: '#7739e4', note: 'Acentos de ecosistema y hover' },
      { token: '--neon-pink', hex: '#ce2772', note: 'Highlight principal de la marca' },
      { token: '--brand-500', hex: '#3f6fd6', note: 'Azul de marca en tema claro' },
    ],
  },
  {
    title: 'Superficies · tema oscuro',
    body: 'Tokens semánticos de fondo, tarjeta, borde y tinta sobre negro.',
    swatches: [
      { token: '--bg', hex: '#12141a', note: 'Fondo general' },
      { token: '--surface', hex: '#1a1d25', note: 'Superficie elevada' },
      { token: '--card', hex: '#20232d', note: 'Tarjetas y paneles' },
      { token: '--border', hex: 'rgba(255,255,255,0.09)', note: 'Bordes suaves' },
      { token: '--ink', hex: '#e7eaf3', note: 'Texto principal' },
      { token: '--muted', hex: '#9aa3b8', note: 'Texto secundario' },
      { token: '--faint', hex: '#6d7689', note: 'Texto terciario' },
    ],
  },
  {
    title: 'Superficies · tema claro',
    body: 'Tokens semánticos de la variante clara, inspirada en la superficie del bot en Discord.',
    swatches: [
      { token: '--bg', hex: '#f4f6fb', note: 'Fondo general' },
      { token: '--surface', hex: '#ffffff', note: 'Superficie elevada' },
      { token: '--card', hex: '#fbfcff', note: 'Tarjetas y paneles' },
      { token: '--border', hex: 'rgba(35,63,146,0.12)', note: 'Bordes suaves' },
      { token: '--ink', hex: '#1b2234', note: 'Texto principal' },
      { token: '--muted', hex: '#5a6478', note: 'Texto secundario' },
      { token: '--faint', hex: '#66708a', note: 'Texto terciario' },
    ],
  },
];

export const PALETTE_LABELS = {
  copy: 'Copiar valor HEX',
  copied: 'Valor copiado',
};

export const FILE_FORMATS: FormatCategory[] = [
  {
    category: 'Vectoriales',
    icon: 'file-text',
    accent: 'blue',
    formats: ['.ai', '.svg'],
    body: 'Fuente Illustrator y entrega web escalable del isotipo y del logotipo sin pérdida de calidad.',
  },
  {
    category: 'Raster',
    icon: 'camera',
    accent: 'cyan',
    formats: ['.png', '.webp'],
    body: 'Isotipo, imagotipo de muestra y piezas de fondo optimizadas para carga web.',
  },
  {
    category: 'Editable',
    icon: 'edit',
    accent: 'purple',
    formats: ['.psd'],
    body: 'Composición del imagotipo horizontal sobre fondo, lista para retoque y maquetación.',
  },
  {
    category: 'Documentación',
    icon: 'policies',
    accent: 'pink',
    formats: ['.md', '.docx', '.pdf', '.txt'],
    body: 'Pipeline canónico de documentación del bot: texto, markdown, Word y PDF.',
  },
];

export const MISSION = {
  title: 'Nuestra Misión',
  label: 'Declaración Central',
  quote:
    'Dar a cualquier servidor de Discord una capa de comunidad completa —diversión, moderación, economía, música y utilidades— en español, gratis y sin fricción, con la calidad de ingeniería del ecosistema Ciszu Network.',
  stats: [
    { value: '72', label: 'Comandos', sub: '9 categorías en v3.2.0' },
    { value: BOT_PREFIX, label: 'Prefijo', sub: 'También slash commands' },
    { value: '60s', label: 'Heartbeat', sub: 'Estado en vivo en la web' },
    { value: '100%', label: 'Gratis', sub: 'Sin pay-to-win' },
  ],
};

export const VISION = {
  title: 'Visión de Futuro',
  phases: [
    {
      period: '2026',
      label: 'Fase actual · v3.x',
      accent: 'blue' as AccentKey,
      items: [
        '72 comandos en 9 categorías',
        'Dashboard OAuth por servidor',
        'Estado en vivo vía heartbeat',
        'Votos automáticos en bot lists',
      ],
    },
    {
      period: '2027',
      label: 'Fase de escala',
      accent: 'cyan' as AccentKey,
      items: [
        'Hosting 24/7 en VPS',
        'Sharding al acercarse al límite de guilds por proceso',
        'Más módulos de economía y niveles',
        'Métricas y analíticas del bot',
      ],
    },
    {
      period: '2028+',
      label: 'Fase ecosistema',
      accent: 'purple' as AccentKey,
      items: [
        'PDWA de escritorio instalable',
        'Integración con las webs de Ciszu Network',
        'API pública documentada',
        'Eventos y torneos de comunidad',
      ],
    },
  ] satisfies Phase[],
};

export const OBJECTIVES = {
  title: 'Objetivos',
  general: {
    title: 'Objetivos Generales',
    label: 'Macro estrategia',
    items: [
      'Consolidar a CiszuBot como el bot de Discord de referencia en español para comunidades gamer de Latinoamérica.',
      'Mantener el servicio gratuito, estable y sin funciones encerradas tras un muro de pago.',
      'Hacer crecer la comunidad de servidores y usuarios alrededor de CiszuGamens y Ciszu Network.',
      'Documentar cada módulo para que cualquier servidor lo configure sin depender de soporte externo.',
    ],
  },
  specific: {
    title: 'Objetivos Específicos',
    label: 'Micro táctica',
    items: [
      'Publicar versiones estables con changelog y pruebas previas a cada despliegue.',
      'Cubrir el ciclo completo de comunidad: bienvenidas, autoroles, tickets, niveles, economía y moderación.',
      'Mantener el heartbeat público cada 60 s y el dashboard OAuth operativos como panel de control.',
      'Preparar la arquitectura para sharding antes de alcanzar el límite de guilds por proceso.',
    ],
  },
};

export const IDEOLOGY = {
  title: 'Ideología',
  pillars: [
    {
      title: 'Gratis para siempre',
      icon: 'gift',
      accent: 'blue' as AccentKey,
      body: 'Todos los comandos están disponibles sin muros de pago. Las donaciones son opcionales y solo financian el hosting.',
    },
    {
      title: 'Privacidad primero',
      icon: 'lock',
      accent: 'cyan' as AccentKey,
      body: 'No se almacenan mensajes ni datos personales. Solo contadores de uso y el estado de conexión del servidor.',
    },
    {
      title: 'Comunidad primero',
      icon: 'users',
      accent: 'purple' as AccentKey,
      body: 'El roadmap se decide con el feedback del servidor: reportes de bugs, ideas y votos en las listas de bots.',
    },
    {
      title: 'Open source',
      icon: 'terminal',
      accent: 'pink' as AccentKey,
      body: 'Código en GitHub bajo licencia MIT, con documentación pública y migraciones de base de datos versionadas.',
    },
  ] satisfies Pillar[],
};

export const PHILOSOPHY = {
  title: 'Filosofía',
  kicker: 'Nuestra razón de ser',
  headline: 'El bot se construye para aguantar',
  intro:
    'Un bot de comunidad se juzga por lo que no se nota: que responda al instante, que no pierda datos y que siga en pie cuando el servidor crece.',
  cards: [
    {
      label: 'Rendimiento máximo',
      accent: 'blue' as AccentKey,
      quote: '«Cada milisegundo cuenta.» Respuestas inmediatas, caché donde hace falta y cero procesos innecesarios.',
    },
    {
      label: 'Estabilidad antes que features',
      accent: 'cyan' as AccentKey,
      quote: '«Un comando que falla borra diez que funcionan.» Nada llega a producción sin pasar por pruebas y staging.',
    },
    {
      label: 'Simple fuera, estricto dentro',
      accent: 'purple' as AccentKey,
      quote: '«El usuario ve un comando; dentro hay tipos, validación y logs.» La complejidad se queda en el código.',
    },
    {
      label: 'Documentación como producto',
      accent: 'pink' as AccentKey,
      quote: '«Si no está documentado, no existe.» Cada módulo, migración y despliegue tiene su guía pública.',
    },
  ] satisfies QuoteCard[],
};

export const ICON_LIBRARY = {
  title: 'Librería de Iconos Maestra',
  subtitle: 'Iconos registrados de @ciszu/ui · propiedad intelectual de CiszuBot',
  icons: [
    { name: 'home', label: 'Inicio' },
    { name: 'gamepad', label: 'Comandos' },
    { name: 'chart-bar', label: 'Estadísticas' },
    { name: 'download', label: 'Descargas' },
    { name: 'message', label: 'Feedback' },
    { name: 'history', label: 'Historial' },
    { name: 'star', label: 'Reseñas' },
    { name: 'trophy', label: 'Ranking' },
    { name: 'signal', label: 'Estado' },
    { name: 'help', label: 'Ayuda' },
    { name: 'faq', label: 'FAQ' },
    { name: 'life-ring', label: 'Soporte' },
    { name: 'mail', label: 'Contacto' },
    { name: 'info', label: 'Información' },
    { name: 'users', label: 'Equipo' },
    { name: 'shield', label: 'Moderación' },
    { name: 'lock', label: 'Privacidad' },
    { name: 'certificates', label: 'Licencia' },
    { name: 'policies', label: 'Políticas' },
    { name: 'file-text', label: 'Créditos' },
    { name: 'server', label: 'Dashboard' },
    { name: 'terminal', label: 'Economía' },
    { name: 'rocket', label: 'Módulos' },
    { name: 'heart', label: 'Comunidad' },
  ] satisfies IconLibraryEntry[],
};

export const TECH_STACK = {
  title: 'Ecosistema Tecnológico',
  subtitle: 'El stack real que sostiene el bot y la web',
  items: [
    {
      name: 'Discord.js v14',
      icon: 'robot',
      accent: 'blue' as AccentKey,
      href: 'https://discord.js.org',
      role: 'Gateway, comandos y voz',
      detail: 'discord.js ^14.27 · @discordjs/voice · play-dl',
    },
    {
      name: 'Node.js 24',
      icon: 'terminal',
      accent: 'cyan' as AccentKey,
      href: 'https://nodejs.org',
      role: 'Runtime del bot y del tooling',
      detail: 'Node ≥24 · pnpm 10 · Docker node:24-alpine',
    },
    {
      name: 'TypeScript 6',
      icon: 'keyboard',
      accent: 'purple' as AccentKey,
      href: 'https://www.typescriptlang.org',
      role: 'Tipado estricto del monorepo',
      detail: 'tsc --noEmit · modo strict · tipos compartidos',
    },
    {
      name: 'NestJS + Fastify',
      icon: 'chart-bar',
      accent: 'pink' as AccentKey,
      href: 'https://nestjs.com',
      role: 'Servidor de estadísticas interno',
      detail: '@nestjs/core · fastify · puerto 5000',
    },
    {
      name: 'Supabase (Postgres)',
      icon: 'server',
      accent: 'blue' as AccentKey,
      href: 'https://supabase.com',
      role: 'Datos del bot y estado en vivo',
      detail: 'schema ciszubot · 13 tablas · RLS activo',
    },
    {
      name: 'Next.js 15',
      icon: 'globe',
      accent: 'cyan' as AccentKey,
      href: 'https://nextjs.org',
      role: 'Web oficial y dashboard',
      detail: 'App Router · SSR · API routes',
    },
    {
      name: 'React 19',
      icon: 'refresh',
      accent: 'purple' as AccentKey,
      href: 'https://react.dev',
      role: 'Interfaz del sitio y del panel',
      detail: 'Hooks · componentes de @ciszu/ui',
    },
    {
      name: 'Tailwind CSS 4',
      icon: 'palette',
      accent: 'pink' as AccentKey,
      href: 'https://tailwindcss.com',
      role: 'Diseño y tema de las webs',
      detail: 'Tailwind 4 · PostCSS · tokens semánticos',
    },
    {
      name: 'Zustand',
      icon: 'settings',
      accent: 'blue' as AccentKey,
      href: 'https://zustand.docs.pmnd.rs',
      role: 'Estado global de la web',
      detail: 'Sesión, menú y preferencias locales',
    },
    {
      name: 'Sentry',
      icon: 'warning',
      accent: 'cyan' as AccentKey,
      href: 'https://sentry.io',
      role: 'Captura de errores en bot y web',
      detail: '@sentry/node · @sentry/nextjs',
    },
    {
      name: 'Docker',
      icon: 'monitor',
      accent: 'purple' as AccentKey,
      href: 'https://www.docker.com',
      role: 'Despliegue aislado del bot',
      detail: 'Multi-stage · usuario no root · ffmpeg',
    },
    {
      name: 'Vercel',
      icon: 'rocket',
      accent: 'pink' as AccentKey,
      href: 'https://vercel.com',
      role: 'Despliegue de la web',
      detail: 'CI desde main · previews · CDN',
    },
  ] satisfies TechItem[],
};

export const ORIGINS = {
  title: 'Orígenes & Arquitectura',
  subtitle: 'De herramienta interna a bot oficial del ecosistema',
  cards: [
    {
      title: 'Origen',
      icon: 'heart',
      accent: 'pink' as AccentKey,
      body: 'CiszuBot nace como herramienta interna de CiszuGamens y crece hasta convertirse en el bot oficial de Ciszu Network.',
    },
    {
      title: 'Cliente Discord.js v14',
      icon: 'robot',
      accent: 'blue' as AccentKey,
      body: 'Cliente con intents Guilds, GuildMessages, MessageContent y GuildMembers. Prefijo cz! y slash commands refrescados por REST v10 en cada arranque.',
    },
    {
      title: 'Registro de comandos',
      icon: 'gamepad',
      accent: 'cyan' as AccentKey,
      body: '44 archivos de comandos en 9 categorías gestionados por CommandRegistry; cada comando reutiliza la lógica de prefijo para responder también como slash.',
    },
    {
      title: 'Estado y datos',
      icon: 'signal',
      accent: 'purple' as AccentKey,
      body: 'Heartbeat cada 60 s a la tabla ciszubot.bot_status en Supabase (13 tablas con RLS) y stats internas servidas por el proceso del bot.',
    },
    {
      title: 'Música',
      icon: 'music',
      accent: 'pink' as AccentKey,
      body: '@discordjs/voice y play-dl reproducen audio con ffmpeg instalado dentro del contenedor.',
    },
    {
      title: 'Despliegue',
      icon: 'rocket',
      accent: 'blue' as AccentKey,
      body: 'Bot en Docker multi-stage (node:24-alpine, usuario no root); web en Vercel desplegada desde main a través de GitHub Actions.',
    },
    {
      title: 'Monitorización',
      icon: 'bell',
      accent: 'cyan' as AccentKey,
      body: 'Sentry captura errores con contexto de comando y usuario; los logs del proceso quedan en el contenedor y las stats son consultables.',
    },
    {
      title: 'Escalabilidad',
      icon: 'chart-bar',
      accent: 'purple' as AccentKey,
      body: 'Proceso único preparado para sharding cuando el número de guilds se acerque al límite por instancia.',
    },
  ] satisfies ArchCard[],
};

export const LINK_GROUPS: LinkGroupData[] = [
  {
    title: 'Producto',
    items: [
      { navKey: 'home', href: '/', icon: 'home', body: 'Portada, estado del bot e invitación' },
      { navKey: 'commands', href: '/commands', icon: 'gamepad', body: 'Todos los comandos y sus alias' },
      { navKey: 'documentation', href: '/documentation', icon: 'policies', body: 'Guías técnicas y API' },
      { navKey: 'downloads', href: '/downloads', icon: 'download', body: 'Apps de escritorio y recursos' },
      { navKey: 'dashboard', href: '/dashboard', icon: 'server', body: 'Panel de control por servidor' },
    ],
  },
  {
    title: 'Contenido',
    items: [
      { navKey: 'changelog', href: '/changelog', icon: 'history', body: 'Historial de cambios por versión' },
      { navKey: 'reviews', href: '/reviews', icon: 'star', body: 'Reseñas verificadas de la comunidad' },
      { navKey: 'leaderboard', href: '/leaderboard', icon: 'trophy', body: 'Ranking de servidores y usuarios' },
      { navKey: 'stats', href: '/stats', icon: 'chart-bar', body: 'Métricas, uptime y latencia' },
      { navKey: 'forum', href: '/forum', icon: 'comment', body: 'Debates y anuncios de la comunidad' },
      { navKey: 'feedback', href: '/feedback', icon: 'message', body: 'Reporta bugs y propone ideas' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { navKey: 'help', href: '/help', icon: 'help', body: 'Centro de ayuda paso a paso' },
      { navKey: 'faq', href: '/faq', icon: 'faq', body: 'Preguntas frecuentes' },
      { navKey: 'support', href: '/support', icon: 'life-ring', body: 'Abrir una incidencia' },
      { navKey: 'contact', href: '/contact', icon: 'mail', body: 'Correo y canales oficiales' },
    ],
  },
  {
    title: 'Institucional',
    items: [
      { navKey: 'about', href: '/about', icon: 'info', body: 'Qué es CiszuBot y quién lo hace' },
      { navKey: 'team', href: '/team', icon: 'users', body: 'Equipo detrás del proyecto' },
      { navKey: 'credits', href: '/credits', icon: 'file-text', body: 'Dirección, tecnologías y proyectos del ecosistema' },
      { navKey: 'donate', href: '/donate', icon: 'heart', body: 'Apoya el desarrollo' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { navKey: 'privacidad', href: '/privacy', icon: 'security', body: 'Política de privacidad' },
      { navKey: 'terminos', href: '/terms', icon: 'terms', body: 'Términos y condiciones' },
      { navKey: 'policy', href: '/policy', icon: 'lock', body: 'Privacidad, datos, cookies y anuncios' },
      { navKey: 'guidelines', href: '/guidelines', icon: 'policies', body: 'Uso, integración y estándares del bot' },
      { navKey: 'rules', href: '/rules', icon: 'shield', body: 'Convivencia y uso aceptable en Discord' },
      { navKey: 'license', href: '/license', icon: 'certificates', body: 'MIT y propiedad intelectual' },
    ],
  },
];

export const CTA = {
  invite: 'Invitar a CiszuBot',
  inviteHref: INVITE_URL,
  supportHref: DISCORD_SERVER,
};

export const PAGE_META = {
  title: 'CiszuBot | INFORMATION',
  description:
    'Branding completo de CiszuBot: identidad visual, paleta, misión, visión, objetivos, iconos, stack tecnológico y orígenes del bot de Discord de Ciszu Network.',
};
