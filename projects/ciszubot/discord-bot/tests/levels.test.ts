import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb, createDbProxy, dbState } from './helpers/db';

vi.mock('@ciszunetwork/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ciszunetwork/db')>();
  const { createDbProxy } = await import('./helpers/db');
  return { ...actual, db: createDbProxy() };
});

import { addXp, getLevel, getTopLevels, levelFromXp, xpForLevel } from '../src/services/levels';
import { ciszubotSchema } from '@ciszunetwork/db';

beforeEach(() => {
  dbState.set(null);
});

describe('lógica pura de XP', () => {
  it('xpForLevel sigue la regla 100 * nivel * 5', () => {
    expect(xpForLevel(1)).toBe(500);
    expect(xpForLevel(2)).toBe(1000);
  });

  it('levelFromXp(0) → nivel 1 sin progreso', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, current: 0, needed: 500, progress: 0 });
  });

  it('levelFromXp(500) → sube a nivel 2', () => {
    expect(levelFromXp(500)).toEqual({ level: 2, current: 0, needed: 1000, progress: 0 });
  });

  it('levelFromXp(600) → nivel 2 con 100/1000 de progreso', () => {
    expect(levelFromXp(600)).toEqual({ level: 2, current: 100, needed: 1000, progress: 0.1 });
  });
});

describe('addXp', () => {
  it('usuario nuevo: inserta XP y no sube de nivel', async () => {
    const { db } = createDb(null);
    dbState.set(db);

    const result = await addXp('u1', 'g1', 10);

    expect(result).toEqual({ level: 1, leveledUp: false });
    expect(db.insert).toHaveBeenCalledWith(ciszubotSchema.levels);
    const valuesBuilder = db.insert.mock.results[0].value;
    const valuesResult = valuesBuilder.values.mock.results[0].value;
    expect(valuesResult.onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ set: expect.objectContaining({ xp: 10 }) })
    );
  });

  it('sube de nivel al cruzar el umbral', async () => {
    dbState.set(createDb({ xp: '450' }).db);

    const result = await addXp('u1', 'g1', 100); // 550 → nivel 2

    expect(result).toEqual({ level: 2, leveledUp: true });
  });

  it('devuelve null si la BD falla', async () => {
    const { db } = createDb();
    dbState.set(db);
    vi.spyOn(db, 'select').mockImplementationOnce(() => {
      throw new Error('boom');
    });

    await expect(addXp('u1', 'g1', 10)).resolves.toBeNull();
  });
});

describe('getLevel', () => {
  it('sin datos devuelve nivel 1 con 0 XP', async () => {
    dbState.set(createDb(null).db);

    await expect(getLevel('u1', 'g1')).resolves.toEqual({
      xp: 0,
      level: 1,
      current: 0,
      needed: 500,
      progress: 0,
    });
  });

  it('usa la XP almacenada', async () => {
    dbState.set(createDb({ xp: '123' }).db);

    await expect(getLevel('u1', 'g1')).resolves.toMatchObject({ xp: 123, level: 1, current: 123 });
  });
});

describe('getTopLevels', () => {
  it('normaliza las filas y las ordena', async () => {
    dbState.set(createDb([{ userId: 'a', xp: '5' }, { userId: 'b', xp: '900' }]).db);

    const top = await getTopLevels('g1', 10);
    expect(top).toEqual([
      { user_id: 'a', xp: 5 },
      { user_id: 'b', xp: 900 },
    ]);
  });

  it('devuelve [] si la BD falla', async () => {
    const { db } = createDb();
    dbState.set(db);
    vi.spyOn(db, 'select').mockImplementationOnce(() => {
      throw new Error('boom');
    });

    await expect(getTopLevels('g1')).resolves.toEqual([]);
  });
});