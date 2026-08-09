import { NextRequest, NextResponse } from 'next/server';
import { cacheStore } from '@/lib/cacheStore';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { supabase } from '@/config/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SORTABLE = ['highest_score', 'accuracy', 'max_multiplier', 'total_playtime_minutes', 'username', 'created_at'];

/**
 * Leaderboard cacheado (Fase 1 del plan de caché, 9 ago 2026).
 * La consulta repetida de la página pasa por CacheStore (memoria→KV→Postgres) con
 * TTL 60s y clave por variación de filtros. Si la caché falla, la consulta directa
 * a Supabase responde igualmente (regla: la caché nunca rompe la request).
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const page = Math.max(1, Number(sp.get('page') ?? '1') || 1);
  const pageSize = Math.min(50, Math.max(1, Number(sp.get('pageSize') ?? '10') || 10));
  const sortByRaw = sp.get('sortBy') ?? 'highest_score';
  const sortBy = SORTABLE.includes(sortByRaw) ? sortByRaw : 'highest_score';
  const sortDir = sp.get('sortDir') === 'asc' ? 'asc' : 'desc';
  const search = (sp.get('search') ?? '').slice(0, 40).replace(/\s+/g, '');

  const rangeFrom = (page - 1) * pageSize;
  const rangeTo = page * pageSize - 1;

  const cacheKey = `leaderboard:v1:${page}:${pageSize}:${sortBy}:${sortDir}:${search}`;

  const loader = async () => {
    const client = supabaseAdmin ?? supabase;
    let query = client.from('profiles').select('*', { count: 'exact' });
    if (search) {
      query = query.ilike('username', `%${search.replace('@', '')}%`);
    }
    const { data, count, error } = await query
      .order(sortBy, { ascending: sortDir === 'asc' })
      .range(rangeFrom, rangeTo);
    if (error) throw new Error(error.message);
    return { data, count };
  };

  let result;
  try {
    result = await cacheStore.getOrSet(cacheKey, 60_000, loader);
  } catch {
    result = await loader();
  }

  return NextResponse.json(result);
}