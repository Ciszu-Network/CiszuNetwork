import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { z } from 'zod';
import { getSessionUserId, isGuildAdmin, getGuildsForUser } from '@/lib/auth';
import { db, ciszubotSchema, eq } from '@/lib/db';
import { sql } from '@ciszunetwork/db';
import { logAudit } from '@/lib/audit';
import { fetchGuildInfo } from '@/lib/discordGuild';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';

export const runtime = 'nodejs';

const SOCIAL_PLATFORMS = [
  'x',
  'instagram',
  'facebook',
  'tiktok',
  'youtube',
  'twitch',
  'linkedin',
  'spotify',
  'soundcloud',
  'github',
  'reddit',
  'pinterest',
  'patreon',
  'kofi',
  'buymeacoffee',
  'other',
] as const;

const SOCIAL_FEED_KINDS = ['profile', 'page', 'user', 'group', 'channel', 'subreddit', 'feed'] as const;

const socialFeedSchema = z.object({
  id: z.string().min(1).max(40),
  platform: z.enum(SOCIAL_PLATFORMS),
  kind: z.enum(SOCIAL_FEED_KINDS),
  account: z.string().max(300),
  channel_id: z.string().max(32),
  ping_role_id: z.string().max(32).nullable(),
  message: z.string().max(2000),
  enabled: z.boolean(),
});

