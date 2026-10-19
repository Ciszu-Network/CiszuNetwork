import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, randomBetween } from '../services/economy';
import { getGuildConfig, formatCoins } from '../services/configService';
import { langOf, tr } from '../services/i18n';

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
    const L = await langOf(message);
    const cfg = await getGuildConfig(message.guild?.id ?? 'DM');
    const guildId = message.guild?.id ?? 'DM';
    const amount = parseInt(args[0] ?? '', 10);
    if (isNaN(amount) || amount <= 0) {
      await message.reply(tr(L, '❌ Uso: `cz!slot <cantidad>`', '❌ Usage: `cz!slot <amount>`'));
      return;
    }
    const w = await getWallet(message.author.id, guildId);
    if (w.balance < amount) {
      await message.reply(tr(L, `❌ No tienes suficientes monedas (necesitas ${(amount)}).`, `❌ You do not have enough coins (you need ${(amount)}).`));
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
        `${line}\n\n${winAmount > 0 ? `¡Ganaste **${(winAmount)}**!` : `Perdiste **${(amount)}**...`}\n\n**Nuevo saldo:** ${(newBalance)}`
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
