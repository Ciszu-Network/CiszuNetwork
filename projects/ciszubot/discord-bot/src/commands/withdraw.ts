import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet } from '../services/economy';
import { getGuildConfig, formatCoins } from '../services/configService';
import { langOf, tr } from '../services/i18n';

const create = (): BotCommand => ({
  name: 'withdraw',
  description: 'Retira monedas del banco',
  aliases: ['retirar', 'withdrawall', 'retiro'],
  usage: 'cz!withdraw <cantidad|all>',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Retira monedas del banco')
    .addStringOption((o) => o.setName('cantidad').setDescription('Cantidad o "all"').setRequired(true)),
  async execute(message, args) {
    const L = await langOf(message);
    const cfg = await getGuildConfig(message.guild?.id ?? 'DM');
    const guildId = message.guild?.id ?? 'DM';
    const w = await getWallet(message.author.id, guildId);
    const amount = args[0]?.toLowerCase() === 'all' ? w.bank : parseInt(args[0] ?? '', 10);

    if (isNaN(amount) || amount <= 0) {
      await message.reply(tr(L, '❌ Uso: `cz!withdraw <cantidad|all>`', '❌ Usage: `cz!withdraw <amount|all>`'));
      return;
    }
    if (w.bank < amount) {
      await message.reply(tr(L, `❌ No tienes suficientes monedas en el banco (tienes ${(w.bank)}).`, `❌ You do not have enough coins in the bank (you have ${(w.bank)}).`));
      return;
    }

    await setWallet(message.author.id, guildId, w.balance + amount, w.bank - amount, 'withdraw', 'Retiro de banco');
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(tr(L, '🏦 ¡Retiro exitoso!', '🏦 Withdrawal successful!'))
      .setDescription(tr(L, `Retiraste **${(amount)}** del banco.\n**Monedas:** ${(w.balance + amount)}`, `You withdrew **${(amount)}** from the bank.\n**Coins:** ${(w.balance + amount)}`))
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
