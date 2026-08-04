export type Lang = 'es' | 'en';

export const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1395532235872141312&permissions=8&scope=bot%20applications.commands';

export const DISCORD_SERVER = 'https://discord.gg/W3kMtMMj6E';
export const GITHUB_ORG = 'https://github.com/Ciszu-Network';
export const GITHUB_REPO = 'https://github.com/Ciszu-Network/CiszuNetwork';
export const YOUTUBE = 'https://www.youtube.com/@CiszuNetwork';
export const CISZU_NETWORK = 'https://ciszunetwork.vercel.app';
export const CISZUKO_ANTONY = 'https://ciszukoantony.vercel.app';

export const BOT_PREFIX = 'cz!';
export const BOT_VERSION = 'v3.2.0';

// === URLs oficiales (listas de bots, servidores, donaciones) ===
export const WEBSITE = 'https://ciszubot.vercel.app';
export const TOP_GG_BOT = 'https://top.gg/bot/1395532235872141312';
export const TOP_GG_BOT_VOTE = 'https://top.gg/bot/1395532235872141312/vote';
export const TOP_GG_SERVER = 'https://top.gg/es/discord/servers/871620279188504576';
export const DISCORD_BOT_LIST_BOT = 'https://discordbotlist.com/bots/ciszubot';
export const DISCORD_BOT_LIST_SERVER = 'https://discordbotlist.com/servers/ciszugamens';
export const DISBOARD_SERVER = 'https://disboard.org/es/server/1215544133142450187';
export const TOP_GG_WIDGET_BOT = 'https://top.gg/api/widget/1395532235872141312.svg';
export const TOP_GG_WIDGET_SERVER = 'https://top.gg/api/v1/widgets/large/871620279188504576';
export const PATREON = 'https://www.patreon.com/cw/ciszukoantony';
export const KO_FI = 'https://ko-fi.com/ciszukoantony';
export const BUY_ME_A_COFFEE = 'https://buymeacoffee.com/ciszukoantony';

export const LOGO_ISOTIPO =
  'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png';
export const LOGO_ISOTIPO_CIRCLE =
  'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png';
export const LOGO_LOGOTIPO =
  'projects/ciszubot/content/logos/images/outline/logotype/color/ciszubot_logotipo_outline_color.svg';

