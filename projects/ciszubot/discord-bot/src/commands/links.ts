import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS, BOT_ASSETS } from '../config/links';
import { langOf, tr } from '../services/i18n';

const command: BotCommand = {
  name: 'links',
  description: 'Muestra todos los enlaces oficiales del ecosistema',
  aliases: ['enlaces', 'link', 'links', 'social', 'sociales', 'redes'],
  usage: 'cz!links',
  category: 'Información',

  slashCommand: new SlashCommandBuilder()
    .setName('links')
    .setDescription('Muestra todos los enlaces oficiales del ecosistema'),

  async execute(message) {
    const L = await langOf(message);
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.primary)
      .setTitle('🔗 Enlaces oficiales de Ciszu Network')
      .setDescription('Todos los enlaces oficiales del ecosistema en un solo lugar.')
      .addFields(
        { name: '🌐 Webs', value: `• CiszuBot: ${LINKS.website}\n• Ciszu Network: ${LINKS.network}\n• Ciszuko Antony: ${LINKS.antony}`, inline: false },
        { name: '💬 Discord', value: `• Servidor de soporte: ${LINKS.discordServer}`, inline: false },
        { name: tr(L, '🤖 Invitación', '🤖 Invite'), value: LINKS.invite, inline: false },
        { name: tr(L, '⭐ Listas de bots', '⭐ Bot lists'), value: `• Top.gg: ${LINKS.topggBot}\n• Discord Bot List: ${LINKS.discordBotListBot}`, inline: false },
        { name: tr(L, '📣 Listas de servidores', '📣 Server lists'), value: `• Top.gg: ${LINKS.topggServer}\n• Discord Bot List: ${LINKS.discordBotListServer}\n• Disboard: ${LINKS.disboardServer}`, inline: false },
        { name: tr(L, '💜 Donaciones', '💜 Donations'), value: `• Patreon: ${LINKS.patreon}\n• Ko-fi: ${LINKS.koFi}\n• Buy Me a Coffee: ${LINKS.buyMeACoffee}`, inline: false },
        { name: '🐙 GitHub & YouTube', value: `• GitHub: ${LINKS.github}\n• YouTube: ${LINKS.youtube}`, inline: false },
      )
      .setThumbnail(BOT_ASSETS.isotype)
      .setImage(BOT_ASSETS.wordmark)
      .setFooter(BOT_FOOTER(`Solicitado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('CiszuBot').setURL(LINKS.website),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Discord').setURL(LINKS.discordServer),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Invitar').setURL(LINKS.invite),
    );

    return message.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
