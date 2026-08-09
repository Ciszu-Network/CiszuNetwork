import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isGuildAdmin, getGuildsForUser, supabaseAdmin } from '@/lib/auth';
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

  const db = supabaseAdmin();
  const { data } = await db.from('guild_configs').select('*').eq('guild_id', guildId).maybeSingle();
  return NextResponse.json({ guild: { id: guild.id, name: guild.name, icon: guild.icon }, config: data ?? null });
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

  const db = supabaseAdmin();
  const patch: Record<string, string | boolean | number | string[]> = { ...allowed, guild_id: guildId, updated_at: new Date().toISOString() };
  if (allowed.autorole_ids !== undefined) {
    patch.autorole_ids = JSON.stringify(allowed.autorole_ids);
  }
  const { error } = await db.from('guild_configs').upsert(patch);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