export const dict = {
  es: {
    nav: {
      home: 'Inicio',
      commands: 'Comandos',
      status: 'Estado',
      support: 'Soporte',
      invite: 'Invitar',
    },
    hero: {
      online: 'En línea',
      offline: 'Desconectado',
      tagline: 'El bot de Discord de Ciszu Network',
      description:
        'Comandos divertidos, de información y utilidad, en español. Con prefijo cz! y slash commands.',
      ctaInvite: 'Invitar a Discord',
      ctaGithub: 'GitHub',
    },
    stats: {
      servers: 'Servidores',
      commandsRun: 'Comandos ejecutados',
      uptime: 'Uptime',
      commands: 'Comandos',
    },
    features: {
      title: '¿Por qué CiszuBot?',
      subtitle: 'Todo lo que necesitas para tu servidor, sin complicaciones.',
      items: [
        { title: 'Rápido y ligero', desc: 'Respuesta instantánea a cada comando, sin demoras ni lag.' },
        { title: '100% en español', desc: 'Todo el bot, sus comandos y mensajes están en tu idioma.' },
        { title: 'Comandos variados', desc: 'Diversión, información, social y utilidad en un solo bot.' },
        { title: 'Privacidad primero', desc: 'No vendemos datos. Solo registramos el uso de comandos para mejorar.' },
      ],
    },
    commandsSection: {
      kicker: '72 comandos · 9 categorías',
      title: 'Comandos',
      subtitle: 'Usa cz!comando en el chat o /comando con la barra de Discord.',
      viewAll: 'Ver todos los comandos',
      usage: 'Uso',
      aliases: 'Aliases',
      categories: {
        'Diversión': 'Diversión',
        'Información': 'Información',
        'Social': 'Social',
        'Utilidad': 'Utilidad',
        'Economía': 'Economía',
        'Música': 'Música',
        'Niveles': 'Niveles',
        'Moderación': 'Moderación',
        'Configuración': 'Configuración',
      },
    },
    statusSection: {
      title: 'Estado en vivo',
      subtitle: 'El bot envía un heartbeat cada 60 segundos. La web se actualiza automáticamente.',
      online: 'Bot en línea',
      offline: 'Bot offline',
      servers: 'Servidores',
      commands: 'Comandos',
      uptime: 'Uptime',
      version: 'Versión',
      lastSeen: 'Última actualización',
      heartbeat: 'El bot envía heartbeat cada 60s y la web refresca cada 60s',
      noStatus: 'El bot no ha reportado estado aún. Si acaba de arrancar, espera un momento.',
      viewPage: 'Ver estado detallado',
    },
    ecosystem: {
      title: 'Ecosistema',
      subtitle: 'CiszuBot es parte de Ciszu Network. Descubre más proyectos.',
      visit: 'Visitar',
      items: [
        {
          name: 'Ciszu Network',
          desc: 'El hub central de la marca: ecosistema digital, redes y proyectos.',
        },
        {
          name: 'Ciszuko Antony',
          desc: 'Portfolio personal: logos, medios y música del creador.',
        },
      ],
    },
    cta: {
      title: '¿Listo para probarlo?',
      description: 'Invita a CiszuBot a tu servidor en menos de un minuto. Gratis y rápido.',
      button: 'Invitar ahora',
    },
    footer: {
      explore: 'Explorar',
      projects: 'Proyectos',
      bot: 'El Bot',
      legal: 'Legal',
      terms: 'Términos',
      privacy: 'Privacidad',
      support: 'Soporte',
      prefix: 'Prefijo',
      slash: 'Slash',
      discordServer: 'Servidor de Discord',
      rights: 'Todos los derechos reservados.',
      madeBy: 'Creado por',
    },
    commandsPage: {
      title: 'Comandos',
      subtitle:
        'Todos los comandos de CiszuBot con su descripción, uso y aliases. Úsalos con cz! o como slash commands.',
      search: 'Buscar comando o alias…',
      noResults: 'No se encontraron comandos para «{q}».',
      all: 'Todos',
      prefixNote: 'Prefijo',
    },
    statusPage: {
      title: 'Estado de CiszuBot',
      subtitle:
        'El bot reporta su estado cada 60 segundos mediante un heartbeat. Esta página siempre muestra la última señal recibida.',
      online: 'En línea',
      offline: 'Sin señal',
      servers: 'Servidores conectados',
      commandsRun: 'Comandos ejecutados',
      uptime: 'Tiempo activo',
      version: 'Versión',
      startedAt: 'Iniciado',
      lastSeen: 'Última señal',
      refresh: 'La página se refresca automáticamente cada 60s.',
      updated: 'Datos de producción en vivo desde Supabase.',
      back: 'Volver al inicio',
    },
    supportPage: {
      title: 'Soporte',
      subtitle:
        '¿Necesitas ayuda con CiszuBot? Estos son los mejores canales para resolver cualquier duda o reportar un problema.',
      joinTitle: 'Servidor de Discord',
      joinDesc:
        'Únete a la comunidad de Ciszu Network. Canal de soporte, anuncios del bot y reportes de bugs.',
      joinCta: 'Unirme al servidor',
      faqTitle: 'Preguntas frecuentes',
      faq: [
        {
          q: '¿Cómo invito a CiszuBot a mi servidor?',
          a: 'Usa el botón «Invitar» en la página principal y elige el servidor. Necesitas permisos de «Gestionar servidor» en Discord.',
        },
        {
          q: '¿Cuál es el prefijo del bot?',
          a: 'El prefijo es cz!. También puedes usar los slash commands escribiendo / en Discord.',
        },
        {
          q: '¿CiszuBot es gratis?',
          a: 'Sí, el bot es completamente gratis. En el futuro puede haber donaciones opcionales para apoyar el desarrollo.',
        },
        {
          q: '¿Qué datos almacena el bot?',
          a: 'Solo registra un contador de comandos ejecutados y el estado de conexión. No se almacenan mensajes ni datos personales. Ver la política de privacidad.',
        },
        {
          q: '¿Puedo reportar un bug o pedir un comando?',
          a: 'Sí. Entra al servidor de Discord y usa el canal de soporte con una descripción del problema o tu idea.',
        },
      ],
      contactTitle: 'Contacto',
      contactDesc:
        'Para asuntos legales, prensa o colaboraciones escribe a:',
      contactCta: 'Enviar email',
      donateTitle: 'Apoya el proyecto',
      donateDesc:
        'CiszuBot es un proyecto sin ánimo de lucro. Si quieres apoyar su desarrollo, pronto habrá donaciones opcionales.',
      comingSoon: 'Próximamente',
      listsTitle: 'Listas de bots',
      listsDesc:
        'CiszuBot está disponible en directorios de bots. Vótalo en las listas para ayudarnos a crecer:',
      vote: 'Votar',
      serverListsTitle: 'Nuestro servidor en las listas',
      server: 'Servidor',
    },
    legalPage: {
      updated: 'Última actualización: 2 de agosto de 2026',
      back: 'Volver',
      sections: [
        {
          h: '1. Aceptación de los términos',
          p: 'Al invitar y utilizar CiszuBot («el Bot») en un servidor de Discord, aceptas estos Términos de Servicio. Si no estás de acuerdo, no añadas el Bot a tu servidor.',
        },
        {
          h: '2. Uso del servicio',
          p: 'El Bot es gratuito y se ofrece «tal cual». No garantizamos disponibilidad continua ni ausencia de errores. Está prohibido usar el Bot para violar los Términos de Servicio de Discord, las leyes aplicables o los derechos de terceros.',
        },
        {
          h: '3. Propiedad intelectual',
          p: 'CiszuBot, su logotipo, marca y código son propiedad de CiszukoAntony. No se otorga ninguna licencia salvo el derecho de invitar al Bot a un servidor.',
        },
        {
          h: '4. Cambios en el servicio',
          p: 'Podemos modificar, pausar o discontinuar el Bot, sus comandos o estos términos en cualquier momento. Los cambios se publicarán en esta página.',
        },
        {
          h: '5. Limitación de responsabilidad',
          p: 'El Bot no será responsable de daños directos o indirectos derivados de su uso, incluyendo pérdida de datos o interrupciones.',
        },
        {
          h: '6. Contacto',
          p: 'Para preguntas sobre estos términos, únete al servidor de soporte de Discord.',
        },
      ],
    },
    privacyPage: {
      updated: 'Última actualización: 2 de agosto de 2026',
      back: 'Volver',
      sections: [
        {
          h: '1. Datos que recopilamos',
          p: 'El Bot registra un contador de comandos ejecutados, el número de servidores en los que está y el estado de conexión (online/offline). Estos datos se usan para la página de estado pública del bot.',
        },
        {
          h: '2. Datos que NO recopilamos',
          p: 'No almacenamos mensajes, contenido de comandos, datos personales, direcciones IP ni información de usuarios de Discord.',
        },
        {
          h: '3. Almacenamiento y seguridad',
          p: 'Los datos se almacenan en una base de datos en la nube (Supabase) con acceso restringido y políticas de seguridad. Solo se usan con fines operativos.',
        },
        {
          h: '4. Uso de los datos',
          p: 'Los datos agregados (nº de servidores, comandos ejecutados) se muestran públicamente en ciszubot.vercel.app como estadísticas del bot.',
        },
        {
          h: '5. Terceros',
          p: 'No vendemos, alquilamos ni compartimos datos con terceros. El bot usa la API de Discord y servicios de hosting estándar.',
        },
        {
          h: '6. Contacto',
          p: 'Para ejercer tus derechos o preguntar sobre esta política, únete al servidor de soporte de Discord.',
        },
      ],
    },
  },
  en: {
    nav: {
      home: 'Home',
      commands: 'Commands',
      status: 'Status',
      support: 'Support',
      invite: 'Invite',
    },
    hero: {
      online: 'Online',
      offline: 'Offline',
      tagline: "Ciszu Network's Discord bot",
      description:
        'Fun, informative and utility commands, in Spanish. With cz! prefix and slash commands.',
      ctaInvite: 'Invite to Discord',
      ctaGithub: 'GitHub',
    },
    stats: {
      servers: 'Servers',
      commandsRun: 'Commands run',
      uptime: 'Uptime',
      commands: 'Commands',
    },
    features: {
      title: 'Why CiszuBot?',
      subtitle: 'Everything you need for your server, without the hassle.',
      items: [
        { title: 'Fast & lightweight', desc: 'Instant response to every command, no lag.' },
        { title: '100% Spanish', desc: 'The whole bot, its commands and messages are in your language.' },
        { title: 'Varied commands', desc: 'Fun, info, social and utility in a single bot.' },
        { title: 'Privacy first', desc: 'We do not sell data. We only log command usage to improve.' },
      ],
    },
    commandsSection: {
      kicker: '72 commands · 9 categories',
      title: 'Commands',
      subtitle: 'Type cz!command in chat or /command with the Discord bar.',
      viewAll: 'View all commands',
      usage: 'Usage',
      aliases: 'Aliases',
      categories: {
        'Diversión': 'Fun',
        'Información': 'Information',
        'Social': 'Social',
        'Utilidad': 'Utility',
        'Economía': 'Economy',
        'Música': 'Music',
        'Niveles': 'Levels',
        'Moderación': 'Moderation',
        'Configuración': 'Configuration',
      },
    },
    statusSection: {
      title: 'Live status',
      subtitle: 'The bot sends a heartbeat every 60 seconds. The page updates automatically.',
      online: 'Bot online',
      offline: 'Bot offline',
      servers: 'Servers',
      commands: 'Commands',
      uptime: 'Uptime',
      version: 'Version',
      lastSeen: 'Last update',
      heartbeat: 'The bot heartbeats every 60s and this page refreshes every 60s',
      noStatus: 'The bot has not reported status yet. If it just started, wait a moment.',
      viewPage: 'View detailed status',
    },
    ecosystem: {
      title: 'Ecosystem',
      subtitle: 'CiszuBot is part of Ciszu Network. Discover more projects.',
      visit: 'Visit',
      items: [
        {
          name: 'Ciszu Network',
          desc: 'The brand hub: digital ecosystem, networks and projects.',
        },
        {
          name: 'Ciszuko Antony',
          desc: "Personal portfolio: creator's logos, media and music.",
        },
      ],
    },
    cta: {
      title: 'Ready to try it?',
      description: 'Invite CiszuBot to your server in less than a minute. Free and fast.',
      button: 'Invite now',
    },
    footer: {
      explore: 'Explore',
      projects: 'Projects',
      bot: 'The Bot',
      legal: 'Legal',
      terms: 'Terms',
      privacy: 'Privacy',
      support: 'Support',
      prefix: 'Prefix',
      slash: 'Slash',
      discordServer: 'Discord server',
      rights: 'All rights reserved.',
      madeBy: 'Made by',
    },
    commandsPage: {
      title: 'Commands',
      subtitle:
        'All CiszuBot commands with their description, usage and aliases. Use them with cz! or as slash commands.',
      search: 'Search command or alias…',
      noResults: 'No commands found for “{q}”.',
      all: 'All',
      prefixNote: 'Prefix',
    },
    statusPage: {
      title: 'CiszuBot status',
      subtitle:
        'The bot reports its status every 60 seconds through a heartbeat. This page always shows the latest signal received.',
      online: 'Online',
      offline: 'No signal',
      servers: 'Connected servers',
      commandsRun: 'Commands run',
      uptime: 'Uptime',
      version: 'Version',
      startedAt: 'Started',
      lastSeen: 'Last signal',
      refresh: 'This page refreshes automatically every 60s.',
      updated: 'Live production data from Supabase.',
      back: 'Back to home',
    },
    supportPage: {
      title: 'Support',
      subtitle:
        'Need help with CiszuBot? These are the best channels to solve any question or report a problem.',
      joinTitle: 'Discord server',
      joinDesc:
        'Join the Ciszu Network community. Support channel, bot announcements and bug reports.',
      joinCta: 'Join the server',
      faqTitle: 'Frequently asked questions',
      faq: [
        {
          q: 'How do I invite CiszuBot to my server?',
          a: 'Use the “Invite” button on the home page and choose the server. You need “Manage server” permissions in Discord.',
        },
        {
          q: "What is the bot's prefix?",
          a: 'The prefix is cz!. You can also use slash commands by typing / in Discord.',
        },
        {
          q: 'Is CiszuBot free?',
          a: 'Yes, the bot is completely free. Optional donations may come in the future to support development.',
        },
        {
          q: 'What data does the bot store?',
          a: 'It only logs a counter of executed commands and connection status. No messages or personal data are stored. See the privacy policy.',
        },
        {
          q: 'Can I report a bug or request a command?',
          a: 'Yes. Join the Discord server and use the support channel with a description of the issue or your idea.',
        },
      ],
      contactTitle: 'Contact',
      contactDesc:
        'For legal matters, press or collaborations write to:',
      contactCta: 'Send email',
      donateTitle: 'Support the project',
      donateDesc:
        'CiszuBot is a non-profit project. If you want to support its development, optional donations are coming soon.',
      comingSoon: 'Coming soon',
      listsTitle: 'Bot lists',
      listsDesc:
        'CiszuBot is available in bot directories. Vote on the lists to help us grow:',
      vote: 'Vote',
      serverListsTitle: 'Our server on the lists',
      server: 'Server',
    },
    legalPage: {
      updated: 'Last updated: August 2, 2026',
      back: 'Back',
      sections: [
        {
          h: '1. Acceptance of terms',
          p: 'By inviting and using CiszuBot (“the Bot”) on a Discord server, you accept these Terms of Service. If you do not agree, do not add the Bot to your server.',
        },
        {
          h: '2. Use of the service',
          p: 'The Bot is free and provided “as is”. We do not guarantee continuous availability or absence of errors. Using the Bot to violate Discord Terms of Service, applicable laws or third-party rights is prohibited.',
        },
        {
          h: '3. Intellectual property',
          p: 'CiszuBot, its logo, brand and code are owned by CiszukoAntony. No license is granted except the right to invite the Bot to a server.',
        },
        {
          h: '4. Changes to the service',
          p: 'We may modify, pause or discontinue the Bot, its commands or these terms at any time. Changes will be published on this page.',
        },
        {
          h: '5. Limitation of liability',
          p: 'The Bot shall not be liable for direct or indirect damages arising from its use, including data loss or interruptions.',
        },
        {
          h: '6. Contact',
          p: 'For questions about these terms, join the Discord support server.',
        },
      ],
    },
    privacyPage: {
      updated: 'Last updated: August 2, 2026',
      back: 'Back',
      sections: [
        {
          h: '1. Data we collect',
          p: 'The Bot logs a counter of executed commands, the number of servers it is on and connection status (online/offline). This data powers the public status page of the bot.',
        },
        {
          h: '2. Data we DO NOT collect',
          p: 'We do not store messages, command content, personal data, IP addresses or Discord user information.',
        },
        {
          h: '3. Storage and security',
          p: 'Data is stored in a cloud database (Supabase) with restricted access and security policies. It is only used for operational purposes.',
        },
        {
          h: '4. Use of data',
          p: 'Aggregated data (server count, executed commands) is publicly displayed on ciszubot.vercel.app as bot statistics.',
        },
        {
          h: '5. Third parties',
          p: 'We do not sell, rent or share data with third parties. The bot uses the Discord API and standard hosting services.',
        },
        {
          h: '6. Contact',
          p: 'To exercise your rights or ask about this policy, join the Discord support server.',
        },
      ],
    },
  },
} as const;

type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };

export type Dict = DeepString<(typeof dict)['es']>;

export function getDict(lang: Lang): Dict {
  return lang === 'en' ? dict.en : dict.es;
}

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'es', label: 'ES', flag: 'es' },
  { code: 'en', label: 'EN', flag: 'gb' },
];
