import { applyDialect } from '@ciszunetwork/utils/i18n-audit';

export type Lang = 'es-latam' | 'es-es' | 'en-us' | 'en-uk';

export const CISZU_NETWORK = 'https://ciszunetwork.vercel.app';
export const CISZUKO_ANTONY = 'https://ciszukoantony.vercel.app';
export const MUZICMANIA = 'https://muzicmania.vercel.app';
export const CISZUBOT = 'https://ciszubot.vercel.app';
export const GITHUB_REPO = 'https://github.com/Ciszu-Network/CiszuNetwork';

const es = {
  nav: {
    home: 'Inicio',
    information: 'Información',
    about: 'Acerca de',
    team: 'Equipo',
    faq: 'FAQ',
    documentation: 'Documentación',
    help: 'Ayuda',
    contact: 'Contacto',
    support: 'Soporte',
    changelog: 'Cambios',
    reviews: 'Reseñas',
    stats: 'Estadísticas',
    forum: 'Foro',
    projects: 'Proyectos',
    ciszugamens: 'Ciszugamens',
    ciszubot: 'CiszuBot',
    muzicmania: 'MuzicMania',
    ciszuNetwork: 'Ciszu Network',
    ciszukoAntony: 'Ciszuko Antony',
    download: 'Descargas',
    donate: 'Donar',
    feedback: 'Feedback',
    search: 'Buscar página…',
    searchHint: 'Qué necesitas encontrar',
    searchPlaceholder: 'Busca páginas de Ciszu Network (ej: inicio, soporte, discord)...',
    searchNoResults: 'Sin resultados para "{q}"',
    searchReset: 'Reiniciar búsqueda',
  },
  footer: {
    brand: 'Ciszu Network',
    tagline: 'Innovación Digital',
    explore: 'Explorar',
    projects: 'Proyectos',
    legal: 'Legal',
    terms: 'Términos',
    privacy: 'Privacidad',
    support: 'Soporte',
    rights: 'Todos los derechos reservados.',
    madeBy: 'Hecho con amor por',
    githubRepo: 'Repositorio en GitHub',
    openSource: 'Open Source',
    whatsappDirect: 'WhatsApp Directo',
    discordServer: 'Discord Server',
  },
  auth: {
    login: 'Iniciar sesión',
    register: 'Crear cuenta',
    email: 'Email',
    password: 'Contraseña',
    username: 'Nombre de usuario',
    displayName: 'Nombre a mostrar',
    confirmPassword: 'Confirmar contraseña',
    forgotPassword: 'Recuperar contraseña',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    createAccount: 'Crear cuenta',
    signIn: 'Entrar',
    logout: 'Cerrar sesión',
    loggingOut: 'Cerrando sesión…',
    orContinueWith: 'O continúa con',
    ciszuId: 'CISZU ID',
  },
  home: {
    heroTitle: 'Ciszu Network',
    heroTagline: 'Innovación Digital',
    heroDescription: 'Desarrollo web, infraestructura cloud y experiencias digitales de alto rendimiento.',
    ctaPrimary: 'Explorar proyectos',
    ctaSecondary: 'Contactar',
  },
  homePage: {
    heroDescription:
      'Innovación digital con propósito. Desarrollamos soluciones de alto rendimiento que combinan tecnología de punta con una estética inconfundible.',
    ctaContact: 'Contáctanos',
    ctaAbout: 'Conócenos',
    statProjects: 'Proyectos del Ecosistema',
    statCommitment: 'Compromiso',
    statSupport: 'Soporte Técnico',
    servicesTitle: 'Servicios',
    servicesSubtitle: 'Tecnología de punta para proyectos ambiciosos',
    serviceWebTitle: 'Desarrollo Web',
    serviceWebDesc:
      'Aplicaciones web modernas con Next.js, React y TypeScript. Rendimiento, escalabilidad y diseño de alto nivel.',
    serviceInfraTitle: 'Infraestructura Digital',
    serviceInfraDesc:
      'Arquitectura cloud, despliegue continuo y seguridad enterprise. Vercel, AWS y herramientas modernas.',
    serviceUxTitle: 'Experiencia de Usuario',
    serviceUxDesc:
      'Interfaces intuitivas con estética cuidada. Animaciones fluidas y diseño responsivo.',
    projectsTitle: 'Proyectos',
    projectsSubtitle: 'Soluciones digitales creadas por {site}',
    projectVisit: 'Visitar',
    projectExplore: 'Explorar',
    tagCiszugamens: 'Servidor de la Comunidad',
    descCiszugamens:
      'La comunidad gamer y digital de Ciszu Network en Discord, WhatsApp y Telegram. Eventos, partidas, soporte y más. Únete desde la plataforma que prefieras.',
    tagCiszubot: 'Bot Inteligente de Discord',
    descCiszubot:
      'El bot oficial del ecosistema: moderación, música, juegos, economía y automatización. Web con estado en vivo, comandos y soporte.',
    tagMuzicmania: 'Juego de Ritmo Definitivo',
    descMuzicmania:
      'Plataforma de juego rítmico en la web con estética futurista. Desarrollada por Ciszu Network con Next.js y tecnologías modernas.',
    tagCiszunetwork: 'Compañía de Innovación Digital',
    descCiszunetwork:
      'Núcleo de todos los proyectos. Desarrollo web, infraestructura cloud, UI/UX, bots y soluciones digitales de alto rendimiento.',
    tagAntony: 'Youtuber & Streamer',
    descAntony:
      'Proyecto artístico y de entretenimiento. Contenido gaming, música, tecnología y desarrollo. Streams, videos y una comunidad en crecimiento.',
    ceoBio:
      'Visionario digital y desarrollador full-stack. Fundador de {site} y creador de MuzicMania. Lidera con una visión centrada en la innovación, la calidad técnica y la experiencia de usuario. También youtuber y streamer en crecimiento.',
    ceoContact: 'Contactar',
    ceoPortfolio: 'Portafolio',
    skillCloud: 'Arquitectura Cloud',
    skillLeadership: 'Liderazgo',
    socialTitle: 'Síguenos',
    socialSubtitle: 'Conéctate con {site} en todas nuestras plataformas',
    supportTitle: 'Apoya el proyecto',
    supportSubtitle:
      'Mantén vivo el ecosistema Ciszu: vota por CiszuBot, bumpea el servidor o haz una donación.',
    supportBotDesc: 'Web oficial del bot: estado en vivo, comandos y soporte.',
    supportVisitCta: 'Visitar',
    supportVoteTitle: 'Vota en Top.gg',
    supportVoteDesc: 'Cada voto ayuda a que CiszuBot llegue a más servidores.',
    supportVoteCta: 'Votar',
    supportServerTitle: 'Nuestro servidor',
    supportServerDesc: 'Encuentra el servidor en Top.gg y bumpea para darle visibilidad.',
    supportServerCta: 'Bumpear',
    ctaTitle: 'Construyamos el Futuro',
    ctaSubtitle: '¿Tienes un proyecto en mente? Hablemos.',
    ctaButton: 'Iniciar Proyecto',
  },
  common: {
    back: 'Volver',
    backToHome: 'Volver al inicio',
    loading: 'Cargando…',
    error: 'Error',
    success: 'Éxito',
    required: 'Este campo es obligatorio',
    optional: 'Opcional',
    learnMore: 'Saber más',
    viewAll: 'Ver todos',
    comingSoon: 'Próximamente',
    readMore: 'Leer más',
    showMore: 'Mostrar más',
    showLess: 'Mostrar menos',
    lightMode: 'Modo Claro',
    darkMode: 'Modo Oscuro',
    changeLanguage: 'Cambiar idioma',
    toggleTheme: 'Cambiar tema',
    unavailable: 'No disponible',
  },
  legal: {
    termsOfService: 'Términos de Servicio',
    privacyPolicy: 'Política de Privacidad',
    lastUpdated: 'Última actualización',
    back: 'Volver',
  },
  cookies: {
    title: 'Uso de Cookies y Privacidad',
    text: 'Utilizamos cookies propias y de terceros (incluyendo servicios de Google y Cloudflare) para mantener tu sesión activa, proteger la web de bots y mejorar tu experiencia. Al continuar navegando, aceptas nuestra ',
    privacyLink: 'Política de Privacidad y Términos de Servicio',
    accept: 'ENTENDIDO',
    reject: 'RECHAZAR',
  },
  cookiesEn: {
    title: 'Cookie Usage and Privacy',
    text: 'We use our own and third-party cookies (including Google and Cloudflare services) to keep your session active, protect the site from bots and improve your experience. By continuing to browse, you accept our ',
    privacyLink: 'Privacy Policy and Terms of Service',
    accept: 'GOT IT',
    reject: 'REJECT',
  },
  docks: {
    title: 'Quick Docks',
    subtitle: 'Acceso rápido a todas las secciones',
    policies: 'Políticas',
  },
  zoomWarning: {
    title: 'Zoom alto detectado',
    desc: 'Reduce el zoom del navegador para una mejor experiencia (100-120%).',
  },
  feedbackFab: {
    report: 'Reportar un problema',
    hide: 'No volver a mostrar',
    hiddenTitle: 'Feedback ocultado',
    hiddenMsg: 'Has ocultado el botón de reporte. Puedes reactivarlo desde la página de Feedback.',
    reactivate: 'Reactivar en Feedback',
  },
  feedbackForm: {
    name: 'Nombre',
    email: 'Email',
    anonymous: 'Anónimo',
    optional: 'Opcional',
    optionalEmail: 'Opcional — para responderte',
    message: 'Mensaje',
    placeholder: 'Cuéntanos qué opinas, qué falla o qué te gustaría ver…',
    emptyError: 'El mensaje no puede estar vacío.',
    emailError: 'Introduce un email válido o deja el campo vacío.',
    sentPrefix: 'Se abrió tu cliente de correo. Si no se abrió, envíanos un mensaje directo a',
    send: 'Enviar Feedback',
    report: 'Reportar un problema',
    footnote:
      'El formulario abre tu cliente de correo con el mensaje listo hacia {email}. El botón «Reportar un problema» abre el widget seguro de {site} (Sentry) para errores técnicos.',
  },
  authWarning: {
    guest: 'Invitado',
    message: 'Necesitas una cuenta para interactuar en esta sección.',
    continueGuest: 'Continuar como invitado',
    login: 'Iniciar sesión',
    register: 'Registrarse',
  },
  prefs: {
    title: 'Preferencias locales',
    savedAsGuest: 'Se guardan en este dispositivo como invitado.',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',
    zoom: 'Zoom',
    muteTab: 'Silenciar pestaña',
    cookies: 'Cookies',
    accepted: 'Aceptadas',
    rejected: 'Rechazadas',
    undecided: 'Sin decidir',
    rejectCookies: 'Rechazar cookies',
    acceptCookies: 'Aceptar cookies',
    reappearCookies: 'Reaparecer aviso de cookies',
    navigation: 'Navegación',
    redirectGuard: 'Aviso de redirección',
    activityGuard: 'Proteger acciones',
    help: 'Ayuda',
    supportCenter: 'Centro de Soporte',
    faq: 'Preguntas Frecuentes',
    contact: 'Contacto',
    synced: 'Preferencias sincronizadas con tu cuenta',
    langChanged: 'Idioma cambiado a {lang}',
    themeDark: 'Modo oscuro activado',
    themeLight: 'Modo claro activado',
    tabMuted: 'Pestaña silenciada',
    tabRestored: 'Pestaña restaurada',
    redirectOn: 'Aviso de redirección activado',
    redirectOff: 'Aviso de redirección desactivado',
    activityOn: 'Protección de acciones activada',
    activityOff: 'Protección de acciones desactivada',
    cookiesRejectedToast: 'Cookies rechazadas: los servicios opcionales están desactivados.',
    cookiesAcceptedToast: 'Cookies aceptadas. Gracias por apoyar a Ciszu Network.',
    cookiesReappearToast: 'El aviso de cookies volverá a aparecer.',
  },
  installPdwa: {
    installed: 'PDWA instalada en este dispositivo',
    install: 'Instalar PDWA',
    thanks: '¡Gracias por instalar {site}! Gracias por apoyar Ciszu Network.',
    nativeTitle: 'Instalación nativa ({browser})',
    noNativeTitle: 'Tu navegador ({browser}) no ofrece instalación nativa',
    unknownBrowser: 'desconocido',
    stepConfirm: 'Pulsa de nuevo el botón y confirma el diálogo del navegador.',
    stepHome: 'La PDWA queda en Inicio / Escritorio con tu logo.',
    opera1: 'Menú Opera → "Guardar y compartir" → "Crear acceso directo".',
    opera2: 'En Propiedades añade al final:',
    opera3: 'Se abre como ventana de app independiente, igual que una PDWA.',
    safari1: 'Menú Archivo → "Añadir al Dock" (macOS).',
    safari2: 'O Compartir → "Añadir a pantalla de inicio" en iPhone/iPad.',
    fallbackLead: 'La vía más fiable: abre {site} en',
    edgeChrome: 'Microsoft Edge o Chrome',
    fallbackTail: 'e instálala desde el icono de la barra de direcciones.',
    desktopApp: 'Se crea una app de escritorio con la misma experiencia que la PDWA.',
    seeSteps: 'Ver pasos detallados arriba',
  },
  aboutPage: {
    heroTitle: 'Sobre Nosotros',
    heroSubtitle:
      'Misión, visión y compañía de {site}: tecnología de alto rendimiento con una estética inconfundible.',
    kicker: 'Compañía',
    intro1:
      'Somos una compañía de innovación digital fundada por {ceo}. Desarrollamos soluciones tecnológicas de alto rendimiento: desarrollo web con Next.js y React, infraestructura cloud, experiencias de usuario, bots, servidores de juego y más.',
    intro2:
      'Nuestra filosofía se centra en combinar tecnología de punta con una estética inconfundible. Cada proyecto refleja nuestro compromiso con la calidad, el rendimiento y la experiencia de usuario.',
    intro3:
      'Con sede en Coro, Falcón, Venezuela, operamos 24/7 para ofrecer soluciones globales con un toque latinoamericano.',
    missionTitle: 'Misión',
    mission:
      'Democratizar la tecnología de alto rendimiento, ofreciendo soluciones digitales accesibles, escalables y con diseño de primer nivel.',
    visionTitle: 'Visión',
    vision:
      'Ser referente en innovación digital desde Latinoamérica, creando un ecosistema de proyectos que inspiren y transformen.',
    more: '¿Quieres saber más?',
    contact: 'Contáctanos',
  },
  downloadsPage: {
    heroTitle: 'Descargas',
    heroSubtitle:
      'Instala {site} como App de Escritorio Progresiva (PDWA) en tu PC o móvil, sin pestañas ni barra de dirección.',
    kicker: 'PDWA',
    step1Title: 'Abrir en un navegador compatible',
    step1Content:
      'Microsoft Edge y Chrome instalan la PDWA de forma nativa desde el icono de la barra de direcciones o desde el botón "Instalar PDWA" que encontrarás aquí abajo. Opera usa un método alternativo (acceso directo con --app=URL), explicado en el propio botón.',
    step2Title: 'En móvil (iOS / Android)',
    step2Content:
      'Abre la web en Safari o Chrome: menú Compartir → "Añadir a pantalla de inicio". Se crea un acceso directo tipo app con tu logo.',
    step3Title: 'Segura y sin cuentas',
    step3Content:
      '{site} funciona 100% en tu navegador. La PDWA no requiere registro ni instala archivos en el sistema: solo crea una ventana de app.',
    installTitle: 'Instalar {site} como PDWA',
    installDesc:
      'Tu web favorita sin pestañas, con tu logo y acceso directo desde el escritorio o el menú de inicio.',
    fabQuestion: '¿Cerraste el botón flotante?',
    fabHint: 'El botón "Instalar PDWA" de abajo a la izquierda se puede volver a mostrar cuando quieras.',
  },
  feedbackPage: {
    heroTitle: 'Feedback',
    heroSubtitle: 'Tu opinión construye {site}',
    kicker: 'Sugerencias',
    fabQuestion: '¿Cerraste el botón flotante?',
    fabHint:
      'El botón de reporte rápido de abajo a la izquierda se puede volver a mostrar cuando quieras.',
  },
  donatePage: {
    heroTitle: 'Donar',
    heroSubtitle:
      'Apoya el ecosistema de {site}: tus donaciones mantienen las webs, el bot de Discord, MuzicMania y la comunidad CiszuGamens funcionando.',
    kicker: 'Apoyo',
    kofiTitle: 'Apoya en Ko-fi',
    kofiEmbedTitle: 'Apoya a Ciszu Network en Ko-fi',
    cryptoTitle: 'Cripto (NOWPayments)',
    cryptoEmbedTitle: 'Donaciones en cripto (NOWPayments)',
    otherQuestion: '¿Prefieres apoyar de otra forma? Escríbenos a',
    otherMethods: 'Otros métodos',
    noteKoFi: 'Café directo · sin comisiones',
    noteBmc: 'Apoyo directo al creador',
    notePatreon: 'Suscripción mensual con recompensas',
    notePaypal: 'Donación directa (próximamente)',
    noteCrypto: 'Bitcoin, USDT, ETH y más · sin KYC',
    open: 'Abrir',
    methodNotConfigured: 'Este método aún no está configurado',
    methodUnavailable: 'Método no disponible todavía',
  },
  projectsPage: {
    heroTitle: 'Proyectos',
    heroSubtitle:
      'Cada proyecto de {site}: comunidad, bots, juegos, desarrollo y contenido. Un ecosistema, una sola identidad.',
    kicker: 'Ecosistema',
    builtTitle: 'Construido en abierto',
    builtDesc:
      'Todo el ecosistema vive en un monorepo pnpm: 4 webs Next.js, el bot de Discord, el juego y los paquetes compartidos. Explora el código o escríbenos para colaborar.',
    githubRepo: 'Repositorio GitHub',
    workWithUs: 'Trabaja con nosotros',
  },
  projectPages: {
    stack: 'Stack tecnológico',
    viewAll: 'Ver todos los proyectos',
    ciszubot: {
      directories: 'CiszuBot en directorios',
      addTitle: 'Añade CiszuBot a tu servidor',
      addDesc: 'Web oficial con estado en vivo, comandos y soporte.',
      invite: 'Invitar el bot',
      officialWeb: 'Web oficial de CiszuBot',
    },
    muzicmania: {
      playNow: 'Jugar Ahora',
      devTitle: '¿Eres desarrollador o músico?',
      devDesc: 'Colabora con MuzicMania aportando canciones, ideas o código.',
    },
    ciszugamens: {
      join: 'Únete a la comunidad',
      where: 'Dónde encontrarnos',
      communityStack: 'Stack de la comunidad',
    },
    ciszunetwork: {
      workWithUs: 'Trabaja con Nosotros',
      ecosystemProjects: 'Proyectos del ecosistema',
    },
  },
  coursesPage: {
    searchPlaceholder: 'Buscar curso…',
    noResults: 'Ningún curso coincide con los filtros.',
    countOne: '{n} curso',
    countMany: '{n} cursos',
  },
};

