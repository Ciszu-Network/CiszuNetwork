import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createIast, buildCsp } from '@ciszunetwork/utils';
import { cookieEqualsToken } from '@/lib/edit-auth';

const iast = createIast('ciszunetwork');

// ── Kill switch (site_controls): mantenimiento total + paginas bloqueadas ──
// Si la web esta en mantenimiento, TODA pagina responde 503 con una pantalla
// propia; ademas se pueden bloquear rutas individuales (site_blocked_paths).
// Las banderas viven en Supabase (lectura publica) y se cachean 60s en el edge
// para no consultar en cada request. Las rutas /api/* quedan libres para no
// romper integraciones. Ante cualquier fallo: fail-open (la web sigue).
const SITE = 'ciszunetwork';
const SITE_NAME = 'Ciszu Network';

type SiteControl = {
  maintenance: boolean;
  title: string;
  message: string;
  reason: string;
  until: string | null;
};
type BlockedPath = {
  path: string;
  match: 'exact' | 'prefix';
  title: string;
  message: string;
  reason: string;
  until: string | null;
};
type Screens = { control: SiteControl | null; blocked: BlockedPath[] };
let screensCache: { at: number; value: Screens } | null = null;

async function getScreens(): Promise<Screens> {
  if (screensCache && Date.now() - screensCache.at < 60_000) return screensCache.value;
  const empty: Screens = { control: null, blocked: [] };
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return empty;
    const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': 'public' };
    const [controlRes, blockedRes] = await Promise.all([
      fetch(`${url}/rest/v1/site_controls?website=eq.${SITE}&select=maintenance,title,message,reason,until`, {
        headers,
        cache: 'no-store',
      }),
      fetch(`${url}/rest/v1/site_blocked_paths?website=eq.${SITE}&select=path,match,title,message,reason,until`, {
        headers,
        cache: 'no-store',
      }),
    ]);
    const controlRows = (await controlRes.json().catch(() => [])) as Array<Record<string, unknown>>;
    const blockedRows = (await blockedRes.json().catch(() => [])) as Array<Record<string, unknown>>;
    const row = controlRes.ok && Array.isArray(controlRows) ? controlRows[0] : null;
    const control: SiteControl | null = row
      ? {
          maintenance: row.maintenance === true,
          title: typeof row.title === 'string' ? row.title : '',
          message: typeof row.message === 'string' ? row.message : '',
          reason: typeof row.reason === 'string' ? row.reason : '',
          until: typeof row.until === 'string' ? row.until : null,
        }
      : null;
    const blocked: BlockedPath[] =
      blockedRes.ok && Array.isArray(blockedRows)
        ? blockedRows
            .filter((r) => typeof r.path === 'string')
            .map((r) => ({
              path: r.path as string,
              match: r.match === 'prefix' ? 'prefix' : 'exact',
              title: typeof r.title === 'string' ? r.title : '',
              message: typeof r.message === 'string' ? r.message : '',
              reason: typeof r.reason === 'string' ? r.reason : '',
              until: typeof r.until === 'string' ? r.until : null,
            }))
        : [];
    const value: Screens = { control, blocked };
    screensCache = { at: Date.now(), value };
    return value;
  } catch {
    return empty;
  }
}

/** Normaliza una ruta para comparar (sin barra final; siempre con / inicial). */
function normPath(p: string): string {
  const t = (p || '/').replace(/\/+$/, '');
  return t.startsWith('/') ? t || '/' : '/' + t;
}

/** Primera ruta bloqueada vigente que coincide con el pathname (null si no). */
function matchBlocked(blocked: BlockedPath[], pathname: string): BlockedPath | null {
  const here = normPath(pathname);
  for (const b of blocked) {
    if (b.until && Date.parse(b.until) <= Date.now()) continue;
    const p = normPath(b.path);
    if (p === '/') continue;
    if (b.match === 'prefix' ? here === p || here.startsWith(p + '/') : here === p) return b;
  }
  return null;
}

/** Pantalla 503 unica (mantenimiento total o pagina no disponible). */
function screenResponse(
  title: string,
  message: string,
  reason: string,
  until: string | null,
  fallback: string,
): Response {
  const esc = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const html =
    '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex">' +
    `<title>${esc(title)} — ${SITE_NAME}</title>` +
    '<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;' +
    'background:#05050a;color:#e8e8f0;font-family:system-ui,sans-serif;text-align:center;padding:24px}' +
    'main{max-width:520px}h1{font-size:22px;letter-spacing:.2em;text-transform:uppercase;color:#22d3ee;margin:14px 0}' +
    'p{color:#9aa;line-height:1.6;font-size:14px}' +
    '.tag{display:inline-block;padding:6px 12px;border:1px solid #ff33cc55;border-radius:999px;' +
    'color:#ff33cc;font-size:11px;letter-spacing:.15em;text-transform:uppercase}</style></head>' +
    `<body><main><div class="tag">Ciszu Network · ${SITE_NAME}</div>` +
    `<h1>${esc(title)}</h1>` +
    `<p>${esc(message || fallback)}</p>` +
    (reason ? `<p><strong>Motivo:</strong> ${esc(reason)}</p>` : '') +
    (until ? `<p><strong>Estimado:</strong> ${esc(new Date(until).toLocaleString('es-VE'))}</p>` : '') +
    '</main></body></html>';
  return new Response(html, {
    status: 503,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '300' },
  });
}

