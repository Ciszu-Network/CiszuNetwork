import { EmbedBuilder, Guild, GuildMember, TextChannel } from 'discord.js';
import { db, ciszubotSchema, eq, and, sql } from '@ciszunetwork/db';
import { logger } from './logger';

/**
 * Sistema de sorteos (giveaways) con manager:
 *  · Botón de ingreso con checks (roles requeridos, vetados, límites,
 *    mensajes mínimos) y bonus de probabilidad por roles (multiplicadores).
 *  · Estados: running | paused | cancelled | ended (colores/iconos en el panel).
 *  · Pausa extiende la fecha al reanudar; cancelar desactiva el botón;
 *    relanzar elige un nuevo ganador y lo registra.
 *  · Contador de mensajes por miembro (requisito opcional) con flush diferido.
 */

const timers = new Map<string, NodeJS.Timeout>();

export interface GiveawayData {
  id: string;
  guild_id: string;
  channel_id: string;
  message_id: string;
  prize: string;
  winners: number;
  ends_at: string;
  hosted_by: string;
}

export interface CreateOptions {
  prize: string;
  winners: number;
  durationMs: number;
  host: { id: string; tag: string; displayAvatarURL(opts?: { size?: number }): string };
  requiredRoleIds?: string[];
  grantRoleIds?: string[];
  maxParticipants?: number;
  requiredMessages?: number;
  bonusRoles?: Array<{ role_id: string; multiplier: number }>;
  source?: 'command' | 'dashboard' | 'devcon';
}

function msUntil(iso: string): number {
  return Math.max(0, new Date(iso).getTime() - Date.now());
}

function buttonRow(giveawayId: string, disabled = false) {
  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 1,
          label: 'Participar',
          custom_id: `giveaway_join:${giveawayId}`,
          emoji: { name: '🎉' },
          disabled,
        },
      ],
    },
  ];
}

