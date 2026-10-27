import { Client, EmbedBuilder, Message, TextChannel } from 'discord.js';
import { db, ciszubotSchema, eq, and, desc, sql } from '@ciszunetwork/db';
import { logger } from './logger';
import type { GuildConfig } from './configService';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { TRIVIA_BANK, TRIVIA_CATEGORIES, normalizeAnswer, type TriviaQuestion } from '../config/triviaBank';

/**
 * Sistema de trivia (cz!trivia):
 * - El bot publica una pregunta; el primero en responder correctamente gana 1 punto.
 * - Con tiempo (config) la pregunta expira; sin tiempo espera indefinidamente.
 * - Dificultad: fácil/media/difícil/mixta (config o argumento).
 * - Preguntas personalizadas por servidor (cz!trivia add).
 * - Leaderboard (cz!trivia top) y autorreclamación de recompensas por puntos
 *   (roles automáticos configurados en trivia_rewards).
 */

interface Session {
  guildId: string;
  channelId: string;
  question: TriviaQuestion;
  messageId: string | null;
  timer: NodeJS.Timeout | null;
  startedAt: number;
}

const sessions = new Map<string, Session>();

export function hasActiveSession(channelId: string): boolean {
  return sessions.has(channelId);
}

async function pickQuestion(
  guildId: string,
  difficulty: string,
  categories: string[],
): Promise<TriviaQuestion | null> {
  const want = difficulty === 'mixed' ? null : difficulty;
  const wantedCategories = categories.length > 0 ? new Set(categories) : null;
  // Personalizadas primero (50%), luego el banco integrado.
  try {
    const table = ciszubotSchema.triviaQuestions;
    const rows = await db
      .select({ question: table.question, answers: table.answers, difficulty: table.difficulty })
      .from(table)
      .where(want ? and(eq(table.guildId, guildId), eq(table.difficulty, want)) : eq(table.guildId, guildId));
    if (rows.length > 0 && Math.random() < 0.5 && (!wantedCategories || wantedCategories.has('general'))) {
      const row = rows[Math.floor(Math.random() * rows.length)];
      const answers = Array.isArray(row.answers) ? (row.answers as string[]) : [];
      if (answers.length > 0) {
        return {
          question: row.question,
          answers,
          difficulty: (row.difficulty as TriviaQuestion['difficulty']) ?? 'medium',
          category: 'general',
        };
      }
    }
  } catch (error) {
    logger.warn('pickQuestion custom:', error);
  }
  const pool = TRIVIA_BANK.filter(
    (q) => (!want || q.difficulty === want) && (!wantedCategories || wantedCategories.has(q.category)),
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

const DIFF_LABEL: Record<string, string> = { easy: '🟢 Fácil', medium: '🟡 Media', hard: '🔴 Difícil' };

/** Inicia una trivia en el canal (una sesión por canal). */
export async function startTrivia(
  client: Client,
  channel: TextChannel,
  cfg: GuildConfig,
  difficultyOverride?: string,
  starterTag = 'Trivia',
): Promise<{ ok: boolean; reason?: string }> {
  if (!cfg.trivia_enabled) return { ok: false, reason: 'La trivia está desactivada en este servidor.' };
  if (sessions.has(channel.id)) return { ok: false, reason: 'Ya hay una trivia activa en este canal. Responde o espera a que termine.' };

  const difficulty = difficultyOverride ?? cfg.trivia_difficulty;
  const question = await pickQuestion(channel.guild.id, difficulty, cfg.trivia_categories);
  if (!question) return { ok: false, reason: 'No hay preguntas para esa dificultad y categorías.' };

  const categoryLabel = TRIVIA_CATEGORIES.find((category) => category.id === question.category)?.label ?? question.category;
  const seconds = cfg.trivia_timed ? Math.max(10, cfg.trivia_time_seconds) : null;
  const embed = new EmbedBuilder()
    .setColor(BOT_COLORS.primary)
    .setTitle('❓ ¡Trivia!')
    .setDescription(
      `**${question.question}**\n\n` +
        `Categoría: **${categoryLabel}**\n` +
        `Dificultad: ${DIFF_LABEL[question.difficulty] ?? question.difficulty}\n` +
        (seconds ? `⏱️ Tienes **${seconds}s** para responder en este canal.` : '📝 Responde en este canal cuando quieras.'),
    )
    .setFooter(BOT_FOOTER(starterTag, client.user?.displayAvatarURL()))
    .setTimestamp();
  const message = await channel.send({ embeds: [embed] }).catch(() => null);
  const session: Session = {
    guildId: channel.guild.id,
    channelId: channel.id,
    question,
    messageId: message?.id ?? null,
    timer: null,
    startedAt: Date.now(),
  };
  if (seconds) {
    session.timer = setTimeout(() => {
      void timeoutTrivia(client, channel.id, cfg).catch((error) => logger.warn('timeoutTrivia:', error));
    }, seconds * 1000);
  }
  sessions.set(channel.id, session);
  return { ok: true };
}

/** Procesa un mensaje del canal: ¿es la respuesta correcta? */
export async function handleTriviaMessage(client: Client, message: Message, cfg: GuildConfig): Promise<boolean> {
  const session = sessions.get(message.channelId);
  if (!session || !message.guild || message.author.bot) return false;
  const prefix = cfg.prefix ?? 'cz!';
  if (message.content.startsWith(prefix) || message.content.startsWith(`<@${client.user?.id}>`)) return false;

  const normalized = normalizeAnswer(message.content);
  if (!normalized) return false;
  const hit = session.question.answers.some((a) => normalizeAnswer(a) === normalized);
  if (!hit) return false;

  // Correcto: cierra la sesión y suma puntos.
  if (session.timer) clearTimeout(session.timer);
  sessions.delete(message.channelId);

  const total = await addPoints(message.guild.id, message.author.id);
  const embed = new EmbedBuilder()
    .setColor(BOT_COLORS.success)
    .setTitle('✅ ¡Respuesta correcta!')
    .setDescription(
      `**${message.author.tag}** respondió **${session.question.question.replace(/\?$/, '')} → ${session.question.answers[0]}**.\n\n` +
        `Puntos totales: **${total}**`,
    )
    .setFooter(BOT_FOOTER(message.author.tag, message.author.displayAvatarURL()))
    .setTimestamp();
  await message.reply({ embeds: [embed] }).catch(() => undefined);

  // Autorreclamación de recompensas por umbral de puntos.
  await grantRewards(message, cfg, total);
  return true;
}

/** Termina por tiempo agotado (revela la respuesta). */
export async function timeoutTrivia(client: Client, channelId: string, cfg: GuildConfig): Promise<void> {
  const session = sessions.get(channelId);
  if (!session) return;
  sessions.delete(channelId);
  const channel = (client.channels.cache.get(channelId) ?? (await client.channels.fetch(channelId).catch(() => null))) as TextChannel | null;
  if (!channel) return;
  await channel
    .send({
      embeds: [
        new EmbedBuilder()
          .setColor(BOT_COLORS.danger)
          .setTitle('⏱️ ¡Se acabó el tiempo!')
          .setDescription(`Nadie respondió. La respuesta era **${session.question.answers[0]}**.`)
          .setFooter(BOT_FOOTER('Trivia', client.user?.displayAvatarURL())),
      ],
    })
    .catch(() => undefined);
}

/** Detiene la trivia activa (staff). */
export async function stopTrivia(client: Client, channelId: string): Promise<{ ok: boolean; reason?: string }> {
  const session = sessions.get(channelId);
  if (!session) return { ok: false, reason: 'No hay trivia activa en este canal.' };
  if (session.timer) clearTimeout(session.timer);
  sessions.delete(channelId);
  const channel = (client.channels.cache.get(channelId) ?? (await client.channels.fetch(channelId).catch(() => null))) as TextChannel | null;
  if (channel) {
    await channel
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor(BOT_COLORS.secondary)
            .setTitle('🛑 Trivia detenida')
            .setDescription(`La respuesta era **${session.question.answers[0]}**.`)
            .setFooter(BOT_FOOTER('Trivia', client.user?.displayAvatarURL())),
        ],
      })
      .catch(() => undefined);
  }
  return { ok: true };
}

