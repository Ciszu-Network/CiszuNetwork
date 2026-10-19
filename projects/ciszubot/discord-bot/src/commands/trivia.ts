import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { getGuildConfig } from '../services/configService';
import { addTriviaQuestion, startTrivia, stopTrivia, triviaLeaderboard } from '../services/trivia';
import { isStaff } from '../utils/permissions';

const DIFF_ALIASES: Record<string, string> = {
  facil: 'easy',
  easy: 'easy',
  media: 'medium',
  medio: 'medium',
  medium: 'medium',
  dificil: 'hard',
  hard: 'hard',
  mixta: 'mixed',
  mixed: 'mixed',
};

/**
 * cz!trivia [facil|media|dificil|mixta] — inicia una pregunta.
 * cz!trivia top — leaderboard. cz!trivia stop — detiene (staff).
 * cz!trivia add <pregunta> | <resp1> | <resp2>... [--dificil] — pregunta propia (staff).
 */
const command: BotCommand = {
  name: 'trivia',
  description: 'Preguntas de trivia con puntuación, leaderboard y recompensas',
  aliases: ['pregunta', 'quiz'],
  usage: 'cz!trivia [facil|media|dificil|mixta|top|stop|add ...]',
  category: 'Diversión',
  slashCommand: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Inicia una trivia o consulta el ranking')
    .addStringOption((o) =>
      o
        .setName('accion')
        .setDescription('Qué hacer')
        .setRequired(false)
        .addChoices(
          { name: 'Iniciar', value: 'iniciar' },
          { name: 'Top (leaderboard)', value: 'top' },
          { name: 'Detener (staff)', value: 'stop' },
          { name: 'Agregar pregunta (staff)', value: 'add' },
        ),
    )
    .addStringOption((o) =>
      o
        .setName('dificultad')
        .setDescription('Dificultad de la pregunta')
        .setRequired(false)
        .addChoices(
          { name: 'Fácil', value: 'easy' },
          { name: 'Media', value: 'medium' },
          { name: 'Difícil', value: 'hard' },
          { name: 'Mixta', value: 'mixed' },
        ),
    )
    .addStringOption((o) => o.setName('pregunta').setDescription('Pregunta y respuestas separadas con | (para add)').setRequired(false)),

  async execute(message, args) {
    if (!message.guild) return;
    const cfg = await getGuildConfig(message.guild.id);
    const first = (args[0] ?? '').toLowerCase();

    if (first === 'top' || first === 'ranking' || first === 'leaderboard') {
      const top = await triviaLeaderboard(message.guild.id);
      const embed = new EmbedBuilder()
        .setColor(BOT_COLORS.primary)
        .setTitle('🏆 Ranking de trivia')
        .setDescription(
          top.length === 0
            ? 'Todavía no hay puntuaciones. ¡Usa `cz!trivia` para empezar!'
            : top.map((r, i) => `**${i + 1}.** <@${r.userId}> — **${r.points}** punto(s) (${r.correct} correctas)`).join('\n'),
        )
        .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (first === 'stop' || first === 'detener') {
      const staff = Boolean(message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) || (await isStaff(message).catch(() => false));
      if (!staff) {
        await message.reply('❌ Solo el staff puede detener la trivia.');
        return;
      }
      const res = await stopTrivia(message.client, message.channel?.id ?? '');
      await message.reply(res.ok ? '🛑 Trivia detenida.' : `❌ ${res.reason ?? 'No hay trivia activa.'}`);
      return;
    }

    if (first === 'add' || first === 'agregar') {
      const staff = Boolean(message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) || (await isStaff(message).catch(() => false));
      if (!staff) {
        await message.reply('❌ Solo el staff puede agregar preguntas.');
        return;
      }
      let tokens = args.slice(1);
      let difficulty = 'medium';
      tokens = tokens.filter((t) => {
        const norm = DIFF_ALIASES[t.toLowerCase()];
        if (norm && norm !== 'mixed' && t.startsWith('--')) {
          difficulty = norm;
          return false;
        }
        return true;
      });
      const segments = tokens.join(' ').split('|').map((s) => s.trim()).filter(Boolean);
      const question = segments.shift() ?? '';
      if (!question || segments.length === 0) {
        await message.reply('❌ Uso: `cz!trivia add <pregunta> | <respuesta 1> | <respuesta 2>... [--facil|--dificil]`');
        return;
      }
      const res = await addTriviaQuestion(message.guild.id, question, segments, difficulty, message.author.id);
      await message.reply(res.ok ? '✅ Pregunta agregada a la trivia del servidor.' : `❌ ${res.reason ?? 'No se pudo agregar.'}`);
      return;
    }

    // Iniciar (con dificultad opcional).
    const difficulty = DIFF_ALIASES[first] ?? undefined;
    const memberRoles = message.member
      ? [...(message.member.roles as unknown as { cache: Map<string, unknown> }).cache.keys()]
      : [];
    if (cfg.trivia_excluded_role_ids.length > 0 && memberRoles.some((r) => cfg.trivia_excluded_role_ids.includes(r))) {
      await message.reply('❌ Tienes un rol excluido de la trivia.');
      return;
    }
    const res = await startTrivia(message.client, message.channel as TextChannel, cfg, difficulty, message.author.tag);
    if (!res.ok) {
      await message.reply(`❌ ${res.reason ?? 'No se pudo iniciar la trivia.'}`);
    }
  },
};

export default command;
