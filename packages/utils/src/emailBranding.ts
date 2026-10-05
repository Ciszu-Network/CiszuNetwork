/**
 * Ecosistema de emails de Ciszu Network.
 *
 * POR QUÉ: los correos de autenticación salían con el remitente "Supabase" y el
 * diseño por defecto, lo que hacía que parecieran phishing precisamente en los
 * emails que piden una acción de seguridad. Además no llevaban ni términos ni
 * la aclaración de que no son publicidad (y los de marketing deben decir lo
 * contrario de forma explícita).
 *
 * Reglas que aplica este módulo:
 *   - Remitente y asunto siempre `Ciszu Network | <web>`.
 *   - Cabecera con el logotipo de Ciszu Network + el isotipo de la web que envía
 *     (cada web tiene su versión: fondo, colores e isotipo propios).
 *   - Diseño propio (tabla + estilos en línea: es lo único que respetan todos
 *     los clientes de correo, Outlook incluido).
 *   - Códigos centrados estilo Steam: separación de caracteres y botón de copiar.
 *   - Botón de acción centrado.
 *   - Pie con términos, privacidad, soporte, redes sociales con logos reales y
 *     "esto no es publicidad" (o el aviso contrario si el mensaje SÍ es de
 *     marketing/patrocinio, recordando cómo desactivarlo).
 *
 * El transporte es Resend por HTTP directo a propósito: añadir
 * `@ciszunetwork/email` como dependencia de las 4 webs obligaba a rehacer la
 * instalación del monorepo, y este paquete no debe arrastrar dependencias
 * nuevas. Sin `RESEND_API_KEY` el envío devuelve `sent: false` con el motivo en
 * vez de fingir éxito.
 */

import { EMAIL_SITE_ISOTYPES, EMAIL_CISZU_WORDMARK, EMAIL_SOCIAL_ICONS } from './emailSites.generated';

export const EMAIL_BRAND_NAME = 'Ciszu Network';

/** Enlaces legales canónicos: los mismos que usa la web. */
export const EMAIL_LEGAL_LINKS = {
  terms: 'https://ciszunetwork.vercel.app/terms',
  privacy: 'https://ciszunetwork.vercel.app/privacy',
  support: 'https://ciszunetwork.vercel.app/support',
  home: 'https://ciszunetwork.vercel.app',
} as const;

/** Config de cada web del ecosistema para el branding de sus emails. */
export interface EmailSiteConfig {
  key: string;
  name: string;
  url: string;
  /** Color de acento principal de la web (botones, barra). */
  accent: string;
  /** Color secundario para el degradado del header. */
  accent2: string;
  /** Acento de texto (para enlaces y detalles). */
  textAccent: string;
  /** Gradiente del botón (dos colores). */
  buttonFrom: string;
  buttonTo: string;
  /** URL de ajustes/preferencias de la cuenta. */
  settingsUrl: string;
  /** Redes sociales de la web (o de Ciszu Network si no tiene propias). */
  social: { platform: string; url: string }[];
}

