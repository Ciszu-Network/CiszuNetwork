import { NextRequest, NextResponse } from 'next/server';
import { createNowPaymentsProvider } from '@ciszunetwork/payments';
import { createRateLimiter } from '@ciszunetwork/utils';
import { adminClient } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TERMINAL_STATUSES = new Set(['failed', 'refunded', 'expired']);

function logFailure(stage: string, details: Record<string, string>) {
  console.error(`[nowpayments] ${stage}`, details);
}

function errorMessage(error: { message?: string } | null): string {
  return typeof error?.message === 'string' ? error.message.slice(0, 200) : 'unknown';
}

async function markOrderReview(admin: any, orderId: string): Promise<string | null> {
  const { error } = await admin.schema('pagos').from('orders')
    .update({ status: 'review', updated_at: new Date().toISOString() })
    .eq('id', orderId).neq('status', 'fulfilled');
  return error ? errorMessage(error) : null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const raw = await req.text();
  const provider = createNowPaymentsProvider();
  const event = await provider.verifyWebhook(raw, req.headers);
  if (!event) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });

  const payload = event.raw as Record<string, unknown>;
  const orderId = typeof payload.order_id === 'string' ? payload.order_id : '';
  const paymentId = payload.payment_id != null ? String(payload.payment_id) : '';
  if (!orderId) return NextResponse.json({ error: 'missing_order' }, { status: 400 });
  if (!UUID.test(orderId)) return NextResponse.json({ error: 'invalid_order_id' }, { status: 400 });
  if (!paymentId) return NextResponse.json({ error: 'missing_payment_id' }, { status: 400 });

  const eventId = `${paymentId}:${payload.payment_status ?? 'unknown'}`;

  const admin = adminClient() as any;
  const existing = await admin.schema('pagos').from('webhook_events').select('processed_at').eq('provider', event.provider).eq('event_id', eventId).maybeSingle();
  if (existing.error) {
    logFailure('webhook event lookup failed', { eventId, message: errorMessage(existing.error) });
    return NextResponse.json({ error: 'audit_failed' }, { status: 500 });
  }
  if (existing.data?.processed_at) return NextResponse.json({ ok: true, duplicate: true });

  const stored = await admin.schema('pagos').from('webhook_events').upsert({
    provider: event.provider,
    event_id: eventId,
    payload,
    signature_valid: true,
  }, { onConflict: 'provider,event_id', ignoreDuplicates: true });
  if (stored.error) {
    logFailure('webhook event upsert failed', { eventId, message: errorMessage(stored.error) });
    return NextResponse.json({ error: 'audit_failed' }, { status: 500 });
  }

  if (event.status !== 'confirmed') {
    if (TERMINAL_STATUSES.has(event.status)) {
      const { data: updatedOrders, error: orderError } = await admin.schema('pagos').from('orders')
        .update({ status: event.status, updated_at: new Date().toISOString() })
        .eq('id', orderId).neq('status', 'fulfilled')
        .select('id');
      if (orderError) {
        logFailure('terminal order update failed', { eventId, orderId, message: errorMessage(orderError) });
        return NextResponse.json({ error: 'order_update_failed' }, { status: 500 });
      }
      if (event.status === 'refunded' && Array.isArray(updatedOrders) && updatedOrders.length === 0) {
        const { data: currentOrder, error: currentError } = await admin.schema('pagos').from('orders')
          .select('status').eq('id', orderId).maybeSingle();
        if (currentError) {
          logFailure('refund order lookup failed', { eventId, orderId, message: errorMessage(currentError) });
        } else if (currentOrder?.status === 'fulfilled') {
          logFailure('refund_after_fulfillment', { eventId, orderId });
        }
      }
      const { error: creatorCodeError } = await admin.schema('muzicmania').rpc('credit_creator_code', { p_order_id: orderId });
  if (creatorCodeError) logFailure('creator code credit failed', { eventId, orderId, message: errorMessage(creatorCodeError) });

  const processed = await admin.schema('pagos').from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('provider', event.provider).eq('event_id', eventId);
      if (processed.error) {
        logFailure('webhook event update failed', { eventId, message: errorMessage(processed.error) });
        return NextResponse.json({ error: 'audit_failed' }, { status: 500 });
      }
    } else if (event.status === 'partially_paid') {
      const reviewError = await markOrderReview(admin, orderId);
      if (reviewError) {
        logFailure('partial order review failed', { eventId, orderId, message: reviewError });
        return NextResponse.json({ error: 'order_update_failed' }, { status: 500 });
      }
    }
    return NextResponse.json({ ok: true, status: event.status });
  }

  const amount = Number(payload.price_amount);
  if (!Number.isFinite(amount)) {
    logFailure('invalid price_amount', { eventId, orderId });
    return NextResponse.json({ error: 'invalid_amount' }, { status: 400 });
  }

  const payAmount = Number(payload.pay_amount);
  const actuallyPaid = Number(payload.actually_paid);
  if (Number.isFinite(payAmount) && Number.isFinite(actuallyPaid) && actuallyPaid < payAmount * 0.995) {
    const reviewError = await markOrderReview(admin, orderId);
    if (reviewError) {
      logFailure('underpaid order review failed', { eventId, orderId, message: reviewError });
      return NextResponse.json({ error: 'order_update_failed' }, { status: 500 });
    }
    logFailure('underpaid', { eventId, orderId });
    return NextResponse.json({ error: 'underpaid' }, { status: 409 });
  }

  const priceCents = Math.round(amount * 100);
  const currency = String(payload.price_currency ?? 'usd');
  const { error } = await admin.schema('muzicmania').rpc('fulfill_points_order', {
    p_order_id: orderId,
    p_provider_payment_id: paymentId,
    p_price_cents: priceCents,
    p_currency: currency,
  });

  if (error) {
    const message = errorMessage(error);
    const code = message.includes('amount_mismatch')
      ? 'amount_mismatch'
      : message.includes('currency_mismatch')
        ? 'currency_mismatch'
        : 'fulfillment_failed';
    logFailure('fulfillment failed', { eventId, orderId, code, message });
    if (code === 'amount_mismatch' || code === 'currency_mismatch') {
      const reviewError = await markOrderReview(admin, orderId);
      if (reviewError) logFailure('mismatch order review failed', { eventId, orderId, message: reviewError });
    }
    return NextResponse.json({ error: code }, { status: 409 });
  }

  const { error: creatorCodeError } = await admin.schema('muzicmania').rpc('credit_creator_code', { p_order_id: orderId });
  if (creatorCodeError) logFailure('creator code credit failed', { eventId, orderId, message: errorMessage(creatorCodeError) });

  const processed = await admin.schema('pagos').from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('provider', event.provider).eq('event_id', eventId);
  if (processed.error) {
    logFailure('webhook event update failed', { eventId, message: errorMessage(processed.error) });
    return NextResponse.json({ error: 'audit_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
