import { createHmac } from 'crypto';

/**
 * Clave de firma de los tokens del launcher.
 *
 * Prioridad:
 * 1. `LAUNCHER_SESSION_SECRET` (dedicada, recomendada).
 * 2. `STAFF_ELEVATION_SECRET` (ya usada por el step-up de staff).
 * 3. Derivada del service_role con HMAC y contexto propio: nunca se usa la
 *    service_role directamente como clave y no requiere configuración extra.
 */
export function launcherSecret(): string | null {
  const direct = process.env.LAUNCHER_SESSION_SECRET || process.env.STAFF_ELEVATION_SECRET;
  if (direct) return direct;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!service) return null;
  return createHmac('sha256', service).update('ciszu-launcher-notifications-key').digest('hex');
}
