import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUserId, isGuildAdmin, getGuildsForUser } from '@/lib/auth';
import { db, ciszubotSchema, eq, and, desc, inArray, sql } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Manager de giveaways desde el dashboard:
 *  · GET: lista de sorteos (con participantes/ganadores) y participantes de uno.
 *  · POST: encola una acción para el bot (crear/pausar/reanudar/cancelar/
 *    relanzar/quitar/vetar) en ciszubot.bot_actions.
 */

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('pause'), giveaway_id: z.string().min(1) }),
  z.object({ action: z.literal('resume'), giveaway_id: z.string().min(1) }),
  z.object({ action: z.literal('cancel'), giveaway_id: z.string().min(1) }),
  z.object({ action: z.literal('reroll'), giveaway_id: z.string().min(1) }),
  z.object({ action: z.literal('remove'), giveaway_id: z.string().min(1), user_id: z.string().regex(/^\d{17,20}$/) }),
  z.object({ action: z.literal('ban'), giveaway_id: z.string().min(1), user_id: z.string().regex(/^\d{17,20}$/) }),
  z.object({
    action: z.literal('create'),
    prize: z.string().min(1).max(200),
    winners: z.number().int().min(1).max(50),
    duration_minutes: z.number().int().min(1).max(20160),
    channel_id: z.string().regex(/^\d{17,20}$/),
    required_role_ids: z.array(z.string().max(32)).max(10).optional(),
    grant_role_ids: z.array(z.string().max(32)).max(10).optional(),
    max_participants: z.number().int().min(0).max(10000).optional(),
    required_messages: z.number().int().min(0).max(100000).optional(),
    bonus_roles: z.array(z.object({ role_id: z.string().max(32), multiplier: z.number().min(1).max(10) })).max(10).optional(),
  }),
]);

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

async function authorize(guildId: string) {
  const userId = await getSessionUserId();
  if (!userId) return { error: NextResponse.json({ error: 'no_auth' }, { status: 401 }) };
  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  return { userId };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const auth = await authorize(guildId);
  if (auth.error) return auth.error;

  const url = new URL(req.url);

  // Estado de una acción encolada (para el formulario de creación).
  const actionId = Number(url.searchParams.get('action') ?? '0');
  if (actionId > 0) {
    const actions = ciszubotSchema.botActions;
    const rows = await db
      .select({ processed: actions.processed, result: actions.result })
      .from(actions)
      .where(and(eq(actions.id, actionId), eq(actions.guildId, guildId)))
      .limit(1);
    return NextResponse.json({ action: rows[0] ?? null }, { headers: { 'Cache-Control': 'no-store' } });
  }

  // Participantes de un sorteo concreto.
  const giveawayId = url.searchParams.get('id');
  if (giveawayId) {
    const parts = ciszubotSchema.giveawayParticipants;
    const rows = await db
      .select({ userId: parts.userId, entries: parts.entries, joinedAt: parts.joinedAt })
      .from(parts)
      .where(eq(parts.giveawayId, giveawayId))
      .orderBy(desc(parts.joinedAt))
      .limit(200);
    const bans = ciszubotSchema.giveawayBans;
    const banRows = await db.select({ userId: bans.userId }).from(bans).where(eq(bans.giveawayId, giveawayId));
    return NextResponse.json(
      { participants: rows, bans: banRows.map((b) => b.userId) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  // Lista de sorteos + número de participantes.
  const giveaways = ciszubotSchema.giveaways;
  const rows = await db
    .select()
    .from(giveaways)
    .where(eq(giveaways.guildId, guildId))
    .orderBy(desc(giveaways.createdAt))
    .limit(60);

  const ids = rows.map((r) => r.id);
  const counts = new Map<string, number>();
  if (ids.length > 0) {
    const parts = ciszubotSchema.giveawayParticipants;
    const countRows = await db
      .select({ giveawayId: parts.giveawayId, n: sql<number>`count(*)::int` })
      .from(parts)
      .where(inArray(parts.giveawayId, ids))
      .groupBy(parts.giveawayId);
    for (const c of countRows) counts.set(c.giveawayId, Number(c.n));
  }

  return NextResponse.json(
    {
      free_limit: 10,
      giveaways: rows.map((r) => ({
        id: r.id,
        slot: r.slot,
        prize: r.prize,
        status: r.status,
        ended: r.ended,
        winners: r.winners,
        winner_ids: Array.isArray(r.winnerIds) ? r.winnerIds : [],
        channel_id: r.channelId,
        message_id: r.messageId,
        hosted_by: r.hostedBy,
        source: r.createdSource,
        ends_at: r.endsAt,
        created_at: r.createdAt,
        paused_at: r.pausedAt,
        cancelled_at: r.cancelledAt,
        required_role_ids: r.requiredRoleIds,
        grant_role_ids: r.grantRoleIds,
        max_participants: r.maxParticipants,
        required_messages: r.requiredMessages,
        bonus_roles: r.bonusRoles,
        participants: counts.get(r.id) ?? 0,
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const { guildId } = await params;
  const auth = await authorize(guildId);
  if (auth.error) return auth.error;
  const userId = auth.userId!;

  const parsed = await parseJsonBody(req, actionSchema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const body = parsed.data;

  // El canal para la fila de la acción: el del sorteo (o el elegido al crear).
  let channelId = body.action === 'create' ? body.channel_id : '';
  if (body.action !== 'create') {
    const giveaways = ciszubotSchema.giveaways;
    const rows = await db
      .select({ channelId: giveaways.channelId })
      .from(giveaways)
      .where(and(eq(giveaways.id, body.giveaway_id), eq(giveaways.guildId, guildId)))
      .limit(1);
    if (!rows[0]) return NextResponse.json({ error: 'giveaway_not_found' }, { status: 404 });
    channelId = rows[0].channelId;
  }

  const typeMap: Record<string, string> = {
    pause: 'giveaway_pause',
    resume: 'giveaway_resume',
    cancel: 'giveaway_cancel',
    reroll: 'giveaway_reroll',
    remove: 'giveaway_remove',
    ban: 'giveaway_ban',
    create: 'giveaway_create',
  };

  const content =
    body.action === 'create'
      ? JSON.stringify({ ...body, host_id: userId })
      : JSON.stringify({ giveaway_id: body.giveaway_id, user_id: 'user_id' in body ? body.user_id : undefined });

  try {
    const actions = ciszubotSchema.botActions;
    const inserted = await db
      .insert(actions)
      .values({
        guildId,
        type: typeMap[body.action],
        channelId,
        content,
        createdBy: userId,
        source: 'dashboard',
      })
      .returning({ id: actions.id });

    await logAudit({
      event: 'bot_action_say',
      actorId: userId,
      actorName: null,
      target: guildId,
      ip,
      detail: { giveawayAction: body.action, giveawayId: 'giveaway_id' in body ? body.giveaway_id : undefined },
    });

    return NextResponse.json({ ok: true, id: inserted[0]?.id ?? null });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'db_error' }, { status: 500 });
  }
}
