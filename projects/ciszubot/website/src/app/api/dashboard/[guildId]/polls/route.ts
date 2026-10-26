import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUserId, isGuildAdmin, getGuildsForUser } from '@/lib/auth';
import { db, ciszubotSchema, eq, and, desc } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Encuestas desde el dashboard:
 *  · POST action=create: encola un `poll_create` en ciszubot.bot_actions.
 *  · POST action=close: encola un `poll_close` para finalizar una encuesta.
 *  · GET ?action=<id>: consulta el estado/resultado de una acción.
 *  · GET sin action: lista las encuestas del servidor (activas y cerradas).
 */

const createSchema = z.object({
  action: z.literal('create'),
  question: z.string().trim().min(1).max(250),
  options: z.array(z.string().trim().min(1).max(80)).min(2).max(10),
  anonymous: z.boolean().optional(),
  duration_minutes: z.number().int().min(0).max(10080).optional(),
  channel_id: z.string().regex(/^\d{17,20}$/),
});

const closeSchema = z.object({
  action: z.literal('close'),
  poll_id: z.number().int().positive(),
});

const actionSchema = z.discriminatedUnion('action', [createSchema, closeSchema]);

const limiter = createRateLimiter({ windowMs: 60_000, max: 15 });

function optionsOf(value: unknown): string[] {
  return Array.isArray(value) ? value.map((option) => String(option)) : [];
}

function countsOf(votes: unknown, optionCount: number): number[] {
  const counts = Array.from({ length: optionCount }, () => 0);
  if (!votes || typeof votes !== 'object') return counts;
  for (const value of Object.values(votes as Record<string, unknown>)) {
    const index = Number(value);
    if (Number.isInteger(index) && index >= 0 && index < optionCount) counts[index] += 1;
  }
  return counts;
}

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

  const actionParam = new URL(req.url).searchParams.get('action');
  if (actionParam) {
    const actionId = Number(actionParam);
    if (!Number.isFinite(actionId) || actionId <= 0) {
      return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
    }

    const actions = ciszubotSchema.botActions;
    const rows = await db
      .select({ processed: actions.processed, result: actions.result })
      .from(actions)
      .where(and(eq(actions.id, actionId), eq(actions.guildId, guildId)))
      .limit(1);

    return NextResponse.json(
      { action: rows[0] ?? null },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const polls = ciszubotSchema.polls;
  const rows = await db
    .select()
    .from(polls)
    .where(eq(polls.guildId, guildId))
    .orderBy(desc(polls.createdAt))
    .limit(50);

  const list = rows.map((row) => {
    const options = optionsOf(row.options);
    const counts = countsOf(row.votes, options.length);
    return {
      id: row.id,
      question: row.question,
      options,
      counts,
      total_votes: counts.reduce((sum, count) => sum + count, 0),
      anonymous: row.anonymous,
      ended: row.ended,
      winner_index: row.winnerIndex,
      channel_id: row.channelId,
      author_id: row.authorId,
      message_id: row.messageId,
      created_at: row.createdAt,
      ends_at: row.endsAt,
    };
  });

  return NextResponse.json({ polls: list }, { headers: { 'Cache-Control': 'no-store' } });
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

  try {
    const actions = ciszubotSchema.botActions;
    const body = parsed.data;
    let type: 'poll_create' | 'poll_close';
    let channelId: string;
    let content: string;

    if (body.action === 'close') {
      const polls = ciszubotSchema.polls;
      const found = await db
        .select({ channelId: polls.channelId, ended: polls.ended })
        .from(polls)
        .where(and(eq(polls.id, body.poll_id), eq(polls.guildId, guildId)))
        .limit(1);
      if (!found[0]) return NextResponse.json({ error: 'poll_not_found' }, { status: 404 });
      if (found[0].ended) return NextResponse.json({ error: 'poll_already_ended' }, { status: 409 });

      type = 'poll_close';
      channelId = found[0].channelId;
      content = JSON.stringify({ poll_id: body.poll_id, author_id: userId });
    } else {
      type = 'poll_create';
      channelId = body.channel_id;
      content = JSON.stringify({ ...body, author_id: userId });
    }

    const inserted = await db
      .insert(actions)
      .values({
        guildId,
        type,
        channelId,
        content,
        createdBy: userId,
        source: 'dashboard',
      })
      .returning({ id: actions.id });

    const id = inserted[0]?.id ?? null;

    await logAudit({
      event: 'bot_action_poll',
      actorId: userId,
      actorName: null,
      target: guildId,
      ip,
      detail:
        body.action === 'close'
          ? { pollAction: 'close', pollId: body.poll_id, actionId: id }
          : {
              pollAction: 'create',
              channel: body.channel_id,
              actionId: id,
              anonymous: body.anonymous ?? false,
            },
    });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'db_error' }, { status: 500 });
  }
}
