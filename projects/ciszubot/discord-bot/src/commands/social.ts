import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import type { BotCommand } from '../types/command';
import { startGiveaway } from '../services/giveaways';
import { getSupabase } from '../services/supabase';

const giveaways = (): BotCommand => ({
  name: 'giveaway',
  description: 'Crea un sorteo (recompensa: 🎉)',
  aliases: ['sorteo', 'gstart'],
  usage: 'cz!giveaway <premio> | <ganadores> | <duración-min>',
  category: 'Utilidad',
  permissions: [PermissionFlagsBits.ManageMessages],
  slashCommand: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Crea un sorteo')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((o) => o.setName('premio').setDescription('El premio').setRequired(true))
    .addIntegerOption((o) => o.setName('ganadores').setDescription('Número de ganadores').setRequired(true))
    .addIntegerOption((o) => o.setName('duracion').setDescription('Duración en minutos').setRequired(true)),
  async execute(message, args) {
    if (!message.guild || !message.channel) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Mensajes**.');
      return;
    }
    // Formato: cz!giveaway <premio> | <ganadores> | <minutos>
    const joined = args.join(' ');
    const parts = joined.split('|').map((p) => p.trim());
    if (parts.length < 3) {
      await message.reply('❌ Uso: `cz!giveaway <premio> | <ganadores> | <duración-min>`');
      return;
    }
    const prize = parts[0];
    const winners = parseInt(parts[1], 10) || 1;
    const minutes = parseInt(parts[2], 10) || 60;

    const result = await startGiveaway(message.guild, message.channel as never, prize, winners, minutes * 60_000, message.author);
    if (result.ok) {
      await message.reply(`🎉 Sorteo creado para **${prize}**! Termina en **${minutes} min**.`);
    } else {
      await message.reply('❌ No se pudo crear el sorteo.');
    }
  },
});

const gend = (): BotCommand => ({
  name: 'gend',
  description: 'Fuerza el fin de un sorteo activo',
  aliases: ['gfinish'],
  usage: 'cz!gend',
  category: 'Utilidad',
  permissions: [PermissionFlagsBits.ManageMessages],
  slashCommand: new SlashCommandBuilder()
    .setName('gend')
    .setDescription('Fuerza el fin de un sorteo')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(message) {
    if (!message.guild) return;
    const db = getSupabase();
    const { data } = await db
      .from('giveaways')
      .select('*')
      .eq('guild_id', message.guild.id)
      .eq('ended', false)
      .order('ends_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) {
      await message.reply('❌ No hay sorteos activos en este servidor.');
      return;
    }
    const { endGiveaway } = await import('../services/giveaways');
    await endGiveaway(message.guild, data as never);
    await message.reply('✅ Sorteo finalizado.');
  },
});

const embedCmd = (): BotCommand => ({
  name: 'embed',
  description: 'Crea un embed personalizado',
  aliases: ['createembed'],
  usage: 'cz!embed <título> | <descripción> | <color>',
  category: 'Utilidad',
  permissions: [PermissionFlagsBits.ManageMessages],
  slashCommand: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Crea un embed personalizado')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((o) => o.setName('titulo').setDescription('Título').setRequired(true))
    .addStringOption((o) => o.setName('descripcion').setDescription('Descripción').setRequired(true))
    .addStringOption((o) => o.setName('color').setDescription('Color hex (ej: #00d4ff)').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Mensajes**.');
      return;
    }
    const parts = args.join(' ').split('|').map((p) => p.trim());
    if (parts.length < 2) {
      await message.reply('❌ Uso: `cz!embed <título> | <descripción> | <color>`');
      return;
    }
    const title = parts[0];
    const description = parts[1];
    const color = parts[2] ?? '#00d4ff';
    const embed = new EmbedBuilder()
      .setColor(color.startsWith('#') ? (color as `#${string}`) : '#00d4ff')
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const alliance = (): BotCommand => ({
  name: 'alliance',
  description: 'Forma una alianza con otro servidor',
  aliases: ['alianza'],
  usage: 'cz!alliance <invite del servidor>',
  category: 'Social',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('alliance')
    .setDescription('Forma una alianza con otro servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) => o.setName('invite').setDescription('Invitación del servidor aliado').setRequired(true)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    const invite = (args[0] ?? '').trim();
    if (!invite) {
      await message.reply('❌ Uso: `cz!alliance <invite del servidor>`');
      return;
    }
    const inviteCode = invite.replace(/https?:\/\/(www\.)?discord\.gg\//i, '').replace(/^discord\.gg\//i, '');
    const fetched = await message.client.fetchInvite(inviteCode).catch(() => null);
    if (!fetched?.guild) {
      await message.reply('❌ No pude obtener datos de esa invitación. Verifica que sea válida.');
      return;
    }
    const partnerGuildId = fetched.guild.id;
    const db = getSupabase();
    const { data: existing } = await db
      .from('alliances')
      .select('id')
      .eq('guild_id', message.guild.id)
      .eq('partner_id', partnerGuildId)
      .maybeSingle();
    if (existing) {
      await message.reply('⚠️ Ya existe una alianza con ese servidor.');
      return;
    }
    await db.from('alliances').insert({
      guild_id: message.guild.id,
      partner_id: partnerGuildId,
      partner_name: fetched.guild.name,
      partner_invite: invite,
    });
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('🤝 ¡Alianza creada!')
      .setDescription(
        `**${message.guild.name}** y **${fetched.guild.name}** ahora son aliados.\n` +
          `Puedes enviar la invitación del aliado con \`cz!allies\`.`
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const allies = (): BotCommand => ({
  name: 'allies',
  description: 'Muestra las alianzas del servidor',
  aliases: ['alianzas'],
  usage: 'cz!allies',
  category: 'Social',
  slashCommand: new SlashCommandBuilder().setName('allies').setDescription('Muestra las alianzas del servidor'),
  async execute(message) {
    if (!message.guild) {
      await message.reply('❌ Este comando solo funciona en un servidor.');
      return;
    }
    const db = getSupabase();
    const { data } = await db.from('alliances').select('*').eq('guild_id', message.guild.id).order('created_at', { ascending: false });
    const alliances = (data ?? []) as Array<{ id: string; partner_name: string; partner_invite: string; created_at: string }>;
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(`🤝 Alianzas de ${message.guild.name}`)
      .setDescription(
        alliances.length > 0
          ? alliances.map((a) => `**${a.partner_name}** — [invitar](${a.partner_invite}) (<t:${Math.floor(new Date(a.created_at).getTime() / 1000)}:R>)`).join('\n')
          : 'Este servidor no tiene alianzas aún. Usa `cz!alliance <invite>` para crear una.'
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default [giveaways, gend, embedCmd, alliance, allies];
