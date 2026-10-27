import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUserId } from '@/lib/auth';
import { db, ciszubotSchema, eq, and } from '@/lib/db';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });
const bodySchema = z.object({ premium_enabled: z.boolean() });

const SERVER_LIMIT: Record<string, number> = {
  beta: 3,
  gold: 3,
  diamond: 8,
  platinum: 20,
  lifetime: 20,
};

async function stateFor(userId: string) {
  const accounts = ciszubotSchema.premiumAccounts;
  const guilds = ciszubotSchema.premiumGuilds;
  const rows = await db.select().from(accounts).where(eq(accounts.userId, userId)).limit(1);
  const account = rows[0] ?? null;
  const active = await db
    .select({ guildId: guilds.guildId })
    .from(guilds)
    .where(and(eq(guilds.userId, userId), eq(guilds.status, 'active')));
  const plan = account?.plan ?? 'beta';
  const limit = SERVER_LIMIT[plan] ?? 3;
  return {
    plan,
    status: account?.status ?? 'active',
    premiumEnabled: account?.premiumEnabled ?? false,
    currentPeriodEnd: account?.currentPeriodEnd ?? null,
    limit,
    used: active.length,
    remaining: Math.max(0, limit - active.length),
    activeGuilds: active.map((row) => row.guildId),
  };
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'no_auth' }, { status: 401 });
  return NextResponse.json({ account: await stateFor(userId) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'no_auth' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = await parseJsonBody(req, bodySchema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }

  const accounts = ciszubotSchema.premiumAccounts;
  await db
    .insert(accounts)
    .values({
      userId,
      plan: 'beta',
      status: 'active',
      premiumEnabled: parsed.data.premium_enabled,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: accounts.userId,
      set: { premiumEnabled: parsed.data.premium_enabled, updatedAt: new Date() },
    });

  if (!parsed.data.premium_enabled) {
    await db
      .update(ciszubotSchema.premiumGuilds)
      .set({
        status: 'inactive',
        activationId: null,
        deactivatedAt: new Date(),
        cooldownUntil: new Date(Date.now() + 7 * 86_400_000),
        updatedAt: new Date(),
      })
      .where(and(eq(ciszubotSchema.premiumGuilds.userId, userId), eq(ciszubotSchema.premiumGuilds.status, 'active')));
  }

  return NextResponse.json({ account: await stateFor(userId) }, { headers: { 'Cache-Control': 'no-store' } });
}
