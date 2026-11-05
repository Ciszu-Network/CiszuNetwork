import { NextRequest, NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  const admin = adminClient() as any;
  const { data: items, error } = await admin.schema('muzicmania').from('shop_items')
    .select('id,slug,name,description,category,rarity,price_points,asset_key')
    .eq('enabled', true).order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let owned = new Map<string, string | null>();
  if (user) {
    const { data: inventory } = await admin.schema('muzicmania').from('user_inventory')
      .select('item_id,equipped_slot').eq('user_id', user.userId);
    owned = new Map((inventory ?? []).map((row: any) => [row.item_id, row.equipped_slot]));
  }

  return NextResponse.json({
    items: (items ?? []).map((item: any) => ({
      ...item,
      owned: owned.has(item.id),
      equippedSlot: owned.get(item.id) ?? null,
    })),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
