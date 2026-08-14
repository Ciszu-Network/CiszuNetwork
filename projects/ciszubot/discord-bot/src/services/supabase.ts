import { db, ciszubotSchema, sql } from '@ciszunetwork/db';
import { logger } from './logger';

/**
 * Capa de datos del bot (schema `ciszubot`) vía Drizzle.
 * Reemplaza la antigua capa de @supabase/supabase-js (service_role).
 * El cliente `db` usa `DATABASE_URL` (pooler Supabase); sin configurar,
 * lanza solo al ejecutar un query (nunca al importar).
 */
export { db, ciszubotSchema };
export { eq, ne, gt, gte, lt, lte, and, or, not, asc, desc, count, sum, avg, min, max, ilike, like, isNull, isNotNull, inArray, sql } from '@ciszunetwork/db';

export async function logCommand(guildId: string, userId: string, command: string, args?: string[]): Promise<void> {
  try {
    await db.insert(ciszubotSchema.commandLogs).values({
      guildId,
      userId,
      command,
      args: args && args.length > 0 ? { args } : null,
    });
  } catch (error) {
    logger.warn('No se pudo loguear el comando:', error);
  }
}

export async function updateBotStatus(status: {
  online: boolean;
  guilds: number;
  commandsTotal: number;
  version: string;
  lastSeen: Date;
}): Promise<void> {
  try {
    const botStatus = ciszubotSchema.botStatus;
    await db
      .insert(botStatus)
      .values({
        id: 1,
        online: status.online,
        guilds: status.guilds,
        commandsTotal: status.commandsTotal,
        version: status.version,
        lastSeen: status.lastSeen,
      })
      .onConflictDoUpdate({
        target: botStatus.id,
        set: {
          online: status.online,
          guilds: status.guilds,
          commandsTotal: status.commandsTotal,
          version: status.version,
          lastSeen: status.lastSeen,
          updatedAt: sql`now()`,
        },
      });
  } catch (error) {
    logger.warn('No se pudo actualizar el estado del bot:', error);
  }
}