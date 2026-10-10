import { API_BASE } from './auth';

export interface GuildRole {
  id: string;
  name: string;
  color: number;
  position: number;
}

export interface GuildChannel {
  id: string;
  name: string;
  type: number;
  parentId: string | null;
  position: number;
}

export interface GuildInfo {
  memberCount: number | null;
  roles: GuildRole[];
  channels: GuildChannel[];
}

/**
 * Lee roles, canales y número de miembros de un servidor con el token del bot.
 * Devuelve null si el bot no está en el servidor o Discord no responde.
 */
export async function fetchGuildInfo(guildId: string): Promise<GuildInfo | null> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return null;
  const headers = { Authorization: `Bot ${botToken}` };
  try {
    const [guildRes, rolesRes, channelsRes] = await Promise.all([
      fetch(`${API_BASE}/guilds/${guildId}?with_counts=true`, { headers, cache: 'no-store' }),
      fetch(`${API_BASE}/guilds/${guildId}/roles`, { headers, cache: 'no-store' }),
      fetch(`${API_BASE}/guilds/${guildId}/channels`, { headers, cache: 'no-store' }),
    ]);
    if (!guildRes.ok || !rolesRes.ok || !channelsRes.ok) return null;

    const guild = (await guildRes.json()) as { approximate_member_count?: number };
    const rolesRaw = (await rolesRes.json()) as {
      id: string;
      name: string;
      color: number;
      position: number;
    }[];
    const channelsRaw = (await channelsRes.json()) as {
      id: string;
      name: string;
      type: number;
      parent_id?: string | null;
      position: number;
    }[];

    return {
      memberCount: guild.approximate_member_count ?? null,
      roles: rolesRaw
        .filter((role) => role.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .map((role) => ({ id: role.id, name: role.name, color: role.color, position: role.position })),
      channels: channelsRaw
        .sort((a, b) => a.position - b.position)
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          type: channel.type,
          parentId: channel.parent_id ?? null,
          position: channel.position,
        })),
    };
  } catch {
    return null;
  }
}

export const CHANNEL_TEXT = 0;
export const CHANNEL_VOICE = 2;
export const CHANNEL_CATEGORY = 4;
export const CHANNEL_ANNOUNCEMENT = 5;
export const CHANNEL_STAGE = 13;