function baseEmbed(prize: string, opts: CreateOptions, endsAt: Date, status = 'running') {
  const req = [
    opts.requiredRoleIds?.length ? `Roles requeridos: ${opts.requiredRoleIds.map((r) => `<@&${r}>`).join(', ')}` : null,
    opts.maxParticipants ? `Máximo de participantes: **${opts.maxParticipants}**` : null,
    opts.requiredMessages ? `Mensajes mínimos: **${opts.requiredMessages}**` : null,
    opts.bonusRoles?.length ? `Bonus de probabilidad: ${opts.bonusRoles.map((b) => `<@&${b.role_id}> ×${b.multiplier}`).join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('\n');
  return new EmbedBuilder()
    .setTitle(`🎉 Giveaway: ${prize}`)
    .setDescription(
      `Pulsa el botón **Participar** para entrar.\n\n**Ganadores:** ${opts.winners}\n**Termina:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>` +
        (req ? `\n\n${req}` : ''),
    )
    .setColor(status === 'cancelled' ? '#ef4444' : status === 'paused' ? '#f59e0b' : '#ff33cc')
    .setFooter({ text: `Hosteado por ${opts.host.tag} • ${opts.source ?? 'command'}`, iconURL: opts.host.displayAvatarURL() })
    .setTimestamp();
}

export function scheduleGiveaway(guild: Guild, data: GiveawayData): void {
  const existing = timers.get(data.id);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    void endGiveaway(guild, data);
  }, msUntil(data.ends_at) + 500);
  timers.set(data.id, timer);
}

async function getGiveaway(id: string) {
  const giveaways = ciszubotSchema.giveaways;
  const rows = await db.select().from(giveaways).where(eq(giveaways.id, id)).limit(1);
  return rows[0] ?? null;
}

async function getParticipants(giveawayId: string) {
  const table = ciszubotSchema.giveawayParticipants;
  return db.select().from(table).where(eq(table.giveawayId, giveawayId)).limit(500);
}

async function isBanned(giveawayId: string, userId: string): Promise<boolean> {
  const table = ciszubotSchema.giveawayBans;
  const rows = await db
    .select({ userId: table.userId })
    .from(table)
    .where(and(eq(table.giveawayId, giveawayId), eq(table.userId, userId)))
    .limit(1);
  return Boolean(rows[0]);
}

/** Contador de mensajes por miembro (in-memory + flush cada 30s). */
const msgCounts = new Map<string, number>();
let flushTimer: NodeJS.Timeout | null = null;

export function bumpMemberMessages(guildId: string, userId: string): void {
  const key = `${guildId}:${userId}`;
  msgCounts.set(key, (msgCounts.get(key) ?? 0) + 1);
  if (!flushTimer) {
    flushTimer = setInterval(() => void flushMemberMessages(), 30_000);
  }
}

async function flushMemberMessages(): Promise<void> {
  if (msgCounts.size === 0) return;
  const batch = [...msgCounts.entries()];
  msgCounts.clear();
  try {
    const table = ciszubotSchema.memberMessages;
    for (const [key, inc] of batch) {
      const [guildId, userId] = key.split(':');
      await db
        .insert(table)
        .values({ guildId, userId, count: inc })
        .onConflictDoUpdate({
          target: [table.guildId, table.userId],
          set: { count: sql`${table.count} + ${inc}`, updatedAt: sql`now()` },
        });
    }
  } catch (error) {
    logger.warn('flushMemberMessages:', error);
  }
}

export async function getMemberMessageCount(guildId: string, userId: string): Promise<number> {
  try {
    const table = ciszubotSchema.memberMessages;
    const rows = await db
      .select({ count: table.count })
      .from(table)
      .where(and(eq(table.guildId, guildId), eq(table.userId, userId)))
      .limit(1);
    return Number(rows[0]?.count ?? 0) + (msgCounts.get(`${guildId}:${userId}`) ?? 0);
  } catch {
    return 0;
  }
}

export interface JoinResult {
  ok: boolean;
  reason?: string;
  entries?: number;
}

/** Ingreso al sorteo (botón): valida estado, vetados, roles, límites y mensajes. */
export async function joinGiveaway(guild: Guild, giveawayId: string, member: GuildMember): Promise<JoinResult> {
  const gw = await getGiveaway(giveawayId);
  if (!gw) return { ok: false, reason: 'Este sorteo ya no existe.' };
  if (gw.status === 'cancelled') return { ok: false, reason: 'Este sorteo fue cancelado.' };
  if (gw.status === 'paused') return { ok: false, reason: 'El sorteo está pausado. Vuelve cuando se reanude.' };
  if (gw.status === 'ended' || gw.ended) return { ok: false, reason: 'Este sorteo ya terminó.' };

  if (await isBanned(giveawayId, member.id)) return { ok: false, reason: 'Estás vetado de este sorteo.' };

  const requiredRoles = Array.isArray(gw.requiredRoleIds) ? (gw.requiredRoleIds as string[]) : [];
  const missing = requiredRoles.filter((r) => !member.roles.cache.has(r));
  if (missing.length > 0) {
    return { ok: false, reason: `Te faltan roles requeridos: ${missing.map((r) => `<@&${r}>`).join(', ')}` };
  }

  const participants = await getParticipants(giveawayId);
  const already = participants.find((p) => p.userId === member.id);
  if (already) return { ok: false, reason: `Ya estás participando (${already.entries} entrada(s)). ¡Suerte!` };
  if (gw.maxParticipants > 0 && participants.length >= gw.maxParticipants) {
    return { ok: false, reason: 'El sorteo alcanzó el máximo de participantes.' };
  }

  if (gw.requiredMessages > 0) {
    const count = await getMemberMessageCount(guild.id, member.id);
    if (count < gw.requiredMessages) {
      return { ok: false, reason: `Necesitas al menos **${gw.requiredMessages}** mensajes en el servidor (tienes ${count}).` };
    }
  }

  // Bonus por roles: multiplicadores en cadena (cap 100 entradas).
  const bonus = Array.isArray(gw.bonusRoles) ? (gw.bonusRoles as Array<{ role_id: string; multiplier: number }>) : [];
  let entries = 1;
  for (const b of bonus) {
    if (member.roles.cache.has(b.role_id)) entries *= Math.max(1, Number(b.multiplier) || 1);
  }
  entries = Math.min(100, entries);

  try {
    const table = ciszubotSchema.giveawayParticipants;
    await db.insert(table).values({ giveawayId, userId: member.id, entries });
    return { ok: true, entries };
  } catch (error) {
    logger.warn('joinGiveaway insert:', error);
    return { ok: false, reason: 'No se pudo registrar tu participación. Inténtalo de nuevo.' };
  }
}

/** Sorteo ponderado por entradas (excluye vetados y, si se pide, a `exclude`). */
async function pickWinners(guildId: string, giveawayId: string, count: number, exclude: string[] = []): Promise<string[]> {
  const participants = (await getParticipants(giveawayId)).filter((p) => !exclude.includes(p.userId));
  const pool: string[] = [];
  for (const p of participants) {
    for (let i = 0; i < Math.max(1, p.entries); i++) pool.push(p.userId);
  }
  const bans = ciszubotSchema.giveawayBans;
  const bannedRows = await db.select({ userId: bans.userId }).from(bans).where(eq(bans.giveawayId, giveawayId)).limit(500);
  const banned = new Set(bannedRows.map((b) => b.userId));

  const winners: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    let pick = pool[Math.floor(Math.random() * pool.length)];
    let guard = 0;
    while (banned.has(pick) && guard < 50) {
      pick = pool[Math.floor(Math.random() * pool.length)];
      guard++;
    }
    winners.push(pick);
    for (let j = pool.length - 1; j >= 0; j--) if (pool[j] === pick) pool.splice(j, 1);
  }
  return winners;
}

export async function endGiveaway(guild: Guild, data: { id: string }): Promise<void> {
  timers.delete(data.id);
  try {
    const gw = await getGiveaway(data.id);
    if (!gw || gw.ended || gw.status === 'cancelled') return;

    const winners = await pickWinners(guild.id, gw.id, gw.winners);
    const giveaways = ciszubotSchema.giveaways;
    await db
      .update(giveaways)
      .set({ ended: true, status: 'ended', winnerIds: winners })
      .where(eq(giveaways.id, gw.id));

    // Roles al ganador (si la categoría los define).
    const grant = Array.isArray(gw.grantRoleIds) ? (gw.grantRoleIds as string[]) : [];
    if (grant.length > 0) {
      for (const winnerId of winners) {
        const member = await guild.members.fetch(winnerId).catch(() => null);
        if (!member) continue;
        for (const roleId of grant) {
          const role = guild.roles.cache.get(roleId);
          if (role && member.manageable) await member.roles.add(role).catch(() => undefined);
        }
      }
    }

    const channel = guild.channels.cache.get(gw.channelId) as TextChannel | undefined;
    if (channel) {
      try {
        const message = await channel.messages.fetch(gw.messageId);
        await message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(`🎉 Giveaway finalizado: ${gw.prize}`)
              .setColor('#6b7280')
              .setDescription(
                winners.length > 0
                  ? `Ganadores: ${winners.map((w) => `<@${w}>`).join(', ')}`
                  : 'No hubo participantes. 😢',
              )
              .setFooter({ text: 'CiszuBot • Giveaways' })
              .setTimestamp(),
          ],
          components: buttonRow(gw.id, true),
        });
      } catch {
        /* mensaje borrado */
      }
      await channel
        .send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`🎉 Giveaway finalizado: ${gw.prize}`)
              .setColor('#ff33cc')
              .setDescription(winners.length > 0 ? `Ganadores: ${winners.map((w) => `<@${w}>`).join(', ')}` : 'No hubo participantes. 😢')
              .setFooter({ text: 'CiszuBot • Giveaways' })
              .setTimestamp(),
          ],
        })
        .catch(() => undefined);
    }
  } catch (error) {
    logger.warn('endGiveaway:', error);
  }
}

/** Crea el sorteo (botón) y programa su fin. */
export async function createGiveaway(guild: Guild, channel: TextChannel, opts: CreateOptions): Promise<{ ok: boolean; id?: string }> {
  const endsAt = new Date(Date.now() + opts.durationMs);
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const msg = await channel.send({ embeds: [baseEmbed(opts.prize, opts, endsAt)], components: buttonRow(id) as never });

  try {
    const giveaways = ciszubotSchema.giveaways;
    await db.insert(giveaways).values({
      id,
      guildId: guild.id,
      channelId: channel.id,
      messageId: msg.id,
      prize: opts.prize,
      winners: opts.winners,
      endsAt,
      hostedBy: opts.host.id,
      status: 'running',
      requiredRoleIds: opts.requiredRoleIds ?? [],
      grantRoleIds: opts.grantRoleIds ?? [],
      maxParticipants: opts.maxParticipants ?? 0,
      requiredMessages: opts.requiredMessages ?? 0,
      bonusRoles: opts.bonusRoles ?? [],
      createdSource: opts.source ?? 'command',
    });
  } catch (error) {
    logger.warn('createGiveaway insert:', error);
  }
  scheduleGiveaway(guild, { id, guild_id: guild.id, channel_id: channel.id, message_id: msg.id, prize: opts.prize, winners: opts.winners, ends_at: endsAt.toISOString(), hosted_by: opts.host.id });
  return { ok: true, id };
}

/** Compatibilidad con el comando clásico (reacciones → ahora botón). */
export async function startGiveaway(
  guild: Guild,
  channel: TextChannel,
  prize: string,
  winners: number,
  durationMs: number,
  host: { id: string; tag: string; displayAvatarURL(opts?: { size?: number }): string },
): Promise<{ ok: boolean; message?: string }> {
  const res = await createGiveaway(guild, channel, { prize, winners, durationMs, host });
  return { ok: res.ok };
}

/** Pausa: congela el sorteo (los botones rechazan ingresos). */
export async function pauseGiveaway(guild: Guild, id: string): Promise<boolean> {
  const gw = await getGiveaway(id);
  if (!gw || gw.status !== 'running') return false;
  const giveaways = ciszubotSchema.giveaways;
  await db.update(giveaways).set({ status: 'paused', pausedAt: new Date() }).where(eq(giveaways.id, id));
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
  const channel = guild.channels.cache.get(gw.channelId) as TextChannel | undefined;
  if (channel) {
    await channel.messages
      .fetch(gw.messageId)
      .then((m) =>
        m.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(`⏸️ Giveaway pausado: ${gw.prize}`)
              .setColor('#f59e0b')
              .setDescription('El sorteo está **pausado**. Se reanudará pronto.')
              .setFooter({ text: 'CiszuBot • Giveaways' })
              .setTimestamp(),
          ],
          components: buttonRow(id),
        }),
      )
      .catch(() => undefined);
  }
  return true;
}

/** Reanuda y EXTIENDE la fecha por el tiempo pausado. */
export async function resumeGiveaway(guild: Guild, id: string): Promise<boolean> {
  const gw = await getGiveaway(id);
  if (!gw || gw.status !== 'paused') return false;
  const pausedMs = gw.pausedAt ? Date.now() - new Date(gw.pausedAt).getTime() : 0;
  const newEnds = new Date(new Date(gw.endsAt).getTime() + pausedMs);
  const giveaways = ciszubotSchema.giveaways;
  await db.update(giveaways).set({ status: 'running', pausedAt: null, endsAt: newEnds }).where(eq(giveaways.id, id));
  scheduleGiveaway(guild, { id, guild_id: guild.id, channel_id: gw.channelId, message_id: gw.messageId, prize: gw.prize, winners: gw.winners, ends_at: newEnds.toISOString(), hosted_by: gw.hostedBy });
  return true;
}

/** Cancela el sorteo (botón desactivado, sin ganadores). */
export async function cancelGiveaway(guild: Guild, id: string): Promise<boolean> {
  const gw = await getGiveaway(id);
  if (!gw || gw.status === 'cancelled' || gw.ended) return false;
  const giveaways = ciszubotSchema.giveaways;
  await db.update(giveaways).set({ status: 'cancelled', cancelledAt: new Date(), ended: true }).where(eq(giveaways.id, id));
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
  const channel = guild.channels.cache.get(gw.channelId) as TextChannel | undefined;
  if (channel) {
    await channel.messages
      .fetch(gw.messageId)
      .then((m) =>
        m.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ Giveaway cancelado: ${gw.prize}`)
              .setColor('#ef4444')
              .setDescription('Este sorteo fue cancelado por el staff.')
              .setFooter({ text: 'CiszuBot • Giveaways' })
              .setTimestamp(),
          ],
          components: buttonRow(id, true),
        }),
      )
      .catch(() => undefined);
  }
  return true;
}

