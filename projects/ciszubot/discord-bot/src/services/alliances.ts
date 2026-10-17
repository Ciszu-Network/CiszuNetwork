import { Client, EmbedBuilder, Guild, GuildMember, TextChannel } from 'discord.js';
import { db, ciszubotSchema, eq, and, desc, sql } from './supabase';
import { getGuildConfig, GuildConfig, AllianceConfig } from './configService';
import { addMoney, formatMoney } from './economy';
import { logger } from './logger';

/**
 * Sistema de alianzas: captura links de servidores publicados en un canal
 * dedicado, valida (cooldown, duplicados, filtros, +18, sanciones), otorga
 * puntos de alianza y gestiona recompensas por umbral.
 */

const INVITE_RE = /(?:discord\.gg|discord(?:app)?\.com\/invite)\/([a-zA-Z0-9-]+)/i;
const NSFW_RE = /(nsfw|18\+|\+18|porno|porn|xxx|hentai|adult|onlyfans|sexo)/i;

export interface InviteInfo {
  code: string;
  serverId: string;
  serverName: string;
  description: string;
  nsfwLevel: number;
  memberCount: number;
}

/** Extrae el código de invitación del contenido (o null). */
export function parseInviteCode(content: string): string | null {
  return content.match(INVITE_RE)?.[1] ?? null;
}

/** Resuelve la info real de una invitación con la API de Discord. */
export async function fetchInviteInfo(client: Client, code: string): Promise<InviteInfo | null> {
  try {
    const invite = await client.fetchInvite(code);
    if (!invite.guild) return null;
    const guild = invite.guild as Guild & { description?: string | null; nsfwLevel?: number; approximateMemberCount?: number };
    return {
      code,
      serverId: guild.id,
      serverName: guild.name,
      description: guild.description ?? '',
      nsfwLevel: guild.nsfwLevel ?? 0,
      memberCount: (invite as unknown as { approximateMemberCount?: number }).approximateMemberCount ?? guild.approximateMemberCount ?? 0,
    };
  } catch {
    return null;
  }
}

/** ¿Es un servidor +18/NSFW? (nivel de Discord o palabras en nombre/descripción) */
export function isNsfw(info: InviteInfo): boolean {
  return info.nsfwLevel >= 2 || NSFW_RE.test(`${info.serverName} ${info.description}`);
}

export async function addAlliancePoints(guildId: string, userId: string, points: number): Promise<number> {
  try {
    const table = ciszubotSchema.alliancePoints;
    const rows = await db
      .insert(table)
      .values({ guildId, userId, points })
      .onConflictDoUpdate({
        target: [table.guildId, table.userId],
        set: { points: sql`${table.points} + ${points}`, updatedAt: sql`now()` },
      })
      .returning({ points: table.points });
    return Number(rows[0]?.points ?? points);
  } catch (error) {
    logger.warn('addAlliancePoints:', error);
    return 0;
  }
}

export async function getAlliancePoints(guildId: string, userId: string): Promise<number> {
  try {
    const table = ciszubotSchema.alliancePoints;
    const rows = await db
      .select({ points: table.points })
      .from(table)
      .where(and(eq(table.guildId, guildId), eq(table.userId, userId)))
      .limit(1);
    return Number(rows[0]?.points ?? 0);
  } catch {
    return 0;
  }
}

export async function getTopAlliancePoints(guildId: string, limit = 10): Promise<Array<{ userId: string; points: number }>> {
  try {
    const table = ciszubotSchema.alliancePoints;
    const rows = await db
      .select({ userId: table.userId, points: table.points })
      .from(table)
      .where(eq(table.guildId, guildId))
      .orderBy(desc(table.points))
      .limit(limit);
    return rows.map((r) => ({ userId: r.userId, points: Number(r.points) }));
  } catch {
    return [];
  }
}

