import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { db, ciszubotSchema, eq, and, desc } from '@ciszunetwork/db';
import { logger } from './logger';
import type { GuildConfig } from './configService';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';

/**
 * Sistema de encuestas (cz!poll):
 * - Votos anónimos o públicos (toggle), actualización en vivo con barras.
 * - Duración opcional (--tiempo 30m) o cierre manual del autor/staff.
 * - Al finalizar muestra el ganador (o empate) y deshabilita los botones.
 * - Límites: máximo de encuestas activas por usuario + cooldown; exclusión por roles.
 */

const timers = new Map<number, NodeJS.Timeout>();

type PollRow = {
  id: number;
  guildId: string;
  channelId: string;
  messageId: string | null;
  authorId: string;
  question: string;
  options: unknown;
  votes: unknown;
  anonymous: boolean;
  endsAt: Date | null;
  ended: boolean;
  winnerIndex: number | null;
  createdAt: Date;
};

function optionsOf(row: { options: unknown }): string[] {
  return Array.isArray(row.options) ? (row.options as string[]) : [];
}

function votesOf(row: { votes: unknown }): Record<string, number> {
  return (row.votes && typeof row.votes === 'object' ? row.votes : {}) as Record<string, number>;
}

/** Barra visual de 10 bloques. */
function bar(count: number, total: number): string {
  const ratio = total > 0 ? count / total : 0;
  const filled = Math.round(ratio * 10);
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)} ${Math.round(ratio * 100)}%`;
}

function countsOf(row: PollRow): number[] {
  const options = optionsOf(row);
  const votes = votesOf(row);
  const counts = options.map(() => 0);
  for (const idx of Object.values(votes)) {
    if (typeof idx === 'number' && idx >= 0 && idx < counts.length) counts[idx] += 1;
  }
  return counts;
}

function computeWinner(counts: number[]): number | null {
  const max = Math.max(...counts);
  if (max <= 0) return null;
  const leaders = counts.map((c, i) => (c === max ? i : -1)).filter((i) => i >= 0);
  return leaders.length === 1 ? leaders[0] : null;
}

function pollEmbed(row: PollRow, tag: string, iconURL?: string | null): EmbedBuilder {
  const options = optionsOf(row);
  const counts = countsOf(row);
  const total = counts.reduce((a, b) => a + b, 0);
  const votes = votesOf(row);
  const votersByOption = options.map(() => [] as string[]);
  if (!row.anonymous) {
    for (const [userId, idx] of Object.entries(votes)) {
      if (typeof idx === 'number' && idx >= 0 && idx < votersByOption.length) votersByOption[idx].push(userId);
    }
  }
  const winner = row.ended ? (row.winnerIndex !== null ? row.winnerIndex : computeWinner(counts)) : null;
  const fields = options.map((opt, i) => {
    const votersLine =
      !row.anonymous && votersByOption[i].length > 0
        ? `\n${votersByOption[i].slice(0, 15).map((u) => `<@${u}>`).join(' ')}${votersByOption[i].length > 15 ? ' …' : ''}`
        : '';
    const trophy = winner === i ? ' 🏆' : '';
    return { name: `${i + 1}. ${opt}${trophy}`, value: `${bar(counts[i], total)} — **${counts[i]}** voto(s)${votersLine}`, inline: false };
  });
  const stateLine = row.ended
    ? winner !== null
      ? `🏆 Ganó **${options[winner]}** con **${counts[winner]}** voto(s).`
      : '🤝 Terminó en **empate** (o sin votos).'
    : row.endsAt
      ? `⏳ Termina <t:${Math.floor(row.endsAt.getTime() / 1000)}:R> · ${row.anonymous ? 'votos anónimos' : 'votos públicos'}`
      : `🔓 Cierre manual · ${row.anonymous ? 'votos anónimos' : 'votos públicos'}`;
  return new EmbedBuilder()
    .setColor(row.ended ? BOT_COLORS.success : BOT_COLORS.primary)
    .setTitle(`📊 Encuesta #${row.id}`)
    .setDescription(`**${row.question}**\n\n${stateLine}\nVotos totales: **${total}**`)
    .addFields(fields)
    .setFooter(BOT_FOOTER(tag, iconURL))
    .setTimestamp(row.createdAt);
}

