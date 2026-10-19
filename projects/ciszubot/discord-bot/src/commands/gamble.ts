import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, randomBetween } from '../services/economy';
import { getGuildConfig, formatCoins } from '../services/configService';
import { langOf, tr } from '../services/i18n';

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
    const L = await langOf(message);
    const cfg = await getGuildConfig(message.guild?.id ?? 'DM');
    const guildId = message.guild?.id ?? 'DM';
    const amount = parseInt(args[0] ?? '', 10);
    if (isNaN(amount) || amount <= 0) {
      await message.reply(tr(L, '❌ Uso: `cz!gamble <cantidad>`', '❌ Usage: `cz!gamble <amount>`'));
      return;
    }
    const w = await getWallet(message.author.id, guildId);
    if (w.balance < amount) {
      await message.reply(tr(L, `❌ No tienes suficientes monedas (necesitas ${(amount)}).`, `❌ You do not have enough coins (you need ${(amount)}).`));
      return;
    }

    const won = Math.random() < 0.5;
    const winAmount = won ? amount * 2 : 0;
    const newBalance = w.balance - amount + winAmount;
    await setWallet(message.author.id, guildId, newBalance, w.bank, won ? 'gamble_win' : 'gamble_lose', `Aposta de ${amount}`);

    const embed = new EmbedBuilder()
      .setColor(won ? '#00ff88' : '#ff0000')
      .setTitle(won ? tr(L, '🪙 ¡Ganaste la apuesta!', '🪙 You won the bet!') : '🪙 Perdiste la apuesta...')
      .setDescription(
        `Apostaste **${(amount)}**.\n${won ? `¡Ganaste **${(winAmount)}**!` : `Perdiste **${(amount)}**...`}\n\n**Nuevo saldo:** ${(newBalance)}`
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
