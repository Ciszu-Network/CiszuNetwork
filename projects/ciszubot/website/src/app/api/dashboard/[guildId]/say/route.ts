import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUserId, isGuildAdmin, getGuildsForUser } from '@/lib/auth';
import { db, ciszubotSchema, eq } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Say/DirectSay desde el dashboard: inserta una acción en ciszubot.bot_actions
 * y el bot la ejecuta en segundos (poll cada 5s). El GET permite consultar el
 * resultado para mostrarlo en la UI.
 */

const saySchema = z.object({
  type: z.enum(['say', 'directsay']),
  channel_id: z.string().regex(/^\d{17,20}$/),
  content: z.string().min(1).max(2000),
});

const limiter = createRateLimiter({ windowMs: 60_000, max: 15 });

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
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

  const parsed = await parseJsonBody(req, saySchema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }

  try {
    const rows = await db
      .insert(ciszubotSchema.botActions)
      .values({
        guildId,
        type: parsed.data.type,
        channelId: parsed.data.channel_id,
        content: parsed.data.content,
        createdBy: userId,
        source: 'dashboard',
      })
      .returning({ id: ciszubotSchema.botActions.id });
    const id = rows[0]?.id ?? null;

    await logAudit({
      event: 'bot_action_say',
      actorId: userId,
      actorName: null,
      target: guildId,
      ip,
      detail: { type: parsed.data.type, channel: parsed.data.channel_id, actionId: id },
    });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'db_error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'no_auth' }, { status: 401 });

  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const id = Number(new URL(req.url).searchParams.get('id') ?? '0');
  if (!Number.isFinite(id) || id <= 0) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const rows = await db
    .select({
      id: ciszubotSchema.botActions.id,
      processed: ciszubotSchema.botActions.processed,
      result: ciszubotSchema.botActions.result,
    })
    .from(ciszubotSchema.botActions)
    .where(eq(ciszubotSchema.botActions.id, id))
    .limit(1);

  return NextResponse.json({ action: rows[0] ?? null });
}