/** ¿Ese servidor ya tiene alianza registrada en este servidor? */
export async function hasAlliance(guildId: string, partnerId: string): Promise<boolean> {
  try {
    const rows = await db
      .select({ id: ciszubotSchema.alliances.id })
      .from(ciszubotSchema.alliances)
      .where(and(eq(ciszubotSchema.alliances.guildId, guildId), eq(ciszubotSchema.alliances.partnerId, partnerId)))
      .limit(1);
    return Boolean(rows[0]);
  } catch {
    return false;
  }
}

/** Última alianza publicada por un usuario (para el cooldown). */
export async function lastAllianceAt(guildId: string, userId: string): Promise<number> {
  try {
    const rows = await db
      .select({ createdAt: ciszubotSchema.alliances.createdAt })
      .from(ciszubotSchema.alliances)
      .where(and(eq(ciszubotSchema.alliances.guildId, guildId), eq(ciszubotSchema.alliances.userId, userId)))
      .orderBy(desc(ciszubotSchema.alliances.createdAt))
      .limit(1);
    return rows[0]?.createdAt ? new Date(rows[0].createdAt).getTime() : 0;
  } catch {
    return 0;
  }
}

/** Registra la alianza (false si ya existía el servidor). */
export async function registerAlliance(
  guildId: string,
  userId: string,
  info: InviteInfo,
): Promise<boolean> {
  try {
    await db.insert(ciszubotSchema.alliances).values({
      guildId,
      partnerId: info.serverId,
      partnerName: info.serverName,
      partnerInvite: info.code,
      userId,
    });
    return true;
  } catch {
    return false; // unique (guild_id, partner_id) ⇒ duplicado
  }
}

function render(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) out = out.replaceAll(`{${key}}`, value);
  return out;
}

/** Embed de error de alianza (auto-borrado). */
export async function sendAllianceError(
  message: { reply: (content: never) => Promise<unknown>; delete?: () => Promise<unknown> },
  config: AllianceConfig,
  reason: string,
  tag: string,
  iconURL?: string,
): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(config.embed_error.color as `#${string}`)
    .setTitle(config.embed_error.title)
    .setDescription(render(config.embed_error.description, { reason }))
    .setFooter({ text: `CiszuBot • ${tag}`, iconURL });
  const reply = (await message.reply({ embeds: [embed] } as never).catch(() => null)) as { delete?: () => Promise<unknown> } | null;
  if (reply && config.error_delete_after > 0) {
    setTimeout(() => void reply.delete?.().catch(() => undefined), config.error_delete_after * 1000);
  }
}

export interface AllianceProcessResult {
  ok: boolean;
  reason?: string;
}

/**
 * Procesa un mensaje del canal de alianzas: valida y registra la alianza.
 * Devuelve { ok:false, reason } si hay que borrar el mensaje y avisar.
 */
