import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, getGuildsForUser, isGuildAdmin } from '@/lib/auth';
import { db, ciszubotSchema, and, desc, eq } from '@ciszunetwork/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Historial de cambios (auditoría `ciszubot.audit_log`, evento config_update):
 *  - `?guildId=<id>` → cambios de ese servidor (solo admins del servidor).
 *  - sin parámetro   → cambios hechos por la cuenta (todos sus servidores).
 * Devuelve hasta 50 entradas con fecha, actor (id), campos tocados y features.
 */
export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'no_auth' }, { status: 401 });

  const auditLog = ciszubotSchema.auditLog;
  const guildId = req.nextUrl.searchParams.get('guildId');

  if (guildId) {
    const guilds = await getGuildsForUser(userId);
    const guild = guilds.find((g) => g.id === guildId);
    if (!guild || !isGuildAdmin(guild)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const rows = await db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.event, 'config_update'), eq(auditLog.target, guildId)))
      .orderBy(desc(auditLog.createdAt))
      .limit(50);
    return NextResponse.json({ entries: rows });
  }

  const rows = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.event, 'config_update'), eq(auditLog.actorId, userId)))
    .orderBy(desc(auditLog.createdAt))
    .limit(50);

  // Nombres de servidor para mostrar (best-effort, sin bloquear).
  const guilds = await getGuildsForUser(userId);
  const nameById = new Map(guilds.map((g) => [g.id, g.name]));
  return NextResponse.json({
    entries: rows.map((r) => ({ ...r, guildName: nameById.get(r.target ?? '') ?? null })),
  });
}
