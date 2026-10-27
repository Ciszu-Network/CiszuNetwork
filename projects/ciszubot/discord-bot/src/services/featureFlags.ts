import { db, ciszubotSchema, eq } from './supabase';
import { logger } from './logger';
import { PREMIUM_BETA_FLAG } from '../config/features';

/**
 * Feature flags globales (ciszubot.feature_flags) con caché corta.
 *
 * Las escribe la devcon vía service_role; el bot las lee con TTL de 20s para
 * que un cambio se aplique en tiempo casi real sin golpear la DB en cada
 * comando. Override por deploy: `FEATURES_OFF=music,search` (gana sobre la DB).
 */

const CACHE_TTL_MS = 20_000;

interface FlagsSnapshot {
  flags: Map<string, { enabled: boolean; reason: string | null }>;
  fetchedAt: number;
}

let cache: FlagsSnapshot | null = null;
let inflight: Promise<FlagsSnapshot> | null = null;

/** Overrides por servidor (ciszubot.guild_feature_flags) con TTL corto. */
const GUILD_TTL_MS = 20_000;
const guildCache = new Map<string, { flags: Map<string, boolean>; at: number }>();

async function fetchGuildFlags(guildId: string): Promise<Map<string, boolean>> {
  const rows = await db
    .select({ feature: ciszubotSchema.guildFeatureFlags.feature, enabled: ciszubotSchema.guildFeatureFlags.enabled })
    .from(ciszubotSchema.guildFeatureFlags)
    .where(eq(ciszubotSchema.guildFeatureFlags.guildId, guildId));
  return new Map(rows.map((r) => [r.feature, r.enabled]));
}

/** Override del servidor: null = sin override (usa el global). */
export async function getGuildFeatureOverride(guildId: string, slug: string): Promise<boolean | null> {
  const cached = guildCache.get(guildId);
  if (!cached || Date.now() - cached.at >= GUILD_TTL_MS) {
    try {
      const flags = await fetchGuildFlags(guildId);
      guildCache.set(guildId, { flags, at: Date.now() });
    } catch (error) {
      logger.warn('No se pudieron leer los flags del servidor:', error);
      if (!cached) return null;
      return cached.flags.get(slug) ?? null;
    }
  }
  const entry = guildCache.get(guildId);
  return entry ? (entry.flags.get(slug) ?? null) : null;
}

const deployOff = new Set(
  (process.env.FEATURES_OFF ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

async function fetchFlags(): Promise<FlagsSnapshot> {
  const rows = await db.select().from(ciszubotSchema.featureFlags);
  const flags = new Map(rows.map((r) => [r.feature, { enabled: r.enabled, reason: r.reason }]));
  return { flags, fetchedAt: Date.now() };
}

async function snapshot(): Promise<FlagsSnapshot> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache;
  if (!inflight) {
    inflight = fetchFlags()
      .then((s) => {
        cache = s;
        return s;
      })
      .catch((error) => {
        logger.warn('No se pudieron leer los feature flags:', error);
        return cache ?? { flags: new Map(), fetchedAt: Date.now() };
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export interface FeatureState {
  enabled: boolean;
  reason: string | null;
  source: 'deploy' | 'db' | 'default';
}

/** Estado de un flag: override de deploy > DB > default activo. */
export async function getFeatureState(slug: string): Promise<FeatureState> {
  if (deployOff.has(slug)) {
    return { enabled: false, reason: 'Desactivado en este despliegue', source: 'deploy' };
  }
  const snap = await snapshot();
  const row = snap.flags.get(slug);
  if (!row) return { enabled: true, reason: null, source: 'default' };
  return { enabled: row.enabled, reason: row.reason, source: 'db' };
}

export async function isFeatureEnabled(slug: string): Promise<boolean> {
  return (await getFeatureState(slug)).enabled;
}

/** ¿Beta premium activa? (sin fila ⇒ activa: todo gratis por defecto). */
export async function isPremiumBeta(): Promise<boolean> {
  const snap = await snapshot();
  const row = snap.flags.get(PREMIUM_BETA_FLAG);
  return row ? row.enabled : true;
}

/** ¿El servidor tiene una activación premium válida y la cuenta sigue activa? */
export async function isPremiumGuild(guildId: string): Promise<boolean> {
  try {
    const guilds = ciszubotSchema.premiumGuilds;
    const accounts = ciszubotSchema.premiumAccounts;
    const rows = await db
      .select({
        status: guilds.status,
        expiresAt: guilds.expiresAt,
        userId: guilds.userId,
        activationId: guilds.activationId,
        accountPlan: accounts.plan,
        accountStatus: accounts.status,
        accountEnabled: accounts.premiumEnabled,
        accountEnd: accounts.currentPeriodEnd,
      })
      .from(guilds)
      .leftJoin(accounts, eq(accounts.userId, guilds.userId))
      .where(eq(guilds.guildId, guildId))
      .limit(1);
    const row = rows[0];
    if (!row || row.status !== 'active' || !row.activationId || !row.userId) return false;
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return false;
    if (!row.accountPlan || row.accountStatus !== 'active' || row.accountEnabled !== true) return false;
    if (row.accountPlan === 'beta' && !(await isPremiumBeta())) return false;
    if (row.accountEnd && row.accountEnd.getTime() < Date.now()) return false;
    return true;
  } catch (error) {
    logger.warn('No se pudo verificar el premium del servidor:', error);
    return false;
  }
}

export function invalidateFlagsCache(): void {
  cache = null;
}
