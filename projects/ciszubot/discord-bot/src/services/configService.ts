import { db, ciszubotSchema, eq, sql } from '@ciszunetwork/db';
import { logger } from './logger';

export interface AutomodConfig {
  links: boolean;
  invites: boolean;
  caps: boolean;
  spam: boolean;
  words: string[];
}

export interface DropsConfig {
  enabled: boolean;
  channels: string[];
  min: number;
  max: number;
  interval_min: number;
  interval_max: number;
  message: string | null;
  excluded_roles: string[];
}

export interface LevelRole {
  level: number;
  role_id: string;
}

export interface InviteReward {
  invites: number;
  role_id: string;
}

export interface GuildConfig {
  guild_id: string;
  prefix: string;
  lang: string;
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
  private_vc_hub_id: string | null;
  secret_user_ids: string[];
  nitro_repost_enabled: boolean;
}

const DEFAULT_AUTOMOD: AutomodConfig = { links: false, invites: false, caps: false, spam: false, words: [] };
const DEFAULT_DROPS: DropsConfig = {
  enabled: false,
  channels: [],
  min: 50,
  max: 200,
  interval_min: 60,
  interval_max: 180,
  message: null,
  excluded_roles: [],
};

const DEFAULTS: Omit<GuildConfig, 'guild_id'> = {
  prefix: 'cz!',
  lang: 'es',
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
  private_vc_hub_id: null,
  secret_user_ids: [],
  nitro_repost_enabled: false,
};

const cache = new Map<string, GuildConfig>();

function asObject<T>(value: unknown, fallback: T): T {
  if (value && typeof value === 'object' && !Array.isArray(value)) return { ...fallback, ...(value as object) } as T;
  return fallback;
}

function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export async function getGuildConfig(guildId: string): Promise<GuildConfig> {
  const cached = cache.get(guildId);
  if (cached) return cached;

  try {
    const guildConfigs = ciszubotSchema.guildConfigs;
    const rows = await db.select().from(guildConfigs).where(eq(guildConfigs.guildId, guildId)).limit(1);
    const data = rows[0];
    if (data) {
      const cfg: GuildConfig = {
        guild_id: guildId,
        prefix: data.prefix ?? DEFAULTS.prefix,
        lang: data.lang ?? DEFAULTS.lang,
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
        drops: asObject(data.drops, DEFAULT_DROPS),
        starboard_channel_id: data.starboardChannelId ?? DEFAULTS.starboard_channel_id,
        starboard_emoji: data.starboardEmoji ?? DEFAULTS.starboard_emoji,
        starboard_min: data.starboardMin ?? DEFAULTS.starboard_min,
        invite_points_per: data.invitePointsPer ?? DEFAULTS.invite_points_per,
        invite_rewards: asArray(data.inviteRewards, DEFAULTS.invite_rewards),
        private_vc_hub_id: data.privateVcHubId ?? DEFAULTS.private_vc_hub_id,
        secret_user_ids: asArray(data.secretUserIds, DEFAULTS.secret_user_ids),
        nitro_repost_enabled: data.nitroRepostEnabled ?? DEFAULTS.nitro_repost_enabled,
      };
      cache.set(guildId, cfg);
      return cfg;
    }
  } catch (error) {
    logger.warn('No se pudo leer la config del guild:', error);
  }
  const cfg: GuildConfig = { ...DEFAULTS, guild_id: guildId };
  cache.set(guildId, cfg);
  return cfg;
}

export async function updateGuildConfig(
  guildId: string,
  patch: Partial<Omit<GuildConfig, 'guild_id'>>
): Promise<GuildConfig> {
  const cfg = await getGuildConfig(guildId);
  const merged: GuildConfig = { ...cfg, ...patch };
  cache.set(guildId, merged);
  const values = {
    guildId,
    prefix: merged.prefix,
    lang: merged.lang,
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
    privateVcHubId: merged.private_vc_hub_id,
    secretUserIds: merged.secret_user_ids,
    nitroRepostEnabled: merged.nitro_repost_enabled,
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
}

export async function getPrefix(guildId: string | null | undefined): Promise<string> {
  if (!guildId) return DEFAULTS.prefix;
  const cfg = await getGuildConfig(guildId);
  return cfg.prefix;
}

/** Moneda formateada con el emoji/nombre configurado del servidor. */
export function formatCoins(cfg: GuildConfig, amount: number): string {
  return `${amount.toLocaleString('es-ES')} ${cfg.coin_emoji}`;
}
