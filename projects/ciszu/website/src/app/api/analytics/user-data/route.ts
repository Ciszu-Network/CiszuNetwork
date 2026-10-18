import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * UPD (datos proporcionados por el usuario) para GA4.
 *
 * Resuelve la sesión (Bearer de Supabase), obtiene el email del usuario y:
 *   · devuelve su SHA-256 normalizado al cliente (que lo empuja al dataLayer),
 *   · lo envía a GA4 por Measurement Protocol con `user_data` para que la
 *     propiedad reciba UPD y se limpien los diagnósticos de Analytics.
 * Sin sesión responde 200 con nulls (nunca rompe la página).
 */
const MP_SECRET = process.env.GA4_MEASUREMENT_PROTOCOL_SECRET_CISZU;
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

const sha256 = (v: string): string => createHash('sha256').update(v).digest('hex');

export async function GET(request: Request) {
  const user = await authenticate(request);
  const userId: string | null = user?.userId ?? null;
  const email = user?.email ?? '';

  if (!email) {
    return NextResponse.json({ user_id: userId, email_sha256: null }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const emailSha = sha256(email.trim().toLowerCase());

  // UPD a GA4 por Measurement Protocol (fire-and-forget).
  // Formato oficial: user_data va en el NIVEL RAÍZ del payload y
  // sha256_email_address es un ARRAY de strings.
  if (MEASUREMENT_ID && MP_SECRET) {
    void fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${MP_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: userId ?? 'anon',
          user_id: userId ?? undefined,
          user_data: { sha256_email_address: [emailSha] },
          events: [
            {
              name: 'user_data_sync',
              params: { engagement_time_msec: 1 },
            },
          ],
        }),
      },
    ).catch(() => undefined);
  }

  return NextResponse.json({ user_id: userId, email_sha256: emailSha }, { headers: { 'Cache-Control': 'no-store' } });
}
