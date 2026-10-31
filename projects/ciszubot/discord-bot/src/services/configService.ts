import { db, ciszubotSchema, eq, sql } from '@ciszunetwork/db';
import { logger } from './logger';

export interface AutomodConfig {
  links: boolean;
  invites: boolean;
  caps: boolean;
  spam: boolean;
  flood: boolean;
  words: string[];
  cooldown_seconds: number;
  excluded_role_ids: string[];
  excluded_channel_ids: string[];
}

export interface DropEntry {
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
}

export interface DropsConfig {
  /** Lista de drops configurados (free: hasta 3 · premium: ilimitados). */
  list: DropEntry[];
}

export interface LevelRole {
  level: number;
  role_id: string;
}

export interface InviteReward {
  invites: number;
  role_id: string;
}

export interface AllianceEmbedConfig {
  title: string;
  description: string;
  color: string;
}

export interface AllianceReward {
  points: number;
  role_id?: string;
  money?: number;
  message?: string;
}

export interface AllianceConfig {
  enabled: boolean;
  channel_id: string | null;
  role_id: string | null;
  notify_role_id: string | null;
  cooldown_hours: number;
  one_per_server: boolean;
  allow_nsfw: boolean;
  blocked_words: string[];
  blocked_servers: string[];
  sanction: 'none' | 'mute' | 'kick' | 'ban';
  sanction_minutes: number;
  rewards: AllianceReward[];
  embed_success: AllianceEmbedConfig;
  embed_error: AllianceEmbedConfig;
  error_delete_after: number;
}

export interface TicketCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  discord_category_id: string | null;
  role_ids: string[];
  grant_role_id: string | null;
  form: string[];
  welcome: string;
  color: string;
}

export interface TicketConfig {
  enabled: boolean;
  panel_channel_id: string | null;
  log_channel_id: string | null;
  auto_delete_hours: number;
  categories: TicketCategory[];
}

export interface NewsChannels {
  anime: string | null;
  games: string | null;
  steam: string | null;
  tech: string | null;
}

export const SOCIAL_PLATFORMS = [
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

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_FEED_KINDS = ['profile', 'page', 'user', 'group', 'channel', 'subreddit', 'feed'] as const;

export type SocialFeedKind = (typeof SOCIAL_FEED_KINDS)[number];

export interface SocialFeed {
  id: string;
  platform: SocialPlatform;
  kind: SocialFeedKind;
  account: string;
  channel_id: string;
  ping_role_id: string | null;
  message: string;
  enabled: boolean;
}

function asSocialFeeds(value: unknown): SocialFeed[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((raw, index): SocialFeed[] => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
      const row = raw as Record<string, unknown>;
      const platform = SOCIAL_PLATFORMS.includes(row.platform as SocialPlatform)
        ? (row.platform as SocialPlatform)
        : 'other';
      const kind = SOCIAL_FEED_KINDS.includes(row.kind as SocialFeedKind)
        ? (row.kind as SocialFeedKind)
        : platform === 'other'
          ? 'feed'
          : 'profile';
      const account = typeof row.account === 'string' ? row.account.trim().slice(0, 300) : '';
      const channelId = typeof row.channel_id === 'string' ? row.channel_id.trim().slice(0, 32) : '';
      const id = typeof row.id === 'string' && row.id.trim() ? row.id.trim().slice(0, 40) : `${platform}-${index}`;
      const pingRoleId = typeof row.ping_role_id === 'string' && row.ping_role_id.trim()
        ? row.ping_role_id.trim().slice(0, 32)
        : null;
      const message = typeof row.message === 'string' ? row.message.slice(0, 2000) : '';
      return [{ id, platform, kind, account, channel_id: channelId, ping_role_id: pingRoleId, message, enabled: row.enabled !== false }];
    })
    .slice(0, 100);
}

export type NsfwGender = 'women' | 'men' | 'mixed';
export type NsfwLgbt = 'gay' | 'lesbian' | 'trans' | 'bisexual' | 'pansexual' | 'nonbinary';
export type NsfwFetish =
  | 'femboy'
  | 'tomboy'
  | 'blonde'
  | 'ebony'
  | 'latina'
  | 'milf'
  | 'feet'
  | 'thighs'
  | 'belly';

export interface NsfwContentPreferences {
  default_gender: NsfwGender;
  lgbt: Record<NsfwLgbt, boolean>;
  fetishes: Record<NsfwFetish, boolean>;
}

