import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

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

type Row = Record<string, any>;

async function fetchBadgeData(userId: string) {
  const sb = adminClient() as any;
  try {
    await sb.schema('muzicmania').rpc('refresh_user_badges', { p_user: userId });
  } catch {
    /* el trigger también actualiza; si RPC no está expuesto seguimos */
  }

  const [defsRes, mineRes, favRes, totalRes, ownersRes] = await Promise.all([
    sb.schema('muzicmania').from('badge_definitions').select('*'),
    sb.schema('muzicmania').from('user_badges').select('*').eq('user_id', userId),
    sb.schema('muzicmania').from('profile_favorite_badges').select('badge_ids').eq('user_id', userId).maybeSingle(),
    sb.schema('muzicmania').from('profiles').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    sb.schema('muzicmania').from('user_badges').select('badge_id').gt('level', 0),
  ]);

  if (defsRes.error) throw new Error(defsRes.error.message);
  if (mineRes.error) throw new Error(mineRes.error.message);

  const defs = (defsRes.data ?? []) as Row[];
  const mine = (mineRes.data ?? []) as Row[];
  const total = Number(totalRes.count ?? 0);
  const mineMap = new Map(mine.map((row) => [row.badge_id, row]));
  const owners = new Map<string, number>();
  for (const row of (ownersRes.data ?? []) as Row[]) {
    owners.set(row.badge_id, (owners.get(row.badge_id) ?? 0) + 1);
  }

  const badges = defs
    .map((definition) => {
      const progress = mineMap.get(definition.id);
      const ownerCount = owners.get(definition.id) ?? 0;
      const percent = total > 0 ? (ownerCount / total) * 100 : 0;
      const level = Number(progress?.level ?? 0);
      const levels = Array.isArray(definition.levels) ? (definition.levels as Row[]) : [];
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
        maxLevel: definition.max_level,
        progress: Number(progress?.progress ?? 0),
        nextThreshold,
        obtainedAt: progress?.obtained_at ?? null,
        title: level > 0 ? String(current.title ?? definition.name) : definition.name,
        levelDescription: String(current.description ?? definition.description),
        style: String(current.style ?? 'cyan'),
        owners: ownerCount,
        total,
        percent,
        rarity: rarityOf(percent),
        levels,
      };
    })
    .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name));

  const ownedIds = new Set(mine.map((row) => row.badge_id));
  const favoriteIds = ((favRes.data?.badge_ids ?? []) as string[]).filter((id) => ownedIds.has(id)).slice(0, 3);
  return { badges, favorites: favoriteIds, totalPlayers: total };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) {
    return NextResponse.json({ error: 'invalid_user' }, { status: 400 });
  }
  try {
    return NextResponse.json(await fetchBadgeData(userId), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'badges_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await authenticate(req);
  if (!user || user.userId !== userId) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = await parseJsonBody(req, favoriteSchema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  try {
    const sb = adminClient() as any;
    const ownedRes = await sb.schema('muzicmania').from('user_badges').select('badge_id').eq('user_id', userId).gt('level', 0);
    const allowed = new Set(((ownedRes.data ?? []) as Row[]).map((row) => row.badge_id));
    const badgeIds = parsed.data.badge_ids.filter((id) => allowed.has(id)).slice(0, 3);
    const { error } = await sb
      .schema('muzicmania')
      .from('profile_favorite_badges')
      .upsert({ user_id: userId, badge_ids: badgeIds, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, badge_ids: badgeIds });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'badges_save_error' }, { status: 500 });
  }
}
