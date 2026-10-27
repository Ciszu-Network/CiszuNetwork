import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isGuildAdmin, getGuildsForUser } from '@/lib/auth';
import { db, ciszubotSchema, eq, desc } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function authorize(guildId: string) {
  const userId = await getSessionUserId();
  if (!userId) return { error: NextResponse.json({ error: 'no_auth' }, { status: 401 }) };
  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  }
  return { userId };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const auth = await authorize(guildId);
  if (auth.error) return auth.error;

  const mode = new URL(req.url).searchParams.get('mode');
  const table = ciszubotSchema.confessions;
  const rows = await db
    .select({
      id: table.id,
      anonymous: table.anonymous,
      content: table.content,
      userId: table.userId,
      channelId: table.channelId,
      messageId: table.messageId,
      createdAt: table.createdAt,
    })
    .from(table)
    .where(eq(table.guildId, guildId))
    .orderBy(desc(table.createdAt))
    .limit(100);

  const filtered =
    mode === 'public'
      ? rows.filter((row) => !row.anonymous)
      : mode === 'anonymous'
        ? rows.filter((row) => row.anonymous)
        : rows;

  return NextResponse.json(
    { confessions: filtered },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
