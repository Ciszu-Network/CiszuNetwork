import { EmbedBuilder, SlashCommandBuilder, TextChannel } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig } from '../services/configService';

const command: BotCommand = {
  name: 'confess',
  description: 'Envía un mensaje anónimo y borra tu mensaje original',
  aliases: ['confesar', 'anonimo', 'secreto', 'c', 'confession'],
  usage: 'cz!confess <mensaje>',
  category: 'Diversión',

  slashCommand: new SlashCommandBuilder()
    .setName('confess')
    .setDescription('Envía un mensaje anónimo y borra tu mensaje original')
    .addStringOption((option) =>
      option.setName('mensaje').setDescription('El mensaje que quieres confesar anónimamente').setRequired(true),
    ),

  async execute(message, args) {
    if (args.length === 0) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle('❌ Error')
        .setDescription('Debes proporcionar un mensaje para confesarlo anónimamente.')
        .addFields({ name: '📝 Uso correcto', value: `\`${this.usage}\``, inline: false })
        .setFooter({ text: 'CiszuBot', iconURL: message.client.user?.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [errorEmbed] });
    }

    const confessionMessage = args.join(' ');
    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('🤫 Confesión Anónima')
      .setDescription(confessionMessage)
      .addFields({ name: '👤 Autor', value: 'Usuario Anónimo', inline: true })
      .setFooter({ text: 'CiszuBot', iconURL: message.client.user?.displayAvatarURL() })
      .setTimestamp();

    // Canal de confesiones configurado (dashboard → Confesiones); si no, el actual.
    let targetChannel = message.channel as TextChannel | null;
    if (message.guild) {
      const cfg = await getGuildConfig(message.guild.id);
      if (cfg.confess_channel_id) {
        const configured = message.guild.channels.cache.get(cfg.confess_channel_id) as TextChannel | undefined;
        if (configured && configured.isTextBased()) targetChannel = configured;
      }
    }
    await targetChannel?.send({ embeds: [embed] });

    if (message.guild) {
      try {
        await message.delete?.();
      } catch {
        const deleteEmbed = new EmbedBuilder()
          .setColor('#8b5cf6')
          .setTitle('⚠️ Advertencia')
          .setDescription('No pude borrar tu mensaje original. Asegúrate de que el bot tenga permisos para eliminar mensajes.')
          .setFooter({ text: 'CiszuBot', iconURL: message.client.user?.displayAvatarURL() })
          .setTimestamp();
        const temp = await message.reply({ embeds: [deleteEmbed] });
        setTimeout(() => {
          (temp as { delete?: () => Promise<unknown> }).delete?.().catch(() => undefined);
        }, 10000);
      }
    }
  },
};

export default command;
