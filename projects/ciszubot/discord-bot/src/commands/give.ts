import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet, formatMoney } from '../services/economy';

const create = (): BotCommand => ({
  name: 'give',
  description: 'Transfiere monedas a otro usuario',
  aliases: ['pay', 'transfer', 'enviar', 'dar'],
  usage: 'cz!give @usuario <cantidad>',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Transfiere monedas a otro usuario')
    .addUserOption((o) => o.setName('usuario').setDescription('Receptor').setRequired(true))
    .addIntegerOption((o) => o.setName('cantidad').setDescription('Cantidad de monedas').setRequired(true)),
  async execute(message, args) {
    const guildId = message.guild?.id ?? 'DM';
    const target = message.mentions?.users?.first();
    const rawAmount = args[1] ?? args[0];
    const amount = parseInt(rawAmount ?? '', 10);

    if (!target || isNaN(amount) || amount <= 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Uso incorrecto')
        .setDescription('Uso: `cz!give @usuario <cantidad>`')
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
      await message.reply({ embeds: [embed] });
      return;
    }

    if (target.id === message.author.id) {
      await message.reply('❌ No puedes transferirte monedas a ti mismo.');
      return;
    }

    const mine = await getWallet(message.author.id, guildId);
    if (mine.balance < amount) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Fondos insuficientes')
        .setDescription(`Necesitas **${formatMoney(amount)}** y solo tienes **${formatMoney(mine.balance)}**.`)
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
      await message.reply({ embeds: [embed] });
      return;
    }

    const theirs = await getWallet(target.id, guildId);
    await setWallet(message.author.id, guildId, mine.balance - amount, mine.bank, 'give_out', `Enviado a ${target.tag}`);
    await setWallet(target.id, guildId, theirs.balance + amount, theirs.bank, 'give_in', `Recibido de ${message.author.tag}`);

    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('💸 ¡Transferencia completada!')
      .setDescription(`**${message.author.tag}** envió **${formatMoney(amount)}** a **${target.tag}**.`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
