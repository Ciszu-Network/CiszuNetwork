import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createIast, buildCsp } from '@ciszunetwork/utils';
import { cookieEqualsToken } from '@/lib/edit-auth';

const iast = createIast('ciszukoantony');

// ── Kill switch (site_controls) ─────────────────────────────────────────────
// Si la web esta en mantenimiento, TODA pagina responde 503 con una pantalla
// propia (las rutas /api/* quedan libres para no romper integraciones). La
// bandera vive en Supabase (lectura publica) y se cachea 60s en el edge para
// no consultar en cada request. Ante cualquier fallo: fail-open (la web sigue).
const SITE = 'ciszukoantony';
const SITE_NAME = 'Ciszuko Antony';

type SiteControl = { maintenance: boolean; message: string; reason: string; until: string | null };
let controlCache: { at: number; value: SiteControl | null } | null = null;

async function getSiteControl(): Promise<SiteControl | null> {
  if (controlCache && Date.now() - controlCache.at < 60_000) return controlCache.value;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const res = await fetch(
      `${url}/rest/v1/site_controls?website=eq.${SITE}&select=maintenance,message,reason,until`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': 'public' },
        cache: 'no-store',
      },
    );
    const rows = (await res.json().catch(() => [])) as Array<Record<string, unknown>>;
    const row = res.ok && Array.isArray(rows) ? rows[0] : null;
    const value: SiteControl | null = row
      ? {
          maintenance: row.maintenance === true,
          message: typeof row.message === 'string' ? row.message : '',
          reason: typeof row.reason === 'string' ? row.reason : '',
          until: typeof row.until === 'string' ? row.until : null,
        }
      : null;
    controlCache = { at: Date.now(), value };
    return value;
  } catch {
    return null;
  }
}

function maintenanceResponse(message: string, reason: string, until: string | null): Response {
  const esc = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const html =
    '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex">' +
    `<title>Mantenimiento — ${SITE_NAME}</title>` +
    '<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;' +
    'background:#05050a;color:#e8e8f0;font-family:system-ui,sans-serif;text-align:center;padding:24px}' +
    'main{max-width:520px}h1{font-size:22px;letter-spacing:.2em;text-transform:uppercase;color:#22d3ee;margin:14px 0}' +
    'p{color:#9aa;line-height:1.6;font-size:14px}' +
    '.tag{display:inline-block;padding:6px 12px;border:1px solid #ff33cc55;border-radius:999px;' +
    'color:#ff33cc;font-size:11px;letter-spacing:.15em;text-transform:uppercase}</style></head>' +
    `<body><main><div class="tag">Ciszu Network · ${SITE_NAME}</div>` +
    '<h1>Sitio en mantenimiento</h1>' +
    `<p>${esc(message || 'Estamos realizando una intervencion. Volvemos pronto.')}</p>` +
    (reason ? `<p><strong>Motivo:</strong> ${esc(reason)}</p>` : '') +
    (until ? `<p><strong>Estimado:</strong> ${esc(new Date(until).toLocaleString('es-VE'))}</p>` : '') +
    '</main></body></html>';
  return new Response(html, {
    status: 503,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '300' },
  });
}

/**
 * CSP precomputada a nivel de módulo (una vez por instancia edge): la política
 * depende solo de NODE_ENV y de los orígenes de esta web, no del request.
 * `buildCsp` además memoiza por configuración (packages/utils/src/csp.ts), así
 * que ninguna ruta la reconstruye por request.
 */
const CSP = buildCsp({
  imgSrc: [
    'https://cdn.discordapp.com',
    'https://top.gg',
    'https://www.google.com',
    'https://www.google.co.ve',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://pagead2.googlesyndication.com',
    'https://nowpayments.io',
    'https://ko-fi.com',
    'https://storage.ko-fi.com',
    'https://www.trustpilot.com',
    'https://widget.trustpilot.com',
    'https://images.trustpilot.com',
  ],
  connectSrc: ['https://widget.trustpilot.com', 'https://images.trustpilot.com', 'https://storage.ko-fi.com'],
  styleSrc: ['https://rsms.me', 'https://storage.ko-fi.com', 'https://ko-fi.com'],
  fontSrc: ['https://rsms.me'],
  scriptSrc: ['https://cdnjs.cloudflare.com', 'https://widget.trustpilot.com', 'https://www.trustpilot.com', 'https://storage.ko-fi.com'],
  workerSrc: ['https://cdnjs.cloudflare.com'],
  frameSrc: [
    'https://obwzzmbvkrcscqwptlqo.supabase.co',
    'https://nowpayments.io',
    'https://ko-fi.com',
    'https://www.trustpilot.com',
    'https://widget.trustpilot.com',
  ],
});

