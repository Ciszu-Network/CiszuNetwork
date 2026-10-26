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
import { langOf, tr } from '../services/i18n';

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
    const L = await langOf(message);
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      await message.reply(tr(L, '❌ Necesitas permiso de **Expulsar Miembros**.', '❌ You need the **Kick Members** permission.'));
      return;
    }
    const target = message.mentions?.users?.first() ?? (await message.client.users.fetch(args[0]).catch(() => null));
    if (!target) {
      await message.reply(tr(L, '❌ Uso: `cz!kick @usuario [razón]`', '❌ Usage: `cz!kick @user [reason]`'));
      return;
    }
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await message.reply(tr(L, '❌ Ese usuario no está en el servidor.', '❌ That user is not in the server.'));
      return;
    }
    const reason = args.slice(1).join(' ') || tr(L, 'Sin razón', 'No reason');
    try {
      await member.kick(reason);
    } catch (error) {
      await message.reply(hierarchyError('expulsar a ese miembro', error));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(tr(L, '👢 Miembro expulsado', '👢 Member kicked'))
      .setDescription(tr(L, `**${target.tag}** fue expulsado.\n**Razón:** ${reason}`, `**${target.tag}** was kicked.\n**Reason:** ${reason}`))
      .setFooter({ text: tr(L, `Por ${message.author.tag}`, `By ${message.author.tag}`), iconURL: message.author.displayAvatarURL() })
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
    const L = await langOf(message);
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      await message.reply(tr(L, '❌ Necesitas permiso de **Banear Miembros**.', '❌ You need the **Ban Members** permission.'));
      return;
    }
    const target = message.mentions?.users?.first() ?? (await message.client.users.fetch(args[0]).catch(() => null));
    if (!target) {
      await message.reply(tr(L, '❌ Uso: `cz!ban @usuario [razón]`', '❌ Usage: `cz!ban @user [reason]`'));
      return;
    }
    const reason = args.slice(1).join(' ') || tr(L, 'Sin razón', 'No reason');
    try {
      await message.guild.bans.create(target.id, { reason });
    } catch (error) {
      await message.reply(hierarchyError('banear a ese usuario', error));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(tr(L, '🔨 Miembro baneado', '🔨 Member banned'))
      .setDescription(tr(L, `**${target.tag}** fue baneado.\n**Razón:** ${reason}`, `**${target.tag}** was banned.\n**Reason:** ${reason}`))
      .setFooter({ text: tr(L, `Por ${message.author.tag}`, `By ${message.author.tag}`), iconURL: message.author.displayAvatarURL() })
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
    const L = await langOf(message);
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      await message.reply(tr(L, '❌ Necesitas permiso de **Banear Miembros**.', '❌ You need the **Ban Members** permission.'));
      return;
    }
    const id = (args[0] ?? '').trim();
    if (!/^\d{17,20}$/.test(id)) {
      await message.reply(tr(L, '❌ Uso: `cz!unban <id>`', '❌ Usage: `cz!unban <id>`'));
      return;
    }
    await message.guild.bans.remove(id).catch(() => undefined);
    await message.reply(tr(L, `✅ Usuario <@${id}> desbaneado.`, `✅ User <@${id}> unbanned.`));
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
    const L = await langOf(message);
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply(tr(L, '❌ Necesitas permiso de **Gestionar Miembros**.', '❌ You need the **Moderate Members** permission.'));
      return;
    }
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply(tr(L, '❌ Uso: `cz!mute @usuario [razón]` (indefinido; para tiempo usa `cz!tempmute`)', '❌ Usage: `cz!mute @user [reason]` (indefinite; for a duration use `cz!tempmute`)'));
      return;
    }
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) return;

    // Mute INDEFINIDO: se asigna el rol de mute configurado (cz!mute).
    // Para silencios con duración está `cz!tempmute`.
    const cfg = await getGuildConfig(message.guild.id);
    const role = cfg.mute_role_id ? message.guild.roles.cache.get(cfg.mute_role_id) : null;
    const reason = args.slice(1).join(' ') || tr(L, 'Sin razón', 'No reason');

    if (role) {
      try {
        await member.roles.add(role, reason);
      } catch (error) {
        await message.reply(hierarchyError('silenciar a ese miembro', error));
        return;
      }
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle(tr(L, '🔇 Miembro silenciado (indefinido)', '🔇 Member muted (indefinite)'))
        .setDescription(tr(L, `**${target.tag}** recibió el rol de mute <@&${role.id}>.\n**Razón:** ${reason}`, `**${target.tag}** received the mute role <@&${role.id}>.\n**Reason:** ${reason}`))
        .setFooter({ text: tr(L, `Por ${message.author.tag}`, `By ${message.author.tag}`), iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    try {
      await member.timeout(28 * 86_400_000, reason);
    } catch (error) {
      await message.reply(hierarchyError('silenciar a ese miembro', error));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor('#facc15')
      .setTitle(tr(L, '⚠️ Mute aplicado sin rol configurado', '⚠️ Mute applied without a configured role'))
      .setDescription(
        tr(
          L,
          `No hay un **rol de mute** configurado, así que **${target.tag}** fue silenciado con timeout de **28 días**.\nConfigura el rol en el dashboard (General → Roles del servidor) para silencios indefinidos.\n**Razón:** ${reason}`,
          `No **mute role** is configured, so **${target.tag}** was muted with a **28-day** timeout.\nSet the role in the dashboard (General → Server roles) for indefinite mutes.\n**Reason:** ${reason}`,
        ),
      )
      .setFooter({ text: tr(L, `Por ${message.author.tag}`, `By ${message.author.tag}`), iconURL: message.author.displayAvatarURL() })
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
    const L = await langOf(message);
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply(tr(L, '❌ Necesitas permiso de **Gestionar Miembros**.', '❌ You need the **Moderate Members** permission.'));
      return;
    }
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply(tr(L, '❌ Uso: `cz!tempmute @usuario <10m|2h|1d> [razón]`', '❌ Usage: `cz!tempmute @user <10m|2h|1d> [reason]`'));
      return;
    }
    const durationMs = parseDuration(args[1] ?? '');
    if (!durationMs) {
      await message.reply(tr(L, '❌ Duración inválida. Formato: `10m`, `2h`, `1d` (máximo 28 días).', '❌ Invalid duration. Format: `10m`, `2h`, `1d` (max 28 days).'));
      return;
    }
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) return;
    const reason = args.slice(2).join(' ') || tr(L, 'Sin razón', 'No reason');
    try {
      await member.timeout(durationMs, reason);
    } catch (error) {
      await message.reply(hierarchyError('silenciar a ese miembro', error));
      return;
    }
    const minutes = Math.round(durationMs / 60_000);
    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle(tr(L, '⏱️ Miembro silenciado temporalmente', '⏱️ Member temporarily muted'))
      .setDescription(tr(L, `**${target.tag}** silenciado por **${args[1]}**.\n**Razón:** ${reason}`, `**${target.tag}** muted for **${args[1]}**.\n**Reason:** ${reason}`))
      .setFooter({ text: tr(L, `Por ${message.author.tag} • ${minutes} min`, `By ${message.author.tag} • ${minutes} min`), iconURL: message.author.displayAvatarURL() })
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
    const L = await langOf(message);
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply(tr(L, '❌ Necesitas permiso de **Gestionar Miembros**.', '❌ You need the **Moderate Members** permission.'));
      return;
    }
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply(tr(L, '❌ Uso: `cz!unmute @usuario`', '❌ Usage: `cz!unmute @user`'));
      return;
    }
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) return;
    const cfg = await getGuildConfig(message.guild.id);
    const role = cfg.mute_role_id ? message.guild.roles.cache.get(cfg.mute_role_id) : null;
    if (role && member.roles.cache.has(role.id)) {
      await member.roles.remove(role, tr(L, `Desilenciado por ${message.author.tag}`, `Unmuted by ${message.author.tag}`)).catch(() => undefined);
    }
    await member.timeout(null).catch(() => undefined);
    await message.reply(tr(L, `✅ **${target.tag}** ya no está silenciado.`, `✅ **${target.tag}** is no longer muted.`));
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
    const L = await langOf(message);
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply(tr(L, '❌ Necesitas permiso de **Gestionar Miembros**.', '❌ You need the **Moderate Members** permission.'));
      return;
    }
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply(tr(L, '❌ Uso: `cz!warn @usuario [razón]`', '❌ Usage: `cz!warn @user [reason]`'));
      return;
    }
    const reason = args.slice(1).join(' ') || tr(L, 'Sin razón', 'No reason');
    const [created] = await db
      .insert(ciszubotSchema.warns)
      .values({
        guildId: message.guild.id,
        userId: target.id,
        moderator: message.author.id,
        reason,
      })
      .returning({ id: ciszubotSchema.warns.id });
    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle(tr(L, '⚠️ Aviso a miembro', '⚠️ Member warned'))
      .setDescription(
        tr(
          L,
          `**${target.tag}** fue avisado.\n**ID:** \`#${created?.id ?? '?'}\`\n**Razón:** ${reason}`,
          `**${target.tag}** was warned.\n**ID:** \`#${created?.id ?? '?'}\`\n**Reason:** ${reason}`,
        ),
      )
      .setFooter({ text: tr(L, `Por ${message.author.tag}`, `By ${message.author.tag}`), iconURL: message.author.displayAvatarURL() })
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
    const L = await langOf(message);
    if (!message.guild) return;
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply(tr(L, '❌ Uso: `cz!warns @usuario`', '❌ Usage: `cz!warns @user`'));
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
      .setTitle(tr(L, `⚠️ Avisos de ${target.tag} (${warnList.length})`, `⚠️ Warnings for ${target.tag} (${warnList.length})`))
      .setDescription(
        warnList.length > 0
          ? warnList
              .slice(0, 40)
              .map((w) => `\`#${w.id}\` — ${w.reason} (por <@${w.moderator}> • <t:${Math.floor(new Date(w.created_at).getTime() / 1000)}:R>)`)
              .join('\n')
              .slice(0, 4000) + (warnList.length > 40 ? tr(L, `\n…y ${warnList.length - 40} más.`, `\n…and ${warnList.length - 40} more.`) : '')
          : tr(L, 'Sin avisos. 🎉', 'No warnings. 🎉')
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const unwarn = (): BotCommand => ({
  name: 'unwarn',
  description: 'Elimina un aviso por su ID',
  aliases: ['delwarn', 'quitarwarn', 'borrarwarn'],
  usage: 'cz!unwarn <id>',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.ModerateMembers],
  slashCommand: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Elimina un aviso por su ID')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addIntegerOption((o) => o.setName('id').setDescription('ID del aviso (cz!warns)').setRequired(true)),
  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply(tr(L, '❌ Necesitas permiso de **Gestionar Miembros**.', '❌ You need the **Moderate Members** permission.'));
      return;
    }
    const id = Number.parseInt((args[0] ?? '').replace('#', ''), 10);
    if (!Number.isInteger(id) || id <= 0) {
      await message.reply(tr(L, '❌ Uso: `cz!unwarn <id>` (mira los IDs con `cz!warns @usuario`)', '❌ Usage: `cz!unwarn <id>` (see IDs with `cz!warns @user`)'));
      return;
    }
    const warnsTable = ciszubotSchema.warns;
    const [removed] = await db
      .delete(warnsTable)
      .where(and(eq(warnsTable.guildId, message.guild.id), eq(warnsTable.id, id)))
      .returning({ id: warnsTable.id, userId: warnsTable.userId });
    if (!removed) {
      await message.reply(tr(L, `❌ No existe el aviso \`#${id}\` en este servidor.`, `❌ Warning \`#${id}\` does not exist in this server.`));
      return;
    }
    await message.reply(tr(L, `✅ Aviso \`#${removed.id}\` de <@${removed.userId}> eliminado.`, `✅ Warning \`#${removed.id}\` for <@${removed.userId}> removed.`));
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
    const L = await langOf(message);
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
      await message.reply(tr(L, `✅ Borré **${amount}** mensajes.`, `✅ I deleted **${amount}** messages.`)).catch(() => undefined);
    }
  },
});

export default [kick, ban, unban, mute, tempmute, unmute, warn, warns, unwarn, purge];
