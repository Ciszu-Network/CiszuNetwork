import 'server-only';
import { db, ciszubotSchema, eq } from '@ciszunetwork/db';

/**
 * Lee el flag global `premium_beta` (ciszubot.feature_flags) desde el servidor.
 * Sin fila o con la DB caída ⇒ beta activa (todo gratis), el estado seguro.
 */
export async function isPremiumBeta(): Promise<boolean> {
  try {
    const rows = await db
      .select({ enabled: ciszubotSchema.featureFlags.enabled })
      .from(ciszubotSchema.featureFlags)
      .where(eq(ciszubotSchema.featureFlags.feature, 'premium_beta'))
      .limit(1);
    return rows[0]?.enabled ?? true;
  } catch {
    return true;
  }
}
