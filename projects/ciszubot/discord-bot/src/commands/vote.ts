import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS } from '../config/links';
import { langOf, tr } from '../services/i18n';

const command: BotCommand = {
  name: 'vote',
  description: 'Vota por CiszuBot en las listas de bots',
  aliases: ['votar', 'voto', 'votación', 'votacion', 'vote'],
  usage: 'cz!vote',
  category: 'Utilidad',

  slashCommand: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Vota por CiszuBot en las listas de bots'),

  async execute(message) {
    const L = await langOf(message);
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.primary)
      .setTitle(tr(L, '🗳️ Vota por CiszuBot', '🗳️ Vote for CiszuBot'))
      .setDescription(
        'Cada voto ayuda a que el bot sea más visible en las listas y llegue a más servidores. ¡Gracias por tu apoyo!',
      )
      .addFields(
        { name: tr(L, '⭐ Top.gg', '⭐ Top.gg'), value: 'Vota cada 12 horas para apoyar el bot.', inline: false },
        { name: '🖥️ Discord Bot List', value: 'Vota y deja una reseña en Discord Bot List.', inline: false },
      )
      .setFooter(BOT_FOOTER(tr(L, `Solicitado por ${message.author.tag}`, `Requested by ${message.author.tag}`), message.client.user?.displayAvatarURL()))
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Votar en Top.gg').setURL(LINKS.topggBotVote),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Votar en DBL').setURL(LINKS.discordBotListBot),
    );

    return message.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
