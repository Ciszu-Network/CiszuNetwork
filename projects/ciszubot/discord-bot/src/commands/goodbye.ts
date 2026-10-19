import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { langOf, tr } from '../services/i18n';

const command: BotCommand = {
  name: 'goodbye',
  description: 'Configura el mensaje de despedida',
  aliases: ['despedida'],
  usage: 'cz!goodbye [channel #canal|off | message texto | test]',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('goodbye')
    .setDescription('Configura el mensaje de despedida')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) =>
      s
        .setName('channel')
        .setDescription('Canal de despedidas (off para desactivar)')
        .addChannelOption((o) => o.setName('canal').setDescription('Canal').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('message')
        .setDescription('Mensaje de despedida ({user} {guild} {members})')
        .addStringOption((o) => o.setName('texto').setDescription('Texto').setRequired(true)),
    )
    .addSubcommand((s) => s.setName('test').setDescription('Prueba el mensaje de despedida'))
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la configuración actual')),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();

    if (!sub || sub === 'status') {
      const embed = new EmbedBuilder()
        .setColor(cfg.goodbye_channel_id ? '#22c55e' : '#6b7280')
        .setTitle(tr(L, '👋 Despedidas', '👋 Goodbyes'))
        .setDescription(
          `**Canal:** ${cfg.goodbye_channel_id ? `<#${cfg.goodbye_channel_id}>` : 'no configurado'}\n` +
            `**Mensaje:** ${cfg.goodbye_message}\n\n` +
            'Variables: `{user}` `{username}` `{guild}` `{members}`\n' +
            tr(L, 'Configura: `cz!goodbye channel #canal` · `cz!goodbye message Adiós {user}` · `cz!goodbye test`', 'Configure: `cz!goodbye channel #channel` · `cz!goodbye message Goodbye {user}` · `cz!goodbye test`'),
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
        await updateGuildConfig(guildId, { goodbye_channel_id: null });
        await message.reply(tr(L, '✅ Despedidas desactivadas.', '✅ Goodbyes disabled.'));
        return;
      }
      const channelId = message.mentions?.channels?.first()?.id;
      if (!channelId) {
        await message.reply('❌ Uso: `cz!goodbye channel #canal` o `cz!goodbye channel off`.');
        return;
      }
      await updateGuildConfig(guildId, { goodbye_channel_id: channelId });
      await message.reply(`✅ Canal de despedidas: <#${channelId}>.`);
      return;
    }

    if (sub === 'message') {
      const text = args.slice(1).join(' ').trim();
      if (!text) {
        await message.reply('❌ Uso: `cz!goodbye message <texto>`.');
        return;
      }
      await updateGuildConfig(guildId, { goodbye_message: text.slice(0, 500) });
      await message.reply('✅ Mensaje de despedida guardado.');
      return;
    }

    if (sub === 'test') {
      const text = (cfg.goodbye_message ?? 'Adiós {user}')
        .replaceAll('{user}', message.author.username)
        .replaceAll('{username}', message.author.username)
        .replaceAll('{guild}', message.guild.name)
        .replaceAll('{members}', String(message.guild.memberCount));
      await message.reply(`🧪 **Prueba de despedida:**\n${text}`);
      return;
    }

    await message.reply('❌ Subcomandos: `channel`, `message`, `test`, `status`.');
  },
};

export default command;
