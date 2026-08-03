import { getSupabase } from './supabase';
import { logger } from './logger';

/** Economía por servidor (estilo UnbelievaBoat) */

export async function getWallet(userId: string, guildId: string): Promise<{ balance: number; bank: number }> {
  try {
    const db = getSupabase();
    const { data } = await db.from('wallets').select('balance, bank').eq('user_id', userId).eq('guild_id', guildId).maybeSingle();
    if (data) return { balance: Number(data.balance), bank: Number(data.bank) };
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
    const db = getSupabase();
    await db.from('wallets').upsert({
      user_id: userId,
      guild_id: guildId,
      balance,
      bank,
      updated_at: new Date().toISOString(),
    });
    await db.from('transactions').insert({
      guild_id: guildId,
      user_id: userId,
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
    const db = getSupabase();
    const { data } = await db
      .from('wallets')
      .select('user_id, balance')
      .eq('guild_id', guildId)
      .order('balance', { ascending: false })
      .limit(limit);
    return (data ?? []).map((r: { user_id: string; balance: number }) => ({ user_id: r.user_id, balance: Number(r.balance) }));
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