/** Suma 1 punto (y 1 correcta) al usuario; devuelve el total. */
async function addPoints(guildId: string, userId: string): Promise<number> {
  const table = ciszubotSchema.triviaScores;
  const rows = await db
    .insert(table)
    .values({ guildId, userId, points: 1, correct: 1, played: 1 })
    .onConflictDoUpdate({
      target: [table.guildId, table.userId],
      set: {
        points: sql`${table.points} + 1`,
        correct: sql`${table.correct} + 1`,
        played: sql`${table.played} + 1`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ points: table.points });
  return Number(rows[0]?.points ?? 1);
}

/** Otorga roles de recompensa al alcanzar umbrales (sin duplicar). */
async function grantRewards(message: Message, cfg: GuildConfig, total: number): Promise<void> {
  if (!message.guild || !message.member || !Array.isArray(cfg.trivia_rewards)) return;
  for (const reward of cfg.trivia_rewards) {
    if (!reward || typeof reward.points !== 'number' || !reward.role_id) continue;
    if (total < reward.points) continue;
    const role = message.guild.roles.cache.get(reward.role_id);
    if (!role || message.member.roles.cache.has(role.id) || !message.member.manageable) continue;
    await message.member.roles.add(role, `Trivia: ${total} puntos`).catch(() => undefined);
    await (message.channel as TextChannel)
      .send({ content: `🏅 <@${message.author.id}> alcanzó **${total}** puntos de trivia y ganó <@&${role.id}>.` })
      .catch(() => undefined);
  }
}

/** Top de puntuación del servidor. */
export async function triviaLeaderboard(guildId: string): Promise<Array<{ userId: string; points: number; correct: number }>> {
  const table = ciszubotSchema.triviaScores;
  const rows = await db
    .select({ userId: table.userId, points: table.points, correct: table.correct })
    .from(table)
    .where(eq(table.guildId, guildId))
    .orderBy(desc(table.points))
    .limit(10);
  return rows;
}

/** Agrega una pregunta personalizada (staff). */
export async function addTriviaQuestion(
  guildId: string,
  question: string,
  answers: string[],
  difficulty: string,
  addedBy: string,
): Promise<{ ok: boolean; reason?: string }> {
  const q = question.trim();
  const ans = answers.map((a) => a.trim()).filter(Boolean);
  if (!q) return { ok: false, reason: 'Falta la pregunta.' };
  if (ans.length === 0) return { ok: false, reason: 'Falta al menos una respuesta aceptada.' };
  const diff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
  const table = ciszubotSchema.triviaQuestions;
  await db.insert(table).values({ guildId, question: q, answers: ans, difficulty: diff, addedBy });
  return { ok: true };
}
