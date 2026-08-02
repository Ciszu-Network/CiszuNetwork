import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const create = (): BotCommand => ({
  name: 'avatar',
  description: 'Muestra el avatar de un usuario',
  aliases: ['foto', 'pic', 'imagen'],
  usage: 'cz!avatar [@usuario]',
  category: 'Diversión',
  slashCommand: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Muestra el avatar de un usuario')
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(false)),
  async execute(message) {
    const target = message.mentions?.users?.first() ?? message.author;
    const avatar = target.displayAvatarURL?.({ size: 1024 }) ?? message.author.displayAvatarURL({ size: 1024 });
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(`🖼️ Avatar de ${target.username ?? target.tag ?? target.id}`)
      .setImage(avatar)
      .setDescription(`[Descargar](${avatar})`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
