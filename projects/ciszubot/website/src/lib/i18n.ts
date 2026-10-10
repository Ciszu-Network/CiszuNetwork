import { applyDialect } from '@ciszunetwork/utils/i18n-audit';

export type Lang = 'es-latam' | 'es-es' | 'en-us' | 'en-uk';

export const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1395532235872141312&permissions=8&scope=bot%20applications.commands';

export const DISCORD_SERVER = 'https://discord.gg/W3kMtMMj6E';
export const GITHUB_ORG = 'https://github.com/Ciszu-Network';
export const GITHUB_REPO = 'https://github.com/Ciszu-Network/CiszuNetwork';
export const YOUTUBE = 'https://www.youtube.com/@CiszuNetwork';
export const FACEBOOK = 'https://www.facebook.com/profile.php?id=61572023767657';
export const INSTAGRAM = 'https://www.instagram.com/ciszunetwork/';
export const X_SOCIAL = 'https://x.com/CiszukoAntony';
export const TIKTOK = 'https://www.tiktok.com/@ciszunetwork';
export const CISZU_NETWORK = 'https://ciszunetwork.vercel.app';
export const CISZUKO_ANTONY = 'https://ciszukoantony.vercel.app';

export const BOT_PREFIX = 'cz!';
export const BOT_VERSION = 'v3.2.0';

// === Email de feedback ===
export const FEEDBACK_EMAIL = 'ciszunetwork@gmail.com';

// === URLs oficiales (listas de bots, servidores, donaciones) ===
export const WEBSITE = 'https://ciszubot.vercel.app';
export const TOP_GG_BOT = 'https://top.gg/bot/1395532235872141312';
export const TOP_GG_BOT_VOTE = 'https://top.gg/bot/1395532235872141312/vote';
export const TOP_GG_SERVER = 'https://top.gg/es/discord/servers/871620279188504576';
export const DISCORD_BOT_LIST_BOT = 'https://discordbotlist.com/bots/ciszubot';
export const DISCORD_BOT_LIST_BOT_VOTE = 'https://discordbotlist.com/bots/ciszubot/upvote';
export const DISCORD_BOT_LIST_SERVER = 'https://discordbotlist.com/servers/ciszugamens';
export const DISBOARD_SERVER = 'https://disboard.org/es/server/1215544133142450187';
export const TOP_GG_WIDGET_BOT = 'https://top.gg/api/widget/1395532235872141312.svg';
export const TOP_GG_WIDGET_SERVER = 'https://top.gg/api/v1/widgets/large/871620279188504576';
export const PATREON = 'https://www.patreon.com/cw/ciszukoantony';
export const KO_FI = 'https://ko-fi.com/ciszukoantony';
export const BUY_ME_A_COFFEE = 'https://buymeacoffee.com/ciszukoantony';

export const LOGO_ISOTIPO =
  'projects/ciszubot/content/logos/images/not-outline/isotype/color/ciszubot_logo_isotipo_color.png';
export const LOGO_ISOTIPO_CIRCLE =
  'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png';
export const LOGO_LOGOTIPO =
  'projects/ciszubot/content/logos/images/outline/logotype/color/ciszubot_logotipo_outline_color.svg';

// ── Diccionarios: los 4 idiomas de producción son INDIVIDUALES entre sí ─────
// es-latam (Español Latam), es-es (Español España), en-us (English US),
// en-uk (English UK). Cada uno tiene su propia entrada; nunca se juntan.

