import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { playSong, getQueue, skipCurrent, toggleLoop, clearQueue, leaveVoice } from '../services/music';

const play = (): BotCommand => ({
  name: 'play',
  description: 'Reproduce música de YouTube en un canal de voz',
  aliases: ['p', 'reproducir', 'music'],
  usage: 'cz!play <canción o URL>',
  category: 'Música',
  slashCommand: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce música de YouTube')
    .addStringOption((o) => o.setName('cancion').setDescription('Canción o URL de YouTube').setRequired(true)),
  async execute(message, args) {
    const query = args.join(' ');
    if (!query) {
      await message.reply('❌ Uso: `cz!play <canción o URL>`');
      return;
    }
    const member = message.member as never as { voice?: { channel?: { id: string } } } | null;
    const voiceChannel = member?.voice?.channel;
    if (!voiceChannel) {
      await message.reply('❌ Únete a un canal de voz primero.');
      return;
    }
    if (!message.guild || !message.channel) return;
    const result = await playSong(
      message.guild,
      (message.guild.channels.cache.get(voiceChannel.id) as never),
      message.channel as never,
      query,
      message.member as never
    );
    if (!result.ok) {
      await message.reply(`❌ ${result.message}`);
      return;
    }
    await message.reply(result.message ?? '🎵 Añadida a la cola.');
  },
});

const skip = (): BotCommand => ({
  name: 'skip',
  description: 'Salta la canción actual',
  aliases: ['next', 'siguiente'],
  usage: 'cz!skip',
  category: 'Música',
  slashCommand: new SlashCommandBuilder().setName('skip').setDescription('Salta la canción actual'),
  async execute(message) {
    if (!message.guild) return;
    skipCurrent(message.guild.id);
    await message.reply('⏭️ Canción saltada.');
  },
});

const queueCmd = (): BotCommand => ({
  name: 'queue',
  description: 'Muestra la cola de reproducción',
  aliases: ['cola', 'q'],
  usage: 'cz!queue',
  category: 'Música',
  slashCommand: new SlashCommandBuilder().setName('queue').setDescription('Muestra la cola de reproducción'),
  async execute(message) {
    if (!message.guild) return;
    const queue = getQueue(message.guild.id);
    if (!queue) {
      await message.reply('📭 No hay música reproduciéndose en este servidor.');
      return;
    }
    const lines: string[] = [];
    if (queue.current) {
      lines.push(`▶️ **${queue.current.title}** (${queue.current.duration})`);
    }
    queue.items.slice(0, 10).forEach((item, i) => {
      lines.push(`\`${i + 1}.\` ${item.title} (${item.duration}) — ${item.requestedBy}`);
    });
    if (queue.items.length > 10) {
      lines.push(`...y ${queue.items.length - 10} más.`);
    }
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('🎶 Cola de reproducción')
      .setDescription(lines.length > 0 ? lines.join('\n') : 'La cola está vacía.')
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

const stop = (): BotCommand => ({
  name: 'stop',
  description: 'Detiene la música y sale del canal de voz',
  aliases: ['parar', 'leave', 'salir'],
  usage: 'cz!stop',
  category: 'Música',
  slashCommand: new SlashCommandBuilder().setName('stop').setDescription('Detiene la música y sale del canal'),
  async execute(message) {
    if (!message.guild) return;
    leaveVoice(message.guild.id);
    await message.reply('🛑 Música detenida. ¡Hasta la próxima!');
  },
});

const loop = (): BotCommand => ({
  name: 'loop',
  description: 'Activa/desactiva el bucle de la cola',
  aliases: ['bucle', 'repeat'],
  usage: 'cz!loop',
  category: 'Música',
  slashCommand: new SlashCommandBuilder().setName('loop').setDescription('Activa/desactiva el bucle'),
  async execute(message) {
    if (!message.guild) return;
    const enabled = toggleLoop(message.guild.id);
    await message.reply(enabled ? '🔁 Bucle activado.' : '➡️ Bucle desactivado.');
  },
});

const pause = (): BotCommand => ({
  name: 'pause',
  description: 'Pausa la reproducción',
  aliases: ['pausar'],
  usage: 'cz!pause',
  category: 'Música',
  slashCommand: new SlashCommandBuilder().setName('pause').setDescription('Pausa la reproducción'),
  async execute(message) {
    if (!message.guild) return;
    const queue = getQueue(message.guild.id);
    if (!queue) {
      await message.reply('📭 No hay música reproduciéndose.');
      return;
    }
    queue.player.pause();
    await message.reply('⏸️ Reproducción pausada.');
  },
});

const resume = (): BotCommand => ({
  name: 'resume',
  description: 'Reanuda la reproducción',
  aliases: ['reanudar'],
  usage: 'cz!resume',
  category: 'Música',
  slashCommand: new SlashCommandBuilder().setName('resume').setDescription('Reanuda la reproducción'),
  async execute(message) {
    if (!message.guild) return;
    const queue = getQueue(message.guild.id);
    if (!queue) {
      await message.reply('📭 No hay música reproduciéndose.');
      return;
    }
    queue.player.unpause();
    await message.reply('▶️ Reproducción reanudada.');
  },
});

export default [play, skip, queueCmd, stop, loop, pause, resume];
