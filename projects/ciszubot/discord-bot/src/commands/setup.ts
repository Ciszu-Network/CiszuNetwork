import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';

const setPrefix = (): BotCommand => ({
  name: 'setprefix',
  description: 'Cambia el prefijo del bot en este servidor',
  aliases: ['prefix', 'prefijo'],
  usage: 'cz!setprefix <prefijo>',
  category: 'Configuración',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('setprefix')
    .setDescription('Cambia el prefijo del bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) => o.setName('prefijo').setDescription('Nuevo prefijo').setRequired(true)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    const prefix = (args[0] ?? '').trim();
    if (!prefix || prefix.length > 3) {
      await message.reply('❌ El prefijo debe tener 1-3 caracteres.');
      return;
    }
    await updateGuildConfig(message.guild.id, { prefix });
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('✅ Prefijo actualizado')
      .setDescription(`El nuevo prefijo es **${prefix}**.`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const setLang = (): BotCommand => ({
  name: 'setlang',
  description: 'Cambia el idioma del bot en este servidor (es/en)',
  aliases: ['idioma', 'language', 'lang'],
  usage: 'cz!setlang <es|en>',
  category: 'Configuración',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('setlang')
    .setDescription('Cambia el idioma del bot (es/en)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) =>
      o
        .setName('idioma')
        .setDescription('Idioma')
        .addChoices({ name: 'Español', value: 'es' }, { name: 'English', value: 'en' })
        .setRequired(true)
    ),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    const lang = (args[0] ?? '').toLowerCase();
    if (lang !== 'es' && lang !== 'en') {
      await message.reply('❌ Uso: `cz!setlang <es|en>`');
      return;
    }
    await updateGuildConfig(message.guild.id, { lang });
    await message.reply(`✅ Idioma del bot actualizado a **${lang === 'es' ? 'español' : 'inglés'}**.`);
  },
});

const setupWelcome = (): BotCommand => ({
  name: 'setupwelcome',
  description: 'Configura el canal y mensaje de bienvenidas',
  aliases: ['welcome', 'bienvenidas'],
  usage: 'cz!setupwelcome <#canal> [mensaje]  |  variables: {user} {guild} {members}',
  category: 'Configuración',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('setupwelcome')
    .setDescription('Configura el canal de bienvenidas')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((o) => o.setName('canal').setDescription('Canal de bienvenidas').setRequired(true))
    .addStringOption((o) => o.setName('mensaje').setDescription('Mensaje (variables: {user} {guild} {members})').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    const channel = (message.mentions?.channels?.first() ?? message.guild.channels.cache.get(args[0] ?? '')) as never as { id: string } | undefined;
    if (!channel) {
      await message.reply('❌ Menciona un canal: `cz!setupwelcome #canal [mensaje]`');
      return;
    }
    const msg = args.slice(1).join(' ') || 'Bienvenido/a {user} a {guild}!';
    await updateGuildConfig(message.guild.id, { welcome_channel_id: channel.id, welcome_message: msg });
    await message.reply(`✅ Bienvenidas activadas en <#${channel.id}> con el mensaje:\n> ${msg}`);
  },
});

const setupGoodbye = (): BotCommand => ({
  name: 'setupgoodbye',
  description: 'Configura el canal y mensaje de despedidas',
  aliases: ['goodbye', 'despedidas'],
  usage: 'cz!setupgoodbye <#canal> [mensaje]',
  category: 'Configuración',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('setupgoodbye')
    .setDescription('Configura el canal de despedidas')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((o) => o.setName('canal').setDescription('Canal de despedidas').setRequired(true))
    .addStringOption((o) => o.setName('mensaje').setDescription('Mensaje').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    const channel = (message.mentions?.channels?.first() ?? message.guild.channels.cache.get(args[0] ?? '')) as never as { id: string } | undefined;
    if (!channel) {
      await message.reply('❌ Menciona un canal: `cz!setupgoodbye #canal [mensaje]`');
      return;
    }
    const msg = args.slice(1).join(' ') || 'Adiós {user}, que te vaya bien!';
    await updateGuildConfig(message.guild.id, { goodbye_channel_id: channel.id, goodbye_message: msg });
    await message.reply(`✅ Despedidas activadas en <#${channel.id}> con el mensaje:\n> ${msg}`);
  },
});

const setupAutorole = (): BotCommand => ({
  name: 'setupautorole',
  description: 'Asigna roles automáticos a nuevos miembros',
  aliases: ['autorole'],
  usage: 'cz!setupautorole <@rol|off>',
  category: 'Configuración',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('setupautorole')
    .setDescription('Asigna roles automáticos a nuevos miembros')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption((o) => o.setName('rol').setDescription('Rol a asignar').setRequired(true)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    if (args[0]?.toLowerCase() === 'off') {
      await updateGuildConfig(message.guild.id, { autorole_ids: [] });
      await message.reply('✅ Autorol desactivado.');
      return;
    }
    const role = message.mentions?.roles?.first() ?? message.guild.roles.cache.get(args[0] ?? '');
    if (!role) {
      await message.reply('❌ Menciona un rol: `cz!setupautorole <@rol|off>`');
      return;
    }
    const cfg = await updateGuildConfig(message.guild.id, { autorole_ids: [role.id] });
    const list = cfg.autorole_ids.map((id) => message.guild?.roles.cache.get(id)?.name ?? id).join(', ') || '—';
    await message.reply(`✅ Autorol configurado. Roles actuales: **${list}**`);
  },
});

const setupCounters = (): BotCommand => ({
  name: 'setupcounters',
  description: 'Crea canales contador (members, online, bots, channels)',
  aliases: ['contadores', 'counters'],
  usage: 'cz!setupcounters <members|online|bots|humans|channels|roles> <nombre-con-{n}>  |  off para limpiar',
  category: 'Configuración',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('setupcounters')
    .setDescription('Crea canales contador')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) =>
      o
        .setName('tipo')
        .setDescription('Tipo de contador')
        .addChoices(
          { name: 'Miembros', value: 'members' },
          { name: 'En línea', value: 'online' },
          { name: 'Bots', value: 'bots' },
          { name: 'Humanos', value: 'humans' },
          { name: 'Canales', value: 'channels' },
          { name: 'Roles', value: 'roles' }
        )
        .setRequired(true)
    )
    .addStringOption((o) => o.setName('nombre').setDescription('Nombre del canal con {n}').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    const type = (args[0] ?? '').toLowerCase();
    if (type === 'off' || args[0]?.toLowerCase() === 'off') {
      await updateGuildConfig(message.guild.id, { counters: [] });
      await message.reply('✅ Contadores desactivados.');
      return;
    }
    const valid = ['members', 'online', 'bots', 'humans', 'channels', 'roles'];
    if (!valid.includes(type)) {
      await message.reply('❌ Uso: `cz!setupcounters <members|online|bots|humans|channels|roles> <nombre-con-{n}>`');
      return;
    }
    const name = args.slice(1).join('-').replace('{n}', '0') || `${type}-0`;
    const channel = await message.guild.channels.create({ name });
    const current = await getGuildConfig(message.guild.id);
    const cfg = await updateGuildConfig(message.guild.id, {
      counters: [...current.counters, { type, channel_id: channel.id }],
    });
    await message.reply(`✅ Contador **${type}** creado en <#${channel.id}>. Nombre actualizado automáticamente.`);
  },
});

export default [setPrefix, setLang, setupWelcome, setupGoodbye, setupAutorole, setupCounters];
