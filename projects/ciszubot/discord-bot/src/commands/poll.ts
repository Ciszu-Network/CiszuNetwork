import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig } from '../services/configService';
import { createPoll, closePoll } from '../services/polls';
import { isStaff } from '../utils/permissions';

/** Duración estilo 10m / 2h / 1d. */
function parseDuration(raw: string): number | null {
  const match = raw.match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const ms = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  const total = n * ms;
  return total > 0 && total <= 7 * 86_400_000 ? total : null;
}

/**
 * cz!poll <pregunta> | opción 1 | opción 2 [| ...] [--anon] [--tiempo 30m]
 * cz!poll cerrar <id> — autor o staff.
 */
const command: BotCommand = {
  name: 'poll',
  description: 'Crea una encuesta con votos (anónimos o públicos) y cierre por tiempo o manual',
  aliases: ['encuesta', 'votacion', 'vote'],
  usage: 'cz!poll <pregunta> | opción 1 | opción 2 [--anon] [--tiempo 30m]',
  category: 'Utilidad',
  slashCommand: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Crea una encuesta')
    .addStringOption((o) => o.setName('pregunta').setDescription('La pregunta').setRequired(false).setMaxLength(250))
    .addStringOption((o) => o.setName('opciones').setDescription('Opciones separadas con | (2 a 10)').setRequired(false))
    .addBooleanOption((o) => o.setName('anonimo').setDescription('Votos anónimos').setRequired(false))
    .addStringOption((o) => o.setName('tiempo').setDescription('Duración (ej: 30m, 2h; vacío = cierre manual)').setRequired(false))
    .addIntegerOption((o) => o.setName('cerrar').setDescription('ID de encuesta a cerrar (autor/staff)').setRequired(false)),

  async execute(message, args) {
    if (!message.guild) return;
    const cfg = await getGuildConfig(message.guild.id);
    const first = (args[0] ?? '').toLowerCase();

    if (first === 'cerrar' || first === 'close') {
      const id = parseInt(args[1] ?? '', 10);
      if (!id || Number.isNaN(id)) {
        await message.reply('❌ Uso: `cz!poll cerrar <id>`');
        return;
      }
      const staff = Boolean(message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) || (await isStaff(message).catch(() => false));
      const res = await closePoll(message.client, id, { id: message.author.id, staff });
      await message.reply(
        res.ok ? (res.winner ? `🏆 Encuesta #${id} cerrada. Ganó **${res.winner}**.` : `🤝 Encuesta #${id} cerrada (empate o sin votos).`) : `❌ ${res.reason ?? 'No se pudo cerrar.'}`,
      );
      return;
    }

    // Parseo: flags + segmentos separados por |
    const tokens = [...args];
    let anonymous = false;
    let durationMs: number | null = null;
    const clean: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i].toLowerCase();
      if (t === '--anon' || t === '--anonimo' || t === '--anonymous' || t === 'true') {
        anonymous = true;
        continue;
      }
      if (t === '--tiempo' || t === '--time') {
        const parsed = parseDuration(tokens[i + 1] ?? '');
        if (parsed) {
          durationMs = parsed;
          i++;
          continue;
        }
      }
      clean.push(tokens[i]);
    }
    const raw = clean.join(' ');
    const segments = raw
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    const question = segments.shift() ?? '';
    const options = segments;

    if (!question || options.length < 2) {
      await message.reply('❌ Uso: `cz!poll <pregunta> | opción 1 | opción 2 [| ...] [--anon] [--tiempo 30m]`');
      return;
    }

    const memberRoles = message.member
      ? [...(message.member.roles as unknown as { cache: Map<string, unknown> }).cache.keys()]
      : [];
    const res = await createPoll(
      message.client,
      message.channel as never,
      { id: message.author.id, tag: message.author.tag, displayAvatarURL: () => message.author.displayAvatarURL() },
      question,
      options,
      anonymous,
      durationMs,
      cfg,
      memberRoles,
    );
    if (!res.ok) {
      await message.reply(`❌ ${res.reason ?? 'No se pudo crear la encuesta.'}`);
    }
  },
};

export default command;
