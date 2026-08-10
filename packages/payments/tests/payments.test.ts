import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createNowPaymentsProvider,
  createLemonSqueezyProvider,
  getPaymentProvider,
  getDonationMethods,
  PaymentNotConfiguredError,
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

const HMAC = 'sha512';

function sign(raw: string, secret: string, algo: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHmac } = require('node:crypto') as typeof import('node:crypto');
  return createHmac(algo, secret).update(raw).digest('hex');
}

describe('packages/payments', () => {
  describe('NOWPayments', () => {
    it('createInvoice: llama a /v1/invoice con x-api-key y devuelve checkout', async () => {
      process.env.NOWPAYMENTS_API_KEY = 'np-key-123';
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 555, invoice_url: 'https://checkout', payment_status: 'waiting' }),
        text: async () => '',
      } as unknown as Response);
      const provider = createNowPaymentsProvider();
      const result = await provider.createInvoice({
        id: 'order-1',
        product: 'Donación',
        amountUsd: 5,
        successUrl: 'https://ciszunetwork.vercel.app/gracias',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.nowpayments.io/v1/invoice',
        expect.objectContaining({
          headers: expect.objectContaining({ 'x-api-key': 'np-key-123' }),
        })
      );
      const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
      expect(body.price_amount).toBe(5);
      expect(body.price_currency).toBe('usd');
      expect(body.order_id).toBe('order-1');
      expect(result.checkoutUrl).toBe('https://checkout');
      expect(result.status).toBe('waiting');
    });

    it('createInvoice: lanza PaymentNotConfiguredError sin API key', async () => {
      delete process.env.NOWPAYMENTS_API_KEY;
      const provider = createNowPaymentsProvider();
      await expect(
        provider.createInvoice({ id: 'x', product: 'p', amountUsd: 1 })
      ).rejects.toBeInstanceOf(PaymentNotConfiguredError);
    });

    it('verifyWebhook: valida HMAC-SHA512 y mapea finished→confirmed', async () => {
      process.env.NOWPAYMENTS_IPN_SECRET = 'ipn-secret';
      const raw = JSON.stringify({
        payment_id: 42,
        payment_status: 'finished',
        actually_paid: 4.9,
        pay_currency: 'usdt_trc20',
        order_id: 'order-9',
      });
      const headers = new Headers({ 'x-nowpayments-sig': sign(raw, 'ipn-secret', HMAC) });
      const provider = createNowPaymentsProvider();
      const event = await provider.verifyWebhook(raw, headers);

      expect(event).not.toBeNull();
      expect(event!.provider).toBe('nowpayments');
      expect(event!.status).toBe('confirmed');
      expect(event!.providerOrderId).toBe('42');
      expect(event!.amount).toBe(4.9);
    });

    it('verifyWebhook: rechaza firma inválida (null) y falta de header', async () => {
      process.env.NOWPAYMENTS_IPN_SECRET = 'ipn-secret';
      const raw = '{"payment_id":1}';
      const provider = createNowPaymentsProvider();

      expect(await provider.verifyWebhook(raw, new Headers())).toBeNull();
      expect(
        await provider.verifyWebhook(raw, new Headers({ 'x-nowpayments-sig': 'firma-mala' }))
      ).toBeNull();
    });

    it('createInvoice: propaga rechazo HTTP del proveedor', async () => {
      process.env.NOWPAYMENTS_API_KEY = 'np-key';
      vi.stubGlobal('fetch', mockFetchFail(401, 'unauthorized'));
      const provider = createNowPaymentsProvider();
      await expect(
        provider.createInvoice({ id: 'x', product: 'p', amountUsd: 1 })
      ).rejects.toThrow(/unauthorized/);
    });
  });

  describe('Lemon Squeezy', () => {
    it('createInvoice: requiere configuración de store/producto', async () => {
      process.env.LEMONSQUEEZY_API_KEY = 'ls-key';
      const provider = createLemonSqueezyProvider();
      await expect(
        provider.createInvoice({ id: 'x', product: 'p', amountUsd: 1 })
      ).rejects.toThrow(/LEMONSQUEEZY_PRODUCT_ID/);
    });

    it('verifyWebhook: valida HMAC-SHA256 de X-Signature', async () => {
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'ls-secret';
      const raw = JSON.stringify({
        meta: { event_name: 'order_created' },
        data: { id: 'chk_1', attributes: { order_id: 'chk_1', subtotal: 9.99, currency: 'usd' } },
      });
      const headers = new Headers({ 'X-Signature': sign(raw, 'ls-secret', 'sha256') });
      const provider = createLemonSqueezyProvider();
      const event = await provider.verifyWebhook(raw, headers);

      expect(event).not.toBeNull();
      expect(event!.status).toBe('confirmed');
      expect(event!.amount).toBe(9.99);
    });
  });

  it('getPaymentProvider: devuelve nowpayments por defecto', () => {
    expect(getPaymentProvider().name).toBe('nowpayments');
  });

  it('getDonationMethods: solo habilita métodos con dirección en el entorno', () => {
    delete process.env.DONATE_USDT_TRC20;
    process.env.DONATE_BTC = 'bc1q-test';
    const methods = getDonationMethods();
    const usdt = methods.find((m) => m.id === 'usdt-trc20')!;
    const btc = methods.find((m) => m.id === 'btc')!;
    expect(usdt.enabled).toBe(false);
    expect(btc.enabled).toBe(true);
    expect(btc.address).toBe('bc1q-test');
    expect(methods.find((m) => m.id === 'paypal')!.requiresAdult).toBe(true);
  });
});