/** Relanza un ganador (sorteos terminados): excluye a los ganadores actuales. */
export async function rerollGiveaway(guild: Guild, id: string): Promise<string | null> {
  const gw = await getGiveaway(id);
  if (!gw) return null;
  const current = Array.isArray(gw.winnerIds) ? (gw.winnerIds as string[]) : [];
  const [winner] = await pickWinners(guild.id, id, 1, current);
  if (!winner) return null;
  const giveaways = ciszubotSchema.giveaways;
  await db.update(giveaways).set({ winnerIds: [...current, winner] }).where(eq(giveaways.id, id));

  const grant = Array.isArray(gw.grantRoleIds) ? (gw.grantRoleIds as string[]) : [];
  if (grant.length > 0) {
    const member = await guild.members.fetch(winner).catch(() => null);
    if (member) {
      for (const roleId of grant) {
        const role = guild.roles.cache.get(roleId);
        if (role && member.manageable) await member.roles.add(role).catch(() => undefined);
      }
    }
  }

  const channel = guild.channels.cache.get(gw.channelId) as TextChannel | undefined;
  if (channel) {
    await channel
      .send({
        embeds: [
          new EmbedBuilder()
            .setTitle('🔄 ¡Nuevo ganador!')
            .setColor('#22c55e')
            .setDescription(`El nuevo ganador de **${gw.prize}** es <@${winner}> 🎉`)
            .setFooter({ text: 'CiszuBot • Giveaways' })
            .setTimestamp(),
        ],
      })
      .catch(() => undefined);
  }
  return winner;
}

/** Quita a un participante / lo veta. */
export async function removeParticipant(id: string, userId: string): Promise<void> {
  const table = ciszubotSchema.giveawayParticipants;
  await db.delete(table).where(and(eq(table.giveawayId, id), eq(table.userId, userId)));
}

export async function banParticipant(id: string, userId: string): Promise<void> {
  await removeParticipant(id, userId);
  const bans = ciszubotSchema.giveawayBans;
  await db.insert(bans).values({ giveawayId: id, userId }).onConflictDoNothing();
}

export async function resumeActiveGiveaways(guild: Guild): Promise<void> {
  try {
    const giveaways = ciszubotSchema.giveaways;
    const rows = await db
      .select()
      .from(giveaways)
      .where(and(eq(giveaways.guildId, guild.id), eq(giveaways.ended, false)));
    for (const gw of rows) {
      if (gw.status !== 'running') continue; // pausados/cancelados: sin timer
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
