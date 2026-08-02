import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, formatMoney } from '../services/economy';
import { getSupabase } from '../services/supabase';

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

    const db = getSupabase();
    const { data } = await db
      .from('shop_items')
      .select('*')
      .eq('guild_id', message.guild.id)
      .ilike('name', name)
      .maybeSingle();
    const item = data as ShopItem | null;
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

    await db.from('inventory').upsert({
      user_id: message.author.id,
      guild_id: message.guild.id,
      item_id: item.id,
      quantity: 1,
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
