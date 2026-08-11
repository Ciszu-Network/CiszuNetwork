import 'server-only';
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Log de auditoría del dashboard de CiszuBot (tabla ciszubot.audit_log).
 * Deny-all: SOLO service_role escribe/lee (server-side).
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
    const db = supabaseAdmin();
    await db.from('audit_log').insert({
      event: entry.event,
      actor_id: entry.actorId ?? null,
      actor_name: entry.actorName ?? null,
      target: entry.target ?? null,
      ip: entry.ip ?? null,
      detail: entry.detail ?? null,
    });
  } catch {
    // Auditoría best-effort: nunca bloquear la operación principal.
  }
}