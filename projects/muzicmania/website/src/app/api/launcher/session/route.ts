import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createRateLimiter } from '@ciszunetwork/utils';
import { authenticate } from '../../auth/2fa/_lib';
import { launcherSecret } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/**
 * Emite un token de launcher de alcance limitado (leer/marcar notificaciones).
 * NUNCA devuelve el access_token de Supabase: el launcher no debe poder actuar
 * como el usuario en el resto de la API.
 */
export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } },
    );
  }

  const secret = launcherSecret();
  if (!secret) return NextResponse.json({ error: 'launcher_token_unavailable' }, { status: 501 });

  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const signature = createHmac('sha256', secret)
    .update(`launcher-notifications:${user.userId}:${expiresAt}`)
    .digest('base64url');

  return NextResponse.json(
    { token: `${user.userId}.${expiresAt}.${signature}`, expiresAt },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
