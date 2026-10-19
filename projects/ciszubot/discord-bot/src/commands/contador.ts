import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { getGuildConfig } from '../services/configService';
import { getCountingStatus, resetCounting, announceStart } from '../services/counting';
import { langOf, tr } from '../services/i18n';

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
    const L = await langOf(message);
    if (!message.guild) return;
    const cfg = await getGuildConfig(message.guild.id);
    const sub = (args[0] ?? 'estado').toLowerCase();
    const isStaff = Boolean(message.member?.permissions.has(PermissionFlagsBits.ManageGuild));

    if (sub === 'reset' || sub === 'reiniciar') {
      if (!isStaff) {
        await message.reply(tr(L, '❌ Necesitas permiso de **Gestionar Servidor** para reiniciar el contador.', '❌ You need the **Manage Server** permission to reset the counter.'));
        return;
      }
      const start = await resetCounting(message.guild.id, cfg);
      await message.reply(tr(L, `🔄 Contador reiniciado desde **${start}**.`, `🔄 Counter reset from **${start}**.`));
      return;
    }

    if (sub === 'iniciar' || sub === 'start' || sub === 'anunciar') {
      if (!isStaff) {
        await message.reply(tr(L, '❌ Necesitas permiso de **Gestionar Servidor** para iniciar el contador.', '❌ You need the **Manage Server** permission to start the counter.'));
        return;
      }
      if (!cfg.counting_channel_id) {
        await message.reply(tr(L, '❌ No hay canal contador configurado (dashboard → Contador).', '❌ No counting channel is configured (dashboard → Counting).'));
        return;
      }
      const channel = message.guild.channels.cache.get(cfg.counting_channel_id);
      if (!channel || !channel.isTextBased()) {
        await message.reply(tr(L, '❌ El canal contador configurado ya no existe o no es de texto.', '❌ The configured counting channel no longer exists or is not a text channel.'));
        return;
      }
      await announceStart(channel as import('discord.js').TextChannel, cfg, message.author.tag, message.author.displayAvatarURL());
      await message.reply(tr(L, '✅ Mensaje de inicio enviado al canal contador.', '✅ Start message sent to the counting channel.'));
      return;
    }

    // Estado por defecto.
    const status = await getCountingStatus(message.guild.id, cfg);
    const embed = new EmbedBuilder()
      .setColor(status.enabled ? BOT_COLORS.primary : BOT_COLORS.danger)
      .setTitle(tr(L, '🔢 Contador', '🔢 Counter'))
      .addFields(
        { name: tr(L, 'Estado', 'Status'), value: status.enabled ? tr(L, '✅ Activado', '✅ Enabled') : tr(L, '❌ Desactivado', '❌ Disabled'), inline: true },
        { name: tr(L, 'Canal', 'Channel'), value: status.channelId ? `<#${status.channelId}>` : tr(L, 'Sin configurar', 'Not configured'), inline: true },
        { name: tr(L, 'Estilo', 'Style'), value: status.style === 'sum' ? tr(L, '➕ Suma (el bot pregunta)', '➕ Sum (bot asks)') : tr(L, '🔢 Tradicional (1, 2, 3...)', '🔢 Traditional (1, 2, 3...)'), inline: true },
        { name: tr(L, 'Cuenta actual', 'Current count'), value: `**${status.current}**`, inline: true },
        { name: tr(L, 'Inicio', 'Start'), value: `${status.start}`, inline: true },
        { name: tr(L, 'Último en contar', 'Last to count'), value: status.lastUserId ? `<@${status.lastUserId}>` : tr(L, 'Nadie todavía', 'Nobody yet'), inline: true },
      )
      .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
};

export default command;