const guildConfigPatchSchema = z.object({
  prefix: z.string().min(1).max(10).optional(),
  lang: z.enum(['es', 'en']).optional(),
  leveling_enabled: z.boolean().optional(),
  level_channel_id: z.string().min(1).nullable().optional(),
  xp_rate: z.number().min(0.1).max(10).optional(),
  welcome_channel_id: z.string().min(1).nullable().optional(),
  welcome_message: z.string().max(500).optional(),
  goodbye_channel_id: z.string().min(1).nullable().optional(),
  goodbye_message: z.string().max(500).optional(),
  autorole_ids: z.array(z.string().min(1)).optional(),
  logs_channel_id: z.string().min(1).nullable().optional(),
  tickets_enabled: z.boolean().optional(),
  tickets_category_id: z.string().min(1).nullable().optional(),
  tickets_role_id: z.string().min(1).nullable().optional(),
  private_channels: z.boolean().optional(),
  private_category_id: z.string().min(1).nullable().optional(),
  music_channel_id: z.string().min(1).nullable().optional(),
  automod_enabled: z.boolean().optional(),
  mute_role_id: z.string().min(1).nullable().optional(),
  /** Toggles por servidor de funciones del bot (slug → enabled). */
  features: z.record(z.string(), z.boolean()).optional(),
  leaderboard_enabled: z.boolean().optional(),
  leaderboard_slug: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9-]+$/)
    .nullable()
    .optional(),
  coin_emoji: z.string().min(1).max(64).optional(),
  coin_name: z.string().min(1).max(32).optional(),
  staff_role_id: z.string().min(1).nullable().optional(),
  level_message: z.string().max(500).optional(),
  level_roles: z
    .array(z.object({ level: z.number().int().min(1).max(1000), role_id: z.string().min(1).max(32) }))
    .max(50)
    .optional(),
  automod_config: z
    .object({
      links: z.boolean(),
      invites: z.boolean(),
      caps: z.boolean(),
      spam: z.boolean(),
      flood: z.boolean(),
      words: z.array(z.string().min(1).max(64)).max(100),
    })
    .optional(),
  alliance_config: z
    .object({
      enabled: z.boolean(),
      channel_id: z.string().min(1).nullable(),
      role_id: z.string().min(1).nullable(),
      notify_role_id: z.string().min(1).nullable(),
      cooldown_hours: z.number().int().min(0).max(8760),
      one_per_server: z.boolean(),
      allow_nsfw: z.boolean(),
      blocked_words: z.array(z.string().min(1).max(64)).max(200),
      blocked_servers: z.array(z.string().min(1).max(32)).max(500),
      sanction: z.enum(['none', 'mute', 'kick', 'ban']),
      sanction_minutes: z.number().int().min(1).max(100000),
      rewards: z
        .array(z.object({ points: z.number().int().min(1), role_id: z.string().max(32).optional(), money: z.number().int().min(0).max(1_000_000).optional() }))
        .max(50),
      embed_success: z.object({ title: z.string().max(256), description: z.string().max(2000), color: z.string().max(32) }),
      embed_error: z.object({ title: z.string().max(256), description: z.string().max(2000), color: z.string().max(32) }),
      error_delete_after: z.number().int().min(0).max(3600),
    })
    .optional(),
  ticket_config: z
    .object({
      enabled: z.boolean(),
      panel_channel_id: z.string().min(1).nullable(),
      log_channel_id: z.string().min(1).nullable(),
      auto_delete_hours: z.number().int().min(0).max(720),
      categories: z
        .array(
          z.object({
            id: z.string().min(1).max(32),
            label: z.string().min(1).max(100),
            emoji: z.string().max(64),
            description: z.string().max(100),
            discord_category_id: z.string().min(1).nullable(),
            role_ids: z.array(z.string().min(1).max(32)).max(10),
            grant_role_id: z.string().min(1).nullable(),
            form: z.array(z.string().min(1).max(200)).max(5),
            welcome: z.string().max(1000),
            color: z.string().max(32),
          }),
        )
        .max(25),
    })
    .optional(),
  drops: z
    .object({
      list: z
        .array(
          z.object({
            id: z.string().min(1).max(32),
            name: z.string().min(1).max(50),
            enabled: z.boolean(),
            channels: z.array(z.string().min(1).max(32)).max(20),
            min: z.number().int().min(1).max(1_000_000),
            max: z.number().int().min(1).max(1_000_000),
            interval_min: z.number().int().min(5).max(1440),
            interval_max: z.number().int().min(5).max(1440),
            message: z.string().max(300).nullable(),
            excluded_roles: z.array(z.string().min(1).max(32)).max(50),
          }),
        )
        .max(20),
    })
    .optional(),
  starboard_channel_id: z.string().min(1).nullable().optional(),
  starboard_emoji: z.string().min(1).max(64).optional(),
  starboard_min: z.number().int().min(1).max(100).optional(),
  invite_points_per: z.number().int().min(1).max(100).optional(),
  invite_rewards: z
    .array(
      z.object({
        invites: z.number().int().min(1).max(10000),
        role_id: z.string().min(1).max(32),
      }),
    )
    .max(20)
    .optional(),
  invite_channel_id: z.string().min(1).max(32).nullable().optional(),
  invite_message: z.string().max(2000).optional(),
  nitro_repost_enabled: z.boolean().optional(),
  private_vc_hub_id: z.string().min(1).nullable().optional(),
  history_enabled: z.boolean().optional(),
  history_channel_id: z.string().min(1).nullable().optional(),
  afk_role_id: z.string().min(1).nullable().optional(),
  afk_prefix_enabled: z.boolean().optional(),
  afk_auto_minutes: z.number().int().min(0).max(1440).optional(),
  counting_enabled: z.boolean().optional(),
  counting_channel_id: z.string().max(32).nullable().optional(),
  counting_start: z.number().int().min(0).max(1000000).optional(),
  counting_style: z.enum(['traditional', 'sum']).optional(),
  counting_allow_repeat: z.boolean().optional(),
  counting_authenticity: z.enum(['solo', 'dependent']).optional(),
  suggestions_enabled: z.boolean().optional(),
  suggestions_channel_id: z.string().max(32).nullable().optional(),
  suggestions_excluded_role_ids: z.array(z.string().min(1).max(32)).max(20).optional(),
  suggestions_max_active: z.number().int().min(0).max(100).optional(),
  suggestions_cooldown_minutes: z.number().int().min(0).max(1440).optional(),
  polls_enabled: z.boolean().optional(),
  polls_excluded_role_ids: z.array(z.string().min(1).max(32)).max(20).optional(),
  polls_max_active: z.number().int().min(0).max(100).optional(),
  polls_cooldown_minutes: z.number().int().min(0).max(1440).optional(),
  trivia_enabled: z.boolean().optional(),
  trivia_excluded_role_ids: z.array(z.string().min(1).max(32)).max(20).optional(),
  trivia_timed: z.boolean().optional(),
  trivia_time_seconds: z.number().int().min(10).max(600).optional(),
  trivia_difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
  trivia_categories: z.array(z.string().min(1).max(32)).max(24).optional(),
  trivia_channel_id: z.string().max(32).nullable().optional(),
  trivia_rewards: z.array(z.object({ points: z.number().int().min(1).max(100000), role_id: z.string().min(1).max(32) })).max(20).optional(),
  autoposts_enabled: z.boolean().optional(),
  autoposts: z.array(z.object({ id: z.string().max(40), type: z.enum(['custom', 'animals', 'anime']), channel_id: z.string().max(32), interval_minutes: z.number().int().min(5).max(10080), text: z.string().max(2000).optional(), url: z.string().max(500).optional(), nsfw: z.boolean().optional() })).max(20).optional(),
  news_enabled: z.boolean().optional(),
  news_channels: z
    .object({
      anime: z.string().max(32).nullable().optional(),
      games: z.string().max(32).nullable().optional(),
      steam: z.string().max(32).nullable().optional(),
      tech: z.string().max(32).nullable().optional(),
    })
    .optional(),
  social_enabled: z.boolean().optional(),
  social_feeds: z.array(socialFeedSchema).max(1000).optional(),
  nsfw_bot_preferences_enabled: z.boolean().optional(),
  nsfw_general_enabled: z.boolean().optional(),
  nsfw_enabled: z.boolean().optional(),
  nsfw_channel_id: z.string().max(32).nullable().optional(),
  nsfw_autopost_channel_id: z.string().max(32).nullable().optional(),
  nsfw_autopost_enabled: z.boolean().optional(),
  nsfw_autopost_minutes: z.number().int().min(15).max(10080).optional(),
  nsfw_commands_enabled: z.boolean().optional(),
  nsfw_content: z
    .object({
      default_gender: z.enum(['women', 'men', 'mixed']).optional(),
      lgbt: z.record(z.string(), z.boolean()).optional(),
      fetishes: z.record(z.string(), z.boolean()).optional(),
    })
    .optional(),
  confess_channel_id: z.string().max(32).nullable().optional(),
  confess_excluded_role_ids: z.array(z.string().min(1).max(32)).max(20).optional(),
  confess_allow_anonymous: z.boolean().optional(),
  confess_allow_public: z.boolean().optional(),
  marriage_enabled: z.boolean().optional(),
  marriage_allow_admin_pairs: z.boolean().optional(),
  command_global_cooldown: z.number().int().min(0).max(60).optional(),
  marriage_excluded_role_ids: z.array(z.string().min(1).max(32)).max(20).optional(),
  nitro_repost_mode: z.enum(['auto', 'manual']).optional(),
  nitro_excluded_role_ids: z.array(z.string().min(1).max(32)).max(20).optional(),
  owner_role_ids: z.array(z.string().min(1).max(32)).max(20).optional(),
  admin_role_ids: z.array(z.string().min(1).max(32)).max(20).optional(),
  mod_role_ids: z.array(z.string().min(1).max(32)).max(20).optional(),
  bot_role_ids: z.array(z.string().min(1).max(32)).max(20).optional(),
});

