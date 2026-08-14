import { db, ciszubotSchema, eq, and, desc, sql } from '@ciszunetwork/db';
import { logger } from './logger';

/** Economía por servidor (estilo UnbelievaBoat) */

export async function getWallet(userId: string, guildId: string): Promise<{ balance: number; bank: number }> {
  try {
    const wallets = ciszubotSchema.wallets;
    const rows = await db
      .select({ balance: wallets.balance, bank: wallets.bank })
      .from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.guildId, guildId)))
      .limit(1);
    if (rows[0]) return { balance: Number(rows[0].balance), bank: Number(rows[0].bank) };
  } catch (error) {
    logger.warn('getWallet:', error);
  }
  return { balance: 0, bank: 0 };
}

export async function setWallet(
  userId: string,
  guildId: string,
  balance: number,
  bank: number,
  type = 'manual',
  note?: string
): Promise<void> {
  try {
    const wallets = ciszubotSchema.wallets;
    await db
      .insert(wallets)
      .values({ userId, guildId, balance, bank })
      .onConflictDoUpdate({
        target: [wallets.userId, wallets.guildId],
        set: { balance, bank, updatedAt: sql`now()` },
      });
    await db.insert(ciszubotSchema.transactions).values({
      guildId,
      userId,
      amount: balance,
      type,
      note: note ?? null,
    });
  } catch (error) {
    logger.warn('setWallet:', error);
  }
}

export async function addMoney(userId: string, guildId: string, amount: number, type = 'grant', note?: string): Promise<number | null> {
  const w = await getWallet(userId, guildId);
  const balance = Math.max(0, w.balance + amount);
  await setWallet(userId, guildId, balance, w.bank, type, note);
  return balance;
}

export async function addBank(userId: string, guildId: string, amount: number, type = 'deposit', note?: string): Promise<number | null> {
  const w = await getWallet(userId, guildId);
  const bank = Math.max(0, w.bank + amount);
  await setWallet(userId, guildId, w.balance, bank, type, note);
  return bank;
}

export async function getTopWallets(guildId: string, limit = 10): Promise<Array<{ user_id: string; balance: number }>> {
  try {
    const wallets = ciszubotSchema.wallets;
    const rows = await db
      .select({ userId: wallets.userId, balance: wallets.balance })
      .from(wallets)
      .where(eq(wallets.guildId, guildId))
      .orderBy(desc(wallets.balance))
      .limit(limit);
    return rows.map((r) => ({ user_id: r.userId, balance: Number(r.balance) }));
  } catch (error) {
    logger.warn('getTopWallets:', error);
    return [];
  }
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString('es-ES')} 🪙`;
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}