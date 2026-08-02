import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, formatMoney } from '../services/economy';

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
    const guildId = message.guild?.id ?? 'DM';
    const w = await getWallet(message.author.id, guildId);
    const amount = args[0]?.toLowerCase() === 'all' ? w.bank : parseInt(args[0] ?? '', 10);

    if (isNaN(amount) || amount <= 0) {
      await message.reply('❌ Uso: `cz!withdraw <cantidad|all>`');
      return;
    }
    if (w.bank < amount) {
      await message.reply(`❌ No tienes suficientes monedas en el banco (tienes ${formatMoney(w.bank)}).`);
      return;
    }

    await setWallet(message.author.id, guildId, w.balance + amount, w.bank - amount, 'withdraw', 'Retiro de banco');
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('🏦 ¡Retiro exitoso!')
      .setDescription(`Retiraste **${formatMoney(amount)}** del banco.\n**Monedas:** ${formatMoney(w.balance + amount)}`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
