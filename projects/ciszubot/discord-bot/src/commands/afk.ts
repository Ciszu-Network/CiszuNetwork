import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { db, ciszubotSchema, eq, and, sql } from '../services/supabase';
import { getGuildConfig } from '../services/configService';

const create = (): BotCommand => ({
  name: 'afk',
  description: 'Márquese como AFK con una razón',
  aliases: ['ausente'],
  usage: 'cz!afk <razón>',
  category: 'Social',
  slashCommand: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Márquese como AFK con una razón')
    .addStringOption((o) => o.setName('razon').setDescription('Razón del AFK').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) {
      await message.reply('❌ Este comando solo funciona en un servidor.');
      return;
    }
    const reason = args.join(' ') || 'Sin razón especificada';
    const afk = ciszubotSchema.afk;
    await db
      .insert(afk)
      .values({ userId: message.author.id, guildId: message.guild.id, reason, since: new Date() })
      .onConflictDoUpdate({
        target: [afk.userId, afk.guildId],
        set: { reason, since: new Date() },
      });

    // Rol de AFK + prefijo [AFK] en el apodo (config del servidor).
    try {
      const cfg = await getGuildConfig(message.guild.id);
      const member = await message.guild.members.fetch(message.author.id).catch(() => null);
      if (member && member.manageable) {
        if (cfg.afk_role_id) {
          const role = message.guild.roles.cache.get(cfg.afk_role_id);
          if (role) await member.roles.add(role).catch(() => undefined);
        }
        if (cfg.afk_prefix_enabled && !member.nickname?.startsWith('[AFK]')) {
          await member.setNickname(`[AFK] ${member.displayName}`.slice(0, 32)).catch(() => undefined);
        }
      }
    } catch {
      /* sin permisos */
    }

    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('💤 ¡Estás AFK!')
      .setDescription(`**Razón:** ${reason}\n\nVuelve a escribir en el chat para quitarte el AFK.`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
