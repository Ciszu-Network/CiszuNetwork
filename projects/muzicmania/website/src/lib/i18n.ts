import { applyDialect } from '@ciszunetwork/utils/i18n-audit';

export type Lang = 'es-latam' | 'es-es' | 'en-us' | 'en-uk';

export const MUZICMANIA = 'https://muzicmania.vercel.app';
export const CISZU_NETWORK = 'https://ciszunetwork.vercel.app';
export const GITHUB_REPO = 'https://github.com/Ciszu-Network/CiszuNetwork';

/**
 * Diccionario base (español Latinoamérica).
 *
 * Los 4 idiomas de producción son INDIVIDUALES entre sí: es-es y en-uk no son
 * copias, tienen vocabulario y ortografía propios de su región. Toda clave que
 * exista aquí debe existir en los 4 locales (lo verifica scripts/verify-i18n.ts).
 */
const es = {
  nav: {
    home: 'Inicio',
    play: 'Jugar',
    library: 'Librería',
    leaderboard: 'Rankings',
    stats: 'Estadísticas',
    forum: 'Foro',
    changelog: 'Novedades',
    reviews: 'Reseñas',
    download: 'Descargar',
    feedback: 'Comentarios',
    donate: 'Donar',
    information: 'Información',
    search: 'Buscar…',
  },
  footer: {
    brand: 'MuzicMania',
    rights: 'Todos los derechos reservados.',
    madeBy: 'Hecho con',
    githubRepo: 'Repositorio en GitHub',
    openSource: 'Open Source · Repositorio en GitHub',
    whatsapp: 'WhatsApp Directo',
    discordServer: 'Servidor de Discord',
    ecosystem: 'Ecosistema',
    courses: 'Cursos',
    lang: 'Idioma',
    navigation: 'Navegación',
    community: 'Comunidad y Ayuda',
    legal: 'Legal',
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
    close: 'Cerrar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    send: 'Enviar',
    retry: 'Reintentar',
    refresh: 'Actualizar',
    copy: 'Copiar',
    copied: 'Copiado',
    noResults: 'Sin resultados',
    guest: 'Invitado',
    all: 'Todos',
    none: 'Ninguno',
    color: 'Color',
    customize: 'Personalizar',
  },
  cookies: {
    title: 'Uso de Cookies y Privacidad',
    text: 'Utilizamos cookies propias y de terceros (incluyendo servicios de Google y Cloudflare) para mantener tu sesión activa, proteger la web de bots y mejorar tu experiencia. Al continuar navegando, aceptas nuestra ',
    privacyLink: 'Política de Privacidad y Términos de Servicio',
    accept: 'ENTENDIDO',
    reject: 'RECHAZAR',
  },
  menu: {
    mainMenu: 'Menú Principal',
    languages: 'Idiomas',
    navigation: 'Navegación',
    infoSupport: 'Info y Soporte',
    account: 'Cuenta',
    signIn: 'Ingresar',
    signUp: 'Registro',
    myProfile: 'Mi Perfil',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    localPreferences: 'Preferencias locales',
    selectLanguage: 'Seleccionar idioma',
    beta: 'Beta',
    closeSession: 'Cerrar sesión',
  },
  search: {
    placeholder: 'Buscar…',
    noResults: 'No se encontraron resultados para «{query}»',
    reset: 'Reiniciar búsqueda',
  },
  prefs: {
    title: 'Preferencias locales',
    theme: 'Tema',
    light: 'Claro',
    dark: 'Oscuro',
    language: 'Idioma',
    zoom: 'Zoom',
    zoomOut: 'Quitar zoom',
    zoomIn: 'Sumar zoom',
    muteTab: 'Silenciar pestaña',
    cookies: 'Cookies',
    cookieAccepted: 'Aceptadas',
    cookieRejected: 'Rechazadas',
    cookieUndecided: 'Sin decidir',
    rejectCookies: 'Rechazar cookies',
    acceptCookies: 'Aceptar cookies',
    reappearCookies: 'Reaparecer aviso de cookies',
    safeNavigation: 'Navegación',
    redirectNotice: 'Aviso de redirección',
    protectActions: 'Proteger acciones',
    help: 'Ayuda',
    helpCenter: 'Centro de Ayuda',
    faq: 'Preguntas Frecuentes',
    support: 'Soporte Técnico',
    gameRules: 'Normas del Juego',
    synced: 'Preferencias sincronizadas con tu cuenta',
    unavailable: 'El idioma {label} no está disponible aún.',
  },
  system: {
    darkOn: 'Modo oscuro activado.',
    lightOn: 'Modo claro activado.',
    langChanged: 'Idioma cambiado a {label}.',
    cookiesAccepted: 'Cookies aceptadas. Gracias por apoyar a MuzicMania.',
    cookiesRejected: 'Cookies rechazadas: los servicios opcionales están desactivados.',
    cookiesReappear: 'El aviso de cookies volverá a aparecer.',
    sessionClosed: 'Sesión cerrada correctamente.',
    redirectOn: 'Aviso de redirección activado',
    redirectOff: 'Aviso de redirección desactivado',
    protectionOn: 'Protección de acciones activada',
    protectionOff: 'Protección de acciones desactivada',
  },
  pages: {
    home: {
      title: 'MuzicMania — El Juego de Ritmo Definitivo en la Web',
      tagline: 'Música, neón y precisión competitiva. Domina el bit en la dimensión definitiva donde cada nota cuenta.',
      playGuest: 'Jugar como invitado',
      registerOrLogin: 'Registrarse o ingresar',
      download: 'Descargar MuzicMania',
    },
    download: {
      title: 'Centro de Descargas',
      subtitle: 'Instaladores nativos para Windows • Próximamente en más plataformas',
    },
    library: {
      title: 'Librería',
      subtitle: 'Explora el repertorio exclusivo de CiszukoAntony',
    },
    leaderboard: {
      title: 'Rankings',
      subtitle: 'La Élite de la Transmisión — Datos en Tiempo Real',
    },
    information: {
      title: 'Sobre MuzicMania',
      subtitle: 'Explorando el Núcleo de MuzicMania',
    },
    help: {
      title: 'Ayuda',
      subtitle: 'Optimización y Soporte Maestro',
    },
    faq: {
      title: 'FAQ',
      subtitle: 'Preguntas Frecuentes · Centro de Ayuda',
    },
    play: {
      title: 'MuzicMania 2.0',
      setupTitle: 'Configura tu Terminal',
      setupStep: 'Paso 1 de 1 - Preferencias Táctiles',
      paused: 'Pausa',
      pausedHint: 'Partida suspendida temporalmente',
    },
  },
};

