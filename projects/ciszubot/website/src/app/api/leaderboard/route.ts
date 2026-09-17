import { NextRequest, NextResponse } from 'next/server';
import { cacheStore } from '@/lib/cacheStore';
import { db, ciszubotSchema, asc, desc, sql, ilike, count } from '@ciszunetwork/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SORTABLE = ['total', 'balance', 'bank', 'username', 'display_name'];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const page = Math.max(1, Number(sp.get('page') ?? '1') || 1);
  const pageSize = Math.min(50, Math.max(1, Number(sp.get('pageSize') ?? '10') || 10));
  const sortByRaw = sp.get('sortBy') ?? 'total';
  const sortBy = SORTABLE.includes(sortByRaw) ? sortByRaw : 'total';
  const sortDir = sp.get('sortDir') === 'asc' ? 'asc' : 'desc';
  const search = (sp.get('search') ?? '').slice(0, 40).replace(/\s+/g, '');

  const rangeFrom = (page - 1) * pageSize;
  const rangeTo = page * pageSize - 1;

  const cacheKey = `leaderboard:v1:${page}:${pageSize}:${sortBy}:${sortDir}:${search}`;

  const loader = async () => {
    const wallets = ciszubotSchema.wallets;
    const profiles = ciszubotSchema.profiles;

    const orderBy =
      sortBy === 'username'
        ? sortDir === 'asc'
          ? asc(profiles.username)
          : desc(profiles.username)
        : sortBy === 'display_name'
          ? sortDir === 'asc'
            ? asc(profiles.displayName)
            : desc(profiles.displayName)
          : sortDir === 'asc'
            ? asc(sql`${wallets.balance} + ${wallets.bank}`)
            : desc(sql`${wallets.balance} + ${wallets.bank}`);

    const whereClause = search
      ? sql`${profiles.username} ILIKE ${`%${search.replace('@', '')}%`}`
      : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select({
          userId: wallets.userId,
          username: profiles.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          balance: wallets.balance,
          bank: wallets.bank,
          total: sql<number>`${wallets.balance} + ${wallets.bank}`.as('total'),
        })
        .from(wallets)
        .innerJoin(profiles, sql`${profiles.id} = ${wallets.userId}`)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(rangeTo - rangeFrom + 1)
        .offset(rangeFrom),
      db.select({ value: count() }).from(wallets).innerJoin(profiles, sql`${profiles.id} = ${wallets.userId}`).where(whereClause),
    ]);
    return { data, count: countResult[0]?.value ?? 0 };
  };

  let result;
  try {
    result = await cacheStore.getOrSet(cacheKey, 60_000, loader);
  } catch {
    result = await loader();
  }

  return NextResponse.json(result);
}
