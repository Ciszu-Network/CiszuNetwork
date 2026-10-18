import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS, BOT_ASSETS } from '../config/links';
import { isStaff } from '../utils/permissions';

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
  aliases: ['quieneres', 'quien-es', 'quienes'],
  usage: 'cz!whoareyou',
  category: 'Información',
  // Sin versión slash (Discord limita a 100 comandos globales): cz!whoareyou
  async execute(message) {
    const client = message.client;
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.primary)
      .setTitle('🤖 ¿Quién soy?')
      .setThumbnail(BOT_ASSETS.isotype)
      .setDescription(
        `Soy **CiszuBot**, el bot oficial de **Ciszu Network** — el ecosistema digital de **Ciszuko Antony**.\n\n` +
          'Gestiono economía, niveles, sorteos, moderación, tickets, alianzas, embeds y mucho más, todo configurable desde mi dashboard.',
      )
      .addFields(
        { name: '👤 Creador', value: 'Ciszuko Antony (Ciszu Network)', inline: true },
        { name: '🌐 Web', value: LINKS.websiteLabel, inline: true },
        { name: '🏠 Servidores', value: `${client.guilds.cache.size}`, inline: true },
        { name: '🧩 Comandos', value: 'Slash (/) y prefijo `cz!`', inline: true },
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
  aliases: ['quiensoy', 'quien-soy', 'perfil'],
  usage: 'cz!whoiam',
  category: 'Social',
  // Sin versión slash (Discord limita a 100 comandos globales): cz!whoiam
  async execute(message) {
    const card = await memberCard(message, message.author.id);
    if (!card) {
      await message.reply('❌ No pude leer tu perfil en este servidor.');
      return;
    }
    const { member, roles, top, staff } = card;
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.primary)
      .setTitle(`🪪 ${member.displayName}`)
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .setDescription(staff ? '👑 Miembro del **staff**' : '🙋 Miembro de la comunidad')
      .addFields(
        { name: '🏷️ Usuario', value: `${member.user.tag}`, inline: true },
        { name: '⭐ Rol más alto', value: top ? `<@&${top.id}>` : 'Sin roles', inline: true },
        { name: '🧩 Roles', value: `${roles.size}`, inline: true },
        { name: '📅 En el servidor desde', value: ts(member.joinedAt), inline: true },
        { name: '🕒 Cuenta creada', value: ts(member.user.createdAt), inline: true },
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
  aliases: ['misroles', 'mirango'],
  usage: 'cz!whoismyrol',
  category: 'Social',
  // Sin versión slash (Discord limita a 100 comandos globales): cz!whoismyrol
  async execute(message) {
    const card = await memberCard(message, message.author.id);
    if (!card) {
      await message.reply('❌ No pude leer tus roles en este servidor.');
      return;
    }
    const { member, roles, top, staff } = card;
    const list = roles.map((r) => `<@&${r.id}>`).slice(0, 40).join(' · ') || 'Sin roles';
    const embed = new EmbedBuilder()
      .setColor(staff ? BOT_COLORS.secondary : BOT_COLORS.primary)
      .setTitle(`🎭 Roles de ${member.displayName}`)
      .setDescription(list.slice(0, 4000))
      .addFields(
        { name: '⭐ Rol más alto', value: top ? `<@&${top.id}>` : 'Sin roles', inline: true },
        { name: '🧩 Total', value: `${roles.size} rol(es)`, inline: true },
        { name: '🛡️ Rango', value: staff ? 'Staff (con permisos de gestión)' : 'Miembro', inline: true },
      )
      .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const present = (): BotCommand => ({
  name: 'present',
  description: 'Presenta a un usuario (tarjeta pública)',
  aliases: ['presentar', 'presentacion'],
  usage: 'cz!present @usuario',
  category: 'Social',
  slashCommand: new SlashCommandBuilder()
    .setName('present')
    .setDescription('Presenta a un usuario')
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario a presentar').setRequired(false)),
  async execute(message, args) {
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
        'Hoy me siento genial acompañando a la comunidad 🎉',
        'Ando con mucha energía, listo para lo que pidan ⚡',
        'Tranquilo pero atento, como siempre 😌',
      ];
      const mood = moods[new Date().getDate() % moods.length];
      const embed = new EmbedBuilder()
        .setColor(BOT_COLORS.primary)
        .setTitle('👋 ¡Hola! Soy CiszuBot')
        .setThumbnail(BOT_ASSETS.isotype)
        .setDescription(
          `Un gusto, me presento: soy el bot oficial de **Ciszu Network**, creado por **Ciszuko Antony**.\n\n${mood}`,
        )
        .addFields(
          { name: '🏠 Dónde vivo', value: `${guilds} servidor(es)`, inline: true },
          { name: '👥 A quiénes cuido', value: `${members} miembro(s)`, inline: true },
          { name: '⏱️ Despierto desde hace', value: `${days}d ${hours}h sin dormir`, inline: true },
          { name: '🧩 Lo que hago', value: 'Economía, niveles, sorteos, moderación, tickets, alianzas y más.', inline: false },
          { name: '🌐 Mi casa', value: LINKS.websiteLabel, inline: true },
          { name: '💬 ¿Hablamos?', value: 'Usa `cz!help` o el dashboard', inline: true },
        )
        .setFooter(BOT_FOOTER(message.author.tag, client.user?.displayAvatarURL()))
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }
    const guild = message.guild!;
    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await message.reply('❌ No encontré a ese usuario en el servidor.');
      return;
    }
    const roles = member.roles.cache
      .filter((r) => r.id !== guild.id)
      .sort((a, b) => b.position - a.position);
    const top = roles.first();
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.secondary)
      .setTitle(`👋 Presentando a ${member.displayName}`)
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .setDescription(
        `Todos den la bienvenida a <@${member.id}>.\n\n` +
          `**Usuario:** ${member.user.tag}\n` +
          `**Rol más alto:** ${top ? `<@&${top.id}>` : 'Sin roles'}\n` +
          `**En el servidor desde:** ${ts(member.joinedAt)}\n` +
          `**Roles:** ${roles.size}`,
      )
      .setFooter(BOT_FOOTER(`Presentado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default [whoareyou, whoiam, whoismyrol, present];
