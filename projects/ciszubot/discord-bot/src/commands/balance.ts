import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { addMoney, getWallet, setWallet, randomBetween } from '../services/economy';
import { getGuildConfig, formatCoins } from '../services/configService';
import { langOf, tr } from '../services/i18n';

const create = (): BotCommand => ({
  name: 'balance',
  description: 'Muestra tu saldo (monedas y banco)',
  aliases: ['bal', 'saldo', 'coins'],
  usage: 'cz!balance [@usuario]',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Muestra tu saldo o el de otro usuario')
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario a consultar').setRequired(false)),
  async execute(message, args) {
    const L = await langOf(message);
    const cfg = await getGuildConfig(message.guild?.id ?? 'DM');
    const target = message.mentions?.users?.first() ?? message.author;
    const guildId = message.guild?.id ?? 'DM';
    const w = await getWallet(target.id, guildId);
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(tr(L, `💰 Saldo de ${target.username}`, `💰 ${target.username}'s balance`))
      .setDescription(
        tr(L, `**Monedas:** ${(w.balance)}\n**Banco:** ${(w.bank)}\n**Total:** ${(w.balance + w.bank)}`, `**Coins:** ${(w.balance)}\n**Bank:** ${(w.bank)}\n**Total:** ${(w.balance + w.bank)}`)
      )
      .setFooter({ text: tr(L, tr(L, `CiszuBot • Solicitado por ${message.author.tag}`, `CiszuBot • Requested by ${message.author.tag}`), `CiszuBot • Requested by ${message.author.tag}`), iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
