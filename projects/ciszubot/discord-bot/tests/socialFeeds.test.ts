import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb, dbState } from './helpers/db';

vi.mock('@ciszunetwork/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ciszunetwork/db')>();
  const { createDbProxy } = await import('./helpers/db');
  return { ...actual, db: createDbProxy() };
});

import { invalidateGuildConfig, type SocialFeed } from '../src/services/configService';
import { parseRssFeed } from '../src/services/news';
import {
  assertSafeUrl,
  clearSocialFeedCache,
  resolveFeedUrl,
  syncSocialFeeds,
} from '../src/services/socialFeeds';

const now = new Date(Date.now() - 60_000).toUTCString();

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel>
<item>
  <title>Video uno</title>
  <link>https://www.youtube.com/watch?v=1</link>
  <guid>yt:video:1</guid>
  <description>Primer video</description>
  <pubDate>${now}</pubDate>
</item>
<item>
  <title>Video dos</title>
  <link>https://www.youtube.com/watch?v=2</link>
  <guid>yt:video:2</guid>
  <description>Segundo video</description>
  <pubDate>${now}</pubDate>
</item>
</channel></rss>`;

const FEED: SocialFeed = {
  id: 'f1',
  platform: 'youtube',
  kind: 'channel',
  account: 'UCabcdefghijklmnopqrst',
  channel_id: 'c1',
  ping_role_id: null,
  message: '',
  enabled: true,
};

function feed(overrides: Partial<SocialFeed>): SocialFeed {
  return { ...FEED, ...overrides };
}

function guildConfigRow() {
  return {
    guildId: 'g1',
    lang: 'es',
    socialEnabled: true,
    socialFeeds: [FEED],
  };
}

function makeClient(channel: unknown) {
  const guild = {
    id: 'g1',
    channels: { cache: new Map([['c1', channel]]) },
  };
  return {
    guilds: { cache: new Map([['g1', guild]]) },
    user: { displayAvatarURL: () => 'https://cdn.example.com/bot.png' },
  } as never;
}

function makeChannel() {
  return {
    id: 'c1',
    isTextBased: () => true,
    send: vi.fn().mockResolvedValue({ id: 'm1' }),
  };
}

function xmlResponse(body: string) {
  const bytes = new TextEncoder().encode(body);
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  };
}

beforeEach(() => {
  dbState.set(null);
  clearSocialFeedCache();
  invalidateGuildConfig('g1');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('social feed URL safety', () => {
  it('acepta solo HTTPS público sin credenciales ni puertos raros', () => {
    expect(assertSafeUrl('https://example.com/feed.xml').toString()).toBe('https://example.com/feed.xml');
    expect(() => assertSafeUrl('http://example.com/feed.xml')).toThrow('https_required');
    expect(() => assertSafeUrl('https://localhost/feed.xml')).toThrow('private_host');
    expect(() => assertSafeUrl('https://127.0.0.1/feed.xml')).toThrow('private_host');
    const credentials = 'user:pass';
    expect(() => assertSafeUrl(`https://${credentials}@example.com/feed.xml`)).toThrow('credentials_not_allowed');
    expect(() => assertSafeUrl('https://example.com:8443/feed.xml')).toThrow('port_not_allowed');
  });
});

