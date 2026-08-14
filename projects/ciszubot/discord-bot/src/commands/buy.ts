import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, formatMoney } from '../services/economy';
import { db, ciszubotSchema, eq, and, ilike, sql } from '../services/supabase';

interface ShopItem {
  id: string;
  guild_id: string;
  name: string;
  price: number;
  description: string | null;
  role_id: string | null;
  emoji: string;
}

const create = (): BotCommand => ({
  name: 'buy',
  description: 'Compra un ítem de la tienda',
  aliases: ['comprar'],
  usage: 'cz!buy <nombre del ítem>',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Compra un ítem de la tienda')
    .addStringOption((o) => o.setName('item').setDescription('Nombre del ítem').setRequired(true)),
  async execute(message, args) {
    if (!message.guild) {
      await message.reply('❌ Este comando solo funciona en un servidor.');
      return;
    }
    const name = args.join(' ').toLowerCase();
    if (!name) {
      await message.reply('❌ Uso: `cz!buy <nombre del ítem>`');
      return;
    }

    const shopItems = ciszubotSchema.shopItems;
    const found = await db
      .select()
      .from(shopItems)
      .where(and(eq(shopItems.guildId, message.guild.id), ilike(shopItems.name, name)))
      .limit(1);
    const item = (found[0]
      ? {
          id: String(found[0].id),
          guild_id: found[0].guildId,
          name: found[0].name,
          price: Number(found[0].price),
          description: found[0].description,
          role_id: found[0].roleId,
          emoji: found[0].emoji,
        }
      : null) as ShopItem | null;
    if (!item) {
      await message.reply('❌ Ese ítem no existe en la tienda.');
      return;
    }

    const w = await getWallet(message.author.id, message.guild.id);
    if (w.balance < item.price) {
      await message.reply(`❌ No tienes suficientes monedas (necesitas ${formatMoney(item.price)}).`);
      return;
    }

    await setWallet(message.author.id, message.guild.id, w.balance - item.price, w.bank, 'shop_buy', `Compra de ${item.name}`);

    let roleNote = '';
    if (item.role_id) {
      const role = message.guild.roles.cache.get(item.role_id);
      if (role) {
        await message.member?.roles.add(role).catch(() => undefined);
        roleNote = `\n📛 Rol **${role.name}** otorgado!`;
      }
    }

    const inventory = ciszubotSchema.inventory;
    await db
      .insert(inventory)
      .values({
        userId: message.author.id,
        guildId: message.guild.id,
        itemId: Number(item.id),
        quantity: 1,
      })
      .onConflictDoUpdate({
        target: [inventory.userId, inventory.guildId, inventory.itemId],
        set: { quantity: sql`${inventory.quantity} + 1` },
      });

    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(`✅ ¡Compraste ${item.emoji || '🎁'} ${item.name}!`)
      .setDescription(`Pagaste **${formatMoney(item.price)}**.${roleNote}\n**Saldo restante:** ${formatMoney(w.balance - item.price)}`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
