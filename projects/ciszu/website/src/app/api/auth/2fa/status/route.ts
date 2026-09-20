import { NextResponse } from 'next/server';
import { authenticate, isTwoFactorEnabled } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Estado del 2FA en ESTA web: si está activado y en qué punto va el código
 * (minutos restantes, intentos, reenvíos disponibles).
 */
export async function GET(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const { twoFactorService } = await import('../_lib');
    const [enabled, result] = await Promise.all([
      isTwoFactorEnabled(user.userId),
      twoFactorService().status({ userId: user.userId }),
    ]);
    return NextResponse.json({ ...result.body, enabled }, { status: result.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