const en = {
  nav: {
    home: 'Home',
    play: 'Play',
    library: 'Library',
    leaderboard: 'Leaderboard',
    stats: 'Stats',
    forum: 'Forum',
    changelog: 'Changelog',
    reviews: 'Reviews',
    download: 'Download',
    feedback: 'Feedback',
    donate: 'Donate',
    information: 'Information',
    search: 'Search…',
  },
  footer: {
    brand: 'MuzicMania',
    rights: 'All rights reserved.',
    madeBy: 'Made with',
    githubRepo: 'GitHub Repository',
    openSource: 'Open Source · GitHub Repository',
    whatsapp: 'WhatsApp Direct',
    discordServer: 'Discord Server',
    ecosystem: 'Ecosystem',
    courses: 'Courses',
    lang: 'Language',
    navigation: 'Navigation',
    community: 'Community & Help',
    legal: 'Legal',
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
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    send: 'Send',
    retry: 'Retry',
    refresh: 'Refresh',
    copy: 'Copy',
    copied: 'Copied',
    noResults: 'No results',
    guest: 'Guest',
    all: 'All',
    none: 'None',
    color: 'Color',
    customize: 'Customize',
  },
  cookies: {
    title: 'Cookie Usage and Privacy',
    text: 'We use our own and third-party cookies (including Google and Cloudflare services) to keep your session active, protect the site from bots and improve your experience. By continuing to browse, you accept our ',
    privacyLink: 'Privacy Policy and Terms of Service',
    accept: 'GOT IT',
    reject: 'REJECT',
  },
  menu: {
    mainMenu: 'Main Menu',
    languages: 'Languages',
    navigation: 'Navigation',
    infoSupport: 'Info & Support',
    account: 'Account',
    signIn: 'Login',
    signUp: 'Register',
    myProfile: 'My Profile',
    settings: 'Settings',
    logout: 'Log Out',
    localPreferences: 'Local Preferences',
    selectLanguage: 'Select language',
    beta: 'Beta',
    closeSession: 'Log out',
  },
  search: {
    placeholder: 'Search…',
    noResults: 'No results found for "{query}"',
    reset: 'Reset search',
  },
  prefs: {
    title: 'Local Preferences',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    zoom: 'Zoom',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    muteTab: 'Mute tab',
    cookies: 'Cookies',
    cookieAccepted: 'Accepted',
    cookieRejected: 'Rejected',
    cookieUndecided: 'Undecided',
    rejectCookies: 'Reject cookies',
    acceptCookies: 'Accept cookies',
    reappearCookies: 'Show cookie notice again',
    safeNavigation: 'Navigation',
    redirectNotice: 'Redirect notice',
    protectActions: 'Protect actions',
    help: 'Help',
    helpCenter: 'Help Center',
    faq: 'Frequently Asked Questions',
    support: 'Technical Support',
    gameRules: 'Game Rules',
    synced: 'Preferences synced with your account',
    unavailable: 'The language {label} is not available yet.',
  },
  system: {
    darkOn: 'Dark mode enabled.',
    lightOn: 'Light mode enabled.',
    langChanged: 'Language changed to {label}.',
    cookiesAccepted: 'Cookies accepted. Thanks for supporting MuzicMania.',
    cookiesRejected: 'Cookies rejected: optional services are disabled.',
    cookiesReappear: 'The cookie notice will appear again.',
    sessionClosed: 'Session closed successfully.',
    redirectOn: 'Redirect notice enabled',
    redirectOff: 'Redirect notice disabled',
    protectionOn: 'Action protection enabled',
    protectionOff: 'Action protection disabled',
  },
  pages: {
    home: {
      title: 'MuzicMania — The Ultimate Rhythm Game on the Web',
      tagline: 'Music, neon and competitive precision. Master the beat in the ultimate dimension where every note counts.',
      playGuest: 'Play as guest',
      registerOrLogin: 'Register or log in',
      download: 'Download MuzicMania',
    },
    download: {
      title: 'Download Center',
      subtitle: 'Native installers for Windows • More platforms coming soon',
    },
    library: {
      title: 'Library',
      subtitle: "Explore CiszukoAntony's exclusive catalog",
    },
    leaderboard: {
      title: 'Leaderboard',
      subtitle: 'The Streaming Elite — Real-Time Data',
    },
    information: {
      title: 'About MuzicMania',
      subtitle: 'Exploring the Core of MuzicMania',
    },
    help: {
      title: 'Help',
      subtitle: 'Optimization and Master Support',
    },
    faq: {
      title: 'FAQ',
      subtitle: 'Frequently Asked Questions · Help Center',
    },
    play: {
      title: 'MuzicMania 2.0',
      setupTitle: 'Set Up Your Terminal',
      setupStep: 'Step 1 of 1 - Touch Preferences',
      paused: 'Paused',
      pausedHint: 'Match temporarily suspended',
    },
  },
};

