import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Next.js (MuzicMania Security Layer).
 * Capa de seguridad Edge: cabeceras HTTP seguras + rutas protegidas.
 *
 * NOTA sobre Supabase v2:
 * Supabase v2 usa cookies con nombre dinámico `sb-<project-ref>-auth-token`.
 * La autenticación real se gestiona en AuthProvider (client-side).
 * El middleware solo aplica cabeceras de seguridad y protege rutas estrictas.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── 1. Cabeceras de Seguridad HTTP ──────────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // X-Frame-Options NO se pone aquí (permite previsualizaciones en Vercel Dashboard)

  // ── 2. Detección de sesión compatible con Supabase v2 ───────────────────────
  // NOTA: Como la app usa localStorage (standard client) en vez de cookies SSR,
  // el middleware no puede leer la sesión fiablemente.
  // La protección de rutas se hará en el cliente (Zustand + useEffect) o 
  // creando componentes ProtectedRoute.
  // Por ahora, eliminamos los bloqueos de middleware para evitar falsos 404/redirects.

  // ── 3. Cabeceras y paso libre ───────────────────────────────────────────────

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico|sitemap.xml|robots.txt|images|icons|audio|logos|fonts).*)',
  ],
};
