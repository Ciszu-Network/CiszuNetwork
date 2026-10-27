import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { db, ciszubotSchema, eq } from '@ciszunetwork/db';
import { BOT_FOOTER } from '../config/links';
import { getGuildConfig, type SocialFeed, type SocialPlatform } from './configService';
import { isPremiumGuild } from './featureFlags';
import { tr } from './i18n';
import { logger } from './logger';
import { parseRssFeed, type NewsItem } from './news';

const USER_AGENT = 'CiszuBot/3.4 (+https://ciszubot.vercel.app)';
const CACHE_TTL_MS = 120_000;
const MAX_ITEMS_PER_FEED = 5;
const MAX_SEEN_PER_FEED = 60;
const MAX_FEED_BYTES = 2_000_000;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 15_000;

const PLATFORM_LABEL: Record<SocialPlatform, [string, string]> = {
  x: ['X', 'X'],
  instagram: ['Instagram', 'Instagram'],
  facebook: ['Facebook', 'Facebook'],
  tiktok: ['TikTok', 'TikTok'],
  youtube: ['YouTube', 'YouTube'],
  twitch: ['Twitch', 'Twitch'],
  linkedin: ['LinkedIn', 'LinkedIn'],
  spotify: ['Spotify', 'Spotify'],
  soundcloud: ['SoundCloud', 'SoundCloud'],
  github: ['GitHub', 'GitHub'],
  reddit: ['Reddit', 'Reddit'],
  pinterest: ['Pinterest', 'Pinterest'],
  patreon: ['Patreon', 'Patreon'],
  kofi: ['Ko-fi', 'Ko-fi'],
  buymeacoffee: ['Buy Me a Coffee', 'Buy Me a Coffee'],
  other: ['Otra red', 'Other network'],
};

const PLATFORM_COLOR = {
  x: '#74A9FF',
  instagram: '#E4405F',
  facebook: '#1877F2',
  tiktok: '#00F2FE',
  youtube: '#FF0000',
  twitch: '#9146FF',
  linkedin: '#0A66C2',
  spotify: '#1DB954',
  soundcloud: '#FF5500',
  github: '#E6EDF3',
  reddit: '#FF4500',
  pinterest: '#E60023',
  patreon: '#FF424D',
  kofi: '#FF5E5B',
  buymeacoffee: '#FFDD00',
  other: '#22D3EE',
} as const;

type FeedCache = { at: number; items: NewsItem[] };
type SocialSeen = Record<string, string[]>;

const feedCache = new Map<string, FeedCache>();
const feedInFlight = new Map<string, Promise<NewsItem[]>>();
const syncing = new Set<string>();

export function clearSocialFeedCache(): void {
  feedCache.clear();
  feedInFlight.clear();
}

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.lan')) return true;
  if (host === '0.0.0.0' || host === '::' || host === '::1') return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  if (/^f[cd][0-9a-f]{2}:/i.test(host) || /^fe80:/i.test(host)) return true;
  if (host.startsWith('::ffff:')) {
    const mapped = host.slice('::ffff:'.length);
    return /^127\./.test(mapped) || /^10\./.test(mapped) || /^192\.168\./.test(mapped) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(mapped);
  }
  return false;
}

export function assertSafeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error('invalid_url');
  }
  if (url.protocol !== 'https:') throw new Error('https_required');
  if (url.username || url.password) throw new Error('credentials_not_allowed');
  if (url.port && url.port !== '443') throw new Error('port_not_allowed');
  if (isPrivateHost(url.hostname)) throw new Error('private_host');
  return url;
}

function publicHttpsUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    return assertSafeUrl(raw).toString();
  } catch {
    return undefined;
  }
}

