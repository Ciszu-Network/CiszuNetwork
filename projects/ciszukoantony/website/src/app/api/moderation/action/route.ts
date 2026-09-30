import { NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { adminClient, authenticate, verifyStaffElevation } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Jerarquía: owner > admin > mod = bot. Rango igual o mayor no se modera (el owner sí a owner). */
const RANK: Record<string, number> = { owner: 100, admin: 50, mod: 30, bot: 30 };
const SITE = 'ciszukoantony';
const ACTIONS = ['ban', 'mute', 'unban', 'unmute', 'delete_review', 'edit_bio'] as const;

/**
 * Acciones de moderación desde la web (vista de staff). Todo pasa por RBAC
 * (user_roles por website), jerarquía con protecciones (owner/bot solo owner)
 * y auditoría completa en `moderation_actions` (autor, fecha, motivo).
 * `edit_bio` y (a nivel operativo) los cambios de perfil requieren admin+.
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
      action?: string;
      targetId?: string;
      reason?: string;
      hours?: number;
      text?: string;
    };
    const action = (body.action ?? '') as (typeof ACTIONS)[number];
    const targetId = (body.targetId ?? '').trim();
    if (!ACTIONS.includes(action) || !targetId) {
      return NextResponse.json({ success: false, error: 'Acción inválida.' }, { status: 400 });
    }
    if (targetId === user.userId && action !== 'unban' && action !== 'unmute') {
      return NextResponse.json({ success: false, error: 'No puedes moderarte a ti mism@.' }, { status: 400 });
    }

    const admin = adminClient();

    const actorRows = await admin
      .schema('public')
      .from('user_roles')
      .select('role')
      .eq('user_id', user.userId)
      .eq('website', SITE)
      .maybeSingle();
    const actorRole = (actorRows.data as { role?: string } | null)?.role ?? null;
    const actorRank = RANK[actorRole ?? ''] ?? 0;
    if (actorRank < 30) {
      return NextResponse.json({ success: false, error: 'Sin permisos de moderación.' }, { status: 403 });
    }

    // Step-up obligatorio: sesión de elevación temporal (código generado en devcon).
    if (!verifyStaffElevation(user.userId, request.headers.get('x-staff-elevation'))) {
      return NextResponse.json(
        {
          success: false,
          error: 'step_up_required',
          message: 'Necesitas una sesión step-up: genera una clave en la devcon y verifícala en Configuración.',
        },
        { status: 401 },
      );
    }

    const targetRows = await admin
      .schema('public')
      .from('user_roles')
      .select('role')
      .eq('user_id', targetId)
      .eq('website', SITE)
      .maybeSingle();
    const targetRole = (targetRows.data as { role?: string } | null)?.role ?? null;
    const targetRank = RANK[targetRole ?? ''] ?? 0;

    if ((targetRole === 'bot' || targetRole === 'owner') && actorRank < 100) {
      return NextResponse.json(
        { success: false, error: 'Protegido: solo el owner puede moderar esta cuenta.' },
        { status: 403 },
      );
    }
    if (targetRank >= actorRank && actorRank < 100) {
      return NextResponse.json(
        { success: false, error: 'No puedes moderar a un rango igual o superior.' },
        { status: 403 },
      );
    }
    if (action === 'edit_bio' && actorRank < 50) {
      return NextResponse.json(
        { success: false, error: 'Editar la bio requiere rango admin.' },
        { status: 403 },
      );
    }

    const reason = (body.reason ?? '').trim();
    const expiresAt =
      typeof body.hours === 'number' && body.hours > 0
        ? new Date(Date.now() + body.hours * 3600 * 1000).toISOString()
        : null;
    const actor = `staff:${user.email}`;

    // Alertas push (ntfy) y detección de anomalías: picos de acciones del actor.
    const notify = (text: string) => {
      const topic = process.env.NOTIFY_TOPIC;
      if (topic) void fetch(`https://ntfy.sh/${topic}`, { method: 'POST', body: text }).catch(() => {});
    };
    try {
      const recent = await admin
        .schema('public')
        .from('moderation_actions')
        .select('created_at')
        .eq('actor', actor)
        .order('created_at', { ascending: false })
        .limit(10);
      const recentRows = (recent.data as Array<{ created_at: string }> | null) ?? [];
      const last10 = recentRows.filter((r) => Date.now() - Date.parse(r.created_at) < 10 * 60 * 1000).length;
      if (last10 >= 6) {
        notify(`[ALERTA] ${SITE}: ${actor} supero el limite de acciones (${last10} en 10 min). Bloqueado.`);
        return NextResponse.json(
          { success: false, error: 'Demasiadas acciones seguidas. Espera unos minutos (quedó registrado).' },
          { status: 429 },
        );
      }
      if (last10 >= 3) {
        notify(`[aviso] ${SITE}: ${actor} acumula ${last10} acciones de moderación en 10 min.`);
      }
    } catch {
      /* la detección nunca debe bloquear una operación legítima por un fallo */
    }

    const logAction = async (details: Record<string, unknown> = {}) => {
      await admin.schema('public').from('moderation_actions').insert({
        website: SITE,
        target_user_id: targetId,
        actor,
        action,
        reason,
        details,
        expires_at: expiresAt,
      });
      notify(`[moderación] ${SITE}: ${action} sobre ${targetId} por ${actor}${reason ? ' · ' + reason : ''}`);
    };

    if (action === 'ban' || action === 'mute') {
      if (!reason) {
        return NextResponse.json({ success: false, error: 'La sanción exige un motivo.' }, { status: 400 });
      }
      const ins = await admin.schema('public').from('sanctions').insert({
        user_id: targetId,
        type: action,
        scope: 'global',
        reason,
        actor,
        expires_at: expiresAt,
      });
      if (ins.error) throw ins.error;
      await logAction();
      return NextResponse.json({ success: true });
    }

    if (action === 'unban' || action === 'unmute') {
      const type = action === 'unban' ? 'ban' : 'mute';
      const upd = await admin
        .schema('public')
        .from('sanctions')
        .update({ expires_at: new Date().toISOString() })
        .eq('user_id', targetId)
        .eq('type', type);
      if (upd.error) throw upd.error;
      await logAction();
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_review') {
      const del = await admin.schema(SITE).from('reviews').delete().eq('user_id', targetId);
      if (del.error) throw del.error;
      await logAction({ all: true });
      return NextResponse.json({ success: true });
    }

    if (action === 'edit_bio') {
      const text = (body.text ?? '').trim();
      const upd = await admin.schema(SITE).from('profiles').update({ bio: text || null }).eq('id', targetId);
      if (upd.error) {
        throw new Error('Esta web no tiene campo bio o falló la edición: ' + upd.error.message);
      }
      await logAction({ text });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Acción no soportada.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
