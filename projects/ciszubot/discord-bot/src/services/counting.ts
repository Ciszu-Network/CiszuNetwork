import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { db, ciszubotSchema, eq } from '@ciszunetwork/db';
import { logger } from './logger';
import type { GuildConfig } from './configService';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';

/**
 * Sistema de canal contador (cz!contador / dashboard):
 * - Estilo tradicional: los usuarios cuentan 1, 2, 3... (número inicial configurable, default 0).
 * - Estilo suma: el bot publica "a + b = ?" y el usuario responde el resultado.
 * - Si alguien coloca algo que no es el número correcto, el contador se reinicia
 *   con mensaje de advertencia (terminar) e indica desde dónde se reinicia (inicio).
 * - Autenticidad: `solo` = un usuario puede contar solo infinitamente;
 *   `dependent` = necesita alternar con otra persona (la repetición seguida se
 *   permite solo si `counting_allow_repeat` está activo — tolerancia por lag).
 */

interface CountingRow {
  current_count: number;
  last_user_id: string | null;
  challenge_a: number | null;
  challenge_b: number | null;
}

async function getState(guildId: string, start: number): Promise<CountingRow> {
  const table = ciszubotSchema.countingState;
  const rows = await db
    .select({
      current_count: table.currentCount,
      last_user_id: table.lastUserId,
      challenge_a: table.challengeA,
      challenge_b: table.challengeB,
    })
    .from(table)
    .where(eq(table.guildId, guildId))
    .limit(1);
  if (rows[0]) return rows[0];
  await db.insert(table).values({ guildId, currentCount: start }).onConflictDoNothing();
  return { current_count: start, last_user_id: null, challenge_a: null, challenge_b: null };
}

async function saveState(
  guildId: string,
  patch: Partial<{
    current_count: number;
    last_user_id: string | null;
    last_message_id: string | null;
    challenge_a: number | null;
    challenge_b: number | null;
  }>,
): Promise<void> {
  const table = ciszubotSchema.countingState;
  await db
    .insert(table)
    .values({
      guildId,
      currentCount: patch.current_count ?? 0,
      lastUserId: patch.last_user_id ?? null,
      lastMessageId: patch.last_message_id ?? null,
      challengeA: patch.challenge_a ?? null,
      challengeB: patch.challenge_b ?? null,
    })
    .onConflictDoUpdate({
      target: table.guildId,
      set: {
        ...(patch.current_count !== undefined ? { currentCount: patch.current_count } : {}),
        ...(patch.last_user_id !== undefined ? { lastUserId: patch.last_user_id } : {}),
        ...(patch.last_message_id !== undefined ? { lastMessageId: patch.last_message_id } : {}),
        ...(patch.challenge_a !== undefined ? { challengeA: patch.challenge_a } : {}),
        ...(patch.challenge_b !== undefined ? { challengeB: patch.challenge_b } : {}),
        updatedAt: new Date(),
      },
    });
}

function randomAddend(): number {
  return Math.floor(Math.random() * 10) + 1;
}

/** Embed del reto de suma (estilo `sum`). */
function challengeEmbed(a: number, b: number, tag: string, iconURL?: string | null): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BOT_COLORS.primary)
    .setTitle('➕ ¡Suma y continúa!')
    .setDescription(`Responde con el resultado de:\n\n# ${a} + ${b} = ?`)
    .setFooter(BOT_FOOTER(tag, iconURL))
    .setTimestamp();
}

/** Embed de advertencia/terminar: alguien rompió el contador y se reinicia. */
function resetEmbed(brokenAt: number, start: number, tag: string, iconURL?: string | null, nextHint?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BOT_COLORS.danger)
    .setTitle('💥 ¡Contador reiniciado!')
    .setDescription(
      `El contador llegó hasta **${brokenAt}** pero alguien colocó algo incorrecto.\n\n` +
        `🔄 Se reinicia desde **${start}**.${nextHint ? `\n\n${nextHint}` : ''}`,
    )
    .setFooter(BOT_FOOTER(tag, iconURL))
    .setTimestamp();
}

/**
 * Procesa un mensaje del canal contador. Se llama desde el listener de mensajes.
 */
