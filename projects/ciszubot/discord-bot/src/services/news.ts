import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { db, ciszubotSchema, eq } from '@ciszunetwork/db';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { getGuildConfig, type NewsChannels } from './configService';
import { tr } from './i18n';
import { logger } from './logger';

export type NewsCategory = 'anime' | 'games' | 'steam' | 'tech';
export type PublishNewsCategory = NewsCategory | 'rss';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image?: string;
  video?: string;
  publishedAt: Date;
  source: string;
}

type NewsSource = {
  url: string;
  kind: 'rss' | 'gamerpower';
  hosts: string[];
  label: string;
  maxAgeDays: number;
};

export const NEWS_CATEGORIES: NewsCategory[] = ['anime', 'games', 'steam', 'tech'];

const NEWS_SOURCES: Record<NewsCategory, NewsSource> = {
  anime: {
    url: 'https://www.animenewsnetwork.com/all/rss.xml',
    kind: 'rss',
    hosts: ['animenewsnetwork.com'],
    label: 'Anime News Network',
    maxAgeDays: 30,
  },
  games: {
    url: 'https://www.gamespot.com/feeds/news/',
    kind: 'rss',
    hosts: ['gamespot.com'],
    label: 'GameSpot',
    maxAgeDays: 14,
  },
  steam: {
    url: 'https://www.gamerpower.com/api/giveaways?platform=steam&type=game',
    kind: 'gamerpower',
    hosts: ['gamerpower.com', 'steampowered.com'],
    label: 'GamerPower',
    maxAgeDays: 90,
  },
  tech: {
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    kind: 'rss',
    hosts: ['bbc.co.uk', 'bbc.com'],
    label: 'BBC Technology',
    maxAgeDays: 14,
  },
};

const CATEGORY_LABEL: Record<PublishNewsCategory, [string, string]> = {
  anime: ['Anime', 'Anime'],
  games: ['Videojuegos', 'Video games'],
  steam: ['Steam gratis', 'Free Steam'],
  tech: ['Tecnología', 'Technology'],
  rss: ['RSS personalizada', 'Custom RSS'],
};

const USER_AGENT = 'CiszuBot/3.4 (+https://ciszubot.vercel.app)';
const CACHE_TTL_MS = 120_000;
const MAX_ITEMS_PER_CYCLE = 5;
const MAX_SEEN_PER_CATEGORY = 80;

const sourceCache = new Map<NewsCategory, { at: number; items: NewsItem[] }>();
const sourceInFlight = new Map<NewsCategory, Promise<NewsItem[]>>();
const translationCache = new Map<string, string>();
const syncing = new Set<string>();

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&#(\d+);/g, (_m, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&([a-z]+);/gi, (m, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? m)
    .replace(/&amp;/gi, '&');
}

function stripHtml(value: string): string {
  let output = '';
  let index = 0;
  while (index < value.length) {
    if (value[index] !== '<') {
      output += value[index];
      index += 1;
      continue;
    }
    const lower = value.slice(index, index + 9).toLowerCase();
    const tag = lower.startsWith('<script') ? 'script' : lower.startsWith('<style') ? 'style' : null;
    if (tag) {
      const close = value.toLowerCase().indexOf(`</${tag}`, index + 1);
      if (close === -1) break;
      const end = value.indexOf('>', close);
      index = end === -1 ? value.length : end + 1;
      continue;
    }
    const end = value.indexOf('>', index + 1);
    index = end === -1 ? value.length : end + 1;
  }
  return output;
}

