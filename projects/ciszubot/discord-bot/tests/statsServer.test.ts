import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Server } from 'http';
import type { Client } from 'discord.js';

// Evita depender de top.gg en los tests (webhook handler no disponible sin TOP_GG_TOKEN).
vi.mock('../src/services/botlists', () => ({
  createTopGgWebhookHandler: vi.fn(() => null),
}));

import {
  getTotalCommands,
  incrementCommands,
  setupStatsServer,
  updateStats,
} from '../src/services/statsServer';

let server: Server | undefined;
let base = '';

beforeAll(async () => {
  process.env.PORT = '0'; // puerto efímero para no chocar con el bot en :5000
  process.env.DBL_WEBHOOK_SECRET = 'test-secret';
  server = await setupStatsServer();
  const addr = server!.address();
  base = `http://127.0.0.1:${(addr as { port: number }).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server?.close(() => resolve()));
  delete process.env.PORT;
  delete process.env.DBL_WEBHOOK_SECRET;
});

async function getStats(): Promise<Record<string, unknown>> {
  return (await fetch(`${base}/api/stats`)).json();
}

describe('setupStatsServer — API HTTP', () => {
  it('GET /api/stats devuelve el estado inicial', async () => {
    const stats = await getStats();
    expect(stats).toMatchObject({ online: false, guilds: 0, users: 0, commands: 0, uptime: 0 });
  });

  it('POST /api/update-stats actualiza campos y el GET los refleja', async () => {
    const res = await fetch(`${base}/api/update-stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands: 42 }),
    });
    expect(await res.json()).toEqual({ success: true });

    await expect(getStats()).resolves.toMatchObject({ commands: 42 });
  });

  it('updateStats(client) vuelca el estado del cliente', async () => {
    const fakeClient = {
      user: { id: '1' },
      readyAt: new Date(),
      guilds: { cache: { size: 3 } },
      users: { cache: { size: 5 } },
      uptime: 100,
    } as unknown as Client;

    updateStats(fakeClient);

    await expect(getStats()).resolves.toMatchObject({
      online: true,
      guilds: 3,
      users: 5,
      uptime: 100,
    });
  });

  it('POST /api/votes/dbl exige autenticación (401)', async () => {
    const res = await fetch(`${base}/api/votes/dbl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'u9' }),
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/votes/dbl con secreto responde 200', async () => {
    const res = await fetch(`${base}/api/votes/dbl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'test-secret' },
      body: JSON.stringify({ id: 'u9' }),
    });
    expect(res.status).toBe(200);
  });
});

describe('métricas internas', () => {
  it('incrementCommands / getTotalCommands', () => {
    const before = getTotalCommands();
    incrementCommands();
    expect(getTotalCommands()).toBe(before + 1);
  });
});