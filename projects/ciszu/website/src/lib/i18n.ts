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
};

const enGb = {
  ...en,
  footer: {
    ...en.footer,
    whatsappDirect: 'Direct WhatsApp',
  },
};

export const dict = {
  'es-latam': es,
  'es-es': es,
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

export const LANGS = [
  { code: 'es-latam' as const, label: 'ES-LA', flag: 'es' },
  { code: 'es-es' as const, label: 'ES-ES', flag: 'es' },
  { code: 'en-us' as const, label: 'EN-US', flag: 'us' },
  { code: 'en-uk' as const, label: 'EN-UK', flag: 'gb' },
];