function looksLikeFeedUrl(url: URL): boolean {
  const path = url.pathname.toLowerCase();
  if (/\.(rss|xml|atom)(?:$|[?#])/i.test(path)) return true;
  if (/(?:^|\/)(rss|feed|feeds|atom)(?:\/|$)/i.test(path)) return true;
  if (url.hostname.toLowerCase().startsWith('feeds.')) return true;
  const format = url.searchParams.get('format')?.toLowerCase();
  const feed = url.searchParams.get('feed')?.toLowerCase();
  return format === 'rss' || format === 'atom' || feed === 'rss' || feed === 'atom';
}

async function fetchText(raw: string): Promise<string> {
  let url = assertSafeUrl(raw);
  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt += 1) {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, text/html;q=0.8, */*;q=0.5',
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (attempt === MAX_REDIRECTS) throw new Error('too_many_redirects');
      const location = response.headers.get('location');
      if (!location) throw new Error('redirect_without_location');
      url = assertSafeUrl(new URL(location, url).toString());
      continue;
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const declared = Number(response.headers.get('content-length') ?? 0);
    if (Number.isFinite(declared) && declared > MAX_FEED_BYTES) throw new Error('feed_too_large');
    const body = await response.arrayBuffer();
    if (body.byteLength > MAX_FEED_BYTES) throw new Error('feed_too_large');
    return new TextDecoder('utf-8').decode(body);
  }
  throw new Error('too_many_redirects');
}

function youtubeFeed(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
}

function extractYouTubeChannelId(html: string): string | null {
  const patterns = [
    /"channelId":"(UC[\w-]{20,})"/,
    /"externalId":"(UC[\w-]{20,})"/,
    /itemprop=["']identifier["'][^>]*content=["'](UC[\w-]{20,})["']/i,
    /channel_id=(UC[\w-]{20,})/,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractSoundCloudUserId(html: string): string | null {
  const patterns = [/soundcloud:\/\/users:(\d+)/, /"urn":"soundcloud:users:(\d+)"/, /soundcloud:users:(\d+)/];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function resolveYouTube(account: string, url?: URL): Promise<string | null> {
  const raw = url ? `${url.pathname}${url.search}` : account;
  const channelMatch = raw.match(/(?:^|\/)channel\/(UC[\w-]{20,})/);
  if (channelMatch?.[1]) return youtubeFeed(channelMatch[1]);
  const idMatch = raw.match(/^(UC[\w-]{20,})$/);
  if (idMatch?.[1]) return youtubeFeed(idMatch[1]);
  const handleMatch = raw.match(/(?:^|\/)(@[\w.-]+)/) ?? raw.match(/^(@[\w.-]+)$/);
  if (handleMatch?.[1]) {
    const page = await fetchText(`https://www.youtube.com/${handleMatch[1]}`);
    const channelId = extractYouTubeChannelId(page);
    return channelId ? youtubeFeed(channelId) : null;
  }
  const namedMatch = raw.match(/(?:^|\/)(c|user)\/([\w.-]+)/);
  if (namedMatch?.[1] && namedMatch[2]) {
    const page = await fetchText(`https://www.youtube.com/${namedMatch[1]}/${namedMatch[2]}`);
    const channelId = extractYouTubeChannelId(page);
    return channelId ? youtubeFeed(channelId) : null;
  }
  return null;
}

function redditFeed(path: 'r' | 'u' | 'user', name: string): string {
  const clean = name.replace(/^\/+|\/+$/g, '');
  if (!clean) throw new Error('invalid_account');
  return path === 'r'
    ? `https://www.reddit.com/r/${encodeURIComponent(clean)}/.rss`
    : `https://www.reddit.com/user/${encodeURIComponent(clean)}/.rss`;
}

function resolveReddit(account: string, kind: SocialFeed['kind'], url?: URL): string | null {
  if (url) {
    if (url.pathname.endsWith('.rss')) return url.toString();
    const sub = url.pathname.match(/^\/r\/([^/]+)/)?.[1];
    if (sub) return redditFeed('r', sub);
    const user = url.pathname.match(/^\/(?:u|user)\/([^/]+)/)?.[1];
    if (user) return redditFeed('u', user);
    return null;
  }
  const value = account.replace(/^\/+/, '');
  const sub = value.match(/^r\/([^/]+)$/)?.[1];
  if (sub) return redditFeed('r', sub);
  const user = value.match(/^(?:u|user)\/([^/]+)$/)?.[1];
  if (user) return redditFeed('u', user);
  if (/^[\w-]+$/.test(value)) return redditFeed(kind === 'user' ? 'u' : 'r', value);
  return null;
}

function soundCloudFeed(id: string): string {
  return `https://feeds.soundcloud.com/users/soundcloud:users:${id}/sounds.rss`;
}

async function resolveSoundCloud(account: string, url?: URL): Promise<string | null> {
  if (url) {
    if (url.hostname === 'feeds.soundcloud.com') return url.toString();
    const match = url.pathname.match(/^\/([^/]+)/);
    if (!match?.[1]) return null;
    const page = await fetchText(`https://soundcloud.com/${match[1]}`);
    const id = extractSoundCloudUserId(page);
    return id ? soundCloudFeed(id) : null;
  }
  if (/^\d+$/.test(account)) return soundCloudFeed(account);
  if (!/^[\w.-]+$/.test(account)) return null;
  const page = await fetchText(`https://soundcloud.com/${account}`);
  const id = extractSoundCloudUserId(page);
  return id ? soundCloudFeed(id) : null;
}

function resolveGitHub(account: string, url?: URL): string | null {
  const path = url ? url.pathname.replace(/^\/+|\/+$/g, '') : account.replace(/^\/+|\/+$/g, '');
  if (!path) return null;
  if (path.endsWith('.atom')) return url ? url.toString() : `https://github.com/${path}`;
  const parts = path.split('/').filter(Boolean);
  if (parts.length >= 2) return `https://github.com/${parts[0]}/${parts[1]}/releases.atom`;
  if (parts.length === 1 && /^[\w.-]+$/.test(parts[0])) return `https://github.com/${parts[0]}.atom`;
  return null;
}

async function resolveUrlForPlatform(platform: SocialPlatform, kind: SocialFeed['kind'], url: URL): Promise<string | null> {
  if (platform === 'youtube' && /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i.test(url.hostname)) {
    return resolveYouTube(url.toString(), url);
  }
  if (platform === 'reddit' && /(^|\.)reddit\.com$/i.test(url.hostname)) {
    return resolveReddit(url.toString(), kind, url);
  }
  if (platform === 'soundcloud' && /(^|\.)soundcloud\.com$/i.test(url.hostname)) {
    return resolveSoundCloud(url.toString(), url);
  }
  if (platform === 'github' && /(^|\.)github\.com$/i.test(url.hostname)) {
    return resolveGitHub(url.toString(), url);
  }
  return null;
}

async function resolveAccountForPlatform(
  platform: SocialPlatform,
  kind: SocialFeed['kind'],
  account: string,
): Promise<string | null> {
  if (platform === 'youtube') return resolveYouTube(account);
  if (platform === 'reddit') return resolveReddit(account, kind);
  if (platform === 'soundcloud') return resolveSoundCloud(account);
  if (platform === 'github') return resolveGitHub(account);
  return null;
}

export async function resolveFeedUrl(feed: SocialFeed): Promise<string | null> {
  const account = feed.account.trim();
  if (!account) return null;

  if (/^https?:\/\//i.test(account)) {
    let url: URL;
    try {
      url = assertSafeUrl(account);
    } catch {
      return null;
    }
    if (feed.kind === 'feed' || looksLikeFeedUrl(url)) return url.toString();
    return resolveUrlForPlatform(feed.platform, feed.kind, url);
  }

  if (feed.kind === 'feed') return null;
  return resolveAccountForPlatform(feed.platform, feed.kind, account);
}

async function fetchFeedItems(feed: SocialFeed, resolved: string): Promise<NewsItem[]> {
  const xml = await fetchText(resolved);
  return parseRssFeed(xml)
    .map((item) => ({
      ...item,
      link: publicHttpsUrl(item.link) ?? '',
      image: publicHttpsUrl(item.image),
      source: feed.account,
    }))
    .filter((item) => item.link && item.title.length >= 2 && item.title.length <= 300)
    .filter((item) => item.publishedAt.getTime() <= Date.now() + 2 * 60 * 60_000)
    .slice(0, 30);
}

export async function getSocialFeedItems(feed: SocialFeed): Promise<NewsItem[]> {
  const resolved = await resolveFeedUrl(feed);
  if (!resolved) return [];
  const cacheKey = `${feed.platform}:${resolved}`;
  const cached = feedCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.items;
  const pending = feedInFlight.get(cacheKey);
  if (pending) return pending;
  const request = fetchFeedItems(feed, resolved)
    .then((items) => {
      feedCache.set(cacheKey, { at: Date.now(), items });
      return items;
    })
    .catch((error) => {
      logger.warn(`social feed ${feed.platform}/${feed.account}:`, error);
      return cached?.items ?? [];
    })
    .finally(() => {
      feedInFlight.delete(cacheKey);
    });
  feedInFlight.set(cacheKey, request);
  return request;
}

function sanitizeInline(value: string): string {
  return value
    .replace(/@(everyone|here)/gi, '@\u200b$1')
    .replace(/<@[!&]?\d+>/g, '')
    .slice(0, 500);
}

function renderTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(account|platform|title|url|author)\}/g, (_match, key: string) =>
    sanitizeInline(values[key] ?? ''),
  );
}

export async function publishSocialItem(
  client: Client,
  channel: TextChannel,
  lang: string,
  feed: SocialFeed,
  item: NewsItem,
): Promise<boolean> {
  const label = tr(lang, PLATFORM_LABEL[feed.platform][0], PLATFORM_LABEL[feed.platform][1]);
  const readMore = tr(lang, 'Leer más', 'Read more');
  const defaultText = tr(
    lang,
    'Nueva publicación de {account} en {platform}',
    'New post from {account} on {platform}',
  );
  const template = feed.message.trim() || defaultText;
  const text = renderTemplate(template, {
    account: feed.account,
    platform: label,
    title: item.title,
    url: item.link,
    author: item.source || feed.account,
  });
  const ping = feed.ping_role_id ? `<@&${feed.ping_role_id}>` : '';
  const content = [ping, text, item.video ?? ''].filter(Boolean).join(' ').slice(0, 2000);

  const embed = new EmbedBuilder()
    .setColor(PLATFORM_COLOR[feed.platform])
    .setAuthor({ name: `${label} • ${feed.account}`.slice(0, 256) })
    .setTitle(item.title.slice(0, 256))
    .setURL(item.link)
    .setDescription(`${item.description.slice(0, 1800)}${item.description ? '\n\n' : ''}[${readMore}](${item.link})`)
    .setFooter(BOT_FOOTER(tr(lang, 'Redes sociales', 'Social feeds'), client.user?.displayAvatarURL()))
    .setTimestamp(item.publishedAt);
  if (item.image) embed.setImage(item.image);

  try {
    await channel.send({
      content: content || undefined,
      embeds: [embed],
      allowedMentions: feed.ping_role_id ? { roles: [feed.ping_role_id] } : { parse: [] },
    });
    return true;
  } catch (error) {
    logger.warn('social feed send:', error);
    return false;
  }
}

function asSeenMap(value: unknown): SocialSeen {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return Object.create(null) as SocialSeen;
  const result = Object.create(null) as SocialSeen;
  for (const [key, ids] of Object.entries(value as Record<string, unknown>)) {
    if (Array.isArray(ids)) {
      result[key] = ids.filter((id): id is string => typeof id === 'string').slice(-MAX_SEEN_PER_FEED);
    }
  }
  return result;
}

async function syncGuild(client: Client, guildId: string): Promise<void> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
  const cfg = await getGuildConfig(guildId);
  if (!cfg.social_enabled) return;
  const premium = await isPremiumGuild(guildId);
  const usedPlatforms = new Set<string>();
  const active = cfg.social_feeds
    .filter((feed) => feed.enabled && feed.account.trim() && feed.channel_id)
    .filter((feed) => {
      if (premium) return true;
      if (usedPlatforms.has(feed.platform)) return false;
      usedPlatforms.add(feed.platform);
      return usedPlatforms.size <= 5;
    });

  const guildConfigs = ciszubotSchema.guildConfigs;
  const rows = await db
    .select({ seen: guildConfigs.socialSeen })
    .from(guildConfigs)
    .where(eq(guildConfigs.guildId, guildId))
    .limit(1);
  const seen = asSeenMap(rows[0]?.seen);
  let changed = false;

  const activeIds = new Set(active.map((feed) => feed.id));
  for (const key of Object.keys(seen)) {
    if (!activeIds.has(key)) {
      delete seen[key];
      changed = true;
    }
  }

  if (active.length === 0) {
    if (!changed) return;
    await db
      .update(guildConfigs)
      .set({ socialSeen: seen, updatedAt: new Date() })
      .where(eq(guildConfigs.guildId, guildId))
      .catch((error) => logger.warn('social seen update:', error));
    return;
  }

  for (const feed of active) {
    const channel = guild.channels.cache.get(feed.channel_id) as TextChannel | undefined;
    if (!channel || !channel.isTextBased()) continue;
    const items = await getSocialFeedItems(feed);
    if (items.length === 0) continue;

    const previous = seen[feed.id];
    if (!Array.isArray(previous)) {
      seen[feed.id] = items.map((item) => item.id).slice(-MAX_SEEN_PER_FEED);
      changed = true;
      continue;
    }

    const seenIds = new Set(previous);
    const fresh = items
      .filter((item) => !seenIds.has(item.id))
      .sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())
      .slice(0, MAX_ITEMS_PER_FEED);

    let feedChanged = false;
    for (const item of fresh) {
      const sent = await publishSocialItem(client, channel, cfg.lang, feed, item);
      if (!sent) continue;
      seenIds.add(item.id);
      feedChanged = true;
    }
    if (feedChanged) {
      seen[feed.id] = [...seenIds].slice(-MAX_SEEN_PER_FEED);
      changed = true;
    }
  }

  if (!changed) return;
  await db
    .update(guildConfigs)
    .set({ socialSeen: seen, updatedAt: new Date() })
    .where(eq(guildConfigs.guildId, guildId))
    .catch((error) => logger.warn('social seen update:', error));
}

export async function syncSocialFeeds(client: Client): Promise<void> {
  for (const guild of client.guilds.cache.values()) {
    if (syncing.has(guild.id)) continue;
    syncing.add(guild.id);
    try {
      await syncGuild(client, guild.id);
    } catch (error) {
      logger.warn(`social feeds sync ${guild.id}:`, error);
    } finally {
      syncing.delete(guild.id);
    }
  }
}

export function startSocialFeedsLoop(client: Client): void {
  setTimeout(() => void syncSocialFeeds(client), 30_000);
  setInterval(() => void syncSocialFeeds(client), 180_000);
}
