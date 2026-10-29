import tls from 'node:tls';
import { once } from 'node:events';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface ContactMailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: 'contact' | 'support';
  ticketId?: string;
}

function recipients(): string[] {
  return (process.env.CONTACT_EMAIL ?? 'ciszunetwork@outlook.com,ciszunetwork@gmail.com')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildMail(input: ContactMailInput, subject: string) {
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#0f172a">
      <h2>${escapeHtml(subject)}</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      ${input.ticketId ? `<p><strong>Ticket:</strong> ${escapeHtml(input.ticketId)}</p>` : ''}
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>
    </div>
  `;
  return { subject, html };
}

async function sendViaResend(input: ContactMailInput, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM_RESEND ?? process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to: recipients(),
        subject,
        html,
        reply_to: input.email,
      }),
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

async function sendViaGmail(input: ContactMailInput, subject: string, html: string): Promise<boolean> {
  const user = process.env.GMAIL_SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return false;

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
    for (const to of recipients()) await smtpCommand(socket, `RCPT TO:<${to}>`);
    await smtpCommand(socket, 'DATA');

    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const body = Buffer.from(html)
      .toString('base64')
      .replace(/.{1,76}/g, '$&\r\n');
    const message = [
      `From: "Ciszu Network" <${user}>`,
      `To: ${recipients().join(', ')}`,
      `Subject: ${encodedSubject}`,
      `Reply-To: ${input.email}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      `Date: ${new Date().toUTCString()}`,
      '',
      body,
    ].join('\r\n');

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

/**
 * Notificación por email best-effort. El mensaje siempre queda en DB; si no
 * hay proveedor configurado, la API devuelve email_sent=false.
 */
export async function sendContactEmail(input: ContactMailInput): Promise<boolean> {
  const subject = `[${input.source === 'support' ? 'Soporte' : 'Contacto'}] ${input.subject}`.slice(0, 180);
  const { html } = buildMail(input, subject);

  if (await sendViaResend(input, subject, html)) return true;
  return sendViaGmail(input, subject, html);
}