export const EMAIL_SITES: Record<string, EmailSiteConfig> = {
  ciszu: {
    key: 'ciszu',
    name: 'Ciszu Network',
    url: 'https://ciszunetwork.vercel.app',
    accent: '#3a6bf0',
    accent2: '#ff33cc',
    textAccent: '#68cfff',
    buttonFrom: '#3a6bf0',
    buttonTo: '#ff33cc',
    settingsUrl: 'https://ciszunetwork.vercel.app/settings',
    social: [
      { platform: 'youtube', url: 'https://www.youtube.com/@CiszuNetwork' },
      { platform: 'instagram', url: 'https://www.instagram.com/ciszunetwork/' },
      { platform: 'x', url: 'https://x.com/CiszukoAntony' },
      { platform: 'discord', url: 'https://discord.com/invite/W3kMtMMj6E' },
      { platform: 'github', url: 'https://github.com/Ciszu-Network' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/@ciszunetwork' },
    ],
  },
  ciszukoantony: {
    key: 'ciszukoantony',
    name: 'Ciszuko Antony',
    url: 'https://ciszukoantony.vercel.app',
    accent: '#3d6adf',
    accent2: '#ff33cc',
    textAccent: '#5a82e8',
    buttonFrom: '#3d6adf',
    buttonTo: '#ff33cc',
    settingsUrl: 'https://ciszukoantony.vercel.app/settings',
    social: [
      { platform: 'youtube', url: 'https://www.youtube.com/@CiszukoAntony' },
      { platform: 'instagram', url: 'https://www.instagram.com/itz.ciszukoant0nyz/' },
      { platform: 'x', url: 'https://x.com/CiszukoAntony' },
      { platform: 'discord', url: 'https://discord.com/invite/W3kMtMMj6E' },
      { platform: 'github', url: 'https://github.com/CiszukoAntony' },
    ],
  },
  muzicmania: {
    key: 'muzicmania',
    name: 'MuzicMania',
    url: 'https://muzicmania.vercel.app',
    accent: '#293eff',
    accent2: '#a900df',
    textAccent: '#57eeff',
    buttonFrom: '#293eff',
    buttonTo: '#a900df',
    settingsUrl: 'https://muzicmania.vercel.app/settings',
    social: [
      { platform: 'youtube', url: 'https://www.youtube.com/@CiszuNetwork' },
      { platform: 'discord', url: 'https://discord.com/invite/W3kMtMMj6E' },
      { platform: 'x', url: 'https://x.com/CiszukoAntony' },
    ],
  },
  ciszubot: {
    key: 'ciszubot',
    name: 'CiszuBot',
    url: 'https://ciszubot.vercel.app',
    accent: '#3f6fd6',
    accent2: '#a855f7',
    textAccent: '#22d3ee',
    buttonFrom: '#3f6fd6',
    buttonTo: '#a855f7',
    settingsUrl: 'https://ciszubot.vercel.app/settings',
    social: [
      { platform: 'discord', url: 'https://discord.com/invite/W3kMtMMj6E' },
      { platform: 'x', url: 'https://x.com/CiszukoAntony' },
      { platform: 'youtube', url: 'https://www.youtube.com/@CiszuNetwork' },
    ],
  },
};

export const EMAIL_DEFAULT_SITE = 'ciszu';


/**
 * Construye el bloque de código estilo Steam: centrado, separación de
 * caracteres y botón de copiar (que el usuario pulsa para copiar al
 * portapapeles — los clientes de correo bloquean JS, así que además se
 * muestra el código en texto plano seleccionable).
 */
function codeBlock(code: string): string {
  const spaced = code.replace(/[-\s]/g, '').split('').join(' ');
  return `
  <div style="margin:22px 0;text-align:center;">
    <div style="display:inline-block;padding:16px 26px;border-radius:12px;background:#0d0d18;border:1px solid #2a2a45;">
      <div style="font-family:'Consolas','Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:8px;color:#ffffff;mso-text-raise:0;">${escapeHtml(spaced)}</div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:#7c8196;text-align:center;">Copia este código y pégalo en la web para continuar.</div>
  </div>`;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Iconos de redes sociales como PNG embebido (renderizan en todos los clientes). */
function socialRow(site: EmailSiteConfig): string {
  const icons = site.social
    .map((s) => {
      const icon = EMAIL_SOCIAL_ICONS[s.platform];
      if (!icon) return '';
      return `<a href="${escapeHtml(s.url)}" style="display:inline-block;margin:0 4px;text-decoration:none;vertical-align:middle;"><img src="${icon.dataUri}" width="${icon.width}" height="${icon.height}" alt="${escapeHtml(s.platform)}" style="display:inline-block;border:0;outline:none;text-decoration:none;" /></a>`;
    })
    .join('');
  return icons;
}

export interface BrandedEmailInput {
  /** Clave de la web (ciszu, ciszukoantony, muzicmania, ciszubot). */
  siteKey?: string;
  /** Nombre de la web que envía (CiszuBot, MuzicMania...). Compatibilidad. */
  siteName?: string;
  /** Título visible, en mayúsculas cortas ("Verifica tu identidad"). */
  title: string;
  /** Párrafo(s) de introducción. Se acepta texto plano. */
  intro: string;
  /** Código a mostrar en grande (p. ej. `C-123 434`) estilo Steam. */
  code?: string;
  /** Botón de acción (centrado). */
  ctaLabel?: string;
  ctaUrl?: string;
  /** Línea destacada bajo el botón (caducidad, límites...). */
  note?: string;
  /** Si el mensaje es promocional, el pie lo declara en vez de negarlo. */
  marketing?: boolean;
  /** Aviso de seguridad extra (p. ej. "si no fuiste tú, ..."). */
  securityNote?: string;
  /** Texto adicional del pie (p. ej. recordatorio de preferencias). */
  footerNote?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Resuelve la config de la web según siteKey o siteName. */
export function resolveSite(siteKey?: string, siteName?: string): EmailSiteConfig {
  if (siteKey && EMAIL_SITES[siteKey]) return EMAIL_SITES[siteKey];
  if (siteName) {
    const found = Object.values(EMAIL_SITES).find(
      (s) => s.name.toLowerCase() === siteName.trim().toLowerCase(),
    );
    if (found) return found;
  }
  return EMAIL_SITES[EMAIL_DEFAULT_SITE];
}

/**
 * Construye el email.
 *
 * El asunto SIEMPRE empieza por `Ciszu Network | ` porque los filtros de spam
 * penalizan asuntos genéricos y porque es la forma de que el usuario reconozca
 * el origen de un correo que le pide un código.
 */
export function renderBrandedEmail(input: BrandedEmailInput): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  const subject = `${EMAIL_BRAND_NAME} | ${site.name} — ${input.title}`;

  const introHtml = input.intro
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map(
      (line) =>
        `<p style="margin:0 0 14px;font-size:14px;line-height:22px;color:#c9ccd6;">${escapeHtml(line)}</p>`,
    )
    .join('');

  const codeBlockHtml = input.code ? codeBlock(input.code) : '';

  const ctaBlock =
    input.ctaUrl && input.ctaLabel
      ? `<div style="margin:26px 0 10px;text-align:center;">
           <a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;padding:14px 26px;border-radius:12px;background:linear-gradient(135deg,${site.buttonFrom},${site.buttonTo});color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;">${escapeHtml(input.ctaLabel)}</a>
         </div>
         <p style="margin:0 0 8px;font-size:11px;color:#7c8196;text-align:center;word-break:break-all;">Si el botón no funciona, copia este enlace: ${escapeHtml(input.ctaUrl)}</p>`
      : '';

  const noteBlock = input.note
    ? `<p style="margin:16px 0 0;padding:12px;border-radius:10px;background:#151522;border:1px solid #24243a;font-size:12px;color:#a8adbd;">${escapeHtml(input.note)}</p>`
    : '';

  const securityBlock = input.securityNote
    ? `<p style="margin:14px 0 0;font-size:12px;color:#a8adbd;">${escapeHtml(input.securityNote)}</p>`
    : '';

  const footerNoteBlock = input.footerNote
    ? `<p style="margin:10px 0 0;font-size:11px;line-height:17px;color:#8a97ad;">${escapeHtml(input.footerNote)}</p>`
    : '';

  const marketingLine = input.marketing
    ? `Recibes este correo porque aceptaste comunicaciones de ${escapeHtml(site.name)}. <strong style="color:#e9ebf2;">Este mensaje SÍ es una comunicación promocional.</strong> Puedes desactivar los patrocinios y anuncios desde la configuración de tu cuenta.`
    : `Este correo es una notificación de seguridad de tu cuenta y <strong style="color:#e9ebf2;">no es publicidad ni patrocinio</strong>. No respondas a este mensaje: la bandeja no se atiende.`;

  // Logos reales como PNG embebido (data URI): renderizan en todos los
  // clientes de correo, a diferencia del SVG inline.
  const isotipo = EMAIL_SITE_ISOTYPES[site.key] ?? EMAIL_SITE_ISOTYPES.ciszu;
  const isotipoImg = `<img src="${isotipo.dataUri}" width="${isotipo.width}" height="${isotipo.height}" alt="${escapeHtml(site.name)}" style="display:block;border:0;outline:none;text-decoration:none;" />`;
  const wordmarkImg = `<img src="${EMAIL_CISZU_WORDMARK.dataUri}" width="${EMAIL_CISZU_WORDMARK.width}" height="${EMAIL_CISZU_WORDMARK.height}" alt="${EMAIL_BRAND_NAME}" style="display:block;border:0;outline:none;text-decoration:none;" />`;

  // Disclaimer de proveedor: hoy no hay dominio propio, así que los correos de
  // Supabase Auth salen de noreply@mail.app.supabase.io. Es obligatorio
  // aclararlo para evitar que parezca phishing.
  const providerDisclaimer = `Este correo se ha enviado a través de <strong style="color:#a8adbd;">Supabase</strong> (proveedor de autenticación del ecosistema) porque ${EMAIL_BRAND_NAME} aún no dispone de un dominio de correo propio. En cuanto se adquiera, los correos saldrán desde un remitente oficial de ${EMAIL_BRAND_NAME}.`;

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px 12px;background:#05050a;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#0d0d18;border:1px solid #1e1e2e;border-radius:18px;overflow:hidden;">
      <!-- Cabecera con logotipo de Ciszu Network + isotipo de la web -->
      <tr>
        <td style="padding:22px 26px;background:linear-gradient(135deg,${site.accent},${site.accent2});">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="left" style="font-size:0;line-height:0;">
                ${wordmarkImg}
              </td>
              <td align="right" style="font-size:0;line-height:0;vertical-align:middle;">
                ${isotipoImg}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Cuerpo -->
      <tr>
        <td style="padding:26px;">
          <h1 style="margin:0 0 16px;font-size:18px;color:#ffffff;letter-spacing:.5px;">${escapeHtml(input.title)}</h1>
          ${introHtml}
          ${codeBlockHtml}
          ${ctaBlock}
          ${noteBlock}
          ${securityBlock}
        </td>
      </tr>
      <!-- Pie: redes, soporte, legal -->
      <tr>
        <td style="padding:20px 26px;background:#0a0a12;border-top:1px solid #1e1e2e;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:0;line-height:0;padding-bottom:10px;">${socialRow(site)}</td>
            </tr>
          </table>
          <p style="margin:0 0 10px;font-size:11px;line-height:17px;color:#7c8196;">${marketingLine}</p>
          ${footerNoteBlock}
          <p style="margin:0;font-size:11px;line-height:17px;color:#7c8196;">
            <a href="${escapeHtml(site.url)}" style="color:${site.textAccent};text-decoration:none;">${escapeHtml(site.name)}</a> ·
            <a href="${EMAIL_LEGAL_LINKS.terms}" style="color:${site.textAccent};text-decoration:none;">Términos de Servicio</a> ·
            <a href="${EMAIL_LEGAL_LINKS.privacy}" style="color:${site.textAccent};text-decoration:none;">Privacidad</a> ·
            <a href="${EMAIL_LEGAL_LINKS.support}" style="color:${site.textAccent};text-decoration:none;">Soporte</a> ·
            <a href="${escapeHtml(site.settingsUrl)}" style="color:${site.textAccent};text-decoration:none;">Preferencias</a>
          </p>
          <p style="margin:10px 0 0;font-size:10px;color:#5a5f75;">Enviado por ${EMAIL_BRAND_NAME} en nombre de ${escapeHtml(site.name)}. Si no reconoces este mensaje, ignóralo y avísanos desde Soporte.</p>
          <p style="margin:10px 0 0;padding:10px 12px;border-radius:8px;background:#151522;border:1px solid #24243a;font-size:10px;line-height:16px;color:#8a97ad;">${providerDisclaimer}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `${EMAIL_BRAND_NAME} | ${site.name}`,
    '',
    input.title,
    '',
    input.intro,
    input.code ? `\nCÓDIGO: ${input.code}` : '',
    input.ctaUrl ? `\n${input.ctaLabel ?? 'Enlace'}: ${input.ctaUrl}` : '',
    input.note ? `\n${input.note}` : '',
    input.securityNote ? `\n${input.securityNote}` : '',
    input.footerNote ? `\n${input.footerNote}` : '',
    '',
    input.marketing
      ? `Este mensaje SÍ es una comunicación promocional de ${site.name}. Puedes desactivarla desde: ${site.settingsUrl}`
      : 'Este correo es una notificación de seguridad y NO es publicidad ni patrocinio.',
    `Términos: ${EMAIL_LEGAL_LINKS.terms} · Privacidad: ${EMAIL_LEGAL_LINKS.privacy} · Soporte: ${EMAIL_LEGAL_LINKS.support}`,
    '',
    `Aviso: este correo se ha enviado a través de Supabase (proveedor de autenticación) porque ${EMAIL_BRAND_NAME} aún no dispone de un dominio de correo propio.`,
  ]
    .filter((line) => line !== '')
    .join('\n');

  return { subject, html, text };
}

/** Email del código 2FA, ya con las reglas del contrato. */
export function twoFactorEmail(input: {
  siteKey?: string;
  siteName?: string;
  code: string;
  expiresInMinutes: number;
  maxAttempts: number;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key,
    title: 'Tu clave de acceso',
    intro:
      `Alguien (esperamos que tú) está iniciando sesión en ${site.name} y tu cuenta tiene verificación en dos pasos activada.\n` +
      'Introduce esta clave para continuar:',
    code: input.code,
    note: `La clave caduca en ${input.expiresInMinutes} minutos y solo sirve para ${site.name}. Tras ${input.maxAttempts} intentos fallidos el acceso se suspende temporalmente.`,
    securityNote:
      'Si no has intentado iniciar sesión, no introduzcas la clave: cambia tu contraseña desde la web y avísanos desde Soporte.',
  });
}

