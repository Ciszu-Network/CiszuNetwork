import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS } from '../config/links';

const command: BotCommand = {
  name: 'invite',
  description: 'Obtén el enlace de invitación del bot',
  aliases: ['invitar', 'añadir', 'add', 'agregar', 'invitacion'],
  usage: 'cz!invite',
  category: 'Utilidad',

  slashCommand: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Obtén el enlace de invitación del bot'),

  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.success)
      .setTitle('🤖 Invita a CiszuBot')
      .setDescription(
        '¡Añade a CiszuBot a tu servidor! Solo tienes que pulsar el botón y elegir el servidor al que quieras invitarlo.',
      )
      .addFields(
        { name: '📋 Permisos', value: 'El bot se instala con permisos de administrador para funcionar correctamente en todos los módulos.', inline: false },
        { name: '🔗 O enlaza manualmente', value: LINKS.invite, inline: false },
      )
      .setFooter(BOT_FOOTER(`Solicitado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Invitar al bot').setURL(LINKS.invite),
    );

    return message.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
