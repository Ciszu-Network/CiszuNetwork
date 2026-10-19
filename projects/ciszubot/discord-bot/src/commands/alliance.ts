import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig, AllianceConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { getTopAlliancePoints, getAlliancePoints } from '../services/alliances';
import { formatCoins } from '../services/configService';
import { langOf, tr } from '../services/i18n';

const EMBED_FIELDS = ['title', 'description', 'color'] as const;

/** Sistema de alianzas: canal dedicado + puntos + filtros + recompensas. */
const command: BotCommand = {
  name: 'alliance',
  description: 'Sistema de alianzas (canal, puntos, filtros, recompensas)',
  aliases: ['alianzas', 'alianza'],
  usage: 'cz!alliance [status|on|off|channel #canal|role @rol|notify @rol|cooldown h|oneper on|off|allow18 on|off|word add|remove x|block <id>|unblock <id>|sanction tipo min|embed success|error campo valor|reward pts [@rol] [dinero]|top]',
  category: 'Social',
  slashCommand: new SlashCommandBuilder()
    .setName('alliance')
    .setDescription('Sistema de alianzas')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la configuración'))
    .addSubcommand((s) => s.setName('on').setDescription('Activa el sistema de alianzas'))
    .addSubcommand((s) => s.setName('off').setDescription('Desactiva el sistema de alianzas'))
    .addSubcommand((s) =>
      s
        .setName('channel')
        .setDescription('Canal de alianzas')
        .addChannelOption((o) => o.setName('canal').setDescription('Canal').setRequired(true)),
    )
    .addSubcommand((s) => s.setName('top').setDescription('Leaderboard de puntos de alianza')),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const config: AllianceConfig = cfg.alliance_config;
    const sub = (args[0] ?? '').toLowerCase();

    const statusEmbed = async () => {
      const embed = new EmbedBuilder()
        .setColor(config.enabled ? '#22c55e' : '#6b7280')
        .setTitle(tr(L, '🤝 Sistema de alianzas', '🤝 Alliance system'))
        .setDescription(
          `**Estado:** ${config.enabled ? '✅ Activado' : '⛔ Desactivado'}\n` +
            `**Canal:** ${config.channel_id ? `<#${config.channel_id}>` : 'no configurado'}\n` +
            `**Rango para publicar:** ${config.role_id ? `<@&${config.role_id}>` : 'cualquiera'}\n` +
            `**Rol de aviso:** ${config.notify_role_id ? `<@&${config.notify_role_id}>` : 'ninguno'}\n` +
            `**Cooldown:** ${config.cooldown_hours > 0 ? `${config.cooldown_hours}h` : 'sin cooldown'}\n` +
            `**1 anuncio por servidor:** ${config.one_per_server ? 'sí' : 'no'}\n` +
            `**Servidores +18:** ${config.allow_nsfw ? 'permitidos' : 'bloqueados'}\n` +
            `**Sanción por servidor bloqueado:** ${config.sanction}${config.sanction === 'mute' ? ` (${config.sanction_minutes} min)` : ''}\n` +
            `**Palabras bloqueadas:** ${config.blocked_words.length}\n**Servidores bloqueados:** ${config.blocked_servers.length}\n` +
            `**Recompensas:** ${config.rewards.length > 0 ? config.rewards.map((r) => `${r.points} pts${r.role_id ? ` → <@&${r.role_id}>` : ''}${r.money ? ` + ${formatCoins(cfg, r.money)}` : ''}`).join(' · ') : 'ninguna'}`,
        )
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    };

    if (!sub || sub === 'status') {
      await statusEmbed();
      return;
    }

    if (sub === 'top') {
      const top = await getTopAlliancePoints(guildId);
      const mine = await getAlliancePoints(guildId, message.author.id);
      const embed = new EmbedBuilder()
        .setColor('#22c55e')
        .setTitle(tr(L, '🏆 Leaderboard de alianzas', '🏆 Alliance leaderboard'))
        .setDescription(
          top.length > 0
            ? top.map((t, i) => `**${i + 1}.** <@${t.userId}> — **${t.points}** punto(s)`).join('\n')
            : 'Todavía no hay alianzas registradas.',
        )
        .addFields({ name: 'Tus puntos', value: String(mine), inline: true })
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    const save = (patch: Partial<AllianceConfig>) => updateGuildConfig(guildId, { alliance_config: { ...config, ...patch } });

    if (sub === 'on' || sub === 'off') {
      await save({ enabled: sub === 'on' });
      await message.reply(`✅ Sistema de alianzas ${sub === 'on' ? 'activado' : 'desactivado'}.`);
      return;
    }

    if (sub === 'channel') {
      const channelId = message.mentions?.channels?.first()?.id;
      if (!channelId) {
        await message.reply(tr(L, '❌ Uso: `cz!alliance channel #canal`.', '❌ Usage: `cz!alliance channel #channel`.'));
        return;
      }
      await save({ channel_id: channelId, enabled: true });
      await message.reply(`✅ Canal de alianzas: <#${channelId}> (sistema activado).`);
      return;
    }

    if (sub === 'role' || sub === 'notify') {
      const roleId = message.mentions?.roles?.first()?.id ?? null;
      if ((args[1] ?? '').toLowerCase() === 'off') {
        await save(sub === 'role' ? { role_id: null } : { notify_role_id: null });
        await message.reply(tr(L, '✅ Rol quitado.', '✅ Role removed.'));
        return;
      }
      if (!roleId) {
        await message.reply(`❌ Uso: \`cz!alliance ${sub} @rol\` o \`cz!alliance ${sub} off\`.`);
        return;
      }
      await save(sub === 'role' ? { role_id: roleId } : { notify_role_id: roleId });
      await message.reply(`✅ ${sub === 'role' ? 'Rango para publicar' : 'Rol de aviso'}: <@&${roleId}>.`);
      return;
    }

    if (sub === 'cooldown') {
      const hours = parseInt(args[1] ?? '', 10);
      if (isNaN(hours) || hours < 0 || hours > 8760) {
        await message.reply(tr(L, '❌ Uso: `cz!alliance cooldown <horas>` (0 = sin cooldown).', '❌ Usage: `cz!alliance cooldown <hours>` (0 = no cooldown).'));
        return;
      }
      await save({ cooldown_hours: hours });
      await message.reply(hours === 0 ? tr(L, '✅ Sin cooldown: 1 anuncio por usuario.', '✅ No cooldown: 1 ad per user.') : `✅ Cooldown: **${hours}h** por usuario.`);
      return;
    }

    if (sub === 'oneper' || sub === 'allow18') {
      const mode = (args[1] ?? '').toLowerCase();
      if (mode !== 'on' && mode !== 'off') {
        await message.reply(`❌ Uso: \`cz!alliance ${sub} on|off\`.`);
        return;
      }
      await save(sub === 'oneper' ? { one_per_server: mode === 'on' } : { allow_nsfw: mode === 'on' });
      await message.reply(`✅ ${sub === 'oneper' ? '1 anuncio por servidor' : 'Servidores +18'}: **${mode === 'on' ? 'sí' : 'no'}**.`);
      return;
    }

    if (sub === 'word') {
      const action = (args[1] ?? '').toLowerCase();
      const word = args.slice(2).join(' ').trim().toLowerCase();
      if ((action !== 'add' && action !== 'remove') || !word) {
        await message.reply(tr(L, '❌ Uso: `cz!alliance word add|remove <palabra>`.', '❌ Usage: `cz!alliance word add|remove <word>`.'));
        return;
      }
      const words =
        action === 'add'
          ? Array.from(new Set([...config.blocked_words, word])).slice(0, 200)
          : config.blocked_words.filter((w) => w !== word);
      await save({ blocked_words: words });
      await message.reply(`✅ Palabra **${word}** ${action === 'add' ? 'añadida' : 'quitada'} (${words.length} total).`);
      return;
    }

    if (sub === 'block' || sub === 'unblock') {
      const serverId = (args[1] ?? '').trim();
      if (!/^\d{17,20}$/.test(serverId)) {
        await message.reply(`❌ Uso: \`cz!alliance ${sub} <id del servidor>\`.`);
        return;
      }
      const servers =
        sub === 'block'
          ? Array.from(new Set([...config.blocked_servers, serverId])).slice(0, 500)
          : config.blocked_servers.filter((s) => s !== serverId);
      await save({ blocked_servers: servers });
      await message.reply(`✅ Servidor \`${serverId}\` ${sub === 'block' ? 'bloqueado' : 'desbloqueado'} (${servers.length} total).`);
      return;
    }

    if (sub === 'sanction') {
      const type = (args[1] ?? '').toLowerCase();
      const minutes = parseInt(args[2] ?? '1440', 10);
      if (!['none', 'mute', 'kick', 'ban'].includes(type)) {
        await message.reply(tr(L, '❌ Uso: `cz!alliance sanction none|mute|kick|ban [minutos]`.', '❌ Usage: `cz!alliance sanction none|mute|kick|ban [minutes]`.'));
        return;
      }
      await save({ sanction: type as AllianceConfig['sanction'], sanction_minutes: isNaN(minutes) ? 1440 : minutes });
      await message.reply(`✅ Sanción por servidor bloqueado: **${type}**${type === 'mute' ? ` (${minutes} min)` : ''}.`);
      return;
    }

    if (sub === 'embed') {
      const which = (args[1] ?? '').toLowerCase();
      const field = (args[2] ?? '').toLowerCase();
      const value = args.slice(3).join(' ').trim();
      if ((which !== 'success' && which !== 'error') || !EMBED_FIELDS.includes(field as (typeof EMBED_FIELDS)[number]) || !value) {
        await message.reply('❌ Uso: `cz!alliance embed success|error title|description|color <valor>`.');
        return;
      }
      const current = which === 'success' ? config.embed_success : config.embed_error;
      const next = { ...current, [field]: value.slice(0, 500) };
      await save(which === 'success' ? { embed_success: next } : { embed_error: next });
      await message.reply(
        `✅ Embed de ${which === 'success' ? 'éxito' : 'error'} → **${field}** actualizado.\nVariables: {user} {username} {server} {invite} {points} {members} {reason}`,
      );
      return;
    }

    if (sub === 'reward') {
      const points = parseInt(args[1] ?? '', 10);
      const roleId = message.mentions?.roles?.first()?.id;
      const money = parseInt(args.find((a) => /^\d{2,}$/.test(a) && Number(a) !== points) ?? '', 10);
      if (isNaN(points) || points < 1) {
        await message.reply(tr(L, '❌ Uso: `cz!alliance reward <puntos> [@rol] [dinero]` (ej: `cz!alliance reward 5 @Aliado 500`).', '❌ Usage: `cz!alliance reward <points> [@role] [money]` (e.g.: `cz!alliance reward 5 @Ally 500`).'));
        return;
      }
      const rewards = [...config.rewards.filter((r) => r.points !== points), { points, role_id: roleId, money: isNaN(money) ? undefined : money }];
      await save({ rewards });
      await message.reply(`✅ Recompensa a los **${points}** puntos: ${roleId ? `<@&${roleId}>` : '—'}${!isNaN(money) ? ` + ${formatCoins(cfg, money)}` : ''}.`);
      return;
    }

    await message.reply('❌ Subcomandos: `status`, `on`, `off`, `channel`, `role`, `notify`, `cooldown`, `oneper`, `allow18`, `word`, `block`, `unblock`, `sanction`, `embed`, `reward`, `top`.');
  },
};

export default command;
