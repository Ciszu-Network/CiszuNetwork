import { db, ciszubotSchema, eq, and, desc, sql } from '@ciszunetwork/db';
import { logger } from './logger';

/** Sistema de niveles / XP */

const XP_PER_LEVEL = 100;
const LEVEL_MULT = 5;

export function xpForLevel(level: number): number {
  return XP_PER_LEVEL * level * LEVEL_MULT;
}

export function levelFromXp(xp: number): { level: number; current: number; needed: number; progress: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, current: remaining, needed: xpForLevel(level), progress: remaining / xpForLevel(level) };
}

export async function addXp(userId: string, guildId: string, amount: number): Promise<{ level: number; leveledUp: boolean } | null> {
  try {
    const levels = ciszubotSchema.levels;
    const rows = await db
      .select({ xp: levels.xp })
      .from(levels)
      .where(and(eq(levels.userId, userId), eq(levels.guildId, guildId)))
      .limit(1);
    const oldXp = rows[0] ? Number(rows[0].xp) : 0;
    const before = levelFromXp(oldXp);
    const newXp = oldXp + amount;
    await db
      .insert(levels)
      .values({ userId, guildId, xp: newXp })
      .onConflictDoUpdate({
        target: [levels.userId, levels.guildId],
        set: { xp: newXp, updatedAt: sql`now()` },
      });
    const after = levelFromXp(newXp);
    return { level: after.level, leveledUp: after.level > before.level };
  } catch (error) {
    logger.warn('addXp:', error);
    return null;
  }
}

export async function getLevel(userId: string, guildId: string): Promise<{ xp: number; level: number; current: number; needed: number; progress: number }> {
  try {
    const levels = ciszubotSchema.levels;
    const rows = await db
      .select({ xp: levels.xp })
      .from(levels)
      .where(and(eq(levels.userId, userId), eq(levels.guildId, guildId)))
      .limit(1);
    const xp = rows[0] ? Number(rows[0].xp) : 0;
    return { xp, ...levelFromXp(xp) };
  } catch (error) {
    logger.warn('getLevel:', error);
    return { xp: 0, ...levelFromXp(0) };
  }
}

export async function getTopLevels(guildId: string, limit = 10): Promise<Array<{ user_id: string; xp: number }>> {
  try {
    const levels = ciszubotSchema.levels;
    const rows = await db
      .select({ userId: levels.userId, xp: levels.xp })
      .from(levels)
      .where(eq(levels.guildId, guildId))
      .orderBy(desc(levels.xp))
      .limit(limit);
    return rows.map((r) => ({ user_id: r.userId, xp: Number(r.xp) }));
  } catch (error) {
    logger.warn('getTopLevels:', error);
    return [];
  }
}