import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkBotId } from 'botid/server';
import { adminClient, authenticate } from '../../2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Solicitud de eliminación de cuenta (Danger Zone).
 *
 * La cuenta NO se borra: pasa a suspensión de 15 días (desindexada y
 * anonimizada públicamente), con respaldo en `account_deletions.backup`.
 * Exige contraseña (re-autenticación server-side), username exacto y la
 * palabra ELIMINAR. El UUID y el correo quedan vinculados para siempre.
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
    const body = (await request.json().catch(() => ({}))) as {
      password?: string;
      username?: string;
      phrase?: string;
    };
    if (!body.password) {
      return NextResponse.json({ success: false, error: 'Falta la contraseña.' }, { status: 400 });
    }
    if ((body.phrase ?? '').trim().toUpperCase() !== 'ELIMINAR') {
      return NextResponse.json({ success: false, error: 'Escribe ELIMINAR para confirmar.' }, { status: 400 });
    }

    // Re-autenticación con la contraseña actual (cliente anónimo, server-side).
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const auth = await anon.auth.signInWithPassword({ email: user.email, password: body.password });
    if (auth.error) {
      return NextResponse.json({ success: false, error: 'La contraseña no es correcta.' }, { status: 400 });
    }

    const admin = adminClient();
    const current = (await admin.auth.getUser(user.token)) as unknown as {
      data: { user: { user_metadata?: Record<string, unknown> | null } | null };
    };
    const metadata = current.data.user?.user_metadata ?? {};
    const storedUsername = typeof metadata.username === 'string' ? metadata.username : '';
    if (!storedUsername || (body.username ?? '').trim().toLowerCase() !== storedUsername.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'El nombre de usuario no coincide.' }, { status: 400 });
    }

    const { data: existing } = await admin
      .from('account_deletions')
      .select('status, no_delete_until')
      .eq('user_id', user.userId)
      .maybeSingle();
    const previous = (existing ?? {}) as { status?: string; no_delete_until?: string };
    if (
      previous.status === 'recovered' &&
      previous.no_delete_until &&
      Date.parse(previous.no_delete_until) > Date.now()
    ) {
      return NextResponse.json(
        { success: false, error: 'Recuperaste tu cuenta hace poco: no puedes eliminarla de nuevo hasta que pasen 30 días.' },
        { status: 403 },
      );
    }

    const now = Date.now();
    const expiresAt = new Date(now + 15 * 24 * 60 * 60 * 1000).toISOString();

    const { data: profileRow } = await admin
      .schema('ciszukoantony')
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.userId)
      .maybeSingle();
    const { error: insertError } = await admin
      .from('account_deletions')
      .upsert(
        {
          user_id: user.userId,
          requested_at: new Date(now).toISOString(),
          expires_at: expiresAt,
          status: 'pending',
          recovered_at: null,
          no_delete_until: null,
          backup: {
            display_name: metadata.display_name ?? null,
            username: storedUsername,
            avatar_url: (profileRow as { avatar_url?: string | null } | null)?.avatar_url ?? null,
            removed_public_at: new Date(now).toISOString(),
          },
        },
        { onConflict: 'user_id' },
      );
    if (insertError) throw insertError;

    // Anonimización pública (el respaldo permite restaurarla al recuperar).
    const suffix = Math.floor(Math.random() * 1e12)
      .toString()
      .padStart(12, '0');
    const deletedUsername = `deleted-account-${suffix}`;
    const { error: updateError } = await admin.auth.admin.updateUserById(user.userId, {
      data: { ...metadata, display_name: 'Deleted Account', username: deletedUsername },
    });
    if (updateError) throw updateError;

    // El perfil público de la web también se anonimiza (nombre/usuario/avatar).
    const { error: profileError } = await admin
      .schema('ciszukoantony')
      .from('profiles')
      .update({ display_name: 'Deleted Account', username: deletedUsername, avatar_url: null })
      .eq('id', user.userId);
    if (profileError && !String(profileError.message).includes('avatar_url')) throw profileError;

    return NextResponse.json({ success: true, expiresAt });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
