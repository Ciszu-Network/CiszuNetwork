import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, formatMoney, randomBetween } from '../services/economy';

const create = (): BotCommand => ({
  name: 'gamble',
  description: 'Aposta monedas a cara o cruz',
  aliases: ['apostar', 'coinflip', 'caraocruz', 'flip'],
  usage: 'cz!gamble <cantidad>',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Aposta monedas a cara o cruz')
    .addIntegerOption((o) => o.setName('cantidad').setDescription('Cantidad a apostar').setRequired(true)),
  async execute(message, args) {
    const guildId = message.guild?.id ?? 'DM';
    const amount = parseInt(args[0] ?? '', 10);
    if (isNaN(amount) || amount <= 0) {
      await message.reply('❌ Uso: `cz!gamble <cantidad>`');
      return;
    }
    const w = await getWallet(message.author.id, guildId);
    if (w.balance < amount) {
      await message.reply(`❌ No tienes suficientes monedas (necesitas ${formatMoney(amount)}).`);
      return;
    }

    const won = Math.random() < 0.5;
    const winAmount = won ? amount * 2 : 0;
    const newBalance = w.balance - amount + winAmount;
    await setWallet(message.author.id, guildId, newBalance, w.bank, won ? 'gamble_win' : 'gamble_lose', `Aposta de ${amount}`);

    const embed = new EmbedBuilder()
      .setColor(won ? '#00ff88' : '#ff0000')
      .setTitle(won ? '🪙 ¡Ganaste la apuesta!' : '🪙 Perdiste la apuesta...')
      .setDescription(
        `Apostaste **${formatMoney(amount)}**.\n${won ? `¡Ganaste **${formatMoney(winAmount)}**!` : `Perdiste **${formatMoney(amount)}**...`}\n\n**Nuevo saldo:** ${formatMoney(newBalance)}`
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
