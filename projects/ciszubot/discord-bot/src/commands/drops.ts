import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig, DropsConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { getDropStats } from '../services/drops';
import { isPremiumGuild } from '../services/featureFlags';

/** Configuración de drops (dinero que cae en canales y se reclama con un botón). */
const command: BotCommand = {
  name: 'drops',
  description: 'Configura los drops de dinero del servidor (staff)',
  aliases: ['dropsconfig', 'caidas'],
  usage: 'cz!drops [on|off|channel #canal|amount min max|interval min max|message texto|exclude @rol]',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName('drops')
    .setDescription('Configura los drops de dinero del servidor')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la configuración actual'))
    .addSubcommand((s) => s.setName('on').setDescription('Activa los drops'))
    .addSubcommand((s) => s.setName('off').setDescription('Desactiva los drops'))
    .addSubcommand((s) =>
      s
        .setName('channel')
        .setDescription('Añade o quita un canal de drops')
        .addChannelOption((o) => o.setName('canal').setDescription('Canal').setRequired(true))
        .addStringOption((o) =>
          o
            .setName('accion')
            .setDescription('add o remove')
            .setRequired(false)
            .addChoices({ name: 'Añadir', value: 'add' }, { name: 'Quitar', value: 'remove' }),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('amount')
        .setDescription('Rango de dinero por drop')
        .addIntegerOption((o) => o.setName('min').setDescription('Mínimo').setRequired(true))
        .addIntegerOption((o) => o.setName('max').setDescription('Máximo').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('interval')
        .setDescription('Intervalo entre drops (minutos)')
        .addIntegerOption((o) => o.setName('min').setDescription('Mínimo en minutos').setRequired(true))
        .addIntegerOption((o) => o.setName('max').setDescription('Máximo en minutos').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('message')
        .setDescription('Mensaje personalizado del drop')
        .addStringOption((o) => o.setName('texto').setDescription('Texto o "reset"').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('exclude')
        .setDescription('Excluye un rol de reclamar drops')
        .addRoleOption((o) => o.setName('rol').setDescription('Rol').setRequired(true)),
    ),

  async execute(message, args) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const drops: DropsConfig = cfg.drops;
    const sub = (args[0] ?? '').toLowerCase();

    const statusEmbed = async (): Promise<EmbedBuilder> => {
      const premium = await isPremiumGuild(guildId);
      const stats = getDropStats(guildId);
      return new EmbedBuilder()
        .setColor(drops.enabled ? '#22c55e' : '#6b7280')
        .setTitle('💎 Drops de dinero')
        .setDescription(
          `**Estado:** ${drops.enabled ? '✅ Activados' : '⛔ Desactivados'}\n` +
            `**Canales:** ${drops.channels.length > 0 ? drops.channels.map((c) => `<#${c}>`).join(', ') : 'todos (donde pueda escribir)'}\n` +
            `**Cantidad:** ${drops.min} – ${drops.max} ${cfg.coin_emoji}\n` +
            `**Intervalo:** ${drops.interval_min} – ${drops.interval_max} min\n` +
            `**Roles excluidos:** ${drops.excluded_roles.length > 0 ? drops.excluded_roles.map((r) => `<@&${r}>`).join(', ') : 'ninguno'}\n` +
            `**Mensaje:** ${drops.message ?? 'por defecto'}\n\n` +
            `**Plan:** ${premium ? '⭐ Premium (drops ilimitados)' : '🆓 Free (máx. 3 drops/día)'}\n` +
            `**Hoy:** ${stats.count} drops`,
        )
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
    };

    if (!sub || sub === 'status') {
      await message.reply({ embeds: [await statusEmbed()] });
      return;
    }

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    if (sub === 'on' || sub === 'off') {
      await updateGuildConfig(guildId, { drops: { ...drops, enabled: sub === 'on' } });
      await message.reply(`✅ Drops ${sub === 'on' ? 'activados' : 'desactivados'}.`);
      return;
    }

    if (sub === 'channel') {
      const channelId = message.mentions?.channels?.first()?.id;
      if (!channelId) {
        await message.reply('❌ Uso: `cz!drops channel #canal [remove]`');
        return;
      }
      const remove = (args[1] ?? '').toLowerCase() === 'remove';
      const channels = remove
        ? drops.channels.filter((c) => c !== channelId)
        : Array.from(new Set([...drops.channels, channelId]));
      await updateGuildConfig(guildId, { drops: { ...drops, channels } });
      await message.reply(`✅ Canal <#${channelId}> ${remove ? 'quitado de' : 'añadido a'} los drops.`);
      return;
    }

    if (sub === 'amount') {
      const min = parseInt(args[1] ?? '', 10);
      const max = parseInt(args[2] ?? '', 10);
      if (isNaN(min) || isNaN(max) || min < 1 || max < min || max > 1_000_000) {
        await message.reply('❌ Uso: `cz!drops amount <min> <max>` (ej: `cz!drops amount 50 200`)');
        return;
      }
      await updateGuildConfig(guildId, { drops: { ...drops, min, max } });
      await message.reply(`✅ Cantidad de drops: **${min} – ${max}** ${cfg.coin_emoji}.`);
      return;
    }

    if (sub === 'interval') {
      const min = parseInt(args[1] ?? '', 10);
      const max = parseInt(args[2] ?? '', 10);
      if (isNaN(min) || isNaN(max) || min < 5 || max < min || max > 1440) {
        await message.reply('❌ Uso: `cz!drops interval <min> <max>` en minutos (mínimo 5, máximo 1440).');
        return;
      }
      await updateGuildConfig(guildId, { drops: { ...drops, interval_min: min, interval_max: max } });
      await message.reply(`✅ Intervalo de drops: **${min} – ${max} min**.`);
      return;
    }

    if (sub === 'message') {
      const text = args.slice(1).join(' ').trim();
      if (!text) {
        await message.reply('❌ Uso: `cz!drops message <texto>` o `cz!drops message reset`.');
        return;
      }
      const value = text.toLowerCase() === 'reset' ? null : text.slice(0, 300);
      await updateGuildConfig(guildId, { drops: { ...drops, message: value } });
      await message.reply(value ? '✅ Mensaje de drop personalizado guardado.' : '✅ Mensaje de drop restaurado al por defecto.');
      return;
    }

    if (sub === 'exclude') {
      const roleId = message.mentions?.roles?.first()?.id;
      if (!roleId) {
        await message.reply('❌ Uso: `cz!drops exclude @rol` (repite para quitarlo si ya está).');
        return;
      }
      const excluded = drops.excluded_roles.includes(roleId)
        ? drops.excluded_roles.filter((r) => r !== roleId)
        : [...drops.excluded_roles, roleId];
      await updateGuildConfig(guildId, { drops: { ...drops, excluded_roles: excluded } });
      await message.reply(`✅ Rol <@&${roleId}> ${drops.excluded_roles.includes(roleId) ? 'ya no está' : 'ahora está'} excluido de los drops.`);
      return;
    }

    await message.reply('❌ Subcomandos: `status`, `on`, `off`, `channel`, `amount`, `interval`, `message`, `exclude`.');
  },
};

export default command;
