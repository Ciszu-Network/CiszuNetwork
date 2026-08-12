import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createIast, buildCsp } from '@ciszunetwork/utils';

const iast = createIast('ciszunetwork');

/**
 * Middleware de Next.js (CiszuNetwork Security Layer).
 * Cabeceras de seguridad HTTP + sensor IAST runtime (edge-safe, solo observa).
 */
export function middleware(request: NextRequest) {
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
  // Emite [IAST] a logs de Vercel con dedupe 5 min. Doc: SECURITY_TASKS.md
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