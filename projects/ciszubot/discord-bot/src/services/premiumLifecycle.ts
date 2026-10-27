import type { Client } from 'discord.js';
import { db, ciszubotSchema, eq } from './supabase';
import { isPremiumBeta } from './featureFlags';
import { logger } from './logger';

const COOLDOWN_MS = 7 * 86_400_000;

/**
 * Expira planes vencidos y desactiva activaciones huérfanas.
 * Se ejecuta al arrancar y cada hora; el gate de comandos también valida en vivo.
 */
export async function syncPremiumLifecycle(): Promise<void> {
  const accounts = ciszubotSchema.premiumAccounts;
  const guilds = ciszubotSchema.premiumGuilds;
  const configs = ciszubotSchema.guildConfigs;
  const beta = await isPremiumBeta();

  const expired = await db
    .select({ userId: accounts.userId, plan: accounts.plan, currentPeriodEnd: accounts.currentPeriodEnd })
    .from(accounts)
    .where(eq(accounts.status, 'active'));

  for (const account of expired) {
    const ended = account.currentPeriodEnd && account.currentPeriodEnd.getTime() < Date.now();
    if (!ended && !(account.plan === 'beta' && !beta)) continue;
    await db
      .update(accounts)
      .set({ status: 'expired', premiumEnabled: false, updatedAt: new Date() })
      .where(eq(accounts.userId, account.userId));
  }

  const activeGuilds = await db.select().from(guilds).where(eq(guilds.status, 'active'));
  for (const guild of activeGuilds) {
    const accountRows = guild.userId
      ? await db.select().from(accounts).where(eq(accounts.userId, guild.userId)).limit(1)
      : [];
    const account = accountRows[0];
    const valid =
      Boolean(guild.activationId) &&
      Boolean(account) &&
      account.status === 'active' &&
      account.premiumEnabled &&
      !(account.plan === 'beta' && !beta) &&
      (!account.currentPeriodEnd || account.currentPeriodEnd.getTime() > Date.now()) &&
      (!guild.expiresAt || guild.expiresAt.getTime() > Date.now());
    if (valid) continue;

    await db
      .update(guilds)
      .set({
        status: 'inactive',
        activationId: null,
        deactivatedAt: new Date(),
        cooldownUntil: new Date(Date.now() + COOLDOWN_MS),
        updatedAt: new Date(),
      })
      .where(eq(guilds.guildId, guild.guildId));
    await db
      .update(configs)
      .set({ premiumServerEnabled: false, updatedAt: new Date() })
      .where(eq(configs.guildId, guild.guildId))
      .catch(() => undefined);
  }
}

export function startPremiumLifecycleLoop(_client: Client): void {
  setTimeout(() => {
    void syncPremiumLifecycle().catch((error) => logger.warn('premium lifecycle:', error));
  }, 30_000);
  setInterval(() => {
    void syncPremiumLifecycle().catch((error) => logger.warn('premium lifecycle:', error));
  }, 3_600_000);
}
