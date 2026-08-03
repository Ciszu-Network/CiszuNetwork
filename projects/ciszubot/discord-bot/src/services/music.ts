import { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import { Guild, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import play from 'play-dl';
import { logger } from './logger';

interface QueueItem {
  title: string;
  url: string;
  duration: string;
  requestedBy: string;
}

interface GuildQueue {
  connection: ReturnType<typeof joinVoiceChannel>;
  player: ReturnType<typeof createAudioPlayer>;
  items: QueueItem[];
  current: QueueItem | null;
  loop: boolean;
  voiceChannelId: string;
  textChannelId: string;
}

const queues = new Map<string, GuildQueue>();

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function playNext(queue: GuildQueue): Promise<void> {
  if (queue.items.length === 0) {
    queue.current = null;
    setTimeout(() => {
      if (queue.items.length === 0 && queue.connection.state.status === VoiceConnectionStatus.Ready) {
        queue.connection.destroy();
        queues.delete(queue.connection.joinConfig.guildId);
      }
    }, 60_000);
    return;
  }
  queue.current = queue.items.shift() ?? null;
  if (!queue.current) return;
  try {
    const stream = await play.stream(queue.current.url);
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    queue.player.play(resource);
  } catch (error) {
    logger.warn('playNext stream error:', error);
    void playNext(queue);
  }
}

export async function playSong(
  guild: Guild,
  voiceChannel: VoiceChannel,
  textChannel: TextChannel,
  query: string,
  requester: GuildMember
): Promise<{ ok: boolean; message?: string }> {
  let queue = queues.get(guild.id);
  if (!queue) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
    const player = createAudioPlayer();
    player.on(AudioPlayerStatus.Idle, () => void playNext(queue!));
    queue = {
      connection,
      player,
      items: [],
      current: null,
      loop: false,
      voiceChannelId: voiceChannel.id,
      textChannelId: textChannel.id,
    };
    queues.set(guild.id, queue);
    connection.subscribe(player);
    await entersState(connection, VoiceConnectionStatus.Ready, 15_000).catch(() => undefined);
  } else if (queue.voiceChannelId !== voiceChannel.id) {
    queue.connection.destroy();
    queue.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
    queue.voiceChannelId = voiceChannel.id;
    queue.textChannelId = textChannel.id;
    queue.connection.subscribe(queue.player);
  }

  const isUrl = /^https?:\/\//.test(query);
  let item: QueueItem;
  try {
    if (isUrl) {
      const info = await play.video_info(query);
      item = {
        title: info.video_details.title ?? 'Canción',
        url: info.video_details.url,
        duration: info.video_details.durationRaw ?? '?',
        requestedBy: requester.user.tag,
      };
    } else {
      const results = await play.search(query, { limit: 1 });
      if (results.length === 0) {
        return { ok: false, message: 'No encontré resultados para esa búsqueda.' };
      }
      const video = results[0];
      item = {
        title: video.title ?? query,
        url: video.url,
        duration: video.durationRaw ?? '?',
        requestedBy: requester.user.tag,
      };
    }
  } catch (error) {
    logger.warn('playSong search error:', error);
    return { ok: false, message: 'Hubo un error buscando la canción.' };
  }

  queue.items.push(item);
  if (!queue.current) {
    void playNext(queue);
  }
  return { ok: true, message: `🎵 **${item.title}** (${item.duration}) añadida a la cola.` };
}

export function getQueue(guildId: string): GuildQueue | undefined {
  return queues.get(guildId);
}

export function skipCurrent(guildId: string): void {
  const queue = queues.get(guildId);
  if (queue?.player) queue.player.stop();
}

export function toggleLoop(guildId: string): boolean {
  const queue = queues.get(guildId);
  if (!queue) return false;
  queue.loop = !queue.loop;
  return queue.loop;
}

export function clearQueue(guildId: string): void {
  const queue = queues.get(guildId);
  if (queue) {
    queue.items = [];
  }
}

export function leaveVoice(guildId: string): void {
  const queue = queues.get(guildId);
  if (queue) {
    queue.player.stop();
    queue.connection.destroy();
    queues.delete(guildId);
  }
}