/** Funciones configurables por servidor (mismas que los flags globales del bot). */
const FEATURE_SLUGS = [
  'music',
  'search',
  'minigames',
  'minigame_dice',
  'minigame_rps',
  'minigame_rate',
  'minigame_8ball',
  'economy',
  'giveaways',
  'embeds',
  'social_afk',
  'social_marriage',
  'social',
  'util_profile',
  'util_avatar',
  'util_animal',
  'util_serverinfo',
  'util_snipe',
  'util_text',
  'utility',
  'misc_confess',
  'misc_hi',
  'misc_bye',
  'misc_test',
  'misc',
  'help',
  'moderation',
  'setup',
  'levels',
] as const;

const postLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const NSFW_LGBT_KEYS = ['gay', 'lesbian', 'trans', 'bisexual', 'pansexual', 'nonbinary'] as const;
const NSFW_FETISH_KEYS = ['femboy', 'tomboy', 'blonde', 'ebony', 'latina', 'milf', 'feet', 'thighs', 'belly'] as const;
const DEFAULT_NSFW_CONTENT = {
  default_gender: 'women' as const,
  lgbt: Object.fromEntries(NSFW_LGBT_KEYS.map((key) => [key, true])),
  fetishes: Object.fromEntries(NSFW_FETISH_KEYS.map((key) => [key, true])),
};

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
  features?: Record<string, boolean>;
  leaderboard_enabled?: boolean;
  leaderboard_slug?: string | null;
  coin_emoji?: string;
  coin_name?: string;
  staff_role_id?: string | null;
  level_message?: string;
  level_roles?: { level: number; role_id: string }[];
  automod_config?: { links: boolean; invites: boolean; caps: boolean; spam: boolean; words: string[] };
  drops?: {
    list: {
      id: string;
      name: string;
      enabled: boolean;
      channels: string[];
      min: number;
      max: number;
      interval_min: number;
      interval_max: number;
      message: string | null;
      excluded_roles: string[];
    }[];
  };
  starboard_channel_id?: string | null;
  starboard_emoji?: string;
  starboard_min?: number;
  invite_points_per?: number;
  invite_rewards?: { invites: number; role_id: string }[];
  invite_channel_id?: string | null;
  invite_message?: string;
  nitro_repost_enabled?: boolean;
  private_vc_hub_id?: string | null;
  history_enabled?: boolean;
  history_channel_id?: string | null;
  afk_role_id?: string | null;
  afk_prefix_enabled?: boolean;
  afk_auto_minutes?: number;
  counting_enabled?: boolean;
  counting_channel_id?: string | null;
  counting_start?: number;
  counting_style?: 'traditional' | 'sum';
  counting_allow_repeat?: boolean;
  counting_authenticity?: 'solo' | 'dependent';
  suggestions_enabled?: boolean;
  suggestions_channel_id?: string | null;
  suggestions_excluded_role_ids?: string[];
  suggestions_max_active?: number;
  suggestions_cooldown_minutes?: number;
  polls_enabled?: boolean;
  polls_excluded_role_ids?: string[];
  polls_max_active?: number;
  polls_cooldown_minutes?: number;
  trivia_enabled?: boolean;
  trivia_excluded_role_ids?: string[];
  trivia_timed?: boolean;
  trivia_time_seconds?: number;
  trivia_difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  trivia_categories?: string[];
  trivia_channel_id?: string | null;
  trivia_rewards?: { points: number; role_id: string }[];
  autoposts_enabled?: boolean;
  autoposts?: { id: string; type: 'custom' | 'animals' | 'anime'; channel_id: string; interval_minutes: number; text?: string; url?: string; nsfw?: boolean }[];
  news_enabled?: boolean;
  news_channels?: { anime?: string | null; games?: string | null; steam?: string | null; tech?: string | null };
  social_enabled?: boolean;
  social_feeds?: {
    id: string;
    platform: (typeof SOCIAL_PLATFORMS)[number];
    kind: (typeof SOCIAL_FEED_KINDS)[number];
    account: string;
    channel_id: string;
    ping_role_id: string | null;
    message: string;
    enabled: boolean;
  }[];
  nsfw_bot_preferences_enabled?: boolean;
  nsfw_general_enabled?: boolean;
  nsfw_enabled?: boolean;
  nsfw_channel_id?: string | null;
  nsfw_autopost_channel_id?: string | null;
  nsfw_autopost_enabled?: boolean;
  nsfw_autopost_minutes?: number;
  nsfw_commands_enabled?: boolean;
  nsfw_content?: {
    default_gender?: 'women' | 'men' | 'mixed';
    lgbt?: Record<string, boolean>;
    fetishes?: Record<string, boolean>;
  };
  confess_channel_id?: string | null;
  confess_excluded_role_ids?: string[];
  confess_allow_anonymous?: boolean;
  confess_allow_public?: boolean;
  marriage_enabled?: boolean;
  marriage_allow_admin_pairs?: boolean;
  command_global_cooldown?: number;
  marriage_excluded_role_ids?: string[];
  nitro_repost_mode?: string;
  nitro_excluded_role_ids?: string[];
  owner_role_ids?: string[];
  admin_role_ids?: string[];
  mod_role_ids?: string[];
  bot_role_ids?: string[];
  alliance_config?: Record<string, unknown>;
  ticket_config?: Record<string, unknown>;
}

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

