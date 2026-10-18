import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { addMoney, randomBetween } from '../services/economy';
import { db, ciszubotSchema, eq, and, desc } from '../services/supabase';
import { getGuildConfig, formatCoins } from '../services/configService';

/** Trabajos aleatorios del `work` (sabor local, sin datos inventados de dinero). */
const JOBS = [
  'repartidor de pizza',
  'editor de vídeo',
  'moderador de chat',
  'streamer de madrugada',
  'técnico de soporte',
  'diseñador de logos',
  'probador de videojuegos',
  'locutor de radio',
  'barista del cibercafé',
  'fotógrafo de eventos',
];

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hora

const create = (): BotCommand => ({
  name: 'work',
  description: 'Trabaja para ganar dinero (cada hora)',
  aliases: ['trabajar', 'chamba', 'job'],
  usage: 'cz!work',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder().setName('work').setDescription('Trabaja para ganar dinero (cada hora)'),

  async execute(message) {
    const guildId = message.guild?.id ?? 'DM';
    const userId = message.author.id;

    const transactions = ciszubotSchema.transactions;
    const rows = await db
      .select({ createdAt: transactions.createdAt })
      .from(transactions)
      .where(and(eq(transactions.guildId, guildId), eq(transactions.userId, userId), eq(transactions.type, 'work')))
      .orderBy(desc(transactions.createdAt))
      .limit(1);
    const lastTime = rows[0]?.createdAt ? new Date(rows[0].createdAt).getTime() : 0;
    const elapsed = Date.now() - lastTime;

    if (elapsed < COOLDOWN_MS) {
      const mins = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⏳ Estás cansado')
            .setDescription(`Podrás volver a trabajar en **${mins} min**.`)
            .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp(),
        ],
      });
      return;
    }

    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const amount = randomBetween(20, 80);
    const bal = await addMoney(userId, guildId, amount, 'work', `Trabajó de ${job}`);

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00d4ff')
          .setTitle('💼 ¡Trabajo completado!')
          .setDescription(`Trabajaste de **${job}** y ganaste **${(amount)}**.\nTu nuevo saldo es **${(bal ?? 0)}**.`)
          .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
          .setTimestamp(),
      ],
    });
  },
});

export default create;
