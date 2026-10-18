import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { db, sql } from '../services/supabase';
import { logger } from '../services/logger';
import { config } from '../config';

/**
 * Señal de prueba bot→dashboard (solo admins): publica un advisor en la web
 * de CiszuBot con el ID de Discord de quien lo pide. Sirve para comprobar de
 * verdad la cadena completa: el bot está vivo, escribe en la DB compartida y
 * el dashboard lo muestra. Cooldown de 10 segundos por usuario.
 */

const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 10_000;

const command: BotCommand = {
  name: 'testsignal',
  description: 'Envía una señal de prueba al dashboard (solo admins)',
  aliases: ['testadvisor', 'senal', 'signaltest'],
  usage: 'cz!testsignal',
  category: 'Utilidad',
  permissions: [PermissionsBitField.Flags.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('testsignal')
    .setDescription('Envía una señal de prueba al dashboard (solo admins)')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  async execute(message) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      await message.reply('❌ Solo los administradores pueden enviar la señal de prueba.');
      return;
    }

    const now = Date.now();
    const last = cooldowns.get(message.author.id) ?? 0;
    if (now - last < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
      await message.reply(`⏳ Espera **${wait}s** antes de enviar otra señal.`);
      return;
    }
    cooldowns.set(message.author.id, now);

    const guildName = message.guild.name;
    const text =
      `🛰️ Señal de prueba del bot en **${guildName}** (ID ${message.guild.id}). ` +
      `Solicitada por ${message.author.tag} (ID de Discord: ${message.author.id}). ` +
      `Bot v${config.version}.`;

    try {
      await db.execute(sql`
        insert into ciszunetwork.global_announcements
          (sender, source, message, kind, target, expires_at, sender_display_name, sender_username, sender_site)
        values
          ('CiszuBot', 'bot-test', ${text}, 'info', 'ciszubot', now() + interval '5 minutes', ${guildName}, ${message.author.tag}, 'ciszubot')
      `);
    } catch (error) {
      logger.warn('testsignal advisor:', error);
      await message.reply('❌ No se pudo publicar la señal (revisa los logs del bot).');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#22c55e')
      .setTitle('🛰️ Señal enviada al dashboard')
      .setDescription(
        `El advisor debería aparecer en **ciszubot.vercel.app/dashboard** durante los próximos **5 minutos**.\n\n` +
          `**Servidor:** ${guildName}\n**Usuario:** ${message.author.tag}\n**ID de Discord:** \`${message.author.id}\`\n**Versión:** v${config.version}`,
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
};

export default command;
