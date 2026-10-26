import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet } from '../services/economy';
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
        tr(
          L,
          `**Monedas:** ${formatCoins(cfg, w.balance)}\n**Banco:** ${formatCoins(cfg, w.bank)}\n**Total:** ${formatCoins(cfg, w.balance + w.bank)}`,
          `**Coins:** ${formatCoins(cfg, w.balance)}\n**Bank:** ${formatCoins(cfg, w.bank)}\n**Total:** ${formatCoins(cfg, w.balance + w.bank)}`,
        ),
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
