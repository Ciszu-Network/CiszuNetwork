import { NextRequest, NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const admin = adminClient() as any;
  const { data, error } = await admin.schema('pagos').from('orders')
    .select('id,status,product_type,points_base,points_bonus,amount_cents,currency,checkout_url,created_at,fulfilled_at')
    .eq('id', id).eq('user_id', user.userId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ order: data }, { headers: { 'Cache-Control': 'no-store' } });
}
