import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';

const command: BotCommand = {
  name: 'starboard',
  description: 'Configura el starboard (mensajes destacados)',
  aliases: ['destacados'],
  usage: 'cz!starboard [channel #canal|off | emoji ⭐ | min 3 | status]',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Configura el starboard')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) =>
      s
        .setName('channel')
        .setDescription('Canal del starboard (off para desactivar)')
        .addChannelOption((o) => o.setName('canal').setDescription('Canal').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('emoji')
        .setDescription('Emoji para destacar')
        .addStringOption((o) => o.setName('emoji').setDescription('Emoji (ej: ⭐)').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('min')
        .setDescription('Mínimo de reacciones para destacar')
        .addIntegerOption((o) => o.setName('cantidad').setDescription('Mínimo').setRequired(true).setMinValue(1)),
    )
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la configuración actual')),

  async execute(message, args) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();

    if (!sub || sub === 'status') {
      const embed = new EmbedBuilder()
        .setColor(cfg.starboard_channel_id ? '#22c55e' : '#6b7280')
        .setTitle(`${cfg.starboard_emoji} Starboard`)
        .setDescription(
          `**Canal:** ${cfg.starboard_channel_id ? `<#${cfg.starboard_channel_id}>` : 'no configurado'}\n` +
            `**Emoji:** ${cfg.starboard_emoji}\n**Mínimo:** ${cfg.starboard_min} reacción(es)\n\n` +
            'Configura: `cz!starboard channel #canal` · `cz!starboard emoji ⭐` · `cz!starboard min 3`',
        )
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    if (sub === 'channel') {
      const raw = (args[1] ?? '').toLowerCase();
      if (raw === 'off' || raw === 'disable') {
        await updateGuildConfig(guildId, { starboard_channel_id: null });
        await message.reply('✅ Starboard desactivado.');
        return;
      }
      const channelId = message.mentions?.channels?.first()?.id;
      if (!channelId) {
        await message.reply('❌ Uso: `cz!starboard channel #canal` o `cz!starboard channel off`.');
        return;
      }
      await updateGuildConfig(guildId, { starboard_channel_id: channelId });
      await message.reply(`✅ Canal del starboard: <#${channelId}>.`);
      return;
    }

    if (sub === 'emoji') {
      const emoji = (args[1] ?? '').trim();
      if (!emoji || emoji.length > 64) {
        await message.reply('❌ Uso: `cz!starboard emoji ⭐`.');
        return;
      }
      await updateGuildConfig(guildId, { starboard_emoji: emoji });
      await message.reply(`✅ Emoji del starboard: ${emoji}`);
      return;
    }

    if (sub === 'min') {
      const min = parseInt(args[1] ?? '', 10);
      if (isNaN(min) || min < 1 || min > 100) {
        await message.reply('❌ Uso: `cz!starboard min <1-100>`.');
        return;
      }
      await updateGuildConfig(guildId, { starboard_min: min });
      await message.reply(`✅ Mínimo de reacciones: **${min}**.`);
      return;
    }

    await message.reply('❌ Subcomandos: `channel`, `emoji`, `min`, `status`.');
  },
};

export default command;
