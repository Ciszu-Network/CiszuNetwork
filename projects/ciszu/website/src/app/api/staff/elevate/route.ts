import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { checkBotId } from 'botid/server';
import { adminClient, authenticate, signStaffElevation } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Duración de la sesión de elevación (step-up). */
const SESSION_MINUTES = 45;

/**
 * Step-up de staff: valida un código de un solo uso (generado en la devcon,
 * hash en `staff_elevations`) y emite una sesión de elevación temporal firmada
 * (HMAC, sin estado) que habilita las acciones de moderación durante 45 min.
 */
export async function POST(request: Request) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { code?: string };
    const code = (body.code ?? '').trim();
    if (code.length < 8) {
      return NextResponse.json({ success: false, error: 'Código inválido.' }, { status: 400 });
    }

    const codeHash = createHash('sha256').update(code).digest('hex');
    const admin = adminClient();
    const { data: rows } = await admin
      .schema('public')
      .from('staff_elevations')
      .select('id, code_hash, expires_at, used_at')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const now = Date.now();
    const list =
      (rows as Array<{ id: string; code_hash: string; expires_at: string; used_at: string | null }> | null) ?? [];
    const match = list.find(
      (r) => !r.used_at && Date.parse(r.expires_at) > now && r.code_hash === codeHash,
    );
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Código step-up inválido, expirado o ya usado.' },
        { status: 400 },
      );
    }

    await admin
      .schema('public')
      .from('staff_elevations')
      .update({ used_at: new Date(now).toISOString() })
      .eq('id', match.id);

    const expMs = now + SESSION_MINUTES * 60 * 1000;
    const token = signStaffElevation(user.userId, expMs);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Step-up no configurado en esta web.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, token, expiresAt: new Date(expMs).toISOString() });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
