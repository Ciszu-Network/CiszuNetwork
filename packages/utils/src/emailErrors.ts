/**
 * emailErrors — detección de fallos de email y mensajes de cara al usuario.
 *
 * Regla: los detalles técnicos (cupo diario de Gmail, códigos SMTP, proveedor)
 * son SOLO para staff/logs. Al usuario final se le da un mensaje genérico
 * ("Email en mantenimiento") para no exponer información operativa.
 */

/** Gmail rechaza con `550 5.4.5 Daily user sending limit exceeded` (o variantes
 *  de quota/rate) al agotar el cupo diario de la cuenta (~500/día; 2.000 en
 *  Workspace). No hay API para consultar el cupo: se detecta al recibir el
 *  rechazo del servidor. */
export function isGmailDailyLimit(text: string): boolean {
  return /5\.4\.5|daily user sending limit|sending limit exceeded|daily[^\n]{0,20}quota|quota exceeded|too many messages|rate limited/i.test(
    text,
  );
}

/** Mensaje GENÉRICO de cara al usuario cuando el email está caído (sin detalle técnico). */
export const EMAIL_MAINTENANCE_USER_ERROR =
  'Email en mantenimiento. Inténtalo de nuevo más tarde.';

/** Si el fallo técnico es un límite/caída de email, devuelve el mensaje genérico; si no, null. */
export function userErrorForEmailFailure(text: string): string | null {
  return isGmailDailyLimit(text) ? EMAIL_MAINTENANCE_USER_ERROR : null;
}

export interface PublishAdvisorOptions {
  url: string;
  serviceKey: string;
  /** Horas de vigencia del aviso (default 24h — el cupo se reinicia a diario). */
  hours?: number;
  fetchImpl?: typeof fetch;
}

/** Aviso GLOBAL (advisor kind=error) que se publica cuando el email cae. */
export const EMAIL_MAINTENANCE_ADVISOR_MESSAGE =
  'Email en mantenimiento: el envío de correos está pausado temporalmente. Si necesitas un código de acceso o un enlace, inténtalo de nuevo más tarde.';

const ADVISOR_SOURCE = 'email-transport';

/**
 * Publica (una sola vez) el aviso de mantenimiento de email en el sistema de
 * advisors (`ciszunetwork.global_announcements`), que las 4 webs muestran como
 * toast kind=error. Dedupe por `source` mientras haya uno vigente.
 * Fire-and-forget: NUNCA rompe el flujo de envío (errores se tragan).
 */
export async function publishEmailMaintenanceAdvisor(opts: PublishAdvisorOptions): Promise<void> {
  const doFetch = opts.fetchImpl ?? fetch;
  const hours = opts.hours ?? 24;
  const headers: Record<string, string> = {
    apikey: opts.serviceKey,
    Authorization: `Bearer ${opts.serviceKey}`,
    'Content-Type': 'application/json',
    'Accept-Profile': 'ciszunetwork',
    'Content-Profile': 'ciszunetwork',
  };
  try {
    const nowIso = new Date().toISOString();
    const existing = await doFetch(
      `${opts.url}/rest/v1/global_announcements?source=eq.${ADVISOR_SOURCE}&expires_at=gt.${nowIso}&select=id&limit=1`,
      { headers, cache: 'no-store' },
    );
    if (existing.ok) {
      const rows = (await existing.json().catch(() => [])) as unknown[];
      if (Array.isArray(rows) && rows.length > 0) return; // ya hay uno vigente
    }
    const expires = new Date(Date.now() + hours * 3_600_000).toISOString();
    await doFetch(`${opts.url}/rest/v1/global_announcements`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({
        sender: 'system',
        source: ADVISOR_SOURCE,
        message: EMAIL_MAINTENANCE_ADVISOR_MESSAGE,
        kind: 'error',
        target: 'global',
        expires_at: expires,
      }),
    });
  } catch {
    /* el aviso nunca debe romper el flujo */
  }
}
