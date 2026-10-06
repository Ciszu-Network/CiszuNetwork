/**
 * Ecosistema de emails de Ciszu Network.
 *
 * Reglas de diseño:
 *   - Remitente y asunto siempre `Ciszu Network | <web> — <título>`.
 *   - Cabecera con el logotipo de Ciszu Network + el isotipo de la web (a color,
 *     PNG embebido: renderiza en todos los clientes, Gmail/Outlook incluidos).
 *   - Cada web tiene su fondo oscuro propio y su degradado superior según el
 *     logotipo, para distinguirse.
 *   - Icono de categoría junto al título (verificación, llave, candado...).
 *   - Código estilo Steam: `C-` fijo + dígitos separados + botón de copiar.
 *   - Botón de acción centrado con flecha.
 *   - Sección de redes sociales (logos con color de marca) en TODOS los emails.
 *   - Emisor claro (quién envía: Ciszu Network, su correo y la web) y saludo al
 *     receptor según si el email se manda con sesión iniciada o no.
 *   - Aviso legal "no es publicidad" (o el contrario si es marketing) y
 *     disclaimer del proveedor (Supabase) mientras no haya dominio propio.
 *
 * El transporte es Resend por HTTP directo. Sin `RESEND_API_KEY` el envío
 * devuelve `sent: false` con el motivo en vez de fingir éxito.
 */

import {
  EMAIL_SITE_ISOTYPES,
  EMAIL_CISZU_WORDMARK,
  EMAIL_SOCIAL_ICONS,
  EMAIL_CATEGORY_ICONS,
  EMAIL_UI_ICONS,
  EMAIL_SITE_HEADER_EXTRAS,
  EMAIL_FOOTER_ISOTYPE,
  EMAIL_CROSSOVER,
  type EmailLogo,
} from './emailSites.generated';

export const EMAIL_BRAND_NAME = 'Ciszu Network';
export const EMAIL_BRAND_EMAIL = 'ciszunetwork@gmail.com';

export const EMAIL_LEGAL_LINKS = {
  terms: 'https://ciszunetwork.vercel.app/terms',
  privacy: 'https://ciszunetwork.vercel.app/privacy',
  support: 'https://ciszunetwork.vercel.app/support',
  home: 'https://ciszunetwork.vercel.app',
} as const;

export interface EmailSiteConfig {
  key: string;
  name: string;
  url: string;
  /** Acento principal (botones, detalles). */
  accent: string;
  /** Segundo color del degradado. */
  accent2: string;
  /** Color de enlaces de texto. */
  textAccent: string;
  /** Fondo oscuro propio de la web. */
  bg: string;
  /** Fondo de la tarjeta (un tono por encima del fondo). */
  cardBg: string;
  buttonFrom: string;
  buttonTo: string;
  settingsUrl: string;
  social: { platform: string; url: string }[];
}

