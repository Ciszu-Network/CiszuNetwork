import { db, ciszubotSchema, eq, sql } from '@ciszunetwork/db';
import { logger } from './logger';

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
}

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
};

const cache = new Map<string, GuildConfig>();

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
        autorole_ids: Array.isArray(data.autoroleIds) ? (data.autoroleIds as string[]) : DEFAULTS.autorole_ids,
        logs_channel_id: data.logsChannelId ?? DEFAULTS.logs_channel_id,
        counters: Array.isArray(data.counters) ? (data.counters as Array<{ type: string; channel_id: string }>) : DEFAULTS.counters,
        tickets_enabled: data.ticketsEnabled ?? DEFAULTS.tickets_enabled,
        tickets_category_id: data.ticketsCategoryId ?? DEFAULTS.tickets_category_id,
        tickets_role_id: data.ticketsRoleId ?? DEFAULTS.tickets_role_id,
        private_channels: data.privateChannels ?? DEFAULTS.private_channels,
        private_category_id: data.privateCategoryId ?? DEFAULTS.private_category_id,
        music_channel_id: data.musicChannelId ?? DEFAULTS.music_channel_id,
        automod_enabled: data.automodEnabled ?? DEFAULTS.automod_enabled,
        mute_role_id: data.muteRoleId ?? DEFAULTS.mute_role_id,
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
  try {
    const guildConfigs = ciszubotSchema.guildConfigs;
    await db
      .insert(guildConfigs)
      .values({
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
      })
      .onConflictDoUpdate({
        target: guildConfigs.guildId,
        set: {
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
          updatedAt: sql`now()`,
        },
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