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

import { EMAIL_SITE_ISOTYPES } from './emailSites.generated';

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

/** Íconos SVG inline (monocromo blanco, para fondos oscuros) de redes sociales. */
export const SOCIAL_SVG: Record<string, string> = {
  youtube: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
  instagram: '<path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>',
  x: '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>',
  discord: '<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>',
  github: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
  tiktok: '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
  facebook: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>',
};

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

/** Iconos de redes sociales como bloques SVG inline (blanco, fondo oscuro). */
function socialRow(site: EmailSiteConfig): string {
  const icons = site.social
    .map(
      (s) =>
        `<a href="${escapeHtml(s.url)}" style="display:inline-block;margin:0 4px;text-decoration:none;vertical-align:middle;">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#8a97ad"><g>${SOCIAL_SVG[s.platform] ?? ''}</g></svg>
         </a>`,
    )
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

  const isotipo = EMAIL_SITE_ISOTYPES[site.key] ?? EMAIL_SITE_ISOTYPES.ciszu;

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
                <span style="color:#ffffff;font-size:16px;font-weight:800;letter-spacing:1px;">${EMAIL_BRAND_NAME}</span>
                <div style="color:rgba(255,255,255,0.85);font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">${escapeHtml(site.name)}</div>
              </td>
              <td align="right" style="font-size:0;line-height:0;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" style="vertical-align:middle;">
                  <g transform="translate(12 12) scale(0.14) translate(-12 -12)">${isotipo.replace(/<\/?svg[^>]*>/g, '')}</g>
                </svg>
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