const en = {
  nav: {
    home: 'Home',
    information: 'Information',
    about: 'About',
    team: 'Team',
    faq: 'FAQ',
    documentation: 'Documentation',
    help: 'Help',
    contact: 'Contact',
    support: 'Support',
    changelog: 'Changelog',
    reviews: 'Reviews',
    stats: 'Stats',
    forum: 'Forum',
    projects: 'Projects',
    ciszugamens: 'Ciszugamens',
    ciszubot: 'CiszuBot',
    muzicmania: 'MuzicMania',
    ciszuNetwork: 'Ciszu Network',
    ciszukoAntony: 'Ciszuko Antony',
    download: 'Download',
    donate: 'Donate',
    feedback: 'Feedback',
    search: 'Search page…',
    searchHint: 'What are you looking for',
    searchPlaceholder: 'Search Ciszu Network pages (example: home, support, discord)...',
    searchNoResults: 'No results for "{q}"',
    searchReset: 'Reset search',
  },
  footer: {
    brand: 'Ciszu Network',
    tagline: 'Digital Innovation',
    explore: 'Explore',
    projects: 'Projects',
    legal: 'Legal',
    terms: 'Terms',
    privacy: 'Privacy',
    support: 'Support',
    rights: 'All rights reserved.',
    madeBy: 'Made with love by',
    githubRepo: 'GitHub Repository',
    openSource: 'Open Source',
    whatsappDirect: 'Direct WhatsApp',
    discordServer: 'Discord Server',
  },
  auth: {
    login: 'Log in',
    register: 'Create account',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    displayName: 'Display name',
    confirmPassword: 'Confirm password',
    forgotPassword: 'Forgot password',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    createAccount: 'Create account',
    signIn: 'Sign in',
    logout: 'Log out',
    loggingOut: 'Logging out…',
    orContinueWith: 'Or continue with',
    ciszuId: 'CISZU ID',
  },
  home: {
    heroTitle: 'Ciszu Network',
    heroTagline: 'Digital Innovation',
    heroDescription: 'Web development, cloud infrastructure and high-performance digital experiences.',
    ctaPrimary: 'Explore projects',
    ctaSecondary: 'Contact us',
  },
  homePage: {
    heroDescription:
      'Digital innovation with purpose. We build high-performance solutions that combine cutting-edge technology with an unmistakable aesthetic.',
    ctaContact: 'Contact us',
    ctaAbout: 'About us',
    statProjects: 'Ecosystem Projects',
    statCommitment: 'Commitment',
    statSupport: 'Technical Support',
    servicesTitle: 'Services',
    servicesSubtitle: 'Cutting-edge technology for ambitious projects',
    serviceWebTitle: 'Web Development',
    serviceWebDesc:
      'Modern web applications with Next.js, React and TypeScript. Performance, scalability and top-tier design.',
    serviceInfraTitle: 'Digital Infrastructure',
    serviceInfraDesc:
      'Cloud architecture, continuous deployment and enterprise security. Vercel, AWS and modern tooling.',
    serviceUxTitle: 'User Experience',
    serviceUxDesc:
      'Intuitive interfaces with careful aesthetics. Fluid animations and responsive design.',
    projectsTitle: 'Projects',
    projectsSubtitle: 'Digital solutions built by {site}',
    projectVisit: 'Visit',
    projectExplore: 'Explore',
    tagCiszugamens: 'Community Server',
    descCiszugamens:
      'The gamer and digital community of Ciszu Network on Discord, WhatsApp and Telegram. Events, matches, support and more. Join from the platform you prefer.',
    tagCiszubot: 'Smart Discord Bot',
    descCiszubot:
      'The official bot of the ecosystem: moderation, music, games, economy and automation. Website with live status, commands and support.',
    tagMuzicmania: 'The Ultimate Rhythm Game',
    descMuzicmania:
      'A rhythm game platform on the web with a futuristic aesthetic. Built by Ciszu Network with Next.js and modern technologies.',
    tagCiszunetwork: 'Digital Innovation Company',
    descCiszunetwork:
      'The core of every project. Web development, cloud infrastructure, UI/UX, bots and high-performance digital solutions.',
    tagAntony: 'YouTuber & Streamer',
    descAntony:
      'An artistic and entertainment project. Gaming, music, tech and development content. Streams, videos and a growing community.',
    ceoBio:
      'Digital visionary and full-stack developer. Founder of {site} and creator of MuzicMania. He leads with a vision centred on innovation, technical quality and user experience. Also a YouTuber and streamer on the rise.',
    ceoContact: 'Get in touch',
    ceoPortfolio: 'Portfolio',
    skillCloud: 'Cloud Architecture',
    skillLeadership: 'Leadership',
    socialTitle: 'Follow us',
    socialSubtitle: 'Connect with {site} on all our platforms',
    supportTitle: 'Support the project',
    supportSubtitle:
      'Keep the Ciszu ecosystem alive: vote for CiszuBot, bump the server or make a donation.',
    supportBotDesc: 'Official bot website: live status, commands and support.',
    supportVisitCta: 'Visit',
    supportVoteTitle: 'Vote on Top.gg',
    supportVoteDesc: 'Every vote helps CiszuBot reach more servers.',
    supportVoteCta: 'Vote',
    supportServerTitle: 'Our server',
    supportServerDesc: 'Find the server on Top.gg and bump it to give it visibility.',
    supportServerCta: 'Bump',
    ctaTitle: "Let's Build the Future",
    ctaSubtitle: "Got a project in mind? Let's talk.",
    ctaButton: 'Start a Project',
  },
  common: {
    back: 'Back',
    backToHome: 'Back to home',
    loading: 'Loading…',
    error: 'Error',
    success: 'Success',
    required: 'This field is required',
    optional: 'Optional',
    learnMore: 'Learn more',
    viewAll: 'View all',
    comingSoon: 'Coming soon',
    readMore: 'Read more',
    showMore: 'Show more',
    showLess: 'Show less',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    changeLanguage: 'Change language',
    toggleTheme: 'Toggle theme',
    unavailable: 'Unavailable',
  },
  legal: {
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    lastUpdated: 'Last updated',
    back: 'Back',
  },
  cookies: {
    title: 'Cookie Usage and Privacy',
    text: 'We use our own and third-party cookies (including Google and Cloudflare services) to keep your session active, protect the site from bots and improve your experience. By continuing to browse, you accept our ',
    privacyLink: 'Privacy Policy and Terms of Service',
    accept: 'GOT IT',
    reject: 'REJECT',
  },
  cookiesEn: {
    title: 'Cookie Usage and Privacy',
    text: 'We use our own and third-party cookies (including Google and Cloudflare services) to keep your session active, protect the site from bots and improve your experience. By continuing to browse, you accept our ',
    privacyLink: 'Privacy Policy and Terms of Service',
    accept: 'GOT IT',
    reject: 'REJECT',
  },
  docks: {
    title: 'Quick Docks',
    subtitle: 'Quick access to every section',
    policies: 'Policies',
  },
  zoomWarning: {
    title: 'High zoom detected',
    desc: 'Reduce your browser zoom for a better experience (100-120%).',
  },
  feedbackFab: {
    report: 'Report a problem',
    hide: 'Do not show again',
    hiddenTitle: 'Feedback hidden',
    hiddenMsg: 'You have hidden the report button. You can bring it back from the Feedback page.',
    reactivate: 'Reactivate in Feedback',
  },
  feedbackForm: {
    name: 'Name',
    email: 'Email',
    anonymous: 'Anonymous',
    optional: 'Optional',
    optionalEmail: 'Optional — so we can reply',
    message: 'Message',
    placeholder: 'Tell us what you think, what fails or what you would like to see…',
    emptyError: 'The message cannot be empty.',
    emailError: 'Enter a valid email or leave the field empty.',
    sentPrefix: 'Your mail client opened. If it did not, send us a message directly to',
    send: 'Send Feedback',
    report: 'Report a problem',
    footnote:
      'The form opens your mail client with the message ready to {email}. The "Report a problem" button opens the secure {site} widget (Sentry) for technical errors.',
  },
  authWarning: {
    guest: 'Guest',
    message: 'You need an account to interact in this section.',
    continueGuest: 'Continue as guest',
    login: 'Log in',
    register: 'Sign up',
  },
  prefs: {
    title: 'Local preferences',
    savedAsGuest: 'Stored on this device as a guest.',
    language: 'Language',
    selectLanguage: 'Select language',
    zoom: 'Zoom',
    muteTab: 'Mute tab',
    cookies: 'Cookies',
    accepted: 'Accepted',
    rejected: 'Rejected',
    undecided: 'Undecided',
    rejectCookies: 'Reject cookies',
    acceptCookies: 'Accept cookies',
    reappearCookies: 'Show cookie notice again',
    navigation: 'Navigation',
    redirectGuard: 'Redirect warning',
    activityGuard: 'Protect actions',
    help: 'Help',
    supportCenter: 'Support Center',
    faq: 'Frequently Asked Questions',
    contact: 'Contact',
    synced: 'Preferences synced with your account',
    langChanged: 'Language changed to {lang}',
    themeDark: 'Dark mode on',
    themeLight: 'Light mode on',
    tabMuted: 'Tab muted',
    tabRestored: 'Tab restored',
    redirectOn: 'Redirect warning enabled',
    redirectOff: 'Redirect warning disabled',
    activityOn: 'Action protection enabled',
    activityOff: 'Action protection disabled',
    cookiesRejectedToast: 'Cookies rejected: optional services are off.',
    cookiesAcceptedToast: 'Cookies accepted. Thanks for supporting Ciszu Network.',
    cookiesReappearToast: 'The cookie notice will appear again.',
  },
  installPdwa: {
    installed: 'PDWA installed on this device',
    install: 'Install PDWA',
    thanks: 'Thanks for installing {site}! Thanks for supporting Ciszu Network.',
    nativeTitle: 'Native install ({browser})',
    noNativeTitle: 'Your browser ({browser}) does not offer native install',
    unknownBrowser: 'unknown',
    stepConfirm: 'Press the button again and confirm the browser dialog.',
    stepHome: 'The PDWA stays on your Home screen / Desktop with your logo.',
    opera1: 'Opera menu → "Save and share" → "Create shortcut".',
    opera2: 'In Properties, append at the end:',
    opera3: 'It opens as a standalone app window, just like a PDWA.',
    safari1: 'File menu → "Add to Dock" (macOS).',
    safari2: 'Or Share → "Add to Home Screen" on iPhone/iPad.',
    fallbackLead: 'The most reliable way: open {site} in',
    edgeChrome: 'Microsoft Edge or Chrome',
    fallbackTail: 'and install it from the icon in the address bar.',
    desktopApp: 'A desktop app is created with the same experience as the PDWA.',
    seeSteps: 'See detailed steps above',
  },
  aboutPage: {
    heroTitle: 'About Us',
    heroSubtitle:
      'Mission, vision and company of {site}: high-performance technology with an unmistakable aesthetic.',
    kicker: 'Company',
    intro1:
      'We are a digital innovation company founded by {ceo}. We build high-performance technology solutions: web development with Next.js and React, cloud infrastructure, user experiences, bots, game servers and more.',
    intro2:
      'Our philosophy is about combining cutting-edge technology with an unmistakable aesthetic. Every project reflects our commitment to quality, performance and user experience.',
    intro3:
      'Based in Coro, Falcón, Venezuela, we operate 24/7 to deliver global solutions with a Latin American touch.',
    missionTitle: 'Mission',
    mission:
      'To democratise high-performance technology by offering digital solutions that are accessible, scalable and top-tier in design.',
    visionTitle: 'Vision',
    vision:
      'To be a benchmark for digital innovation from Latin America, creating an ecosystem of projects that inspire and transform.',
    more: 'Want to know more?',
    contact: 'Contact us',
  },
  downloadsPage: {
    heroTitle: 'Downloads',
    heroSubtitle:
      'Install {site} as a Progressive Desktop Web App (PDWA) on your PC or phone, with no tabs or address bar.',
    kicker: 'PDWA',
    step1Title: 'Open in a compatible browser',
    step1Content:
      'Microsoft Edge and Chrome install the PDWA natively from the address bar icon or from the "Install PDWA" button below. Opera uses an alternative method (shortcut with --app=URL), explained in the button itself.',
    step2Title: 'On mobile (iOS / Android)',
    step2Content:
      'Open the site in Safari or Chrome: Share menu → "Add to Home Screen". An app-like shortcut with your logo is created.',
    step3Title: 'Safe and account-free',
    step3Content:
      '{site} runs 100% in your browser. The PDWA needs no sign-up and installs no files on your system: it only creates an app window.',
    installTitle: 'Install {site} as a PDWA',
    installDesc:
      'Your favourite site with no tabs, your logo and a direct shortcut from the desktop or start menu.',
    fabQuestion: 'Closed the floating button?',
    fabHint: 'The "Install PDWA" button at the bottom left can be shown again whenever you want.',
  },
  feedbackPage: {
    heroTitle: 'Feedback',
    heroSubtitle: 'Your feedback builds {site}',
    kicker: 'Suggestions',
    fabQuestion: 'Closed the floating button?',
    fabHint: 'The quick report button at the bottom left can be shown again whenever you want.',
  },
  donatePage: {
    heroTitle: 'Donate',
    heroSubtitle:
      'Support the {site} ecosystem: your donations keep the sites, the Discord bot, MuzicMania and the CiszuGamens community running.',
    kicker: 'Support',
    kofiTitle: 'Support on Ko-fi',
    kofiEmbedTitle: 'Support Ciszu Network on Ko-fi',
    cryptoTitle: 'Crypto (NOWPayments)',
    cryptoEmbedTitle: 'Crypto donations (NOWPayments)',
    otherQuestion: 'Prefer to support another way? Write to us at',
    otherMethods: 'Other methods',
    noteKoFi: 'Direct coffee · no fees',
    noteBmc: 'Direct support for the creator',
    notePatreon: 'Monthly subscription with rewards',
    notePaypal: 'Direct donation (coming soon)',
    noteCrypto: 'Bitcoin, USDT, ETH and more · no KYC',
    open: 'Open',
    methodNotConfigured: 'This method is not configured yet',
    methodUnavailable: 'Method not available yet',
  },
  projectsPage: {
    heroTitle: 'Projects',
    heroSubtitle:
      'Every {site} project: community, bots, games, development and content. One ecosystem, one identity.',
    kicker: 'Ecosystem',
    builtTitle: 'Built in the open',
    builtDesc:
      'The whole ecosystem lives in a pnpm monorepo: 4 Next.js sites, the Discord bot, the game and the shared packages. Browse the code or write to us to collaborate.',
    githubRepo: 'GitHub repository',
    workWithUs: 'Work with us',
  },
  projectPages: {
    stack: 'Tech stack',
    viewAll: 'View all projects',
    ciszubot: {
      directories: 'CiszuBot in directories',
      addTitle: 'Add CiszuBot to your server',
      addDesc: 'Official site with live status, commands and support.',
      invite: 'Invite the bot',
      officialWeb: 'CiszuBot official site',
    },
    muzicmania: {
      playNow: 'Play Now',
      devTitle: 'Are you a developer or musician?',
      devDesc: 'Collaborate with MuzicMania by contributing songs, ideas or code.',
    },
    ciszugamens: {
      join: 'Join the community',
      where: 'Where to find us',
      communityStack: 'Community stack',
    },
    ciszunetwork: {
      workWithUs: 'Work With Us',
      ecosystemProjects: 'Ecosystem projects',
    },
  },
  coursesPage: {
    searchPlaceholder: 'Search course…',
    noResults: 'No courses match the filters.',
    countOne: '{n} course',
    countMany: '{n} courses',
  },
};

