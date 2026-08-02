import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS } from '../config/links';

const command: BotCommand = {
  name: 'promo',
  description: 'Promociona las webs del ecosistema Ciszu Network',
  aliases: ['promocionar', 'webs', 'sitio', 'web', 'promote'],
  usage: 'cz!promo',
  category: 'Utilidad',

  slashCommand: new SlashCommandBuilder()
    .setName('promo')
    .setDescription('Promociona las webs del ecosistema Ciszu Network'),

  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.primary)
      .setTitle('🌐 Ecosistema Ciszu Network')
      .setDescription(
        'Descubre todo lo que hay detrás del bot: la organización, la web del bot y el portfolio de CiszukoAntony.',
      )
      .addFields(
        {
          name: `🤖 CiszuBot — ${LINKS.websiteLabel}`,
          value: 'Web oficial del bot: estado en vivo, comandos, soporte, votaciones y donaciones.',
          inline: false,
        },
        {
          name: `🌍 Ciszu Network — ${LINKS.networkLabel}`,
          value: 'Web principal de la organización: el ecosistema digital de CiszukoAntony y sus proyectos.',
          inline: false,
        },
        {
          name: `🎨 Ciszuko Antony — ${LINKS.antonyLabel}`,
          value: 'Portfolio personal: logos, medios y música del creador.',
          inline: false,
        },
      )
      .setFooter(BOT_FOOTER(`Solicitado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('CiszuBot').setURL(LINKS.website),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Ciszu Network').setURL(LINKS.network),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Ciszuko Antony').setURL(LINKS.antony),
    );

    return message.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
