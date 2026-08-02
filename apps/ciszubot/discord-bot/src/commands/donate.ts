import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS } from '../config/links';

const command: BotCommand = {
  name: 'donate',
  description: 'Apoya el desarrollo del bot con una donación',
  aliases: ['donar', 'donación', 'donacion', 'apoyo', 'support', 'patreon', 'kofi', 'ko-fi'],
  usage: 'cz!donate',
  category: 'Utilidad',

  slashCommand: new SlashCommandBuilder()
    .setName('donate')
    .setDescription('Apoya el desarrollo del bot con una donación'),

  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.secondary)
      .setTitle('💜 Apoya el proyecto')
      .setDescription(
        'CiszuBot es un proyecto sin ánimo de lucro. Si te gusta el bot y quieres apoyar su desarrollo, cualquier donación es bienvenida y ayuda a mantener los servicios en línea.',
      )
      .addFields(
        { name: '💜 Patreon', value: 'Suscripción mensual con recompensas exclusivas.', inline: false },
        { name: '☕ Ko-fi', value: 'Invítale un café al creador, sin compromiso.', inline: false },
        { name: '☕ Buy Me a Coffee', value: 'Donación única, rápida y sin registro.', inline: false },
      )
      .setFooter(BOT_FOOTER(`Solicitado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Patreon').setURL(LINKS.patreon),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Ko-fi').setURL(LINKS.koFi),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Buy Me a Coffee').setURL(LINKS.buyMeACoffee),
    );

    return message.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
