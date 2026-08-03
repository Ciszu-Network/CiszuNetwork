import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS } from '../config/links';

const command: BotCommand = {
  name: 'bump',
  description: 'Bumpea y promociona el servidor en las listas de Discord',
  aliases: ['bumpear', 'promocionar', 'boost', 'topgg'],
  usage: 'cz!bump',
  category: 'Utilidad',

  slashCommand: new SlashCommandBuilder()
    .setName('bump')
    .setDescription('Bumpea y promociona el servidor en las listas de Discord'),

  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.secondary)
      .setTitle('🚀 Bump del servidor')
      .setDescription(
        'Ayuda a que nuestro servidor crezca bumpeándolo en las listas de servidores. Cada bump lo posiciona mejor y lo muestra a más gente.',
      )
      .addFields(
        {
          name: '📣 Disboard',
          value: 'Haz clic en el botón para abrir el servidor en Disboard y usar su bump (o usa el bot de Disboard con `!d bump` dentro del servidor).',
          inline: false,
        },
        {
          name: '⭐ Top.gg',
          value: 'Vota y comparte nuestro servidor en Top.gg para conseguir más visibilidad.',
          inline: false,
        },
        {
          name: '🖥️ Discord Bot List',
          value: 'El servidor también está listado en Discord Bot List, comparte el enlace con tus amigos.',
          inline: false,
        },
      )
      .setFooter(BOT_FOOTER(`Solicitado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Bump en Disboard').setURL(LINKS.disboardServer),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Top.gg').setURL(LINKS.topggServer),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Discord Bot List').setURL(LINKS.discordBotListServer),
    );

    return message.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
