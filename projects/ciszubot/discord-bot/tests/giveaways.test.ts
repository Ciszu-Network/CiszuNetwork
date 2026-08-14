import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb, createDbProxy, dbState } from './helpers/db';

vi.mock('@ciszunetwork/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ciszunetwork/db')>();
  const { createDbProxy } = await import('./helpers/db');
  return { ...actual, db: createDbProxy() };
});

import { endGiveaway, scheduleGiveaway, startGiveaway } from '../src/services/giveaways';
import type { Guild, TextChannel, User } from 'discord.js';

function makeGuild(channel: any = undefined): Guild {
  const cache = new Map<string, any>();
  if (channel) cache.set('c1', channel);
  return {
    id: 'g1',
    channels: { cache },
    client: { user: { id: 'BOT_ID' } },
  } as unknown as Guild;
}

function makeReactionsUserMap(ids: string[]) {
  return {
    map: (fn: (u: { id: string }) => string) => ids.map((id) => ({ id })).map(fn),
  };
}

function makeChannel(overrides: Partial<any> = {}) {
  const reactionsCacheGet = vi.fn(() => ({
    users: { fetch: vi.fn().mockResolvedValue(makeReactionsUserMap(['BOT_ID', 'u1', 'u2'])) },
  }));
  return {
    id: 'c1',
    messages: {
      fetch: vi.fn().mockResolvedValue({ reactions: { cache: { get: reactionsCacheGet } } }),
    },
    send: vi.fn().mockResolvedValue({
      id: 'm-send',
      react: vi.fn().mockResolvedValue(undefined),
    }),
    ...overrides,
  };
}

const sampleData = {
  id: 'gw-1',
  guild_id: 'g1',
  channel_id: 'c1',
  message_id: 'm1',
  prize: 'Nitro',
  winners: 1,
  ends_at: '',
  hosted_by: 'u-owner',
};

beforeEach(() => {
  dbState.set(null);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('endGiveaway', () => {
  it('marca ended y anuncia al ganador (sin el bot)', async () => {
    const { db } = createDb(null);
    dbState.set(db);
    const channel = makeChannel();
    const guild = makeGuild(channel);
    sampleData.ends_at = new Date(Date.now() + 1000).toISOString();

    await endGiveaway(guild, sampleData);

    const updateBuilder = db.update.mock.results[0].value;
    expect(updateBuilder.set).toHaveBeenCalledWith({ ended: true });
    expect(channel.send).toHaveBeenCalledTimes(1);
    const description = channel.send.mock.calls[0][0].embeds[0].data.description as string;
    expect(description).toContain('Ganadores:');
    expect(description).toMatch(/u1|u2/);
    expect(description).not.toContain('BOT_ID');
  });

  it('sin canal solo marca ended y no envía', async () => {
    const { db } = createDb(null);
    dbState.set(db);
    const guild = makeGuild(); // sin canales

    await endGiveaway(guild, sampleData);

    const updateBuilder = db.update.mock.results[0].value;
    expect(updateBuilder.set).toHaveBeenCalledWith({ ended: true });
  });

  it('sin participantes anuncia que no hubo', async () => {
    dbState.set(createDb(null).db);
    const reactionsCacheGet = vi.fn(() => undefined); // sin reacción 🎉
    const channel = makeChannel({
      messages: { fetch: vi.fn().mockResolvedValue({ reactions: { cache: { get: reactionsCacheGet } } }) },
    });
    const guild = makeGuild(channel);

    await endGiveaway(guild, sampleData);

    const description = channel.send.mock.calls[0][0].embeds[0].data.description as string;
    expect(description).toContain('No hubo participantes');
  });
});

describe('scheduleGiveaway', () => {
  it('programa el fin y lo ejecuta al vencimiento', async () => {
    vi.useFakeTimers();
    const { db } = createDb(null);
    dbState.set(db);
    const guild = makeGuild(); // sin canal → endGiveaway solo marca ended

    const data = { ...sampleData, ends_at: new Date(Date.now() + 2000).toISOString() };
    scheduleGiveaway(guild, data);

    vi.advanceTimersByTime(2100);
    await vi.runAllTimersAsync();

    expect(db.update).toHaveBeenCalled();
  });
});

describe('startGiveaway', () => {
  it('envía el embed, reacciona e inserta en la BD', async () => {
    vi.useFakeTimers();
    const { db } = createDb(null);
    dbState.set(db);
    const channel = makeChannel() as unknown as TextChannel;
    const guild = makeGuild(channel);
    const host = { id: 'u-owner', tag: 'Owner#1', displayAvatarURL: () => 'https://x/avatar.png' } as User;

    const result = await startGiveaway(guild, channel, 'Nitro', 1, 60_000, host);

    expect(result.ok).toBe(true);
    expect(channel.send).toHaveBeenCalledTimes(1);
    const insertBuilder = db.insert.mock.results[0].value;
    expect(insertBuilder.values).toHaveBeenCalledWith(
      expect.objectContaining({
        guildId: 'g1',
        channelId: 'c1',
        prize: 'Nitro',
        winners: 1,
        hostedBy: 'u-owner',
      })
    );

    // limpia el timer programado (ends_at ≈ +60s)
    vi.advanceTimersByTime(61_000);
    await vi.runAllTimersAsync();
    expect(db.update).toHaveBeenCalled();
  });
});