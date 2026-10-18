import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { db, sql } from './supabase';
import { logger } from './logger';

/**
 * Cola de acciones del bot (ciszubot.bot_actions): el dashboard y la devcon
 * insertan filas y este poller las ejecuta cada 5s. Es la vía por la que la
 * web puede hacer que el bot envíe mensajes (say / directsay) y, de paso,
 * la prueba real de la cadena web → DB → bot → Discord.
 */

interface ActionRow {
  id: number;
  guild_id: string;
  type: string;
  channel_id: string;
  content: string;
  source: string;
}

async function runAction(client: Client, action: ActionRow): Promise<string> {
  const guild = client.guilds.cache.get(action.guild_id);
  if (!guild) return 'error: el bot no está en ese servidor';

  // ─── Acciones del manager de giveaways (payload JSON en content) ───
  if (action.type.startsWith('giveaway_')) {
    try {
      const giveaways = await import('./giveaways');
      const payload = JSON.parse(action.content) as Record<string, unknown>;
      const giveawayId = String(payload.giveaway_id ?? '');

      switch (action.type) {
        case 'giveaway_create': {
          const channelId = String(payload.channel_id ?? '');
          const channel = (guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId).catch(() => null))) as TextChannel | null;
          if (!channel || !channel.isTextBased()) return 'error: canal no válido';
          const hostId = String(payload.host_id ?? '');
          const hostUser = await client.users.fetch(hostId).catch(() => null);
          const host = hostUser
            ? { id: hostUser.id, tag: hostUser.tag, displayAvatarURL: (o?: { size?: number }) => hostUser.displayAvatarURL(o) }
            : { id: hostId, tag: 'Dashboard', displayAvatarURL: () => '' };
          const res = await giveaways.createGiveaway(guild, channel, {
            prize: String(payload.prize ?? 'Sorteo'),
            winners: Math.max(1, Number(payload.winners) || 1),
            durationMs: Math.max(60_000, (Number(payload.duration_minutes) || 60) * 60_000),
            host,
            requiredRoleIds: Array.isArray(payload.required_role_ids) ? (payload.required_role_ids as string[]) : [],
            grantRoleIds: Array.isArray(payload.grant_role_ids) ? (payload.grant_role_ids as string[]) : [],
            maxParticipants: Math.max(0, Number(payload.max_participants) || 0),
            requiredMessages: Math.max(0, Number(payload.required_messages) || 0),
            bonusRoles: Array.isArray(payload.bonus_roles) ? (payload.bonus_roles as Array<{ role_id: string; multiplier: number }>) : [],
            source: 'dashboard',
          });
          return res.ok
            ? `ok:${res.id}`
            : res.limitReached
              ? `error: límite de ${giveaways.GIVEAWAY_FREE_LIMIT} sorteos activos en plan free (premium = ilimitado)`
              : 'error: no se pudo crear el sorteo';
        }
        case 'giveaway_pause':
          return (await giveaways.pauseGiveaway(guild, giveawayId)) ? 'ok' : 'error: no se pudo pausar';
        case 'giveaway_resume':
          return (await giveaways.resumeGiveaway(guild, giveawayId)) ? 'ok' : 'error: no se pudo reanudar';
        case 'giveaway_cancel':
          return (await giveaways.cancelGiveaway(guild, giveawayId)) ? 'ok' : 'error: no se pudo cancelar';
        case 'giveaway_reroll': {
          const winner = await giveaways.rerollGiveaway(guild, giveawayId);
          return winner ? `ok:${winner}` : 'error: no hay participantes para relanzar';
        }
        case 'giveaway_remove':
          await giveaways.removeParticipant(giveawayId, String(payload.user_id ?? ''));
          return 'ok';
        case 'giveaway_ban':
          await giveaways.banParticipant(giveawayId, String(payload.user_id ?? ''));
          return 'ok';
        default:
          return 'error: acción desconocida';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `error: ${message.slice(0, 200)}`;
    }
  }

  const channel = (guild.channels.cache.get(action.channel_id) ??
    (await guild.channels.fetch(action.channel_id).catch(() => null))) as TextChannel | null;
  if (!channel || !channel.isTextBased()) return 'error: canal no válido o sin acceso';

  try {
    if (action.type === 'say') {
      const embed = new EmbedBuilder()
        .setColor('#4f46e5')
        .setDescription(action.content.slice(0, 4000))
        .setFooter({ text: `CiszuBot • ${action.source}` })
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    } else {
      await channel.send({ content: action.content.slice(0, 2000) });
    }
    return 'ok';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `error: ${message.slice(0, 200)}`;
  }
}

async function tick(client: Client): Promise<void> {
  try {
    const rows = (await db.execute(sql`
      select id, guild_id, type, channel_id, content, source
      from ciszubot.bot_actions
      where processed = false
      order by created_at asc
      limit 10
    `)) as unknown as { rows?: ActionRow[] } | ActionRow[];
    const pending = Array.isArray(rows) ? rows : (rows.rows ?? []);
    for (const action of pending) {
      const result = await runAction(client, action);
      await db.execute(sql`
        update ciszubot.bot_actions
        set processed = true, processed_at = now(), result = ${result}
        where id = ${action.id}
      `);
      logger.info(`Acción ${action.id} (${action.type}, ${action.source}): ${result}`);
    }
  } catch (error) {
    logger.warn('bot_actions poller:', error);
  }
}

/** Arranca el poller de acciones (cada 5 segundos). */
export function scheduleActions(client: Client): void {
  setInterval(() => void tick(client), 5_000);
}
