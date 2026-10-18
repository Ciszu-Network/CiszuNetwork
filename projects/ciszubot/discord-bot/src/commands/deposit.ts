import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, addBank } from '../services/economy';
import { getGuildConfig, formatCoins } from '../services/configService';

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
    const cfg = await getGuildConfig(message.guild?.id ?? 'DM');
    const guildId = message.guild?.id ?? 'DM';
    const w = await getWallet(message.author.id, guildId);
    const amount = args[0]?.toLowerCase() === 'all' ? w.balance : parseInt(args[0] ?? '', 10);

    if (isNaN(amount) || amount <= 0) {
      await message.reply('❌ Uso: `cz!deposit <cantidad|all>`');
      return;
    }
    if (w.balance < amount) {
      await message.reply(`❌ No tienes suficientes monedas (tienes ${(w.balance)}).`);
      return;
    }

    await setWallet(message.author.id, guildId, w.balance - amount, w.bank + amount, 'deposit', 'Depósito en banco');
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('🏦 ¡Depósito exitoso!')
      .setDescription(`Guardaste **${(amount)}** en el banco.\n**Banco:** ${(w.bank + amount)}`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