/** Cabeceras internas retiradas en Fase 4 (STATIC_MIGRATION_PLAN §2.4/§4.5):
 *  el layout raíz ya no lee `x-is-edit` ni `x-pathname` (eso hacía dinámica
 *  toda la web). El editor se resuelve en cliente (`usePathname()`) y la
 *  metadata por ruta vive en el `layout.tsx` de cada segmento. */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Kill switch: si la web esta en mantenimiento, 503 con pantalla propia.
  //    (Las rutas /api/* se excluyen para no romper integraciones.)
  if (!pathname.startsWith('/api/')) {
    const control = await getSiteControl();
    if (control?.maintenance && (!control.until || Date.parse(control.until) > Date.now())) {
      return maintenanceResponse(control.message, control.reason, control.until);
    }
  }

  const isEditPage = pathname === '/edit' || pathname.startsWith('/edit/');
  const isPuckApi = pathname.startsWith('/api/puck/');
  const isEditLogin = pathname === '/edit/login' || pathname === '/api/edit/login';

  const isEditArea = isEditPage || isPuckApi;

  if (isEditArea) {
    // Sin PUCK_EDIT_TOKEN (producción/Vercel o local sin configurar): el
    // editor NO existe. Todo el área edit/* y api/puck/* — INCLUIDO
    // /edit/login — responde 404 (nunca 403 ni login visible).
    if (!process.env.PUCK_EDIT_TOKEN) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Not Found' },
          { status: 404, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    // Con token (solo dev local): login y su API quedan libres para
    // autenticarse; el resto exige cookie de sesión válida.
    if (!isEditLogin) {
      const sessionCookie = request.cookies.get('edit_session')?.value;
      if (!sessionCookie || !(await cookieEqualsToken(sessionCookie))) {
        const loginUrl = new URL('/edit/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Content-Security-Policy', CSP);

  // ── Sensor IAST (runtime, edge-safe): solo observa y loguea payloads ──────
  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((v, k) => {
    params[k] = v;
  });
  iast.observe(request.method, request.nextUrl.pathname, params);

  return response;
}

export const config = {
  // Matcher estrechado (Fase 2, STATIC_MIGRATION_PLAN §4.3):
  // - árboles estáticos de public/ (docs/, pwa/, shared/, brand-logos/) y assets
  //   por extensión: no necesitan headers de seguridad ni IAST (los sirve el CDN).
  // - api/ads/{push,clear,debug}: endpoints dev-only (en prod responden vacío).
  // - 149e9513-.../: proxy del challenge de Vercel BotID (rewrite de withBotId);
  //   sus cabeceras las gestiona next.config, no el middleware.
  // El resto (HTML/RSC y API reales) sí pasa por el middleware para conservar
  // cabeceras + IAST. /musicboard sigue pasando (es una página) y sus portadas
  // estáticas quedan cubiertas por extensión.
  matcher: [
    '/((?!_next|149e9513-01fa-4fb0-aad4-566afd725d1b/|static|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|sw.js|ads.txt|docs/|pwa/|shared/|brand-logos/|images|icons|audio|logos|fonts|api/ads/(?:push|clear|debug)$|.*\\.(?:svg|png|jpe?g|gif|webp|avif|bmp|ico|woff2?|ttf|otf|eot|mp3|mp4|webm|mov|ogg|oga|opus|wav|flac|pdf|zip|docx?|xlsx?|pptx?|csv|txt|md|xml|json|map|html?)$).*)',
  ],
};