export const DEFAULT_NSFW_CONTENT: NsfwContentPreferences = {
  default_gender: 'women',
  lgbt: {
    gay: true,
    lesbian: true,
    trans: true,
    bisexual: true,
    pansexual: true,
    nonbinary: true,
  },
  fetishes: {
    femboy: true,
    tomboy: true,
    blonde: true,
    ebony: true,
    latina: true,
    milf: true,
    feet: true,
    thighs: true,
    belly: true,
  },
};

export interface GuildConfig {
  guild_id: string;
  prefix: string;
  lang: string;
  premium_server_enabled: boolean;
  leveling_enabled: boolean;
  level_channel_id: string | null;
  xp_rate: number;
  welcome_channel_id: string | null;
  welcome_message: string;
  goodbye_channel_id: string | null;
  goodbye_message: string;
  autorole_ids: string[];
  logs_channel_id: string | null;
  counters: Array<{ type: string; channel_id: string }>;
  tickets_enabled: boolean;
  tickets_category_id: string | null;
  tickets_role_id: string | null;
  private_channels: boolean;
  private_category_id: string | null;
  music_channel_id: string | null;
  automod_enabled: boolean;
  mute_role_id: string | null;
  coin_emoji: string;
  coin_name: string;
  staff_role_id: string | null;
  level_message: string;
  level_roles: LevelRole[];
  automod_config: AutomodConfig;
  command_cooldowns: Record<string, number>;
  drops: DropsConfig;
  starboard_channel_id: string | null;
  starboard_emoji: string;
  starboard_min: number;
  invite_points_per: number;
  invite_rewards: InviteReward[];
  invite_channel_id: string | null;
  invite_message: string;
  private_vc_hub_id: string | null;
  secret_user_ids: string[];
  nitro_repost_enabled: boolean;
  history_enabled: boolean;
  history_channel_id: string | null;
  afk_role_id: string | null;
  afk_prefix_enabled: boolean;
  afk_auto_minutes: number;
  marriage_enabled: boolean;
  marriage_allow_admin_pairs: boolean;
  command_global_cooldown: number;
  counting_enabled: boolean;
  counting_channel_id: string | null;
  counting_start: number;
  counting_style: string;
  counting_allow_repeat: boolean;
  counting_authenticity: string;
  suggestions_enabled: boolean;
  suggestions_channel_id: string | null;
  suggestions_excluded_role_ids: string[];
  suggestions_max_active: number;
  suggestions_cooldown_minutes: number;
  polls_enabled: boolean;
  polls_excluded_role_ids: string[];
  polls_max_active: number;
  polls_cooldown_minutes: number;
  poll_style: string;
  trivia_enabled: boolean;
  trivia_excluded_role_ids: string[];
  trivia_timed: boolean;
  trivia_time_seconds: number;
  trivia_difficulty: string;
  trivia_categories: string[];
  trivia_channel_id: string | null;
  trivia_rewards: Array<{ points: number; role_id: string }>;
  autoposts_enabled: boolean;
  autoposts: Array<{ id: string; type: string; channel_id: string; interval_minutes: number; text?: string; url?: string; nsfw?: boolean }>;
  news_enabled: boolean;
  news_channels: NewsChannels;
  news_rss_url: string | null;
  news_rss_channel_id: string | null;
  social_enabled: boolean;
  social_feeds: SocialFeed[];
  nsfw_bot_preferences_enabled: boolean;
  nsfw_general_enabled: boolean;
  nsfw_enabled: boolean;
  nsfw_channel_id: string | null;
  nsfw_autopost_channel_id: string | null;
  nsfw_autopost_enabled: boolean;
  nsfw_autopost_minutes: number;
  nsfw_commands_enabled: boolean;
  nsfw_content: NsfwContentPreferences;
  confess_channel_id: string | null;
  confess_excluded_role_ids: string[];
  confess_allow_anonymous: boolean;
  confess_allow_public: boolean;
  marriage_excluded_role_ids: string[];
  nitro_repost_mode: 'auto' | 'manual';
  nitro_excluded_role_ids: string[];
  owner_role_ids: string[];
  admin_role_ids: string[];
  mod_role_ids: string[];
  bot_role_ids: string[];
  alliance_config: AllianceConfig;
  ticket_config: TicketConfig;
}