export const EMAIL_SITES: Record<string, EmailSiteConfig> = {
  ciszu: {
    key: 'ciszu',
    name: 'Ciszu Network',
    url: 'https://ciszunetwork.vercel.app',
    accent: '#233f92',
    accent2: '#4800ff',
    textAccent: '#68cfff',
    bg: '#04040d',
    cardBg: '#0a0a1c',
    buttonFrom: '#3a6bf0',
    buttonTo: '#ff33cc',
    settingsUrl: 'https://ciszunetwork.vercel.app/settings',
    social: [
      { platform: 'youtube', url: 'https://www.youtube.com/@CiszuNetwork' },
      { platform: 'instagram', url: 'https://www.instagram.com/ciszunetwork/' },
      { platform: 'x', url: 'https://x.com/CiszukoAntony' },
      { platform: 'facebook', url: 'https://www.facebook.com/profile.php?id=61572023767657' },
      { platform: 'discord', url: 'https://discord.com/invite/W3kMtMMj6E' },
      { platform: 'github', url: 'https://github.com/Ciszu-Network' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/@ciszunetwork' },
      { platform: 'whatsapp', url: 'https://wa.me/584126858111' },
    ],
  },
  ciszukoantony: {
    key: 'ciszukoantony',
    name: 'Ciszuko Antony',
    url: 'https://ciszukoantony.vercel.app',
    accent: '#1a2f6e',
    accent2: '#ff33cc',
    textAccent: '#5a82e8',
    bg: '#0a0612',
    cardBg: '#150d22',
    buttonFrom: '#3d6adf',
    buttonTo: '#ff33cc',
    settingsUrl: 'https://ciszukoantony.vercel.app/settings',
    social: [
      { platform: 'youtube', url: 'https://www.youtube.com/@CiszukoAntony' },
      { platform: 'instagram', url: 'https://www.instagram.com/itz.ciszukoant0nyz/' },
      { platform: 'x', url: 'https://x.com/CiszukoAntony' },
      { platform: 'facebook', url: 'https://www.facebook.com/ciszukoantony' },
      { platform: 'discord', url: 'https://discord.com/invite/W3kMtMMj6E' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/@ciszunetwork' },
      { platform: 'whatsapp', url: 'https://wa.me/584126858111' },
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
    bg: '#050310',
    cardBg: '#0e0a20',
    buttonFrom: '#293eff',
    buttonTo: '#a900df',
    settingsUrl: 'https://muzicmania.vercel.app/settings',
    social: [
      { platform: 'youtube', url: 'https://www.youtube.com/@CiszuNetwork' },
      { platform: 'discord', url: 'https://discord.com/invite/W3kMtMMj6E' },
      { platform: 'x', url: 'https://x.com/CiszukoAntony' },
      { platform: 'instagram', url: 'https://www.instagram.com/ciszunetwork/' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/@ciszunetwork' },
      { platform: 'facebook', url: 'https://www.facebook.com/profile.php?id=61572023767657' },
      { platform: 'whatsapp', url: 'https://wa.me/584126858111' },
    ],
  },
  ciszubot: {
    key: 'ciszubot',
    name: 'CiszuBot',
    url: 'https://ciszubot.vercel.app',
    accent: '#3f6fd6',
    accent2: '#a855f7',
    textAccent: '#22d3ee',
    bg: '#060a15',
    cardBg: '#0d1224',
    buttonFrom: '#3f6fd6',
    buttonTo: '#a855f7',
    settingsUrl: 'https://ciszubot.vercel.app/settings',
    social: [
      { platform: 'discord', url: 'https://discord.com/invite/W3kMtMMj6E' },
      { platform: 'x', url: 'https://x.com/CiszukoAntony' },
      { platform: 'youtube', url: 'https://www.youtube.com/@CiszuNetwork' },
      { platform: 'github', url: 'https://github.com/Ciszu-Network' },
      { platform: 'instagram', url: 'https://www.instagram.com/ciszunetwork/' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/@ciszunetwork' },
      { platform: 'facebook', url: 'https://www.facebook.com/profile.php?id=61572023767657' },
      { platform: 'whatsapp', url: 'https://wa.me/584126858111' },
    ],
  },
};

export const EMAIL_DEFAULT_SITE = 'ciszu';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Datos del receptor del email (para el saludo). */
export interface EmailRecipient {
  email: string;
  displayName?: string | null;
  username?: string | null;
}

export interface BrandedEmailInput {
  siteKey?: string;
  siteName?: string;
  /** Icono de categoría junto al título (confirmation, recovery, ...). */
  category?: string;
  title: string;
  intro: string;
  /** Receptor: si se indica, se añade el saludo correspondiente. */
  recipient?: EmailRecipient;
  /** true = el email se manda con sesión iniciada (muestra usuario/correo);
   *  false/omitido = sin sesión (solo el correo, por privacidad). */
  loggedIn?: boolean;
  /** Código a mostrar (`C-123 456`). El prefijo `C-` es fijo. */
  code?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  note?: string;
  marketing?: boolean;
  securityNote?: string;
  footerNote?: string;
  /** HTML extra NO escapado; solo para la plantilla de debug de la devcon. */
  extraHtml?: string;
  /** Marca el email como enviado por la devcon (franja + asunto). */
  devcon?: boolean;
  /** Asunto exacto (para las plantillas de Supabase Auth). */
  subjectOverride?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

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

/** Saludo del receptor según el contexto (con o sin sesión). */
export function buildGreeting(recipient: EmailRecipient | undefined, loggedIn: boolean): string {
  if (!recipient || !recipient.email) return '';
  if (loggedIn) {
    const parts: string[] = [];
    if (recipient.displayName) parts.push(recipient.displayName);
    if (recipient.username) parts.push(`@${recipient.username}`);
    return parts.length ? `¡Bienvenido ${parts.join(' ')} (${recipient.email})!` : `¡Bienvenido (${recipient.email})!`;
  }
  return `¡Hola, ${recipient.email}!`;
}

/** Escala un logo a una altura objetivo manteniendo la proporción (con ancho máx). */
function fitH(logo: EmailLogo, targetH: number, maxW?: number): { w: number; h: number } {
  let h = targetH;
  let w = Math.round(targetH * (logo.width / logo.height));
  if (maxW && w > maxW) { w = maxW; h = Math.round(maxW * (logo.height / logo.width)); }
  return { w, h };
}

/** Bloque de código estilo Steam: `C-` fijo + dígitos separados + copiar. */
function codeBlock(code: string): string {
  const raw = code.replace(/[^A-Za-z0-9]/g, '');
  const digits = raw.startsWith('C') || raw.startsWith('c') ? raw.slice(1) : raw;
  const spaced = digits.split('').join(' ');
  const copyIcon = EMAIL_UI_ICONS.copy;
  return `
  <div style="margin:22px 0;text-align:center;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="padding:14px 20px;border-radius:12px;background:#0b0b16;border:1px solid #2a2a45;">
          <span style="font-family:'Consolas','Courier New',monospace;font-size:24px;font-weight:700;color:#3b82f6;letter-spacing:2px;">C-</span><span style="font-family:'Consolas','Courier New',monospace;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:8px;">${escapeHtml(spaced)}</span>
        </td>
        <td style="padding-left:10px;vertical-align:middle;">
          <a href="#" onclick="try{navigator.clipboard.writeText('${escapeHtml(digits)}')}catch(e){};return false;" title="Copiar número" style="text-decoration:none;">
            <img src="${copyIcon.dataUri}" width="${copyIcon.width}" height="${copyIcon.height}" alt="Copiar" style="display:block;border:0;" />
          </a>
        </td>
      </tr>
    </table>
    <div style="margin-top:10px;font-size:11px;color:#7c8196;text-align:center;">El prefijo <strong style="color:#8ab4ff;">C-</strong> es fijo y no se copia; solo se verifica el número. Pulsa el icono para copiarlo.</div>
  </div>`;
}

/** Fila de iconos de redes sociales (con color de marca). */
function socialRow(site: EmailSiteConfig): string {
  return site.social
    .map((s) => {
      const icon = EMAIL_SOCIAL_ICONS[s.platform];
      if (!icon) return '';
      return `<a href="${escapeHtml(s.url)}" style="display:inline-block;margin:0 5px;text-decoration:none;vertical-align:middle;"><img src="${icon.dataUri}" width="${icon.width}" height="${icon.height}" alt="${escapeHtml(s.platform)}" style="display:inline-block;border:0;" /></a>`;
    })
    .join('');
}

function icon(name: string | undefined, alt: string): string {
  if (!name) return '';
  const ic = EMAIL_CATEGORY_ICONS[name];
  if (!ic) return '';
  return `<img src="${ic.dataUri}" width="${ic.width}" height="${ic.height}" alt="${escapeHtml(alt)}" style="display:inline-block;border:0;vertical-align:middle;" />`;
}

/** Construye el HTML del email. */
export function renderBrandedEmail(input: BrandedEmailInput): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  const subject = input.subjectOverride
    ? (input.devcon ? `[DEVCON] ${input.subjectOverride}` : input.subjectOverride)
    : `${EMAIL_BRAND_NAME} | ${site.name} — ${input.title}`;
  const finalSubject = input.subjectOverride ? subject : (input.devcon ? `[DEVCON] ${subject}` : subject);

  const introHtml = input.intro
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p style="margin:0 0 14px;font-size:14px;line-height:22px;color:#c9ccd6;">${escapeHtml(line)}</p>`)
    .join('');

  const greeting = buildGreeting(input.recipient, input.loggedIn === true);
  const greetingHtml = greeting
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#ffffff;font-weight:700;">${escapeHtml(greeting)}</p>`
    : '';

  const codeBlockHtml = input.code ? codeBlock(input.code) : '';

  const arrowIcon = EMAIL_UI_ICONS.arrow_right;
  const ctaBlock =
    input.ctaUrl && input.ctaLabel
      ? `<div style="margin:26px 0 10px;text-align:center;">
           <a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;padding:14px 26px;border-radius:12px;background:linear-gradient(135deg,${site.buttonFrom},${site.buttonTo});color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;">${escapeHtml(input.ctaLabel)} <img src="${arrowIcon.dataUri}" width="${arrowIcon.width}" height="${arrowIcon.height}" alt="→" style="display:inline-block;border:0;vertical-align:middle;margin-left:6px;" /></a>
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
    : `Este correo es una notificación de ${escapeHtml(site.name)} y <strong style="color:#e9ebf2;">no es publicidad ni patrocinio</strong>. No respondas a este mensaje: la bandeja no se atiende.`;

  const providerDisclaimer = `Este correo se ha enviado a través de <strong style="color:#a8adbd;">Supabase</strong> (proveedor de autenticación del ecosistema) porque ${EMAIL_BRAND_NAME} aún no dispone de un dominio de correo propio. En cuanto se adquiera, los correos saldrán desde un remitente oficial de ${EMAIL_BRAND_NAME}.`;

  const isotipo = EMAIL_SITE_ISOTYPES[site.key] ?? EMAIL_SITE_ISOTYPES.ciszu;
  // Logotipo maestro FULL (index) escalado conservando la proporción.
  const wm = fitH(EMAIL_CISZU_WORDMARK, 92, 210);
  const wordmarkImg = `<img src="${EMAIL_CISZU_WORDMARK.dataUri}" width="${wm.w}" height="${wm.h}" alt="${EMAIL_BRAND_NAME}" style="display:block;border:0;" />`;
  // Extras de cabecera por web, escalados a altura uniforme (proporción correcta).
  const headerExtras = (EMAIL_SITE_HEADER_EXTRAS[site.key] ?? [])
    .map((e) => {
      const r = fitH(e, 48, 190);
      return `<img src="${e.dataUri}" width="${r.w}" height="${r.h}" alt="${escapeHtml(site.name)}" style="display:inline-block;border:0;vertical-align:middle;margin:0 4px;" />`;
    })
    .join('');
  // ciszu: logotipo full centrado (el isotipo de la derecha sería redundante).
  const headerCells = site.key === 'ciszu'
    ? `<td align="center" style="font-size:0;line-height:0;">${wordmarkImg}</td>`
    : `<td align="left" style="font-size:0;line-height:0;">${wordmarkImg}</td><td align="right" style="font-size:0;line-height:0;vertical-align:middle;">${headerExtras}</td>`;
  const categoryIcon = icon(input.category, input.title);

  // Bloque del ecosistema en el footer. Para ciszu: solo el isotipo blanco
  // (no "ciszu x ciszu"). Para el resto: [isotipo ciszu] × [isotipo web],
  // ambos del MISMO tamaño.
  const fi = fitH(EMAIL_FOOTER_ISOTYPE, 60, 64);
  const footIso = `<img src="${EMAIL_FOOTER_ISOTYPE.dataUri}" width="${fi.w}" height="${fi.h}" alt="${EMAIL_BRAND_NAME}" style="display:inline-block;border:0;vertical-align:middle;" />`;
  const crossoverImg = `<img src="${EMAIL_CROSSOVER.dataUri}" width="${EMAIL_CROSSOVER.width}" height="${EMAIL_CROSSOVER.height}" alt="×" style="display:inline-block;border:0;vertical-align:middle;margin:0 12px;" />`;
  const wi = fitH(isotipo, 60, 64);
  const webIso = `<img src="${isotipo.dataUri}" width="${wi.w}" height="${wi.h}" alt="${escapeHtml(site.name)}" style="display:inline-block;border:0;vertical-align:middle;" />`;
  const ecoBlock = site.key === 'ciszu'
    ? `<div style="text-align:center;font-size:0;line-height:0;margin-bottom:10px;">${footIso}</div>`
    : `<div style="text-align:center;font-size:0;line-height:0;margin-bottom:10px;">${footIso}${crossoverImg}${webIso}</div>`;
  const copyright = `© ${new Date().getFullYear()} ${escapeHtml(site.name)} · Todos los derechos reservados · Desarrollado por ${EMAIL_BRAND_NAME}.`;

  const devconBanner = input.devcon
    ? `<tr><td style="padding:8px 26px;background:#7f1d1d;color:#fecaca;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:center;">⚙ Enviado por la DEVCON (plantilla de prueba)</td></tr>`
    : '';

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px 12px;background:${site.bg};font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:${site.cardBg};border:1px solid #1e1e2e;border-radius:18px;overflow:hidden;">
      ${devconBanner}
      <tr>
        <td style="padding:22px 26px;background:linear-gradient(135deg,${site.accent},${site.accent2});">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>${headerCells}</tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:26px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;vertical-align:middle;">${categoryIcon}</td>
            <td style="vertical-align:middle;"><h1 style="margin:0;font-size:18px;color:#ffffff;letter-spacing:.5px;">${escapeHtml(input.title)}</h1></td>
          </tr></table>
          <div style="height:14px;"></div>
          ${greetingHtml}
          ${introHtml}
          ${codeBlockHtml}
          ${ctaBlock}
          ${noteBlock}
          ${securityBlock}
          ${input.extraHtml ?? ''}
        </td>
      </tr>
      <tr>
        <td style="padding:18px 26px;background:rgba(0,0,0,0.35);border-top:1px solid #1e1e2e;">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5a5f75;text-align:center;">Síguenos</p>
          <div style="text-align:center;font-size:0;line-height:0;margin-bottom:14px;">${socialRow(site)}</div>
          ${ecoBlock}
          <p style="margin:0 0 10px;font-size:11px;line-height:17px;color:#7c8196;text-align:center;"><strong style="color:#c9ccd6;">Enviado por ${EMAIL_BRAND_NAME}</strong> · ${EMAIL_BRAND_EMAIL} · Página: <a href="${escapeHtml(site.url)}" style="color:${site.textAccent};text-decoration:none;">${escapeHtml(site.name)}</a></p>
          <p style="margin:0 0 10px;font-size:11px;line-height:17px;color:#7c8196;text-align:center;"><img src="${EMAIL_CATEGORY_ICONS.disclaimer.dataUri}" width="14" height="14" alt="Aviso" style="display:inline-block;border:0;vertical-align:middle;margin-right:6px;" />${marketingLine}</p>
          ${footerNoteBlock}
          <p style="margin:0;font-size:11px;line-height:17px;color:#7c8196;text-align:center;">
            <a href="${EMAIL_LEGAL_LINKS.terms}" style="color:${site.textAccent};text-decoration:none;">Términos de Servicio</a> ·
            <a href="${EMAIL_LEGAL_LINKS.privacy}" style="color:${site.textAccent};text-decoration:none;">Privacidad</a> ·
            <a href="${EMAIL_LEGAL_LINKS.support}" style="color:${site.textAccent};text-decoration:none;">Soporte</a> ·
            <a href="${escapeHtml(site.settingsUrl)}" style="color:${site.textAccent};text-decoration:none;">Preferencias</a>
          </p>
          <p style="margin:12px 0 0;padding:10px 12px;border-radius:8px;background:#151522;border:1px solid #24243a;font-size:10px;line-height:16px;color:#8a97ad;text-align:center;">
            <img src="${EMAIL_CATEGORY_ICONS.supabase.dataUri}" width="14" height="14" alt="Supabase" style="display:inline-block;border:0;vertical-align:middle;margin-right:6px;" />${providerDisclaimer}
          </p>
          <p style="margin:12px 0 0;font-size:10px;line-height:15px;color:#5a5f75;text-align:center;">${copyright}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `${EMAIL_BRAND_NAME} | ${site.name}`,
    '',
    input.title,
    greeting ? `\n${greeting}` : '',
    '',
    input.intro,
    input.code ? `\nCÓDIGO: C-${input.code.replace(/[^A-Za-z0-9]/g, '').replace(/^C/i, '')} (el prefijo C- es fijo; solo se verifica el número)` : '',
    input.ctaUrl ? `\n${input.ctaLabel ?? 'Enlace'}: ${input.ctaUrl}` : '',
    input.note ? `\n${input.note}` : '',
    input.securityNote ? `\n${input.securityNote}` : '',
    input.footerNote ? `\n${input.footerNote}` : '',
    '',
    input.marketing
      ? `Este mensaje SÍ es una comunicación promocional de ${site.name}. Puedes desactivarla desde: ${site.settingsUrl}`
      : 'Este correo es una notificación y NO es publicidad ni patrocinio.',
    `Enviado por ${EMAIL_BRAND_NAME} (${EMAIL_BRAND_EMAIL}) · Página: ${site.name} (${site.url})`,
    `Términos: ${EMAIL_LEGAL_LINKS.terms} · Privacidad: ${EMAIL_LEGAL_LINKS.privacy} · Soporte: ${EMAIL_LEGAL_LINKS.support}`,
    '',
    `Aviso: enviado a través de Supabase (proveedor de autenticación) porque ${EMAIL_BRAND_NAME} aún no dispone de un dominio propio.`,
  ]
    .filter((line) => line !== '')
    .join('\n');

  return { subject: finalSubject, html, text };
}

/* ------------------------------ Plantillas ------------------------------ */

export function twoFactorEmail(input: {
  siteKey?: string; siteName?: string; code: string; expiresInMinutes: number; maxAttempts: number;
  recipient?: EmailRecipient; devcon?: boolean;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key, category: 'twofactor', title: 'Tu clave de acceso',
    intro: `Alguien (esperamos que tú) está iniciando sesión en ${site.name} y tu cuenta tiene verificación en dos pasos activada.\nIntroduce esta clave para continuar:`,
    code: input.code, recipient: input.recipient, loggedIn: false, devcon: input.devcon,
    note: `La clave caduca en ${input.expiresInMinutes} minutos y solo sirve para ${site.name}. Tras ${input.maxAttempts} intentos fallidos el acceso se suspende temporalmente.`,
    securityNote: 'Si no has intentado iniciar sesión, no introduzcas la clave: cambia tu contraseña desde la web y avísanos desde Soporte.',
  });
}

export function welcomeEmail(input: {
  siteKey?: string; siteName?: string; username: string; recipient?: EmailRecipient; devcon?: boolean;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key, category: 'welcome', title: `¡Bienvenido a ${site.name}!`,
    intro: `Tu cuenta en ${site.name} está verificada y lista para usar. Ya formas parte del ecosistema ${EMAIL_BRAND_NAME}.`,
    recipient: input.recipient ?? { email: '', username: input.username }, loggedIn: true,
    ctaLabel: `Explorar ${site.name}`, ctaUrl: site.url, devcon: input.devcon,
    note: 'Desde la configuración de tu cuenta puedes elegir qué notificaciones quieres recibir.',
    footerNote: `Ajusta tus preferencias de notificación y patrocinios en cualquier momento: ${site.settingsUrl}`,
  });
}

export function notificationEmail(input: {
  siteKey?: string; siteName?: string; title: string; intro: string; ctaLabel?: string; ctaUrl?: string; note?: string;
  recipient?: EmailRecipient; devcon?: boolean;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key, category: 'notification', title: input.title, intro: input.intro,
    recipient: input.recipient, loggedIn: true, ctaLabel: input.ctaLabel, ctaUrl: input.ctaUrl, note: input.note, devcon: input.devcon,
    footerNote: `Recibes esta notificación según tus preferencias de cuenta. Puedes cambiarlas aquí: ${site.settingsUrl}`,
  });
}

export function sponsorshipEmail(input: {
  siteKey?: string; siteName?: string; project: string; headline: string; intro: string; ctaLabel: string; ctaUrl: string;
  recipient?: EmailRecipient; devcon?: boolean;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key, category: 'sponsorship', title: input.headline,
    intro: `Hoy te presentamos ${input.project} del ecosistema ${EMAIL_BRAND_NAME}.\n\n${input.intro}`,
    recipient: input.recipient, loggedIn: true, ctaLabel: input.ctaLabel, ctaUrl: input.ctaUrl, marketing: true, devcon: input.devcon,
    footerNote: `Recibes este patrocinio porque lo tienes activado en tus preferencias. Puedes desactivarlo (o volver a activarlo) en cualquier momento: ${site.settingsUrl}`,
  });
}

export function accountWarningEmail(input: {
  siteKey?: string; siteName?: string; title: string; intro: string; securityNote: string;
  recipient?: EmailRecipient; devcon?: boolean;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key, category: 'accountwarning', title: input.title, intro: input.intro,
    recipient: input.recipient, loggedIn: true, securityNote: input.securityNote,
    ctaLabel: 'Revisar mi cuenta', ctaUrl: site.settingsUrl, devcon: input.devcon,
  });
}

export function passwordChangedEmail(input: {
  siteKey?: string; siteName?: string; recipient?: EmailRecipient; devcon?: boolean;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key, category: 'passwordchanged', title: 'Contraseña actualizada',
    intro: `La contraseña de tu cuenta en ${site.name} se cambió correctamente.`,
    recipient: input.recipient, loggedIn: true,
    securityNote: 'Si no fuiste tú quien cambió la contraseña, recupera tu cuenta desde la web y avísanos desde Soporte de inmediato.',
    devcon: input.devcon,
  });
}

/** Ticket de soporte (el usuario debe haber iniciado sesión: muestra usuario). */
export function supportTicketEmail(input: {
  siteKey?: string; siteName?: string; ticketId: string; subject: string; message: string;
  recipient?: EmailRecipient; devcon?: boolean;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  return renderBrandedEmail({
    siteKey: site.key, category: 'support_ticket', title: `Ticket ${input.ticketId} recibido`,
    intro: `Hemos recibido tu solicitud de soporte en ${site.name}.\n\nAsunto: ${input.subject}\n\n"${input.message}"\n\nTe responderemos a la brevedad. Guarda el número de ticket.`,
    recipient: input.recipient, loggedIn: true, devcon: input.devcon,
    note: `Número de ticket: ${input.ticketId}`,
    ctaLabel: 'Ver el ticket', ctaUrl: `${site.url}/support`,
    footerNote: `Puedes seguir el estado de tu ticket desde tu cuenta: ${site.url}`,
  });
}

/**
 * Correo no vinculado: la cuenta no existe para esa web. Sin enlaces de acción
 * (el error es claro); ofrece crear cuenta, explicación y soporte.
 */
export function unlinkedEmail(input: {
  siteKey?: string; siteName?: string; email: string; action?: string; devcon?: boolean;
}): RenderedEmail {
  const site = resolveSite(input.siteKey, input.siteName);
  const action = input.action ? ` para ${input.action}` : '';
  return renderBrandedEmail({
    siteKey: site.key, category: 'error', title: 'Correo no vinculado',
    intro:
      `No hemos encontrado ninguna cuenta asociada a ${input.email} en ${site.name}${action}.\n\n` +
      'Si creías tener una cuenta con este correo, comprueba que sea el correcto o crea una nueva. Si el problema persiste, contacta con Soporte.',
    recipient: { email: input.email }, loggedIn: false,
    note: 'Por seguridad, no generamos ningún enlace de acción para correos que no están vinculados a una cuenta.',
    securityNote: 'Si otra persona usó tu correo sin permiso, avísanos desde Soporte.',
    ctaLabel: 'Crear una cuenta', ctaUrl: `${site.url}/register`,
    footerNote: '¿Necesitas ayuda? Soporte y redes del ecosistema están abajo.',
    devcon: input.devcon,
  });
}

/** Plantilla de DEBUG (solo devcon). */
export function debugEmail(input: { siteKey?: string; testEmail?: string; recipient?: EmailRecipient; devcon?: boolean }): RenderedEmail {
  const site = resolveSite(input.siteKey);
  const gallery = Object.entries(EMAIL_SITE_ISOTYPES)
    .map(([key, logo]) => {
      const cfg = EMAIL_SITES[key];
      return `<td style="padding:10px;text-align:center;vertical-align:top;"><img src="${logo.dataUri}" width="${logo.width}" height="${logo.height}" alt="${escapeHtml(cfg?.name ?? key)}" style="display:inline-block;border:0;" /><div style="margin-top:6px;font-size:10px;color:#8a97ad;">${escapeHtml(cfg?.name ?? key)}</div></td>`;
    })
    .join('');
  const socialGallery = Object.entries(EMAIL_SOCIAL_ICONS)
    .map(([key, logo]) => `<td style="padding:4px;text-align:center;"><img src="${logo.dataUri}" width="${logo.width}" height="${logo.height}" alt="${escapeHtml(key)}" style="display:inline-block;border:0;" /><div style="font-size:9px;color:#5a5f75;">${escapeHtml(key)}</div></td>`)
    .join('');
  const catGallery = Object.entries(EMAIL_CATEGORY_ICONS)
    .map(([key, ic]) => `<td style="padding:4px;text-align:center;"><img src="${ic.dataUri}" width="${ic.width}" height="${ic.height}" alt="${escapeHtml(key)}" style="display:inline-block;border:0;" /><div style="font-size:8px;color:#5a5f75;">${escapeHtml(key)}</div></td>`)
    .join('');

  const extraHtml = `
    <div style="margin:24px 0 0;padding:16px;border-radius:12px;background:#101020;border:1px dashed #3a3a55;">
      <div style="font-size:12px;font-weight:700;color:#7dd3fc;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">🧪 Plantilla de DEBUG (solo devcon)</div>
      <p style="margin:0 0 10px;font-size:11px;color:#a8adbd;">Isotipos de las 4 webs:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${gallery}</tr></table>
      <p style="margin:16px 0 6px;font-size:11px;color:#a8adbd;">Redes:</p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>${socialGallery}</tr></table>
      <p style="margin:16px 0 6px;font-size:11px;color:#a8adbd;">Iconos de categoría:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${catGallery}</tr></table>
      <p style="margin:16px 0 0;font-size:10px;color:#5a5f75;">Diagnóstico: site=<strong style="color:#c9ccd6;">${escapeHtml(site.key)}</strong> · destino=${escapeHtml(input.testEmail ?? '(no indicado)')} · proveedor=${process.env.RESEND_API_KEY ? 'Resend' : 'preview'}</p>
    </div>`;

  return renderBrandedEmail({
    siteKey: site.key, category: 'debug', title: 'Plantilla de DEBUG de emails',
    intro: 'Esta es la plantilla de diagnóstico de la devcon. Muestra cabecera, icono de categoría, saludo, código con copiar, botón con flecha, redes y avisos.',
    recipient: input.recipient ?? { email: 'usuario@email.com', displayName: 'Usuario', username: 'usuario' },
    loggedIn: true, code: 'C-123 434', ctaLabel: 'Botón de ejemplo', ctaUrl: site.url,
    note: 'Nota de ejemplo.', securityNote: 'Aviso de seguridad de ejemplo.',
    footerNote: 'Plantilla de debug generada por la devcon. No se envía en producción.',
    extraHtml, devcon: input.devcon,
  });
}

/* -------------------------- Plantillas Supabase Auth -------------------------- */
// El botón usa la variable literal de Supabase `{{ .ConfirmationURL }}`; el
// resto del diseño es idéntico al de la app. `apply` las sube a Supabase.

const SUPABASE_URL_VAR = '{{ .ConfirmationURL }}';

export function authConfirmationEmail(recipient?: EmailRecipient, devcon?: boolean): RenderedEmail {
  return renderBrandedEmail({
    siteKey: 'ciszu', category: 'confirmation', title: 'Confirma tu cuenta',
    intro: 'Recibes este correo porque alguien (esperamos que tú) se registró en el ecosistema de Ciszu Network.',
    recipient, loggedIn: false, ctaLabel: 'Confirmar mi correo', ctaUrl: SUPABASE_URL_VAR,
    subjectOverride: 'Confirma tu cuenta | Ciszu Network', devcon,
  });
}

export function authRecoveryEmail(recipient?: EmailRecipient, devcon?: boolean): RenderedEmail {
  return renderBrandedEmail({
    siteKey: 'ciszu', category: 'recovery', title: 'Restablece tu contraseña',
    intro: 'Recibes este correo porque se solicitó restablecer la contraseña de tu cuenta en Ciszu Network.',
    recipient, loggedIn: false, ctaLabel: 'Restablecer contraseña', ctaUrl: SUPABASE_URL_VAR,
    securityNote: 'Si no lo solicitaste, ignora este correo: tu contraseña no cambiará.',
    subjectOverride: 'Restablece tu contraseña | Ciszu Network', devcon,
  });
}

export function authMagicLinkEmail(recipient?: EmailRecipient, devcon?: boolean): RenderedEmail {
  return renderBrandedEmail({
    siteKey: 'ciszu', category: 'magic_link', title: 'Tu enlace mágico',
    intro: 'Usa este enlace para iniciar sesión en tu cuenta de Ciszu Network de forma segura.',
    recipient, loggedIn: false, ctaLabel: 'Entrar con enlace mágico', ctaUrl: SUPABASE_URL_VAR,
    subjectOverride: 'Tu enlace mágico | Ciszu Network', devcon,
  });
}

export function authEmailChangeEmail(recipient?: EmailRecipient, devcon?: boolean): RenderedEmail {
  return renderBrandedEmail({
    siteKey: 'ciszu', category: 'email_change', title: 'Confirma tu nuevo correo',
    intro: 'Recibes este correo para confirmar el cambio de dirección de correo de tu cuenta en Ciszu Network.',
    recipient, loggedIn: false, ctaLabel: 'Confirmar nuevo correo', ctaUrl: SUPABASE_URL_VAR,
    subjectOverride: 'Confirma tu nuevo correo | Ciszu Network', devcon,
  });
}

export function authInviteEmail(recipient?: EmailRecipient, devcon?: boolean): RenderedEmail {
  return renderBrandedEmail({
    siteKey: 'ciszu', category: 'invite', title: 'Te han invitado a Ciszu Network',
    intro: 'Te han invitado a unirte al ecosistema de Ciszu Network.',
    recipient, loggedIn: false, ctaLabel: 'Aceptar invitación', ctaUrl: SUPABASE_URL_VAR,
    subjectOverride: 'Invitación a Ciszu Network', devcon,
  });
}

/* ------------------------------ Transporte ------------------------------ */

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
  allowPreview?: boolean;
}

export interface SendEmailResult {
  sent: boolean;
  error?: string;
  providerId?: string;
  previewOnly?: boolean;
  via?: 'Resend' | 'Gmail';
}

/**
 * Envía por Gmail API (OAuth del sistema). Requiere las env vars
 * GOOGLE_OAUTH_CLIENT_ID / SECRET / REFRESH_TOKEN (en el vault / Vercel).
 * Es la credencial DEL SISTEMA (sender central), no del empleado.
 */
export async function sendViaGmail(input: SendEmailInput): Promise<SendEmailResult> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refresh = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const allowPreview = input.allowPreview ?? process.env.EMAIL_ALLOW_PREVIEW === '1';
  if (!clientId || !clientSecret || !refresh) {
    if (allowPreview) return { sent: false, previewOnly: true, error: 'Vista previa local: falta OAuth de Gmail.' };
    return { sent: false, error: 'No hay credencial OAuth de Gmail del sistema (faltan GOOGLE_OAUTH_*).' };
  }
  try {
    const doFetch = input.fetchImpl ?? fetch;
    const tr = await doFetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refresh, grant_type: 'refresh_token' }),
    });
    if (!tr.ok) return { sent: false, error: `OAuth: token ${tr.status}` };
    const { access_token } = (await tr.json()) as { access_token?: string };
    if (!access_token) return { sent: false, error: 'OAuth: sin access_token' };
    let accountEmail = EMAIL_BRAND_EMAIL;
    try {
      const ui = await doFetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${access_token}` } });
      if (ui.ok) { const u = (await ui.json()) as { email?: string }; if (u.email) accountEmail = u.email; }
    } catch { /* usa el por defecto */ }
    const rfc = `From: Ciszu Network <${accountEmail}>\r\nTo: ${input.to}\r\nSubject: =?UTF-8?B?${Buffer.from(input.subject).toString('base64')}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${input.html}`;
    const raw = Buffer.from(rfc).toString('base64url');
    const sr = await doFetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });
    if (!sr.ok) { const t = await sr.text(); return { sent: false, error: `Gmail ${sr.status}: ${t.slice(0, 120)}` }; }
    const data = (await sr.json().catch(() => ({}))) as { id?: string };
    return { sent: true, providerId: data.id, via: 'Gmail' };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : 'Fallo de red al enviar por Gmail.' };
  }
}

