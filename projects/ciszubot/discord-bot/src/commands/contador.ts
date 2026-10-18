import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { getGuildConfig } from '../services/configService';
import { getCountingStatus, resetCounting, announceStart } from '../services/counting';

/**
 * cz!contador — estado y control del canal contador.
 * Subcomandos: estado (default) · reset · iniciar (staff).
 */
const command: BotCommand = {
  name: 'contador',
  description: 'Estado y control del canal contador',
  aliases: ['counting', 'counter'],
  usage: 'cz!contador [estado|reset|iniciar]',
  category: 'Utilidad',
  slashCommand: new SlashCommandBuilder()
    .setName('contador')
    .setDescription('Estado y control del canal contador')
    .addStringOption((o) =>
      o
        .setName('accion')
        .setDescription('Acción a realizar')
        .setRequired(false)
        .addChoices(
          { name: 'Estado', value: 'estado' },
          { name: 'Reiniciar (staff)', value: 'reset' },
          { name: 'Iniciar y anunciar (staff)', value: 'iniciar' },
        ),
    ),
  async execute(message, args) {
    if (!message.guild) return;
    const cfg = await getGuildConfig(message.guild.id);
    const sub = (args[0] ?? 'estado').toLowerCase();
    const isStaff = Boolean(message.member?.permissions.has(PermissionFlagsBits.ManageGuild));

    if (sub === 'reset' || sub === 'reiniciar') {
      if (!isStaff) {
        await message.reply('❌ Necesitas permiso de **Gestionar Servidor** para reiniciar el contador.');
        return;
      }
      const start = await resetCounting(message.guild.id, cfg);
      await message.reply(`🔄 Contador reiniciado desde **${start}**.`);
      return;
    }

    if (sub === 'iniciar' || sub === 'start' || sub === 'anunciar') {
      if (!isStaff) {
        await message.reply('❌ Necesitas permiso de **Gestionar Servidor** para iniciar el contador.');
        return;
      }
      if (!cfg.counting_channel_id) {
        await message.reply('❌ No hay canal contador configurado (dashboard → Contador).');
        return;
      }
      const channel = message.guild.channels.cache.get(cfg.counting_channel_id);
      if (!channel || !channel.isTextBased()) {
        await message.reply('❌ El canal contador configurado ya no existe o no es de texto.');
        return;
      }
      await announceStart(channel as import('discord.js').TextChannel, cfg, message.author.tag, message.author.displayAvatarURL());
      await message.reply('✅ Mensaje de inicio enviado al canal contador.');
      return;
    }

    // Estado por defecto.
    const status = await getCountingStatus(message.guild.id, cfg);
    const embed = new EmbedBuilder()
      .setColor(status.enabled ? BOT_COLORS.primary : BOT_COLORS.danger)
      .setTitle('🔢 Contador')
      .addFields(
        { name: 'Estado', value: status.enabled ? '✅ Activado' : '❌ Desactivado', inline: true },
        { name: 'Canal', value: status.channelId ? `<#${status.channelId}>` : 'Sin configurar', inline: true },
        { name: 'Estilo', value: status.style === 'sum' ? '➕ Suma (el bot pregunta)' : '🔢 Tradicional (1, 2, 3...)', inline: true },
        { name: 'Cuenta actual', value: `**${status.current}**`, inline: true },
        { name: 'Inicio', value: `${status.start}`, inline: true },
        { name: 'Último en contar', value: status.lastUserId ? `<@${status.lastUserId}>` : 'Nadie todavía', inline: true },
      )
      .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
};

export default command;
