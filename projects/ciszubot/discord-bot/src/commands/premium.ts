import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { LINKS, BOT_COLORS, BOT_FOOTER } from '../config/links';
import { isPremiumBeta } from '../services/featureFlags';

const command: BotCommand = {
  name: 'premium',
  description: 'Información sobre CiszuBot Premium (gratis durante la beta)',
  aliases: ['vip'],
  usage: 'cz!premium',
  category: 'Información',

  slashCommand: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Información sobre CiszuBot Premium (gratis durante la beta)'),

  async execute(message) {
    const beta = await isPremiumBeta();
    const embed = new EmbedBuilder()
      .setColor('#fbbf24')
      .setTitle('⭐ CiszuBot Premium')
      .setDescription(
        'Premium desbloquea funciones exclusivas para tu servidor: música, búsqueda, embeds personalizados y más.\n\n' +
          `Precios y detalles: ${LINKS.website}/premium`,
      )
      .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    if (beta) {
      embed.addFields({
        name: '🧪 BETA — gratis por ahora',
        value: 'Todas las funciones premium son **gratis** durante la beta. ¡Disfrútalas sin costo!',
      });
    }

    return message.reply({ embeds: [embed] });
  },
};

export default command;
