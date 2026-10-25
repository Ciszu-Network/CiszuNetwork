import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb, createDbProxy, dbState } from './helpers/db';

vi.mock('@ciszunetwork/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ciszunetwork/db')>();
  const { createDbProxy } = await import('./helpers/db');
  return { ...actual, db: createDbProxy() };
});

import { endGiveaway, joinGiveaway, pauseGiveaway, scheduleGiveaway, startGiveaway } from '../src/services/giveaways';
import type { Guild, GuildMember, TextChannel, User } from 'discord.js';

/** Fila completa de sorteo tal como la devuelve la DB (mock de select). */
function giveawayRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'gw-1',
    guildId: 'g1',
    slot: 1,
    channelId: 'c1',
    messageId: 'm1',
    prize: 'Nitro',
    winners: 1,
    endsAt: new Date(Date.now() + 60_000),
    hostedBy: 'u-owner',
    ended: false,
    status: 'running',
    requiredRoleIds: [],
    grantRoleIds: [],
    maxParticipants: 0,
    requiredMessages: 0,
    bonusRoles: [],
    createdSource: 'command',
    pausedAt: null,
    cancelledAt: null,
    winnerIds: [],
    createdAt: new Date(),
    ...overrides,
  };
}

function makeGuild(channel: any = undefined): Guild {
  const cache = new Map<string, any>();
  if (channel) cache.set('c1', channel);
  return {
    id: 'g1',
    channels: { cache },
    client: { user: { id: 'BOT_ID' } },
    members: { fetch: vi.fn().mockResolvedValue(null) },
  } as unknown as Guild;
}

function makeChannel(overrides: Partial<any> = {}) {
  return {
    id: 'c1',
    messages: {
      fetch: vi.fn().mockResolvedValue({ edit: vi.fn().mockResolvedValue(undefined) }),
    },
    send: vi.fn().mockResolvedValue({ id: 'm-send' }),
    ...overrides,
  };
}

function makeMember(id = 'u1', roles: string[] = []) {
  return {
    id,
    roles: { cache: { has: (r: string) => roles.includes(r) } },
  } as unknown as GuildMember;
}

