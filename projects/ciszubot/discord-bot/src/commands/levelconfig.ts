import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';

/** Niveles reales: mensaje personalizado + roles por nivel. */
const command: BotCommand = {
  name: 'levelconfig',
  description: 'Configura el sistema de niveles (mensaje y roles por nivel)',
  aliases: ['nivelesconfig', 'lvlconfig'],
  usage: 'cz!levelconfig [on|off | channel #canal|off | xp 1 | message texto | role 5 @rol | status]',
  category: 'Niveles',
  slashCommand: new SlashCommandBuilder()
    .setName('levelconfig')
    .setDescription('Configura el sistema de niveles')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la configuración'))
    .addSubcommand((s) => s.setName('on').setDescription('Activa los niveles'))
    .addSubcommand((s) => s.setName('off').setDescription('Desactiva los niveles'))
    .addSubcommand((s) =>
      s
        .setName('channel')
        .setDescription('Canal de anuncios de subida de nivel (off = mismo canal)')
        .addChannelOption((o) => o.setName('canal').setDescription('Canal').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('xp')
        .setDescription('Multiplicador de XP (1-10)')
        .addIntegerOption((o) => o.setName('rate').setDescription('Multiplicador').setRequired(true).setMinValue(1).setMaxValue(10)),
    )
    .addSubcommand((s) =>
      s
        .setName('message')
        .setDescription('Mensaje de subida ({user} {level} {guild})')
        .addStringOption((o) => o.setName('texto').setDescription('Texto o "reset"').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('role')
        .setDescription('Rol que se da al alcanzar un nivel')
        .addIntegerOption((o) => o.setName('nivel').setDescription('Nivel').setRequired(true).setMinValue(1))
        .addRoleOption((o) => o.setName('rol').setDescription('Rol').setRequired(true)),
    ),

  async execute(message, args) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();

    const statusEmbed = () =>
      new EmbedBuilder()
        .setColor(cfg.leveling_enabled ? '#22c55e' : '#6b7280')
        .setTitle('📈 Niveles')
        .setDescription(
          `**Estado:** ${cfg.leveling_enabled ? '✅ Activado' : '⛔ Desactivado'}\n` +
            `**Canal de anuncios:** ${cfg.level_channel_id ? `<#${cfg.level_channel_id}>` : 'el mismo canal'}\n` +
            `**Multiplicador XP:** x${cfg.xp_rate}\n` +
            `**Mensaje:** ${cfg.level_message}\n\n` +
            `**Roles por nivel:**\n${
              cfg.level_roles.length > 0
                ? cfg.level_roles
                    .sort((a, b) => a.level - b.level)
                    .map((r) => `• Nivel ${r.level} → <@&${r.role_id}>`)
                    .join('\n')
                : 'ninguno'
            }\n\n` +
            'Configura: `cz!levelconfig on` · `cz!levelconfig role 5 @rol` · `cz!levelconfig message {user} subió a {level}!`',
        )
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

    if (!sub || sub === 'status') {
      await message.reply({ embeds: [statusEmbed()] });
      return;
    }

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    if (sub === 'on' || sub === 'off') {
      await updateGuildConfig(guildId, { leveling_enabled: sub === 'on' });
      await message.reply(`✅ Niveles ${sub === 'on' ? 'activados' : 'desactivados'}.`);
      return;
    }

    if (sub === 'channel') {
      const raw = (args[1] ?? '').toLowerCase();
      if (raw === 'off') {
        await updateGuildConfig(guildId, { level_channel_id: null });
        await message.reply('✅ Los anuncios de nivel se enviarán en el mismo canal del mensaje.');
        return;
      }
      const channelId = message.mentions?.channels?.first()?.id;
      if (!channelId) {
        await message.reply('❌ Uso: `cz!levelconfig channel #canal` o `cz!levelconfig channel off`.');
        return;
      }
      await updateGuildConfig(guildId, { level_channel_id: channelId });
      await message.reply(`✅ Canal de anuncios de nivel: <#${channelId}>.`);
      return;
    }

    if (sub === 'xp') {
      const rate = parseInt(args[1] ?? '', 10);
      if (isNaN(rate) || rate < 1 || rate > 10) {
        await message.reply('❌ Uso: `cz!levelconfig xp <1-10>`.');
        return;
      }
      await updateGuildConfig(guildId, { xp_rate: rate });
      await message.reply(`✅ Multiplicador de XP: **x${rate}**.`);
      return;
    }

    if (sub === 'message') {
      const text = args.slice(1).join(' ').trim();
      if (!text) {
        await message.reply('❌ Uso: `cz!levelconfig message <texto>` (variables: `{user}` `{level}` `{guild}`) o `reset`.');
        return;
      }
      const value = text.toLowerCase() === 'reset' ? '🎉 ¡{user} subió al nivel {level} en {guild}!' : text.slice(0, 500);
      await updateGuildConfig(guildId, { level_message: value });
      await message.reply('✅ Mensaje de subida de nivel guardado.');
      return;
    }

    if (sub === 'role') {
      const level = parseInt(args[1] ?? '', 10);
      const roleId = message.mentions?.roles?.first()?.id;
      if (isNaN(level) || level < 1 || !roleId) {
        await message.reply('❌ Uso: `cz!levelconfig role <nivel> @rol` (si ya existe ese nivel, se reemplaza).');
        return;
      }
      const roles = [...cfg.level_roles.filter((r) => r.level !== level), { level, role_id: roleId }];
      await updateGuildConfig(guildId, { level_roles: roles });
      await message.reply(`✅ Al nivel **${level}** se dará el rol <@&${roleId}>.`);
      return;
    }

    await message.reply('❌ Subcomandos: `status`, `on`, `off`, `channel`, `xp`, `message`, `role`.');
  },
};

export default command;
