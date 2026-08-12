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
  /** Fuentes extra para iframes (frame-src). */
  frameSrc?: string[];
}

const SUPABASE_ORIGIN = 'https://obwzzmbvkrcscqwptlqo.supabase.co';

export function buildCsp(opts: CspOptions = {}): string {
  const directives: Array<[string, string[]]> = [
    // default-src 'self': todo lo no listado cae a self.
    ['default-src', ["'self'"]],
    // 'unsafe-inline' en script: Next.js App Router inyecta bootstrap inline
    // (self.__next_f.push) sin nonce; los dominios externos siguen acotados.
    [
      'script-src',
      ["'self'", "'unsafe-inline'", 'https://challenges.cloudflare.com', 'https://static.cloudflareinsights.com', 'https://us.i.posthog.com', 'https://us-assets.i.posthog.com', ...(opts.scriptSrc ?? [])],
    ],
    // Estilos inline de la v3 PDWA y utilidades CSS en línea del ecosistema.
    ['style-src', ["'self'", "'unsafe-inline'"]],
    ['img-src', ["'self'", 'data:', 'blob:', SUPABASE_ORIGIN, ...(opts.imgSrc ?? [])]],
    ['font-src', ["'self'", 'data:', ...(opts.fontSrc ?? [])]],
    ['connect-src', ["'self'", SUPABASE_ORIGIN, 'https://us.i.posthog.com', 'https://us-assets.i.posthog.com', 'https://static.cloudflareinsights.com', 'https://cloudflareinsights.com', 'https://challenges.cloudflare.com', 'https://*.ingest.us.sentry.io', ...(opts.connectSrc ?? [])]],
    ['frame-src', ["'self'", 'https://challenges.cloudflare.com', ...(opts.frameSrc ?? [])]],
    ['object-src', ["'none'"]],
    ['base-uri', ["'self'"]],
    ['form-action', ["'self'"]],
  ];

  return directives.map(([name, srcs]) => `${name} ${srcs.join(' ')}`).join('; ');
}