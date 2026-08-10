/**
 * Implementación Brevo (antes Sendinblue) del EmailProvider.
 * Free plan: 300 emails/día, para siempre, sin tarjeta. SMTP + API v3.
 * Autenticación: header `api-key`. Endpoint: POST /v3/smtp/email
 * Docs: https://developers.brevo.com/reference/sendtransacemail
 */

import {
  EmailMessage,
  EmailNotConfiguredError,
  EmailProvider,
  EmailResult,
  EmailError,
  normalizeTo,
} from './types';

export const BREVO_API = 'https://api.brevo.com/v3';

export interface BrevoOptions {
  apiKey?: string;
  /** Remitente. En free sin dominio debe ser un sender verificado en Brevo (código de 6 dígitos). */
  from?: { name?: string; email: string };
}

export function createBrevoProvider(opts: BrevoOptions = {}): EmailProvider {
  const apiKey = opts.apiKey ?? process.env.BREVO_API_KEY;
  const from = opts.from ?? parseFromEnv();

  function parseFromEnv(): { name?: string; email: string } | undefined {
    const raw = process.env.EMAIL_FROM;
    if (!raw) return undefined;
    const match = raw.match(/^(.*?)\s*<([^>]+)>$/);
    if (match) return { name: match[1].trim(), email: match[2] };
    return { email: raw.trim() };
  }

  return {
    name: 'brevo',
    async send(message: EmailMessage): Promise<EmailResult> {
      if (!apiKey) throw new EmailNotConfiguredError('brevo', 'BREVO_API_KEY');
      if (!from) throw new EmailError('Falta EMAIL_FROM en el entorno');
      const to = normalizeTo(message.to);
      const body: Record<string, unknown> = {
        sender: { name: from.name ?? 'Ciszu Network', email: from.email },
        to: to.map((t) => ({ email: t.email, name: t.name })),
        subject: message.subject,
        textContent: message.text,
        htmlContent: message.html,
      };
      if (message.replyTo) body.replyTo = message.replyTo;

      const res = await fetch(`${BREVO_API}/smtp/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new EmailError(`Brevo rechazó el envío (HTTP ${res.status}): ${detail.slice(0, 300)}`);
      }
      const data = (await res.json().catch(() => ({}))) as { messageId?: string };
      return { id: data.messageId ?? 'unknown', provider: 'brevo' };
    },
  };
}
