import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, formatMoney, getTopWallets } from '../services/economy';
import { db, ciszubotSchema, eq, asc } from '../services/supabase';

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
    const shopItems = ciszubotSchema.shopItems;
    const rows = await db
      .select()
      .from(shopItems)
      .where(eq(shopItems.guildId, message.guild.id))
      .orderBy(asc(shopItems.price));
    const items = rows.map((it) => ({
      id: it.id,
      name: it.name,
      price: Number(it.price),
      description: it.description,
      role_id: it.roleId,
      emoji: it.emoji,
    }));

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
