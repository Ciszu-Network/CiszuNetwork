import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@ciszunetwork/utils';
import { createNowPaymentsProvider } from '@ciszunetwork/payments';

/**
 * POST /api/webhooks/nowpayments
 * Webhook IPN de NOWPayments. Verifica la firma HMAC-SHA512 (`x-nowpayments-sig`)
 * sobre el body crudo y registra los pagos confirmados (best-effort).
 * Reglas: rate limit 30/min por IP, NUNCA confiar en el estado del front.
 */
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const rawBody = await request.text();
  const provider = createNowPaymentsProvider();

  try {
    const event = await provider.verifyWebhook(rawBody, request.headers);
    if (!event) {
      // Firma inválida o ausente: NO es un IPN legítimo de NOWPayments.
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (event.status === 'confirmed') {
      // Pago confirmado — registrar (best-effort, nunca bloquear el IPN).
      console.log(
        `[payments] Pago confirmado: order=${event.providerOrderId} amount=${event.amount ?? '?'} ${event.currency ?? ''}`
      );
      // TODO (cuando exista el schema pagos): upsert en pagos.orders como confirmed
      // y entregar el producto/beneficio aquí. Ver PAYMENTS_SYSTEM.md §5.
    } else if (event.status === 'failed' || event.status === 'refunded' || event.status === 'expired') {
      console.log(
        `[payments] Pago ${event.status}: order=${event.providerOrderId}`
      );
    }

    // NOWPayments espera 200 siempre que se haya recibido y verificado el IPN.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[payments] webhook error:', err);
    // No configurado (falta IPN secret) → devolver 500 para que NOWPayments reintente.
    return NextResponse.json({ error: 'Webhook misconfigured' }, { status: 500 });
  }
}
