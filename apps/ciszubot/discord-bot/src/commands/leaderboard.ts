import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getTopWallets, formatMoney } from '../services/economy';
import { getSupabase } from '../services/supabase';

const create = (): BotCommand => ({
  name: 'leaderboard',
  description: 'Top 10 de monedas del servidor',
  aliases: ['top', 'ranking', 'tabla'],
  usage: 'cz!leaderboard',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder().setName('leaderboard').setDescription('Top 10 de monedas del servidor'),
  async execute(message) {
    if (!message.guild) {
      await message.reply('❌ Este comando solo funciona en un servidor.');
      return;
    }
    const top = await getTopWallets(message.guild.id, 10);
    const db = getSupabase();
    const members = message.guild.members;

    const lines: string[] = [];
    let i = 1;
    for (const entry of top) {
      const member = await members.fetch(entry.user_id).catch(() => null);
      const name = member?.user.username ?? entry.user_id;
      lines.push(`\`${i}.\` **${name}** — ${formatMoney(entry.balance)}`);
      i++;
    }

    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(`🏆 Top 10 — ${message.guild.name}`)
      .setDescription(lines.length > 0 ? lines.join('\n') : 'Aún no hay datos de monedas en este servidor.')
      .setFooter({ text: `CiszuBot • Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
