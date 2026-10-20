import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUserId, isGuildAdmin, getGuildsForUser } from '@/lib/auth';
import { db, ciszubotSchema, eq, and } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { COMMANDS } from '@/data/commands';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Manager de comandos personalizados del servidor (cz!<trigger>).
 * Límite: 5 en plan free; ilimitados con premium. Sin colisiones con el bot.
 */

const bodySchema = z.object({
  trigger: z.string().min(2).max(20).regex(/^[a-zA-Z0-9]+$/),
  response: z.string().min(1).max(1000),
});

const deleteSchema = z.object({ trigger: z.string().min(2).max(20) });

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

async function guard(req: NextRequest, guildId: string) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return { error: NextResponse.json({ error: 'rate_limited' }, { status: 429 }) };
  const userId = await getSessionUserId();
  if (!userId) return { error: NextResponse.json({ error: 'no_auth' }, { status: 401 }) };
  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  return { userId };
}

async function isPremium(guildId: string): Promise<boolean> {
  try {
    const rows = await db
      .select({ status: ciszubotSchema.premiumGuilds.status, expiresAt: ciszubotSchema.premiumGuilds.expiresAt })
      .from(ciszubotSchema.premiumGuilds)
      .where(eq(ciszubotSchema.premiumGuilds.guildId, guildId))
      .limit(1);
    const row = rows[0];
    if (!row || row.status !== 'active') return false;
    return !row.expiresAt || row.expiresAt.getTime() > Date.now();
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const g = await guard(req, guildId);
  if (g.error) return g.error;

  const table = ciszubotSchema.customCommands;
  const rows = await db
    .select({ id: table.id, trigger: table.trigger, response: table.response, uses: table.uses, createdBy: table.createdBy })
    .from(table)
    .where(eq(table.guildId, guildId))
    .limit(100);
  return NextResponse.json({
    items: rows.map((r) => ({ id: r.id, trigger: r.trigger, response: r.response, uses: r.uses, created_by: r.createdBy })),
    premium: await isPremium(guildId),
    limit: 5,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const g = await guard(req, guildId);
  if (g.error) return g.error;

  const parsed = await parseJsonBody(req, bodySchema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const trigger = parsed.data.trigger.toLowerCase();
  const table = ciszubotSchema.customCommands;

  const existing = await db.select({ id: table.id }).from(table).where(eq(table.guildId, guildId));
  const premium = await isPremium(guildId);
  if (!premium && existing.length >= 5) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 409 });
  }
  const takenByBot = COMMANDS.some((c) => c.name.toLowerCase() === trigger);
  if (takenByBot) {
    return NextResponse.json({ error: 'reserved' }, { status: 409 });
  }
  const dup = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.guildId, guildId), eq(table.trigger, trigger)))
    .limit(1);
  if (dup[0]) return NextResponse.json({ error: 'already_exists' }, { status: 409 });

  await db.insert(table).values({ guildId, trigger, response: parsed.data.response.trim(), createdBy: g.userId });
  await logAudit({ event: 'customcmd_create', actorId: g.userId, target: trigger, detail: { trigger } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const g = await guard(req, guildId);
  if (g.error) return g.error;

  const parsed = await parseJsonBody(req, deleteSchema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const trigger = parsed.data.trigger.toLowerCase();
  const table = ciszubotSchema.customCommands;
  await db.delete(table).where(and(eq(table.guildId, guildId), eq(table.trigger, trigger)));
  await logAudit({ event: 'customcmd_delete', actorId: g.userId, target: trigger, detail: { trigger } });
  return NextResponse.json({ ok: true });
}
