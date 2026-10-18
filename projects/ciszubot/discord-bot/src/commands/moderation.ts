import {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  GuildMember,
  DiscordAPIError,
} from 'discord.js';
import type { BotCommand } from '../types/command';
import { db, ciszubotSchema, eq, and, desc } from '../services/supabase';
import { getGuildConfig } from '../services/configService';

/** Mensaje claro para errores de jerarquía/permisos (admins, bots, rol superior). */
function hierarchyError(action: string, error: unknown): string {
  if (error instanceof DiscordAPIError && error.code === 50013) {
    return `❌ No puedo ${action}: el usuario es **administrador**, un **bot**, o tiene un rol **igual o superior** al mío. Sube el rol de CiszuBot en la jerarquía del servidor.`;
  }
  return `❌ No se pudo ${action} (revisa mis permisos y la jerarquía de roles).`;
}

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
    try {
      await member.kick(reason);
    } catch (error) {
      await message.reply(hierarchyError('expulsar a ese miembro', error));
      return;
    }
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
    try {
      await message.guild.bans.create(target.id, { reason });
    } catch (error) {
      await message.reply(hierarchyError('banear a ese usuario', error));
      return;
    }
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
  description: 'Silencia a un miembro de forma INDEFINIDA (rol de mute)',
  aliases: ['silenciar'],
  usage: 'cz!mute @usuario [razón]',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.ModerateMembers],
  slashCommand: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Silencia a un miembro de forma indefinida (rol de mute)')
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
      await message.reply('❌ Uso: `cz!mute @usuario [razón]` (indefinido; para tiempo usa `cz!tempmute`)');
      return;
    }
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) return;

    // Mute INDEFINIDO: se asigna el rol de mute configurado (cz!mute).
    // Para silencios con duración está `cz!tempmute`.
    const cfg = await getGuildConfig(message.guild.id);
    if (!cfg.mute_role_id) {
      await message.reply('❌ No hay un **rol de mute** configurado. Configúralo en el dashboard (sección General → Roles del servidor) o usa `cz!tempmute @usuario 10m`.');
      return;
    }
    const role = message.guild.roles.cache.get(cfg.mute_role_id);
    if (!role) {
      await message.reply('❌ El rol de mute configurado ya no existe. Vuelve a configurarlo.');
      return;
    }
    const reason = args.slice(1).join(' ') || 'Sin razón';
    try {
      await member.roles.add(role, reason);
    } catch (error) {
      await message.reply(hierarchyError('silenciar a ese miembro', error));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle('🔇 Miembro silenciado (indefinido)')
      .setDescription(`**${target.tag}** recibió el rol de mute <@&${role.id}>.\n**Razón:** ${reason}`)
      .setFooter({ text: `Por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

/** Duración estilo 10m / 2h / 1d (para tempmute). */
function parseDuration(raw: string): number | null {
  const match = raw.match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const ms = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  const total = n * ms;
  return total > 0 && total <= 28 * 86_400_000 ? total : null;
}

const tempmute = (): BotCommand => ({
  name: 'tempmute',
  description: 'Silencia temporalmente a un miembro (ej: 10m, 2h, 1d)',
  aliases: ['mute-temp', 'temporal', 'timeout'],
  usage: 'cz!tempmute @usuario <10m|2h|1d> [razón]',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.ModerateMembers],
  slashCommand: new SlashCommandBuilder()
    .setName('tempmute')
    .setDescription('Silencia temporalmente a un miembro')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true))
    .addStringOption((o) => o.setName('duracion').setDescription('Duración (ej: 10m, 2h, 1d; máx 28d)').setRequired(true))
    .addStringOption((o) => o.setName('razon').setDescription('Razón').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Miembros**.');
      return;
    }
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply('❌ Uso: `cz!tempmute @usuario <10m|2h|1d> [razón]`');
      return;
    }
    const durationMs = parseDuration(args[1] ?? '');
    if (!durationMs) {
      await message.reply('❌ Duración inválida. Formato: `10m`, `2h`, `1d` (máximo 28 días).');
      return;
    }
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) return;
    const reason = args.slice(2).join(' ') || 'Sin razón';
    try {
      await member.timeout(durationMs, reason);
    } catch (error) {
      await message.reply(hierarchyError('silenciar a ese miembro', error));
      return;
    }
    const minutes = Math.round(durationMs / 60_000);
    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle('⏱️ Miembro silenciado temporalmente')
      .setDescription(`**${target.tag}** silenciado por **${args[1]}**.\n**Razón:** ${reason}`)
      .setFooter({ text: `Por ${message.author.tag} • ${minutes} min`, iconURL: message.author.displayAvatarURL() })
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
    await db.insert(ciszubotSchema.warns).values({
      guildId: message.guild.id,
      userId: target.id,
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
    const warns = ciszubotSchema.warns;
    const warnRows = await db
      .select()
      .from(warns)
      .where(and(eq(warns.guildId, message.guild.id), eq(warns.userId, target.id)))
      .orderBy(desc(warns.createdAt));
    const warnList = warnRows.map((w) => ({
      id: w.id,
      reason: w.reason,
      moderator: w.moderator,
      created_at: w.createdAt.toISOString(),
    }));
    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle(`⚠️ Avisos de ${target.tag} (${warnList.length})`)
      .setDescription(
        warnList.length > 0
          ? warnList
              .slice(0, 40)
              .map((w) => `\`#${w.id}\` — ${w.reason} (por <@${w.moderator}> • <t:${Math.floor(new Date(w.created_at).getTime() / 1000)}:R>)`)
              .join('\n')
              .slice(0, 4000) + (warnList.length > 40 ? `\n…y ${warnList.length - 40} más.` : '')
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

export default [kick, ban, unban, mute, tempmute, unmute, warn, warns, purge];
