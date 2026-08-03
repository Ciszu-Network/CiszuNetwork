import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getTopLevels, levelFromXp } from '../services/levels';

const create = (): BotCommand => ({
  name: 'topxp',
  description: 'Top 10 de niveles del servidor',
  aliases: ['toppniveles', 'rankingxp'],
  usage: 'cz!topxp',
  category: 'Niveles',
  slashCommand: new SlashCommandBuilder().setName('topxp').setDescription('Top 10 de niveles del servidor'),
  async execute(message) {
    if (!message.guild) {
      await message.reply('❌ Este comando solo funciona en un servidor.');
      return;
    }
    const top = await getTopLevels(message.guild.id, 10);
    const members = message.guild.members;

    const lines: string[] = [];
    let i = 1;
    for (const entry of top) {
      const member = await members.fetch(entry.user_id).catch(() => null);
      const name = member?.user.username ?? entry.user_id;
      const lvl = levelFromXp(entry.xp);
      lines.push(`\`${i}.\` **${name}** — Nivel ${lvl.level} (${entry.xp} XP)`);
      i++;
    }

    const embed = new EmbedBuilder()
      .setColor('#ff33cc')
      .setTitle(`🏆 Top 10 niveles — ${message.guild.name}`)
      .setDescription(lines.length > 0 ? lines.join('\n') : 'Aún no hay datos de niveles en este servidor.')
      .setFooter({ text: `CiszuBot • Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
