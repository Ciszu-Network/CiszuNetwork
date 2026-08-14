import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { createNowPaymentsProvider, PaymentError } from '@ciszunetwork/payments';

/**
 * POST /api/payments/invoice
 * Crea una factura de donación en NOWPayments (crypto, sin KYC).
 * Body: { amount: number (USD), email?: string }
 * Devuelve: { checkoutUrl } para redirigir al checkout de NOWPayments.
 * Rate limit: 10/min por IP (regla SECURITY_PROTOCOLS.md #3).
 */
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 10_000;

const invoiceSchema = z.object({
  amount: z.number().min(MIN_AMOUNT).max(MAX_AMOUNT),
  email: z.string().email().max(254).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiadas solicitudes. Espera un minuto.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  try {
    const parsed = await parseJsonBody(request, invoiceSchema);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: firstZodMessage(parsed.error) },
        { status: 400 }
      );
    }
    const { amount, email } = parsed.data;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ciszunetwork.vercel.app';
    const provider = createNowPaymentsProvider();
    const result = await provider.createInvoice({
      id: `donacion-${Date.now()}`,
      product: 'Donación a Ciszu Network',
      amountUsd: amount,
      currency: 'usd',
      customerEmail: email,
      successUrl: `${siteUrl}/?donacion=ok`,
      cancelUrl: `${siteUrl}/?donacion=cancelada`,
      metadata: { ipnCallbackUrl: `${siteUrl}/api/webhooks/nowpayments` },
    });

    if (!result.checkoutUrl) {
      return NextResponse.json(
        { success: false, error: 'El proveedor no devolvió URL de checkout' },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true, checkoutUrl: result.checkoutUrl });
  } catch (err) {
    if (err instanceof PaymentError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    console.error('[payments] createInvoice error:', err);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
