/**
 * Plantillas y envío de los emails PROPIOS de Ciszu Network.
 *
 * POR QUÉ: los correos de autenticación salían con el remitente "Supabase" y el
 * diseño por defecto, lo que hacía que parecieran phishing precisamente en los
 * emails que piden una acción de seguridad. Además no llevaban ni términos ni
 * la aclaración de que no son publicidad (y los de marketing deben decir lo
 * contrario de forma explícita).
 *
 * Reglas que aplica este módulo:
 *   - Remitente y asunto siempre `Ciszu Network | <web>`.
 *   - Diseño propio (tabla + estilos en línea: es lo único que respetan todos
 *     los clientes de correo, Outlook incluido).
 *   - Pie con términos, privacidad y "esto no es publicidad" (o el aviso
 *     contrario si el mensaje SÍ es de marketing).
 *
 * El transporte es Resend por HTTP directo a propósito: añadir
 * `@ciszunetwork/email` como dependencia de las 4 webs obligaba a rehacer la
 * instalación del monorepo, y este paquete no debe arrastrar dependencias
 * nuevas. Sin `RESEND_API_KEY` el envío devuelve `sent: false` con el motivo en
 * vez de fingir éxito.
 */

export const EMAIL_BRAND_NAME = 'Ciszu Network';

/** Enlaces legales canónicos: los mismos que usa la web. */
export const EMAIL_LEGAL_LINKS = {
  terms: 'https://ciszunetwork.vercel.app/terms',
  privacy: 'https://ciszunetwork.vercel.app/privacy',
  support: 'https://ciszunetwork.vercel.app/support',
  home: 'https://ciszunetwork.vercel.app',
} as const;

