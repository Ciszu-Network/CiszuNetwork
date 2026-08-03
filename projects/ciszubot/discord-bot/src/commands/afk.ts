import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getSupabase } from '../services/supabase';

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
    const db = getSupabase();
    await db.from('afk').upsert({
      user_id: message.author.id,
      guild_id: message.guild.id,
      reason,
      since: new Date().toISOString(),
    });

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
