import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, formatMoney, randomBetween } from '../services/economy';

const create = (): BotCommand => ({
  name: 'slot',
  description: 'Máquina tragaperras',
  aliases: ['slots', 'tragaperras'],
  usage: 'cz!slot <cantidad>',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName('slot')
    .setDescription('Juega a la máquina tragaperras')
    .addIntegerOption((o) => o.setName('cantidad').setDescription('Cantidad a apostar').setRequired(true)),
  async execute(message, args) {
    const guildId = message.guild?.id ?? 'DM';
    const amount = parseInt(args[0] ?? '', 10);
    if (isNaN(amount) || amount <= 0) {
      await message.reply('❌ Uso: `cz!slot <cantidad>`');
      return;
    }
    const w = await getWallet(message.author.id, guildId);
    if (w.balance < amount) {
      await message.reply(`❌ No tienes suficientes monedas (necesitas ${formatMoney(amount)}).`);
      return;
    }

    const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣', '🎰'];
    const reel = () => symbols[randomBetween(0, symbols.length - 1)];
    const a = reel();
    const b = reel();
    const c = reel();
    const line = `${a} ${b} ${c}`;

    let winAmount = 0;
    if (a === b && b === c) winAmount = amount * 5;
    else if (a === b || b === c || a === c) winAmount = Math.floor(amount * 1.5);

    const newBalance = w.balance - amount + winAmount;
    await setWallet(message.author.id, guildId, newBalance, w.bank, winAmount > 0 ? 'slot_win' : 'slot_lose', `Aposta de ${amount}`);

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? '#00ff88' : '#ff0000')
      .setTitle('🎰 Tragaperras')
      .setDescription(
        `${line}\n\n${winAmount > 0 ? `¡Ganaste **${formatMoney(winAmount)}**!` : `Perdiste **${formatMoney(amount)}**...`}\n\n**Nuevo saldo:** ${formatMoney(newBalance)}`
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