const DEFAULT_AUTOMOD: AutomodConfig = { links: false, invites: false, caps: false, spam: false, flood: false, words: [], cooldown_seconds: 0, excluded_role_ids: [], excluded_channel_ids: [] };
const DEFAULT_ALLIANCE: AllianceConfig = {
  enabled: false,
  channel_id: null,
  role_id: null,
  notify_role_id: null,
  cooldown_hours: 24,
  one_per_server: true,
  allow_nsfw: false,
  blocked_words: [],
  blocked_servers: [],
  sanction: 'none',
  sanction_minutes: 1440,
  rewards: [],
  embed_success: {
    title: '🤝 Nueva alianza',
    description: '{user} publicó la alianza con **{server}** ({invite})',
    color: '#22c55e',
  },
  embed_error: { title: '❌ Alianza no válida', description: '{reason}', color: '#ef4444' },
  error_delete_after: 15,
};
const DEFAULT_TICKETS: TicketConfig = { enabled: false, panel_channel_id: null, log_channel_id: null, auto_delete_hours: 24, categories: [] };
const DEFAULT_DROPS: DropsConfig = { list: [] };

const DEFAULTS: Omit<GuildConfig, 'guild_id'> = {
  prefix: 'cz!',
  lang: 'es',
  premium_server_enabled: false,
  leveling_enabled: false,
  level_channel_id: null,
  xp_rate: 1,
  welcome_channel_id: null,
  welcome_message: 'Bienvenido/a {user} a {guild}!',
  goodbye_channel_id: null,
  goodbye_message: 'Adiós {user}, que te vaya bien!',
  autorole_ids: [],
  logs_channel_id: null,
  counters: [],
  tickets_enabled: false,
  tickets_category_id: null,
  tickets_role_id: null,
  private_channels: false,
  private_category_id: null,
  music_channel_id: null,
  automod_enabled: false,
  mute_role_id: null,
  coin_emoji: '🪙',
  coin_name: 'monedas',
  staff_role_id: null,
  level_message: '🎉 ¡{user} subió al nivel {level} en {guild}!',
  level_roles: [],
  automod_config: DEFAULT_AUTOMOD,
  command_cooldowns: {},
  drops: DEFAULT_DROPS,
  starboard_channel_id: null,
  starboard_emoji: '⭐',
  starboard_min: 3,
  invite_points_per: 1,
  invite_rewards: [],
  invite_channel_id: null,
  invite_message: '🎉 {user} se unió invitado por {inviter}. Total: **{count}** invitaciones.',
  private_vc_hub_id: null,
  secret_user_ids: [],
  nitro_repost_enabled: false,
  history_enabled: true,
  history_channel_id: null,
  afk_role_id: null,
  afk_prefix_enabled: false,
  afk_auto_minutes: 0,
  marriage_enabled: true,
  marriage_allow_admin_pairs: true,
  command_global_cooldown: 3,
  counting_enabled: false,
  counting_channel_id: null,
  counting_start: 0,
  counting_style: 'traditional',
  counting_allow_repeat: false,
  counting_authenticity: 'dependent',
  suggestions_enabled: false,
  suggestions_channel_id: null,
  suggestions_excluded_role_ids: [],
  suggestions_max_active: 0,
  suggestions_cooldown_minutes: 0,
  polls_enabled: true,
  polls_excluded_role_ids: [],
  polls_max_active: 0,
  polls_cooldown_minutes: 0,
  poll_style: 'classic',
  trivia_enabled: false,
  trivia_excluded_role_ids: [],
  trivia_timed: true,
  trivia_time_seconds: 60,
  trivia_difficulty: 'mixed',
  trivia_categories: [],
  trivia_channel_id: null,
  trivia_rewards: [],
  autoposts_enabled: false,
  autoposts: [],
  news_enabled: false,
  news_channels: { anime: null, games: null, steam: null, tech: null },
  news_rss_url: null,
  news_rss_channel_id: null,
  social_enabled: false,
  social_feeds: [],
  nsfw_bot_preferences_enabled: false,
  nsfw_general_enabled: false,
  nsfw_enabled: false,
  nsfw_channel_id: null,
  nsfw_autopost_channel_id: null,
  nsfw_autopost_enabled: false,
  nsfw_autopost_minutes: 60,
  nsfw_commands_enabled: false,
  nsfw_content: DEFAULT_NSFW_CONTENT,
  confess_channel_id: null,
  confess_excluded_role_ids: [],
  confess_allow_anonymous: true,
  confess_allow_public: true,
  marriage_excluded_role_ids: [],
  nitro_repost_mode: 'auto',
  nitro_excluded_role_ids: [],
  owner_role_ids: [],
  admin_role_ids: [],
  mod_role_ids: [],
  bot_role_ids: [],
  alliance_config: DEFAULT_ALLIANCE,
  ticket_config: DEFAULT_TICKETS,
};