function pollButtons(id: number, options: string[], ended: boolean): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < options.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    options.slice(i, i + 5).forEach((opt, j) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll_vote:${id}:${i + j}`)
          .setLabel(`${i + j + 1}. ${opt}`.slice(0, 80))
          .setStyle(ButtonStyle.Primary)
          .setDisabled(ended),
      );
    });
    rows.push(row);
  }
  rows.push(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`poll_close:${id}`).setLabel('Cerrar encuesta').setEmoji('🔒').setStyle(ButtonStyle.Secondary).setDisabled(ended),
    ),
  );
  return rows;
}

async function getPoll(id: number): Promise<PollRow | null> {
  const table = ciszubotSchema.polls;
  const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
  return (rows[0] as PollRow | undefined) ?? null;
}

async function editPollMessage(client: Client, row: PollRow, tag = 'Encuesta'): Promise<void> {
  if (!row.messageId) return;
  const channel = (client.channels.cache.get(row.channelId) ?? (await client.channels.fetch(row.channelId).catch(() => null))) as TextChannel | null;
  if (!channel) return;
  await channel.messages
    .fetch(row.messageId)
    .then((m) => m.edit({ embeds: [pollEmbed(row, tag)], components: pollButtons(row.id, optionsOf(row), row.ended) }))
    .catch(() => undefined);
}

/** Crea la encuesta (valida límites, roles y opciones). */
export async function createPoll(
  client: Client,
  channel: TextChannel,
  author: { id: string; tag: string; displayAvatarURL(): string },
  question: string,
  options: string[],
  anonymous: boolean,
  durationMs: number | null,
  cfg: GuildConfig,
  memberRoles: string[],
): Promise<{ ok: boolean; reason?: string; id?: number }> {
  const q = question.trim();
  const opts = options.map((o) => o.trim()).filter(Boolean);
  if (!q) return { ok: false, reason: 'Falta la pregunta.' };
  if (q.length > 250) return { ok: false, reason: 'La pregunta es demasiado larga (máximo 250).' };
  if (opts.length < 2 || opts.length > 10) return { ok: false, reason: 'Necesitas entre 2 y 10 opciones (separa con `|`).' };
  if (opts.some((o) => o.length > 80)) return { ok: false, reason: 'Cada opción debe tener máximo 80 caracteres.' };

  if (!cfg.polls_enabled) return { ok: false, reason: 'Las encuestas están desactivadas en este servidor.' };
  if (cfg.polls_excluded_role_ids.length > 0 && memberRoles.some((r) => cfg.polls_excluded_role_ids.includes(r))) {
    return { ok: false, reason: 'Tienes un rol excluido para crear encuestas.' };
  }

  const table = ciszubotSchema.polls;
  const guildId = channel.guild.id;

  if (cfg.polls_cooldown_minutes > 0) {
    const last = await db
      .select({ createdAt: table.createdAt })
      .from(table)
      .where(and(eq(table.guildId, guildId), eq(table.authorId, author.id)))
      .orderBy(desc(table.createdAt))
      .limit(1);
    const lastAt = last[0]?.createdAt?.getTime() ?? 0;
    const waitMs = cfg.polls_cooldown_minutes * 60_000 - (Date.now() - lastAt);
    if (lastAt && waitMs > 0) {
      return { ok: false, reason: `Debes esperar **${Math.ceil(waitMs / 60_000)} min** antes de crear otra encuesta.` };
    }
  }

  if (cfg.polls_max_active > 0) {
    const active = await db
      .select({ id: table.id })
      .from(table)
      .where(and(eq(table.guildId, guildId), eq(table.authorId, author.id), eq(table.ended, false)));
    if (active.length >= cfg.polls_max_active) {
      return { ok: false, reason: `Ya tienes **${active.length}** encuesta(s) activa(s) (máximo ${cfg.polls_max_active}).` };
    }
  }

  const endsAt = durationMs ? new Date(Date.now() + durationMs) : null;
  const inserted = await db
    .insert(table)
    .values({ guildId, channelId: channel.id, authorId: author.id, question: q, options: opts, anonymous, endsAt, ended: false })
    .returning({ id: table.id });
  const id = inserted[0]?.id;
  if (!id) return { ok: false, reason: 'No se pudo registrar la encuesta.' };

  const fallback: PollRow = {
    id,
    guildId,
    channelId: channel.id,
    messageId: null,
    authorId: author.id,
    question: q,
    options: opts,
    votes: {},
    anonymous,
    endsAt,
    ended: false,
    winnerIndex: null,
    createdAt: new Date(),
  };
  const message = await channel
    .send({ embeds: [pollEmbed(fallback, author.tag, author.displayAvatarURL())], components: pollButtons(id, opts, false) })
    .catch((error) => {
      logger.warn('createPoll send:', error);
      return null;
    });
  if (message) {
    await db.update(table).set({ messageId: message.id }).where(eq(table.id, id));
    if (durationMs) schedulePoll(client, id, endsAt as Date);
  }
  return { ok: true, id };
}

/** Voto (único por usuario; otro clic cambia el voto; el mismo lo retira). */
export async function votePoll(client: Client, id: number, userId: string, index: number): Promise<{ ok: boolean; reason?: string; changed?: boolean }> {
  const row = await getPoll(id);
  if (!row) return { ok: false, reason: 'Esa encuesta ya no existe.' };
  if (row.ended) return { ok: false, reason: 'Esa encuesta ya terminó.' };
  const options = optionsOf(row);
  if (index < 0 || index >= options.length) return { ok: false, reason: 'Opción inválida.' };

  const votes = votesOf(row);
  const prev = votes[userId];
  if (prev === index) delete votes[userId];
  else votes[userId] = index;

  const table = ciszubotSchema.polls;
  await db.update(table).set({ votes }).where(eq(table.id, id));
  const updated = { ...row, votes } as PollRow;
  await editPollMessage(client, updated, 'Votación');
  return { ok: true, changed: prev !== undefined && prev !== index };
}

/** Cierra la encuesta y anuncia el ganador (autor o staff). */
export async function closePoll(
  client: Client,
  id: number,
  requester?: { id: string; staff: boolean },
  guildId?: string,
): Promise<{ ok: boolean; reason?: string; winner?: string | null }> {
  const row = await getPoll(id);
  if (!row) return { ok: false, reason: 'Esa encuesta ya no existe.' };
  if (guildId && row.guildId !== guildId) return { ok: false, reason: 'Esa encuesta no pertenece a este servidor.' };
  if (row.ended) return { ok: false, reason: 'Esa encuesta ya estaba cerrada.' };
  if (requester && requester.id !== row.authorId && !requester.staff) {
    return { ok: false, reason: 'Solo el autor o el staff pueden cerrar la encuesta.' };
  }

  const counts = countsOf(row);
  const winner = computeWinner(counts);
  const options = optionsOf(row);
  const table = ciszubotSchema.polls;
  await db.update(table).set({ ended: true, winnerIndex: winner }).where(eq(table.id, id));
  timers.delete(id);

  const updated = { ...row, ended: true, winnerIndex: winner } as PollRow;
  await editPollMessage(client, updated, 'Encuesta finalizada');

  const channel = (client.channels.cache.get(row.channelId) ?? (await client.channels.fetch(row.channelId).catch(() => null))) as TextChannel | null;
  if (channel) {
    const text =
      winner !== null
        ? `🏆 **Encuesta #${id}** — Ganó **${options[winner]}** con **${counts[winner]}** voto(s).`
        : `🤝 **Encuesta #${id}** — Terminó en **empate** (o sin votos).`;
    await channel.send({ content: text }).catch(() => undefined);
  }
  return { ok: true, winner: winner !== null ? options[winner] : null };
}

/** Programa el cierre por tiempo. */
export function schedulePoll(client: Client, id: number, endsAt: Date): void {
  const delay = Math.max(0, endsAt.getTime() - Date.now());
  const existing = timers.get(id);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    void closePoll(client, id).catch((error) => logger.warn('closePoll timer:', error));
  }, delay);
  timers.set(id, timer);
}

/** Al arrancar: reanuda encuestas con tiempo pendiente y cierra las vencidas. */
export async function resumePolls(client: Client): Promise<void> {
  try {
    const table = ciszubotSchema.polls;
    const rows = await db
      .select({ id: table.id, endsAt: table.endsAt })
      .from(table)
      .where(eq(table.ended, false));
    for (const row of rows) {
      if (!row.endsAt) continue;
      if (row.endsAt.getTime() <= Date.now()) {
        void closePoll(client, row.id).catch(() => undefined);
      } else {
        schedulePoll(client, row.id, row.endsAt);
      }
    }
    logger.info(`Encuestas reanudadas: ${rows.length}`);
  } catch (error) {
    logger.warn('resumePolls:', error);
  }
}
