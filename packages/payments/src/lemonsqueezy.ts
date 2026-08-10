/**
 * Stub de Lemon Squeezy (MoR) — se activará a los 18 años de Ciszuko.
 * Lemon Squeezy funciona desde Venezuela (payouts vía PayPal), fee 5% + $0.50,
 * gestiona impuestos/IVA/facturas y chargebacks como Merchant of Record.
 * Las funciones quedan cableadas para que al cumplir 18 solo haya que:
 *   1) crear la cuenta, 2) llenar env vars, 3) crear el store con los productos.
 *
 * API: https://docs.lemonsqueezy.com/api
 *  - Crear checkout:  POST /v1/checkouts  (Authorization: Bearer {apiKey}, contenido JSON)
 */

import {
  PaymentError,
  PaymentNotConfiguredError,
  PaymentOrder,
  PaymentProvider,
  PaymentResult,
  PaymentStatus,
  PaymentWebhookEvent,
} from './types';

export const LEMONSQUEEZY_API = 'https://api.lemonsqueezy.com/v1';

export interface LemonSqueezyOptions {
  apiKey?: string;
  baseUrl?: string;
}

/** Mapeo de estados del webhook de Lemon Squeezy (order_created, order_refunded...) */
const STATUS_MAP: Record<string, PaymentStatus> = {
  order_created: 'confirmed',
  order_refunded: 'refunded',
  order_failed: 'failed',
};

export function createLemonSqueezyProvider(opts: LemonSqueezyOptions = {}): PaymentProvider {
  const apiKey = opts.apiKey ?? process.env.LEMONSQUEEZY_API_KEY;
  const baseUrl = opts.baseUrl ?? LEMONSQUEEZY_API;

  return {
    name: 'lemonsqueezy',

    async createInvoice(order: PaymentOrder): Promise<PaymentResult> {
      if (!apiKey) throw new PaymentNotConfiguredError('lemonsqueezy', 'LEMONSQUEEZY_API_KEY');
      if (!process.env.LEMONSQUEEZY_PRODUCT_ID) {
        throw new PaymentError('Lemon Squeezy requiere LEMONSQUEEZY_PRODUCT_ID en el entorno');
      }
      const res = await fetch(`${baseUrl}/checkouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'checkouts',
            attributes: {
              checkout_data: {
                custom: { order_id: order.id },
                email: order.customerEmail,
                product_options: {
                  description: order.product,
                },
              },
            },
            relationships: {
              store: { data: { type: 'stores', id: String(process.env.LEMONSQUEEZY_STORE_ID) } },
              variant: { data: { type: 'variants', id: String(process.env.LEMONSQUEEZY_PRODUCT_ID) } },
            },
          },
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new PaymentError(`Lemon Squeezy rechazó el checkout (HTTP ${res.status}): ${detail.slice(0, 300)}`);
      }
      const data = (await res.json()) as { data?: { id?: string; attributes?: { url?: string } } };
      return {
        provider: 'lemonsqueezy',
        providerOrderId: data.data?.id,
        checkoutUrl: data.data?.attributes?.url,
        status: 'pending',
      };
    },

    async verifyWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent | null> {
      // Lemon Squeezy firma el webhook con HMAC-SHA256 (secret) en el header X-Signature.
      const signature = headers.get('x-signature');
      if (!signature) return null;
      const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
      if (!secret) throw new PaymentNotConfiguredError('lemonsqueezy', 'LEMONSQUEEZY_WEBHOOK_SECRET');

      const { createHmac, timingSafeEqual } = await import('node:crypto');
      const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
      const a = Buffer.from(signature);
      const b = Buffer.from(expected);
      if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(rawBody) as Record<string, unknown>;
      } catch {
        return null;
      }
      const meta = (payload.meta ?? {}) as Record<string, unknown>;
      const eventName = String(meta.event_name ?? payload.event_name ?? '');
      const data = (payload.data ?? {}) as { id?: string; attributes?: Record<string, unknown> };
      const attributes = (data.attributes ?? {}) as Record<string, unknown>;
      return {
        provider: 'lemonsqueezy',
        providerOrderId: String(attributes.order_id ?? data.id ?? ''),
        status: STATUS_MAP[eventName] ?? 'pending',
        amount: typeof attributes.subtotal === 'number' ? attributes.subtotal : undefined,
        currency: String(attributes.currency ?? 'usd'),
        raw: payload,
      };
    },
  };
}
