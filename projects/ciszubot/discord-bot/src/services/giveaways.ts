import { EmbedBuilder, Guild, TextChannel, User } from 'discord.js';
import { getSupabase } from './supabase';
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
    const db = getSupabase();
    await db.from('giveaways').update({ ended: true }).eq('id', data.id);

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
  const data: GiveawayData = {
    id,
    guild_id: guild.id,
    channel_id: channel.id,
    message_id: msg.id,
    prize,
    winners,
    ends_at: new Date(Date.now() + durationMs).toISOString(),
    hosted_by: host.id,
  };

  try {
    const db = getSupabase();
    await db.from('giveaways').insert(data);
  } catch (error) {
    logger.warn('startGiveaway insert:', error);
  }
  scheduleGiveaway(guild, data);
  return { ok: true };
}

export async function resumeActiveGiveaways(guild: Guild): Promise<void> {
  try {
    const db = getSupabase();
    const { data } = await db
      .from('giveaways')
      .select('*')
      .eq('guild_id', guild.id)
      .eq('ended', false)
      .order('ends_at', { ascending: true });
    for (const gw of (data ?? []) as GiveawayData[]) {
      if (new Date(gw.ends_at).getTime() > Date.now()) {
        scheduleGiveaway(guild, gw);
      } else {
        void endGiveaway(guild, gw);
      }
    }
  } catch (error) {
    logger.warn('resumeActiveGiveaways:', error);
  }
}
