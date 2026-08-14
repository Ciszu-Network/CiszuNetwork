import 'server-only';
import { db, ciszubotSchema } from '@ciszunetwork/db';

/**
 * Log de auditoría del dashboard de CiszuBot (tabla ciszubot.audit_log).
 * Deny-all: SOLO service_role escribe/lee (server-side vía Drizzle/pooler).
 * Nunca lanza: un fallo de auditoría no debe romper el flujo del usuario.
 */
export interface AuditEntry {
  event: 'login' | 'login_failed' | 'logout' | 'config_update';
  actorId?: string | null;
  actorName?: string | null;
  target?: string | null;
  ip?: string | null;
  detail?: Record<string, unknown> | null;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(ciszubotSchema.auditLog).values({
      event: entry.event,
      actorId: entry.actorId ?? null,
      actorName: entry.actorName ?? null,
      target: entry.target ?? null,
      ip: entry.ip ?? null,
      detail: (entry.detail as never) ?? null,
    });
  } catch {
    // Auditoría best-effort: nunca bloquear la operación principal.
  }
}