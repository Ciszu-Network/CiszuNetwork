import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getSupabase } from '../services/supabase';

const create = (): BotCommand => ({
  name: 'snipe',
  description: 'Recupera el último mensaje borrado del canal',
  aliases: ['snipear'],
  usage: 'cz!snipe',
  category: 'Diversión',
  slashCommand: new SlashCommandBuilder().setName('snipe').setDescription('Muestra el último mensaje borrado del canal'),
  async execute(message) {
    if (!message.guild) {
      await message.reply('❌ Este comando solo funciona en un servidor.');
      return;
    }
    if (!message.channel) {
      await message.reply('❌ Este comando necesita un canal de texto.');
      return;
    }
    const db = getSupabase();
    const { data } = await db
      .from('snipes')
      .select('*')
      .eq('guild_id', message.guild.id)
      .eq('channel_id', message.channel.id)
      .order('deleted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      await message.reply('📭 No hay mensajes borrados para snipar en este canal.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#ff33cc')
      .setAuthor({ name: `Mensaje borrado de <@${data.user_id}>`, iconURL: (await message.client.users.fetch(data.user_id).catch(() => null))?.displayAvatarURL() ?? undefined })
      .setDescription(data.content || '*Sin contenido de texto*')
      .setFooter({ text: `Borrado ${new Date(data.deleted_at).toLocaleString('es-ES')}` })
      .setTimestamp();
    if (data.attachment) {
      embed.setImage(data.attachment);
    }
    await message.reply({ embeds: [embed] });
  },
});

export default create;