export async function handleCounting(message: Message, cfg: GuildConfig): Promise<void> {
  if (!message.guild || !cfg.counting_enabled) return;
  if (!cfg.counting_channel_id || message.channelId !== cfg.counting_channel_id) return;
  if (message.author.bot) return;
  // Los comandos (prefijo o mención) no rompen el contador.
  const prefix = cfg.prefix ?? 'cz!';
  if (message.content.startsWith(prefix) || message.content.startsWith(`<@${message.client.user?.id}>`)) return;

  const guildId = message.guild.id;
  const channel = message.channel as TextChannel;
  const style = cfg.counting_style === 'sum' ? 'sum' : 'traditional';
  const start = cfg.counting_start ?? 0;

  try {
    const state = await getState(guildId, start);
    const fresh = state.last_user_id === null;
    const a = state.challenge_a ?? start;
    const b = state.challenge_b ?? randomAddend();
    const expected = style === 'sum' ? a + b : fresh ? start : state.current_count + 1;

    const match = message.content.match(/-?\d+/);
    const sent = match ? parseInt(match[0], 10) : null;

    const fail = async (): Promise<void> => {
      // Reinicio: vuelve al número inicial y avisa (mensaje de terminar + inicio).
      if (style === 'sum') {
        const nb = randomAddend();
        await saveState(guildId, {
          current_count: start,
          last_user_id: null,
          last_message_id: message.id,
          challenge_a: start,
          challenge_b: nb,
        });
        await channel
          .send({
            embeds: [resetEmbed(state.current_count, start, message.author.tag, message.author.displayAvatarURL(), `Nueva suma: **${start} + ${nb} = ?**`)],
          })
          .catch(() => undefined);
      } else {
        await saveState(guildId, {
          current_count: start,
          last_user_id: null,
          last_message_id: message.id,
          challenge_a: null,
          challenge_b: null,
        });
        await channel
          .send({
            embeds: [resetEmbed(state.current_count, start, message.author.tag, message.author.displayAvatarURL(), `El próximo número es **${start}**.`)],
          })
          .catch(() => undefined);
      }
    };

    if (sent === null || sent !== expected) {
      await fail();
      return;
    }

    // Autenticidad: en modo dependiente la misma persona no puede repetir
    // consecutivo (salvo tolerancia por lag activada o modo `solo`).
    if (style === 'traditional' && cfg.counting_authenticity !== 'solo' && !cfg.counting_allow_repeat && state.last_user_id === message.author.id) {
      await channel
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor(BOT_COLORS.danger)
              .setTitle('🚫 No puedes contar dos veces seguidas')
              .setDescription('Este contador necesita que **otra persona** continúe. Espera a que alguien más cuente.')
              .setFooter(BOT_FOOTER(message.author.tag, message.author.displayAvatarURL())),
          ],
        })
        .catch(() => undefined);
      return;
    }

    if (style === 'sum') {
      const nextB = randomAddend();
      await saveState(guildId, {
        current_count: expected,
        last_user_id: message.author.id,
        last_message_id: message.id,
        challenge_a: expected,
        challenge_b: nextB,
      });
      await message.react('✅').catch(() => undefined);
      await channel
        .send({ embeds: [challengeEmbed(expected, nextB, message.author.tag, message.author.displayAvatarURL())] })
        .catch(() => undefined);
    } else {
      await saveState(guildId, {
        current_count: expected,
        last_user_id: message.author.id,
        last_message_id: message.id,
      });
      await message.react('✅').catch(() => undefined);
    }
  } catch (error) {
    logger.warn('handleCounting:', error);
  }
}

/** Estado del contador para mostrarlo (comando cz!contador). */
export async function getCountingStatus(
  guildId: string,
  cfg: GuildConfig,
): Promise<{ enabled: boolean; channelId: string | null; style: string; start: number; current: number; lastUserId: string | null }> {
  const start = cfg.counting_start ?? 0;
  const state = await getState(guildId, start);
  return {
    enabled: cfg.counting_enabled,
    channelId: cfg.counting_channel_id,
    style: cfg.counting_style === 'sum' ? 'sum' : 'traditional',
    start,
    current: state.current_count,
    lastUserId: state.last_user_id,
  };
}

/** Resetea el contador (comando cz!contador reset). Devuelve el estado nuevo. */
export async function resetCounting(guildId: string, cfg: GuildConfig): Promise<number> {
  const start = cfg.counting_start ?? 0;
  await saveState(guildId, {
    current_count: start,
    last_user_id: null,
    last_message_id: null,
    challenge_a: null,
    challenge_b: null,
  });
  return start;
}

/** Envía el mensaje de inicio del contador al canal configurado (cz!contador iniciar). */
export async function announceStart(channel: TextChannel, cfg: GuildConfig, tag: string, iconURL?: string | null): Promise<void> {
  const start = cfg.counting_start ?? 0;
  const style = cfg.counting_style === 'sum' ? 'sum' : 'traditional';
  const embed = new EmbedBuilder()
    .setColor(BOT_COLORS.success)
    .setTitle('🔢 ¡Contador iniciado!')
    .setDescription(
      style === 'sum'
        ? `El bot publicará sumas y deben responder el resultado para seguir contando.\n\nEmpieza en **${start}**.`
        : `Cuenten en orden desde **${start}**. Si alguien coloca algo incorrecto, el contador se reinicia.`,
    )
    .setFooter(BOT_FOOTER(tag, iconURL))
    .setTimestamp();
  await channel.send({ embeds: [embed] });
  if (style === 'sum') {
    const b = randomAddend();
    await saveState(channel.guild.id, { current_count: start, last_user_id: null, challenge_a: start, challenge_b: b });
    await channel.send({ embeds: [challengeEmbed(start, b, tag, iconURL)] });
  }
}
