import { NextRequest, NextResponse } from 'next/server';
import { cacheStore } from '@/lib/cacheStore';
import { db, muzicmaniaSchema, asc, desc, eq, sql, ilike, count, inArray } from '@ciszunetwork/db';
import { rankForLevel } from '@/lib/ranks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SORTABLE = ['highest_score', 'accuracy', 'max_multiplier', 'total_playtime_minutes', 'username', 'created_at'];
const PERIODS: Record<string, string | null> = {
  all: null,
  daily: '1 day',
  weekly: '7 days',
  monthly: '30 days',
  yearly: '365 days',
};

function toNumber(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function badgeStyle(levels: unknown): string {
  if (!Array.isArray(levels)) return 'cyan';
  const style = (levels[levels.length - 1] as { style?: string } | undefined)?.style;
  return style || 'cyan';
}

async function enrichBadges(rows: any[]) {
  if (!rows.length) return rows;
  const ids = rows.map((row) => row.id).filter(Boolean);
  if (!ids.length) return rows;
  const { userBadges, badgeDefinitions } = muzicmaniaSchema;
  const badges = await db
    .select({
      userId: userBadges.userId,
      badgeId: userBadges.badgeId,
      level: userBadges.level,
      name: badgeDefinitions.name,
      icon: badgeDefinitions.icon,
      levels: badgeDefinitions.levels,
    })
    .from(userBadges)
    .innerJoin(badgeDefinitions, eq(badgeDefinitions.id, userBadges.badgeId))
    .where(inArray(userBadges.userId, ids))
    .orderBy(desc(userBadges.level), desc(userBadges.obtainedAt));
  const byUser = new Map<string, any[]>();
  for (const badge of badges) {
    const list = byUser.get(badge.userId) ?? [];
    if (list.length < 3) list.push({
      id: badge.badgeId,
      name: badge.name,
      icon: badge.icon,
      level: badge.level,
      style: badgeStyle(badge.levels),
    });
    byUser.set(badge.userId, list);
  }
  return rows.map((row) => ({ ...row, badges: byUser.get(row.id) ?? [] }));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get('page') ?? '1') || 1);
  const pageSize = Math.min(50, Math.max(1, Number(sp.get('pageSize') ?? '10') || 10));
  const sortByRaw = sp.get('sortBy') ?? 'highest_score';
  const sortBy = SORTABLE.includes(sortByRaw) ? sortByRaw : 'highest_score';
  const sortDir = sp.get('sortDir') === 'asc' ? 'asc' : 'desc';
  const search = (sp.get('search') ?? '').slice(0, 40).replace(/\s+/g, '');
  const periodRaw = sp.get('period') ?? 'all';
  const period = periodRaw in PERIODS ? periodRaw : 'all';
  const rangeFrom = (page - 1) * pageSize;
  const rangeTo = page * pageSize - 1;
  const cacheKey = `leaderboard:v2:${page}:${pageSize}:${sortBy}:${sortDir}:${search}:${period}`;

  const loader = async () => {
    const profiles = muzicmaniaSchema.profiles;
    let data: any[] = [];
    let total = 0;

    if (period !== 'all') {
      const interval = PERIODS[period];
      const filter = search ? sql`AND lower(p.username) LIKE lower(${`%${search.replace('@', '')}%`})` : sql``;
      const column =
        sortBy === 'username'
          ? 'p.username'
          : sortBy === 'max_multiplier'
            ? 'f.max_combo'
            : sortBy === 'accuracy'
              ? 'f.accuracy'
              : sortBy === 'total_playtime_minutes'
                ? 'p.total_playtime_minutes'
                : 'f.highest_score';
      const order = sortDir === 'asc' ? 'ASC' : 'DESC';
      const rows = await db.execute(sql`
        WITH filtered AS (
          SELECT s.user_id,
                 MAX(s.score)::numeric AS highest_score,
                 MAX(s.accuracy)::numeric AS accuracy,
                 MAX(s.max_combo)::int AS max_combo,
                 COUNT(*)::int AS period_games
          FROM muzicmania.scores s
          WHERE s.created_at >= NOW() - ${sql.raw(`INTERVAL '${interval}'`)}
          GROUP BY s.user_id
        )
        SELECT p.id, p.username, p.display_name, p.avatar_url, p.level, p.xp,
               p.total_playtime_minutes, p.tracks_created, p.max_multiplier,
               p.highest_score, p.accuracy, p.created_at,
               f.highest_score AS period_score, f.accuracy AS period_accuracy,
               f.max_combo, f.period_games
        FROM muzicmania.profiles p
        INNER JOIN filtered f ON f.user_id = p.id
        WHERE TRUE ${filter}
        ORDER BY ${sql.raw(column)} ${sql.raw(order)}
        LIMIT ${rangeTo - rangeFrom + 1} OFFSET ${rangeFrom}
      `);
      const totalRows = await db.execute(sql`
        WITH filtered AS (
          SELECT s.user_id
          FROM muzicmania.scores s
          WHERE s.created_at >= NOW() - ${sql.raw(`INTERVAL '${interval}'`)}
          GROUP BY s.user_id
        )
        SELECT COUNT(*)::int AS total
        FROM muzicmania.profiles p
        INNER JOIN filtered f ON f.user_id = p.id
        WHERE TRUE ${filter}
      `);
      const rawRows = (rows as any).rows ?? rows;
      const rawTotal = (totalRows as any).rows?.[0] ?? (totalRows as any)[0];
      data = (rawRows as any[]).map((row) => ({
        ...row,
        highest_score: toNumber(row.period_score ?? row.highest_score),
        accuracy: toNumber(row.period_accuracy ?? row.accuracy),
        max_multiplier: toNumber(row.max_combo ?? row.max_multiplier),
        total_playtime_minutes: toNumber(row.total_playtime_minutes),
        tracks_created: toNumber(row.tracks_created),
        level: toNumber(row.level),
        xp: toNumber(row.xp),
        period_games: toNumber(row.period_games),
      }));
      total = toNumber(rawTotal?.total);
    } else {
      const orderBy =
        sortBy === 'username'
          ? sortDir === 'asc' ? asc(profiles.username) : desc(profiles.username)
          : sortDir === 'asc'
            ? asc(sql`${profiles[sortBy as keyof typeof profiles]}`)
            : desc(sql`${profiles[sortBy as keyof typeof profiles]}`);
      const whereClause = search ? ilike(profiles.username, `%${search.replace('@', '')}%`) : undefined;
      const [rows, countResult] = await Promise.all([
        db.select().from(profiles).where(whereClause).orderBy(orderBy).limit(rangeTo - rangeFrom + 1).offset(rangeFrom),
        db.select({ value: count() }).from(profiles).where(whereClause),
      ]);
      data = rows;
      total = countResult[0]?.value ?? 0;
    }

    data = await enrichBadges(data);
    data = data.map((row) => ({
      ...row,
      rankKey: rankForLevel(Number(row.level ?? 1)).key,
      rankName: rankForLevel(Number(row.level ?? 1)).name,
    }));
    return { data, count: total };
  };

  let result;
  try {
    result = await cacheStore.getOrSet(cacheKey, 60_000, loader);
  } catch {
    result = await loader();
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