/**
 * Español (España).
 *
 * NO es una copia de es-latam: hasta ahora `'es-es': es` apuntaba al MISMO
 * objeto, así que elegir "Español España" no cambiaba nada. Aquí van las
 * diferencias de vocabulario reales del castellano de España.
 */
const esEs: typeof es = {
  ...es,
  nav: {
    ...es.nav,
    about: 'Sobre',
    reviews: 'Opiniones',
    download: 'Descargas',
  },
  footer: {
    ...es.footer,
    madeBy: 'Hecho con cariño por',
  },
  auth: {
    ...es.auth,
    login: 'Acceder',
  },
  common: {
    ...es.common,
    learnMore: 'Más información',
    showMore: 'Ver más',
    showLess: 'Ver menos',
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro',
  },
  cookies: {
    ...es.cookies,
    text: es.cookies.text.replace('Utilizamos', 'Usamos'),
    accept: 'DE ACUERDO',
  },
  authWarning: {
    ...es.authWarning,
    continueGuest: 'Seguir como invitado',
  },
  downloadsPage: {
    ...es.downloadsPage,
    heroSubtitle:
      'Instala {site} como App de Escritorio Progresiva (PDWA) en tu ordenador o móvil, sin pestañas ni barra de dirección.',
  },
  homePage: {
    ...es.homePage,
    heroDescription:
      'Innovación digital con propósito. Desarrollamos soluciones de alto rendimiento que combinan tecnología puntera con una estética inconfundible.',
    ctaContact: 'Contacta',
    servicesSubtitle: 'Tecnología puntera para proyectos ambiciosos',
    statSupport: 'Soporte técnico',
    socialSubtitle: 'Conecta con {site} en todas nuestras plataformas',
  },
};

