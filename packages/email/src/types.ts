/**
 * Tipos base del sistema de emails de Ciszu Network.
 * Estrategia (11 ago 2026, ver projects/ciszu/docs/documentation/EMAILS_SYSTEM.md):
 *   - HOY (sin dominio propio): los emails de AUTH usan el SMTP nativo de Supabase.
 *     El paquete @ciszunetwork/email NO tiene proveedor transaccional activo todavía
 *     (Resend exige dominio verificado — Fase B Cloudflare). Brevo fue DESCARTADO.
 *   - CON DOMINIO (Fase B Cloudflare): Resend como único proveedor (3.000/mes free,
 *     SPF/DKIM automáticos).
 */

export interface EmailAddress {
  name?: string;
  email: string;
}

export interface EmailMessage {
  /** Destinatario(s). Acepta email simple o con nombre. */
  to: string | EmailAddress | Array<string | EmailAddress>;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: EmailAddress;
}

export interface EmailResult {
  /** Id devuelto por el proveedor. */
  id: string;
  provider: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailResult>;
}

/** Error con causa clara (config faltante, rechazo del proveedor, fallo de red...). */
export class EmailError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'EmailError';
  }
}

/** Error de configuración: el proveedor pedido no tiene API key en el entorno. */
export class EmailNotConfiguredError extends EmailError {
  constructor(provider: string, envKey: string) {
    super(`EmailProvider '${provider}' no configurado: falta la env var ${envKey}`);
    this.name = 'EmailNotConfiguredError';
  }
}

/** Proveedor que no debe usarse todavía (p. ej. Resend sin dominio verificado). */
export class EmailProviderUnavailableError extends EmailError {
  constructor(provider: string, reason: string) {
    super(`EmailProvider '${provider}' no disponible: ${reason}`);
    this.name = 'EmailProviderUnavailableError';
  }
}

export function normalizeTo(
  to: EmailMessage['to']
): Array<{ name?: string; email: string }> {
  const list = Array.isArray(to) ? to : [to];
  return list.map((entry) =>
    typeof entry === 'string' ? { email: entry } : { email: entry.email, name: entry.name }
  );
}

export function formatFrom(from: EmailAddress | string): string {
  if (typeof from === 'string') return from;
  return from.name ? `${from.name} <${from.email}>` : from.email;
}