export interface BrandedEmailInput {
  /** Nombre de la web que envía (CiszuBot, MuzicMania...). */
  siteName: string;
  /** Título visible, en mayúsculas cortas ("Verifica tu identidad"). */
  title: string;
  /** Párrafo(s) de introducción. Se acepta texto plano. */
  intro: string;
  /** Código a mostrar en grande (p. ej. `C-123 434`). */
  code?: string;
  /** Botón de acción. */
  ctaLabel?: string;
  ctaUrl?: string;
  /** Línea destacada bajo el botón (caducidad, límites...). */
  note?: string;
  /** Si el mensaje es promocional, el pie lo declara en vez de negarlo. */
  marketing?: boolean;
  /** Aviso de seguridad extra (p. ej. "si no fuiste tú, ..."). */
  securityNote?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Construye el email.
 *
 * El asunto SIEMPRE empieza por `Ciszu Network | ` porque los filtros de spam
 * penalizan asuntos genéricos y porque es la forma de que el usuario reconozca
 * el origen de un correo que le pide un código.
 */
export function renderBrandedEmail(input: BrandedEmailInput): RenderedEmail {
  const site = input.siteName.trim();
  const subject = `${EMAIL_BRAND_NAME} | ${site} — ${input.title}`;

  const introHtml = input.intro
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map(
      (line) =>
        `<p style="margin:0 0 14px;font-size:14px;line-height:22px;color:#c9ccd6;">${escapeHtml(line)}</p>`,
    )
    .join('');

  const codeBlock = input.code
    ? `<div style="margin:22px 0;padding:18px;border-radius:14px;background:#0d0d18;border:1px solid #24243a;text-align:center;">
         <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7c8196;margin-bottom:8px;">Tu clave temporal</div>
         <div style="font-family:'Courier New',monospace;font-size:30px;font-weight:700;letter-spacing:6px;color:#ffffff;">${escapeHtml(input.code)}</div>
       </div>`
    : '';

  const ctaBlock =
    input.ctaUrl && input.ctaLabel
      ? `<div style="margin:26px 0 10px;text-align:center;">
           <a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;padding:14px 26px;border-radius:12px;background:#3d6adf;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;">${escapeHtml(input.ctaLabel)}</a>
         </div>
         <p style="margin:0 0 8px;font-size:11px;color:#7c8196;text-align:center;word-break:break-all;">Si el botón no funciona, copia este enlace: ${escapeHtml(input.ctaUrl)}</p>`
      : '';

  const noteBlock = input.note
    ? `<p style="margin:16px 0 0;padding:12px;border-radius:10px;background:#15152222;border:1px solid #24243a;font-size:12px;color:#a8adbd;">${escapeHtml(input.note)}</p>`
    : '';

  const securityBlock = input.securityNote
    ? `<p style="margin:14px 0 0;font-size:12px;color:#a8adbd;">${escapeHtml(input.securityNote)}</p>`
    : '';

  const marketingLine = input.marketing
    ? `Recibes este correo porque aceptaste comunicaciones de ${escapeHtml(site)}. <strong style="color:#e9ebf2;">Este mensaje SÍ es una comunicación promocional.</strong> Puedes darte de baja desde tu cuenta.`
    : `Este correo es una notificación de seguridad de tu cuenta y <strong style="color:#e9ebf2;">no es publicidad ni patrocinio</strong>. No respondas a este mensaje: la bandeja no se atiende.`;

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px 12px;background:#07070f;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#101019;border:1px solid #24243a;border-radius:18px;overflow:hidden;">
      <tr>
        <td style="padding:22px 26px;background:linear-gradient(90deg,#1a1a2e,#101019);border-bottom:1px solid #24243a;">
          <div style="font-size:15px;font-weight:700;color:#ffffff;letter-spacing:1px;">${EMAIL_BRAND_NAME}</div>
          <div style="font-size:11px;color:#7c8196;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">${escapeHtml(site)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:26px;">
          <h1 style="margin:0 0 16px;font-size:17px;color:#ffffff;letter-spacing:.5px;">${escapeHtml(input.title)}</h1>
          ${introHtml}
          ${codeBlock}
          ${ctaBlock}
          ${noteBlock}
          ${securityBlock}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 26px;background:#0b0b14;border-top:1px solid #24243a;">
          <p style="margin:0 0 10px;font-size:11px;line-height:17px;color:#7c8196;">${marketingLine}</p>
          <p style="margin:0;font-size:11px;line-height:17px;color:#7c8196;">
            <a href="${EMAIL_LEGAL_LINKS.terms}" style="color:#6b8ff5;text-decoration:none;">Términos de Servicio</a> ·
            <a href="${EMAIL_LEGAL_LINKS.privacy}" style="color:#6b8ff5;text-decoration:none;">Privacidad</a> ·
            <a href="${EMAIL_LEGAL_LINKS.support}" style="color:#6b8ff5;text-decoration:none;">Soporte</a>
          </p>
          <p style="margin:10px 0 0;font-size:10px;color:#5a5f75;">Enviado por ${EMAIL_BRAND_NAME} en nombre de ${escapeHtml(site)}. Si no reconoces este mensaje, ignóralo y avísanos desde Soporte.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `${EMAIL_BRAND_NAME} | ${site}`,
    '',
    input.title,
    '',
    input.intro,
    input.code ? `\nCLAVE TEMPORAL: ${input.code}` : '',
    input.ctaUrl ? `\n${input.ctaLabel ?? 'Enlace'}: ${input.ctaUrl}` : '',
    input.note ? `\n${input.note}` : '',
    input.securityNote ? `\n${input.securityNote}` : '',
    '',
    input.marketing
      ? `Este mensaje SÍ es una comunicación promocional de ${site}.`
      : 'Este correo es una notificación de seguridad y NO es publicidad ni patrocinio.',
    `Términos: ${EMAIL_LEGAL_LINKS.terms} · Privacidad: ${EMAIL_LEGAL_LINKS.privacy} · Soporte: ${EMAIL_LEGAL_LINKS.support}`,
  ]
    .filter((line) => line !== '')
    .join('\n');

  return { subject, html, text };
}

/** Email del código 2FA, ya con las reglas del contrato. */
export function twoFactorEmail(input: {
  siteName: string;
  code: string;
  expiresInMinutes: number;
  maxAttempts: number;
}): RenderedEmail {
  return renderBrandedEmail({
    siteName: input.siteName,
    title: 'Tu clave de acceso',
    intro:
      `Alguien (esperamos que tú) está iniciando sesión en ${input.siteName} y tu cuenta tiene verificación en dos pasos activada.\n` +
      'Introduce esta clave para continuar:',
    code: input.code,
    note: `La clave caduca en ${input.expiresInMinutes} minutos y solo sirve para ${input.siteName}. Tras ${input.maxAttempts} intentos fallidos el acceso se suspende temporalmente.`,
    securityNote:
      'Si no has intentado iniciar sesión, no introduzcas la clave: cambia tu contraseña desde la web y avísanos desde Soporte.',
  });
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Remitente; por defecto `Ciszu Network | <site> <no-reply@…>`. */
  from?: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
  /** En local se permite no enviar y devolver la vista previa. */
  allowPreview?: boolean;
}

export interface SendEmailResult {
  sent: boolean;
  error?: string;
  providerId?: string;
  previewOnly?: boolean;
}

/**
 * Envía un email por Resend.
 *
 * Sin `RESEND_API_KEY` no se puede enviar (Resend exige dominio verificado), así
 * que devuelve el motivo en vez de decir que sí. Con `EMAIL_ALLOW_PREVIEW=1`
 * (solo desarrollo) se marca `previewOnly` y quien llama puede mostrar el
 * código en pantalla para poder probar el flujo sin proveedor.
 */
export async function sendBrandedEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = input.apiKey ?? process.env.RESEND_API_KEY;
  const from = input.from ?? process.env.EMAIL_FROM_RESEND ?? process.env.EMAIL_FROM;
  const allowPreview = input.allowPreview ?? process.env.EMAIL_ALLOW_PREVIEW === '1';

  if (!apiKey || !from) {
    const missing = !apiKey ? 'RESEND_API_KEY' : 'EMAIL_FROM_RESEND';
    if (allowPreview) {
      return { sent: false, previewOnly: true, error: `Vista previa local: falta ${missing}.` };
    }
    return { sent: false, error: `No hay proveedor de email configurado (falta ${missing}).` };
  }

  const doFetch = input.fetchImpl ?? fetch;
  try {
    const res = await doFetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { sent: false, error: `El proveedor rechazó el envío (HTTP ${res.status}): ${detail.slice(0, 200)}` };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { sent: true, providerId: data.id };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : 'Fallo de red al enviar el email.' };
  }
}