/**
 * English (UK).
 *
 * Se deriva de en-us con el dialecto británico compartido (ortografía -our/-re
 * y -ise), más el uso de minúscula en los nombres de ajuste, que en inglés
 * británico no van en mayúscula inicial.
 */
const enGb: typeof en = {
  ...applyDialect(en, 'en-uk'),
  common: {
    ...en.common,
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
  },
};

export const dict = {
  'es-latam': es,
  'es-es': esEs,
  'en-us': en,
  'en-uk': enGb,
} as const;

type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };

export type Dict = DeepString<(typeof dict)['es-latam']>;

export function getDict(lang: Lang): Dict {
  return dict[lang];
}

export function parseLang(raw: string | undefined | null): Lang {
  if (raw === 'es-es' || raw === 'en-us' || raw === 'en-uk') return raw;
  if (raw === 'es' || raw === 'es-latam') return 'es-latam';
  if (raw === 'en') return 'en-us';
  return 'es-latam';
}

/**
 * Rellena marcadores `{clave}` de una plantilla del diccionario.
 * Se usa para frases con datos dinámicos (sitio, email, navegador…) sin
 * concatenar fragmentos traducidos a mano.
 */
export function fillTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/** Cookie donde el servidor guarda el idioma elegido (la lee `i18n-server`). */
export const LANG_COOKIE = 'ciszu_lang';

export const LANGS = [
  { code: 'es-latam' as const, label: 'ES-LA', flag: 'es' },
  { code: 'es-es' as const, label: 'ES-ES', flag: 'es' },
  { code: 'en-us' as const, label: 'EN-US', flag: 'us' },
  { code: 'en-uk' as const, label: 'EN-UK', flag: 'gb' },
];
