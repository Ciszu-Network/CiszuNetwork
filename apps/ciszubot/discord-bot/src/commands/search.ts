import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const create = (): BotCommand => ({
  name: 'search',
  description: 'Busca resultados en Google',
  aliases: ['google', 'buscar', 'g'],
  usage: 'cz!search <consulta>',
  category: 'Utilidad',
  slashCommand: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Busca resultados en Google')
    .addStringOption((o) => o.setName('consulta').setDescription('Qué buscar').setRequired(true)),
  async execute(message, args) {
    const query = args.join(' ');
    if (!query) {
      await message.reply('❌ Uso: `cz!search <consulta>`');
      return;
    }
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(`🔍 Resultados para "${query}"`)
      .setDescription(`Pulsa [aquí](${url}) para ver los resultados de Google.\n\nTambién puedes probar: [DuckDuckGo](https://duckduckgo.com/?q=${encodeURIComponent(query)}) • [Bing](https://www.bing.com/search?q=${encodeURIComponent(query)})`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