/**
 * Envía un email. Orden de transporte: Resend (si hay `RESEND_API_KEY`) y, si
 * no, Gmail API (OAuth del sistema). Sin ninguna de las dos, devuelve el motivo
 * en vez de fingir éxito. Con `EMAIL_ALLOW_PREVIEW=1` marca `previewOnly`.
 */
export async function sendBrandedEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = input.apiKey ?? process.env.RESEND_API_KEY;
  const from = input.from ?? process.env.EMAIL_FROM_RESEND ?? process.env.EMAIL_FROM;
  const allowPreview = input.allowPreview ?? process.env.EMAIL_ALLOW_PREVIEW === '1';
  const doFetch = input.fetchImpl ?? fetch;

  // 1) Resend si hay key: su error es informativo (se reporta tal cual).
  if (apiKey && from) {
    try {
      const res = await doFetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { id?: string };
        return { sent: true, providerId: data.id, via: 'Resend' };
      }
      const detail = await res.text().catch(() => '');
      if (allowPreview) return { sent: false, previewOnly: true, error: `Vista previa local (Resend ${res.status}).` };
      return { sent: false, error: `Resend HTTP ${res.status}: ${detail.slice(0, 200)}` };
    } catch (err) {
      if (allowPreview) return { sent: false, previewOnly: true, error: 'Vista previa local: fallo de Resend.' };
      return { sent: false, error: err instanceof Error ? err.message : 'Fallo de red al enviar por Resend.' };
    }
  }

  // 2) Sin Resend: Gmail API (OAuth del sistema), hasta que haya dominio.
  const gmail = await sendViaGmail(input);
  if (gmail.sent) return gmail;
  if (gmail.previewOnly) return gmail;
  if (allowPreview) return { sent: false, previewOnly: true, error: 'Vista previa local: falta RESEND_API_KEY o el OAuth de Gmail.' };

  return { sent: false, error: `No hay transporte de email disponible: falta RESEND_API_KEY · ${gmail.error}. La credencial de envío es del sistema (vault/Vercel).` };
}

export { EMAIL_SITE_ISOTYPES, EMAIL_CISZU_WORDMARK, EMAIL_SOCIAL_ICONS, EMAIL_CATEGORY_ICONS, EMAIL_UI_ICONS, EMAIL_SITE_HEADER_EXTRAS, EMAIL_FOOTER_ISOTYPE, EMAIL_CROSSOVER };