import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { db, ciszubotSchema, eq, and, desc } from '../services/supabase';

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
    const snipes = ciszubotSchema.snipes;
    const rows = await db
      .select()
      .from(snipes)
      .where(and(eq(snipes.guildId, message.guild.id), eq(snipes.channelId, message.channel.id)))
      .orderBy(desc(snipes.deletedAt))
      .limit(1);
    const data = rows[0];

    if (!data) {
      await message.reply('📭 No hay mensajes borrados para snipar en este canal.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#ff33cc')
      .setAuthor({ name: `Mensaje borrado de <@${data.userId}>`, iconURL: (await message.client.users.fetch(data.userId).catch(() => null))?.displayAvatarURL() ?? undefined })
      .setDescription(data.content || '*Sin contenido de texto*')
      .setFooter({ text: `Borrado ${new Date(data.deletedAt).toLocaleString('es-ES')}` })
      .setTimestamp();
    if (data.attachment) {
      embed.setImage(data.attachment);
    }
    await message.reply({ embeds: [embed] });
  },
});

export default create;
