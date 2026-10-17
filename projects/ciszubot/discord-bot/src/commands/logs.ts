import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';

const command: BotCommand = {
  name: 'logs',
  description: 'Configura el canal de logs del servidor',
  aliases: ['logchannel', 'auditoria'],
  usage: 'cz!logs [#canal | off]',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Configura el canal de logs del servidor')
    .setDefaultMemberPermissions(0)
    .addChannelOption((o) => o.setName('canal').setDescription('Canal de logs (vacío = ver estado)').setRequired(false)),

  async execute(message, args) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    const raw = (args[0] ?? '').toLowerCase();
    if (raw === 'off' || raw === 'disable') {
      await updateGuildConfig(guildId, { logs_channel_id: null });
      await message.reply('✅ Canal de logs desactivado.');
      return;
    }

    const channelId = message.mentions?.channels?.first()?.id;
    if (!channelId) {
      const embed = new EmbedBuilder()
        .setColor(cfg.logs_channel_id ? '#22c55e' : '#6b7280')
        .setTitle('📋 Logs del servidor')
        .setDescription(
          `**Canal:** ${cfg.logs_channel_id ? `<#${cfg.logs_channel_id}>` : 'no configurado'}\n\n` +
            'Registra: mensajes editados/borrados, entradas/salidas, bans y cambios de apodo.\n' +
            'Configura: `cz!logs #canal` o `cz!logs off`.',
        )
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    await updateGuildConfig(guildId, { logs_channel_id: channelId });
    await message.reply(`✅ Canal de logs: <#${channelId}>.`);
  },
};

export default command;
