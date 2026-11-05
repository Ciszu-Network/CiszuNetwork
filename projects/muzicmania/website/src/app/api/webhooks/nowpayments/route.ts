import { NextRequest, NextResponse } from 'next/server';
import { createNowPaymentsProvider } from '@ciszunetwork/payments';
import { createRateLimiter } from '@ciszunetwork/utils';
import { adminClient } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const raw = await req.text();
  const provider = createNowPaymentsProvider();
  const event = await provider.verifyWebhook(raw, req.headers);
  if (!event) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });

  const payload = event.raw as Record<string, any>;
  const orderId = typeof payload.order_id === 'string' ? payload.order_id : '';
  const eventId = `${payload.payment_id ?? 'unknown'}:${payload.payment_status ?? 'unknown'}`;
  if (!orderId) return NextResponse.json({ error: 'missing_order' }, { status: 400 });

  const admin = adminClient() as any;
  const existing = await admin.schema('pagos').from('webhook_events').select('processed_at').eq('provider', event.provider).eq('event_id', eventId).maybeSingle();
  if (existing.data?.processed_at) return NextResponse.json({ ok: true, duplicate: true });

  await admin.schema('pagos').from('webhook_events').upsert({
    provider: event.provider,
    event_id: eventId,
    payload,
    signature_valid: true,
  }, { onConflict: 'provider,event_id', ignoreDuplicates: true });

  if (event.status !== 'confirmed') return NextResponse.json({ ok: true, status: event.status });

  const priceCents = Math.round(Number(payload.price_amount ?? 0) * 100);
  const currency = String(payload.price_currency ?? 'usd');
  const { error } = await admin.schema('muzicmania').rpc('fulfill_points_order', {
    p_order_id: orderId,
    p_provider_payment_id: String(payload.payment_id ?? ''),
    p_price_cents: priceCents,
    p_currency: currency,
  });

  if (error) {
    await admin.schema('pagos').from('webhook_events').update({ processed_at: null }).eq('provider', event.provider).eq('event_id', eventId);
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  await admin.schema('pagos').from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('provider', event.provider).eq('event_id', eventId);
  return NextResponse.json({ ok: true });
}
