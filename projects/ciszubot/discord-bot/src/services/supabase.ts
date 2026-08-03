import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase(): any {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas para conectarse a Supabase');
    }
    client = createClient(url, key, {
      db: { schema: 'ciszubot' },
      auth: { persistSession: false },
    });
  }
  return client;
}

export async function logCommand(guildId: string, userId: string, command: string, args?: string[]): Promise<void> {
  try {
    const db = getSupabase();
    await db.from('command_logs').insert({
      guild_id: guildId,
      user_id: userId,
      command,
      args: args && args.length > 0 ? { args } : null,
    });
  } catch (error) {
    logger.warn('No se pudo loguear el comando en Supabase:', error);
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
    const db = getSupabase();
    await db.from('bot_status').upsert({
      id: 1,
      online: status.online,
      guilds: status.guilds,
      commands_total: status.commandsTotal,
      version: status.version,
      last_seen: status.lastSeen.toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn('No se pudo actualizar el estado del bot en Supabase:', error);
  }
}
