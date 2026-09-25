/**
 * Construcción de la política Content-Security-Policy (CSP) compartida
 * del ecosistema Ciszu Network. Edge-safe, sin dependencias.
 *
 * Orígenes comunes de las 4 webs:
 * - 'self' (Next.js + assets locales)
 * - challenges.cloudflare.com        (Turnstile: script + iframe)
 * - static.cloudflareinsights.com    (beacon Cloudflare Web Analytics)
 * - us.i.posthog.com / us-assets.i.posthog.com (PostHog analítica)
 * - obwzzmbvkrcscqwptlqo.supabase.co (CDN de assets + PostgREST/auth)
 * - www.googletagmanager.com         (GTM + gtag.js de Google Analytics 4)
 * - pagead2.googlesyndication.com    (adsbygoogle.js de AdSense)
 * - ciszunetwork.vercel.app          (API central de impresiones ADS)
 *
 * Por app se añade lo extra (p.ej. cdn.discordapp.com en ciszubot para los
 * avatares del dashboard, wss:// para realtime de muzicmania).
 */
export interface CspOptions {
  /** Fuentes extra de script (dominios por app). */
  scriptSrc?: string[];
  /** Fuentes extra para imágenes. */
  imgSrc?: string[];
  /** Fuentes extra para connect (fetch/XHR/WS). */
  connectSrc?: string[];
  /** Fuentes extra de fuentes. */
  fontSrc?: string[];
  /** Fuentes extra de estilos (CSS remoto, p.ej. rsms.me/inter.css del editor Puck). */
  styleSrc?: string[];
  /** Fuentes extra para iframes (frame-src). */
  frameSrc?: string[];
  /** Fuentes extra para workers (worker-src). */
  workerSrc?: string[];
  /**
   * Modo desarrollo forzado (por defecto: NODE_ENV !== 'production').
   * En dev se añade 'unsafe-eval' (lo necesita el cliente de Next.js dev) y
   * el origen local del CDN (http://localhost:8788).
   */
  dev?: boolean;
}

const SUPABASE_ORIGIN = 'https://obwzzmbvkrcscqwptlqo.supabase.co';

// Google (GoogleScripts de @ciszu/ui, en las 4 webs): GTM y gtag.js se sirven
// desde googletagmanager.com; adsbygoogle.js de AdSense desde pagead2.
const GOOGLE_TAG_MANAGER_ORIGIN = 'https://www.googletagmanager.com';
const GOOGLE_DOUBLECLICK_ORIGIN = 'https://googleads.g.doubleclick.net';
const GOOGLE_ADSENSE_ORIGIN = 'https://pagead2.googlesyndication.com';
// Orígenes adicionales que sirven los anuncios de AdSense (auto ads):
//   ep1/ep2.adtrafficquality.google  → verificación de tráfico de anuncios
//   tpc.googlesyndication.com        → iframes/creatividades
//   partner.googleadservices.com     → SDK de socios
//   www.gstatic.com                  → recursos estáticos de Google
// Sin ellos, las impresiones fallan con errores de CSP (400/500 en consola).
const GOOGLE_ADTRAFFIC_ORIGIN = 'https://ep1.adtrafficquality.google';
const GOOGLE_ADTRAFFIC_ORIGIN_2 = 'https://ep2.adtrafficquality.google';
const GOOGLE_AD_CREATIVE_ORIGIN = 'https://tpc.googlesyndication.com';
const GOOGLE_AD_PARTNER_ORIGIN = 'https://partner.googleadservices.com';
const GOOGLE_STATIC_ORIGIN = 'https://www.gstatic.com';
const GOOGLE_ADSENSE_WILDCARD = 'https://*.googlesyndication.com';
// GA4 (gtag.js) envía la colecta de eventos a stats.g.doubleclick.net además de
// www.google-analytics.com. Sin este origen en connect-src/img-src la petición
// se bloquea y GA4 pierde mediciones (error de CSP en consola, no visible en
// las otras rutas porque sólo se dispara al enviar el beacon).
const GOOGLE_ANALYTICS_STATS_ORIGIN = 'https://stats.g.doubleclick.net';

// API central de impresiones ADS: Ads.tsx de @ciszu/ui registra cada impresión
// en ciszunetwork.vercel.app desde CUALQUIERA de las 4 webs (fetch cross-site).
const ADS_API_ORIGIN = 'https://ciszunetwork.vercel.app';

// CDN local del ecosistema (scripts/serve-cdn.js) solo en desarrollo.
const LOCAL_CDN_ORIGINS = ['http://localhost:8788', 'http://127.0.0.1:8788'];

