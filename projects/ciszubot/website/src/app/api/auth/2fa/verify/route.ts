import { NextResponse } from 'next/server';
import { authenticate } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Verifica el código. Consume el código al acertar, acumula intento al fallar y
 * suspende el acceso al llegar al límite.
 */
export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { code?: string };
    const { twoFactorService } = await import('../_lib');
    const result = await twoFactorService().verify({ userId: user.userId, code: body.code ?? '' });
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
