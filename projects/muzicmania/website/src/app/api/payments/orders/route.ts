import { NextRequest, NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const admin = adminClient() as any;
  const [orders, refunds] = await Promise.all([
    admin.schema('pagos').from('orders')
      .select('id,status,product_type,product_id,points_base,points_bonus,amount_cents,currency,created_at,fulfilled_at')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false })
      .limit(50),
    admin.schema('pagos').from('refund_requests')
      .select('id,order_id,amount_cents,currency,reason,status,admin_note,created_at,resolved_at')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);
  if (orders.error) return NextResponse.json({ error: 'orders_load_failed' }, { status: 500 });
  if (refunds.error) return NextResponse.json({ error: 'refunds_load_failed' }, { status: 500 });
  return NextResponse.json({
    orders: (orders.data ?? []).map((order: Record<string, unknown>) => ({
      ...order,
      points_total: Number(order.points_base ?? 0) + Number(order.points_bonus ?? 0),
    })),
    refunds: refunds.data ?? [],
  }, { headers: { 'Cache-Control': 'no-store' } });
}
