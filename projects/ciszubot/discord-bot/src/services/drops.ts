import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { getGuildConfig } from './configService';
import { randomBetween } from './economy';
import { addMoney } from './economy';
import { isPremiumGuild } from './featureFlags';
import { logger } from './logger';

/**
 * Sistema de drops: cada X minutos cae dinero en un canal con un botón para
 * reclamarlo (el primero que pulsa se lo lleva). Free: máx. 3/día por
 * servidor; Premium: ilimitados. El spawner revisa cada minuto.
 */

interface ActiveDrop {
  guildId: string;
  messageId: string;
  channelId: string;
  amount: number;
  claimedBy: string | null;
  timer: ReturnType<typeof setTimeout>;
}

const activeDrops = new Map<string, ActiveDrop>();
const dailyCount = new Map<string, { day: string; count: number }>();
const nextSpawn = new Map<string, number>();
const FREE_DAILY_LIMIT = 3;
const DROP_LIFETIME_MS = 90_000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDropStats(guildId: string): { day: string; count: number } {
  const stat = dailyCount.get(guildId);
  return stat && stat.day === today() ? stat : { day: today(), count: 0 };
}

export interface ClaimResult {
  ok: boolean;
  amount?: number;
  reason?: string;
}

/** Reclama el drop activo de un servidor (botón). */
export async function tryClaimDrop(guildId: string, messageId: string, userId: string, memberRoles: string[]): Promise<ClaimResult> {
  const drop = activeDrops.get(guildId);
  if (!drop || drop.messageId !== messageId) return { ok: false, reason: 'Este drop ya expiró.' };
  if (drop.claimedBy) return { ok: false, reason: 'Alguien lo reclamó antes que tú. ¡Suerte la próxima!' };

  const cfg = await getGuildConfig(guildId);
  if (cfg.drops.excluded_roles.some((roleId) => memberRoles.includes(roleId))) {
    return { ok: false, reason: 'Tu rol está excluido de reclamar drops en este servidor.' };
  }

  drop.claimedBy = userId;
  await addMoney(userId, guildId, drop.amount, 'drop', 'Drop reclamado');
  return { ok: true, amount: drop.amount };
}

function pickChannel(client: Client, guildId: string, configured: string[]): TextChannel | null {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return null;
  const me = guild.members.me;
  const usable = (channel: unknown): channel is TextChannel => {
    const c = channel as TextChannel;
    return Boolean(c?.isTextBased?.() && me && c.permissionsFor(me)?.has('SendMessages'));
  };
  if (configured.length > 0) {
    const candidates = configured
      .map((id) => guild.channels.cache.get(id))
      .filter((c) => c && usable(c));
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)] as TextChannel;
  }
  const all = guild.channels.cache.filter((c) => usable(c));
  if (all.size === 0) return null;
  return all.random() as TextChannel;
}

async function spawnDrop(client: Client, guildId: string): Promise<void> {
  const cfg = await getGuildConfig(guildId);
  const channel = pickChannel(client, guildId, cfg.drops.channels);
  if (!channel) return;

  const amount = randomBetween(Math.min(cfg.drops.min, cfg.drops.max), Math.max(cfg.drops.min, cfg.drops.max));
  const text =
    cfg.drops.message ??
    `💎 ¡Ha caído un drop de **${amount.toLocaleString('es-ES')} ${cfg.coin_emoji}**! El primero que pulse el botón se lo lleva.`;

  const embed = new EmbedBuilder()
    .setColor('#fbbf24')
    .setTitle('💎 ¡DROP!')
    .setDescription(text)
    .setFooter({ text: 'CiszuBot • Drops' })
    .setTimestamp();

  const sent = await channel
    .send({
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [{ type: 2, style: 1, label: '¡Reclamar!', custom_id: 'drop_claim', emoji: { name: '💎' } }],
        },
      ],
    })
    .catch((error) => {
      logger.warn('No se pudo enviar el drop:', error);
      return null;
    });
  if (!sent) return;

  const timer = setTimeout(() => {
    const drop = activeDrops.get(guildId);
    if (drop?.messageId === sent.id && !drop.claimedBy) {
      activeDrops.delete(guildId);
      void sent
        .edit({
          embeds: [
            new EmbedBuilder()
              .setColor('#6b7280')
              .setTitle('💎 Drop expirado')
              .setDescription('Nadie lo reclamó a tiempo. ¡Suerte la próxima!'),
          ],
          components: [],
        })
        .catch(() => undefined);
    }
  }, DROP_LIFETIME_MS);

  activeDrops.set(guildId, {
    guildId,
    messageId: sent.id,
    channelId: channel.id,
    amount,
    claimedBy: null,
    timer,
  });
}

/** Marca el drop como completado (tras reclamarse) y programa su limpieza. */
export function completeDrop(guildId: string): void {
  const drop = activeDrops.get(guildId);
  if (!drop) return;
  clearTimeout(drop.timer);
  setTimeout(() => activeDrops.delete(guildId), 15_000);
}

async function tick(client: Client): Promise<void> {
  for (const guild of client.guilds.cache.values()) {
    try {
      const cfg = await getGuildConfig(guild.id);
      if (!cfg.drops.enabled) continue;
      if (activeDrops.has(guild.id)) continue;
      const now = Date.now();
      const due = nextSpawn.get(guild.id) ?? now;
      if (now < due) continue;

      const min = Math.max(5, cfg.drops.interval_min);
      const max = Math.max(min + 5, cfg.drops.interval_max);
      nextSpawn.set(guild.id, now + randomBetween(min, max) * 60_000);

      const premium = await isPremiumGuild(guild.id);
      const stat = getDropStats(guild.id);
      if (!premium && stat.count >= FREE_DAILY_LIMIT) continue;

      dailyCount.set(guild.id, { day: today(), count: stat.count + 1 });
      await spawnDrop(client, guild.id);
    } catch (error) {
      logger.warn('tick de drops:', error);
    }
  }
}

/** Arranca el spawner de drops (revisa cada minuto). */
export function scheduleDrops(client: Client): void {
  setInterval(() => void tick(client), 60_000);
}
