import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, formatMoney, getTopWallets } from '../services/economy';
import { getSupabase } from '../services/supabase';

const create = (): BotCommand => ({
  name: 'shop',
  description: 'Tienda del servidor con ítems por rol',
  aliases: ['tienda', 'store'],
  usage: 'cz!shop',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder().setName('shop').setDescription('Tienda del servidor'),
  async execute(message) {
    if (!message.guild) {
      await message.reply('❌ Este comando solo funciona en un servidor.');
      return;
    }
    const db = getSupabase();
    const { data } = await db.from('shop_items').select('*').eq('guild_id', message.guild.id).order('price', { ascending: true });
    const items = (data ?? []) as Array<{ id: string; name: string; price: number; description: string | null; role_id: string | null; emoji: string }>;

    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(`🛒 Tienda de ${message.guild.name}`)
      .setDescription(
        items.length > 0
          ? items
              .map((it) => `${it.emoji || '🎁'} **${it.name}** — ${formatMoney(it.price)} ${it.description ? `\n> ${it.description}` : ''}`)
              .join('\n')
          : 'La tienda está vacía. Un admin puede añadir ítems con `cz!shopadd`.'
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
