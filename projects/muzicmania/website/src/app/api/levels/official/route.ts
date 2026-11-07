import { NextResponse } from 'next/server';
import { adminClient } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sb = adminClient() as any;
    const { data, error } = await sb
      .schema('muzicmania')
      .from('custom_levels')
      .select('id,official_slot,track_id,title,description,difficulty,bpm,chart_offset,chart,updated_at')
      .eq('official', true)
      .eq('status', 'published')
      .eq('archived', false);
    if (error) throw new Error(error.message);
    const levels: Record<string, any> = {};
    for (const row of data ?? []) {
      if (row.official_slot) levels[row.official_slot] = row;
    }
    return NextResponse.json({ levels }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'official_levels_error' }, { status: 500 });
  }
}