/** Bienvenida tras completar el registro y verificar la cuenta. */
export function welcomeEmail(input: {
  siteKey?: string;
  siteName?: string;
  username: string;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key,
    title: '¡Bienvenido a ' + site.name + '!',
    intro:
      `Hola, ${input.username}.\n\n` +
      `Tu cuenta en ${site.name} está verificada y lista para usar. Ya formas parte del ecosistema ${EMAIL_BRAND_NAME}.`,
    ctaLabel: 'Explorar ' + site.name,
    ctaUrl: site.url,
    note: 'Desde la configuración de tu cuenta puedes elegir qué notificaciones quieres recibir.',
    footerNote: `Puedes ajustar tus preferencias de notificación y patrocinios en cualquier momento: ${site.settingsUrl}`,
  });
}

/** Notificación transaccional general (logros, avisos de la web, novedades). */
export function notificationEmail(input: {
  siteKey?: string;
  siteName?: string;
  title: string;
  intro: string;
  ctaLabel?: string;
  ctaUrl?: string;
  note?: string;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key,
    title: input.title,
    intro: input.intro,
    ctaLabel: input.ctaLabel,
    ctaUrl: input.ctaUrl,
    note: input.note,
    footerNote: `Recibes esta notificación según tus preferencias de cuenta. Puedes cambiarlas aquí: ${site.settingsUrl}`,
  });
}

