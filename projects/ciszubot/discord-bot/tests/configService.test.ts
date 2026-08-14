import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb, createDbProxy, dbState } from './helpers/db';

vi.mock('@ciszunetwork/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ciszunetwork/db')>();
  const { createDbProxy } = await import('./helpers/db');
  return { ...actual, db: createDbProxy() };
});

import {
  getGuildConfig,
  getPrefix,
  invalidateGuildConfig,
  updateGuildConfig,
} from '../src/services/configService';
import { ciszubotSchema } from '@ciszunetwork/db';

// La caché de configService es un singleton del módulo: cada test usa un
// guild_id distinto para no estar contaminado por los anteriores.
beforeEach(() => {
  dbState.set(null);
});

describe('getGuildConfig', () => {
  it('sin fila devuelve los defaults con el guild_id', async () => {
    dbState.set(createDb(null).db);

    const cfg = await getGuildConfig('g-sin-fila');
    expect(cfg.guild_id).toBe('g-sin-fila');
    expect(cfg.prefix).toBe('cz!');
    expect(cfg.lang).toBe('es');
    expect(cfg.leveling_enabled).toBe(false);
    expect(cfg.autorole_ids).toEqual([]);
  });

  it('mezcla la fila parcial con los defaults', async () => {
    dbState.set(createDb({ prefix: '!', lang: 'en' }).db);

    const cfg = await getGuildConfig('g-parcial');
    expect(cfg.prefix).toBe('!');
    expect(cfg.lang).toBe('en');
    expect(cfg.automod_enabled).toBe(false);
  });

  it('usa la caché: la segunda llamada no consulta la BD', async () => {
    const { db } = createDb(null);
    dbState.set(db);

    await getGuildConfig('g-cache');
    await getGuildConfig('g-cache');
    expect(db.select).toHaveBeenCalledTimes(1);
  });
});

describe('updateGuildConfig', () => {
  it('aplica el patch y hace upsert con arrays como jsonb', async () => {
    const { db } = createDb(null);
    dbState.set(db);

    const updated = await updateGuildConfig('g-upd', { prefix: 'x!', autorole_ids: ['r1', 'r2'] });

    expect(updated.prefix).toBe('x!');
    expect(db.insert).toHaveBeenCalledWith(ciszubotSchema.guildConfigs);
    const valuesBuilder = db.insert.mock.results[0].value;
    expect(valuesBuilder.values).toHaveBeenCalledWith(
      expect.objectContaining({ guildId: 'g-upd', prefix: 'x!', autoroleIds: ['r1', 'r2'] })
    );
    // la caché queda actualizada: el GET posterior no vuelve a la BD
    await getGuildConfig('g-upd');
    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it('sigue devolviendo la config aunque el upsert falle', async () => {
    const { db } = createDb(null);
    dbState.set(db);
    vi.spyOn(db, 'insert').mockImplementationOnce(() => {
      throw new Error('boom');
    });

    const updated = await updateGuildConfig('g-upd-fail', { prefix: 'x!' });
    expect(updated.prefix).toBe('x!');
  });
});

describe('invalidateGuildConfig / getPrefix', () => {
  it('invalidateGuildConfig elimina la caché', async () => {
    const { db } = createDb(null);
    dbState.set(db);

    await getGuildConfig('g-inv');
    invalidateGuildConfig('g-inv');
    await getGuildConfig('g-inv');
    expect(db.select).toHaveBeenCalledTimes(2);
  });

  it('getPrefix devuelve el prefijo por defecto sin guild', async () => {
    await expect(getPrefix(null)).resolves.toBe('cz!');
    await expect(getPrefix(undefined)).resolves.toBe('cz!');
  });

  it('getPrefix usa la config del guild', async () => {
    dbState.set(createDb({ prefix: '!' }).db);
    await expect(getPrefix('g-prefix')).resolves.toBe('!');
  });
});