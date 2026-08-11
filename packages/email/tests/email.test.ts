import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createResendProvider,
  sendEmail,
  getEmailProvider,
  getFallbackProvider,
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

  it('resend: lanza EmailNotConfiguredError si falta la API key', async () => {
    delete process.env.RESEND_API_KEY;
    process.env.RESEND_ALLOW_UNVERIFIED = '1';
    const provider = createResendProvider({ apiKey: undefined });
    await expect(provider.send({ to: 'x@y.com', subject: 's' })).rejects.toBeInstanceOf(
      EmailNotConfiguredError
    );
  });

  it('resend: lanza EmailError con detalle si el proveedor rechaza (HTTP 429)', async () => {
    process.env.RESEND_API_KEY = 're_123';
    process.env.EMAIL_FROM_RESEND = 'Ciszu <a@ciszu.network>';
    process.env.RESEND_ALLOW_UNVERIFIED = '1';
    vi.stubGlobal('fetch', mockFetchFail(429, 'rate limited'));
    const provider = createResendProvider();
    await expect(provider.send({ to: 'x@y.com', subject: 's' })).rejects.toThrow(/rate limited/);
  });

  it('sendEmail: lanza EmailNotConfiguredError sin Resend ni dominio (estado HOY)', async () => {
    delete process.env.RESEND_API_KEY;
    await expect(sendEmail({ to: 'x@y.com', subject: 's' })).rejects.toBeInstanceOf(
      EmailNotConfiguredError
    );
  });

  it('sendEmail: sin failover — falla directo si Resend rechaza', async () => {
    process.env.RESEND_API_KEY = 're_1';
    process.env.EMAIL_FROM_RESEND = 'Ciszu <a@b.com>';
    process.env.RESEND_ALLOW_UNVERIFIED = '1';
    vi.stubGlobal('fetch', mockFetchFail(500, 'primario caido'));
    await expect(sendEmail({ to: 'x@y.com', subject: 's' })).rejects.toThrow(/primario caido/);
  });

  it('getEmailProvider/getFallbackProvider: Resend es el único proveedor (Brevo descartado)', () => {
    process.env.RESEND_API_KEY = 're_1';
    expect(getEmailProvider().name).toBe('resend');
    expect(getFallbackProvider()).toBeNull();
  });
});