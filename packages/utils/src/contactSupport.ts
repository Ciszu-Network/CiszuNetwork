import tls from 'node:tls';
import { once } from 'node:events';

export type ContactSource = 'contact' | 'support';
export type SupportSiteKey = 'ciszunetwork' | 'ciszubot' | 'ciszukoantony' | 'muzicmania';

export const SUPPORT_SITES: Record<
  SupportSiteKey,
  { name: string; table: string; schema: 'public' | 'muzicmania'; profileSchema: 'ciszunetwork' | 'ciszubot' | 'ciszukoantony' | 'muzicmania'; prefix: string; recipients: string[]; url: string }
> = {
  ciszunetwork: {
    name: 'Ciszu Network',
    table: 'ciszunetwork_tickets',
    schema: 'public',
    profileSchema: 'ciszunetwork',
    prefix: 'CZN',
    recipients: ['ciszunetwork@outlook.com', 'ciszunetwork@gmail.com'],
    url: 'https://ciszunetwork.vercel.app',
  },
  ciszubot: {
    name: 'CiszuBot',
    table: 'ciszubot_tickets',
    schema: 'public',
    profileSchema: 'ciszubot',
    prefix: 'CZB',
    recipients: ['ciszunetwork@outlook.com', 'ciszunetwork@gmail.com'],
    url: 'https://ciszubot.vercel.app',
  },
  ciszukoantony: {
    name: 'Ciszuko Antony',
    table: 'ciszukoantony_tickets',
    schema: 'public',
    profileSchema: 'ciszukoantony',
    prefix: 'CZA',
    recipients: ['fplayersoffcial@gmail.com'],
    url: 'https://ciszukoantony.vercel.app',
  },
  muzicmania: {
    name: 'MuzicMania',
    table: 'tickets',
    schema: 'muzicmania',
    profileSchema: 'muzicmania',
    prefix: 'MZM',
    recipients: ['ciszunetwork@outlook.com', 'ciszunetwork@gmail.com'],
    url: 'https://muzicmania.vercel.app',
  },
};

export interface ContactSupportPayload {
  site: SupportSiteKey;
  source: ContactSource;
  name: string;
  email: string;
  subject: string;
  message: string;
  form: Record<string, string>;
  ticketId?: string;
  user?: { id?: string; email?: string; username?: string; displayName?: string };
  activeTickets?: number;
  ticketLimit?: number;
  ticketIndex?: number;
}

const escapeHtml = (value: string): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function siteRecipients(site: SupportSiteKey): string[] {
  const override = process.env[`CONTACT_EMAIL_${site.toUpperCase()}`];
  if (override) return override.split(',').map((value) => value.trim()).filter(Boolean);
  const env = process.env.CONTACT_EMAIL;
  if (env) return env.split(',').map((value) => value.trim()).filter(Boolean);
  return SUPPORT_SITES[site].recipients;
}

