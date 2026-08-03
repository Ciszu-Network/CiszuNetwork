import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS } from '../config/links';
import { config } from '../config/index';

const command: BotCommand = {
  name: 'status',
  description: 'Muestra el estado en vivo del bot y su web',
  aliases: ['stats', 'estado', 'info', 'botinfo', 'uptime'],
  usage: 'cz!status',
  category: 'Información',

  slashCommand: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Muestra el estado en vivo del bot y su web'),

  async execute(message) {
    const totalServers = message.client.guilds?.cache.size ?? 0;
    const totalUsers = message.client.guilds?.cache.reduce((acc, g) => acc + (g.memberCount ?? 0), 0) ?? 0;
    const uptime = formatUptime(message.client.uptime ?? 0);

    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.success)
      .setTitle('📊 Estado de CiszuBot')
      .setDescription(
        `El bot está **en línea** y operativo. Estado en vivo disponible también en la web: ${LINKS.website}`,
      )
      .addFields(
        { name: '🟢 Estado', value: 'Online', inline: true },
        { name: '🏠 Servidores', value: String(totalServers), inline: true },
        { name: '👥 Usuarios', value: String(totalUsers), inline: true },
        { name: '⏱️ Uptime', value: uptime, inline: true },
        { name: '🏓 Latencia API', value: `${Math.round(message.client.ws.ping)}ms`, inline: true },
        { name: '📦 Versión', value: config.version ?? 'v3.0.0', inline: true },
      )
      .setFooter(BOT_FOOTER(`Solicitado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Estado en vivo').setURL(LINKS.website),
    );

    return message.reply({ embeds: [embed], components: [row] });
  },
};

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default command;
