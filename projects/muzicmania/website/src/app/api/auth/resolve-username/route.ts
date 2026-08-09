import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRateLimiter } from '@ciszunetwork/utils';

/**
 * Resuelve un @username al email de la cuenta (flujo de login de MuzicMania).
 *
 * Antes esta resolución se hacía con la RPC pública `get_email_by_username`
 * usando la anon key desde el navegador — cualquier persona podía extraer los
 * emails de todos los usuarios (migración 16 la revocó de anon/authenticated).
 * Ahora se resuelve en el servidor con service_role + rate limit por IP.
 */

const USERNAME_RE = /^[a-zA-Z0-9_]{1,20}$/;

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera un minuto.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  let username: unknown;
  try {
    ({ username } = await request.json());
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
    return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // @ts-expect-error - createClient accepts 3rd options param, but TS version is strict
  const admin = createClient(url, key, {
    db: { schema: 'public' } as const,
    auth: { persistSession: false },
  });

  const { data, error } = await admin.rpc('get_email_by_username', { p_username: username });

  if (error || !data) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ email: data });
}
