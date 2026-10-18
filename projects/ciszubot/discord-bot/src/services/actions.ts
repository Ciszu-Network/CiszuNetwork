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
  type: 'say' | 'directsay';
  channel_id: string;
  content: string;
  source: string;
}

async function runAction(client: Client, action: ActionRow): Promise<string> {
  const guild = client.guilds.cache.get(action.guild_id);
  if (!guild) return 'error: el bot no está en ese servidor';
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
