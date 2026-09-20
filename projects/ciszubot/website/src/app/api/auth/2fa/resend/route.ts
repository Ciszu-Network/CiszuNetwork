import { NextResponse } from 'next/server';
import { authenticate } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Reenvía el código respetando enfriamiento y tope (2 reenvíos). */
export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const { twoFactorService } = await import('../_lib');
    const result = await twoFactorService().resend({ userId: user.userId, email: user.email });
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
