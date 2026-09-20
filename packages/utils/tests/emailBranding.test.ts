import { describe, expect, it, vi } from 'vitest';
import {
  EMAIL_LEGAL_LINKS,
  renderBrandedEmail,
  sendBrandedEmail,
  twoFactorEmail,
} from '../src/emailBranding';

describe('renderBrandedEmail', () => {
  it('prefija el asunto con la marca y la web', () => {
    const mail = renderBrandedEmail({ siteName: 'CiszuBot', title: 'Verifica tu identidad', intro: 'Hola.' });
    expect(mail.subject).toBe('Ciszu Network | CiszuBot — Verifica tu identidad');
  });

  it('declara que NO es publicidad en los correos de seguridad', () => {
    const mail = renderBrandedEmail({ siteName: 'MuzicMania', title: 'Acceso', intro: 'Hola.' });
    expect(mail.html).toContain('no es publicidad ni patrocinio');
    expect(mail.text).toContain('NO es publicidad');
  });

  it('declara lo contrario cuando el mensaje sí es promocional', () => {
    const mail = renderBrandedEmail({ siteName: 'MuzicMania', title: 'Novedades', intro: 'Hola.', marketing: true });
    expect(mail.html).toContain('SÍ es una comunicación promocional');
  });

  it('incluye términos, privacidad y soporte', () => {
    const mail = renderBrandedEmail({ siteName: 'CiszuBot', title: 'Acceso', intro: 'Hola.' });
    expect(mail.html).toContain(EMAIL_LEGAL_LINKS.terms);
    expect(mail.html).toContain(EMAIL_LEGAL_LINKS.privacy);
    expect(mail.html).toContain(EMAIL_LEGAL_LINKS.support);
  });

  it('escapa el HTML de los datos de entrada', () => {
    const mail = renderBrandedEmail({
      siteName: '<script>alert(1)</script>',
      title: 'Acceso',
      intro: 'Hola',
    });
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&lt;script&gt;');
  });

  it('muestra el código y el botón cuando se facilitan', () => {
    const mail = renderBrandedEmail({
      siteName: 'CiszuBot',
      title: 'Acceso',
      intro: 'Hola',
      code: 'C-123 434',
      ctaLabel: 'Abrir',
      ctaUrl: 'https://example.com/x',
    });
    expect(mail.html).toContain('C-123 434');
    expect(mail.html).toContain('https://example.com/x');
    expect(mail.text).toContain('CLAVE');
  });
});

describe('twoFactorEmail', () => {
  it('explica caducidad, alcance por web y límite de intentos', () => {
    const mail = twoFactorEmail({ siteName: 'CiszuBot', code: 'C-123 434', expiresInMinutes: 180, maxAttempts: 3 });
    expect(mail.subject).toContain('CiszuBot');
    expect(mail.html).toContain('C-123 434');
    expect(mail.html).toContain('180 minutos');
    expect(mail.html).toContain('solo sirve para CiszuBot');
    expect(mail.html).toContain('3 intentos fallidos');
    expect(mail.html).toContain('no has intentado iniciar sesión');
  });
});

describe('sendBrandedEmail', () => {
  it('no envía y explica el motivo si falta configuración', async () => {
    const res = await sendBrandedEmail(
      { to: 'a@b.com', subject: 's', html: 'h', text: 't', apiKey: '', from: '' },
      );
    expect(res.sent).toBe(false);
    expect(res.error).toMatch(/no hay proveedor de email configurado/i);
  });

  it('marca previewOnly en local en vez de fingir un envío', async () => {
    const res = await sendBrandedEmail({
      to: 'a@b.com',
      subject: 's',
      html: 'h',
      text: 't',
      apiKey: '',
      from: '',
      allowPreview: true,
    });
    expect(res.sent).toBe(false);
    expect(res.previewOnly).toBe(true);
  });

  it('envía por Resend y devuelve el id', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, json: async () => ({ id: 'mail-1' }) })) as unknown as typeof fetch;
    const res = await sendBrandedEmail({
      to: 'a@b.com',
      subject: 's',
      html: 'h',
      text: 't',
      apiKey: 'key',
      from: 'Ciszu Network <no-reply@ciszu.network>',
      fetchImpl,
    });
    expect(res.sent).toBe(true);
    expect(res.providerId).toBe('mail-1');

    const body = JSON.parse(String((fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0][1].body));
    expect(body.to).toEqual(['a@b.com']);
    expect(body.from).toContain('Ciszu Network');
  });

  it('informa del rechazo del proveedor con el detalle', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 422,
      text: async () => 'domain not verified',
    })) as unknown as typeof fetch;
    const res = await sendBrandedEmail({
      to: 'a@b.com',
      subject: 's',
      html: 'h',
      text: 't',
      apiKey: 'key',
      from: 'x@y.com',
      fetchImpl,
    });
    expect(res.sent).toBe(false);
    expect(res.error).toContain('422');
    expect(res.error).toContain('domain not verified');
  });
});
