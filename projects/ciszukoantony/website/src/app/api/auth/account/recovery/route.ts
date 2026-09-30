import { NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { adminClient, authenticate } from '../../2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Recuperación dentro de los 15 días de suspensión.
 *
 * Con `accept: true` la cuenta vuelve (se restauran display_name y username
 * desde el respaldo) y no podrá eliminarse de nuevo durante 30 días
 * (`no_delete_until`). Con `accept: false` no se otorga nada: el cliente
 * cierra la sesión. Pasados los 15 días la recuperación ya no es posible.
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
    const body = (await request.json().catch(() => ({}))) as { accept?: boolean };
    const admin = adminClient();

    if (body.accept !== true) {
      return NextResponse.json({ success: true, recovered: false });
    }

    const { data: row } = await admin
      .from('account_deletions')
      .select('backup, status, expires_at')
      .eq('user_id', user.userId)
      .maybeSingle();
    const record = (row ?? {}) as { backup?: Record<string, unknown>; status?: string; expires_at?: string };
    if (record.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'No hay una eliminación pendiente.' }, { status: 400 });
    }
    if (record.expires_at && Date.parse(record.expires_at) < Date.now()) {
      return NextResponse.json({ success: false, error: 'El periodo de recuperación expiró.' }, { status: 400 });
    }

    const backup = (record.backup ?? {}) as Record<string, unknown>;
    const now = Date.now();
    const { error: updateError } = await admin
      .from('account_deletions')
      .update({
        status: 'recovered',
        recovered_at: new Date(now).toISOString(),
        no_delete_until: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('user_id', user.userId);
    if (updateError) throw updateError;

    const current = (await admin.auth.getUser(user.token)) as unknown as {
      data: { user: { user_metadata?: Record<string, unknown> | null } | null };
    };
    const metadata = current.data.user?.user_metadata ?? {};
    const restore: Record<string, unknown> = {};
    if (typeof backup.display_name === 'string') restore.display_name = backup.display_name;
    if (typeof backup.username === 'string') restore.username = backup.username;

    const { error: restoreError } = await admin.auth.admin.updateUserById(user.userId, {
      data: { ...metadata, ...restore },
    });
    if (restoreError) throw restoreError;

    // Restaura el perfil público de la web (nombre/usuario respaldados).
    const profileRestore: Record<string, unknown> = {};
    if (typeof backup.display_name === 'string') profileRestore.display_name = backup.display_name;
    if (typeof backup.username === 'string') profileRestore.username = backup.username;
    if (typeof backup.avatar_url === 'string' && backup.avatar_url) profileRestore.avatar_url = backup.avatar_url;
    if (Object.keys(profileRestore).length > 0) {
      await admin.schema('ciszukoantony').from('profiles').update(profileRestore).eq('id', user.userId);
    }

    return NextResponse.json({ success: true, recovered: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
