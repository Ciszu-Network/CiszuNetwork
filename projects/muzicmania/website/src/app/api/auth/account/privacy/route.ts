import { NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { adminClient, authenticate } from '../../2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEVELS = ['public', 'friends', 'private'] as const;

/**
 * Privacidad del perfil: 'public' (todo), 'friends' (datos detallados solo
 * para amigos) o 'private' (solo el dueño). Los datos básicos del perfil
 * (nombre, foto, bio) siguen visibles en todos los niveles. Aplicado
 * especialmente en el perfil público de muzicmania.
 */
export async function POST(request: Request) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const user = await authenticate(request);
  if (!user) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });

  try {
    const body = (await request.json().catch(() => ({}))) as { visibility?: string };
    const visibility = (body.visibility ?? '').trim();
    if (!LEVELS.includes(visibility as (typeof LEVELS)[number])) {
      return NextResponse.json({ success: false, error: 'Nivel inválido.' }, { status: 400 });
    }

    const admin = adminClient();
    const { error } = await admin
      .schema('public')
      .from('account_privacy')
      .upsert(
        { user_id: user.userId, visibility, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
    if (error) throw error;

    return NextResponse.json({ success: true, visibility });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
