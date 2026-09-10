export type Lang = 'es-latam' | 'es-es' | 'en-us' | 'en-uk';

export const MUZICMANIA = 'https://muzicmania.vercel.app';
export const CISZU_NETWORK = 'https://ciszunetwork.vercel.app';
export const GITHUB_REPO = 'https://github.com/Ciszu-Network/CiszuNetwork';

const es = {
  nav: {
    home: 'Inicio',
    play: 'Jugar',
    rankings: 'Rankings',
    profile: 'Perfil',
    download: 'Descargar',
    search: 'Buscar…',
  },
  footer: {
    brand: 'MuzicMania',
    rights: 'Todos los derechos reservados.',
    madeBy: 'Hecho con',
    githubRepo: 'Repositorio en GitHub',
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
    play: 'Play',
    rankings: 'Rankings',
    profile: 'Profile',
    download: 'Download',
    search: 'Search…',
  },
  footer: {
    brand: 'MuzicMania',
    rights: 'All rights reserved.',
    madeBy: 'Made with',
    githubRepo: 'GitHub Repository',
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

export const isEsLang = (lang: Lang): boolean => lang === 'es-latam' || lang === 'es-es';

export const LANGS = [
  { code: 'es-latam' as const, label: 'ES-LA', flag: 'es' },
  { code: 'es-es' as const, label: 'ES-ES', flag: 'es' },
  { code: 'en-us' as const, label: 'EN-US', flag: 'us' },
  { code: 'en-uk' as const, label: 'EN-UK', flag: 'gb' },
];
