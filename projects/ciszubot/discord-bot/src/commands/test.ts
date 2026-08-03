import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const command: BotCommand = {
  name: 'test',
  description: 'Comando de prueba para verificar el funcionamiento del bot',
  aliases: ['prueba', 'testear', 'verificar', 't', 'check'],
  usage: 'cz!test',
  category: 'Utilidad',

  slashCommand: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Comando de prueba para verificar el funcionamiento del bot'),

  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setColor('#4f46e5')
      .setTitle('🧪 Prueba Exitosa')
      .setDescription('¡El bot está funcionando correctamente!')
      .addFields(
        { name: '✅ Estado del Bot', value: 'Operativo', inline: true },
        { name: '🔗 Conexión', value: 'Estable', inline: true },
        { name: '📊 Latencia', value: `${Math.round(message.client.ws.ping)}ms`, inline: true },
        {
          name: '🛠️ Información del Sistema',
          value: `• Node.js: ${process.version}\n• Uptime: ${Math.floor((message.client.uptime ?? 0) / 1000)}s\n• Memoria: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          inline: false,
        },
      )
      .setFooter({
        text: `CiszuBot • Test realizado por ${message.author.tag}`,
        iconURL: message.client.user?.displayAvatarURL(),
      })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};

export default command;
