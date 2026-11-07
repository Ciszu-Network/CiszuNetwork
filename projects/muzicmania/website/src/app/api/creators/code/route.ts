import { NextRequest, NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const admin = adminClient() as any;
  const { data: code, error } = await admin.schema('muzicmania').rpc('ensure_creator_code', { p_user_id: user.userId });
  if (error) {
    const message = String(error.message ?? '');
    if (message.includes('creator_requires_published_level')) {
      return NextResponse.json({ error: 'creator_requires_published_level' }, { status: 409 });
    }
    return NextResponse.json({ error: 'creator_code_failed' }, { status: 500 });
  }

  const [donations, uses] = await Promise.all([
    admin.schema('muzicmania').from('creator_donations').select('amount,message,created_at,sender_id').eq('creator_id', user.userId).order('created_at', { ascending: false }).limit(20),
    admin.schema('muzicmania').from('creator_code_uses').select('points_awarded,created_at').eq('creator_id', user.userId).order('created_at', { ascending: false }).limit(20),
  ]);

  return NextResponse.json({
    code,
    donations: donations.data ?? [],
    codeUses: uses.data ?? [],
    totals: {
      donations: (donations.data ?? []).reduce((sum: number, row: any) => sum + Number(row.amount ?? 0), 0),
      codePoints: (uses.data ?? []).reduce((sum: number, row: any) => sum + Number(row.points_awarded ?? 0), 0),
    },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
