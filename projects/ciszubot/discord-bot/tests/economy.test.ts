import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb } from './helpers/db';
import { getSupabase } from '../src/services/supabase';
import {
  addBank,
  addMoney,
  formatMoney,
  getTopWallets,
  getWallet,
  setWallet,
} from '../src/services/economy';

vi.mock('../src/services/supabase', () => ({ getSupabase: vi.fn() }));

const supabaseMock = vi.mocked(getSupabase);

beforeEach(() => {
  supabaseMock.mockReset();
});

describe('getWallet', () => {
  it('sin fila devuelve 0/0', async () => {
    const { db } = createDb(null);
    supabaseMock.mockReturnValue(db);
    await expect(getWallet('u1', 'g1')).resolves.toEqual({ balance: 0, bank: 0 });
  });

  it('parsea valores string de la BD', async () => {
    const { db } = createDb({ balance: '120', bank: '80' });
    supabaseMock.mockReturnValue(db);
    await expect(getWallet('u1', 'g1')).resolves.toEqual({ balance: 120, bank: 80 });
  });

  it('no rompe si la BD falla', async () => {
    const { db, builder } = createDb();
    builder.maybeSingle.mockRejectedValueOnce(new Error('boom'));
    supabaseMock.mockReturnValue(db);
    await expect(getWallet('u1', 'g1')).resolves.toEqual({ balance: 0, bank: 0 });
  });
});

describe('setWallet', () => {
  it('hace upsert del saldo e inserta la transacción', async () => {
    const { db, builder } = createDb(null);
    supabaseMock.mockReturnValue(db);

    await setWallet('u1', 'g1', 150, 50, 'manual', 'nota');

    expect(db.from).toHaveBeenCalledWith('wallets');
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', guild_id: 'g1', balance: 150, bank: 50 })
    );
    expect(db.from).toHaveBeenCalledWith('transactions');
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', guild_id: 'g1', amount: 150, type: 'manual', note: 'nota' })
    );
  });
});

describe('addMoney / addBank', () => {
  it('suma al saldo y persiste', async () => {
    const { db, builder } = createDb({ balance: '100', bank: '50' });
    supabaseMock.mockReturnValue(db);

    await expect(addMoney('u1', 'g1', 25, 'grant')).resolves.toBe(125);
    expect(builder.upsert).toHaveBeenCalledWith(expect.objectContaining({ balance: 125, bank: 50 }));
  });

  it('nunca deja el saldo en negativo', async () => {
    const { db } = createDb({ balance: '10', bank: '0' });
    supabaseMock.mockReturnValue(db);

    await expect(addMoney('u1', 'g1', -50, 'remove')).resolves.toBe(0);
  });

  it('deposita en el banco', async () => {
    const { db, builder } = createDb({ balance: '10', bank: '40' });
    supabaseMock.mockReturnValue(db);

    await expect(addBank('u1', 'g1', 20, 'deposit')).resolves.toBe(60);
    expect(builder.upsert).toHaveBeenCalledWith(expect.objectContaining({ balance: 10, bank: 60 }));
  });

  it('el banco tampoco baja de cero', async () => {
    const { db } = createDb({ balance: '10', bank: '5' });
    supabaseMock.mockReturnValue(db);

    await expect(addBank('u1', 'g1', -50, 'withdraw')).resolves.toBe(0);
  });
});

describe('getTopWallets', () => {
  it('normaliza y devuelve los top', async () => {
    const { db } = createDb([{ user_id: 'a', balance: '10' }]);
    supabaseMock.mockReturnValue(db);

    await expect(getTopWallets('g1')).resolves.toEqual([{ user_id: 'a', balance: 10 }]);
  });
});

describe('formatMoney', () => {
  it('formatea con la moneda', () => {
    expect(formatMoney(0)).toBe('0 🪙');
    // el separador de miles depende del ICU del runtime (small-icu → sin separador)
    expect(formatMoney(1250)).toMatch(/^[\d.,]+ 🪙$/);
  });
});