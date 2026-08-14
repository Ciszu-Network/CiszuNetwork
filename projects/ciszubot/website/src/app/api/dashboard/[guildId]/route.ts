import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isGuildAdmin, getGuildsForUser } from '@/lib/auth';
import { db, ciszubotSchema, eq } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { createRateLimiter } from '@ciszunetwork/utils';

export const runtime = 'nodejs';

const postLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

interface GuildConfig {
  prefix: string;
  lang: string;
  leveling_enabled: boolean;
  level_channel_id: string | null;
  xp_rate: number;
  welcome_channel_id: string | null;
  welcome_message: string;
  goodbye_channel_id: string | null;
  goodbye_message: string;
  autorole_ids: string[] | string;
  logs_channel_id: string | null;
  counters: unknown[] | string;
  tickets_enabled: boolean;
  tickets_category_id: string | null;
  tickets_role_id: string | null;
  private_channels: boolean;
  private_category_id: string | null;
  music_channel_id: string | null;
  automod_enabled: boolean;
  mute_role_id: string | null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'no_auth' }, { status: 401 });

  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const guildConfigs = ciszubotSchema.guildConfigs;
  const rows = await db
    .select()
    .from(guildConfigs)
    .where(eq(guildConfigs.guildId, guildId))
    .limit(1);
  return NextResponse.json({ guild: { id: guild.id, name: guild.name, icon: guild.icon }, config: rows[0] ?? null });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = postLimiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }
  const { guildId } = await params;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'no_auth' }, { status: 401 });

  const guilds = await getGuildsForUser(userId);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || !isGuildAdmin(guild)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

const body = (await req.json()) as Partial<GuildConfig>;
  const allowed: Record<string, string | boolean | number | string[]> = {};
  const stringFields: Array<keyof GuildConfig> = ['prefix', 'lang', 'level_channel_id', 'welcome_channel_id', 'welcome_message', 'goodbye_channel_id', 'goodbye_message', 'logs_channel_id', 'tickets_category_id', 'tickets_role_id', 'private_category_id', 'music_channel_id', 'mute_role_id'];
  const boolFields: Array<keyof GuildConfig> = ['leveling_enabled', 'tickets_enabled', 'private_channels', 'automod_enabled'];

  for (const key of stringFields) {
    if (body[key] !== undefined) allowed[key] = String(body[key]);
  }
  for (const key of boolFields) {
    if (body[key] !== undefined) allowed[key] = Boolean(body[key]);
  }
  if (body.xp_rate !== undefined) {
    const rate = Number(body.xp_rate);
    if (rate >= 0.1 && rate <= 10) allowed.xp_rate = rate;
  }
  if (body.autorole_ids !== undefined) {
    allowed.autorole_ids = Array.isArray(body.autorole_ids)
      ? body.autorole_ids
      : String(body.autorole_ids).split(',').map((s) => s.trim()).filter(Boolean);
  }

  const snakeToCamel: Record<string, string> = {
    level_channel_id: 'levelChannelId',
    welcome_channel_id: 'welcomeChannelId',
    welcome_message: 'welcomeMessage',
    goodbye_channel_id: 'goodbyeChannelId',
    goodbye_message: 'goodbyeMessage',
    logs_channel_id: 'logsChannelId',
    tickets_category_id: 'ticketsCategoryId',
    tickets_role_id: 'ticketsRoleId',
    private_category_id: 'privateCategoryId',
    music_channel_id: 'musicChannelId',
    mute_role_id: 'muteRoleId',
    leveling_enabled: 'levelingEnabled',
    tickets_enabled: 'ticketsEnabled',
    private_channels: 'privateChannels',
    automod_enabled: 'automodEnabled',
    xp_rate: 'xpRate',
    autorole_ids: 'autoroleIds',
  };
  const values: Record<string, unknown> = { guildId };
  for (const [key, value] of Object.entries(allowed)) {
    const camel = snakeToCamel[key] ?? key;
    values[camel] = key === 'autorole_ids' && Array.isArray(value) ? value : value;
  }
  values.updatedAt = new Date();

  const guildConfigs = ciszubotSchema.guildConfigs;
  try {
    await db
      .insert(guildConfigs)
      .values(values as never)
      .onConflictDoUpdate({
        target: guildConfigs.guildId,
        set: { ...values, guildId: undefined } as never,
      });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'db_error' }, { status: 500 });
  }
  await logAudit({
    event: 'config_update',
    actorId: userId,
    target: guildId,
    ip,
    detail: { fields: Object.keys(allowed) },
  });
  return NextResponse.json({ ok: true });
}
