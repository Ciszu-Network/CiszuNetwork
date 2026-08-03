import { getSupabase } from './supabase';
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
    const db = getSupabase();
    const { data } = await db.from('guild_configs').select('*').eq('guild_id', guildId).maybeSingle();
    if (data) {
      const cfg: GuildConfig = { ...DEFAULTS, guild_id: guildId, ...data };
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
    const db = getSupabase();
    await db.from('guild_configs').upsert({
      ...merged,
      autorole_ids: JSON.stringify(merged.autorole_ids),
      counters: JSON.stringify(merged.counters),
      updated_at: new Date().toISOString(),
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
