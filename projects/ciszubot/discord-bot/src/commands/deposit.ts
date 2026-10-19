import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, addBank } from '../services/economy';
import { getGuildConfig, formatCoins } from '../services/configService';
import { langOf, tr } from '../services/i18n';

const create = (): BotCommand => ({
  name: 'deposit',
  description: 'Guarda monedas en el banco',
  aliases: ['depositar', 'bank', 'banco'],
  usage: 'cz!deposit <cantidad|all>',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Guarda monedas en el banco')
    .addStringOption((o) => o.setName('cantidad').setDescription('Cantidad o "all"').setRequired(true)),
  async execute(message, args) {
    const L = await langOf(message);
    const cfg = await getGuildConfig(message.guild?.id ?? 'DM');
    const guildId = message.guild?.id ?? 'DM';
    const w = await getWallet(message.author.id, guildId);
    const amount = args[0]?.toLowerCase() === 'all' ? w.balance : parseInt(args[0] ?? '', 10);

    if (isNaN(amount) || amount <= 0) {
      await message.reply(tr(L, '❌ Uso: `cz!deposit <cantidad|all>`', '❌ Usage: `cz!deposit <amount|all>`'));
      return;
    }
    if (w.balance < amount) {
      await message.reply(tr(L, `❌ No tienes suficientes monedas (tienes ${(w.balance)}).`, `❌ You do not have enough coins (you have ${(w.balance)}).`));
      return;
    }

    await setWallet(message.author.id, guildId, w.balance - amount, w.bank + amount, 'deposit', tr(L, 'Depósito en banco', 'Bank deposit'));
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(tr(L, '🏦 ¡Depósito exitoso!', '🏦 Deposit successful!'))
      .setDescription(tr(L, `Guardaste **${(amount)}** en el banco.\n**Banco:** ${(w.bank + amount)}`, `You saved **${(amount)}** in the bank.\n**Bank:** ${(w.bank + amount)}`))
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
