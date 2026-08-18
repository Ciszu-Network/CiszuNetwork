import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createIast, buildCsp } from '@ciszunetwork/utils';
import { cookieEqualsToken } from '@/lib/edit-auth';

const iast = createIast('ciszunetwork');

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

  // ── Protección del editor visual (Puck) ────────────────────────────────────
  const isEditPage = pathname === '/edit' || pathname.startsWith('/edit/');
  const isPuckApi = pathname.startsWith('/api/puck/');
  const isEditLogin = pathname === '/edit/login' || pathname === '/api/edit/login';

  if (!isEditLogin && (isEditPage || isPuckApi)) {
    if (!process.env.EDIT_TOKEN) {
      // Sin token configurado: superficie cerrada en firme (localhost y prod).
      return new NextResponse(null, {
        status: 403,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const sessionCookie = request.cookies.get('edit_session')?.value;
    if (!sessionCookie || !(await cookieEqualsToken(sessionCookie))) {
      const loginUrl = new URL('/edit/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set(
    'Content-Security-Policy',
    buildCsp({
      scriptSrc: ['https://widget.trustpilot.com', 'https://www.trustpilot.com'],
      imgSrc: ['https://nowpayments.io', 'https://www.trustpilot.com', 'https://widget.trustpilot.com', 'https://images.trustpilot.com'],
      frameSrc: ['https://nowpayments.io', 'https://www.trustpilot.com', 'https://widget.trustpilot.com'],
      connectSrc: ['https://widget.trustpilot.com', 'https://images.trustpilot.com'],
    })
  );

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
  matcher: ['/((?!_next|static|favicon.ico|sitemap.xml|robots.txt|images|icons|audio|logos|fonts).*)'],
};