import { NextRequest, NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'invalid_order_id' }, { status: 400 });
  const admin = adminClient() as any;
  const { data, error } = await admin.schema('pagos').from('orders')
    .select('id,status,product_type,points_base,points_bonus,amount_cents,currency,checkout_url,created_at,fulfilled_at')
    .eq('id', id).eq('user_id', user.userId).maybeSingle();
  if (error) {
    console.error('[payments/order] lookup failed', {
      orderId: id,
      message: typeof error.message === 'string' ? error.message.slice(0, 200) : 'unknown',
    });
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const order = { ...data, points_total: Number(data.points_base ?? 0) + Number(data.points_bonus ?? 0) };
  return NextResponse.json({ order }, { headers: { 'Cache-Control': 'no-store' } });
}
