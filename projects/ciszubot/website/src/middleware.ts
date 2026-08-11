import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createIast, buildCsp } from '@ciszunetwork/utils';

const iast = createIast('ciszubot');

/**
 * Middleware de Next.js (CiszuBot Security Layer).
 * Cabeceras de seguridad HTTP + sensor IAST runtime (edge-safe, solo observa).
 * NOTA: el dashboard OAuth se controla en server components/rutas — el
 * middleware NO bloquea nada (I = Interactive, solo monitorea).
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set(
    'Content-Security-Policy',
    buildCsp({ imgSrc: ['https://cdn.discordapp.com'], connectSrc: ['https://cdn.discordapp.com'] })
  );

  // ── Sensor IAST (runtime): detecta payloads maliciosos, solo observa ──────
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