import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { langOf, tr } from '../services/i18n';

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
    const L = await langOf(message);
    const embed = new EmbedBuilder()
      .setColor('#4f46e5')
      .setTitle('🧪 Prueba Exitosa')
      .setDescription('¡El bot está funcionando correctamente!')
      .addFields(
        { name: tr(L, '✅ Estado del Bot', '✅ Bot status'), value: 'Operativo', inline: true },
        { name: tr(L, '🔗 Conexión', '🔗 Connection'), value: 'Estable', inline: true },
        { name: tr(L, '📊 Latencia', '📊 Latency'), value: `${Math.round(message.client.ws.ping)}ms`, inline: true },
        {
          name: tr(L, '🛠️ Información del Sistema', '🛠️ System information'),
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
