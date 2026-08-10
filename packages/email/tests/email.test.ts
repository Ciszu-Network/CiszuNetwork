import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createBrevoProvider,
  createResendProvider,
  sendEmail,
  getEmailProvider,
  EmailNotConfiguredError,
  EmailProviderUnavailableError,
} from '../src/index';

const ORIGINAL_ENV = { ...process.env };

function mockFetchOk(status = 200, body: unknown = {}) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

function mockFetchFail(status = 500, detail = 'boom') {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({}),
    text: async () => detail,
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetchOk());
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...ORIGINAL_ENV };
});

describe('packages/email', () => {
  it('brevo: envía con la API v3 y headers correctos', async () => {
    process.env.BREVO_API_KEY = 'xkeys-123';
    process.env.EMAIL_FROM = 'Ciszu Network <no-reply@ciszu.network>';
    const fetchMock = vi.mocked(fetch);
    const provider = createBrevoProvider();
    const result = await provider.send({
      to: 'fan@example.com',
      subject: 'Hola',
      html: '<b>test</b>',
      text: 'test',
    });

    expect(result.provider).toBe('brevo');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'api-key': 'xkeys-123' }),
      })
    );
    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    expect(body.sender.email).toBe('no-reply@ciszu.network');
    expect(body.to).toEqual([{ email: 'fan@example.com', name: undefined }]);
  });

  it('brevo: lanza EmailNotConfiguredError si falta la API key', async () => {
    delete process.env.BREVO_API_KEY;
    const provider = createBrevoProvider({ apiKey: undefined });
    await expect(provider.send({ to: 'x@y.com', subject: 's' })).rejects.toBeInstanceOf(
      EmailNotConfiguredError
    );
  });

  it('brevo: lanza EmailError con detalle si el proveedor rechaza (HTTP 500)', async () => {
    process.env.BREVO_API_KEY = 'xkeys-123';
    process.env.EMAIL_FROM = 'Ciszu <a@b.com>';
    vi.stubGlobal('fetch', mockFetchFail(500, 'quota exceeded'));
    const provider = createBrevoProvider();
    await expect(provider.send({ to: 'x@y.com', subject: 's' })).rejects.toThrow(/quota exceeded/);
  });

  it('resend: bloqueado por dominio no verificado salvo RESEND_ALLOW_UNVERIFIED', async () => {
    process.env.RESEND_API_KEY = 're_123';
    process.env.EMAIL_FROM_RESEND = 'Ciszu <a@ciszu.network>';
    const provider = createResendProvider();
    await expect(provider.send({ to: 'x@y.com', subject: 's' })).rejects.toBeInstanceOf(
      EmailProviderUnavailableError
    );
  });

  it('resend: envía con Bearer token y body correcto', async () => {
    process.env.RESEND_API_KEY = 're_123';
    process.env.EMAIL_FROM_RESEND = 'Ciszu <a@ciszu.network>';
    process.env.RESEND_ALLOW_UNVERIFIED = '1';
    const fetchMock = vi.mocked(fetch);
    const provider = createResendProvider();
    await provider.send({ to: 'fan@example.com', subject: 'S', html: '<p>h</p>' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer re_123' }),
      })
    );
    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    expect(body.from).toContain('@ciszu.network');
    expect(body.to).toEqual(['fan@example.com']);
  });

  it('sendEmail: primario brevo por defecto y fallback solo con EMAIL_FAILOVER=1', async () => {
    process.env.BREVO_API_KEY = 'xkeys-1';
    process.env.EMAIL_FROM = 'Ciszu <a@b.com>';
    process.env.RESEND_API_KEY = 're_2';
    process.env.EMAIL_FROM_RESEND = 'Ciszu <a@b.com>';
    process.env.RESEND_ALLOW_UNVERIFIED = '1';

    vi.stubGlobal('fetch', mockFetchFail(500, 'primario caido'));
    await expect(sendEmail({ to: 'x@y.com', subject: 's' })).rejects.toThrow();

    process.env.EMAIL_FAILOVER = '1';
    // primario (brevo) falla, fallback (resend) responde OK
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) =>
        String(url).includes('brevo.com')
          ? { ok: false, status: 500, json: async () => ({}), text: async () => 'primario caido' }
          : { ok: true, status: 200, json: async () => ({ id: 'resend-1' }), text: async () => '' }
      )
    );
    const result = await sendEmail({ to: 'x@y.com', subject: 's' });
    expect(result.provider).toBe('resend');
  });

  it('getEmailProvider: selecciona por EMAIL_PROVIDER', () => {
    expect(getEmailProvider().name).toBe('brevo');
    process.env.EMAIL_PROVIDER = 'resend';
    process.env.RESEND_API_KEY = 're_1';
    process.env.EMAIL_FROM_RESEND = 'a@b.com';
    process.env.RESEND_ALLOW_UNVERIFIED = '1';
    expect(getEmailProvider().name).toBe('resend');
  });
});
