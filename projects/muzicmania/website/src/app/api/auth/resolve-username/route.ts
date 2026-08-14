import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, muzicmaniaSchema, eq, sql } from '@ciszunetwork/db';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';

/**
 * Resuelve un @username al email de la cuenta (flujo de login de MuzicMania).
 *
 * Antes esta resolución se hacía con la RPC pública `get_email_by_username`
 * usando la anon key desde el navegador — cualquier persona podía extraer los
 * emails de todos los usuarios (migración 16 la revocó de anon/authenticated).
 * Ahora se resuelve en el servidor con Drizzle (service role vía pooler) +
 * rate limit por IP.
 */

const resolveUsernameSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_]{1,20}$/, 'Usuario inválido'),
});

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

  const parsed = await parseJsonBody(request, resolveUsernameSchema);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const { username } = parsed.data;

  const profiles = muzicmaniaSchema.profiles;
  const rows = await db
    .select({ email: profiles.email })
    .from(profiles)
    .where(eq(sql`lower(${profiles.username})`, username.toLowerCase()))
    .limit(1);

  const row = rows[0];
  if (!row?.email) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ email: row.email });
}
