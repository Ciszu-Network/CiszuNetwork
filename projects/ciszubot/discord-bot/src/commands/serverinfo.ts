import { ChannelType, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const verificationLevels: Record<number, string> = {
  0: 'Ninguno', 1: 'Bajo', 2: 'Medio', 3: 'Alto', 4: 'Muy Alto',
};

const command: BotCommand = {
  name: 'serverinfo',
  description: 'Muestra información detallada del servidor',
  aliases: ['servidor', 'infoserver', 'guild', 'server', 'guildinfo'],
  usage: 'cz!serverinfo',
  category: 'Información',

  slashCommand: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Muestra información detallada del servidor'),

  async execute(message, args) {
    const guild = message.guild;
    if (!guild) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle('❌ Error')
        .setDescription('Este comando solo puede ser usado en un servidor.')
        .addFields({ name: '📝 Uso correcto', value: 'Usa este comando dentro de un servidor de Discord.', inline: false })
        .setFooter({ text: 'CiszuBot', iconURL: message.client.user?.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [errorEmbed] });
    }

    const owner = await guild.fetchOwner().catch(() => null);
    const createdAt = Math.floor(guild.createdTimestamp / 1000);

    const channels = guild.channels.cache;
    const textChannels = channels.filter((c) => c.type === ChannelType.GuildText).size;
    const voiceChannels = channels.filter((c) => c.type === ChannelType.GuildVoice).size;
    const categories = channels.filter((c) => c.type === ChannelType.GuildCategory).size;

    const members = guild.members.cache;
    const humans = members.filter((m) => !m.user.bot).size;
    const bots = members.filter((m) => m.user.bot).size;

    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('🏠 Información del Servidor')
      .setDescription(`Información detallada de **${guild.name}**`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: '📛 Nombre del servidor', value: guild.name, inline: true },
        { name: '🆔 ID del servidor', value: guild.id, inline: true },
        { name: '👑 Propietario', value: owner?.user.tag ?? 'Desconocido', inline: true },
        { name: '📅 Creado el', value: `<t:${createdAt}:F>\n<t:${createdAt}:R>`, inline: true },
        { name: '👥 Miembros', value: `**Total:** ${guild.memberCount}\n**Humanos:** ${humans}\n**Bots:** ${bots}`, inline: true },
        { name: '📺 Canales', value: `**Total:** ${channels.size}\n**Texto:** ${textChannels}\n**Voz:** ${voiceChannels}\n**Categorías:** ${categories}`, inline: true },
        { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: '😀 Emojis', value: guild.emojis.cache.size.toString(), inline: true },
        { name: '🔒 Nivel de verificación', value: verificationLevels[guild.verificationLevel] ?? 'Desconocido', inline: true },
      );

    if (guild.premiumTier > 0) {
      embed.addFields({
        name: '💎 Boost',
        value: `**Nivel:** ${guild.premiumTier}\n**Boosts:** ${guild.premiumSubscriptionCount}`,
        inline: true,
      });
    }

    embed.setFooter({
      text: `CiszuBot • Solicitado por ${message.author.tag}`,
      iconURL: message.client.user?.displayAvatarURL(),
    }).setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};

export default command;