const cache = new Map<string, GuildConfig>();

/**
 * TTL de la caché de config: el dashboard escribe en la DB desde fuera del
 * proceso, así que sin caducidad el bot NO veía nunca los cambios (bug real:
 * cambiar la moneda en la web no se reflejaba en Discord hasta reiniciar).
 */
const CACHE_TTL_MS = 1_000;
const cacheAt = new Map<string, number>();

function cacheFresh(guildId: string): GuildConfig | null {
  const cfg = cache.get(guildId);
  if (!cfg) return null;
  const at = cacheAt.get(guildId) ?? 0;
  if (Date.now() - at >= CACHE_TTL_MS) return null;
  return cfg;
}

function cacheSet(guildId: string, cfg: GuildConfig): void {
  cache.set(guildId, cfg);
  cacheAt.set(guildId, Date.now());
}

function asObject<T>(value: unknown, fallback: T): T {
  if (value && typeof value === 'object' && !Array.isArray(value)) return { ...fallback, ...(value as object) } as T;
  return fallback;
}

function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function normalizeNsfwContent(value: unknown): NsfwContentPreferences {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const rawLgbt = raw.lgbt && typeof raw.lgbt === 'object' ? (raw.lgbt as Record<string, unknown>) : {};
  const rawFetishes = raw.fetishes && typeof raw.fetishes === 'object' ? (raw.fetishes as Record<string, unknown>) : {};
  const gender: NsfwGender =
    raw.default_gender === 'men' || raw.default_gender === 'mixed' ? raw.default_gender : 'women';

  const lgbt = {} as Record<NsfwLgbt, boolean>;
  for (const key of Object.keys(DEFAULT_NSFW_CONTENT.lgbt) as NsfwLgbt[]) {
    lgbt[key] = typeof rawLgbt[key] === 'boolean' ? (rawLgbt[key] as boolean) : DEFAULT_NSFW_CONTENT.lgbt[key];
  }

  const fetishes = {} as Record<NsfwFetish, boolean>;
  for (const key of Object.keys(DEFAULT_NSFW_CONTENT.fetishes) as NsfwFetish[]) {
    fetishes[key] =
      typeof rawFetishes[key] === 'boolean' ? (rawFetishes[key] as boolean) : DEFAULT_NSFW_CONTENT.fetishes[key];
  }

  return { default_gender: gender, lgbt, fetishes };
}

export function isNsfwUnlocked(
  cfg: Pick<GuildConfig, 'nsfw_bot_preferences_enabled' | 'nsfw_general_enabled' | 'nsfw_enabled'>,
): boolean {
  return cfg.nsfw_bot_preferences_enabled && cfg.nsfw_general_enabled && cfg.nsfw_enabled;
}

