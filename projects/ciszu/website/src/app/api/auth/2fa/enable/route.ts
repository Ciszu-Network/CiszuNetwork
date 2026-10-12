import { NextResponse } from 'next/server';
import { authenticate, isTwoFactorEnabled, setTwoFactorEnabled } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Activa el 2FA en ESTA web. Exige verificar un código válido primero: si se
 * pudiera activar sin comprobarlo, cualquiera podría bloquear la cuenta de otro
 * activando un 2FA cuya clave solo llega al dueño del email… o al contrario,
 * activarlo y no poder usarlo. Verificar antes garantiza que el canal de email
 * funciona.
 */
export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { code?: string };
    if (!body.code) {
      return NextResponse.json(
        { success: false, state: 'missing-code', error: 'Pide un código y verifícalo para activar el 2FA.' },
        { status: 400 },
      );
    }

    const { twoFactorService } = await import('../_lib');
    const verified = await twoFactorService().verify({ userId: user.userId, code: body.code });
    if (verified.status !== 200) {
      return NextResponse.json(verified.body, { status: verified.status });
    }

    await setTwoFactorEnabled(user.userId, true);
    return NextResponse.json({ success: true, enabled: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}

/** Consulta rápida del estado de activación. */
export async function GET(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }
  try {
    return NextResponse.json({ success: true, enabled: await isTwoFactorEnabled(user.userId) });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