function rows(form: Record<string, string>): string {
  return Object.entries(form)
    .filter(([, value]) => String(value ?? '').trim())
    .map(
      ([key, value]) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#64748b;font-size:12px;vertical-align:top">${escapeHtml(key)}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:13px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
}

function internalHtml(payload: ContactSupportPayload): string {
  const site = SUPPORT_SITES[payload.site];
  const title = payload.source === 'support' ? 'Nuevo ticket de soporte' : 'Nuevo mensaje de contacto';
  const user = payload.user ?? {};
  return `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#0f172a;max-width:720px;margin:0 auto">
      <div style="padding:20px;border-radius:16px;background:#0b1020;color:#fff">
        <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#67e8f9">${escapeHtml(site.name)}</p>
        <h1 style="margin:8px 0 0;font-size:22px">${title}</h1>
        <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px">${escapeHtml(payload.subject)}</p>
      </div>
      <div style="padding:18px 0">
        <p style="margin:0 0 8px;font-size:12px;color:#64748b">Ticket / referencia</p>
        <p style="margin:0 0 16px;font-size:18px;font-weight:700">${escapeHtml(payload.ticketId ?? 'CONTACTO-DIRECTO')}</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 10px;color:#64748b;font-size:12px">Nombre</td><td style="padding:6px 10px;font-size:13px">${escapeHtml(payload.name)}</td></tr>
          <tr><td style="padding:6px 10px;color:#64748b;font-size:12px">Email</td><td style="padding:6px 10px;font-size:13px">${escapeHtml(payload.email)}</td></tr>
          <tr><td style="padding:6px 10px;color:#64748b;font-size:12px">Cuenta</td><td style="padding:6px 10px;font-size:13px">${escapeHtml(user.username ?? '—')} · ${escapeHtml(user.id ?? 'sin sesión')}</td></tr>
          <tr><td style="padding:6px 10px;color:#64748b;font-size:12px">Email de cuenta</td><td style="padding:6px 10px;font-size:13px">${escapeHtml(user.email ?? '—')}</td></tr>
          <tr><td style="padding:6px 10px;color:#64748b;font-size:12px">Tickets activos</td><td style="padding:6px 10px;font-size:13px">${payload.activeTickets ?? '—'} / ${payload.ticketLimit ?? '—'} · posición ${payload.ticketIndex ?? '—'}</td></tr>
        </table>
        <h2 style="margin:22px 0 8px;font-size:15px">Datos completos del formulario</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">${rows(payload.form)}</table>
        <p style="margin:20px 0 0;font-size:12px;color:#64748b">Responde a este correo para iniciar el hilo manual con el usuario. El usuario recibirá una copia con su ID.</p>
      </div>
    </div>
  `;
}

function receiptHtml(payload: ContactSupportPayload): string {
  const site = SUPPORT_SITES[payload.site];
  return `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#0f172a;max-width:680px;margin:0 auto">
      <div style="padding:20px;border-radius:16px;background:#0b1020;color:#fff">
        <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#67e8f9">${escapeHtml(site.name)}</p>
        <h1 style="margin:8px 0 0;font-size:22px">${payload.source === 'support' ? 'Ticket recibido' : 'Mensaje recibido'}</h1>
      </div>
      <p style="margin:18px 0">Hemos recibido tu ${payload.source === 'support' ? 'solicitud de soporte' : 'mensaje de contacto'}. Referencia: <strong>${escapeHtml(payload.ticketId ?? 'CONTACTO-DIRECTO')}</strong>.</p>
      <p style="margin:0 0 8px;font-size:12px;color:#64748b">Asunto</p>
      <p style="margin:0 0 16px;font-weight:600">${escapeHtml(payload.subject)}</p>
      <p style="margin:0 0 8px;font-size:12px;color:#64748b">Fecha</p>
      <p style="margin:0 0 16px">${escapeHtml(new Date().toLocaleString('es-ES'))}</p>
      <h2 style="margin:0 0 8px;font-size:15px">Datos enviados</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">${rows(payload.form)}</table>
      <p style="margin:18px 0 8px;font-size:12px;color:#64748b">Tu mensaje</p>
      <p style="margin:0 0 18px;white-space:pre-wrap">${escapeHtml(payload.message)}</p>
      <p style="margin:0 0 18px;font-size:12px;color:#64748b">Responderemos a este correo. Guarda esta referencia para dar seguimiento.</p>
      <a href="${escapeHtml(site.url)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#06b6d4;color:#fff;text-decoration:none;font-weight:700">Abrir ${escapeHtml(site.name)}</a>
    </div>
  `;
}

async function sendViaResend(to: string[], subject: string, html: string, replyTo?: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM_RESEND ?? process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to, subject, html, reply_to: replyTo }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function readSmtp(socket: tls.TLSSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const cleanup = () => {
      clearTimeout(timer);
      socket.off('data', onData);
      socket.off('error', onError);
    };
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString('utf8');
      if (/(?:^|\r\n)\d{3} /.test(buffer)) {
        cleanup();
        resolve(buffer);
      }
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('smtp_timeout'));
    }, 15_000);
    socket.on('data', onData);
    socket.once('error', onError);
  });
}

async function smtpCommand(socket: tls.TLSSocket, command: string): Promise<string> {
  socket.write(`${command}\r\n`);
  const response = await readSmtp(socket);
  if (!/(?:^|\r\n)[23]\d{2} /.test(response)) throw new Error('smtp_rejected');
  return response;
}

async function sendViaGmail(to: string[], subject: string, html: string, replyTo?: string): Promise<boolean> {
  const user = process.env.GMAIL_SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass || to.length === 0) return false;

  let socket: tls.TLSSocket | null = null;
  try {
    socket = tls.connect({ host: 'smtp.gmail.com', port: 465, servername: 'smtp.gmail.com' });
    await once(socket, 'secureConnect');
    await readSmtp(socket);
    await smtpCommand(socket, 'EHLO ciszunetwork');
    await smtpCommand(socket, 'AUTH LOGIN');
    await smtpCommand(socket, Buffer.from(user).toString('base64'));
    await smtpCommand(socket, Buffer.from(pass).toString('base64'));
    await smtpCommand(socket, `MAIL FROM:<${user}>`);
    for (const recipient of to) await smtpCommand(socket, `RCPT TO:<${recipient}>`);
    await smtpCommand(socket, 'DATA');

    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const body = Buffer.from(html)
      .toString('base64')
      .replace(/.{1,76}/g, '$&\r\n');
    const headers = [
      `From: "Ciszu Network" <${user}>`,
      `To: ${to.join(', ')}`,
      `Subject: ${encodedSubject}`,
      ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      `Date: ${new Date().toUTCString()}`,
    ];
    const message = [...headers, '', body].join('\r\n');

    socket.write(`${message}\r\n.\r\n`);
    await readSmtp(socket);
    await smtpCommand(socket, 'QUIT').catch(() => undefined);
    socket.end();
    return true;
  } catch {
    socket?.destroy();
    return false;
  }
}

async function send(to: string[], subject: string, html: string, replyTo?: string): Promise<boolean> {
  if (await sendViaResend(to, subject, html, replyTo)) return true;
  return sendViaGmail(to, subject, html, replyTo);
}

export async function sendContactSupportEmails(
  payload: ContactSupportPayload,
): Promise<{ internal: boolean; receipt: boolean }> {
  const site = SUPPORT_SITES[payload.site];
  const tag = payload.source === 'support' ? 'Soporte' : 'Contacto';
  const subject = `[${tag}] ${payload.subject}`.slice(0, 180);
  const internal = await send(siteRecipients(payload.site), subject, internalHtml(payload), payload.email);
  const receipt = await send(
    [payload.email],
    `[${site.name}] ${payload.ticketId ? `Recibimos tu ticket ${payload.ticketId}` : 'Recibimos tu mensaje'}`,
    receiptHtml(payload),
  );
  return { internal, receipt };
}