export async function getGuildConfig(guildId: string): Promise<GuildConfig> {
  const cached = cacheFresh(guildId);
  if (cached) return cached;

  try {
    const guildConfigs = ciszubotSchema.guildConfigs;
    const rows = await db.select().from(guildConfigs).where(eq(guildConfigs.guildId, guildId)).limit(1);
    const data = rows[0];
    if (data) {
      const nsfwBotPreferencesEnabled = data.nsfwBotPreferencesEnabled ?? DEFAULTS.nsfw_bot_preferences_enabled;
      const nsfwGeneralEnabled = nsfwBotPreferencesEnabled && (data.nsfwGeneralEnabled ?? DEFAULTS.nsfw_general_enabled);
      const nsfwEnabled = nsfwGeneralEnabled && (data.nsfwEnabled ?? DEFAULTS.nsfw_enabled);
      const cfg: GuildConfig = {
        guild_id: guildId,
        prefix: data.prefix ?? DEFAULTS.prefix,
        lang: data.lang ?? DEFAULTS.lang,
        premium_server_enabled: data.premiumServerEnabled ?? DEFAULTS.premium_server_enabled,
        leveling_enabled: data.levelingEnabled ?? DEFAULTS.leveling_enabled,
        level_channel_id: data.levelChannelId ?? DEFAULTS.level_channel_id,
        xp_rate: data.xpRate ?? DEFAULTS.xp_rate,
        welcome_channel_id: data.welcomeChannelId ?? DEFAULTS.welcome_channel_id,
        welcome_message: data.welcomeMessage ?? DEFAULTS.welcome_message,
        goodbye_channel_id: data.goodbyeChannelId ?? DEFAULTS.goodbye_channel_id,
        goodbye_message: data.goodbyeMessage ?? DEFAULTS.goodbye_message,
        autorole_ids: asArray(data.autoroleIds, DEFAULTS.autorole_ids),
        logs_channel_id: data.logsChannelId ?? DEFAULTS.logs_channel_id,
        counters: asArray(data.counters, DEFAULTS.counters),
        tickets_enabled: data.ticketsEnabled ?? DEFAULTS.tickets_enabled,
        tickets_category_id: data.ticketsCategoryId ?? DEFAULTS.tickets_category_id,
        tickets_role_id: data.ticketsRoleId ?? DEFAULTS.tickets_role_id,
        private_channels: data.privateChannels ?? DEFAULTS.private_channels,
        private_category_id: data.privateCategoryId ?? DEFAULTS.private_category_id,
        music_channel_id: data.musicChannelId ?? DEFAULTS.music_channel_id,
        automod_enabled: data.automodEnabled ?? DEFAULTS.automod_enabled,
        mute_role_id: data.muteRoleId ?? DEFAULTS.mute_role_id,
        coin_emoji: data.coinEmoji ?? DEFAULTS.coin_emoji,
        coin_name: data.coinName ?? DEFAULTS.coin_name,
        staff_role_id: data.staffRoleId ?? DEFAULTS.staff_role_id,
        level_message: data.levelMessage ?? DEFAULTS.level_message,
        level_roles: asArray(data.levelRoles, DEFAULTS.level_roles),
        automod_config: asObject(data.automodConfig, DEFAULT_AUTOMOD),
        command_cooldowns: asObject(data.commandCooldowns, DEFAULTS.command_cooldowns),
        drops: (() => {
          const raw = asObject(data.drops, DEFAULT_DROPS) as DropsConfig & { enabled?: boolean };
          return { list: Array.isArray(raw.list) ? raw.list : [] };
        })(),
        starboard_channel_id: data.starboardChannelId ?? DEFAULTS.starboard_channel_id,
        starboard_emoji: data.starboardEmoji ?? DEFAULTS.starboard_emoji,
        starboard_min: data.starboardMin ?? DEFAULTS.starboard_min,
        invite_points_per: data.invitePointsPer ?? DEFAULTS.invite_points_per,
        invite_rewards: asArray(data.inviteRewards, DEFAULTS.invite_rewards),
        invite_channel_id: data.inviteChannelId ?? DEFAULTS.invite_channel_id,
        invite_message: data.inviteMessage ?? DEFAULTS.invite_message,
        private_vc_hub_id: data.privateVcHubId ?? DEFAULTS.private_vc_hub_id,
        secret_user_ids: asArray(data.secretUserIds, DEFAULTS.secret_user_ids),
        nitro_repost_enabled: data.nitroRepostEnabled ?? DEFAULTS.nitro_repost_enabled,
        afk_role_id: data.afkRoleId ?? DEFAULTS.afk_role_id,
        afk_prefix_enabled: data.afkPrefixEnabled ?? DEFAULTS.afk_prefix_enabled,
        afk_auto_minutes: data.afkAutoMinutes ?? DEFAULTS.afk_auto_minutes,
        marriage_enabled: data.marriageEnabled ?? DEFAULTS.marriage_enabled,
        marriage_allow_admin_pairs: data.marriageAllowAdminPairs ?? DEFAULTS.marriage_allow_admin_pairs,
        command_global_cooldown: data.commandGlobalCooldown ?? DEFAULTS.command_global_cooldown,
        counting_enabled: data.countingEnabled ?? DEFAULTS.counting_enabled,
        counting_channel_id: data.countingChannelId ?? DEFAULTS.counting_channel_id,
        counting_start: data.countingStart ?? DEFAULTS.counting_start,
        counting_style: data.countingStyle ?? DEFAULTS.counting_style,
        counting_allow_repeat: data.countingAllowRepeat ?? DEFAULTS.counting_allow_repeat,
        counting_authenticity: data.countingAuthenticity ?? DEFAULTS.counting_authenticity,
        suggestions_enabled: data.suggestionsEnabled ?? DEFAULTS.suggestions_enabled,
        suggestions_channel_id: data.suggestionsChannelId ?? DEFAULTS.suggestions_channel_id,
        suggestions_excluded_role_ids: asArray(data.suggestionsExcludedRoleIds, DEFAULTS.suggestions_excluded_role_ids),
        suggestions_max_active: data.suggestionsMaxActive ?? DEFAULTS.suggestions_max_active,
        suggestions_cooldown_minutes: data.suggestionsCooldownMinutes ?? DEFAULTS.suggestions_cooldown_minutes,
        polls_enabled: data.pollsEnabled ?? DEFAULTS.polls_enabled,
        polls_excluded_role_ids: asArray(data.pollsExcludedRoleIds, DEFAULTS.polls_excluded_role_ids),
        polls_max_active: data.pollsMaxActive ?? DEFAULTS.polls_max_active,
        polls_cooldown_minutes: data.pollsCooldownMinutes ?? DEFAULTS.polls_cooldown_minutes,
        poll_style: data.pollStyle ?? DEFAULTS.poll_style,
        trivia_enabled: data.triviaEnabled ?? DEFAULTS.trivia_enabled,
        trivia_excluded_role_ids: asArray(data.triviaExcludedRoleIds, DEFAULTS.trivia_excluded_role_ids),
        trivia_timed: data.triviaTimed ?? DEFAULTS.trivia_timed,
        trivia_time_seconds: data.triviaTimeSeconds ?? DEFAULTS.trivia_time_seconds,
        trivia_difficulty: data.triviaDifficulty ?? DEFAULTS.trivia_difficulty,
        trivia_categories: asArray(data.triviaCategories, DEFAULTS.trivia_categories),
        trivia_channel_id: data.triviaChannelId ?? DEFAULTS.trivia_channel_id,
        trivia_rewards: (data.triviaRewards as Array<{ points: number; role_id: string }>) ?? DEFAULTS.trivia_rewards,
        autoposts_enabled: data.autopostsEnabled ?? DEFAULTS.autoposts_enabled,
        autoposts: asArray(data.autoposts, DEFAULTS.autoposts) as typeof DEFAULTS.autoposts,
        news_enabled: data.newsEnabled ?? DEFAULTS.news_enabled,
        news_channels: asObject(data.newsChannels, DEFAULTS.news_channels) as NewsChannels,
        news_rss_url: data.newsRssUrl ?? DEFAULTS.news_rss_url,
        news_rss_channel_id: data.newsRssChannelId ?? DEFAULTS.news_rss_channel_id,
        social_enabled: data.socialEnabled ?? DEFAULTS.social_enabled,
        social_feeds: asSocialFeeds(data.socialFeeds),
        nsfw_bot_preferences_enabled: nsfwBotPreferencesEnabled,
        nsfw_general_enabled: nsfwGeneralEnabled,
        nsfw_enabled: nsfwEnabled,
        nsfw_channel_id: data.nsfwChannelId ?? DEFAULTS.nsfw_channel_id,
        nsfw_autopost_channel_id: data.nsfwAutopostChannelId ?? DEFAULTS.nsfw_autopost_channel_id,
        nsfw_autopost_enabled: nsfwEnabled && (data.nsfwAutopostEnabled ?? DEFAULTS.nsfw_autopost_enabled),
        nsfw_autopost_minutes: data.nsfwAutopostMinutes ?? DEFAULTS.nsfw_autopost_minutes,
        nsfw_commands_enabled: nsfwEnabled && (data.nsfwCommandsEnabled ?? DEFAULTS.nsfw_commands_enabled),
        nsfw_content: normalizeNsfwContent(data.nsfwContent),
        confess_channel_id: data.confessChannelId ?? DEFAULTS.confess_channel_id,
        confess_excluded_role_ids: asArray(data.confessExcludedRoleIds, DEFAULTS.confess_excluded_role_ids),
        confess_allow_anonymous: data.confessAllowAnonymous ?? DEFAULTS.confess_allow_anonymous,
        confess_allow_public: data.confessAllowPublic ?? DEFAULTS.confess_allow_public,
        marriage_excluded_role_ids: asArray(data.marriageExcludedRoleIds, DEFAULTS.marriage_excluded_role_ids),
        nitro_repost_mode: (data.nitroRepostMode as 'auto' | 'manual') ?? DEFAULTS.nitro_repost_mode,
        nitro_excluded_role_ids: asArray(data.nitroExcludedRoleIds, DEFAULTS.nitro_excluded_role_ids),
        owner_role_ids: asArray(data.ownerRoleIds, DEFAULTS.owner_role_ids),
        admin_role_ids: asArray(data.adminRoleIds, DEFAULTS.admin_role_ids),
        mod_role_ids: asArray(data.modRoleIds, DEFAULTS.mod_role_ids),
        bot_role_ids: asArray(data.botRoleIds, DEFAULTS.bot_role_ids),
        history_enabled: data.historyEnabled ?? DEFAULTS.history_enabled,
        history_channel_id: data.historyChannelId ?? DEFAULTS.history_channel_id,
        alliance_config: asObject(data.allianceConfig, DEFAULT_ALLIANCE),
        ticket_config: asObject(data.ticketConfig, DEFAULT_TICKETS),
      };
      cacheSet(guildId, cfg);
      return cfg;
    }
  } catch (error) {
    logger.warn('No se pudo leer la config del guild:', error);
  }
  const cfg: GuildConfig = { ...DEFAULTS, guild_id: guildId };
  cacheSet(guildId, cfg);
  return cfg;
}

