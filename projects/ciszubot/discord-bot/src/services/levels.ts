import { getSupabase } from './supabase';
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
    const db = getSupabase();
    const { data } = await db
      .from('levels')
      .select('xp')
      .eq('user_id', userId)
      .eq('guild_id', guildId)
      .maybeSingle();
    const oldXp = data ? Number(data.xp) : 0;
    const before = levelFromXp(oldXp);
    const newXp = oldXp + amount;
    await db.from('levels').upsert({
      user_id: userId,
      guild_id: guildId,
      xp: newXp,
      updated_at: new Date().toISOString(),
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
    const db = getSupabase();
    const { data } = await db.from('levels').select('xp').eq('user_id', userId).eq('guild_id', guildId).maybeSingle();
    const xp = data ? Number(data.xp) : 0;
    return { xp, ...levelFromXp(xp) };
  } catch (error) {
    logger.warn('getLevel:', error);
    return { xp: 0, ...levelFromXp(0) };
  }
}

export async function getTopLevels(guildId: string, limit = 10): Promise<Array<{ user_id: string; xp: number }>> {
  try {
    const db = getSupabase();
    const { data } = await db.from('levels').select('user_id, xp').eq('guild_id', guildId).order('xp', { ascending: false }).limit(limit);
    return (data ?? []).map((r: { user_id: string; xp: number }) => ({ user_id: r.user_id, xp: Number(r.xp) }));
  } catch (error) {
    logger.warn('getTopLevels:', error);
    return [];
  }
}
