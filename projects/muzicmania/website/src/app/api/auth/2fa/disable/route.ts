import { NextResponse } from 'next/server';
import { authenticate, setTwoFactorEnabled } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Desactiva el 2FA en ESTA web (solo afecta a esta web: el flag es por sitio). */
export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  try {
    await setTwoFactorEnabled(user.userId, false);
    return NextResponse.json({ success: true, enabled: false });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
