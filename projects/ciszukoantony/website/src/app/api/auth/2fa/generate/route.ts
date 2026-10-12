import { NextResponse } from 'next/server';
import { authenticate } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Emite (o reutiliza) el código 2FA de Ciszuko Antony y lo envía por email.
 *
 * Antes esta ruta generaba el código, lo guardaba y hacía `console.log`: el
 * usuario nunca lo recibía. Ahora el resultado del envío forma parte de la
 * respuesta, así que un fallo del proveedor se ve en vez de fingir éxito.
 */
export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const { twoFactorService } = await import('../_lib');
    const result = await twoFactorService().request({ userId: user.userId, email: user.email });
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