export async function updateGuildConfig(
  guildId: string,
  patch: Partial<Omit<GuildConfig, 'guild_id'>>
): Promise<GuildConfig> {
  const cfg = await getGuildConfig(guildId);
  const merged: GuildConfig = { ...cfg, ...patch };
  if (!merged.nsfw_bot_preferences_enabled) merged.nsfw_general_enabled = false;
  if (!merged.nsfw_general_enabled) merged.nsfw_enabled = false;
  if (!merged.nsfw_enabled) {
    merged.nsfw_commands_enabled = false;
    merged.nsfw_autopost_enabled = false;
  }
  merged.nsfw_content = normalizeNsfwContent(merged.nsfw_content);
  cacheSet(guildId, merged);
  const values = {
    guildId,
    prefix: merged.prefix,
    lang: merged.lang,
    premiumServerEnabled: merged.premium_server_enabled,
    levelingEnabled: merged.leveling_enabled,
    levelChannelId: merged.level_channel_id,
    xpRate: merged.xp_rate,
    welcomeChannelId: merged.welcome_channel_id,
    welcomeMessage: merged.welcome_message,
    goodbyeChannelId: merged.goodbye_channel_id,
    goodbyeMessage: merged.goodbye_message,
    autoroleIds: merged.autorole_ids,
    logsChannelId: merged.logs_channel_id,
    counters: merged.counters,
    ticketsEnabled: merged.tickets_enabled,
    ticketsCategoryId: merged.tickets_category_id,
    ticketsRoleId: merged.tickets_role_id,
    privateChannels: merged.private_channels,
    privateCategoryId: merged.private_category_id,
    musicChannelId: merged.music_channel_id,
    automodEnabled: merged.automod_enabled,
    muteRoleId: merged.mute_role_id,
    coinEmoji: merged.coin_emoji,
    coinName: merged.coin_name,
    staffRoleId: merged.staff_role_id,
    levelMessage: merged.level_message,
    levelRoles: merged.level_roles,
    automodConfig: merged.automod_config,
    commandCooldowns: merged.command_cooldowns,
    drops: merged.drops,
    starboardChannelId: merged.starboard_channel_id,
    starboardEmoji: merged.starboard_emoji,
    starboardMin: merged.starboard_min,
    invitePointsPer: merged.invite_points_per,
    inviteRewards: merged.invite_rewards,
    inviteChannelId: merged.invite_channel_id,
    inviteMessage: merged.invite_message,
    privateVcHubId: merged.private_vc_hub_id,
    secretUserIds: merged.secret_user_ids,
    nitroRepostEnabled: merged.nitro_repost_enabled,
    afkRoleId: merged.afk_role_id,
    afkPrefixEnabled: merged.afk_prefix_enabled,
    afkAutoMinutes: merged.afk_auto_minutes,
    marriageEnabled: merged.marriage_enabled,
    marriageAllowAdminPairs: merged.marriage_allow_admin_pairs,
    commandGlobalCooldown: merged.command_global_cooldown,
    countingEnabled: merged.counting_enabled,
    countingChannelId: merged.counting_channel_id,
    countingStart: merged.counting_start,
    countingStyle: merged.counting_style,
    countingAllowRepeat: merged.counting_allow_repeat,
    countingAuthenticity: merged.counting_authenticity,
    suggestionsEnabled: merged.suggestions_enabled,
    suggestionsChannelId: merged.suggestions_channel_id,
    suggestionsExcludedRoleIds: merged.suggestions_excluded_role_ids,
    suggestionsMaxActive: merged.suggestions_max_active,
    suggestionsCooldownMinutes: merged.suggestions_cooldown_minutes,
    pollsEnabled: merged.polls_enabled,
    pollsExcludedRoleIds: merged.polls_excluded_role_ids,
    pollsMaxActive: merged.polls_max_active,
    pollsCooldownMinutes: merged.polls_cooldown_minutes,
    pollStyle: merged.poll_style,
    triviaEnabled: merged.trivia_enabled,
    triviaExcludedRoleIds: merged.trivia_excluded_role_ids,
    triviaTimed: merged.trivia_timed,
    triviaTimeSeconds: merged.trivia_time_seconds,
    triviaDifficulty: merged.trivia_difficulty,
    triviaCategories: merged.trivia_categories,
    triviaChannelId: merged.trivia_channel_id,
    triviaRewards: merged.trivia_rewards,
    autopostsEnabled: merged.autoposts_enabled,
    autoposts: merged.autoposts,
    newsEnabled: merged.news_enabled,
    newsChannels: merged.news_channels,
    newsRssUrl: merged.news_rss_url,
    newsRssChannelId: merged.news_rss_channel_id,
    socialEnabled: merged.social_enabled,
    socialFeeds: merged.social_feeds,
    nsfwBotPreferencesEnabled: merged.nsfw_bot_preferences_enabled,
    nsfwGeneralEnabled: merged.nsfw_general_enabled,
    nsfwEnabled: merged.nsfw_enabled,
    nsfwChannelId: merged.nsfw_channel_id,
    nsfwAutopostChannelId: merged.nsfw_autopost_channel_id,
    nsfwAutopostEnabled: merged.nsfw_autopost_enabled,
    nsfwAutopostMinutes: merged.nsfw_autopost_minutes,
    nsfwCommandsEnabled: merged.nsfw_commands_enabled,
    nsfwContent: merged.nsfw_content,
    confessChannelId: merged.confess_channel_id,
    confessExcludedRoleIds: merged.confess_excluded_role_ids,
    confessAllowAnonymous: merged.confess_allow_anonymous,
    confessAllowPublic: merged.confess_allow_public,
    marriageExcludedRoleIds: merged.marriage_excluded_role_ids,
    nitroRepostMode: merged.nitro_repost_mode,
    nitroExcludedRoleIds: merged.nitro_excluded_role_ids,
    ownerRoleIds: merged.owner_role_ids,
    adminRoleIds: merged.admin_role_ids,
    modRoleIds: merged.mod_role_ids,
    botRoleIds: merged.bot_role_ids,
    historyEnabled: merged.history_enabled,
    historyChannelId: merged.history_channel_id,
    allianceConfig: merged.alliance_config,
    ticketConfig: merged.ticket_config,
  };
  try {
    const guildConfigs = ciszubotSchema.guildConfigs;
    await db
      .insert(guildConfigs)
      .values(values)
      .onConflictDoUpdate({
        target: guildConfigs.guildId,
        set: { ...values, updatedAt: sql`now()` },
      });
  } catch (error) {
    logger.warn('No se pudo guardar la config del guild:', error);
  }
  return merged;
}

export function invalidateGuildConfig(guildId: string): void {
  cache.delete(guildId);
  cacheAt.delete(guildId);
}

export async function getPrefix(guildId: string | null | undefined): Promise<string> {
  if (!guildId) return DEFAULTS.prefix;
  const cfg = await getGuildConfig(guildId);
  return cfg.prefix;
}

/** Moneda formateada con el emoji/nombre configurado del servidor. */
export function formatCoins(cfg: GuildConfig, amount: number): string {
  const locale = cfg.lang === 'en' ? 'en-US' : 'es-ES';
  const name = cfg.lang === 'en' && cfg.coin_name === 'monedas' ? 'coins' : cfg.coin_name;
  return `${amount.toLocaleString(locale)} ${cfg.coin_emoji} ${name}`;
}