function rowToSnake(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [camelToSnake(key), value]));
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
  const featureRows = await db
    .select({ feature: ciszubotSchema.guildFeatureFlags.feature, enabled: ciszubotSchema.guildFeatureFlags.enabled })
    .from(ciszubotSchema.guildFeatureFlags)
    .where(eq(ciszubotSchema.guildFeatureFlags.guildId, guildId));
  const features = Object.fromEntries(featureRows.map((r) => [r.feature, r.enabled]));
  const premiumRows = await db
    .select({ status: ciszubotSchema.premiumGuilds.status, expiresAt: ciszubotSchema.premiumGuilds.expiresAt })
    .from(ciszubotSchema.premiumGuilds)
    .where(eq(ciszubotSchema.premiumGuilds.guildId, guildId))
    .limit(1);
  const premiumRow = premiumRows[0];
  const premium = Boolean(
    premiumRow && premiumRow.status === 'active' && (!premiumRow.expiresAt || premiumRow.expiresAt.getTime() > Date.now())
  );
  return NextResponse.json({
    guild: { id: guild.id, name: guild.name, icon: guild.icon },
    config: rows[0] ? rowToSnake(rows[0]) : null,
    /** Estado real del servidor: sin fila = invitado pero sin configurar. */
    configured: Boolean(rows[0]),
    features,
    premium,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

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

const parsed = await parseJsonBody(req, guildConfigPatchSchema);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issue: firstZodMessage(parsed.error) },
      { status: 400 }
    );
  }
  const body = parsed.data as Partial<GuildConfig>;
  const guildConfigs = ciszubotSchema.guildConfigs;
  const currentRows = await db
    .select({
      nsfwBotPreferencesEnabled: guildConfigs.nsfwBotPreferencesEnabled,
      nsfwGeneralEnabled: guildConfigs.nsfwGeneralEnabled,
      nsfwEnabled: guildConfigs.nsfwEnabled,
      nsfwChannelId: guildConfigs.nsfwChannelId,
      nsfwAutopostChannelId: guildConfigs.nsfwAutopostChannelId,
      nsfwAutopostEnabled: guildConfigs.nsfwAutopostEnabled,
      nsfwCommandsEnabled: guildConfigs.nsfwCommandsEnabled,
      nsfwContent: guildConfigs.nsfwContent,
    })
    .from(guildConfigs)
    .where(eq(guildConfigs.guildId, guildId))
    .limit(1);
  const current = currentRows[0];
  const premiumRows = await db
    .select({ status: ciszubotSchema.premiumGuilds.status, expiresAt: ciszubotSchema.premiumGuilds.expiresAt })
    .from(ciszubotSchema.premiumGuilds)
    .where(eq(ciszubotSchema.premiumGuilds.guildId, guildId))
    .limit(1);
  const premiumRow = premiumRows[0];
  const isPremium = Boolean(
    premiumRow && premiumRow.status === 'active' && (!premiumRow.expiresAt || premiumRow.expiresAt.getTime() > Date.now())
  );

  const effectiveGate1 = body.nsfw_bot_preferences_enabled ?? current?.nsfwBotPreferencesEnabled ?? false;
  const effectiveGate2 = body.nsfw_general_enabled ?? current?.nsfwGeneralEnabled ?? false;
  const effectiveGate3 = body.nsfw_enabled ?? current?.nsfwEnabled ?? false;
  const effectiveAutopost = effectiveGate3 && (body.nsfw_autopost_enabled ?? current?.nsfwAutopostEnabled ?? false);

  if (body.nsfw_general_enabled === true && !effectiveGate1) {
    return NextResponse.json(
      { error: 'invalid_body', issue: 'Activa primero las preferencias del bot antes que General.' },
      { status: 400 },
    );
  }
  if (body.nsfw_enabled === true && (!effectiveGate1 || !effectiveGate2)) {
    return NextResponse.json(
      { error: 'invalid_body', issue: 'Activa primero las preferencias del bot y General antes que +18.' },
      { status: 400 },
    );
  }
  if (
    body.nsfw_enabled !== false &&
    (body.nsfw_commands_enabled === true || body.nsfw_autopost_enabled === true) &&
    !effectiveGate3
  ) {
    return NextResponse.json(
      { error: 'invalid_body', issue: 'Los comandos y autopics +18 requieren el apartado +18 activo.' },
      { status: 400 },
    );
  }

  const allowed: Record<string, unknown> = {};
  const stringFields: Array<keyof GuildConfig> = ['prefix', 'lang', 'level_channel_id', 'welcome_channel_id', 'welcome_message', 'goodbye_channel_id', 'goodbye_message', 'logs_channel_id', 'tickets_category_id', 'tickets_role_id', 'private_category_id', 'music_channel_id', 'mute_role_id', 'coin_emoji', 'coin_name', 'staff_role_id', 'level_message', 'starboard_channel_id', 'starboard_emoji', 'private_vc_hub_id', 'history_channel_id', 'afk_role_id', 'counting_channel_id', 'counting_style', 'counting_authenticity', 'suggestions_channel_id', 'nsfw_channel_id', 'nsfw_autopost_channel_id', 'confess_channel_id', 'trivia_channel_id'];
  const boolFields: Array<keyof GuildConfig> = ['leveling_enabled', 'tickets_enabled', 'private_channels', 'automod_enabled', 'nitro_repost_enabled', 'history_enabled', 'afk_prefix_enabled', 'marriage_enabled', 'marriage_allow_admin_pairs', 'counting_enabled', 'counting_allow_repeat', 'suggestions_enabled', 'polls_enabled', 'trivia_enabled', 'trivia_timed', 'autoposts_enabled', 'news_enabled', 'social_enabled', 'confess_allow_anonymous', 'confess_allow_public', 'nsfw_bot_preferences_enabled', 'nsfw_general_enabled', 'nsfw_enabled', 'nsfw_autopost_enabled', 'nsfw_commands_enabled'];

  for (const key of stringFields) {
    if (body[key] !== undefined) allowed[key] = body[key] === null ? null : String(body[key]);
  }
  for (const key of boolFields) {
    if (body[key] !== undefined) allowed[key] = Boolean(body[key]);
  }

  if (body.nsfw_content !== undefined) {
    const incoming = body.nsfw_content ?? {};
    const base = (current?.nsfwContent as GuildConfig['nsfw_content']) ?? DEFAULT_NSFW_CONTENT;
    const content = {
      default_gender: incoming.default_gender ?? base.default_gender ?? 'women',
      lgbt: { ...DEFAULT_NSFW_CONTENT.lgbt, ...(base.lgbt ?? {}) },
      fetishes: { ...DEFAULT_NSFW_CONTENT.fetishes, ...(base.fetishes ?? {}) },
    };
    for (const key of NSFW_LGBT_KEYS) {
      if (incoming.lgbt?.[key] !== undefined) content.lgbt[key] = Boolean(incoming.lgbt[key]);
    }
    for (const key of NSFW_FETISH_KEYS) {
      if (incoming.fetishes?.[key] !== undefined) content.fetishes[key] = Boolean(incoming.fetishes[key]);
    }
    allowed.nsfw_content = content;
  }

  if (!effectiveGate1) {
    allowed.nsfw_general_enabled = false;
    allowed.nsfw_enabled = false;
  }
  if (!effectiveGate2) allowed.nsfw_enabled = false;
  if (!effectiveGate3) {
    allowed.nsfw_commands_enabled = false;
    allowed.nsfw_autopost_enabled = false;
  }

  const effectiveNsfwChannel =
    body.nsfw_channel_id !== undefined ? body.nsfw_channel_id : current?.nsfwChannelId ?? null;
  const effectiveAutopostChannel =
    body.nsfw_autopost_channel_id !== undefined
      ? body.nsfw_autopost_channel_id
      : current?.nsfwAutopostChannelId ?? null;

  if (effectiveAutopost && !effectiveNsfwChannel && !effectiveAutopostChannel) {
    return NextResponse.json(
      { error: 'invalid_body', issue: 'Selecciona un canal NSFW para los autopics +18.' },
      { status: 400 },
    );
  }

  const needsChannelValidation =
    body.nsfw_channel_id !== undefined ||
    body.nsfw_autopost_channel_id !== undefined ||
    effectiveAutopost;
  if (needsChannelValidation) {
    const info = await fetchGuildInfo(guildId);
    if (info) {
      const invalid = [effectiveNsfwChannel, effectiveAutopostChannel].find((channelId) => {
        if (!channelId) return false;
        const channel = info.channels.find((entry) => entry.id === channelId);
        return !channel || !channel.nsfw;
      });
      if (invalid) {
        return NextResponse.json(
          { error: 'invalid_body', issue: 'El canal +18 debe existir y estar marcado como NSFW en Discord.' },
          { status: 400 },
        );
      }
    }
  }

  if (body.xp_rate !== undefined) {
    const rate = Number(body.xp_rate);
    if (rate >= 0.1 && rate <= 10) allowed.xp_rate = rate;
  }
  if (body.autoposts !== undefined) {
    allowed.autoposts = Array.isArray(body.autoposts) ? body.autoposts.slice(0, 20) : [];
  }
  if (body.news_channels !== undefined) {
    const channels = body.news_channels ?? {};
    const clean = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, 32) : null);
    allowed.news_channels = {
      anime: clean(channels.anime),
      games: clean(channels.games),
      steam: clean(channels.steam),
      tech: clean(channels.tech),
    };
  }
  if (body.social_feeds !== undefined) {
    const feeds = (body.social_feeds ?? []).map((feed) => ({
      id: String(feed.id).trim().slice(0, 40),
      platform: feed.platform,
      kind: feed.kind,
      account: String(feed.account).trim().slice(0, 300),
      channel_id: String(feed.channel_id).trim().slice(0, 32),
      ping_role_id: feed.ping_role_id ? String(feed.ping_role_id).trim().slice(0, 32) : null,
      message: String(feed.message).slice(0, 2000),
      enabled: Boolean(feed.enabled),
    })).slice(0, 1000);

    if (!isPremium) {
      if (feeds.length > 5) {
        return NextResponse.json(
          { error: 'social_limit_networks', issue: 'El plan gratuito permite hasta 5 redes sociales.' },
          { status: 400 },
        );
      }
      const platforms = new Set<string>();
      for (const feed of feeds) {
        if (platforms.has(feed.platform)) {
          return NextResponse.json(
            { error: 'social_limit_platform', issue: 'El plan gratuito permite una cuenta por red social.' },
            { status: 400 },
          );
        }
        platforms.add(feed.platform);
      }
    }

    allowed.social_feeds = feeds;
  }
  if (body.nsfw_autopost_minutes !== undefined) {
    const value = Number(body.nsfw_autopost_minutes);
    if (Number.isFinite(value) && value >= 15 && value <= 10080) allowed.nsfw_autopost_minutes = Math.round(value);
  }
  if (body.trivia_time_seconds !== undefined) {
    const value = Number(body.trivia_time_seconds);
    if (Number.isFinite(value) && value >= 10 && value <= 600) allowed.trivia_time_seconds = Math.round(value);
  }
  if (body.trivia_categories !== undefined) {
    allowed.trivia_categories = Array.isArray(body.trivia_categories)
      ? body.trivia_categories.map((value) => String(value).slice(0, 32)).slice(0, 24)
      : [];
  }
  if (body.trivia_rewards !== undefined) {
    allowed.trivia_rewards = Array.isArray(body.trivia_rewards) ? body.trivia_rewards.slice(0, 20) : [];
  }
  if (body.polls_max_active !== undefined) {
    const value = Number(body.polls_max_active);
    if (Number.isFinite(value) && value >= 0 && value <= 100) allowed.polls_max_active = Math.round(value);
  }
  if (body.polls_cooldown_minutes !== undefined) {
    const value = Number(body.polls_cooldown_minutes);
    if (Number.isFinite(value) && value >= 0 && value <= 1440) allowed.polls_cooldown_minutes = Math.round(value);
  }
  if (body.suggestions_max_active !== undefined) {
    const value = Number(body.suggestions_max_active);
    if (Number.isFinite(value) && value >= 0 && value <= 100) allowed.suggestions_max_active = Math.round(value);
  }
  if (body.suggestions_cooldown_minutes !== undefined) {
    const value = Number(body.suggestions_cooldown_minutes);
    if (Number.isFinite(value) && value >= 0 && value <= 1440) allowed.suggestions_cooldown_minutes = Math.round(value);
  }
  if (body.counting_start !== undefined) {
    const value = Number(body.counting_start);
    if (Number.isFinite(value) && value >= 0 && value <= 1000000) allowed.counting_start = Math.round(value);
  }
  if (body.command_global_cooldown !== undefined) {
    const value = Number(body.command_global_cooldown);
    if (value >= 0 && value <= 60) allowed.command_global_cooldown = value;
  }
  if (body.starboard_min !== undefined) {
    const value = Number(body.starboard_min);
    if (value >= 1 && value <= 100) allowed.starboard_min = value;
  }
  if (body.invite_points_per !== undefined) {
    const value = Number(body.invite_points_per);
    if (value >= 1 && value <= 100) allowed.invite_points_per = value;
  }
  if (body.invite_rewards !== undefined) {
    allowed.invite_rewards = Array.isArray(body.invite_rewards)
      ? body.invite_rewards
          .filter((row) => row && typeof row.role_id === 'string' && row.role_id.length > 0)
          .map((row) => ({ invites: Math.max(1, Math.round(Number(row.invites) || 1)), role_id: row.role_id }))
          .slice(0, 20)
      : [];
  }
  if (body.invite_channel_id !== undefined) {
    allowed.invite_channel_id = body.invite_channel_id === null ? null : String(body.invite_channel_id).slice(0, 32);
  }
  if (body.invite_message !== undefined) {
    allowed.invite_message = String(body.invite_message).slice(0, 2000);
  }
  for (const roleKey of ['owner_role_ids', 'admin_role_ids', 'mod_role_ids', 'bot_role_ids', 'marriage_excluded_role_ids', 'nitro_excluded_role_ids', 'suggestions_excluded_role_ids', 'polls_excluded_role_ids', 'trivia_excluded_role_ids', 'confess_excluded_role_ids'] as const) {
    if (body[roleKey] !== undefined) {
      allowed[roleKey] = Array.isArray(body[roleKey]) ? (body[roleKey] as string[]).slice(0, 20) : [];
    }
  }
  if (body.level_roles !== undefined) {
    allowed.level_roles = Array.isArray(body.level_roles) ? body.level_roles.slice(0, 50) : [];
  }
  if (body.automod_config !== undefined) {
    const am = body.automod_config;
    if (am && typeof am === 'object') {
      allowed.automod_config = {
        links: Boolean(am.links),
        invites: Boolean(am.invites),
        caps: Boolean(am.caps),
        spam: Boolean(am.spam),
        words: Array.isArray(am.words) ? am.words.map((w) => String(w).slice(0, 64)).slice(0, 100) : [],
      };
    }
  }
  if (body.drops !== undefined) {
    const d = body.drops;
    if (d && typeof d === 'object') {
      const clampInt = (n: unknown, min: number, max: number, fallback: number) => {
        const value = Number(n);
        return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
      };
      allowed.drops = {
        list: Array.isArray(d.list)
          ? d.list.slice(0, 20).map((entry) => ({
              id: String(entry.id).slice(0, 32),
              name: String(entry.name).slice(0, 50),
              enabled: Boolean(entry.enabled),
              channels: Array.isArray(entry.channels) ? entry.channels.map((c) => String(c)).slice(0, 20) : [],
              min: clampInt(entry.min, 1, 1_000_000, 50),
              max: clampInt(entry.max, 1, 1_000_000, 200),
              interval_min: clampInt(entry.interval_min, 5, 1440, 60),
              interval_max: clampInt(entry.interval_max, 5, 1440, 180),
              message: entry.message ? String(entry.message).slice(0, 300) : null,
              excluded_roles: Array.isArray(entry.excluded_roles) ? entry.excluded_roles.map((r) => String(r)).slice(0, 50) : [],
            }))
          : [],
      };
    }
  }
  if (body.alliance_config !== undefined) {
    allowed.alliance_config = body.alliance_config;
  }
  if (body.ticket_config !== undefined) {
    allowed.ticket_config = body.ticket_config;
  }
  if (body.autorole_ids !== undefined) {
    allowed.autorole_ids = Array.isArray(body.autorole_ids)
      ? body.autorole_ids
      : String(body.autorole_ids).split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (body.leaderboard_slug !== undefined) {
    allowed.leaderboard_slug = body.leaderboard_slug === null ? (null as never) : String(body.leaderboard_slug).toLowerCase();
  }
  if (body.leaderboard_enabled !== undefined) {
    allowed.leaderboard_enabled = Boolean(body.leaderboard_enabled);
  }

  // Slug del leaderboard único (case-insensitive) entre servidores.
  if (typeof allowed.leaderboard_slug === 'string') {
    const slug = allowed.leaderboard_slug;
    const existing = await db
      .select({ guildId: ciszubotSchema.guildConfigs.guildId })
      .from(ciszubotSchema.guildConfigs)
      .where(sql`lower(${ciszubotSchema.guildConfigs.leaderboardSlug}) = ${slug}`)
      .limit(1);
    if (existing[0] && existing[0].guildId !== guildId) {
      return NextResponse.json({ error: 'slug_taken' }, { status: 409 });
    }
  }

  // Toggles de funciones por servidor (solo slugs conocidos).
  const featurePatch: Record<string, boolean> = {};
  if (body.features) {
    for (const [slug, enabled] of Object.entries(body.features)) {
      if ((FEATURE_SLUGS as readonly string[]).includes(slug) && typeof enabled === 'boolean') {
        featurePatch[slug] = enabled;
      }
    }
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
    leaderboard_enabled: 'leaderboardEnabled',
    leaderboard_slug: 'leaderboardSlug',
    coin_emoji: 'coinEmoji',
    coin_name: 'coinName',
    staff_role_id: 'staffRoleId',
    level_message: 'levelMessage',
    level_roles: 'levelRoles',
    automod_config: 'automodConfig',
    drops: 'drops',
    starboard_channel_id: 'starboardChannelId',
    starboard_emoji: 'starboardEmoji',
    starboard_min: 'starboardMin',
    invite_points_per: 'invitePointsPer',
    invite_rewards: 'inviteRewards',
    invite_channel_id: 'inviteChannelId',
    invite_message: 'inviteMessage',
    nitro_repost_enabled: 'nitroRepostEnabled',
    private_vc_hub_id: 'privateVcHubId',
    history_enabled: 'historyEnabled',
    history_channel_id: 'historyChannelId',
    afk_role_id: 'afkRoleId',
    afk_prefix_enabled: 'afkPrefixEnabled',
    afk_auto_minutes: 'afkAutoMinutes',
    marriage_enabled: 'marriageEnabled',
    marriage_allow_admin_pairs: 'marriageAllowAdminPairs',
    command_global_cooldown: 'commandGlobalCooldown',
    counting_enabled: 'countingEnabled',
    counting_channel_id: 'countingChannelId',
    counting_start: 'countingStart',
    counting_style: 'countingStyle',
    counting_allow_repeat: 'countingAllowRepeat',
    counting_authenticity: 'countingAuthenticity',
    suggestions_enabled: 'suggestionsEnabled',
    suggestions_channel_id: 'suggestionsChannelId',
    suggestions_excluded_role_ids: 'suggestionsExcludedRoleIds',
    suggestions_max_active: 'suggestionsMaxActive',
    suggestions_cooldown_minutes: 'suggestionsCooldownMinutes',
    polls_enabled: 'pollsEnabled',
    polls_excluded_role_ids: 'pollsExcludedRoleIds',
    polls_max_active: 'pollsMaxActive',
    polls_cooldown_minutes: 'pollsCooldownMinutes',
    trivia_enabled: 'triviaEnabled',
    trivia_excluded_role_ids: 'triviaExcludedRoleIds',
    trivia_timed: 'triviaTimed',
    trivia_time_seconds: 'triviaTimeSeconds',
    trivia_difficulty: 'triviaDifficulty',
    trivia_categories: 'triviaCategories',
    trivia_channel_id: 'triviaChannelId',
    trivia_rewards: 'triviaRewards',
    autoposts_enabled: 'autopostsEnabled',
    autoposts: 'autoposts',
    news_enabled: 'newsEnabled',
    news_channels: 'newsChannels',
    social_enabled: 'socialEnabled',
    social_feeds: 'socialFeeds',
    nsfw_bot_preferences_enabled: 'nsfwBotPreferencesEnabled',
    nsfw_general_enabled: 'nsfwGeneralEnabled',
    nsfw_enabled: 'nsfwEnabled',
    nsfw_channel_id: 'nsfwChannelId',
    nsfw_autopost_channel_id: 'nsfwAutopostChannelId',
    nsfw_autopost_enabled: 'nsfwAutopostEnabled',
    nsfw_autopost_minutes: 'nsfwAutopostMinutes',
    nsfw_commands_enabled: 'nsfwCommandsEnabled',
    nsfw_content: 'nsfwContent',
    confess_channel_id: 'confessChannelId',
    confess_excluded_role_ids: 'confessExcludedRoleIds',
    confess_allow_anonymous: 'confessAllowAnonymous',
    confess_allow_public: 'confessAllowPublic',
    marriage_excluded_role_ids: 'marriageExcludedRoleIds',
    nitro_repost_mode: 'nitroRepostMode',
    nitro_excluded_role_ids: 'nitroExcludedRoleIds',
    owner_role_ids: 'ownerRoleIds',
    admin_role_ids: 'adminRoleIds',
    mod_role_ids: 'modRoleIds',
    bot_role_ids: 'botRoleIds',
    alliance_config: 'allianceConfig',
    ticket_config: 'ticketConfig',
  };
  const values: Record<string, unknown> = { guildId };
  for (const [key, value] of Object.entries(allowed)) {
    const camel = snakeToCamel[key] ?? key;
    values[camel] = key === 'autorole_ids' && Array.isArray(value) ? value : value;
  }
  values.updatedAt = new Date();

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

  if (Object.keys(featurePatch).length > 0) {
    const guildFeatureFlags = ciszubotSchema.guildFeatureFlags;
    for (const [feature, enabled] of Object.entries(featurePatch)) {
      await db
        .insert(guildFeatureFlags)
        .values({ guildId, feature, enabled, updatedAt: new Date(), updatedBy: userId })
        .onConflictDoUpdate({
          target: [guildFeatureFlags.guildId, guildFeatureFlags.feature],
          set: { enabled, updatedAt: new Date(), updatedBy: userId },
        });
    }
  }

  const userRows = await db
    .select({ username: ciszubotSchema.discordUsers.username })
    .from(ciszubotSchema.discordUsers)
    .where(eq(ciszubotSchema.discordUsers.id, userId))
    .limit(1);

  // Historial: respeta el toggle del servidor; si hay canal, el bot publica
  // el resumen del cambio allí (cola de acciones, directsay).
  const freshRows = await db
    .select({
      historyEnabled: ciszubotSchema.guildConfigs.historyEnabled,
      historyChannelId: ciszubotSchema.guildConfigs.historyChannelId,
    })
    .from(ciszubotSchema.guildConfigs)
    .where(eq(ciszubotSchema.guildConfigs.guildId, guildId))
    .limit(1);
  const hist = freshRows[0];
  const historyOn = hist?.historyEnabled !== false;

  if (historyOn) {
    await logAudit({
      event: 'config_update',
      actorId: userId,
      actorName: userRows[0]?.username ?? null,
      target: guildId,
      ip,
      detail: { fields: Object.keys(allowed), features: featurePatch },
    });
  }

  if (historyOn && hist?.historyChannelId) {
    const changed = [...Object.keys(allowed), ...Object.keys(featurePatch).map((f) => `feature:${f}`)];
    await db
      .insert(ciszubotSchema.botActions)
      .values({
        guildId,
        type: 'directsay',
        channelId: hist.historyChannelId,
        content: `⚙️ Cambio de configuración en **${guild.name}** por <@${userId}>: ${changed.join(', ').slice(0, 300)}`,
        createdBy: userId,
        source: 'history',
      })
      .catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}
