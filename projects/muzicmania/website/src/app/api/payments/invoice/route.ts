import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createNowPaymentsProvider, PaymentError } from '@ciszunetwork/payments';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';
import { adultStatus, readPaymentFlags } from '@/lib/economy/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const schema = z.object({ package_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const flags = readPaymentFlags();
  if (!flags.crypto) return NextResponse.json({ error: 'crypto_disabled' }, { status: 403 });
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  const admin = adminClient() as any;
  const adult = await adultStatus(admin, user.userId);
  if (!adult.isAdult || !adult.emailVerified || !adult.termsAccepted) return NextResponse.json({ error: 'adult_required' }, { status: 403 });

  const { data: pkg, error: pkgError } = await admin.schema('muzicmania').from('point_packages')
    .select('id,slug,points_base,bonus_points,price_cents,currency').eq('id', parsed.data.package_id).eq('enabled', true).maybeSingle();
  if (pkgError || !pkg) return NextResponse.json({ error: 'package_not_found' }, { status: 404 });

  const orderId = randomUUID();
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

    const { error } = await admin.schema('pagos').from('orders').insert({
      id: orderId,
      user_id: user.userId,
      provider: invoice.provider,
      provider_order_id: invoice.providerOrderId ?? null,
      product_type: 'points_package',
      product_id: pkg.id,
      amount_cents: pkg.price_cents,
      currency: pkg.currency,
      points_base: pkg.points_base,
      points_bonus: pkg.bonus_points,
      status: 'pending',
      checkout_url: invoice.checkoutUrl ?? null,
      idempotency_key: `invoice:${orderId}`,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ order_id: orderId, checkout_url: invoice.checkoutUrl });
  } catch (error) {
    const message = error instanceof PaymentError ? error.message : 'invoice_failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