describe('social feed resolver', () => {
  it('resuelve YouTube, Reddit, SoundCloud y GitHub', async () => {
    await expect(resolveFeedUrl(FEED)).resolves.toBe(
      'https://www.youtube.com/feeds/videos.xml?channel_id=UCabcdefghijklmnopqrst',
    );
    await expect(resolveFeedUrl(feed({ platform: 'reddit', kind: 'subreddit', account: 'r/programming' }))).resolves.toBe(
      'https://www.reddit.com/r/programming/.rss',
    );
    await expect(resolveFeedUrl(feed({ platform: 'soundcloud', kind: 'profile', account: '123456' }))).resolves.toBe(
      'https://feeds.soundcloud.com/users/soundcloud:users:123456/sounds.rss',
    );
    await expect(resolveFeedUrl(feed({ platform: 'github', kind: 'user', account: 'ciszu' }))).resolves.toBe(
      'https://github.com/ciszu.atom',
    );
    await expect(resolveFeedUrl(feed({ platform: 'github', kind: 'user', account: 'owner/repo' }))).resolves.toBe(
      'https://github.com/owner/repo/releases.atom',
    );
  });

  it('distingue cuenta y subreddit de Reddit', async () => {
    await expect(resolveFeedUrl(feed({ platform: 'reddit', kind: 'user', account: 'ciszu' }))).resolves.toBe(
      'https://www.reddit.com/user/ciszu/.rss',
    );
    await expect(resolveFeedUrl(feed({ platform: 'reddit', kind: 'subreddit', account: 'ciszu' }))).resolves.toBe(
      'https://www.reddit.com/r/ciszu/.rss',
    );
  });

  it('exige feed externo para redes sin resolución nativa', async () => {
    await expect(resolveFeedUrl(feed({ platform: 'x', kind: 'profile', account: '@ciszu' }))).resolves.toBeNull();
    await expect(resolveFeedUrl(feed({ platform: 'other', kind: 'feed', account: 'https://example.com/feed.xml' }))).resolves.toBe(
      'https://example.com/feed.xml',
    );
  });
});

describe('social feed parsing', () => {
  it('usa media:title y media:description cuando faltan los campos estándar', () => {
    const atom = `<feed><entry>
      <id>yt:video:3</id>
      <media:title>Video media</media:title>
      <link rel="alternate" href="https://www.youtube.com/watch?v=3" />
      <published>${new Date().toISOString()}</published>
      <media:description>Descripción media</media:description>
    </entry></feed>`;
    expect(parseRssFeed(atom)[0]?.title).toBe('Video media');
    expect(parseRssFeed(atom)[0]?.description).toBe('Descripción media');
  });
});

describe('syncSocialFeeds', () => {
  it('siembra la primera sincronización sin publicar historial', async () => {
    const { db } = createDb(null, null, [[guildConfigRow()], [], [{ seen: {} }]]);
    dbState.set(db);
    const channel = makeChannel();
    const client = makeClient(channel);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(xmlResponse(RSS)));

    await syncSocialFeeds(client);

    expect(channel.send).not.toHaveBeenCalled();
    const update = db.update.mock.results[0].value;
    expect(update.set).toHaveBeenCalledWith(
      expect.objectContaining({
        socialSeen: expect.objectContaining({ f1: ['yt:video:1', 'yt:video:2'] }),
      }),
    );
  });

  it('publica solo lo nuevo, aplica texto y ping, y actualiza el dedupe', async () => {
    const config = { ...guildConfigRow(), socialFeeds: [{ ...FEED, ping_role_id: 'r1', message: '{title} en {platform}' }] };
    const { db } = createDb(null, null, [[config], [], [{ seen: { f1: ['yt:video:1'] } }]]);
    dbState.set(db);
    const channel = makeChannel();
    const client = makeClient(channel);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(xmlResponse(RSS)));

    await syncSocialFeeds(client);

    expect(channel.send).toHaveBeenCalledTimes(1);
    const payload = channel.send.mock.calls[0][0];
    expect(payload.content).toBe('<@&r1> Video dos en YouTube');
    expect(payload.allowedMentions).toEqual({ roles: ['r1'] });
    expect(payload.embeds[0].data.title).toBe('Video dos');
    expect(payload.embeds[0].data.url).toBe('https://www.youtube.com/watch?v=2');
    const update = db.update.mock.results[0].value;
    expect(update.set).toHaveBeenCalledWith(
      expect.objectContaining({
        socialSeen: expect.objectContaining({ f1: ['yt:video:1', 'yt:video:2'] }),
      }),
    );
  });
});
