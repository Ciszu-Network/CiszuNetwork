import { NextRequest, NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../auth/2fa/_lib';
import { adultStatus, readPaymentFlags } from '@/lib/economy/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const admin = adminClient() as any;

  const [wallet, ledger, inventory, packages, adult] = await Promise.all([
    admin.schema('muzicmania').from('wallets').select('points,lifetime_earned,lifetime_spent,updated_at').eq('user_id', user.userId).maybeSingle(),
    admin.schema('muzicmania').from('point_ledger').select('id,delta,balance_after,reason,reference_type,reference_id,created_at').eq('user_id', user.userId).order('created_at', { ascending: false }).limit(20),
    admin.schema('muzicmania').from('user_inventory').select('item_id,equipped_slot,acquired_at,shop_items(slug,name,category,asset_key,rarity)').eq('user_id', user.userId),
    admin.schema('muzicmania').from('point_packages').select('id,slug,name,points_base,bonus_points,price_cents,currency,badge').eq('enabled', true).order('sort_order'),
    adultStatus(admin, user.userId),
  ]);

  return NextResponse.json({
    wallet: wallet.data ?? { points: 0, lifetime_earned: 0, lifetime_spent: 0 },
    ledger: ledger.data ?? [],
    inventory: inventory.data ?? [],
    packages: packages.data ?? [],
    flags: readPaymentFlags(),
    adult,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
