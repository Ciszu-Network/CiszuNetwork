import { EmbedBuilder, Guild, TextChannel, User } from 'discord.js';
import { db, ciszubotSchema, eq, and } from '@ciszunetwork/db';
import { logger } from './logger';

interface GiveawayData {
  id: string;
  guild_id: string;
  channel_id: string;
  message_id: string;
  prize: string;
  winners: number;
  ends_at: string;
  hosted_by: string;
}

const timers = new Map<string, NodeJS.Timeout>();

function msUntil(iso: string): number {
  return Math.max(0, new Date(iso).getTime() - Date.now());
}

export function scheduleGiveaway(guild: Guild, data: GiveawayData): void {
  const existing = timers.get(data.id);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    void endGiveaway(guild, data);
  }, msUntil(data.ends_at) + 500);
  timers.set(data.id, timer);
}

export async function endGiveaway(guild: Guild, data: GiveawayData): Promise<void> {
  timers.delete(data.id);
  try {
    const giveaways = ciszubotSchema.giveaways;
    await db.update(giveaways).set({ ended: true }).where(eq(giveaways.id, data.id));

    const channel = guild.channels.cache.get(data.channel_id) as TextChannel | undefined;
    if (!channel) return;

    let message;
    try {
      message = await channel.messages.fetch(data.message_id);
    } catch {
      return;
    }

    const reactions = message.reactions.cache.get('🎉');
    const entries: string[] = [];
    if (reactions) {
      const users = await reactions.users.fetch();
      entries.push(...users.map((u) => u.id).filter((id) => id !== guild.client.user?.id));
    }

    const winners = [];
    for (let i = 0; i < data.winners && entries.length > 0; i++) {
      const idx = Math.floor(Math.random() * entries.length);
      winners.push(entries.splice(idx, 1)[0]);
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎉 Giveaway finalizado: ${data.prize}`)
      .setColor('#ff33cc')
      .setDescription(
        winners.length > 0
          ? `Ganadores: ${winners.map((w) => `<@${w}>`).join(', ')}`
          : 'No hubo participantes. 😢'
      )
      .setFooter({ text: 'CiszuBot • Giveaways' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    logger.warn('endGiveaway:', error);
  }
}

export async function startGiveaway(
  guild: Guild,
  channel: TextChannel,
  prize: string,
  winners: number,
  durationMs: number,
  host: { id: string; tag: string; displayAvatarURL(opts?: { size?: number }): string }
): Promise<{ ok: boolean; message?: string }> {
  const embed = new EmbedBuilder()
    .setTitle(`🎉 Giveaway: ${prize}`)
    .setDescription(
      `Reacciona con 🎉 para participar!\n\n**Ganadores:** ${winners}\n**Termina:** <t:${Math.floor((Date.now() + durationMs) / 1000)}:R>`
    )
    .setColor('#ff33cc')
    .setFooter({ text: `Hosteado por ${host.tag}`, iconURL: host.displayAvatarURL() })
    .setTimestamp();

  const msg = await channel.send({ embeds: [embed] });
  await msg.react('🎉');

  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const endsAt = new Date(Date.now() + durationMs);
  const data: GiveawayData = {
    id,
    guild_id: guild.id,
    channel_id: channel.id,
    message_id: msg.id,
    prize,
    winners,
    ends_at: endsAt.toISOString(),
    hosted_by: host.id,
  };

  try {
    const giveaways = ciszubotSchema.giveaways;
    await db.insert(giveaways).values({
      id: data.id,
      guildId: data.guild_id,
      channelId: data.channel_id,
      messageId: data.message_id,
      prize: data.prize,
      winners: data.winners,
      endsAt,
      hostedBy: data.hosted_by,
    });
  } catch (error) {
    logger.warn('startGiveaway insert:', error);
  }
  scheduleGiveaway(guild, data);
  return { ok: true };
}

export async function resumeActiveGiveaways(guild: Guild): Promise<void> {
  try {
    const giveaways = ciszubotSchema.giveaways;
    const rows = await db
      .select()
      .from(giveaways)
      .where(and(eq(giveaways.guildId, guild.id), eq(giveaways.ended, false)));
    for (const gw of rows) {
      const data: GiveawayData = {
        id: gw.id,
        guild_id: gw.guildId,
        channel_id: gw.channelId,
        message_id: gw.messageId,
        prize: gw.prize,
        winners: gw.winners,
        ends_at: gw.endsAt.toISOString(),
        hosted_by: gw.hostedBy,
      };
      if (new Date(gw.endsAt).getTime() > Date.now()) {
        scheduleGiveaway(guild, data);
      } else {
        void endGiveaway(guild, data);
      }
    }
  } catch (error) {
    logger.warn('resumeActiveGiveaways:', error);
  }
}