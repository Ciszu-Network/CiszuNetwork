import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { getGuildConfig, DropEntry } from './configService';
import { randomBetween } from './economy';
import { addMoney } from './economy';
import { isPremiumGuild } from './featureFlags';
import { logger } from './logger';

/**
 * Sistema de drops como LISTA: cada servidor puede configurar varios drops
 * (free: hasta 3 · premium: ilimitados), cada uno con su id, nombre, canales,
 * cantidades, intervalos, mensaje y roles excluidos. El spawner revisa cada
 * minuto y lanza el drop que toque (uno activo a la vez por servidor).
 */

interface ActiveDrop {
  guildId: string;
  dropId: string;
  messageId: string;
  channelId: string;
  amount: number;
  claimedBy: string | null;
  timer: ReturnType<typeof setTimeout>;
}

const activeDrops = new Map<string, ActiveDrop>();
const nextSpawn = new Map<string, number>();
const DROP_LIFETIME_MS = 90_000;
export const FREE_DROP_LIMIT = 3;

/** Drops activos que corren según el plan (free: primeros 3). */
export async function activeDropsFor(guildId: string, list: DropEntry[]): Promise<DropEntry[]> {
  const enabled = list.filter((d) => d.enabled);
  const premium = await isPremiumGuild(guildId);
  return premium ? enabled : enabled.slice(0, FREE_DROP_LIMIT);
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
  const entry = cfg.drops.list.find((d) => d.id === drop.dropId);
  if (entry && entry.excluded_roles.some((roleId) => memberRoles.includes(roleId))) {
    return { ok: false, reason: 'Tu rol está excluido de reclamar drops en este servidor.' };
  }

  drop.claimedBy = userId;
  await addMoney(userId, guildId, drop.amount, 'drop', `Drop reclamado (${drop.dropId})`);
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
    const candidates = configured.map((id) => guild.channels.cache.get(id)).filter((c) => c && usable(c));
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)] as TextChannel;
  }
  const all = guild.channels.cache.filter((c) => usable(c));
  if (all.size === 0) return null;
  return all.random() as TextChannel;
}

async function spawnDrop(client: Client, guildId: string, entry: DropEntry, coinEmoji: string): Promise<void> {
  const channel = pickChannel(client, guildId, entry.channels);
  if (!channel) return;

  const amount = randomBetween(Math.min(entry.min, entry.max), Math.max(entry.min, entry.max));
  const text =
    entry.message ??
    `💎 ¡Ha caído un drop de **${amount.toLocaleString('es-ES')} ${coinEmoji}**! El primero que pulse el botón se lo lleva.`;

  const embed = new EmbedBuilder()
    .setColor('#fbbf24')
    .setTitle(`💎 ¡DROP!${entry.name ? ` — ${entry.name}` : ''}`)
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
    dropId: entry.id,
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
      const running = await activeDropsFor(guild.id, cfg.drops.list);
      if (running.length === 0) continue;
      if (activeDrops.has(guild.id)) continue;

      const now = Date.now();
      for (const entry of running) {
        const key = `${guild.id}:${entry.id}`;
        const due = nextSpawn.get(key) ?? now;
        if (now < due) continue;

        const min = Math.max(5, entry.interval_min);
        const max = Math.max(min + 5, entry.interval_max);
        nextSpawn.set(key, now + randomBetween(min, max) * 60_000);
        await spawnDrop(client, guild.id, entry, cfg.coin_emoji);
        break; // un drop activo a la vez por servidor
      }
    } catch (error) {
      logger.warn('tick de drops:', error);
    }
  }
}

/** Arranca el spawner de drops (revisa cada minuto). */
export function scheduleDrops(client: Client): void {
  setInterval(() => void tick(client), 60_000);
}
