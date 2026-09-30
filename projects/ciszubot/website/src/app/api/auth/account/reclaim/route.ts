import { NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { adminClient } from '../../2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Reutiliza el correo de una cuenta ELIMINADA (status 'expired') para crear
 * una cuenta nueva.
 *
 * El UUID y el correo quedan vinculados para siempre: en vez de crear otro
 * usuario se REEMPLAZAN los datos de ese UUID con los del nuevo registro
 * (nombre/username nuevos; el resto del contenido permanece). El cliente
 * muestra antes el disclaimer de "correo de cuenta eliminada".
 *
 * Estados devueltos: `none` (seguir signUp normal), `active` (usar login),
 * `pending` (suspensión: recuperar desde login), `banned` (sanción vigente)
 * o `reclaimed` (datos reemplazados: iniciar sesión con la contraseña nueva
 * y completar la verificación C-XXX XXX).
 */
export async function POST(request: Request) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      username?: string;
      display_name?: string;
    };
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email || !body.password) {
      return NextResponse.json({ success: false, state: 'invalid' }, { status: 400 });
    }

    const admin = adminClient();

    const { data: profile } = await admin
      .schema('ciszubot')
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();
    const userId = (profile as { id?: string } | null)?.id;
    if (!userId) return NextResponse.json({ success: false, state: 'none' });

    const { data: deletion } = await admin
      .schema('public')
      .from('account_deletions')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle();
    const status = (deletion as { status?: string } | null)?.status;
    if (status === 'pending') return NextResponse.json({ success: false, state: 'pending' });
    if (status !== 'expired') return NextResponse.json({ success: false, state: 'active' });

    const { data: bans } = await admin
      .schema('public')
      .from('sanctions')
      .select('expires_at')
      .eq('user_id', userId)
      .eq('type', 'ban');
    const activeBan = ((bans as Array<{ expires_at?: string | null }> | null) ?? []).some(
      (b) => !b.expires_at || Date.parse(b.expires_at) > Date.now(),
    );
    if (activeBan) return NextResponse.json({ success: false, state: 'banned' });

    const username = (body.username ?? '').trim().toLowerCase();
    const displayName = (body.display_name ?? '').trim() || username;

    const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
      password: body.password,
      email_confirm: true,
      data: { username, display_name: displayName },
    });
    if (updateError) throw updateError;

    await admin
      .schema('ciszubot')
      .from('profiles')
      .update({ username, display_name: displayName })
      .eq('id', userId);

    await admin
      .schema('public')
      .from('account_deletions')
      .update({ status: 'recovered', recovered_at: new Date().toISOString(), no_delete_until: null })
      .eq('user_id', userId);

    return NextResponse.json({ success: true, state: 'reclaimed' });
  } catch (err) {
    return NextResponse.json(
      { success: false, state: 'error', error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
