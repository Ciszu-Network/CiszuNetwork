import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createNowPaymentsProvider } from '@ciszunetwork/payments';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';
import { adultStatus, readPaymentFlags } from '@/lib/economy/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const schema = z.object({
  package_id: z.string().uuid(),
  idempotency_key: z.string().trim().min(16).max(100),
});

function logFailure(stage: string, details: Record<string, string>) {
  console.error(`[payments/invoice] ${stage}`, details);
}

function existingOrderResponse(order: { id: string; status: string; checkout_url: string | null }) {
  if (order.checkout_url) {
    return NextResponse.json({ order_id: order.id, checkout_url: order.checkout_url });
  }
  if (order.status === 'pending') {
    return NextResponse.json({ error: 'invoice_pending', order_id: order.id }, { status: 409 });
  }
  return NextResponse.json({ error: 'invoice_failed', order_id: order.id }, { status: 409 });
}

export async function POST(req: NextRequest) {
  const flags = readPaymentFlags();
  if (!flags.crypto) return NextResponse.json({ error: 'crypto_disabled' }, { status: 403 });
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  const idempotencyKey = parsed.data.idempotency_key;

  const admin = adminClient() as any;
  const { data: existing, error: existingError } = await admin.schema('pagos').from('orders')
    .select('id,status,checkout_url')
    .eq('user_id', user.userId).eq('idempotency_key', idempotencyKey).maybeSingle();
  if (existingError) {
    logFailure('order lookup failed', { userId: user.userId, message: String(existingError.message ?? '').slice(0, 200) });
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
  if (existing) return existingOrderResponse(existing);

  let adult;
  try {
    adult = await adultStatus(admin, user.userId);
  } catch (error) {
    logFailure('adult status failed', { userId: user.userId, message: String((error as Error)?.message ?? '').slice(0, 200) });
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
  if (!adult.isAdult) return NextResponse.json({ error: 'minor' }, { status: 403 });
  if (!adult.emailVerified) return NextResponse.json({ error: 'email_unverified' }, { status: 403 });
  if (!adult.termsAccepted) return NextResponse.json({ error: 'terms_required' }, { status: 403 });

  const { data: pkg, error: pkgError } = await admin.schema('muzicmania').from('point_packages')
    .select('id,slug,points_base,bonus_points,price_cents,currency').eq('id', parsed.data.package_id).eq('enabled', true).maybeSingle();
  if (pkgError) {
    logFailure('package lookup failed', { userId: user.userId, message: String(pkgError.message ?? '').slice(0, 200) });
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
  if (!pkg) return NextResponse.json({ error: 'package_not_found' }, { status: 404 });

  const orderId = randomUUID();
  const { error: insertError } = await admin.schema('pagos').from('orders').insert({
    id: orderId,
    user_id: user.userId,
    provider: 'nowpayments',
    product_type: 'points_package',
    product_id: pkg.id,
    amount_cents: pkg.price_cents,
    currency: pkg.currency,
    points_base: pkg.points_base,
    points_bonus: pkg.bonus_points,
    status: 'pending',
    idempotency_key: idempotencyKey,
  });
  if (insertError) {
    if (insertError.code === '23505') {
      const { data: conflicted, error: conflictError } = await admin.schema('pagos').from('orders')
        .select('id,status,checkout_url')
        .eq('user_id', user.userId).eq('idempotency_key', idempotencyKey).maybeSingle();
      if (!conflictError && conflicted) return existingOrderResponse(conflicted);
    }
    logFailure('order insert failed', { userId: user.userId, message: String(insertError.message ?? '').slice(0, 200) });
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }

  const publicUrl = process.env.MUZICMANIA_PUBLIC_URL || 'https://muzicmania.vercel.app';
  const provider = createNowPaymentsProvider();

  try {
    const invoice = await provider.createInvoice({
      id: orderId,
      product: `MuzicMania ${pkg.slug} - ${pkg.points_base + pkg.bonus_points} MZP`,
      amountUsd: pkg.price_cents / 100,
      currency: pkg.currency,
      metadata: { ipnCallbackUrl: `${publicUrl}/api/webhooks/nowpayments` },
      successUrl: `${publicUrl}/play?payment=success&order=${orderId}`,
      cancelUrl: `${publicUrl}/play?payment=cancel&order=${orderId}`,
    });
    if (!invoice.checkoutUrl) throw new Error('checkout_url_missing');

    const { error: updateError } = await admin.schema('pagos').from('orders').update({
      provider: invoice.provider,
      provider_order_id: invoice.providerOrderId ?? null,
      checkout_url: invoice.checkoutUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', orderId);
    if (updateError) {
      logFailure('order update failed', { userId: user.userId, orderId, message: String(updateError.message ?? '').slice(0, 200) });
      await admin.schema('pagos').from('orders').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', orderId);
      return NextResponse.json({ error: 'invoice_failed' }, { status: 502 });
    }
    return NextResponse.json({ order_id: orderId, checkout_url: invoice.checkoutUrl });
  } catch (error) {
    logFailure('provider invoice failed', { orderId, message: String((error as Error)?.message ?? '').slice(0, 200) });
    await admin.schema('pagos').from('orders').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', orderId);
    return NextResponse.json({ error: 'invoice_failed' }, { status: 502 });
  }
}
