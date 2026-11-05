import { NextResponse } from 'next/server';
import { adminClient } from '../../auth/2fa/_lib';
import { readPaymentFlags } from '@/lib/economy/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').from('point_packages')
    .select('id,slug,name,points_base,bonus_points,price_cents,currency,badge')
    .eq('enabled', true).order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ packages: data ?? [], flags: readPaymentFlags() }, { headers: { 'Cache-Control': 'no-store' } });
}
