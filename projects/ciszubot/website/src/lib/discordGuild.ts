import { API_BASE } from './auth';

export interface GuildRole {
  id: string;
  name: string;
  color: number;
  position: number;
  /** Bitfield de permisos del rol (string decimal, como lo envía Discord). */
  permissions?: string;
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
  /** Permisos efectivos del bot en el guild (string decimal) o null si no se pudo calcular. */
  botPermissions?: string | null;
  /** Roles del bot en el guild (para depuración/UI). */
  botRoleIds?: string[];
}

let cachedBotUserId: string | null = null;

/** Id del usuario bot (GET /users/@me, cacheado en memoria del proceso). */
async function getBotUserId(headers: Record<string, string>): Promise<string | null> {
  if (cachedBotUserId) return cachedBotUserId;
  try {
    const res = await fetch(`${API_BASE}/users/@me`, { headers, cache: 'no-store' });
    if (!res.ok) return null;
    const me = (await res.json()) as { id?: string };
    if (me.id) cachedBotUserId = me.id;
    return me.id ?? null;
  } catch {
    return null;
  }
}

/** Suma (OR) de permisos: @everyone + roles del bot. Administrador implica todo. */
function computeBotPermissions(
  roles: { id: string; name: string; permissions?: string }[],
  botRoleIds: string[],
): string | null {
  try {
    let acc = BigInt(0);
    for (const role of roles) {
      if (!role.permissions) continue;
      if (role.name === '@everyone' || botRoleIds.includes(role.id)) {
        acc |= BigInt(role.permissions);
      }
    }
    const ADMIN = BigInt(8);
    if ((acc & ADMIN) === ADMIN) return '8';
    return acc.toString();
  } catch {
    return null;
  }
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
      permissions?: string;
    }[];
    const channelsRaw = (await channelsRes.json()) as {
      id: string;
      name: string;
      type: number;
      parent_id?: string | null;
      position: number;
    }[];

    // Permisos efectivos del bot: miembro del bot + roles del guild.
    let botPermissions: string | null = null;
    let botRoleIds: string[] = [];
    const botId = await getBotUserId(headers);
    if (botId) {
      try {
        const memberRes = await fetch(`${API_BASE}/guilds/${guildId}/members/${botId}`, {
          headers,
          cache: 'no-store',
        });
        if (memberRes.ok) {
          const member = (await memberRes.json()) as { roles?: string[] };
          botRoleIds = Array.isArray(member.roles) ? member.roles : [];
          botPermissions = computeBotPermissions(rolesRaw, botRoleIds);
        }
      } catch {
        botPermissions = null;
      }
    }

    return {
      memberCount: guild.approximate_member_count ?? null,
      botPermissions,
      botRoleIds,
      roles: rolesRaw
        .filter((role) => role.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .map((role) => ({
          id: role.id,
          name: role.name,
          color: role.color,
          position: role.position,
          permissions: role.permissions,
        })),
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

export interface GuildSummary {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  memberCount: number | null;
  presenceCount: number | null;
  ownerId: string | null;
  createdAt: string | null;
  premiumTier: number | null;
}

/**
 * Resumen ampliado de un servidor (para el overview): descripción, miembros
 * aproximados y presencia (en línea/desconectados) con `with_counts=true`
 * — no requiere el intent de presencias.
 */
export async function fetchGuildSummary(guildId: string): Promise<GuildSummary | null> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return null;
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const g = (await res.json()) as {
      id: string;
      name: string;
      icon: string | null;
      description?: string | null;
      approximate_member_count?: number;
      approximate_presence_count?: number;
      owner_id?: string;
      premium_tier?: number;
    };
    const createdAt = new Date(Number((BigInt(g.id) >> BigInt(22)) + BigInt(1420070400000))).toISOString();
    return {
      id: g.id,
      name: g.name,
      icon: g.icon ?? null,
      description: g.description ?? null,
      memberCount: g.approximate_member_count ?? null,
      presenceCount: g.approximate_presence_count ?? null,
      ownerId: g.owner_id ?? null,
      createdAt,
      premiumTier: g.premium_tier ?? null,
    };
  } catch {
    return null;
  }
}