function cleanText(value: string | undefined): string {
  if (!value) return '';
  return stripHtml(decodeXml(value))
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

function tagText(block: string, tag: string): string {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`, 'i'));
  return match?.[1] ? decodeXml(match[1]).trim() : '';
}

function firstHttpsUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(decodeXml(value).trim());
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function extractImage(block: string, description: string): string | undefined {
  const media = block.match(/<media:(?:content|thumbnail)[^>]*\burl=["']([^"']+)["']/i)?.[1];
  const enclosure = block.match(/<enclosure[^>]*\burl=["']([^"']+)["']/i)?.[1];
  const inline = description.match(/<img[^>]*\bsrc=["']([^"']+)["']/i)?.[1];
  return firstHttpsUrl(media) ?? firstHttpsUrl(enclosure) ?? firstHttpsUrl(inline);
}

function extractVideo(block: string): string | undefined {
  const media = block.match(/<media:content[^>]*\btype=["']video\/[^"']+["'][^>]*\burl=["']([^"']+)["']/i)?.[1]
    ?? block.match(/<media:content[^>]*\burl=["']([^"']+)["'][^>]*\btype=["']video\/[^"']+["']/i)?.[1];
  const enclosure = block.match(/<enclosure[^>]*\btype=["']video\/[^"']+["'][^>]*\burl=["']([^"']+)["']/i)?.[1]
    ?? block.match(/<enclosure[^>]*\burl=["']([^"']+)["'][^>]*\btype=["']video\/[^"']+["']/i)?.[1];
  return firstHttpsUrl(media) ?? firstHttpsUrl(enclosure);
}

export function parseRssFeed(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  for (const match of xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)) {
    if (items.length >= 40) break;
    const block = match[0];
    const title = cleanText(tagText(block, 'title') || tagText(block, 'media:title'));
    const link =
      tagText(block, 'link') ||
      block.match(/<link[^>]*\bhref=["']([^"']+)["']/i)?.[1] ||
      '';
    const descriptionRaw =
      tagText(block, 'description') ||
      tagText(block, 'summary') ||
      tagText(block, 'content:encoded') ||
      tagText(block, 'content') ||
      tagText(block, 'media:description');
    const dateRaw =
      tagText(block, 'pubDate') || tagText(block, 'dc:date') || tagText(block, 'published') || tagText(block, 'updated') || '';
    const guid = tagText(block, 'guid') || tagText(block, 'id');
    const publishedAt = new Date(dateRaw);
    const id = cleanText(guid) || link;
    if (!title || !link || !id || Number.isNaN(publishedAt.getTime())) continue;
    items.push({
      id,
      title,
      description: cleanText(descriptionRaw).slice(0, 1200),
      link: decodeXml(link).trim(),
      image: extractImage(block, descriptionRaw),
      video: extractVideo(block),
      publishedAt,
      source: '',
    });
  }
  return items;
}

export function parseGamerPower(json: string): NewsItem[] {
  let rows: unknown;
  try {
    rows = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(rows)) return [];
  const items: NewsItem[] = [];
  for (const raw of rows) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    if (String(row.status ?? '').toLowerCase() !== 'active') continue;
    if (String(row.type ?? '').toLowerCase() !== 'game') continue;
    if (!String(row.platforms ?? '').toLowerCase().includes('steam')) continue;
    const title = cleanText(String(row.title ?? ''));
    const link = String(row.open_giveaway_url ?? row.gamerpower_url ?? '');
    const published = new Date(String(row.published_date ?? '').replace(' ', 'T') + 'Z');
    const id = row.id === undefined ? '' : `gamerpower-${String(row.id)}`;
    if (!title || !link || !id || Number.isNaN(published.getTime())) continue;
    items.push({
      id,
      title,
      description: cleanText(String(row.description ?? '')).slice(0, 1200),
      link,
      image: firstHttpsUrl(String(row.image ?? row.thumbnail ?? '')),
      publishedAt: published,
      source: 'GamerPower',
    });
  }
  return items;
}

function hostAllowed(hostname: string, hosts: string[]): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  return hosts.some((entry) => host === entry || host.endsWith(`.${entry}`));
}

export function verifyNewsItem(item: NewsItem, category: NewsCategory, now = Date.now()): boolean {
  const source = NEWS_SOURCES[category];
  if (item.title.length < 3 || item.title.length > 300) return false;
  let url: URL;
  try {
    url = new URL(item.link);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || !hostAllowed(url.hostname, source.hosts)) return false;
  const published = item.publishedAt.getTime();
  if (!Number.isFinite(published)) return false;
  if (published > now + 2 * 60 * 60_000) return false;
  if (published < now - source.maxAgeDays * 86_400_000) return false;
  if (item.image && !/^https:\/\//i.test(item.image)) return false;
  return true;
}

async function fetchSource(category: NewsCategory): Promise<NewsItem[]> {
  const source = NEWS_SOURCES[category];
  const response = await fetch(source.url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/xml, application/json, text/xml;q=0.9, */*;q=0.5' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.text();
  const parsed = source.kind === 'gamerpower' ? parseGamerPower(body) : parseRssFeed(body);
  return parsed
    .map((item) => ({ ...item, source: source.label }))
    .filter((item) => verifyNewsItem(item, category))
    .slice(0, 30);
}

export async function getNewsItems(category: NewsCategory): Promise<NewsItem[]> {
  const cached = sourceCache.get(category);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.items;
  const pending = sourceInFlight.get(category);
  if (pending) return pending;
  const request = fetchSource(category)
    .then((items) => {
      sourceCache.set(category, { at: Date.now(), items });
      return items;
    })
    .catch((error) => {
      logger.warn(`news source ${category}:`, error);
      return cached?.items ?? [];
    })
    .finally(() => {
      sourceInFlight.delete(category);
    });
  sourceInFlight.set(category, request);
  return request;
}

const customCache = new Map<string, { at: number; items: NewsItem[] }>();
const customInFlight = new Map<string, Promise<NewsItem[]>>();

function safeCustomRssUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host.endsWith('.local') ||
      host === '0.0.0.0' ||
      host === '[::1]' ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      /^169\.254\./.test(host)
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchCustomRss(rawUrl: string): Promise<NewsItem[]> {
  const url = safeCustomRssUrl(rawUrl);
  if (!url) return [];
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.text();
  const now = Date.now();
  return parseRssFeed(body)
    .filter((item) => {
      try {
        const link = new URL(item.link);
        if (link.protocol !== 'https:') return false;
        const published = item.publishedAt.getTime();
        if (!Number.isFinite(published)) return false;
        if (published > now + 2 * 60 * 60_000) return false;
        if (published < now - 30 * 86_400_000) return false;
        if (item.image && !/^https:\/\//i.test(item.image)) return false;
        return true;
      } catch {
        return false;
      }
    })
    .slice(0, 30);
}

async function getCustomNewsItems(rawUrl: string): Promise<NewsItem[]> {
  const key = safeCustomRssUrl(rawUrl);
  if (!key) return [];
  const cached = customCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.items;
  const pending = customInFlight.get(key);
  if (pending) return pending;
  const request = fetchCustomRss(key)
    .then((items) => {
      customCache.set(key, { at: Date.now(), items });
      return items;
    })
    .catch((error) => {
      logger.warn('news custom rss:', error);
      return cached?.items ?? [];
    })
    .finally(() => {
      customInFlight.delete(key);
    });
  customInFlight.set(key, request);
  return request;
}

async function translateFor(lang: string, text: string): Promise<string> {
  if (lang !== 'es' || !text || process.env.NODE_ENV === 'test' || process.env.VITEST) return text;
  const cacheKey = `es:${text}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;
  try {
    const query = encodeURIComponent(text.slice(0, 450));
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${query}`,
      { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(5_000) },
    );
    if (!response.ok) return text;
    const data = (await response.json()) as unknown;
    const chunks = Array.isArray(data) && Array.isArray(data[0]) ? (data[0] as unknown[]) : [];
    const translated = chunks
      .map((chunk) => (Array.isArray(chunk) && typeof chunk[0] === 'string' ? chunk[0] : ''))
      .join('')
      .trim();
    if (!translated) return text;
    if (translationCache.size >= 500) {
      const oldest = translationCache.keys().next().value;
      if (oldest) translationCache.delete(oldest);
    }
    translationCache.set(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
}

export async function publishNewsItem(
  client: Client,
  channel: TextChannel,
  lang: string,
  category: PublishNewsCategory,
  item: NewsItem,
): Promise<boolean> {
  const [title, description] = await Promise.all([
    translateFor(lang, item.title),
    translateFor(lang, item.description),
  ]);
  const label = tr(lang, CATEGORY_LABEL[category][0], CATEGORY_LABEL[category][1]);
  const readMore = tr(lang, 'Leer más', 'Read more');
  const embed = new EmbedBuilder()
    .setColor(BOT_COLORS.primary)
    .setAuthor({ name: `${label} • ${item.source}` })
    .setTitle(title.slice(0, 256))
    .setURL(item.link)
    .setDescription(
      `${description.slice(0, 1800)}${description ? '\n\n' : ''}[${readMore}](${item.link})`,
    )
    .setFooter(BOT_FOOTER(tr(lang, 'Noticias', 'News'), client.user?.displayAvatarURL()))
    .setTimestamp(item.publishedAt);
  if (item.image) embed.setImage(item.image);
  try {
    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return true;
  } catch (error) {
    logger.warn('news send:', error);
    return false;
  }
}

type SeenMap = Partial<Record<PublishNewsCategory, string[]>>;

function asSeenMap(value: unknown): SeenMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: SeenMap = {};
  for (const category of [...NEWS_CATEGORIES, 'rss'] as PublishNewsCategory[]) {
    const ids = (value as Record<string, unknown>)[category];
    if (Array.isArray(ids)) result[category] = ids.filter((id): id is string => typeof id === 'string');
  }
  return result;
}

async function syncGuild(client: Client, guildId: string): Promise<void> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
  const cfg = await getGuildConfig(guildId);
  if (!cfg.news_enabled) return;
  const channels = cfg.news_channels as Partial<NewsChannels>;
  const active = NEWS_CATEGORIES.filter((category) => Boolean(channels[category]));
  const rssActive = Boolean(cfg.news_rss_url && cfg.news_rss_channel_id);
  if (active.length === 0 && !rssActive) return;

  const guildConfigs = ciszubotSchema.guildConfigs;
  const rows = await db
    .select({ seen: guildConfigs.newsSeen })
    .from(guildConfigs)
    .where(eq(guildConfigs.guildId, guildId))
    .limit(1);
  const seen = asSeenMap(rows[0]?.seen);
  let changed = false;

  for (const category of active) {
    const channelId = channels[category];
    if (!channelId) continue;
    const channel = guild.channels.cache.get(channelId) as TextChannel | undefined;
    if (!channel || !channel.isTextBased()) continue;
    const items = await getNewsItems(category);
    if (items.length === 0) continue;

    const previous = seen[category];
    if (!Array.isArray(previous)) {
      seen[category] = items.map((item) => item.id).slice(0, MAX_SEEN_PER_CATEGORY);
      changed = true;
      continue;
    }

    const seenIds = new Set(previous);
    const fresh = items
      .filter((item) => !seenIds.has(item.id))
      .sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())
      .slice(0, MAX_ITEMS_PER_CYCLE);

    let categoryChanged = false;
    for (const item of fresh) {
      const sent = await publishNewsItem(client, channel, cfg.lang, category, item);
      if (!sent) continue;
      seenIds.add(item.id);
      categoryChanged = true;
    }
    if (categoryChanged) {
      seen[category] = [...seenIds].slice(-MAX_SEEN_PER_CATEGORY);
      changed = true;
    }
  }

  if (rssActive && cfg.news_rss_url && cfg.news_rss_channel_id) {
    const channel = guild.channels.cache.get(cfg.news_rss_channel_id) as TextChannel | undefined;
    if (channel?.isTextBased()) {
      const items = await getCustomNewsItems(cfg.news_rss_url);
      if (items.length > 0) {
        const previous = seen.rss;
        if (!Array.isArray(previous)) {
          seen.rss = items.map((item) => item.id).slice(0, MAX_SEEN_PER_CATEGORY);
          changed = true;
        } else {
          const seenIds = new Set(previous);
          const fresh = items
            .filter((item) => !seenIds.has(item.id))
            .sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())
            .slice(0, MAX_ITEMS_PER_CYCLE);
          let rssChanged = false;
          for (const item of fresh) {
            const sent = await publishNewsItem(client, channel, cfg.lang, 'rss', item);
            if (!sent) continue;
            seenIds.add(item.id);
            rssChanged = true;
          }
          if (rssChanged) {
            seen.rss = [...seenIds].slice(-MAX_SEEN_PER_CATEGORY);
            changed = true;
          }
        }
      }
    }
  }

  if (!changed) return;
  await db
    .update(guildConfigs)
    .set({ newsSeen: seen, updatedAt: new Date() })
    .where(eq(guildConfigs.guildId, guildId))
    .catch((error) => logger.warn('news seen update:', error));
}

export async function syncNews(client: Client): Promise<void> {
  for (const guild of client.guilds.cache.values()) {
    if (syncing.has(guild.id)) continue;
    syncing.add(guild.id);
    try {
      await syncGuild(client, guild.id);
    } catch (error) {
      logger.warn(`news sync ${guild.id}:`, error);
    } finally {
      syncing.delete(guild.id);
    }
  }
}

export function startNewsLoop(client: Client): void {
  setTimeout(() => void syncNews(client), 15_000);
  setInterval(() => void syncNews(client), 120_000);
}
