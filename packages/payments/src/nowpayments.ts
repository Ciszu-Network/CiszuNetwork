/**
 * Implementación NOWPayments del PaymentProvider (crypto, sin KYC de merchant).
 *
 * Docs API: https://documenter.getpostman.com/view/7907941/S17tQXun
 *  - Crear invoice:  POST /v1/invoice  (header x-api-key)
 *  - Estado pago:    GET  /v1/payment/{payment_id}  (header x-api-key)
 *  - IPN webhook:    header `x-nowpayments-sig` = HMAC-SHA512(body crudo, IPN secret)
 *
 * Fees: 0.5% mono-currency / 1% multi-currency o fixed rate. Payouts a tu propia wallet.
 * Estados IPN: waiting, confirming, confirmed, sending, partially_paid, finished,
 *              failed, refunded, expired.
 * Mapeo: finished/confirmed/sending => confirmed ; waiting/confirming => waiting ;
 *        failed/refunded/expired => su propio estado.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  PaymentError,
  PaymentNotConfiguredError,
  PaymentOrder,
  PaymentProvider,
  PaymentResult,
  PaymentStatus,
  PaymentWebhookEvent,
} from './types';

export const NOWPAYMENTS_API = 'https://api.nowpayments.io';

export interface NowPaymentsOptions {
  apiKey?: string;
  ipnSecret?: string;
  baseUrl?: string;
}

const STATUS_MAP: Record<string, PaymentStatus> = {
  waiting: 'waiting',
  confirming: 'waiting',
  confirmed: 'confirmed',
  sending: 'confirmed',
  finished: 'confirmed',
  partially_paid: 'partially_paid',
  failed: 'failed',
  refunded: 'refunded',
  expired: 'expired',
};

export function createNowPaymentsProvider(opts: NowPaymentsOptions = {}): PaymentProvider {
  const apiKey = opts.apiKey ?? process.env.NOWPAYMENTS_API_KEY;
  const ipnSecret = opts.ipnSecret ?? process.env.NOWPAYMENTS_IPN_SECRET;
  const baseUrl = opts.baseUrl ?? process.env.NOWPAYMENTS_API ?? NOWPAYMENTS_API;

  return {
    name: 'nowpayments',

    async createInvoice(order: PaymentOrder): Promise<PaymentResult> {
      if (!apiKey) throw new PaymentNotConfiguredError('nowpayments', 'NOWPAYMENTS_API_KEY');
      const res = await fetch(`${baseUrl}/v1/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          price_amount: order.amountUsd,
          price_currency: (order.currency ?? 'usd').toLowerCase(),
          order_id: order.id,
          order_description: order.product,
          ipn_callback_url: order.metadata?.ipnCallbackUrl,
          success_url: order.successUrl,
          cancel_url: order.cancelUrl,
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new PaymentError(`NOWPayments rechazó la invoice (HTTP ${res.status}): ${detail.slice(0, 300)}`);
      }
      const data = (await res.json()) as { id?: number; invoice_url?: string; payment_status?: string };
      return {
        provider: 'nowpayments',
        providerOrderId: data.id != null ? String(data.id) : undefined,
        checkoutUrl: data.invoice_url,
        status: (data.payment_status ? STATUS_MAP[data.payment_status] : undefined) ?? 'pending',
      };
    },

    async verifyWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent | null> {
      if (!ipnSecret) throw new PaymentNotConfiguredError('nowpayments', 'NOWPAYMENTS_IPN_SECRET');
      const signature = headers.get('x-nowpayments-sig');
      if (!signature) return null;

      const expected = createHmac('sha512', ipnSecret).update(rawBody).digest('hex');
      const a = Buffer.from(signature);
      const b = Buffer.from(expected);
      if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(rawBody) as Record<string, unknown>;
      } catch {
        return null;
      }
      const rawStatus = String(payload.payment_status ?? '');
      return {
        provider: 'nowpayments',
        providerOrderId: payload.payment_id != null ? String(payload.payment_id) : String(payload.order_id ?? ''),
        status: STATUS_MAP[rawStatus] ?? 'pending',
        amount: typeof payload.actually_paid === 'number' ? payload.actually_paid : undefined,
        currency: typeof payload.pay_currency === 'string' ? payload.pay_currency : undefined,
        raw: payload,
      };
    },
  };
}
