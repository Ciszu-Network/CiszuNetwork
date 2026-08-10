/**
 * Sistema de pagos de Ciszu Network.
 *
 * Proveedores:
 *  - nowpayments  → activo hoy (crypto, sin KYC). Env: NOWPAYMENTS_API_KEY, NOWPAYMENTS_IPN_SECRET
 *  - lemonsqueezy → se activa a los 18 años (MoR, tarjetas/PayPal).
 *                    Env: LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID, LEMONSQUEEZY_PRODUCT_ID,
 *                    LEMONSQUEEZY_WEBHOOK_SECRET
 */

import { PaymentProvider } from './types';
import { createNowPaymentsProvider } from './nowpayments';
import { createLemonSqueezyProvider } from './lemonsqueezy';

export * from './types';
export { createNowPaymentsProvider, NOWPAYMENTS_API } from './nowpayments';
export { createLemonSqueezyProvider, LEMONSQUEEZY_API } from './lemonsqueezy';
export { getDonationMethods } from './donations';
export type { DonationMethod } from './donations';

export type PaymentProviderName = 'nowpayments' | 'lemonsqueezy';

export function getPaymentProvider(name: PaymentProviderName = 'nowpayments'): PaymentProvider {
  switch (name) {
    case 'lemonsqueezy':
      return createLemonSqueezyProvider();
    case 'nowpayments':
    default:
      return createNowPaymentsProvider();
  }
}