export async function processAllianceMessage(
  client: Client,
  guild: Guild,
  member: GuildMember | null,
  message: { id: string; content: string; channelId: string; delete: () => Promise<unknown>; authorId: string; authorTag: string; iconURL?: string },
  cfg: GuildConfig,
): Promise<AllianceProcessResult> {
  const config = cfg.alliance_config;
  if (!config.enabled || message.channelId !== config.channel_id) return { ok: true };

  // Rol requerido para publicar
  if (config.role_id && member && !member.roles.cache.has(config.role_id)) {
    return { ok: false, reason: 'No tienes el rango de alianzas. Pídeselo a la administración.' };
  }

  const code = parseInviteCode(message.content);
  if (!code) return { ok: false, reason: 'El mensaje no contiene un link de servidor de Discord válido.' };

  const info = await fetchInviteInfo(client, code);
  if (!info) return { ok: false, reason: 'La invitación no es válida, expiró o el bot no tiene acceso a ese servidor.' };

  // Palabras bloqueadas en el mensaje
  const lower = message.content.toLowerCase();
  const blockedWord = config.blocked_words.find((w) => lower.includes(w.toLowerCase()));
  if (blockedWord) return { ok: false, reason: `El mensaje contiene una palabra bloqueada (**${blockedWord}**).` };

  // Servidores bloqueados (con sanción configurable)
  if (config.blocked_servers.includes(info.serverId)) {
    await applySanction(guild, member, config);
    return { ok: false, reason: `El servidor **${info.serverName}** está bloqueado para alianzas.` };
  }

  // +18 / NSFW
  if (!config.allow_nsfw && isNsfw(info)) {
    return { ok: false, reason: 'Los servidores +18/NSFW no están permitidos en este servidor.' };
  }

  // Duplicados (1 anuncio por servidor)
  if (config.one_per_server && (await hasAlliance(guild.id, info.serverId))) {
    return { ok: false, reason: `El servidor **${info.serverName}** ya tiene una alianza publicada aquí.` };
  }

  // Cooldown por usuario (0 = sin cooldown)
  if (config.cooldown_hours > 0) {
    const last = await lastAllianceAt(guild.id, message.authorId);
    const waitMs = config.cooldown_hours * 3600_000 - (Date.now() - last);
    if (last > 0 && waitMs > 0) {
      const hours = Math.floor(waitMs / 3600_000);
      const mins = Math.ceil((waitMs % 3600_000) / 60_000);
      return { ok: false, reason: `Debes esperar **${hours}h ${mins}m** para publicar otra alianza.` };
    }
  }

  const registered = await registerAlliance(guild.id, message.authorId, info);
  if (!registered) return { ok: false, reason: `El servidor **${info.serverName}** ya tiene una alianza publicada aquí.` };

  const points = await addAlliancePoints(guild.id, message.authorId, 1);

  // Recompensas por umbral
  for (const reward of config.rewards ?? []) {
    if (points >= reward.points) {
      if (reward.role_id && member) {
        const role = guild.roles.cache.get(reward.role_id);
        if (role && !member.roles.cache.has(role.id) && member.manageable) {
          await member.roles.add(role).catch(() => undefined);
        }
      }
      if (reward.money && reward.money > 0) {
        await addMoney(message.authorId, guild.id, reward.money, 'alliance_reward', `Recompensa de alianza (${reward.points} pts)`);
      }
    }
  }

  // Mensaje de éxito (reemplaza el original)
  await message.delete().catch(() => undefined);
  const channel = guild.channels.cache.get(config.channel_id ?? '') as TextChannel | undefined;
  if (channel) {
    const embed = new EmbedBuilder()
      .setColor(config.embed_success.color as `#${string}`)
      .setTitle(config.embed_success.title)
      .setDescription(
        render(config.embed_success.description, {
          user: `<@${message.authorId}>`,
          username: message.authorTag,
          server: info.serverName,
          invite: `https://discord.gg/${info.code}`,
          points: String(points),
          members: String(info.memberCount),
        }),
      )
      .addFields(
        { name: '🔗 Invitación', value: `https://discord.gg/${info.code}`, inline: true },
        { name: '👥 Miembros', value: info.memberCount > 0 ? info.memberCount.toLocaleString('es-ES') : '—', inline: true },
        { name: '🏆 Puntos de alianza', value: String(points), inline: true },
      )
      .setFooter({ text: 'CiszuBot • Alianzas' })
      .setTimestamp();
    await channel.send({
      content: config.notify_role_id ? `<@&${config.notify_role_id}>` : undefined,
      embeds: [embed],
    }).catch(() => undefined);
  }

  return { ok: true };
}

async function applySanction(guild: Guild, member: GuildMember | null, config: AllianceConfig): Promise<void> {
  if (!member || config.sanction === 'none') return;
  try {
    if (config.sanction === 'ban') {
      await member.ban({ reason: 'Alianza con servidor bloqueado' }).catch(() => undefined);
    } else if (config.sanction === 'kick') {
      await member.kick('Alianza con servidor bloqueado').catch(() => undefined);
    } else if (config.sanction === 'mute') {
      await member.timeout(Math.max(1, config.sanction_minutes) * 60_000, 'Alianza con servidor bloqueado').catch(() => undefined);
    }
  } catch (error) {
    logger.warn('applySanction:', error);
  }
}