export function buildCsp(opts: CspOptions = {}): string {
  const dev = opts.dev ?? process.env.NODE_ENV !== 'production';
  const local = dev ? LOCAL_CDN_ORIGINS : [];
  const directives: Array<[string, string[]]> = [
    // default-src 'self': todo lo no listado cae a self.
    ['default-src', ["'self'"]],
    // 'unsafe-inline' en script: Next.js App Router inyecta bootstrap inline
    // (self.__next_f.push) sin nonce; los dominios externos siguen acotados.
    // 'unsafe-eval' SOLO en desarrollo: el cliente de Next.js dev lo exige.
    [
      'script-src',
      ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : []), 'https://challenges.cloudflare.com', 'https://static.cloudflareinsights.com', 'https://us.i.posthog.com', 'https://us-assets.i.posthog.com', 'https://va.vercel-scripts.com', GOOGLE_TAG_MANAGER_ORIGIN, GOOGLE_ADSENSE_ORIGIN, GOOGLE_ADTRAFFIC_ORIGIN, GOOGLE_ADTRAFFIC_ORIGIN_2, GOOGLE_AD_CREATIVE_ORIGIN, GOOGLE_AD_PARTNER_ORIGIN, ...(opts.scriptSrc ?? [])],
    ],
    // Estilos inline de la v3 PDWA y utilidades CSS en línea del ecosistema.
    // styleSrc extra: hoja de estilos remota del editor Puck (inter.css de rsms.me).
    ['style-src', ["'self'", "'unsafe-inline'", ...(opts.styleSrc ?? [])]],
    // img-src: AdSense también carga el píxel de verificación de tráfico
    // (ep1/ep2.adtrafficquality.google/pagead/sodar...) como IMAGEN; sin esos
    // orígenes el navegador lo bloquea y ensucia la consola con errores CSP.
    ['img-src', ["'self'", 'data:', 'blob:', SUPABASE_ORIGIN, GOOGLE_ADSENSE_ORIGIN, GOOGLE_ADSENSE_WILDCARD, GOOGLE_DOUBLECLICK_ORIGIN, GOOGLE_ADTRAFFIC_ORIGIN, GOOGLE_ADTRAFFIC_ORIGIN_2, GOOGLE_AD_CREATIVE_ORIGIN, GOOGLE_STATIC_ORIGIN, 'https://www.google-analytics.com', 'https://analytics.google.com', GOOGLE_ANALYTICS_STATS_ORIGIN, ...local, ...(opts.imgSrc ?? [])]],
    ['media-src', ["'self'", SUPABASE_ORIGIN, ...local]],
    ['font-src', ["'self'", 'data:', ...local, ...(opts.fontSrc ?? [])]],
    // connect-src: API de impresiones ADS + GTM; GA4 (gtag) envía la colecta de
    // eventos por beacon a www.google-analytics.com, *.google-analytics.com
    // (region1/2) y analytics.google.com. El noscript de GTM abre un iframe de
    // ns.html en googletagmanager.com (frame-src más abajo).
    ['connect-src', ["'self'", SUPABASE_ORIGIN, 'https://us.i.posthog.com', 'https://us-assets.i.posthog.com', 'https://static.cloudflareinsights.com', 'https://cloudflareinsights.com', 'https://challenges.cloudflare.com', 'https://va.vercel-scripts.com', 'https://*.ingest.us.sentry.io', GOOGLE_TAG_MANAGER_ORIGIN, GOOGLE_ADSENSE_ORIGIN, GOOGLE_ADSENSE_WILDCARD, ADS_API_ORIGIN, 'https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://analytics.google.com', GOOGLE_DOUBLECLICK_ORIGIN, GOOGLE_ADTRAFFIC_ORIGIN, GOOGLE_ADTRAFFIC_ORIGIN_2, GOOGLE_ANALYTICS_STATS_ORIGIN, ...local, ...(opts.connectSrc ?? [])]],
    // frame-src: AdSense abre iframes de verificación de tráfico en
    // ep1/ep2.adtrafficquality.google (antes solo estaban en script/connect-src,
    // así que el marco se bloqueaba con "Framing ... violates frame-src").
    ['frame-src', ["'self'", 'https://challenges.cloudflare.com', GOOGLE_TAG_MANAGER_ORIGIN, GOOGLE_DOUBLECLICK_ORIGIN, GOOGLE_ADSENSE_ORIGIN, GOOGLE_AD_CREATIVE_ORIGIN, GOOGLE_ADTRAFFIC_ORIGIN, GOOGLE_ADTRAFFIC_ORIGIN_2, 'https://www.google.com', ...(opts.frameSrc ?? [])]],
    // worker-src explícito: PostHog recording crea workers desde blob: URLs;
    // sin esta directiva cae a script-src y se bloquea (paridad en las 4 webs).
    ['worker-src', ["'self'", 'blob:', ...(opts.workerSrc ?? [])]],
    ['object-src', ["'none'"]],
    ['base-uri', ["'self'"]],
    ['form-action', ["'self'"]],
  ];

  return directives.map(([name, srcs]) => `${name} ${srcs.join(' ')}`).join('; ');
}
