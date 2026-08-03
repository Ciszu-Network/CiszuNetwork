import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { addMoney, getWallet, setWallet, formatMoney, randomBetween } from '../services/economy';

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
    const target = message.mentions?.users?.first() ?? message.author;
    const guildId = message.guild?.id ?? 'DM';
    const w = await getWallet(target.id, guildId);
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(`💰 Saldo de ${target.username}`)
      .setDescription(
        `**Monedas:** ${formatMoney(w.balance)}\n**Banco:** ${formatMoney(w.bank)}\n**Total:** ${formatMoney(w.balance + w.bank)}`
      )
      .setFooter({ text: `CiszuBot • Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
