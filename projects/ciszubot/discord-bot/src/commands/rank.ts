import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getLevel, getTopLevels, xpForLevel } from '../services/levels';

const create = (): BotCommand => ({
  name: 'rank',
  description: 'Muestra tu nivel y XP',
  aliases: ['nivel', 'level', 'xp'],
  usage: 'cz!rank [@usuario]',
  category: 'Niveles',
  slashCommand: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Muestra tu nivel y XP')
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario a consultar').setRequired(false)),
  async execute(message) {
    if (!message.guild) {
      await message.reply('❌ Este comando solo funciona en un servidor.');
      return;
    }
    const target = message.mentions?.users?.first() ?? message.author;
    const level = await getLevel(target.id, message.guild.id);
    const top = await getTopLevels(message.guild.id, 50);
    const position = top.findIndex((e) => e.user_id === target.id) + 1;
    const pct = Math.floor(level.progress * 100);

    const barLen = 12;
    const filled = Math.max(0, Math.min(barLen, Math.round(level.progress * barLen)));
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);

    const embed = new EmbedBuilder()
      .setColor('#ff33cc')
      .setAuthor({ name: `${target.username ?? target.tag ?? target.id} — Nivel ${level.level}`, iconURL: target.displayAvatarURL?.() ?? message.author.displayAvatarURL() })
      .setDescription(
        `**XP:** ${level.xp} (${level.current}/${level.needed})\n` +
          `**Progreso:** ${bar} ${pct}%\n\n` +
          `**Ranking:** ${position > 0 ? `#${position}` : '—'} en el servidor\n` +
          `**XP para nivel ${level.level + 1}:** ${xpForLevel(level.level)}`
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
