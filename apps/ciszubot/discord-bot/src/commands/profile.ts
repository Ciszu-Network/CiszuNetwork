import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const command: BotCommand = {
  name: 'profile',
  description: 'Muestra información detallada del usuario',
  aliases: ['perfil', 'usuario', 'info-usuario', 'userinfo', 'u', 'perfil-usuario'],
  usage: 'cz!profile [@usuario]',
  category: 'Información',

  slashCommand: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Muestra información detallada del usuario')
    .addUserOption((option) =>
      option.setName('usuario').setDescription('El usuario del que quieres obtener información (opcional)').setRequired(false),
    ),

  async execute(message, args) {
    let targetUserId = message.author.id;
    if (args.length > 0) {
      const mention = message.mentions?.users.first();
      if (mention) targetUserId = mention.id;
    }

    const targetUser = message.client.users?.cache.get(targetUserId) ?? message.author;
    const guild = message.guild;

    const accountCreated = Math.floor(targetUser.createdTimestamp / 1000);
    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle(`👤 Perfil de ${targetUser.username}`)
      .setDescription('Información detallada del usuario')
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '📛 Nombre de usuario', value: targetUser.username, inline: true },
        { name: '🆔 ID', value: targetUser.id, inline: true },
        { name: '📅 Cuenta creada', value: `<t:${accountCreated}:F>\n<t:${accountCreated}:R>`, inline: true },
        { name: '🖼️ Avatar', value: `[Enlace al avatar](${targetUser.displayAvatarURL({ size: 1024 })})`, inline: true },
        { name: '🤖 Es un bot', value: targetUser.bot ? 'Sí' : 'No', inline: true },
      );

    if (guild) {
      try {
        const member = await guild.members.fetch(targetUserId);
        if (member) {
          const joined = Math.floor((member.joinedTimestamp ?? Date.now()) / 1000);
          const roles = member.roles.cache
            .filter((r) => r.name !== '@everyone')
            .map((r) => r.toString())
            .slice(0, 10);
          embed.addFields(
            { name: '🏠 Se unió al servidor', value: `<t:${joined}:F>\n<t:${joined}:R>`, inline: true },
            { name: '🎭 Apodo', value: member.nickname || 'Sin apodo', inline: true },
            { name: '🏆 Rol más alto', value: member.roles.highest.toString(), inline: true },
          );
          if (roles.length > 0) {
            embed.addFields({
              name: `🎯 Roles (${member.roles.cache.size - 1})`,
              value: roles.join(', ') + (member.roles.cache.size > 11 ? '...' : ''),
              inline: false,
            });
          }
          embed.addFields({
            name: '📱 Estado',
            value: member.presence?.status || 'Desconectado',
            inline: true,
          });
        }
      } catch {
        // usuario no está en el servidor
      }
    }

    embed.setFooter({
      text: `CiszuBot • Solicitado por ${message.author.tag}`,
      iconURL: message.client.user?.displayAvatarURL(),
    }).setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};

export default command;
