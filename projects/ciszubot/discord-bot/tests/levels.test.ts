import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb } from './helpers/db';
import { getSupabase } from '../src/services/supabase';
import { addXp, getLevel, getTopLevels, levelFromXp, xpForLevel } from '../src/services/levels';

vi.mock('../src/services/supabase', () => ({ getSupabase: vi.fn() }));

const supabaseMock = vi.mocked(getSupabase);

beforeEach(() => {
  supabaseMock.mockReset();
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
    const { db, builder } = createDb(null);
    supabaseMock.mockReturnValue(db);

    const result = await addXp('u1', 'g1', 10);

    expect(result).toEqual({ level: 1, leveledUp: false });
    expect(db.from).toHaveBeenCalledWith('levels');
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', guild_id: 'g1', xp: 10 })
    );
  });

  it('sube de nivel al cruzar el umbral', async () => {
    const { db } = createDb({ xp: '450' });
    supabaseMock.mockReturnValue(db);

    const result = await addXp('u1', 'g1', 100); // 550 → nivel 2

    expect(result).toEqual({ level: 2, leveledUp: true });
  });

  it('devuelve null si la BD falla', async () => {
    const { db, builder } = createDb();
    builder.maybeSingle.mockRejectedValueOnce(new Error('boom'));
    supabaseMock.mockReturnValue(db);

    await expect(addXp('u1', 'g1', 10)).resolves.toBeNull();
  });
});

describe('getLevel', () => {
  it('sin datos devuelve nivel 1 con 0 XP', async () => {
    const { db } = createDb(null);
    supabaseMock.mockReturnValue(db);

    await expect(getLevel('u1', 'g1')).resolves.toEqual({
      xp: 0,
      level: 1,
      current: 0,
      needed: 500,
      progress: 0,
    });
  });

  it('usa la XP almacenada', async () => {
    const { db } = createDb({ xp: '123' });
    supabaseMock.mockReturnValue(db);

    await expect(getLevel('u1', 'g1')).resolves.toMatchObject({ xp: 123, level: 1, current: 123 });
  });
});

describe('getTopLevels', () => {
  it('normaliza las filas y las ordena', async () => {
    const { db } = createDb([{ user_id: 'a', xp: '5' }, { user_id: 'b', xp: '900' }]);
    supabaseMock.mockReturnValue(db);

    const top = await getTopLevels('g1', 10);
    expect(top).toEqual([
      { user_id: 'a', xp: 5 },
      { user_id: 'b', xp: 900 },
    ]);
  });

  it('devuelve [] si la BD falla', async () => {
    const { db, builder } = createDb();
    builder.limit.mockImplementationOnce(() => Promise.reject(new Error('boom')));
    supabaseMock.mockReturnValue(db);

    await expect(getTopLevels('g1')).resolves.toEqual([]);
  });
});