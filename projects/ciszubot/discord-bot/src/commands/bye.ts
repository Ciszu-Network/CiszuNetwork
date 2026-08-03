import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const mensajesDespedida = [
  '¡Que tengas un buen día!', '¡Nos vemos pronto!', '¡Cuídate mucho!', '¡Fue un placer verte!',
  '¡Que todo te vaya bien!', '¡Que tengas suerte!', '¡Espero verte de nuevo pronto!',
  '¡Que tengas un excelente día!', '¡Gracias por tu visita!', '¡Que la fuerza te acompañe!',
  '¡Que tengas un día maravilloso!', '¡Fue genial verte!', '¡Que todo te salga bien!',
  '¡Que tengas un gran día!', '¡Espero que nos veamos pronto!', '¡Que tengas una semana excelente!',
  '¡Gracias por tu tiempo!', '¡Que el universo te sonría!', '¡Que todo te vaya de maravilla!',
];

const saludosDespedida = ['¡Adiós', '¡Chao', '¡Hasta luego', '¡Hasta la próxima'];

const command: BotCommand = {
  name: 'bye',
  description: 'Se despide del usuario con un mensaje amigable',
  aliases: ['adios', 'despedir', 'despedida', 'chao', 'hasta-luego', 'byebye', 'b'],
  usage: 'cz!bye [@usuario]',
  category: 'Social',

  slashCommand: new SlashCommandBuilder()
    .setName('bye')
    .setDescription('Se despide del usuario con un mensaje amigable')
    .addUserOption((option) =>
      option.setName('usuario').setDescription('El usuario al que quieres despedir (opcional)').setRequired(false),
    ),

  async execute(message, args) {
    let targetId = message.author.id;
    if (args.length > 0) {
      const mention = message.mentions?.users.first();
      if (mention) targetId = mention.id;
    }

    const color = Math.floor(Math.random() * 16777215);
    const saludo = saludosDespedida[Math.floor(Math.random() * saludosDespedida.length)];
    const final = mensajesDespedida[Math.floor(Math.random() * mensajesDespedida.length)];

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('👋 ¡Adiós!')
      .setDescription(`${saludo} <@${targetId}>! ${final}`)
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