/**
 * Español (España).
 *
 * NO es una copia de es-latam: hasta hace poco `'es-es': es` apuntaba al MISMO
 * objeto, así que elegir "Español España" no cambiaba nada de nada. Aquí van
 * las diferencias de vocabulario y de registro reales del castellano de España
 * (biblioteca/fonoteca, ordenador, móvil, vídeo, "iniciar sesión"…).
 */
const esEs: typeof es = {
  ...es,
  nav: {
    ...es.nav,
    library: 'Biblioteca',
    download: 'Descarga',
    feedback: 'Comentarios',
  },
  footer: {
    ...es.footer,
    madeBy: 'Hecho con cariño por',
    whatsapp: 'WhatsApp directo',
    navigation: 'Navegación',
    community: 'Comunidad y ayuda',
  },
  common: {
    ...es.common,
    learnMore: 'Más información',
    showMore: 'Ver más',
    showLess: 'Ver menos',
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro',
    color: 'Color',
    customize: 'Personalizar',
  },
  cookies: {
    ...es.cookies,
    text: es.cookies.text.replace('Utilizamos', 'Usamos'),
    accept: 'DE ACUERDO',
  },
  menu: {
    ...es.menu,
    mainMenu: 'Menú principal',
    infoSupport: 'Info y soporte',
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    settings: 'Ajustes',
    logout: 'Cerrar sesión',
    localPreferences: 'Preferencias locales',
  },
  prefs: {
    ...es.prefs,
    title: 'Preferencias locales',
    muteTab: 'Silenciar pestaña',
    helpCenter: 'Centro de ayuda',
    gameRules: 'Normas del juego',
    synced: 'Preferencias sincronizadas con tu cuenta',
  },
  pages: {
    ...es.pages,
    home: {
      ...es.pages.home,
      tagline: 'Música, neón y precisión competitiva. Domina el ritmo en la dimensión definitiva donde cada nota cuenta.',
      playGuest: 'Jugar como invitado',
      registerOrLogin: 'Registrarse o iniciar sesión',
    },
    library: {
      ...es.pages.library,
      subtitle: 'Explora el repertorio exclusivo de CiszukoAntony',
    },
    leaderboard: {
      ...es.pages.leaderboard,
      subtitle: 'La élite de la transmisión — datos en tiempo real',
    },
  },
};