beforeEach(() => {
  dbState.set(null);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('endGiveaway', () => {
  it('marca ended/status, desactiva el botón y anuncia', async () => {
    const { db } = createDb(null, null, [[giveawayRow()], [], []]);
    dbState.set(db);
    const channel = makeChannel();
    const guild = makeGuild(channel);

    await endGiveaway(guild, { id: 'gw-1' });

    const updateBuilder = db.update.mock.results[0].value;
    expect(updateBuilder.set).toHaveBeenCalledWith(
      expect.objectContaining({ ended: true, status: 'ended' }),
    );
    // Edita el mensaje original (botón desactivado) y anuncia el resultado.
    const message = await channel.messages.fetch.mock.results[0].value;
    expect(message.edit).toHaveBeenCalledTimes(1);
    expect(channel.send).toHaveBeenCalledTimes(1);
    const description = channel.send.mock.calls[0][0].embeds[0].data.description as string;
    expect(description).toContain('No hubo participantes');
  });

  it('sin canal solo marca ended y no envía', async () => {
    const { db } = createDb(null, null, [[giveawayRow()], [], []]);
    dbState.set(db);
    const guild = makeGuild(); // sin canales

    await endGiveaway(guild, { id: 'gw-1' });

    const updateBuilder = db.update.mock.results[0].value;
    expect(updateBuilder.set).toHaveBeenCalledWith(expect.objectContaining({ ended: true }));
  });

  it('sorteo inexistente: no toca la BD', async () => {
    const { db } = createDb(null); // select vacío → getGiveaway null
    dbState.set(db);
    const guild = makeGuild(makeChannel());

    await endGiveaway(guild, { id: 'no-existe' });

    expect(db.update).not.toHaveBeenCalled();
  });
});

describe('joinGiveaway', () => {
  it('ingresa con 1 entrada cuando no hay requisitos', async () => {
    const { db } = createDb(null, null, [[giveawayRow()], [], []]);
    dbState.set(db);
    const guild = makeGuild();

    const result = await joinGiveaway(guild, 'gw-1', makeMember('u1'));

    expect(result.ok).toBe(true);
    expect(result.entries).toBe(1);
    const insertBuilder = db.insert.mock.results[0].value;
    expect(insertBuilder.values).toHaveBeenCalledWith(
      expect.objectContaining({ giveawayId: 'gw-1', userId: 'u1', entries: 1 }),
    );
  });

  it('rechaza si falta un rol requerido', async () => {
    const { db } = createDb(null, null, [[giveawayRow({ requiredRoleIds: ['r1'] })], [], []]);
    dbState.set(db);
    const guild = makeGuild();

    const result = await joinGiveaway(guild, 'gw-1', makeMember('u1', []));

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('roles requeridos');
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('rechaza si el sorteo está pausado', async () => {
    const { db } = createDb(null, null, [[giveawayRow({ status: 'paused' })], [], []]);
    dbState.set(db);

    const result = await joinGiveaway(makeGuild(), 'gw-1', makeMember('u1'));

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('pausado');
  });

  it('aplica el bonus de roles (multiplicadores)', async () => {
    const { db } = createDb(null, null, [[giveawayRow({ bonusRoles: [{ role_id: 'r-vip', multiplier: 3 }] })], [], []]);
    dbState.set(db);
    const guild = makeGuild();

    const result = await joinGiveaway(guild, 'gw-1', makeMember('u1', ['r-vip']));

    expect(result.ok).toBe(true);
    expect(result.entries).toBe(3);
  });
});

describe('pauseGiveaway', () => {
  it('pausa, guarda la fecha y edita el mensaje', async () => {
    const { db } = createDb(null, null, [[giveawayRow()], [], []]);
    dbState.set(db);
    const channel = makeChannel();
    const guild = makeGuild(channel);

    const ok = await pauseGiveaway(guild, 'gw-1');

    expect(ok).toBe(true);
    const updateBuilder = db.update.mock.results[0].value;
    expect(updateBuilder.set).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'paused', pausedAt: expect.any(Date) }),
    );
    const message = await channel.messages.fetch.mock.results[0].value;
    expect(message.edit).toHaveBeenCalledTimes(1);
  });
});

describe('scheduleGiveaway', () => {
  it('programa el fin y lo ejecuta al vencimiento', async () => {
    vi.useFakeTimers();
    const { db } = createDb(null, null, [[giveawayRow()], [], []]);
    dbState.set(db);
    const guild = makeGuild(); // sin canal → endGiveaway solo marca ended

    scheduleGiveaway(guild, {
      id: 'gw-1',
      guild_id: 'g1',
      channel_id: 'c1',
      message_id: 'm1',
      prize: 'Nitro',
      winners: 1,
      ends_at: new Date(Date.now() + 2000).toISOString(),
      hosted_by: 'u-owner',
    });

    vi.advanceTimersByTime(3100);
    await vi.runAllTimersAsync();

    expect(db.update).toHaveBeenCalled();
  });
});

describe('startGiveaway', () => {
  it('envía el mensaje con botón e inserta en la BD', async () => {
    vi.useFakeTimers();
    // selects: [0] isPremiumGuild (no premium) · [1] cupos activos (ninguno) ·
    // [2] getGiveaway al terminar el timer · [3] resto
    const { db } = createDb(null, null, [[], [], [giveawayRow()], [], []]);
    dbState.set(db);
    const rawChannel = makeChannel();
    const channel = rawChannel as unknown as TextChannel;
    const guild = makeGuild(channel);
    const host = { id: 'u-owner', tag: 'Owner#1', displayAvatarURL: () => 'https://x/avatar.png' } as User;

    const result = await startGiveaway(guild, channel, 'Nitro', 1, 60_000, host);

    expect(result.ok).toBe(true);
    expect(result.slot).toBe(1);
    expect(rawChannel.send).toHaveBeenCalledTimes(1);
    const sentPayload = rawChannel.send.mock.calls[0][0] as { embeds?: unknown[]; components?: unknown[] };
    expect(sentPayload.components).toBeDefined(); // botón de ingreso (ya no reacciones)

    const insertBuilder = db.insert.mock.results[0].value;
    expect(insertBuilder.values).toHaveBeenCalledWith(
      expect.objectContaining({
        guildId: 'g1',
        slot: 1,
        messageId: 'pending',
        channelId: 'c1',
        prize: 'Nitro',
        winners: 1,
        hostedBy: 'u-owner',
        status: 'running',
      }),
    );

    // limpia el timer programado (ends_at ≈ +60s)
    vi.advanceTimersByTime(61_000);
    await vi.runAllTimersAsync();
    expect(db.update).toHaveBeenCalled();
  });

  it('asigna el cupo libre más bajo y reutiliza huecos', async () => {
    vi.useFakeTimers();
    const { db } = createDb(null, null, [[], [{ slot: 1 }, { slot: 3 }], [giveawayRow({ slot: 2 })], [], []]);
    dbState.set(db);
    const rawChannel = makeChannel();
    const channel = rawChannel as unknown as TextChannel;
    const guild = makeGuild(channel);
    const host = { id: 'u-owner', tag: 'Owner#1', displayAvatarURL: () => 'https://x/avatar.png' } as User;

    const result = await startGiveaway(guild, channel, 'Nitro', 1, 60_000, host);

    expect(result).toMatchObject({ ok: true, slot: 2 });
    const insertBuilder = db.insert.mock.results[0].value;
    expect(insertBuilder.values).toHaveBeenCalledWith(expect.objectContaining({ slot: 2 }));
    vi.clearAllTimers();
  });

  it('bloquea la creación free con los 10 cupos ocupados', async () => {
    vi.useFakeTimers();
    const full = Array.from({ length: 10 }, (_, i) => ({ slot: i + 1 }));
    const { db } = createDb(null, null, [[], full]);
    dbState.set(db);
    const rawChannel = makeChannel();
    const channel = rawChannel as unknown as TextChannel;
    const guild = makeGuild(channel);
    const host = { id: 'u-owner', tag: 'Owner#1', displayAvatarURL: () => 'https://x/avatar.png' } as User;

    const result = await startGiveaway(guild, channel, 'Nitro', 1, 60_000, host);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Límite de 10 sorteos activos');
    expect(result.message).toContain('https://ciszubot.vercel.app/premium');
    expect(rawChannel.send).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('permite cupos ilimitados en servidores premium', async () => {
    vi.useFakeTimers();
    const full = Array.from({ length: 10 }, (_, i) => ({ slot: i + 1 }));
    const { db } = createDb(null, null, [[{ status: 'active', expiresAt: null }], full, [giveawayRow({ slot: 11 })], [], []]);
    dbState.set(db);
    const rawChannel = makeChannel();
    const channel = rawChannel as unknown as TextChannel;
    const guild = makeGuild(channel);
    const host = { id: 'u-owner', tag: 'Owner#1', displayAvatarURL: () => 'https://x/avatar.png' } as User;

    const result = await startGiveaway(guild, channel, 'Nitro', 1, 60_000, host);

    expect(result).toMatchObject({ ok: true, slot: 11 });
    const insertBuilder = db.insert.mock.results[0].value;
    expect(insertBuilder.values).toHaveBeenCalledWith(expect.objectContaining({ slot: 11 }));
    vi.clearAllTimers();
  });
});
