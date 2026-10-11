import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { getSessionUserId, isGuildAdmin, getGuildsForUser } from '@/lib/auth';
import { db, ciszubotSchema, eq } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { createRateLimiter } from '@ciszunetwork/utils';

export const runtime = 'nodejs';

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

/**
 * Reinicia el leaderboard del servidor (borra los XP de ciszubot.levels).
 * Sub-opción Premium (gratis durante la beta). Solo admins del servidor.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  const { guildId } = await params;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'no_auth' }, { status: 401 });

  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    await db.delete(ciszubotSchema.levels).where(eq(ciszubotSchema.levels.guildId, guildId));
  } catch {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
  await logAudit({ event: 'leaderboard_reset', actorId: userId, target: guildId, ip });
  return NextResponse.json({ ok: true });
}