const es = {
  nav: {
    home: 'Inicio',
    commands: 'Comandos',
    status: 'Estado',
    stats: 'Estadísticas',
    support: 'Soporte',
    downloads: 'Descargas',
    feedback: 'Feedback',
    invite: 'Invitar',
    explore: 'Explorar',
    search: 'Buscar página…',
    searchHint: 'Qué necesitas encontrar',
    dashboard: 'Panel',
    privacidad: 'Privacidad',
    terminos: 'Términos',
    changelog: 'Cambios',
    reviews: 'Reseñas',
    leaderboard: 'Ranking',
    forum: 'Foro',
    contact: 'Contacto',
    documentation: 'Documentación',
    about: 'Acerca de',
    team: 'Equipo',
    help: 'Ayuda',
    donate: 'Donar',
    information: 'Información',
    faq: 'Preguntas Frecuentes',
    credits: 'Créditos',
    guidelines: 'Lineamientos',
    rules: 'Reglas',
    license: 'Licencia',
    policy: 'Política',
    menu: 'Menú',
    languages: 'Idiomas',
    navigation: 'Navegación',
    accountSection: 'Cuenta',
    account: 'Cuenta',
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    signOut: 'Cerrar sesión',
    continueDiscord: 'Continuar con Discord',
    signInDiscord: 'Iniciar sesión con Discord',
    dashboardControl: 'Panel de control',
    guestNotice: 'Estás navegando como invitado',
    localPreferences: 'Preferencias locales',
    inviteHint: 'Añade a CiszuBot a tu servidor de Discord',
    unavailable: 'No disponible',
    resetSearch: 'Reiniciar búsqueda',
    toggleTheme: 'Cambiar tema',
    themeDarkOn: 'Modo oscuro activado',
    themeLightOn: 'Modo claro activado',
    langChanged: 'Idioma cambiado a {lang}',
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
    offline: 'Bot desconectado',
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
    providedTitle: 'Proyecto ofrecido por Ciszu Network',
    providedDesc:
      'CiszuBot forma parte del ecosistema de Ciszu Network. Descubre más proyectos y herramientas creadas por Ciszuko Antony.',
  },
  cta: {
    title: '¿Listo para probarlo?',
    description: 'Invita a CiszuBot a tu servidor en menos de un minuto. Gratis y rápido.',
    button: 'Invitar ahora',
  },
  quickDocks: {
    subtitle: 'Acceso rápido a todas las secciones',
  },
  prefs: {
    title: 'Preferencias locales',
    language: 'Idioma',
    changeLanguage: 'Cambiar idioma',
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro',
    zoomOut: 'Quitar zoom',
    zoomIn: 'Sumar zoom',
    muteTab: 'Silenciar pestaña',
    muted: 'Pestaña silenciada',
    unmuted: 'Pestaña restaurada',
    cookies: 'Cookies',
    cookiesAccepted: 'Aceptadas',
    cookiesRejected: 'Rechazadas',
    cookiesUndecided: 'Sin decidir',
    rejectCookies: 'Rechazar cookies',
    acceptCookies: 'Aceptar cookies',
    reappearCookies: 'Reaparecer aviso de cookies',
    cookiesRejectedToast: 'Cookies rechazadas: los servicios opcionales están desactivados.',
    cookiesAcceptedToast: 'Cookies aceptadas. Gracias por apoyar a CiszuBot.',
    cookiesReappearToast: 'El aviso de cookies volverá a aparecer.',
    navigation: 'Navegación',
    redirectGuard: 'Aviso de redirección',
    redirectGuardTitle: 'Aviso azul al salir a otra web',
    redirectGuardOn: 'Aviso de redirección activado',
    redirectGuardOff: 'Aviso de redirección desactivado',
    activityGuard: 'Proteger acciones',
    activityGuardTitle: 'Aviso rojo si vas a perder progreso al navegar',
    activityGuardOn: 'Protección de acciones activada',
    activityGuardOff: 'Protección de acciones desactivada',
    help: 'Ayuda y soporte',
  },
  feedbackFab: {
    report: 'Reportar un problema',
    dismissedTitle: 'Feedback ocultado',
    dismissedHint:
      'Has ocultado el botón de reporte. Puedes reactivarlo desde la página de Feedback.',
    reactivate: 'Reactivar en Feedback',
    dontShow: 'No volver a mostrar',
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
    discordServer: 'Ciszugamens',
    communityServer: 'Servidor de Discord · Ciszugamens',
    openSource: 'Open Source · Repositorio en GitHub',
    backedBy: 'respaldado por',
    rights: 'Todos los derechos reservados.',
    madeBy: 'Hecho con amor por',
  },
  cookiesBanner: {
    title: 'Uso de Cookies y Privacidad',
    text: 'Utilizamos cookies propias y de terceros (incluyendo servicios de Google y Cloudflare) para mantener tu sesión activa, proteger el bot de bots y mejorar tu experiencia. Al continuar navegando, aceptas nuestra ',
    privacyLink: 'Política de Privacidad',
    termsLink: 'Términos de Servicio',
    accept: 'ENTENDIDO',
    reject: 'RECHAZAR',
  },
  commandsPage: {
    title: 'Comandos',
    subtitle:
      'Todos los comandos de CiszuBot con su descripción, uso y aliases. Úsalos con cz! o como slash commands.',
    search: 'Buscar comando o alias…',
    noResults: 'No se encontraron comandos para «{q}».',
    all: 'Todos',
    prefixNote: 'Prefijo',
    syntax: 'Sintaxis',
    example: 'Ejemplo',
    related: 'Comandos relacionados',
    aliasesTitle: 'Alias y variantes',
    copy: 'Copiar',
    copied: '¡Copiado!',
    required: 'obligatorio',
    optional: 'opcional',
    syntaxLegend: 'Entre <ángulos> lo obligatorio y entre [corchetes] lo opcional.',
    refLabel: 'Referencia',
    categoryLabel: 'Categoría',
    slashLabel: 'También como slash command',
    detailCta: 'Ver más',
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
    newTicket: 'Nuevo Ticket',
    helpCenter: 'Centro de Ayuda',
    guidesProtocols: 'Guías y Protocolos',
    directChannels: 'Canales Directos',
    infoLabel: 'Información',
    aboutProject: 'Acerca del Proyecto',
    authRequired: 'AUTENTICACIÓN REQUERIDA',
    authRequiredDesc: 'Para garantizar la integridad y el seguimiento de tu ticket, debes estar autenticado.',
    assistanceProtocol: 'Protocolo de Asistencia',
    assistanceDesc: '¿No encontraste solución en los recursos anteriores? Genera un ticket a continuación. Garantizamos respuesta en menos de 24h.',
    senderIdentity: 'Identidad del Remitente',
    displayNameLabel: 'Display Name',
    usernameLabel: 'Username (@)',
    contactEmailLabel: 'Email de Contacto',
    ticketNature: 'Naturaleza del Ticket',
    contactTypeLabel: 'Tipo de Contacto',
    regionLabel: 'Región de Origen',
    categoryLabel: 'Categoría',
    subCategoryLabel: 'Sub-Categoría',
    requestDetails: 'Detalles del Requerimiento',
    phoneOptional: 'Teléfono (Opcional)',
    deviceLabel: 'Dispositivo / Sistema',
    messageLabel: 'Mensaje / Descripción',
    historyTitle: 'HISTORIAL DE ASISTENCIA',
    historyDesc: 'Visualización Privada de tus Requerimientos',
    syncing: 'Sincronizando con la Base de Datos...',
    noTickets: 'SIN TICKETS ACTIVOS',
    noTicketsDesc: 'No tienes registros pendientes en el sistema.',
    createFirstTicket: 'GENERAR PRIMER TICKET',
    receiverTitle: 'Receptor del Ticket',
    receiverName: 'Ciszu Network Support',
    receiverDesc: 'Tu requerimiento será procesado directamente por el **Equipo de Asistencia de CiszuBot**, bajo la supervisión de **Ciszuko Antony**.',
    operatingCore: 'NÚCLEO OPERATIVO',
    globalSupportActive: 'Soporte Global Activo',
    globalSupportDesc: 'Atendemos requerimientos las 24 horas, priorizando la estabilidad del ecosistema CiszuBot.',
    priorityLevels: 'Niveles de Prioridad',
    officialNetworks: 'REDES OFICIALES',
    exclusiveChannels: 'CANALES EXCLUSIVOS DE CISZUBOT',
    socialSync: 'Sincronización Social Unificada',
    phDisplayName: 'Ej: Ciszu Master',
    phUsername: 'Ej: antony_ciszu',
    phEmail: 'tu-email@servidor.com',
    phDevice: 'Ej: PC Windows 11, Chrome',
    phMessage: 'Describe tu situación detalladamente...',
  },
  feedbackPage: {
    title: 'Feedback',
    subtitle:
      'Tu opinión es importante. Reporta errores, pide comandos o comparte tus ideas para mejorar CiszuBot.',
    sections: {
      form: 'Formulario',
      formDesc:
        'Escríbenos directamente por correo. Los campos de nombre y email son opcionales.',
      report: 'Reporte de problemas',
      reportDesc:
        'El widget de Sentry captura un reporte con detalles técnicos (página, versión del navegador) y opcionalmente una captura de pantalla.',
    },
    name: 'Nombre',
    namePlaceholder: 'Tu nombre (opcional)',
    email: 'Email',
    emailPlaceholder: 'tu@email.com (opcional)',
    message: 'Mensaje',
    messagePlaceholder: 'Cuéntanos qué ocurrió o qué te gustaría que añadamos…',
    messageRequired: 'El mensaje es obligatorio.',
    emailInvalid: 'Introduce un email válido.',
    submit: 'Enviar feedback',
    submitted: 'Correo listo. Revisa tu cliente de correo y pulsa enviar para completar.',
    alternative: 'Prefieres email clásico',
    openReport: 'Abrir el reporte de problemas',
    openReportDesc: 'Usa el widget de Sentry para reportar un problema con captura de pantalla.',
    noSentry: 'El reporte no está disponible ahora. Usa el formulario o el servidor de soporte.',
    back: 'Volver al inicio',
  },
  descargasPage: {
    title: 'Descargas',
    subtitle:
      'Lleva CiszuBot a tu escritorio con la PDWA (App de Escritorio Progresiva): sin pestañas, sin barra de direcciones y con tu logo.',
    whatTitle: '¿Qué es la PDWA?',
    whatDesc:
      'Una PDWA (App de Escritorio Progresiva) es la web de CiszuBot instalada como una aplicación de escritorio real: se abre en su propia ventana, aparece en Inicio y en la barra de tareas, y funciona sin barra de navegación.',
    howTitle: 'Cómo instalarla',
    steps: [
      'Abre esta web en un navegador compatible (Chrome, Chromium o Edge).',
      'Pulsa el botón «Instalar PDWA» que flota en la esquina inferior izquierda.',
      'Confirma el diálogo del navegador (Instalar / Instalar aplicación). Opera no instala de forma nativa: el propio botón te muestra el método alternativo (acceso directo con --app=URL).',
      '¡Listo! CiszuBot queda como app en tu escritorio. Desde el menú podrás ocultar el botón.',
    ],
    installTitle: 'Instalar la PDWA',
    installDesc:
      'Pulsa el botón flotante inferior para instalar la app. Si tu navegador no lo permite, la web te guiará con una alternativa.',
    advantagesTitle: 'Ventajas',
    advantages: [
      'Abrir sin pestañas ni barra de direcciones.',
      'Icono propio en el escritorio y barra de tareas.',
      'Se actualiza sola, siempre la última versión.',
      'Funciona incluso en equipos de bajo rendimiento.',
    ],
    feedbackTitle: '¿Encontraste un problema?',
    feedbackDesc:
      'Tras instalar, si algo no funciona, cuéntanoslo desde Feedback o el botón flotante de reportes.',
    feedbackCta: 'Ir a Feedback',
    back: 'Volver al inicio',
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
      {
        h: 'Anuncios',
        p: 'CiszuBot muestra anuncios propios (promoción del ecosistema Ciszu Network) y, en el futuro, de terceros. Todos los anuncios son opcionales y cerrables, con temporizador visible y enlace a estas políticas. Las impresiones, clics y cierres se miden de forma agregada (Google Analytics 4) para mejorar la relevancia; nunca vinculamos anuncios a datos sensibles. Puedes gestionar o bloquear las cookies de análisis desde tu navegador.',
      },
      {
        h: 'Datos para recomendación de anuncios',
        p: 'Para recomendar mejores anuncios podemos usar señales de audiencia agregadas (páginas visitadas, idioma del navegador, región aproximada) recogidas por Google Analytics 4. Estos datos se tratan de forma agregada y anónima; no se utilizan para identificar a una persona concreta más allá de lo necesario para el servicio. Puedes bloquear las cookies de análisis desde tu navegador o desde las preferencias del sitio.',
      },
      {
        h: 'Geolocalización',
        p: 'Podemos estimar tu ubicación aproximada (región/país) a partir de tu dirección IP para ofrecer contenido y anuncios relevantes a tu región, cumplir requisitos legales locales y mejorar la seguridad. La geolocalización precisa (GPS) solo se utiliza si una funcionalidad lo requiere explícitamente y con tu consentimiento; nunca se usa para anuncios.',
      },
      {
        h: 'Reseñas y Calificaciones',
        p: 'Las calificaciones públicas de CiszuBot incorporan una reseña base fantasma de 5.0 para reflejar un estándar de calidad objetivo. Cuando no existen reseñas reales de usuarios, se muestra 5.0 y se indica expresamente que no hay reseñas para analizar. Cuando existen reseñas reales, la calificación pública es la media aritmética entre las reseñas de usuarios y la reseña base 5.0. No se falsifican reseñas: todas las reseñas visibles son reales o, en su defecto, se muestra el estado de "sin reseñas".',
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
  changelogPage: {
    title: 'Cambios',
    subtitle: 'Historial de cambios y actualizaciones de CiszuBot.',
    comingSoon: 'Próximamente: registro detallado de versiones, comandos añadidos y mejoras.',
    back: 'Volver al inicio',
  },
  reviewsPage: {
    title: 'Reseñas',
    subtitle: 'Opiniones y valoraciones de usuarios sobre CiszuBot.',
    comingSoon: 'Próximamente: reseñas integradas desde los directorios de bots.',
    back: 'Volver al inicio',
    heroTitle: 'RESEÑAS',
    realOnlyDesc: 'Solo mostramos reseñas reales de usuarios registrados. No generamos ni publicamos reseñas de ejemplo.',
    filterLowStars: '2★ o menos',
    filterWithLikes: 'Con likes',
    filterMine: 'Solo las mías',
    syncing: 'Sincronizando reseñas…',
    loadErrorTitle: 'No se pudieron cargar las reseñas',
    clearFilters: 'Limpiar filtros',
    trustTitle: 'Confianza y Verificación',
    trustTagline: 'Verified by community · Trusted by users · Powered by Ciszuko Antony',
    oneReviewOnly: 'Solo se permite una reseña por usuario',
    finalRating: 'Calificación final',
    halfStarsHint: 'Puedes elegir medias estrellas (2.5, 3.5, 4.5…)',
    phSearch: 'Buscar por comentario, nombre o @usuario…',
    phExperience: 'Cuenta tu experiencia con el proyecto…',
    searchAria: 'Buscar reseñas',
    verifiedAria: 'Reseña verificada',
    paginationAria: 'Paginación de reseñas',
    firstPage: 'Primera página',
    prevPage: 'Página anterior',
    nextPage: 'Página siguiente',
    lastPage: 'Última página',
  },
  leaderboardPage: {
    title: 'Ranking',
    subtitle: 'Top usuarios por economía de CiszuBot.',
    comingSoon: 'Próximamente: clasificación por comandos usados, niveles y servidores.',
    back: 'Volver al inicio',
  },
  forumPage: {
    title: 'Foro',
    subtitle: 'Comunidad y discusiones sobre CiszuBot.',
    comingSoon: 'Próximamente: foro integrado para ideas, soporte y debates.',
    back: 'Volver al inicio',
  },
  contactPage: {
    title: 'Contacto',
    subtitle: 'Canales oficiales para contactar con el equipo de CiszuBot.',
    comingSoon: 'Próximamente: formulario de contacto y enlaces directos.',
    back: 'Volver al inicio',
  },
  documentationPage: {
    title: 'Documentación',
    subtitle: 'Guías, referencias y recursos para usar y configurar CiszuBot.',
    comingSoon: 'Próximamente: documentación completa del bot y su API.',
    back: 'Volver al inicio',
  },
  aboutPage: {
    title: 'Acerca de',
    subtitle: 'Información sobre CiszuBot, su creador y el ecosistema Ciszu Network.',
    comingSoon: 'Próximamente: historia del proyecto, tecnologías y hoja de ruta.',
    back: 'Volver al inicio',
  },
  teamPage: {
    title: 'Equipo',
    subtitle: 'Personas detrás de CiszuBot y Ciszu Network.',
    comingSoon: 'Próximamente: perfiles del equipo, colaboradores y cómo participar.',
    back: 'Volver al inicio',
  },
  helpPage: {
    title: 'Ayuda',
    subtitle: 'Centro de ayuda: FAQ, tutoriales y solución de problemas.',
    comingSoon: 'Próximamente: guías paso a paso y respuestas a preguntas frecuentes.',
    back: 'Volver al inicio',
  },
  faqPage: {
    title: 'Preguntas Frecuentes',
    subtitle: 'Respuestas rápidas a las dudas más comunes sobre CiszuBot.',
    back: 'Volver al inicio',
    items: [
      { q: '¿Cómo invito a CiszuBot a mi servidor?', a: 'Usa el botón «Invitar» en la página principal y elige el servidor. Necesitas permisos de «Gestionar servidor» en Discord.' },
      { q: '¿Cuál es el prefijo del bot?', a: 'El prefijo es cz!. También puedes usar los slash commands escribiendo / en Discord.' },
      { q: '¿CiszuBot es gratis?', a: 'Sí, el bot es completamente gratis. En el futuro puede haber donaciones opcionales para apoyar el desarrollo.' },
      { q: '¿Qué datos almacena el bot?', a: 'Solo registra un contador de comandos ejecutados y el estado de conexión. No se almacenan mensajes ni datos personales. Ver la política de privacidad.' },
      { q: '¿Puedo reportar un bug o pedir un comando?', a: 'Sí. Entra al servidor de Discord y usa el canal de soporte con una descripción del problema o tu idea.' },
      { q: '¿Cómo cambio el idioma del bot?', a: 'CiszuBot detecta el idioma del servidor automáticamente. Actualmente soporta español latino, español España, inglés US y inglés UK.' },
      { q: '¿Los comandos funcionan en mensajes privados?', a: 'Algunos comandos de utilidad sí, pero la mayoría requieren estar en un servidor con permisos adecuados.' },
      { q: '¿Cómo solicito soporte oficial?', a: 'Escríbenos a ciszunetwork@gmail.com o únete al servidor de Discord de Ciszu Network.' },
    ],
  },
  dashboardPage: {
    title: 'Panel',
    subtitle:
      'Gestiona CiszuBot en tus servidores y revisa el estado de tu cuenta de Discord.',
    kicker: 'CiszuBot · Sesión de Discord',
    sessionActive: 'Sesión activa',
    dualDiscordOnly: 'Solo Discord',
    dualLinked: 'CISZU ID vinculado',
    dualControl: 'Control total',
    dualConnect: 'Inicia con CISZU ID para control total',
    ciszuConnected: 'CISZU ID ya conectado',
    ciszuConnectedDesc: 'Tu cuenta CISZU ID está activa',
    discordConnected: 'Discord conectado',
    discordNotConnected: 'Discord no conectado',
    connectDiscord: 'Conectar Discord',
    openDashboard: 'Ir al dashboard',
    openSettings: 'Abrir configuración',
    signOutCiszu: 'Cerrar sesión CISZU ID',
    accountId: 'ID de Discord',
    providerLabel: 'Proveedor',
    providerDiscord: 'Discord',
    serversTitle: 'Tus servidores',
    serversSubtitle: 'Elige un servidor administrable para configurar a CiszuBot.',
    noServers: 'No tienes servidores administrables.',
    noServersHint:
      'Necesitas el permiso «Gestionar servidor» en Discord y haber iniciado sesión para configurar el bot.',
    botActive: 'Bot activo',
    botMissing: 'Bot no presente',
    inviteCta: 'Invitar a CiszuBot',
    supportCta: 'Servidor de soporte',
    logout: 'Cerrar sesión',
    linksTitle: 'Enlaces útiles',
    links: {
      commands: 'Comandos',
      stats: 'Estado',
      support: 'Soporte',
      documentation: 'Documentación',
      invite: 'Invitación',
      explore: 'Explorar plataformas',
      download: 'Descargas',
    },
    betaBadge: 'BETA TRIAL FREE',
    betaNote:
      'CiszuBot está en beta: todas las funciones PREMIUM son gratis durante el trial. Cuéntanos tu experiencia en el servidor de soporte.',
    helpTitle: 'Ayuda y soporte',
    helpDesc:
      '¿Dudas o problemas? Pasa por el servidor de soporte o revisa la documentación paso a paso.',
    helpCta: 'Ir al soporte',
    docsCta: 'Ver documentación',
    howToTitle: 'Cómo usar CiszuBot',
    howToDesc:
      'Invítalo, elige un servidor administrable y configura cada módulo desde su panel. El panel flotante guarda tus cambios.',
    howToCta: 'Ver comandos',
    sponsorTitle: 'Autopatrocinio',
    sponsorDesc:
      'Integra CiszuBot en tu perfil de Discord para que cualquiera pueda instalarlo desde ti, y aparecerás en los directorios de bots.',
    sponsorProfile: 'Integrar en mi perfil',
    sponsorDirs: 'Directorios de bots',
    comingSoon: 'Próximamente',
    inviteBot: 'Invitar a mi servidor',
  },
  guildPage: {
    back: 'Volver',
    subtitle: 'Configuración de CiszuBot',
    betaBadge: 'BETA TRIAL FREE',
    betaNote:
      'Funciones en beta: durante el trial todo es gratis y puede cambiar. Guarda un backup JSON antes de grandes cambios.',
    summaryTitle: 'Resumen del servidor',
    summaryDesc: 'Datos en vivo leídos por CiszuBot.',
    membersLabel: 'Miembros',
    rolesLabel: 'Roles',
    channelsLabel: 'Canales',
    botLabel: 'Bot',
    botOnline: 'Conectado',
    botOffline: 'No conectado',
    refreshData: 'Recargar datos',
    refreshing: 'Recargando…',
    refreshed: 'Datos actualizados',
    refreshHint: 'Los datos del servidor se recargan solos cada minuto.',
    save: 'Guardar cambios',
    saving: 'Guardando…',
    saved: '¡Guardado!',
    saveError: 'No se pudo guardar la configuración.',
    autoSaveLabel: 'Autoguardado',
    autoSaveHint: 'Guarda solo, 2 s después de cada cambio.',
    undo: 'Deshacer',
    redo: 'Rehacer',
    exportJson: 'Exportar JSON',
    importJson: 'Importar JSON',
    exportSection: 'Exportar esta sección',
    imported: 'Importado: revisa y guarda',
    importError: 'JSON no válido para esta configuración.',
    unsaved: 'Cambios sin guardar',
    allSaved: 'Todo guardado',
    backupNote: 'Los JSON de backup llevan opción, servidor, fecha y usuario en el nombre.',
    free: 'FREE',
    premium: 'PREMIUM',
    generalTitle: 'General',
    generalHint: 'Ajustes básicos de CiszuBot en este servidor.',
    prefixLabel: 'Prefijo del bot',
    prefixHint: 'Ejemplo: cz!',
    langLabel: 'Idioma',
    levelsTitle: 'Niveles y XP',
    levelsToggle: 'Sistema de niveles',
    levelsToggleHint: 'Los miembros ganan XP al hablar',
    xpRateLabel: 'Multiplicador de XP',
    xpRateHint: '0.1 – 10 (por defecto 1)',
    levelChannelLabel: 'Canal de anuncios de nivel',
    levelChannelHint: 'Vacío para anunciar en el chat',
    welcomeTitle: 'Bienvenidas y despedidas',
    welcomeChannelLabel: 'Canal de bienvenidas',
    goodbyeChannelLabel: 'Canal de despedidas',
    emptyDisables: 'Vacío para desactivar',
    welcomeMessageLabel: 'Mensaje de bienvenida',
    goodbyeMessageLabel: 'Mensaje de despedida',
    varsHint: 'Variables: {user} {guild} {members}',
    autoroleLabel: 'Roles automáticos',
    autoroleHint: 'Se asignan a los nuevos miembros',
    extrasTitle: 'Tickets y extras',
    ticketsToggle: 'Sistema de tickets',
    ticketsToggleHint: 'Actívalo con cz!setuptickets en Discord',
    privateToggle: 'Canales privados',
    privateToggleHint: 'Los miembros crean sus canales con un botón',
    automodToggle: 'Auto-moderación',
    automodToggleHint: 'Protección básica contra spam',
    ticketCategoryLabel: 'Categoría de tickets',
    ticketRoleLabel: 'Rol de staff de tickets',
    privateCategoryLabel: 'Categoría de canales privados',
    musicChannelLabel: 'Canal de música',
    musicChannelHint: 'Canal de voz o texto para el reproductor',
    muteRoleLabel: 'Rol de mute',
    logsChannelLabel: 'Canal de logs',
    pickChannel: 'Elige un canal…',
    pickVoice: 'Elige un canal de voz…',
    pickCategory: 'Elige una categoría…',
    pickRole: 'Elige un rol…',
    noneSelected: 'Sin seleccionar',
    manualIdHint: 'Escribe el ID manualmente (no se pudo leer la lista de Discord).',
    errorLoad: 'No se pudo cargar la configuración.',
    loading: 'Cargando configuración…',
  },
  invitePage: {
    title: 'Invitación',
    subtitle:
      'Añade CiszuBot a tu servidor de Discord en menos de un minuto: gratis, sin registro y con todos los módulos listos.',
    kicker: 'Discord · Autorización oficial',
    cta: 'Invitar a CiszuBot',
    thanks: '¡Gracias por invitar a CiszuBot! Completa la autorización en Discord.',
    ctaNote: 'Se abre Discord en una pestaña nueva. Elige el servidor y acepta los permisos.',
    permissionsTitle: 'Permisos que solicita',
    permissions: [
      {
        title: 'Gestionar servidor',
        body: 'Leer canales, roles y ajustes para aplicar la configuración que hagas desde el panel.',
      },
      {
        title: 'Mensajes',
        body: 'Enviar y editar sus propios mensajes, y leer el historial para comandos y moderación.',
      },
      {
        title: 'Moderación',
        body: 'Borrar mensajes y sancionar usuarios cuando tus moderadores ejecuten los comandos.',
      },
      {
        title: 'Voz',
        body: 'Conectarse a canales de voz para reproducir música y avisos.',
      },
      {
        title: 'Usuarios y roles',
        body: 'Consultar usuarios y gestionar roles para niveles, economía y verificaciones.',
      },
      {
        title: 'Webhooks e invitaciones',
        body: 'Crear webhooks y leer invitaciones para registros, sorteos y bienvenidas.',
      },
    ],
    permissionsNote:
      'El enlace solicita permisos de administrador para que todos los módulos funcionen sin configuración extra. Puedes revocar cualquier permiso desde Discord.',
    stepsTitle: 'Cómo invitarlo en 3 pasos',
    steps: [
      {
        title: 'Pulsa «Invitar a CiszuBot»',
        body: 'Se abrirá Discord con la pantalla de autorización del bot.',
      },
      {
        title: 'Elige el servidor',
        body: 'Solo verás servidores donde tengas el permiso «Gestionar servidor».',
      },
      {
        title: 'Acepta los permisos',
        body: 'Revisa la lista y pulsa «Autorizar». CiszuBot queda listo al instante.',
      },
    ],
    supportCta: 'Entrar al servidor de soporte',
    exploreCta: 'Ver otras plataformas',
    flowTitle: '¡Gracias por invitar a CiszuBot!',
    flowBody:
      'Completa la autorización en Discord y, cuando termines, confirma aquí: te llevaremos al inicio.',
    flowDone: 'Ya invité al bot',
    flowHome: 'Ir al inicio ahora',
    flowWait: 'Esperar 10s más',
    flowCancel: 'Quedarme aquí',
    flowCountdown: 'Redirigiendo al inicio en {n}s',
    flowAgain: 'Invitar de nuevo',
    flowConfirmed: '¡Perfecto! Te llevamos al inicio…',
  },
  explorePage: {
    title: 'Explorar',
    subtitle:
      'CiszuBot y Ciszu Network en los principales directorios de Discord: vota, deja tu reseña o únete a la comunidad.',
    kicker: 'Top.gg · Discord Bot List · Disboard',
    platformsTitle: 'Plataformas',
    viewAll: 'Ver todas las plataformas',
    botsTitle: 'CiszuBot en las listas',
    serversTitle: 'Ciszugamens en las listas',
    communityTitle: 'Comunidad y soporte',
    visit: 'Visitar',
    vote: 'Votar',
    join: 'Unirme',
    platforms: {
      topggBot: {
        name: 'Top.gg · CiszuBot',
        desc: 'Ficha oficial del bot en Top.gg. Vótalo cada 12 horas para ayudarnos a subir puestos.',
      },
      topggServer: {
        name: 'Top.gg · Ciszugamens',
        desc: 'Ficha del servidor de la comunidad en Top.gg. Vótalo para darle más visibilidad.',
      },
      dblBot: {
        name: 'Discord Bot List · Bot',
        desc: 'CiszuBot en Discord Bot List. Vota y deja tu reseña para que más gente lo descubra.',
      },
      dblServer: {
        name: 'Discord Bot List · Servidor',
        desc: 'El servidor Ciszugamens en Discord Bot List, con su ficha y votos.',
      },
      disboard: {
        name: 'Disboard · Ciszugamens',
        desc: 'Listado de nuestro servidor en Disboard, el directorio de servidores de Discord.',
      },
      ciszugamens: {
        name: 'Ciszu Gamens',
        desc: 'El servidor propio de la comunidad: soporte, anuncios del bot y eventos.',
      },
    },
    widgetsTitle: 'Widgets de Top.gg',
    widgetsDesc:
      'Inserta el estado en vivo de CiszuBot en tu web o úsalo como firma. Se actualiza automáticamente.',
    widgetBotAlt: 'Widget de CiszuBot en Top.gg',
    widgetServerAlt: 'Widget del servidor Ciszugamens en Top.gg',
    codeTitle: 'Código embebible',
    codeDesc:
      'Copia el HTML y pega el widget en tu web, foro o README. El estado se actualiza solo.',
    copyWidgetBot: 'Copiar código del widget del bot',
    copyWidgetServer: 'Copiar código del widget del servidor',
    copied: '¡Copiado!',
    botIdLabel: 'ID del bot',
    botIdHint: 'Úsalo en listas, widgets y autorizaciones oficiales.',
    ctaTitle: '¿Aún no tienes el bot?',
    ctaDesc: 'Invítalo a tu servidor y empieza a usar sus comandos en segundos.',
    ctaButton: 'Invitar a CiszuBot',
  },
};

const en = {
  nav: {
    home: 'Home',
    commands: 'Commands',
    status: 'Status',
    stats: 'Stats',
    support: 'Support',
    downloads: 'Downloads',
    feedback: 'Feedback',
    invite: 'Invite',
    explore: 'Explore',
    search: 'Search page…',
    searchHint: 'What do you need to find',
    dashboard: 'Dashboard',
    privacidad: 'Privacy',
    terminos: 'Terms',
    changelog: 'Changelog',
    reviews: 'Reviews',
    leaderboard: 'Leaderboard',
    forum: 'Forum',
    contact: 'Contact',
    documentation: 'Documentation',
    about: 'About',
    team: 'Team',
    help: 'Help',
    donate: 'Donate',
    information: 'Information',
    faq: 'FAQ',
    credits: 'Credits',
    guidelines: 'Guidelines',
    rules: 'Rules',
    license: 'License',
    policy: 'Policy',
    menu: 'Menu',
    languages: 'Languages',
    navigation: 'Navigation',
    accountSection: 'Account',
    account: 'Account',
    signIn: 'Sign in',
    signUp: 'Sign up',
    signOut: 'Sign out',
    continueDiscord: 'Continue with Discord',
    signInDiscord: 'Sign in with Discord',
    dashboardControl: 'Control panel',
    guestNotice: 'You are browsing as a guest',
    localPreferences: 'Local preferences',
    inviteHint: 'Add CiszuBot to your Discord server',
    unavailable: 'Unavailable',
    resetSearch: 'Reset search',
    toggleTheme: 'Toggle theme',
    themeDarkOn: 'Dark mode enabled',
    themeLightOn: 'Light mode enabled',
    langChanged: 'Language changed to {lang}',
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
    providedTitle: 'Project provided by Ciszu Network',
    providedDesc:
      'CiszuBot is part of the Ciszu Network ecosystem. Discover more projects and tools built by Ciszuko Antony.',
  },
  cta: {
    title: 'Ready to try it?',
    description: 'Invite CiszuBot to your server in less than a minute. Free and fast.',
    button: 'Invite now',
  },
  quickDocks: {
    subtitle: 'Quick access to every section',
  },
  prefs: {
    title: 'Local preferences',
    language: 'Language',
    changeLanguage: 'Change language',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    muteTab: 'Mute tab',
    muted: 'Tab muted',
    unmuted: 'Tab restored',
    cookies: 'Cookies',
    cookiesAccepted: 'Accepted',
    cookiesRejected: 'Rejected',
    cookiesUndecided: 'Undecided',
    rejectCookies: 'Reject cookies',
    acceptCookies: 'Accept cookies',
    reappearCookies: 'Show cookie banner again',
    cookiesRejectedToast: 'Cookies rejected: optional services are now disabled.',
    cookiesAcceptedToast: 'Cookies accepted. Thank you for supporting CiszuBot.',
    cookiesReappearToast: 'The cookie banner will appear again.',
    navigation: 'Navigation',
    redirectGuard: 'Redirect warning',
    redirectGuardTitle: 'Blue warning when leaving to another site',
    redirectGuardOn: 'Redirect warning enabled',
    redirectGuardOff: 'Redirect warning disabled',
    activityGuard: 'Protect actions',
    activityGuardTitle: 'Red warning if you are about to lose progress',
    activityGuardOn: 'Action protection enabled',
    activityGuardOff: 'Action protection disabled',
    help: 'Help and support',
  },
  feedbackFab: {
    report: 'Report a problem',
    dismissedTitle: 'Feedback hidden',
    dismissedHint:
      'You have hidden the report button. You can restore it from the Feedback page.',
    reactivate: 'Restore in Feedback',
    dontShow: 'Do not show again',
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
    discordServer: 'Ciszugamens',
    communityServer: 'Discord server · Ciszugamens',
    openSource: 'Open source · GitHub repository',
    backedBy: 'backed by',
    rights: 'All rights reserved.',
    madeBy: 'Made with love by',
  },
  cookiesBanner: {
    title: 'Cookies & Privacy',
    text: 'We use first and third-party cookies (including Google and Cloudflare services) to keep your session active, protect the bot from bots and improve your experience. By continuing to browse, you accept our ',
    privacyLink: 'Privacy Policy',
    termsLink: 'Terms of Service',
    accept: 'GOT IT',
    reject: 'REJECT',
  },
  commandsPage: {
    title: 'Commands',
    subtitle:
      'All CiszuBot commands with their description, usage and aliases. Use them with cz! or as slash commands.',
    search: 'Search command or alias…',
    noResults: 'No commands found for “{q}”.',
    all: 'All',
    prefixNote: 'Prefix',
    syntax: 'Syntax',
    example: 'Example',
    related: 'Related commands',
    aliasesTitle: 'Aliases and variants',
    copy: 'Copy',
    copied: 'Copied!',
    required: 'required',
    optional: 'optional',
    syntaxLegend: 'Angle brackets <like this> are required and square brackets [like this] are optional.',
    refLabel: 'Reference',
    categoryLabel: 'Category',
    slashLabel: 'Also available as a slash command',
    detailCta: 'Details',
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
    joinTitle: 'Ciszugamens',
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
      'For legal matters, press or collaborations, write to:',
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
    newTicket: 'New Ticket',
    helpCenter: 'Help Center',
    guidesProtocols: 'Guides & Protocols',
    directChannels: 'Direct Channels',
    infoLabel: 'Information',
    aboutProject: 'About the Project',
    authRequired: 'AUTHENTICATION REQUIRED',
    authRequiredDesc: 'To guarantee the integrity and tracking of your ticket, you must be authenticated.',
    assistanceProtocol: 'Assistance Protocol',
    assistanceDesc: 'Didn\'t find a solution in the resources above? Create a ticket below. We guarantee a response in under 24h.',
    senderIdentity: 'Sender Identity',
    displayNameLabel: 'Display Name',
    usernameLabel: 'Username (@)',
    contactEmailLabel: 'Contact Email',
    ticketNature: 'Ticket Nature',
    contactTypeLabel: 'Contact Type',
    regionLabel: 'Origin Region',
    categoryLabel: 'Category',
    subCategoryLabel: 'Sub-Category',
    requestDetails: 'Request Details',
    phoneOptional: 'Phone (Optional)',
    deviceLabel: 'Device / System',
    messageLabel: 'Message / Description',
    historyTitle: 'ASSISTANCE HISTORY',
    historyDesc: 'Private view of your requests',
    syncing: 'Syncing with the Database...',
    noTickets: 'NO ACTIVE TICKETS',
    noTicketsDesc: 'You have no pending records in the system.',
    createFirstTicket: 'CREATE FIRST TICKET',
    receiverTitle: 'Ticket Receiver',
    receiverName: 'Ciszu Network Support',
    receiverDesc: 'Your request will be processed directly by the **CiszuBot Assistance Team**, under the supervision of **Ciszuko Antony**.',
    operatingCore: 'OPERATING CORE',
    globalSupportActive: 'Global Support Active',
    globalSupportDesc: 'We handle requests 24 hours a day, prioritising the stability of the CiszuBot ecosystem.',
    priorityLevels: 'Priority Levels',
    officialNetworks: 'OFFICIAL NETWORKS',
    exclusiveChannels: 'CISZUBOT EXCLUSIVE CHANNELS',
    socialSync: 'Unified Social Sync',
    phDisplayName: 'Example: Ciszu Master',
    phUsername: 'Example: antony_ciszu',
    phEmail: 'your-email@server.com',
    phDevice: 'Example: Windows 11 PC, Chrome',
    phMessage: 'Describe your situation in detail...',
  },
  feedbackPage: {
    title: 'Feedback',
    subtitle:
      'Your opinion matters. Report bugs, request commands or share your ideas to improve CiszuBot.',
    sections: {
      form: 'Form',
      formDesc: 'Write to us directly by email. Name and email fields are optional.',
      report: 'Problem report',
      reportDesc:
        'The Sentry widget captures a report with technical details (page, browser version) and optionally a screenshot.',
    },
    name: 'Name',
    namePlaceholder: 'Your name (optional)',
    email: 'Email',
    emailPlaceholder: 'you@email.com (optional)',
    message: 'Message',
    messagePlaceholder: 'Tell us what happened or what you would like us to add…',
    messageRequired: 'The message is required.',
    emailInvalid: 'Please enter a valid email.',
    submit: 'Send feedback',
    submitted: 'Email ready. Check your mail client and hit send to finish.',
    alternative: 'Prefer classic email',
    openReport: 'Open problem report',
    openReportDesc: 'Use the Sentry widget to report a problem with a screenshot.',
    noSentry: 'The report is unavailable right now. Use the form or the support server.',
    back: 'Back to home',
  },
  descargasPage: {
    title: 'Downloads',
    subtitle:
      'Bring CiszuBot to your desktop with the PDWA (Progressive Desktop Web App): no tabs, no address bar and with your logo.',
    whatTitle: 'What is the PDWA?',
    whatDesc:
      'A PDWA (Progressive Desktop Web App) is the CiszuBot website installed as a real desktop application: it opens in its own window, appears in Start and the taskbar, and works without a navigation bar.',
    howTitle: 'How to install it',
    steps: [
      'Open this website in a supported browser (Chrome, Chromium or Edge).',
      'Click the “Install PDWA” button floating in the bottom-left corner.',
      'Confirm the browser dialog (Install / Install application). Opera does not install natively: the button itself shows the alternative method (shortcut with --app=URL).',
      'Done! CiszuBot becomes a desktop app. From its menu you can hide the button.',
    ],
    installTitle: 'Install the PDWA',
    installDesc:
      'Click the floating bottom button to install the app. If your browser does not allow it, the website will guide you with an alternative.',
    advantagesTitle: 'Advantages',
    advantages: [
      'Opens without tabs or an address bar.',
      'Its own icon on the desktop and taskbar.',
      'Updates by itself, always the latest version.',
      'Works even on low-end devices.',
    ],
    feedbackTitle: 'Found a problem?',
    feedbackDesc:
      'After installing, if something does not work, tell us from Feedback or the floating report button.',
    feedbackCta: 'Go to Feedback',
    back: 'Back to home',
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
      {
        h: 'Ads',
        p: 'CiszuBot displays its own ads (promotion of the Ciszu Network ecosystem) and, in the future, third-party ads. All ads are optional and closable, with a visible countdown timer and a link to these policies. Impressions, clicks and dismissals are measured in aggregate (Google Analytics 4) to improve relevance; we never link ads to sensitive data. You can manage or block analytics cookies from your browser.',
      },
      {
        h: 'Data for ad recommendations',
        p: 'To recommend better ads we may use aggregate audience signals (pages visited, browser language, approximate region) collected by Google Analytics 4. This data is processed in an aggregated and anonymous way and is never used to identify a specific person beyond what is strictly necessary for the service. You can block analytics cookies from your browser or site preferences.',
      },
      {
        h: 'Geolocation',
        p: 'We may estimate your approximate location (region/country) from your IP address to serve content and ads relevant to your region, comply with local legal requirements and improve security. Precise (GPS) geolocation is only used when a feature explicitly requires it and with your consent; it is never used for advertising.',
      },
      {
        h: 'Reviews & Ratings',
        p: 'Public ratings for CiszuBot incorporate a ghost baseline review of 5.0 to reflect an objective quality standard. When no real user reviews exist, the displayed score is 5.0 and it is clearly indicated that there are no reviews to analyze. When real user reviews exist, the public rating is the arithmetic mean of the real reviews and the baseline 5.0. No reviews are fabricated: all visible reviews are real, or the site explicitly shows a "no reviews" state.',
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
  changelogPage: {
    title: 'Changelog',
    subtitle: 'History of changes and updates for CiszuBot.',
    comingSoon: 'Coming soon: detailed version log, added commands and improvements.',
    back: 'Back to home',
  },
  reviewsPage: {
    title: 'Reviews',
    subtitle: 'User reviews and ratings for CiszuBot.',
    comingSoon: 'Coming soon: integrated reviews from bot directories.',
    back: 'Back to home',
    heroTitle: 'REVIEWS',
    realOnlyDesc: 'We only show real reviews from registered users. We never generate or publish sample reviews.',
    filterLowStars: '2★ or less',
    filterWithLikes: 'With likes',
    filterMine: 'Only mine',
    syncing: 'Syncing reviews…',
    loadErrorTitle: 'Could not load reviews',
    clearFilters: 'Clear filters',
    trustTitle: 'Trust & Verification',
    trustTagline: 'Verified by community · Trusted by users · Powered by Ciszuko Antony',
    oneReviewOnly: 'Only one review per user is allowed',
    finalRating: 'Final rating',
    halfStarsHint: 'You can pick half stars (2.5, 3.5, 4.5…)',
    phSearch: 'Search by comment, name or @username…',
    phExperience: 'Tell your experience with the project…',
    searchAria: 'Search reviews',
    verifiedAria: 'Verified review',
    paginationAria: 'Reviews pagination',
    firstPage: 'First page',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    lastPage: 'Last page',
  },
  leaderboardPage: {
    title: 'Leaderboard',
    subtitle: 'Most active users and servers of CiszuBot.',
    comingSoon: 'Coming soon: rankings by commands run, levels and servers.',
    back: 'Back to home',
  },
  forumPage: {
    title: 'Forum',
    subtitle: 'Community and discussions about CiszuBot.',
    comingSoon: 'Coming soon: integrated forum for ideas, support and debates.',
    back: 'Back to home',
  },
  contactPage: {
    title: 'Contact',
    subtitle: 'Official channels to contact the CiszuBot team.',
    comingSoon: 'Coming soon: contact form and direct links.',
    back: 'Back to home',
  },
  documentationPage: {
    title: 'Documentation',
    subtitle: 'Guides, references and resources to use and configure CiszuBot.',
    comingSoon: 'Coming soon: complete bot and API documentation.',
    back: 'Back to home',
  },
  aboutPage: {
    title: 'About',
    subtitle: 'Information about CiszuBot, its creator and the Ciszu Network ecosystem.',
    comingSoon: 'Coming soon: project history, technologies and roadmap.',
    back: 'Back to home',
  },
  teamPage: {
    title: 'Team',
    subtitle: 'People behind CiszuBot and Ciszu Network.',
    comingSoon: 'Coming soon: team profiles, collaborators and how to contribute.',
    back: 'Back to home',
  },
  helpPage: {
    title: 'Help',
    subtitle: 'Help center: FAQ, tutorials and troubleshooting.',
    comingSoon: 'Coming soon: step-by-step guides and frequently asked questions.',
    back: 'Back to home',
  },
  faqPage: {
    title: 'Frequently Asked Questions',
    subtitle: 'Quick answers to the most common questions about CiszuBot.',
    back: 'Back to home',
    items: [
      { q: 'How do I invite CiszuBot to my server?', a: 'Use the «Invite» button on the home page and choose the server. You need «Manage server» permissions in Discord.' },
      { q: "What is the bot's prefix?", a: 'The prefix is cz!. You can also use slash commands by typing / in Discord.' },
      { q: 'Is CiszuBot free?', a: 'Yes, the bot is completely free. Optional donations may come in the future to support development.' },
      { q: 'What data does the bot store?', a: 'It only logs a counter of executed commands and connection status. No messages or personal data are stored. See the privacy policy.' },
      { q: 'Can I report a bug or request a command?', a: 'Yes. Join the Discord server and use the support channel with a description of the issue or your idea.' },
      { q: 'How do I change the bot language?', a: 'CiszuBot auto-detects the server language. It currently supports Latin American Spanish, Spain Spanish, US English and UK English.' },
      { q: 'Do commands work in direct messages?', a: 'Some utility commands do, but most require a server with the appropriate permissions.' },
      { q: 'How do I request official support?', a: 'Email us at ciszunetwork@gmail.com or join the Ciszu Network Discord server.' },
    ],
  },
  dashboardPage: {
    title: 'Dashboard',
    subtitle:
      'Manage CiszuBot in your servers and check the status of your Discord account.',
    kicker: 'CiszuBot · Discord session',
    sessionActive: 'Session active',
    dualDiscordOnly: 'Discord only',
    dualLinked: 'CISZU ID linked',
    dualControl: 'Full control',
    dualConnect: 'Sign in with CISZU ID for full control',
    ciszuConnected: 'CISZU ID already connected',
    ciszuConnectedDesc: 'Your CISZU ID account is active',
    discordConnected: 'Discord connected',
    discordNotConnected: 'Discord not connected',
    connectDiscord: 'Connect Discord',
    openDashboard: 'Go to dashboard',
    openSettings: 'Open settings',
    signOutCiszu: 'Sign out of CISZU ID',
    accountId: 'Discord ID',
    providerLabel: 'Provider',
    providerDiscord: 'Discord',
    serversTitle: 'Your servers',
    serversSubtitle: 'Pick a server you manage to configure CiszuBot.',
    noServers: 'You have no manageable servers.',
    noServersHint:
      'You need the “Manage Server” permission on Discord and to be signed in to configure the bot.',
    botActive: 'Bot active',
    botMissing: 'Bot not present',
    inviteCta: 'Invite CiszuBot',
    supportCta: 'Support server',
    logout: 'Sign out',
    linksTitle: 'Useful links',
    links: {
      commands: 'Commands',
      stats: 'Status',
      support: 'Support',
      documentation: 'Documentation',
      invite: 'Invite page',
      explore: 'Explore platforms',
      download: 'Downloads',
    },
    betaBadge: 'BETA TRIAL FREE',
    betaNote:
      'CiszuBot is in beta: every PREMIUM feature is free during the trial. Tell us how it goes in the support server.',
    helpTitle: 'Help & support',
    helpDesc: 'Questions or issues? Visit the support server or read the step-by-step documentation.',
    helpCta: 'Go to support',
    docsCta: 'View documentation',
    howToTitle: 'How to use CiszuBot',
    howToDesc:
      'Invite it, pick a server you manage and configure each module from its panel. The floating panel saves your changes.',
    howToCta: 'View commands',
    sponsorTitle: 'Self-sponsorship',
    sponsorDesc:
      'Add CiszuBot to your Discord profile so anyone can install it from you, and show up in bot directories.',
    sponsorProfile: 'Add to my profile',
    sponsorDirs: 'Bot directories',
    comingSoon: 'Coming soon',
    inviteBot: 'Invite to my server',
  },
  guildPage: {
    back: 'Back',
    subtitle: 'CiszuBot configuration',
    betaBadge: 'BETA TRIAL FREE',
    betaNote:
      'Beta features: during the trial everything is free and may change. Save a JSON backup before big changes.',
    summaryTitle: 'Server summary',
    summaryDesc: 'Live data read by CiszuBot.',
    membersLabel: 'Members',
    rolesLabel: 'Roles',
    channelsLabel: 'Channels',
    botLabel: 'Bot',
    botOnline: 'Connected',
    botOffline: 'Not connected',
    refreshData: 'Reload data',
    refreshing: 'Reloading…',
    refreshed: 'Data updated',
    refreshHint: 'Server data reloads by itself every minute.',
    save: 'Save changes',
    saving: 'Saving…',
    saved: 'Saved!',
    saveError: 'Could not save the configuration.',
    autoSaveLabel: 'Autosave',
    autoSaveHint: 'Saves alone, 2 s after each change.',
    undo: 'Undo',
    redo: 'Redo',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
    exportSection: 'Export this section',
    imported: 'Imported: review and save',
    importError: 'Invalid JSON for this configuration.',
    unsaved: 'Unsaved changes',
    allSaved: 'All saved',
    backupNote: 'Backup JSON files include scope, server, date and user in the name.',
    free: 'FREE',
    premium: 'PREMIUM',
    generalTitle: 'General',
    generalHint: 'Basic CiszuBot settings for this server.',
    prefixLabel: 'Bot prefix',
    prefixHint: 'Example: cz!',
    langLabel: 'Language',
    levelsTitle: 'Levels & XP',
    levelsToggle: 'Level system',
    levelsToggleHint: 'Members earn XP by chatting',
    xpRateLabel: 'XP multiplier',
    xpRateHint: '0.1 – 10 (default 1)',
    levelChannelLabel: 'Level-up announcement channel',
    levelChannelHint: 'Empty to announce in chat',
    welcomeTitle: 'Welcome & goodbye',
    welcomeChannelLabel: 'Welcome channel',
    goodbyeChannelLabel: 'Goodbye channel',
    emptyDisables: 'Empty to disable',
    welcomeMessageLabel: 'Welcome message',
    goodbyeMessageLabel: 'Goodbye message',
    varsHint: 'Variables: {user} {guild} {members}',
    autoroleLabel: 'Auto roles',
    autoroleHint: 'Assigned to new members',
    extrasTitle: 'Tickets & extras',
    ticketsToggle: 'Ticket system',
    ticketsToggleHint: 'Enable it with cz!setuptickets on Discord',
    privateToggle: 'Private channels',
    privateToggleHint: 'Members create their own channels with a button',
    automodToggle: 'Auto-moderation',
    automodToggleHint: 'Basic spam protection',
    ticketCategoryLabel: 'Ticket category',
    ticketRoleLabel: 'Ticket staff role',
    privateCategoryLabel: 'Private channels category',
    musicChannelLabel: 'Music channel',
    musicChannelHint: 'Voice or text channel for the player',
    muteRoleLabel: 'Mute role',
    logsChannelLabel: 'Logs channel',
    pickChannel: 'Pick a channel…',
    pickVoice: 'Pick a voice channel…',
    pickCategory: 'Pick a category…',
    pickRole: 'Pick a role…',
    noneSelected: 'None selected',
    manualIdHint: 'Type the ID manually (could not read the Discord list).',
    errorLoad: 'Could not load the configuration.',
    loading: 'Loading configuration…',
  },
  invitePage: {
    title: 'Invite',
    subtitle:
      'Add CiszuBot to your Discord server in under a minute: free, no sign-up and with every module ready.',
    kicker: 'Discord · Official authorization',
    cta: 'Invite CiszuBot',
    thanks: 'Thanks for inviting CiszuBot! Finish the authorization on Discord.',
    ctaNote: 'Discord opens in a new tab. Choose the server and accept the permissions.',
    permissionsTitle: 'Permissions requested',
    permissions: [
      {
        title: 'Manage Server',
        body: 'Read channels, roles and settings to apply the configuration you make from the dashboard.',
      },
      {
        title: 'Messages',
        body: 'Send and edit its own messages, and read history for commands and moderation.',
      },
      {
        title: 'Moderation',
        body: 'Delete messages and sanction users when your moderators run the commands.',
      },
      {
        title: 'Voice',
        body: 'Join voice channels to play music and announcements.',
      },
      {
        title: 'Users and roles',
        body: 'Look up users and manage roles for levels, economy and verifications.',
      },
      {
        title: 'Webhooks and invites',
        body: 'Create webhooks and read invites for logs, giveaways and welcomes.',
      },
    ],
    permissionsNote:
      'The link requests administrator permissions so every module works with no extra setup. You can revoke any permission from Discord.',
    stepsTitle: 'How to invite it in 3 steps',
    steps: [
      {
        title: 'Click “Invite CiszuBot”',
        body: 'Discord opens with the bot authorization screen.',
      },
      {
        title: 'Choose the server',
        body: 'You will only see servers where you have the “Manage Server” permission.',
      },
      {
        title: 'Accept the permissions',
        body: 'Review the list and click “Authorize”. CiszuBot is ready instantly.',
      },
    ],
    supportCta: 'Join the support server',
    exploreCta: 'See other platforms',
    flowTitle: 'Thanks for inviting CiszuBot!',
    flowBody:
      'Finish the authorization on Discord and, when you are done, confirm here: we will take you home.',
    flowDone: 'I already invited the bot',
    flowHome: 'Go home now',
    flowWait: 'Wait 10s more',
    flowCancel: 'Stay here',
    flowCountdown: 'Redirecting home in {n}s',
    flowAgain: 'Invite again',
    flowConfirmed: 'All set! Taking you home…',
  },
  explorePage: {
    title: 'Explore',
    subtitle:
      'CiszuBot and Ciszu Network on the main Discord directories: vote, leave a review or join the community.',
    kicker: 'Top.gg · Discord Bot List · Disboard',
    platformsTitle: 'Platforms',
    viewAll: 'View all platforms',
    botsTitle: 'CiszuBot on the lists',
    serversTitle: 'Ciszugamens on the lists',
    communityTitle: 'Community and support',
    visit: 'Visit',
    vote: 'Vote',
    join: 'Join',
    platforms: {
      topggBot: {
        name: 'Top.gg · CiszuBot',
        desc: 'Official bot page on Top.gg. Vote every 12 hours to help us climb the ranks.',
      },
      topggServer: {
        name: 'Top.gg · Ciszugamens',
        desc: 'Community server page on Top.gg. Vote to give it more visibility.',
      },
      dblBot: {
        name: 'Discord Bot List · Bot',
        desc: 'CiszuBot on Discord Bot List. Vote and leave your review so more people discover it.',
      },
      dblServer: {
        name: 'Discord Bot List · Server',
        desc: 'The Ciszugamens server on Discord Bot List, with its page and votes.',
      },
      disboard: {
        name: 'Disboard · Ciszugamens',
        desc: 'Our server listing on Disboard, the Discord server directory.',
      },
      ciszugamens: {
        name: 'Ciszu Gamens',
        desc: 'The community’s own server: support, bot announcements and events.',
      },
    },
    widgetsTitle: 'Top.gg widgets',
    widgetsDesc:
      'Embed CiszuBot’s live status on your site or use it as a signature. It updates automatically.',
    widgetBotAlt: 'CiszuBot widget on Top.gg',
    widgetServerAlt: 'Ciszugamens server widget on Top.gg',
    codeTitle: 'Embed code',
    codeDesc:
      'Copy the HTML and paste the widget on your site, forum or README. The status updates by itself.',
    copyWidgetBot: 'Copy bot widget code',
    copyWidgetServer: 'Copy server widget code',
    copied: 'Copied!',
    botIdLabel: 'Bot ID',
    botIdHint: 'Use it in listings, widgets and official authorizations.',
    ctaTitle: 'Don’t have the bot yet?',
    ctaDesc: 'Invite it to your server and start using its commands in seconds.',
    ctaButton: 'Invite CiszuBot',
  },
};

/**
 * Español (España): variante PROPIA, individual de Latam.
 *
 * Antes esto era una copia superficial de es-latam con los mismos textos, así
 * que elegir "Español España" no cambiaba nada visible. Aquí van las
 * diferencias de vocabulario reales del castellano de España.
 */
const esEs: typeof es = {
  ...es,
  nav: {
    ...es.nav,
    about: 'Sobre',
    reviews: 'Opiniones',
  },
  hero: {
    ...es.hero,
    ctaInvite: 'Añadir a Discord',
  },
  footer: {
    ...es.footer,
    madeBy: 'Hecho con cariño por',
  },
  cookiesBanner: {
    ...es.cookiesBanner,
    text: es.cookiesBanner.text.replace('Utilizamos', 'Usamos'),
    accept: 'DE ACUERDO',
  },
  statusSection: {
    ...es.statusSection,
    viewPage: 'Ver el estado detallado',
  },
  supportPage: {
    ...es.supportPage,
    contactDesc: 'Para asuntos legales, prensa o colaboraciones escríbenos a:',
    faq: es.supportPage.faq.map((f, i) =>
      i === 2
        ? {
            ...f,
            a: 'Sí, el bot es completamente gratuito. En el futuro puede haber donaciones opcionales para apoyar el desarrollo.',
          }
        : { ...f }
    ),
  },
  descargasPage: {
    ...es.descargasPage,
    subtitle: es.descargasPage.subtitle.replace(
      'la PDWA (App de Escritorio Progresiva)',
      'la PDWA (Aplicación de Escritorio Progresiva)'
    ),
  },
  feedbackPage: {
    ...es.feedbackPage,
    messagePlaceholder: 'Cuéntanos qué ha pasado o qué te gustaría que añadiésemos…',
  },
  faqPage: {
    ...es.faqPage,
    items: es.faqPage.items.map((f, i) =>
      i === 2
        ? {
            ...f,
            a: 'Sí, el bot es completamente gratuito. En el futuro puede haber donaciones opcionales para apoyar el desarrollo.',
          }
        : { ...f }
    ),
  },
};

/**
 * English (UK): variante PROPIA, individual de US.
 *
 * Se deriva de en-us con el dialecto británico compartido (ortografía -our/-re,
 * -ise y licence) más la terminología propia del Reino Unido.
 */
const enUkDialect = applyDialect(en, 'en-uk');

const enUk: typeof en = {
  ...enUkDialect,
  hero: {
    ...enUkDialect.hero,
    ctaInvite: 'Add to Discord',
  },
  supportPage: {
    ...enUkDialect.supportPage,
    contactDesc: 'For legal matters, press or collaborations, get in touch at:',
  },
  invitePage: {
    ...enUkDialect.invitePage,
    kicker: 'Discord · Official authorisation',
  },
  legalPage: {
    ...enUkDialect.legalPage,
    sections: enUkDialect.legalPage.sections.map((s) =>
      s.h === '3. Intellectual property'
        ? {
            ...s,
            p: 'CiszuBot, its logo, brand and code are owned by CiszukoAntony. No licence is granted except the right to invite the Bot to a server.',
          }
        : { ...s }
    ),
  },
  faqPage: {
    ...enUkDialect.faqPage,
    items: enUkDialect.faqPage.items.map((f) => ({ ...f })),
  },
};

export const dict = {
  'es-latam': es,
  'es-es': esEs,
  'en-us': en,
  'en-uk': enUk,
} as const;

type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };

export type Dict = DeepString<(typeof dict)['es-latam']>;

export function getDict(lang: Lang): Dict {
  return dict[lang];
}

/** Lee y normaliza el idioma desde la cookie (acepta códigos antiguos 'es'/'en'). */
export function parseLang(raw: string | undefined | null): Lang {
  if (raw === 'es-es' || raw === 'en-us' || raw === 'en-uk') return raw;
  if (raw === 'es' || raw === 'es-latam') return 'es-latam';
  if (raw === 'en') return 'en-us';
  return 'en-us';
}

/** true si el idioma es una variante de español (latam o españa). */
export const isEsLang = (lang: Lang): boolean => lang === 'es-latam' || lang === 'es-es';

/**
 * Idioma activo leído de la cookie en cliente. Los componentes que no reciben
 * `dict` por props (docks, FABs) lo usan tras montar; en SSR devuelve la base.
 */
export function readCookieLang(): Lang {
  if (typeof document === 'undefined') return 'es-latam';
  const match = document.cookie.match(/(?:^|;\s*)ciszubot_lang=([^;]+)/);
  return parseLang(match?.[1] ? decodeURIComponent(match[1]) : undefined);
}

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'es-latam', label: 'ES-LA', flag: 'es' },
  { code: 'es-es', label: 'ES-ES', flag: 'es' },
  { code: 'en-us', label: 'EN-US', flag: 'us' },
  { code: 'en-uk', label: 'EN-UK', flag: 'gb' },
];