import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet } from '../services/economy';
import { db, ciszubotSchema, eq, and, ilike, sql } from '../services/supabase';
import { getGuildConfig, formatCoins } from '../services/configService';
import { langOf, tr } from '../services/i18n';

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
    const L = await langOf(message);
    const cfg = await getGuildConfig(message.guild?.id ?? 'DM');
    if (!message.guild) {
      await message.reply(tr(L, '❌ Este comando solo funciona en un servidor.', '❌ This command only works in a server.'));
      return;
    }
    const name = args.join(' ').toLowerCase();
    if (!name) {
      await message.reply(tr(L, '❌ Uso: `cz!buy <nombre del ítem>`', '❌ Usage: `cz!buy <item name>`'));
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
      await message.reply(tr(L, '❌ Ese ítem no existe en la tienda.', '❌ That item does not exist in the shop.'));
      return;
    }

    const w = await getWallet(message.author.id, message.guild.id);
    if (w.balance < item.price) {
      await message.reply(tr(L, `❌ No tienes suficientes monedas (necesitas ${formatCoins(cfg, item.price)}).`, `❌ You do not have enough coins (you need ${formatCoins(cfg, item.price)}).`));
      return;
    }

    await setWallet(message.author.id, message.guild.id, w.balance - item.price, w.bank, 'shop_buy', `Compra de ${item.name}`);

    let roleNote = '';
    if (item.role_id) {
      const role = message.guild.roles.cache.get(item.role_id);
      if (role) {
        await message.member?.roles.add(role).catch(() => undefined);
        roleNote = tr(L, `\n📛 Rol **${role.name}** otorgado!`, `\n📛 Role **${role.name}** granted!`);
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
      .setTitle(tr(L, `✅ ¡Compraste ${item.emoji || '🎁'} ${item.name}!`, `✅ You bought ${item.emoji || '🎁'} ${item.name}!`))
      .setDescription(
        tr(
          L,
          `Pagaste **${formatCoins(cfg, item.price)}**.${roleNote}\n**Saldo restante:** ${formatCoins(cfg, w.balance - item.price)}`,
          `You paid **${formatCoins(cfg, item.price)}**.${roleNote}\n**Remaining balance:** ${formatCoins(cfg, w.balance - item.price)}`,
        ),
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
