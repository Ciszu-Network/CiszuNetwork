import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';

function render(text: string, vars: Record<string, string>): string {
  let out = text;
  for (const [key, value] of Object.entries(vars)) out = out.replaceAll(`{${key}}`, value);
  return out;
}

const command: BotCommand = {
  name: 'welcome',
  description: 'Configura el mensaje de bienvenida',
  aliases: ['bienvenida'],
  usage: 'cz!welcome [channel #canal|off | message texto | test]',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configura el mensaje de bienvenida')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) =>
      s
        .setName('channel')
        .setDescription('Canal de bienvenidas (off para desactivar)')
        .addChannelOption((o) => o.setName('canal').setDescription('Canal').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('message')
        .setDescription('Mensaje de bienvenida ({user} {guild} {members} {username})')
        .addStringOption((o) => o.setName('texto').setDescription('Texto').setRequired(true)),
    )
    .addSubcommand((s) => s.setName('test').setDescription('Prueba el mensaje de bienvenida'))
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la configuración actual')),

  async execute(message, args) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();

    if (!sub || sub === 'status') {
      const embed = new EmbedBuilder()
        .setColor(cfg.welcome_channel_id ? '#22c55e' : '#6b7280')
        .setTitle('👋 Bienvenidas')
        .setDescription(
          `**Canal:** ${cfg.welcome_channel_id ? `<#${cfg.welcome_channel_id}>` : 'no configurado'}\n` +
            `**Mensaje:** ${cfg.welcome_message}\n\n` +
            'Variables: `{user}` `{username}` `{guild}` `{members}`\n' +
            'Configura: `cz!welcome channel #canal` · `cz!welcome message Hola {user}!` · `cz!welcome test`',
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
        await updateGuildConfig(guildId, { welcome_channel_id: null });
        await message.reply('✅ Bienvenidas desactivadas.');
        return;
      }
      const channelId = message.mentions?.channels?.first()?.id;
      if (!channelId) {
        await message.reply('❌ Uso: `cz!welcome channel #canal` o `cz!welcome channel off`.');
        return;
      }
      await updateGuildConfig(guildId, { welcome_channel_id: channelId });
      await message.reply(`✅ Canal de bienvenidas: <#${channelId}>.`);
      return;
    }

    if (sub === 'message') {
      const text = args.slice(1).join(' ').trim();
      if (!text) {
        await message.reply('❌ Uso: `cz!welcome message <texto>` (variables: `{user}` `{username}` `{guild}` `{members}`).');
        return;
      }
      await updateGuildConfig(guildId, { welcome_message: text.slice(0, 500) });
      await message.reply('✅ Mensaje de bienvenida guardado.');
      return;
    }

    if (sub === 'test') {
      const text = render(cfg.welcome_message, {
        user: `<@${message.author.id}>`,
        mention: `<@${message.author.id}>`,
        username: message.author.username,
        guild: message.guild.name,
        members: String(message.guild.memberCount),
      });
      await message.reply(`🧪 **Prueba de bienvenida:**\n${text}`);
      return;
    }

    await message.reply('❌ Subcomandos: `channel`, `message`, `test`, `status`.');
  },
};

export default command;