function maintenanceResponse(control: SiteControl): Response {
  return screenResponse(
    control.title || 'Sitio en mantenimiento',
    control.message,
    control.reason,
    control.until,
    'Estamos realizando una intervencion. Volvemos pronto.',
  );
}

function unavailableResponse(blocked: BlockedPath): Response {
  return screenResponse(
    blocked.title || 'Esta pagina no esta disponible',
    blocked.message,
    blocked.reason,
    blocked.until,
    'Esta pagina no esta disponible por ahora. Intenta mas tarde.',
  );
}

/**
 * CSP precomputada a nivel de módulo (una vez por instancia edge): la política
 * depende solo de NODE_ENV y de los orígenes de esta web, no del request.
 * `buildCsp` además memoiza por configuración (packages/utils/src/csp.ts), así
 * que ninguna ruta la reconstruye por request.
 */
const CSP = buildCsp({
  scriptSrc: ['https://widget.trustpilot.com', 'https://www.trustpilot.com', 'https://storage.ko-fi.com'],
  imgSrc: [
    'https://nowpayments.io',
    'https://ko-fi.com',
    'https://storage.ko-fi.com',
    'https://www.trustpilot.com',
    'https://widget.trustpilot.com',
    'https://images.trustpilot.com',
    'https://www.google.com',
    'https://www.google.co.ve',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://pagead2.googlesyndication.com',
  ],
  frameSrc: [
    'https://nowpayments.io',
    'https://ko-fi.com',
    'https://www.trustpilot.com',
    'https://widget.trustpilot.com',
    'https://discord.com',
    'https://top.gg',
  ],
  connectSrc: ['https://widget.trustpilot.com', 'https://images.trustpilot.com', 'https://storage.ko-fi.com'],
  styleSrc: ['https://rsms.me', 'https://storage.ko-fi.com', 'https://ko-fi.com'],
  fontSrc: ['https://rsms.me'],
});

/** Cabeceras internas retiradas en Fase 4 (STATIC_MIGRATION_PLAN §2.4/§4.5):
 *  el layout raíz ya no lee `x-is-edit`/`x-is-bare` (eso hacía dinámica toda
 *  la web). El editor y el modo desnudo de /youareanidiot se resuelven en
 *  cliente (`usePathname()`), así que el middleware no inyecta cabeceras. */

/**
 * Middleware de Next.js (CiszuNetwork Security Layer).
 * Cabeceras de seguridad HTTP + sensor IAST runtime (edge-safe, solo observa).
 *
 * Protección del editor Puck (edit/* y api/puck/*): superficie de escritura de
 * contenido. Solo accesible LOCALMENTE con token; NUNCA expuesto en producción.
 * Sin cookie de sesión válida -> redirect a /edit/login (o 403 si no hay token).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Kill switch: mantenimiento total o pagina bloqueada -> 503 con pantalla.
  //    (Las rutas /api/* se excluyen para no romper integraciones.)
  if (!pathname.startsWith('/api/')) {
    const screens = await getScreens();
    const control = screens.control;
    if (control?.maintenance && (!control.until || Date.parse(control.until) > Date.now())) {
      return maintenanceResponse(control);
    }
    const blocked = matchBlocked(screens.blocked, pathname);
    if (blocked) return unavailableResponse(blocked);
  }

  // ── Protección del editor visual (Puck) ────────────────────────────────────
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

  // ── Sensor IAST (runtime): detecta payloads maliciosos, solo observa ──────
  // Emite [IAST] a logs de Vercel con dedupe 5 min. Doc: SECURITY_PROTOCOLS.md
  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((v, k) => {
    params[k] = v;
  });
  iast.observe(request.method, request.nextUrl.pathname, params);

  return response;
}

export const config = {
  // Matcher estrechado (Fase 2, STATIC_MIGRATION_PLAN §4.3):
  // - árboles estáticos de public/ (docs/, pwa/, shared/) y assets por extensión:
  //   no necesitan headers de seguridad ni IAST (los sirve el CDN de Vercel).
  // - api/ads/{push,clear,debug}: endpoints dev-only (en prod responden vacío).
  // - 149e9513-.../: proxy del challenge de Vercel BotID (rewrite de withBotId);
  //   sus cabeceras las gestiona next.config, no el middleware.
  // El resto (HTML/RSC y API reales, incluida api/ads/impression) sí pasa por el
  // middleware para conservar cabeceras + IAST.
  matcher: [
    '/((?!_next|149e9513-01fa-4fb0-aad4-566afd725d1b/|static|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|sw.js|ads.txt|docs/|pwa/|shared/|images|icons|audio|logos|fonts|api/ads/(?:push|clear|debug)$|.*\\.(?:svg|png|jpe?g|gif|webp|avif|bmp|ico|woff2?|ttf|otf|eot|mp3|mp4|webm|mov|ogg|oga|opus|wav|flac|pdf|zip|docx?|xlsx?|pptx?|csv|txt|md|xml|json|map|html?)$).*)',
  ],
};