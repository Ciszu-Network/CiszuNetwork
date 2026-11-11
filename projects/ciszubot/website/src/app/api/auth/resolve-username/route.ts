import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, ciszubotSchema, eq, sql } from '@ciszunetwork/db';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_]{1,32}$/, 'Usuario inválido'),
});

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera un minuto.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } },
    );
  }

  const parsed = await parseJsonBody(request, schema);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }

  const profiles = ciszubotSchema.profiles;
  const rows = await db
    .select({ email: profiles.email })
    .from(profiles)
    .where(eq(sql`lower(${profiles.username})`, parsed.data.username.toLowerCase()))
    .limit(1);

  const row = rows[0];
  if (!row?.email) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  return NextResponse.json({ email: row.email });
}
