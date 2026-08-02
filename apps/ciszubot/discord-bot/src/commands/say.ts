import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const command: BotCommand = {
  name: 'say',
  description: 'Hace que el bot repita tu mensaje en un embed',
  aliases: ['decir', 'di', 'pronunciar', 'repetir', 's', 'repeat'],
  usage: 'cz!say <mensaje>',
  category: 'Diversión',

  slashCommand: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Hace que el bot repita tu mensaje en un embed')
    .addStringOption((option) =>
      option.setName('mensaje').setDescription('El mensaje que quieres que repita el bot').setRequired(true),
    ),

  async execute(message, args) {
    if (args.length === 0) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle('❌ Error')
        .setDescription('Debes proporcionar un mensaje para que el bot lo repita.')
        .addFields({ name: '📝 Uso correcto', value: `\`${this.usage}\``, inline: false })
        .setFooter({ text: 'CiszuBot', iconURL: message.client.user?.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [errorEmbed] });
    }

    const messageToSay = args.join(' ');
    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('💬 Mensaje Repetido')
      .setDescription(messageToSay)
      .addFields({ name: '👤 Autor Original', value: message.author.tag, inline: true })
      .setFooter({ text: 'CiszuBot', iconURL: message.client.user?.displayAvatarURL() })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};

export default command;
