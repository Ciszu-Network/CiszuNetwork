import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS, BOT_ASSETS } from '../config/links';
import { isStaff } from '../utils/permissions';
import { langOf, tr } from '../services/i18n';

/**
 * Comandos de presentación/perfil:
 * cz!whoareyou (el bot) · cz!whoiam (tú) · cz!whoismyrol (tus roles) ·
 * cz!present @usuario (presenta a alguien).
 */

function ts(date: Date | null | undefined): string {
  if (!date) return 'desconocido';
  return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

async function memberCard(message: Parameters<BotCommand['execute']>[0], userId: string) {
  const guild = message.guild!;
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return null;
  const roles = member.roles.cache
    .filter((r) => r.id !== guild.id)
    .sort((a, b) => b.position - a.position);
  const top = roles.first();
  const staff = await isStaff(message).catch(() => false);
  return { member, roles, top, staff };
}

const whoareyou = (): BotCommand => ({
  name: 'whoareyou',
  description: '¿Quién es CiszuBot? Presentación del bot',
  aliases: ['quieneres', 'quien-es', 'quienes', 'quien', 'who'],
  usage: 'cz!whoareyou',
  category: 'Presentación',
  // Sin versión slash (Discord limita a 100 comandos globales): cz!whoareyou
  async execute(message) {
    const L = await langOf(message);
    const client = message.client;
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.primary)
      .setTitle(tr(L, '🤖 ¿Quién soy?', '🤖 Who am I?'))
      .setThumbnail(BOT_ASSETS.isotype)
      .setDescription(
        tr(
          L,
          'Soy **CiszuBot**, el bot oficial de **Ciszu Network** — el ecosistema digital de **Ciszuko Antony**.\n\nGestiono economía, niveles, sorteos, moderación, tickets, alianzas, embeds y mucho más, todo configurable desde mi dashboard.',
          'I am **CiszuBot**, the official bot of **Ciszu Network** — the digital ecosystem by **Ciszuko Antony**.\n\nI manage economy, levels, giveaways, moderation, tickets, alliances, embeds and much more, all configurable from my dashboard.',
        ),
      )
      .addFields(
        { name: tr(L, '👤 Creador', '👤 Creator'), value: 'Ciszuko Antony (Ciszu Network)', inline: true },
        { name: tr(L, '🌐 Web', '🌐 Website'), value: LINKS.websiteLabel, inline: true },
        { name: tr(L, '🏠 Servidores', '🏠 Servers'), value: `${client.guilds.cache.size}`, inline: true },
        { name: tr(L, '🧩 Comandos', '🧩 Commands'), value: tr(L, 'Slash (/) y prefijo `cz!`', 'Slash (/) and `cz!` prefix'), inline: true },
        { name: '💎 Premium', value: `${LINKS.website}/premium`, inline: true },
        { name: '📚 Docs', value: `${LINKS.website}/documentation`, inline: true },
      )
      .setFooter(BOT_FOOTER(message.author.tag, client.user?.displayAvatarURL()))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const whoiam = (): BotCommand => ({
  name: 'whoiam',
  description: 'Tu tarjeta de perfil en este servidor',
  aliases: ['quiensoy', 'quien-soy', 'perfil', 'whoami'],
  usage: 'cz!whoiam',
  category: 'Presentación',
  // Sin versión slash (Discord limita a 100 comandos globales): cz!whoiam
  async execute(message) {
    const L = await langOf(message);
    const card = await memberCard(message, message.author.id);
    if (!card) {
      await message.reply(tr(L, '❌ No pude leer tu perfil en este servidor.', '❌ I could not read your profile in this server.'));
      return;
    }
    const { member, roles, top, staff } = card;
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.primary)
      .setTitle(`🪪 ${member.displayName}`)
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .setDescription(staff ? tr(L, '👑 Miembro del **staff**', '👑 **Staff** member') : tr(L, '🙋 Miembro de la comunidad', '🙋 Community member'))
      .addFields(
        { name: tr(L, '🏷️ Usuario', '🏷️ User'), value: `${member.user.tag}`, inline: true },
        { name: tr(L, '⭐ Rol más alto', '⭐ Highest role'), value: top ? `<@&${top.id}>` : tr(L, 'Sin roles', 'No roles'), inline: true },
        { name: tr(L, '🧩 Roles', '🧩 Roles'), value: `${roles.size}`, inline: true },
        { name: tr(L, '📅 En el servidor desde', '📅 In the server since'), value: ts(member.joinedAt), inline: true },
        { name: tr(L, '🕒 Cuenta creada', '🕒 Account created'), value: ts(member.user.createdAt), inline: true },
        { name: '🆔 ID', value: `\`${member.id}\``, inline: true },
      )
      .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const whoismyrol = (): BotCommand => ({
  name: 'whoismyrol',
  description: 'Tus roles y rango en este servidor',
  aliases: ['misroles', 'mirango', 'mirol', 'rol', 'roles', 'role', 'myrole'],
  usage: 'cz!whoismyrol',
  category: 'Presentación',
  // Sin versión slash (Discord limita a 100 comandos globales): cz!whoismyrol
  async execute(message) {
    const L = await langOf(message);
    const card = await memberCard(message, message.author.id);
    if (!card) {
      await message.reply(tr(L, '❌ No pude leer tus roles en este servidor.', '❌ I could not read your roles in this server.'));
      return;
    }
    const { member, roles, top, staff } = card;
    const list = roles.map((r) => `<@&${r.id}>`).slice(0, 40).join(' · ') || tr(L, 'Sin roles', 'No roles');
    const embed = new EmbedBuilder()
      .setColor(staff ? BOT_COLORS.secondary : BOT_COLORS.primary)
      .setTitle(`🎭 Roles de ${member.displayName}`)
      .setDescription(list.slice(0, 4000))
      .addFields(
        { name: tr(L, '⭐ Rol más alto', '⭐ Highest role'), value: top ? `<@&${top.id}>` : tr(L, 'Sin roles', 'No roles'), inline: true },
        { name: tr(L, '🧩 Total', '🧩 Total'), value: `${roles.size} ` + tr(L, 'rol(es)', 'role(s)'), inline: true },
        { name: tr(L, '🛡️ Rango', '🛡️ Rank'), value: staff ? tr(L, 'Staff (con permisos de gestión)', 'Staff (with management permissions)') : tr(L, 'Miembro', 'Member'), inline: true },
      )
      .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const present = (): BotCommand => ({
  name: 'present',
  description: 'Presenta a un usuario (tarjeta pública)',
  aliases: ['presentar', 'presentacion', 'presentate'],
  usage: 'cz!present @usuario',
  category: 'Presentación',
  slashCommand: new SlashCommandBuilder()
    .setName('present')
    .setDescription('Presenta a un usuario')
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario a presentar').setRequired(false)),
  async execute(message, args) {
    const L = await langOf(message);
    const target = message.mentions?.users?.first();
    if (!target) {
      // El bot se presenta a sí mismo, con un resumen de estado estilo humano.
      const client = message.client;
      const guilds = client.guilds.cache.size;
      const members = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount ?? 0), 0);
      const uptimeMs = client.uptime ?? 0;
      const days = Math.floor(uptimeMs / 86_400_000);
      const hours = Math.floor((uptimeMs % 86_400_000) / 3_600_000);
      const moods = [
        tr(L, 'Hoy me siento genial acompañando a la comunidad 🎉', 'I feel great accompanying the community today 🎉'),
        tr(L, 'Ando con mucha energía, listo para lo que pidan ⚡', 'Lots of energy today, ready for anything ⚡'),
        tr(L, 'Tranquilo pero atento, como siempre 😌', 'Calm but attentive, as always 😌'),
      ];
      const mood = moods[new Date().getDate() % moods.length];
      const embed = new EmbedBuilder()
        .setColor(BOT_COLORS.primary)
        .setTitle(tr(L, '👋 ¡Hola! Soy CiszuBot', '👋 Hi! I am CiszuBot'))
        .setThumbnail(BOT_ASSETS.isotype)
        .setDescription(
          tr(
            L,
            `Un gusto, me presento: soy el bot oficial de **Ciszu Network**, creado por **Ciszuko Antony**.\n\n${mood}`,
            `Nice to meet you: I am the official **Ciszu Network** bot, created by **Ciszuko Antony**.\n\n${mood}`,
          ),
        )
        .addFields(
          { name: tr(L, '🏠 Dónde vivo', '🏠 Where I live'), value: `${guilds} ` + tr(L, 'servidor(es)', 'server(s)'), inline: true },
          { name: tr(L, '👥 A quiénes cuido', '👥 Who I take care of'), value: `${members} ` + tr(L, 'miembro(s)', 'member(s)'), inline: true },
          { name: tr(L, '⏱️ Despierto desde hace', '⏱️ Awake for'), value: `${days}d ${hours}h ` + tr(L, 'sin dormir', 'without sleeping'), inline: true },
          { name: tr(L, '🧩 Lo que hago', '🧩 What I do'), value: tr(L, 'Economía, niveles, sorteos, moderación, tickets, alianzas y más.', 'Economy, levels, giveaways, moderation, tickets, alliances and more.'), inline: false },
          { name: '🌐 Mi casa', value: LINKS.websiteLabel, inline: true },
          { name: tr(L, '💬 ¿Hablamos?', '💬 Talk to me?'), value: tr(L, 'Usa `cz!help` o el dashboard', 'Use `cz!help` or the dashboard'), inline: true },
        )
        .setFooter(BOT_FOOTER(message.author.tag, client.user?.displayAvatarURL()))
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }
    const guild = message.guild!;
    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await message.reply(tr(L, '❌ No encontré a ese usuario en el servidor.', '❌ I could not find that user in the server.'));
      return;
    }
    const roles = member.roles.cache
      .filter((r) => r.id !== guild.id)
      .sort((a, b) => b.position - a.position);
    const top = roles.first();
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.secondary)
      .setTitle(tr(L, `👋 Presentando a ${member.displayName}`, `👋 Introducing ${member.displayName}`))
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .setDescription(
        tr(
          L,
          `Todos den la bienvenida a <@${member.id}>.\n\n**Usuario:** ${member.user.tag}\n**Rol más alto:** ${top ? `<@&${top.id}>` : 'Sin roles'}\n**En el servidor desde:** ${ts(member.joinedAt)}\n**Roles:** ${roles.size}`,
          `Everyone welcome <@${member.id}>.\n\n**User:** ${member.user.tag}\n**Top role:** ${top ? `<@&${top.id}>` : 'No roles'}\n**In the server since:** ${ts(member.joinedAt)}\n**Roles:** ${roles.size}`,
        ),
      )
      .setFooter(BOT_FOOTER(tr(L, `Presentado por ${message.author.tag}`, `Presented by ${message.author.tag}`), message.client.user?.displayAvatarURL()))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default [whoareyou, whoiam, whoismyrol, present];