/** Patrocinio/anuncio de un proyecto del ecosistema (marketing). */
export function sponsorshipEmail(input: {
  siteKey?: string;
  siteName?: string;
  project: string;
  headline: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key,
    title: input.headline,
    intro:
      `Hoy te presentamos ${input.project} del ecosistema ${EMAIL_BRAND_NAME}.\n\n` + input.intro,
    ctaLabel: input.ctaLabel,
    ctaUrl: input.ctaUrl,
    marketing: true,
    footerNote:
      `Recibes este patrocinio porque lo tienes activado en tus preferencias. Puedes desactivarlo (o volver a activarlo) en cualquier momento: ${site.settingsUrl}`,
  });
}

/** Aviso de seguridad de la cuenta (intento fallido, cambio de datos, etc.). */
export function accountWarningEmail(input: {
  siteKey?: string;
  siteName?: string;
  title: string;
  intro: string;
  securityNote: string;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key,
    title: input.title,
    intro: input.intro,
    securityNote: input.securityNote,
    ctaLabel: 'Revisar mi cuenta',
    ctaUrl: site.settingsUrl,
  });
}

/** Confirmación de cambio de contraseña. */
export function passwordChangedEmail(input: {
  siteKey?: string;
  siteName?: string;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key,
    title: 'Contraseña actualizada',
    intro: `La contraseña de tu cuenta en ${site.name} se cambió correctamente.`,
    securityNote:
      'Si no fuiste tú quien cambió la contraseña, recupera tu cuenta desde la web y avísanos desde Soporte de inmediato.',
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