/**
 * Selección y failover de proveedor de email.
 *
 * Env vars:
 *   EMAIL_PROVIDER        brevo (default) | resend
 *   EMAIL_FAILOVER        "1" para reenviar por el proveedor secundario si el primario falla
 *   BREVO_API_KEY         key API v3 de Brevo (primario actual)
 *   RESEND_API_KEY        key API de Resend (primario cuando exista dominio)
 *   EMAIL_FROM            remitente, p. ej. "Ciszu Network <sender@verificado>"
 *   EMAIL_FROM_RESEND     remitente para Resend (debe ser del dominio verificado)
 */

import { EmailMessage, EmailProvider, EmailResult } from './types';
import { createBrevoProvider } from './brevo';
import { createResendProvider } from './resend';

export * from './types';
export { createBrevoProvider, BREVO_API } from './brevo';
export { createResendProvider, RESEND_API } from './resend';

export function getEmailProvider(): EmailProvider {
  const name = (process.env.EMAIL_PROVIDER ?? 'brevo').toLowerCase();
  if (name === 'resend') return createResendProvider();
  return createBrevoProvider();
}

export function getFallbackProvider(): EmailProvider | null {
  const primary = (process.env.EMAIL_PROVIDER ?? 'brevo').toLowerCase();
  if (primary === 'resend') {
    return process.env.BREVO_API_KEY ? createBrevoProvider() : null;
  }
  return process.env.RESEND_API_KEY ? createResendProvider() : null;
}

/**
 * Envía un email con failover opcional:
 *  - primario = EMAIL_PROVIDER (default brevo)
 *  - si falla y EMAIL_FAILOVER=1, reenvía por el otro proveedor si está configurado.
 * Lanza EmailError si ambos fallan (con la causa del primero).
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const primary = getEmailProvider();
  try {
    return await primary.send(message);
  } catch (primaryError) {
    const fallback = process.env.EMAIL_FAILOVER === '1' ? getFallbackProvider() : null;
    if (!fallback) throw primaryError;
    try {
      return await fallback.send(message);
    } catch (fallbackError) {
      const err = new Error(
        `Email falló en primario (${primary.name}) y fallback (${fallback.name})`
      ) as Error & { causes?: unknown[] };
      err.causes = [primaryError, fallbackError];
      throw err;
    }
  }
}
