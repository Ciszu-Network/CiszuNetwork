import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, muzicmaniaSchema, eq, and, count, sql } from '@ciszunetwork/db';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const favoriteSchema = z.object({ badge_ids: z.array(z.string().min(1).max(64)).max(3) });

function rarityOf(percent: number) {
  if (percent <= 0.5) return { key: 'mythic', label: 'Mítico' };
  if (percent <= 2) return { key: 'legendary', label: 'Legendario' };
  if (percent <= 8) return { key: 'epic', label: 'Épico' };
  if (percent <= 20) return { key: 'rare', label: 'Raro' };
  if (percent <= 45) return { key: 'uncommon', label: 'Poco común' };
  return { key: 'common', label: 'Común' };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) {
    return NextResponse.json({ error: 'invalid_user' }, { status: 400 });
  }

  try {
    // Recalcula progreso automático al abrir el perfil.
    await db.execute(sql`select muzicmania.refresh_user_badges(${userId}::uuid)`);

    const definitions = muzicmaniaSchema.badgeDefinitions;
    const owned = muzicmaniaSchema.userBadges;
    const favorites = muzicmaniaSchema.profileFavoriteBadges;
    const profiles = muzicmaniaSchema.profiles;

    const [defs, mine, favoriteRows, totalRows, ownerRows] = await Promise.all([
      db.select().from(definitions),
      db.select().from(owned).where(eq(owned.userId, userId)),
      db.select().from(favorites).where(eq(favorites.userId, userId)).limit(1),
      db.select({ value: count() }).from(profiles).where(sql`${profiles.deletedAt} is null`),
      db
        .select({ badgeId: owned.badgeId, value: count() })
        .from(owned)
        .where(sql`${owned.level} > 0`)
        .groupBy(owned.badgeId),
    ]);

    const total = Number(totalRows[0]?.value ?? 0);
    const mineMap = new Map(mine.map((row) => [row.badgeId, row]));
    const ownerMap = new Map(ownerRows.map((row) => [row.badgeId, Number(row.value)]));

    const badges = defs
      .map((definition) => {
        const progress = mineMap.get(definition.id);
        const owners = ownerMap.get(definition.id) ?? 0;
        const percent = total > 0 ? (owners / total) * 100 : 0;
        const level = progress?.level ?? 0;
        const levels = Array.isArray(definition.levels) ? (definition.levels as Array<Record<string, unknown>>) : [];
        const thresholds = Array.isArray(definition.thresholds) ? (definition.thresholds as number[]) : [];
        const nextThreshold = level < thresholds.length ? thresholds[level] : null;
        const current = levels[Math.max(0, level - 1)] ?? levels[0] ?? {};
        return {
          id: definition.id,
          category: definition.category,
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          kind: definition.kind,
          level,
          maxLevel: definition.maxLevel,
          progress: progress?.progress ?? 0,
          nextThreshold,
          obtainedAt: progress?.obtainedAt ?? null,
          title: level > 0 ? String(current.title ?? definition.name) : definition.name,
          levelDescription: String(current.description ?? definition.description),
          style: String(current.style ?? 'cyan'),
          owners,
          total,
          percent,
          rarity: rarityOf(percent),
          levels,
        };
      })
      .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name));

    const ownedIds = new Set(mine.map((row) => row.badgeId));
    const favoriteIds = (favoriteRows[0]?.badgeIds ?? []).filter((id) => ownedIds.has(id)).slice(0, 3);

    return NextResponse.json(
      { badges, favorites: favoriteIds, totalPlayers: total },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'badges_error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await authenticate(req);
  if (!user || user.userId !== userId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = await parseJsonBody(req, favoriteSchema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }

  try {
    const owned = muzicmaniaSchema.userBadges;
    const rows = await db
      .select({ badgeId: owned.badgeId })
      .from(owned)
      .where(and(eq(owned.userId, userId), sql`${owned.level} > 0`));
    const allowed = new Set(rows.map((row) => row.badgeId));
    const badgeIds = parsed.data.badge_ids.filter((id) => allowed.has(id)).slice(0, 3);
    const favorites = muzicmaniaSchema.profileFavoriteBadges;
    await db
      .insert(favorites)
      .values({ userId, badgeIds, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: favorites.userId,
        set: { badgeIds, updatedAt: new Date() },
      });
    return NextResponse.json({ success: true, badge_ids: badgeIds });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'badges_save_error' },
      { status: 500 },
    );
  }
}
