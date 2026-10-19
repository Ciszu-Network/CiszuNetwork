import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getTopLevels, levelFromXp } from '../services/levels';
import { langOf, tr } from '../services/i18n';

const create = (): BotCommand => ({
  name: 'topxp',
  description: 'Top 10 de niveles del servidor',
  aliases: ['toppniveles', 'rankingxp'],
  usage: 'cz!topxp',
  category: 'Niveles',
  slashCommand: new SlashCommandBuilder().setName('topxp').setDescription('Top 10 de niveles del servidor'),
  async execute(message) {
    const L = await langOf(message);
    if (!message.guild) {
      await message.reply(tr(L, tr(L, '❌ Este comando solo funciona en un servidor.', '❌ This command only works in a server.'), '❌ This command only works in a server.'));
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
      .setTitle(tr(L, `🏆 Top 10 niveles — ${message.guild.name}`, `🏆 Top 10 levels — ${message.guild.name}`))
      .setDescription(lines.length > 0 ? lines.join('\n') : tr(L, 'Aún no hay datos de niveles en este servidor.', 'There is no level data in this server yet.'))
      .setFooter({ text: tr(L, tr(L, `CiszuBot • Solicitado por ${message.author.tag}`, `CiszuBot • Requested by ${message.author.tag}`), `CiszuBot • Requested by ${message.author.tag}`), iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
