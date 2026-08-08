import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb } from './helpers/db';
import { getSupabase } from '../src/services/supabase';
import {
  getGuildConfig,
  getPrefix,
  invalidateGuildConfig,
  updateGuildConfig,
} from '../src/services/configService';

vi.mock('../src/services/supabase', () => ({ getSupabase: vi.fn() }));

const supabaseMock = vi.mocked(getSupabase);

// La caché de configService es un singleton del módulo: cada test usa un
// guild_id distinto para no estar contaminado por los anteriores.
beforeEach(() => {
  supabaseMock.mockReset();
});

describe('getGuildConfig', () => {
  it('sin fila devuelve los defaults con el guild_id', async () => {
    const { db } = createDb(null);
    supabaseMock.mockReturnValue(db);

    const cfg = await getGuildConfig('g-sin-fila');
    expect(cfg.guild_id).toBe('g-sin-fila');
    expect(cfg.prefix).toBe('cz!');
    expect(cfg.lang).toBe('es');
    expect(cfg.leveling_enabled).toBe(false);
    expect(cfg.autorole_ids).toEqual([]);
  });

  it('mezcla la fila parcial con los defaults', async () => {
    const { db } = createDb({ prefix: '!', lang: 'en' });
    supabaseMock.mockReturnValue(db);

    const cfg = await getGuildConfig('g-parcial');
    expect(cfg.prefix).toBe('!');
    expect(cfg.lang).toBe('en');
    expect(cfg.automod_enabled).toBe(false);
  });

  it('usa la caché: la segunda llamada no consulta la BD', async () => {
    const { db } = createDb(null);
    supabaseMock.mockReturnValue(db);

    await getGuildConfig('g-cache');
    await getGuildConfig('g-cache');
    expect(db.from).toHaveBeenCalledTimes(1);
  });
});

describe('updateGuildConfig', () => {
  it('aplica el patch y serializa arrays antes del upsert', async () => {
    const { db, builder } = createDb(null);
    supabaseMock.mockReturnValue(db);

    const updated = await updateGuildConfig('g-upd', { prefix: 'x!', autorole_ids: ['r1', 'r2'] });

    expect(updated.prefix).toBe('x!');
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        guild_id: 'g-upd',
        prefix: 'x!',
        autorole_ids: JSON.stringify(['r1', 'r2']),
      })
    );
    // la caché queda actualizada: el GET posterior no vuelve a la BD
    // (updateGuildConfig = select + upsert → 2 llamadas a from)
    await getGuildConfig('g-upd');
    expect(db.from).toHaveBeenCalledTimes(2);
  });

  it('sigue devolviendo la config aunque el upsert falle', async () => {
    const { db, builder } = createDb(null);
    builder.upsert.mockRejectedValueOnce(new Error('boom'));
    supabaseMock.mockReturnValue(db);

    const updated = await updateGuildConfig('g-upd-fail', { prefix: 'x!' });
    expect(updated.prefix).toBe('x!');
  });
});

describe('invalidateGuildConfig / getPrefix', () => {
  it('invalidateGuildConfig elimina la caché', async () => {
    const { db } = createDb(null);
    supabaseMock.mockReturnValue(db);

    await getGuildConfig('g-inv');
    invalidateGuildConfig('g-inv');
    await getGuildConfig('g-inv');
    expect(db.from).toHaveBeenCalledTimes(2);
  });

  it('getPrefix devuelve el prefijo por defecto sin guild', async () => {
    await expect(getPrefix(null)).resolves.toBe('cz!');
    await expect(getPrefix(undefined)).resolves.toBe('cz!');
  });

  it('getPrefix usa la config del guild', async () => {
    const { db } = createDb({ prefix: '!' });
    supabaseMock.mockReturnValue(db);
    await expect(getPrefix('g-prefix')).resolves.toBe('!');
  });
});