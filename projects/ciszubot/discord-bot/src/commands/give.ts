import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getWallet, setWallet } from '../services/economy';
import { getGuildConfig, formatCoins } from '../services/configService';
import { langOf, tr } from '../services/i18n';

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
    const L = await langOf(message);
    const cfg = await getGuildConfig(message.guild?.id ?? 'DM');
    const guildId = message.guild?.id ?? 'DM';
    const target = message.mentions?.users?.first();
    const rawAmount = args[1] ?? args[0];
    const amount = parseInt(rawAmount ?? '', 10);

    if (!target || isNaN(amount) || amount <= 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle(tr(L, '❌ Uso incorrecto', '❌ Wrong usage'))
        .setDescription(tr(L, 'Uso: `cz!give @usuario <cantidad>`', 'Usage: `cz!give @user <amount>`'))
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
      await message.reply({ embeds: [embed] });
      return;
    }

    if (target.id === message.author.id) {
      await message.reply(tr(L, '❌ No puedes transferirte monedas a ti mismo.', '❌ You cannot transfer coins to yourself.'));
      return;
    }

    const mine = await getWallet(message.author.id, guildId);
    if (mine.balance < amount) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle(tr(L, '❌ Fondos insuficientes', '❌ Insufficient funds'))
        .setDescription(tr(L, `Necesitas **${formatCoins(cfg, amount)}** y solo tienes **${formatCoins(cfg, mine.balance)}**.`, `You need **${formatCoins(cfg, amount)}** and you only have **${formatCoins(cfg, mine.balance)}**.`))
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
      await message.reply({ embeds: [embed] });
      return;
    }

    const theirs = await getWallet(target.id, guildId);
    await setWallet(message.author.id, guildId, mine.balance - amount, mine.bank, 'give_out', tr(L, `Enviado a ${target.tag}`, `Sent to ${target.tag}`));
    await setWallet(target.id, guildId, theirs.balance + amount, theirs.bank, 'give_in', tr(L, `Recibido de ${message.author.tag}`, `Received from ${message.author.tag}`));

    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(tr(L, '💸 ¡Transferencia completada!', '💸 Transfer completed!'))
      .setDescription(tr(L, `**${message.author.tag}** envió **${formatCoins(cfg, amount)}** a **${target.tag}**.`, `**${message.author.tag}** sent **${formatCoins(cfg, amount)}** to **${target.tag}**.`))
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
