/**
 * Selección y failover de proveedor de email.
 *
 * Env vars:
 *   EMAIL_PROVIDER        resend (único hoy; requiere dominio verificado — Fase B)
 *   RESEND_API_KEY        key API de Resend (primario cuando exista dominio)
 *   EMAIL_FROM            remitente, p. ej. "Ciszu Network <sender@dominio-verificado>"
 *   EMAIL_FROM_RESEND     remitente para Resend (debe ser del dominio verificado)
 */

import { EmailMessage, EmailProvider, EmailResult } from './types';
import { createResendProvider } from './resend';

export * from './types';
export { createResendProvider, RESEND_API } from './resend';

export function getEmailProvider(): EmailProvider {
  return createResendProvider();
}

export function getFallbackProvider(): EmailProvider | null {
  return null;
}

/**
 * Envía un email de negocio.
 *
 * ⚠️ HOY (11 ago 2026) sin dominio propio ni cuenta Resend activa, el sistema no
 * tiene proveedor transaccional: sendEmail() lanza EmailProviderUnavailableError
 * (Resend exige dominio verificado). Los emails de AUTH (reset de contraseña,
 * confirmación, OTP) ya funcionan vía SMTP nativo de Supabase, sin pasar por aquí.
 * Cuando exista dominio (Fase B Cloudflare) se activa `RESEND_API_KEY` + remitente.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  return getEmailProvider().send(message);
}