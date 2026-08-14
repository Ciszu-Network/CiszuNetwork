import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb, createDbProxy, dbState } from './helpers/db';

vi.mock('@ciszunetwork/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ciszunetwork/db')>();
  const { createDbProxy } = await import('./helpers/db');
  return { ...actual, db: createDbProxy() };
});

import {
  addBank,
  addMoney,
  formatMoney,
  getTopWallets,
  getWallet,
  setWallet,
} from '../src/services/economy';
import { ciszubotSchema } from '@ciszunetwork/db';

beforeEach(() => {
  dbState.set(null);
});

describe('getWallet', () => {
  it('sin fila devuelve 0/0', async () => {
    dbState.set(createDb(null).db);
    await expect(getWallet('u1', 'g1')).resolves.toEqual({ balance: 0, bank: 0 });
  });

  it('parsea valores string de la BD', async () => {
    dbState.set(createDb({ balance: '120', bank: '80' }).db);
    await expect(getWallet('u1', 'g1')).resolves.toEqual({ balance: 120, bank: 80 });
  });

  it('no rompe si la BD falla', async () => {
    const { db } = createDb();
    dbState.set(db);
    vi.spyOn(db, 'select').mockImplementationOnce(() => {
      throw new Error('boom');
    });
    await expect(getWallet('u1', 'g1')).resolves.toEqual({ balance: 0, bank: 0 });
  });
});

describe('setWallet', () => {
  it('hace upsert del saldo e inserta la transacción', async () => {
    const { db } = createDb(null);
    dbState.set(db);

    await setWallet('u1', 'g1', 150, 50, 'manual', 'nota');

    expect(db.insert).toHaveBeenCalledWith(ciszubotSchema.wallets);
    const walletBuilder = db.insert.mock.results[0].value;
    const walletValues = walletBuilder.values.mock.results[0].value;
    expect(walletValues.onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ set: expect.objectContaining({ balance: 150, bank: 50 }) })
    );

    expect(db.insert).toHaveBeenCalledWith(ciszubotSchema.transactions);
    const txBuilder = db.insert.mock.results[1].value;
    expect(txBuilder.values).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', guildId: 'g1', amount: 150, type: 'manual', note: 'nota' })
    );
  });
});

describe('addMoney / addBank', () => {
  it('suma al saldo y persiste', async () => {
    const { db } = createDb({ balance: '100', bank: '50' });
    dbState.set(db);

    await expect(addMoney('u1', 'g1', 25, 'grant')).resolves.toBe(125);
    const walletBuilder = db.insert.mock.results[0].value;
    const walletValues = walletBuilder.values.mock.results[0].value;
    expect(walletValues.onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ set: expect.objectContaining({ balance: 125, bank: 50 }) })
    );
  });

  it('nunca deja el saldo en negativo', async () => {
    dbState.set(createDb({ balance: '10', bank: '0' }).db);
    await expect(addMoney('u1', 'g1', -50, 'remove')).resolves.toBe(0);
  });

  it('deposita en el banco', async () => {
    const { db } = createDb({ balance: '10', bank: '40' });
    dbState.set(db);

    await expect(addBank('u1', 'g1', 20, 'deposit')).resolves.toBe(60);
    const walletBuilder = db.insert.mock.results[0].value;
    const walletValues = walletBuilder.values.mock.results[0].value;
    expect(walletValues.onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ set: expect.objectContaining({ balance: 10, bank: 60 }) })
    );
  });

  it('el banco tampoco baja de cero', async () => {
    dbState.set(createDb({ balance: '10', bank: '5' }).db);
    await expect(addBank('u1', 'g1', -50, 'withdraw')).resolves.toBe(0);
  });
});

describe('getTopWallets', () => {
  it('normaliza y devuelve los top', async () => {
    dbState.set(createDb([{ userId: 'a', balance: '10' }]).db);
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