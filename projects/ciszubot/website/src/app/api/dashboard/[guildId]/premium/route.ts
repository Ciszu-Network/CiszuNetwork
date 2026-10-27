import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUserId, isGuildAdmin, getGuildsForUser } from '@/lib/auth';
import { db, ciszubotSchema, eq, and } from '@/lib/db';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });
const bodySchema = z.object({ action: z.enum(['activate', 'deactivate']) });
const SERVER_LIMIT: Record<string, number> = { beta: 3, gold: 3, diamond: 8, platinum: 20, lifetime: 20 };
const COOLDOWN_MS = 7 * 86_400_000;

async function authorize(guildId: string) {
  const userId = await getSessionUserId();
  if (!userId) return { error: NextResponse.json({ error: 'no_auth' }, { status: 401 }) };
  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  return { userId };
}

async function accountFor(userId: string) {
  const rows = await db
    .select()
    .from(ciszubotSchema.premiumAccounts)
    .where(eq(ciszubotSchema.premiumAccounts.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

async function stateFor(userId: string, guildId: string) {
  const account = await accountFor(userId);
  const rows = await db
    .select()
    .from(ciszubotSchema.premiumGuilds)
    .where(eq(ciszubotSchema.premiumGuilds.guildId, guildId))
    .limit(1);
  const row = rows[0] ?? null;
  const plan = account?.plan ?? 'beta';
  const limit = SERVER_LIMIT[plan] ?? 3;
  const active = await db
    .select({ guildId: ciszubotSchema.premiumGuilds.guildId })
    .from(ciszubotSchema.premiumGuilds)
    .where(and(eq(ciszubotSchema.premiumGuilds.userId, userId), eq(ciszubotSchema.premiumGuilds.status, 'active')));
  return {
    account: account
      ? {
          plan: account.plan,
          status: account.status,
          premiumEnabled: account.premiumEnabled,
          currentPeriodEnd: account.currentPeriodEnd,
        }
      : { plan: 'beta', status: 'active', premiumEnabled: false, currentPeriodEnd: null },
    limit,
    used: active.length,
    remaining: Math.max(0, limit - active.length),
    activation: row
      ? {
          status: row.status,
          activationId: row.activationId,
          plan: row.plan,
          cooldownUntil: row.cooldownUntil,
          deactivatedAt: row.deactivatedAt,
        }
      : null,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const auth = await authorize(guildId);
  if (auth.error) return auth.error;
  return NextResponse.json(await stateFor(auth.userId!, guildId), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const { guildId } = await params;
  const auth = await authorize(guildId);
  if (auth.error) return auth.error;
  const userId = auth.userId!;

  const parsed = await parseJsonBody(req, bodySchema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }

  const account = await accountFor(userId);
  if (!account || account.status !== 'active' || !account.premiumEnabled) {
    return NextResponse.json({ error: 'premium_not_enabled' }, { status: 403 });
  }
  if (account.currentPeriodEnd && account.currentPeriodEnd.getTime() < Date.now()) {
    return NextResponse.json({ error: 'plan_expired' }, { status: 403 });
  }

  const guilds = ciszubotSchema.premiumGuilds;
  const configs = ciszubotSchema.guildConfigs;
  const currentRows = await db.select().from(guilds).where(eq(guilds.guildId, guildId)).limit(1);
  const current = currentRows[0] ?? null;

  if (parsed.data.action === 'deactivate') {
    if (!current || current.status !== 'active') {
      return NextResponse.json({ error: 'not_active' }, { status: 409 });
    }
    const configRows = await db.select().from(configs).where(eq(configs.guildId, guildId)).limit(1);
    await db
      .update(guilds)
      .set({
        status: 'inactive',
        activationId: null,
        deactivatedAt: new Date(),
        cooldownUntil: new Date(Date.now() + COOLDOWN_MS),
        configSnapshot: configRows[0] ?? current.configSnapshot,
        updatedAt: new Date(),
      })
      .where(eq(guilds.guildId, guildId));
    await db.update(configs).set({ premiumServerEnabled: false, updatedAt: new Date() }).where(eq(configs.guildId, guildId));
    return NextResponse.json(await stateFor(userId, guildId), { headers: { 'Cache-Control': 'no-store' } });
  }

  if (current?.status === 'active') return NextResponse.json({ error: 'already_active' }, { status: 409 });
  if (current?.cooldownUntil && current.cooldownUntil.getTime() > Date.now()) {
    return NextResponse.json(
      { error: 'cooldown', until: current.cooldownUntil.toISOString() },
      { status: 409 },
    );
  }
  const limit = SERVER_LIMIT[account.plan] ?? 3;
  const active = await db
    .select({ guildId: guilds.guildId })
    .from(guilds)
    .where(and(eq(guilds.userId, userId), eq(guilds.status, 'active')));
  if (active.length >= limit) return NextResponse.json({ error: 'limit_reached', limit }, { status: 409 });

  const configRows = await db.select().from(configs).where(eq(configs.guildId, guildId)).limit(1);
  const snapshot = current?.configSnapshot ?? configRows[0] ?? null;
  if (snapshot && typeof snapshot === 'object') {
    const { guildId: _guildId, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = snapshot as Record<string, unknown>;
    await db
      .update(configs)
      .set({ ...rest, guildId, updatedAt: new Date() } as never)
      .where(eq(configs.guildId, guildId));
  }
  await db
    .insert(guilds)
    .values({
      guildId,
      userId,
      activationId: randomUUID(),
      plan: account.plan,
      status: 'active',
      configSnapshot: snapshot,
      cooldownUntil: null,
      deactivatedAt: null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: guilds.guildId,
      set: {
        userId,
        activationId: randomUUID(),
        plan: account.plan,
        status: 'active',
        cooldownUntil: null,
        deactivatedAt: null,
        configSnapshot: snapshot,
        updatedAt: new Date(),
      },
    });
  await db.update(configs).set({ premiumServerEnabled: true, updatedAt: new Date() }).where(eq(configs.guildId, guildId));

  return NextResponse.json(await stateFor(userId, guildId), { headers: { 'Cache-Control': 'no-store' } });
}
