/**
 * Tipos base del sistema de pagos de Ciszu Network.
 * Estrategia (11 ago 2026, ver projects/ciszu/docs/documentation/PAYMENTS_SYSTEM.md):
 *   - HOY: NOWPayments (crypto, sin KYC de merchant, fee 0.5-1%, IPN webhook con HMAC-SHA512).
 *   - A LOS 18: Lemon Squeezy (MoR: tarjetas/PayPal globales, IVA/impuestos y facturas por su cuenta, payout vía PayPal).
 *   - FUTURO: Stripe directo (con LLC / INTERNATIONAL_LLC_GUIDE) y Binance Pay (KYC).
 */

export type PaymentStatus =
  | 'pending'
  | 'waiting'
  | 'confirmed'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'expired'
  | 'partially_paid';

export interface PaymentOrder {
  /** Id interno de la orden (uuid en Supabase `pagos.orders`). */
  id: string;
  product: string;
  amountUsd: number;
  currency?: string;
  customerEmail?: string;
  metadata?: Record<string, unknown>;
  /** URLs de retorno opcionales para el checkout del proveedor. */
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResult {
  provider: string;
  providerOrderId?: string;
  checkoutUrl?: string;
  status: PaymentStatus;
}

export interface PaymentWebhookEvent {
  provider: string;
  providerOrderId: string;
  /** Status normalizado del proveedor (ver PAYMENTS_SYSTEM.md §verificación). */
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  raw: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  /** Crea una orden/factura de pago en el proveedor. */
  createInvoice(order: PaymentOrder): Promise<PaymentResult>;
  /**
   * Verifica y parsea un webhook/IPN del proveedor.
   * Devuelve el evento si la firma es válida, o null si es rechazado.
   */
  verifyWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent | null>;
}

export class PaymentError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class PaymentNotConfiguredError extends PaymentError {
  constructor(provider: string, envKey: string) {
    super(`PaymentProvider '${provider}' no configurado: falta la env var ${envKey}`);
    this.name = 'PaymentNotConfiguredError';
  }
}