/**
 * English (UK): ortografía británica (-our/-re/-ise) y uso de minúscula en
 * nombres de ajuste. `applyDialect` aplica las tablas de UK_DIALECT y
 * UK_PHRASING sobre el inglés base; encima van los giros propios que no son
 * sustitución de palabra suelta.
 */
const enGb: typeof en = {
  ...applyDialect(en, 'en-uk'),
  nav: {
    ...applyDialect(en.nav, 'en-uk'),
    stats: 'Statistics',
  },
  menu: {
    ...applyDialect(en.menu, 'en-uk'),
    mainMenu: 'Main menu',
    infoSupport: 'Info & support',
    myProfile: 'My profile',
    logout: 'Log out',
    localPreferences: 'Local preferences',
  },
  prefs: {
    ...applyDialect(en.prefs, 'en-uk'),
    title: 'Local preferences',
    gameRules: 'Game rules',
    cookieAccepted: 'Accepted',
    cookieRejected: 'Rejected',
  },
  pages: {
    ...applyDialect(en.pages, 'en-uk'),
    faq: {
      ...applyDialect(en.pages.faq, 'en-uk'),
      title: 'FAQs',
    },
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
  return dict[lang] ?? dict['es-latam'];
}

export function parseLang(raw: string | undefined | null): Lang {
  if (raw === 'es-es' || raw === 'en-us' || raw === 'en-uk') return raw;
  if (raw === 'es' || raw === 'es-latam') return 'es-latam';
  if (raw === 'en') return 'en-us';
  return 'es-latam';
}

export const isEsLang = (lang: Lang): boolean => lang === 'es-latam' || lang === 'es-es';

export const LANGS = [
  { code: 'es-latam' as const, label: 'ES-LA', flag: 'es' },
  { code: 'es-es' as const, label: 'ES-ES', flag: 'es' },
  { code: 'en-us' as const, label: 'EN-US', flag: 'us' },
  { code: 'en-uk' as const, label: 'EN-UK', flag: 'gb' },
];

/** Reemplaza `{var}` por su valor en una cadena del diccionario. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => vars[name] ?? match);
}
