import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { addMoney, formatMoney, randomBetween } from '../services/economy';
import { db, ciszubotSchema, eq, and, desc } from '../services/supabase';

const create = (): BotCommand => ({
  name: 'daily',
  description: 'Reclama tu recompensa diaria',
  aliases: ['recompensa', 'día'],
  usage: 'cz!daily',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder().setName('daily').setDescription('Reclama tu recompensa diaria'),
  async execute(message) {
    const guildId = message.guild?.id ?? 'DM';
    const userId = message.author.id;

    const transactions = ciszubotSchema.transactions;
    const rows = await db
      .select({ createdAt: transactions.createdAt })
      .from(transactions)
      .where(and(eq(transactions.guildId, guildId), eq(transactions.userId, userId), eq(transactions.type, 'daily')))
      .orderBy(desc(transactions.createdAt))
      .limit(1);
    const last = rows[0];

    const cooldown = 24 * 60 * 60 * 1000;
    const lastTime = last?.createdAt ? new Date(last.createdAt).getTime() : 0;
    const elapsed = Date.now() - lastTime;
    if (elapsed < cooldown) {
      const remaining = Math.ceil((cooldown - elapsed) / (60 * 1000));
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⏳ ¡Espera!')
        .setDescription(`Ya reclamaste tu recompensa. Vuelve en **${remaining} minutos**.`)
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    const amount = randomBetween(50, 150);
    const bal = await addMoney(userId, guildId, amount, 'daily', 'Recompensa diaria');
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('☀️ ¡Recompensa diaria reclamada!')
      .setDescription(`Recibiste **${formatMoney(amount)}**.\nTu nuevo saldo es **${formatMoney(bal ?? 0)}**.`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default create;
