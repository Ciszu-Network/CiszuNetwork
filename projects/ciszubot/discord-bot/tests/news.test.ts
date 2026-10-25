import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb, createDbProxy, dbState } from './helpers/db';

vi.mock('@ciszunetwork/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ciszunetwork/db')>();
  const { createDbProxy } = await import('./helpers/db');
  return { ...actual, db: createDbProxy() };
});

import { parseGamerPower, parseRssFeed, syncNews, verifyNewsItem } from '../src/services/news';
import { invalidateGuildConfig } from '../src/services/configService';

const recent1 = new Date(Date.now() - 3_600_000).toUTCString();
const recent2 = new Date(Date.now() - 1_800_000).toUTCString();

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel>
<item>
  <title><![CDATA[Noticia de prueba &amp; algo]]></title>
  <link>https://www.animenewsnetwork.com/news/2026-10-24/test/.1</link>
  <guid isPermaLink="true">ann-1</guid>
  <description><![CDATA[<p>Resumen <b>verificado</b>.</p>]]></description>
  <pubDate>${recent1}</pubDate>
</item>
<item>
  <title>Otra noticia</title>
  <link>https://www.animenewsnetwork.com/news/2026-10-24/other/.2</link>
  <guid>ann-2</guid>
  <description>Texto plano</description>
  <media:thumbnail url="https://cdn.example.com/image.jpg" />
  <pubDate>${recent2}</pubDate>
</item>
</channel></rss>`;

const GP = JSON.stringify([
  {
    id: 1,
    title: 'Juego gratis (Steam)',
    description: '<p>Reclama una key.</p>',
    image: 'https://www.gamerpower.com/offers/1.jpg',
    open_giveaway_url: 'https://www.gamerpower.com/open/juego',
    published_date: '2026-10-20 10:00:00',
    type: 'Game',
    platforms: 'PC, Steam',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Juego sin Steam',
    platforms: 'PC',
    type: 'Game',
    status: 'Active',
    published_date: '2026-10-20 10:00:00',
  },
]);

function guildConfigRow() {
  return {
    guildId: 'g1',
    lang: 'es',
    newsEnabled: true,
    newsChannels: { anime: 'c1', games: null, steam: null, tech: null },
  };
}

function makeClient(channel: any) {
  const guild = {
    id: 'g1',
    channels: { cache: new Map([['c1', channel]]) },
  };
  return {
    guilds: { cache: new Map([['g1', guild]]) },
    user: { displayAvatarURL: () => 'https://cdn.example.com/bot.png' },
  } as any;
}

function makeChannel() {
  return {
    id: 'c1',
    isTextBased: () => true,
    send: vi.fn().mockResolvedValue({ id: 'm1' }),
  };
}

beforeEach(() => {
  dbState.set(null);
  invalidateGuildConfig('g1');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('news parsing', () => {
  it('parsea RSS con CDATA, entidades, imagen y fechas', () => {
    const items = parseRssFeed(RSS);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('Noticia de prueba & algo');
    expect(items[0].description).toBe('Resumen verificado.');
    expect(items[0].id).toBe('ann-1');
    expect(items[1].image).toBe('https://cdn.example.com/image.jpg');
  });

  it('parsea GamerPower solo con Steam, Game y estado Active', () => {
    const items = parseGamerPower(GP);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Juego gratis (Steam)');
    expect(items[0].link).toBe('https://www.gamerpower.com/open/juego');
  });

  it('verifica HTTPS, dominio permitido y antigüedad', () => {
    const item = parseRssFeed(RSS)[0];
    const now = Date.now();
    expect(verifyNewsItem(item, 'anime', now)).toBe(true);
    expect(verifyNewsItem({ ...item, link: 'http://www.animenewsnetwork.com/x' }, 'anime')).toBe(false);
    expect(verifyNewsItem({ ...item, link: 'https://evil.example.com/x' }, 'anime')).toBe(false);
    expect(verifyNewsItem(item, 'anime', now + 60 * 86_400_000)).toBe(false);
  });
});

describe('syncNews', () => {
  it('siembra la primera sincronización sin publicar historial', async () => {
    const config = guildConfigRow();
    const { db } = createDb(null, null, [[config], [{ seen: {} }]]);
    dbState.set(db);
    const channel = makeChannel();
    const client = makeClient(channel);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => RSS }));

    await syncNews(client);

    expect(channel.send).not.toHaveBeenCalled();
    const update = db.update.mock.results[0].value;
    expect(update.set).toHaveBeenCalledWith(
      expect.objectContaining({ newsSeen: expect.objectContaining({ anime: ['ann-1', 'ann-2'] }) }),
    );
  });

  it('publica solo las noticias nuevas y actualiza el dedupe', async () => {
    const config = guildConfigRow();
    const { db } = createDb(null, null, [[config], [{ seen: { anime: ['ann-1'] } }]]);
    dbState.set(db);
    const channel = makeChannel();
    const client = makeClient(channel);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => RSS }));

    await syncNews(client);

    expect(channel.send).toHaveBeenCalledTimes(1);
    const payload = channel.send.mock.calls[0][0];
    expect(payload.embeds[0].data.title).toBe('Otra noticia');
    expect(payload.embeds[0].data.url).toContain('/other/.2');
    const update = db.update.mock.results[0].value;
    expect(update.set).toHaveBeenCalledWith(
      expect.objectContaining({ newsSeen: expect.objectContaining({ anime: ['ann-1', 'ann-2'] }) }),
    );
  });
});
