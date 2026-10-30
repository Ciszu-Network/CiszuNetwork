import { randomInt } from 'crypto';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { DEFAULT_NSFW_CONTENT, getGuildConfig, isNsfwUnlocked } from './configService';
import type { NsfwContentPreferences } from './configService';
import { logger } from './logger';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { NSFW_BASES, effectiveGender, isNsfwSelectionEnabled } from './nsfw/catalog';
import type { NsfwSelection } from './nsfw/catalog';
import { fetchNsfwMedia } from './nsfw/providers';
import { getFeatureState } from './featureFlags';

/**
 * Autopublicaciones: el bot publica periódicamente en canales configurados.
 * Tipos: 'custom' (anuncio propio con texto/url), 'animals' (imagen aleatoria
 * de mascotas) y 'anime' (imagen aleatoria de anime; con nsfw: true solo en
 * canales marcados como NSFW). Además: autopics +18 del apartado +18.
 */

export interface AutopostConfig {
  id: string;
  type: string;
  channel_id: string;
  interval_minutes: number;
  text?: string;
  url?: string;
  nsfw?: boolean;
  nsfwPrefs?: NsfwContentPreferences;
}

const timers = new Map<string, { timer: NodeJS.Timeout; signature: string }>();

async function fetchAnimalImage(): Promise<string | null> {
  try {
    const r = await fetch('https://api.thecatapi.com/v1/images/search?limit=1');
    if (r.ok) {
      const j = (await r.json()) as Array<{ url?: string }>;
      if (typeof j?.[0]?.url === 'string') return j[0].url;
    }
  } catch (error) {
    logger.warn('autopost cat api:', error);
  }
  try {
    const r = await fetch('https://dog.ceo/api/breeds/image/random');
    if (r.ok) {
      const j = (await r.json()) as { message?: string };
      if (typeof j?.message === 'string') return j.message;
    }
  } catch (error) {
    logger.warn('autopost dog api:', error);
  }
  return null;
}

async function fetchAnimeImage(): Promise<string | null> {
  try {
    const r = await fetch('https://api.waifu.pics/sfw/waifu');
    if (r.ok) {
      const j = (await r.json()) as { url?: string };
      if (typeof j?.url === 'string') return j.url;
    }
  } catch (error) {
    logger.warn('autopost anime api:', error);
  }
  return null;
}

function randomNsfwSelection(prefs: NsfwContentPreferences): NsfwSelection | null {
  const candidates = NSFW_BASES.map((def) => ({
    def,
    style: def.defaultStyle,
    gender: def.defaultGender,
    variant: def.purrbotVariants
      ? 'ffm' in def.purrbotVariants
        ? 'ffm'
        : Object.keys(def.purrbotVariants)[0]
      : undefined,
  })).filter((selection) => isNsfwSelectionEnabled(selection, prefs));
  if (candidates.length === 0) return null;
  return candidates[randomInt(candidates.length)] ?? null;
}

async function postOnce(client: Client, guildId: string, post: AutopostConfig): Promise<void> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
  const channel = guild.channels.cache.get(post.channel_id) as TextChannel | undefined;
  if (!channel || !channel.isTextBased()) return;
  // +18: solo en canales marcados como NSFW en Discord.
  if (post.nsfw && !channel.nsfw) return;

  const embed = new EmbedBuilder()
    .setColor(post.nsfw ? BOT_COLORS.danger : BOT_COLORS.primary)
    .setFooter(BOT_FOOTER('Autopublicación', client.user?.displayAvatarURL()))
    .setTimestamp();
  let hasContent = false;

  if (post.type === 'animals') {
    const url = await fetchAnimalImage();
    if (url) {
      embed.setTitle('🐾 Mascota aleatoria');
      embed.setImage(url);
      hasContent = true;
    }
  } else if (post.type === 'anime' || post.type === 'nsfw') {
    if (post.nsfw) {
      const prefs = post.nsfwPrefs ?? DEFAULT_NSFW_CONTENT;
      const selection = randomNsfwSelection(prefs);
      const media = selection ? await fetchNsfwMedia(selection, effectiveGender(selection, prefs)) : null;
      if (media) {
        embed.setTitle(`🔞 ${media.title}`);
        embed.setImage(media.url);
        if (media.link) embed.setDescription(`[Ver el vídeo completo](${media.link})`);
        hasContent = true;
      }
    } else {
      const url = await fetchAnimeImage();
      if (url) {
        embed.setTitle('✨ Anime');
        embed.setImage(url);
        hasContent = true;
      }
    }
  }

  if (post.text) {
    embed.setDescription(post.text.slice(0, 2000));
    hasContent = true;
  }
  if (post.url && !embed.data.image) {
    embed.setImage(post.url);
    hasContent = true;
  }
  if (!hasContent) return;

  await channel.send({ embeds: [embed] }).catch((error) => logger.warn('autopost send:', error));
}

/** Sincroniza los timers con la config actual (cada minuto + al arrancar). */
export function syncAutoposts(client: Client): void {
  for (const guild of client.guilds.cache.values()) {
    void (async () => {
      const cfg = await getGuildConfig(guild.id).catch(() => null);
      if (!cfg) return;

      const wanted = new Map<string, AutopostConfig>();
      if (cfg.autoposts_enabled) {
        for (const p of cfg.autoposts) {
          if (p?.id && p.channel_id && p.interval_minutes >= 5) wanted.set(`${guild.id}:${p.id}`, p);
        }
      }
      const nsfwChannelId = cfg.nsfw_autopost_channel_id ?? cfg.nsfw_channel_id;
      const nsfwFeature = await getFeatureState('nsfw');
      if (nsfwFeature.enabled && isNsfwUnlocked(cfg) && cfg.nsfw_autopost_enabled && nsfwChannelId) {
        const mins = Math.max(15, cfg.nsfw_autopost_minutes);
        wanted.set(`${guild.id}:nsfw`, {
          id: 'nsfw',
          type: 'nsfw',
          channel_id: nsfwChannelId,
          interval_minutes: mins,
          nsfw: true,
          nsfwPrefs: cfg.nsfw_content,
        });
      }

      // Detener los que ya no están configurados.
      for (const key of [...timers.keys()]) {
        if (key.startsWith(`${guild.id}:`) && !wanted.has(key)) {
          const entry = timers.get(key);
          if (entry) clearInterval(entry.timer);
          timers.delete(key);
        }
      }
      // Arrancar los nuevos o reemplazar los que cambiaron (intervalo/prefs).
      for (const [key, post] of wanted) {
        const signature = JSON.stringify(post);
        const existing = timers.get(key);
        if (existing?.signature === signature) continue;
        if (existing) clearInterval(existing.timer);
        const timer = setInterval(() => void postOnce(client, guild.id, post), post.interval_minutes * 60_000);
        timers.set(key, { timer, signature });
        logger.info(`Autopublicación activa: ${key} (${post.type}, cada ${post.interval_minutes} min)`);
      }
    })();
  }
}

/** Arranca el bucle de sincronización (llamado en el ready). */
export function startAutopostLoop(client: Client): void {
  syncAutoposts(client);
  setInterval(() => syncAutoposts(client), 60_000);
}
