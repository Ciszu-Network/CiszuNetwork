import {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  GuildMember,
} from 'discord.js';
import type { BotCommand } from '../types/command';
import { getSupabase } from '../services/supabase';

const kick = (): BotCommand => ({
  name: 'kick',
  description: 'Expulsa a un miembro del servidor',
  aliases: ['expulsar'],
  usage: 'cz!kick @usuario [razón]',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.KickMembers],
  slashCommand: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un miembro')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true))
    .addStringOption((o) => o.setName('razon').setDescription('Razón').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      await message.reply('❌ Necesitas permiso de **Expulsar Miembros**.');
      return;
    }
    const target = message.mentions?.users?.first() ?? (await message.client.users.fetch(args[0]).catch(() => null));
    if (!target) {
      await message.reply('❌ Uso: `cz!kick @usuario [razón]`');
      return;
    }
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await message.reply('❌ Ese usuario no está en el servidor.');
      return;
    }
    const reason = args.slice(1).join(' ') || 'Sin razón';
    await member.kick(reason);
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('👢 Miembro expulsado')
      .setDescription(`**${target.tag}** fue expulsado.\n**Razón:** ${reason}`)
      .setFooter({ text: `Por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const ban = (): BotCommand => ({
  name: 'ban',
  description: 'Banea a un miembro del servidor',
  aliases: ['banear'],
  usage: 'cz!ban @usuario [razón]',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.BanMembers],
  slashCommand: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un miembro')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true))
    .addStringOption((o) => o.setName('razon').setDescription('Razón').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      await message.reply('❌ Necesitas permiso de **Banear Miembros**.');
      return;
    }
    const target = message.mentions?.users?.first() ?? (await message.client.users.fetch(args[0]).catch(() => null));
    if (!target) {
      await message.reply('❌ Uso: `cz!ban @usuario [razón]`');
      return;
    }
    const reason = args.slice(1).join(' ') || 'Sin razón';
    await message.guild.bans.create(target.id, { reason });
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🔨 Miembro baneado')
      .setDescription(`**${target.tag}** fue baneado.\n**Razón:** ${reason}`)
      .setFooter({ text: `Por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const unban = (): BotCommand => ({
  name: 'unban',
  description: 'Desbanea a un usuario (ID)',
  aliases: ['desbanear'],
  usage: 'cz!unban <id>',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.BanMembers],
  slashCommand: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbanea a un usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((o) => o.setName('id').setDescription('ID del usuario').setRequired(true)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      await message.reply('❌ Necesitas permiso de **Banear Miembros**.');
      return;
    }
    const id = (args[0] ?? '').trim();
    if (!/^\d{17,20}$/.test(id)) {
      await message.reply('❌ Uso: `cz!unban <id>`');
      return;
    }
    await message.guild.bans.remove(id).catch(() => undefined);
    await message.reply(`✅ Usuario <@${id}> desbaneado.`);
  },
});

const mute = (): BotCommand => ({
  name: 'mute',
  description: 'Silencia a un miembro (por defecto 10 min)',
  aliases: ['silenciar', 'timeout'],
  usage: 'cz!mute @usuario [minutos] [razón]',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.ModerateMembers],
  slashCommand: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Silencia a un miembro')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true))
    .addIntegerOption((o) => o.setName('minutos').setDescription('Duración en minutos').setRequired(false))
    .addStringOption((o) => o.setName('razon').setDescription('Razón').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Miembros**.');
      return;
    }
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply('❌ Uso: `cz!mute @usuario [minutos] [razón]`');
      return;
    }
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) return;
    const minutes = parseInt(args[1] ?? '10', 10) || 10;
    const reason = args.slice(2).join(' ') || 'Sin razón';
    await member.timeout(minutes * 60_000, reason);
    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle('🔇 Miembro silenciado')
      .setDescription(`**${target.tag}** silenciado por **${minutes} min**.\n**Razón:** ${reason}`)
      .setFooter({ text: `Por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const unmute = (): BotCommand => ({
  name: 'unmute',
  description: 'Quita el silencio a un miembro',
  aliases: ['desmutear', 'untimeout'],
  usage: 'cz!unmute @usuario',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.ModerateMembers],
  slashCommand: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Quita el silencio a un miembro')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Miembros**.');
      return;
    }
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply('❌ Uso: `cz!unmute @usuario`');
      return;
    }
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) return;
    await member.timeout(null);
    await message.reply(`✅ **${target.tag}** ya no está silenciado.`);
  },
});

const warn = (): BotCommand => ({
  name: 'warn',
  description: 'Avisa (warn) a un miembro',
  aliases: ['advertir'],
  usage: 'cz!warn @usuario [razón]',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.ModerateMembers],
  slashCommand: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avisa a un miembro')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true))
    .addStringOption((o) => o.setName('razon').setDescription('Razón').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Miembros**.');
      return;
    }
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply('❌ Uso: `cz!warn @usuario [razón]`');
      return;
    }
    const reason = args.slice(1).join(' ') || 'Sin razón';
    const db = getSupabase();
    await db.from('warns').insert({
      guild_id: message.guild.id,
      user_id: target.id,
      moderator: message.author.id,
      reason,
    });
    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle('⚠️ Aviso a miembro')
      .setDescription(`**${target.tag}** fue avisado.\n**Razón:** ${reason}`)
      .setFooter({ text: `Por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const warns = (): BotCommand => ({
  name: 'warns',
  description: 'Muestra los avisos de un miembro',
  aliases: ['avisos'],
  usage: 'cz!warns @usuario',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.ModerateMembers],
  slashCommand: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Muestra los avisos de un miembro')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true)),
  async execute(message, args) {
    if (!message.guild) return;
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply('❌ Uso: `cz!warns @usuario`');
      return;
    }
    const db = getSupabase();
    const { data } = await db.from('warns').select('*').eq('guild_id', message.guild.id).eq('user_id', target.id).order('created_at', { ascending: false });
    const warns = (data ?? []) as Array<{ id: string; reason: string; moderator: string; created_at: string }>;
    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle(`⚠️ Avisos de ${target.tag} (${warns.length})`)
      .setDescription(
        warns.length > 0
          ? warns.map((w) => `\`#${w.id}\` — ${w.reason} (por <@${w.moderator}> • <t:${Math.floor(new Date(w.created_at).getTime() / 1000)}:R>)`).join('\n')
          : 'Sin avisos. 🎉'
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const purge = (): BotCommand => ({
  name: 'purge',
  description: 'Borra mensajes en masa (máx. 100)',
  aliases: ['clear', 'limpiar', 'prune'],
  usage: 'cz!purge <cantidad>',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.ManageMessages],
  slashCommand: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Borra mensajes en masa')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((o) => o.setName('cantidad').setDescription('1-100').setRequired(true)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Mensajes**.');
      return;
    }
    const amount = parseInt(args[0] ?? '', 10);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      await message.reply('❌ Uso: `cz!purge <cantidad 1-100>`');
      return;
    }
    if (message.channel && 'bulkDelete' in message.channel) {
      await (message.channel as { bulkDelete: (n: number) => Promise<unknown> }).bulkDelete(amount + 1);
      await message.reply(`✅ Borré **${amount}** mensajes.`).catch(() => undefined);
    }
  },
});

export default [kick, ban, unban, mute, unmute, warn, warns, purge];
