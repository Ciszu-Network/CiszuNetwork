import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const mensajesSaludo = [
  '¡Qué alegría verte por aquí!', '¡Bienvenido de nuevo!', '¡Espero que tengas un gran día!',
  '¡Qué gusto saludarte!', '¡Qué tal todo?', '¡Me alegra mucho verte!',
  '¡Qué bueno que estás aquí!', '¡Qué onda!', '¡Qué tal tu día!',
  '¡Qué gusto tenerte por aquí!', '¡Qué placer verte!', '¡Qué bueno que llegaste!',
  '¡Qué alegría tenerte aquí!', '¡Qué tal tu estado de ánimo!', '¡Qué gusto encontrarte!',
  '¡Qué bien que estás aquí!', '¡Qué contento estoy de verte!', '¡Qué tal tu semana!',
  '¡Qué alegría que hayas venido!', '¡Qué bueno que te apareciste!',
];

const command: BotCommand = {
  name: 'hi',
  description: 'Saluda al usuario con un mensaje amigable',
  aliases: ['hola', 'saludar', 'saludo', 'hello', 'hey', 'hihi', 'h'],
  usage: 'cz!hi [@usuario]',
  category: 'Social',

  slashCommand: new SlashCommandBuilder()
    .setName('hi')
    .setDescription('Saluda al usuario con un mensaje amigable')
    .addUserOption((option) =>
      option.setName('usuario').setDescription('El usuario al que quieres saludar (opcional)').setRequired(false),
    ),

  async execute(message, args) {
    let targetId = message.author.id;
    if (args.length > 0) {
      const mention = message.mentions?.users.first();
      if (mention) targetId = mention.id;
    }

    const color = Math.floor(Math.random() * 16777215);
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('👋 ¡Hola!')
      .setDescription(`¡Hola <@${targetId}>! ${mensajesSaludo[Math.floor(Math.random() * mensajesSaludo.length)]}`)
      .setThumbnail(message.client.user?.displayAvatarURL() ?? null)
      .setFooter({
        text: `CiszuBot • Solicitado por ${message.author.tag}`,
        iconURL: message.client.user?.displayAvatarURL(),
      })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};

export default command;
