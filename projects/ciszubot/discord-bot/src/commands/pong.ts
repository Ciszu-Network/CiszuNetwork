import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const command: BotCommand = {
  name: 'pong',
  description: 'Muestra el ping del bot con "ping"',
  aliases: ['latencia2', 'ms2', 'pongping', 'p2'],
  usage: 'cz!pong',
  category: 'Utilidad',

  slashCommand: new SlashCommandBuilder()
    .setName('pong')
    .setDescription('Muestra el ping del bot con "ping"'),

  async execute(message, args) {
    const sent = await message.reply('🏓 Calculando ping...');
    const messageLatency = (sent as { createdTimestamp?: number }).createdTimestamp
      ? (sent as { createdTimestamp: number }).createdTimestamp - message.createdTimestamp
      : 0;
    const apiLatency = Math.round(message.client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor('#4f46e5')
      .setTitle('🏓 Ping!')
      .setDescription('Aquí tienes la información de latencia del bot.')
      .addFields(
        { name: '📨 Latencia de Mensaje', value: `${messageLatency}ms`, inline: true },
        { name: '🌐 Latencia de API', value: `${apiLatency}ms`, inline: true },
        { name: '📊 Estado', value: getStatusEmoji(messageLatency, apiLatency), inline: true },
      )
      .setFooter({
        text: `CiszuBot • Solicitado por ${message.author.tag}`,
        iconURL: message.client.user?.displayAvatarURL(),
      })
      .setTimestamp();

    if (typeof sent === 'object' && sent !== null && 'edit' in sent) {
      await (sent as { edit: (c: unknown) => Promise<unknown> }).edit({ content: null, embeds: [embed] });
    } else {
      await message.reply({ embeds: [embed] });
    }
  },
};

function getStatusEmoji(messageLatency: number, apiLatency: number): string {
  const avg = (messageLatency + apiLatency) / 2;
  if (avg < 100) return '🟢 Excelente';
  if (avg < 200) return '🟡 Bueno';
  if (avg < 300) return '🟠 Regular';
  return '🔴 Malo';
}

export default command;
