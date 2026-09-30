import { NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { adminClient, authenticate, setTwoFactorEnabled } from '../../2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cierra el registro tras verificar el código C-XXX XXX.
 *
 * El código ya se consumió en `/api/auth/2fa/verify`; aquí se confirma el
 * email en Supabase (permite el primer inicio de sesión) y se activa el OTP
 * de ESTA web: los próximos logins pedirán C-XXX XXX (desactivable luego en
 * la configuración de la cuenta). Si el usuario no completa la verificación,
 * la cuenta queda sin confirmar y el login es imposible: la cuenta no llega
 * a existir de forma utilizable.
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
    const { error } = await adminClient().auth.admin.updateUserById(user.userId, {
      email_confirm: true,
    });
    if (error) throw error;

    await setTwoFactorEnabled(user.userId, true);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
