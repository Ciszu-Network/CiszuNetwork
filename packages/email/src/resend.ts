/**
 * Implementación Resend del EmailProvider.
 * Free plan: 3.000 emails/mes (100/día), 1 dominio verificado. Requiere dominio propio
 * para producción (el dominio de prueba resend.dev solo envía a tu propia dirección).
 * Estrategia: primario cuando exista el dominio (Fase B Cloudflare).
 * Endpoint: POST https://api.resend.com/emails (Bearer token)
 */

import {
  EmailMessage,
  EmailNotConfiguredError,
  EmailProvider,
  EmailProviderUnavailableError,
  EmailResult,
  EmailError,
  normalizeTo,
} from './types';

export const RESEND_API = 'https://api.resend.com';

export interface ResendOptions {
  apiKey?: string;
  /** Remitente con dominio verificado en Resend, p. ej. "Ciszu Network <no-reply@ciszu.network>". */
  from?: string;
  allowUnverified?: boolean;
}

export function createResendProvider(opts: ResendOptions = {}): EmailProvider {
  const apiKey = opts.apiKey ?? process.env.RESEND_API_KEY;
  const from = opts.from ?? process.env.EMAIL_FROM_RESEND ?? process.env.EMAIL_FROM;

  return {
    name: 'resend',
    async send(message: EmailMessage): Promise<EmailResult> {
      if (!apiKey) throw new EmailNotConfiguredError('resend', 'RESEND_API_KEY');
      if (!from) throw new EmailError('Falta EMAIL_FROM_RESEND (o EMAIL_FROM) para Resend');
      if (!opts.allowUnverified && !process.env.RESEND_ALLOW_UNVERIFIED) {
        throw new EmailProviderUnavailableError(
          'resend',
          'requiere dominio verificado en Resend (ver EMAILS_SYSTEM.md). Activa RESEND_ALLOW_UNVERIFIED solo en desarrollo.'
        );
      }
      const to = normalizeTo(message.to);
      const body: Record<string, unknown> = {
        from,
        to: to.map((t) => (t.name ? `${t.name} <${t.email}>` : t.email)),
        subject: message.subject,
        html: message.html,
        text: message.text,
      };
      if (message.replyTo) body.reply_to = message.replyTo.email;

      const res = await fetch(`${RESEND_API}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new EmailError(`Resend rechazó el envío (HTTP ${res.status}): ${detail.slice(0, 300)}`);
      }
      const data = (await res.json().catch(() => ({}))) as { id?: string };
      return { id: data.id ?? 'unknown', provider: 'resend' };
    },
  };
}
