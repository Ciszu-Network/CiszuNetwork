import { db, ciszubotSchema, eq, and, asc } from '@ciszunetwork/db';
import { logger } from './logger';
import { isPremiumGuild } from './featureFlags';

/**
 * Comandos personalizados por servidor (cz!<trigger>):
 * - Los usuarios crean sus propios comandos (sin colisionar con el bot).
 * - Límite: 5 por servidor en free; ilimitados con premium.
 * - Variables soportadas en la respuesta: {user} {username} {guild} {members}.
 */

export const CUSTOM_FREE_LIMIT = 5;

export interface CustomCommandRow {
  id: number;
  guildId: string;
  trigger: string;
  response: string;
  createdBy: string | null;
  uses: number;
}

export function normalizeTrigger(raw: string): string | null {
  const trigger = raw.trim().toLowerCase();
  if (!/^[a-z0-9]{2,20}$/.test(trigger)) return null;
  return trigger;
}

async function rowsFor(guildId: string): Promise<CustomCommandRow[]> {
  const table = ciszubotSchema.customCommands;
  const rows = await db.select().from(table).where(eq(table.guildId, guildId)).orderBy(asc(table.trigger));
  return rows as CustomCommandRow[];
}

export async function listCustomCommands(guildId: string): Promise<CustomCommandRow[]> {
  try {
    return await rowsFor(guildId);
  } catch (error) {
    logger.warn('listCustomCommands:', error);
    return [];
  }
}

export async function findCustomCommand(guildId: string, trigger: string): Promise<CustomCommandRow | null> {
  try {
    const table = ciszubotSchema.customCommands;
    const rows = await db
      .select()
      .from(table)
      .where(and(eq(table.guildId, guildId), eq(table.trigger, trigger)))
      .limit(1);
    return (rows[0] as CustomCommandRow | undefined) ?? null;
  } catch (error) {
    logger.warn('findCustomCommand:', error);
    return null;
  }
}

export async function createCustomCommand(
  guildId: string,
  trigger: string,
  response: string,
  createdBy: string,
): Promise<{ ok: boolean; reason?: string }> {
  const text = response.trim();
  if (!text) return { ok: false, reason: 'Falta la respuesta.' };
  if (text.length > 1000) return { ok: false, reason: 'La respuesta es demasiado larga (máximo 1000).' };

  const existing = await rowsFor(guildId);
  const premium = await isPremiumGuild(guildId);
  if (!premium && existing.length >= CUSTOM_FREE_LIMIT) {
    return { ok: false, reason: `Límite de ${CUSTOM_FREE_LIMIT} comandos personalizados alcanzado (premium = ilimitados).` };
  }
  if (existing.some((r) => r.trigger === trigger)) {
    return { ok: false, reason: `Ya existe un comando personalizado \`cz!${trigger}\`.` };
  }

  const table = ciszubotSchema.customCommands;
  try {
    await db.insert(table).values({ guildId, trigger, response: text, createdBy });
    return { ok: true };
  } catch (error) {
    logger.warn('createCustomCommand:', error);
    return { ok: false, reason: 'No se pudo guardar (¿ya existe?).' };
  }
}

export async function deleteCustomCommand(
  guildId: string,
  trigger: string,
  requester: { id: string; staff: boolean },
): Promise<{ ok: boolean; reason?: string }> {
  const row = await findCustomCommand(guildId, trigger);
  if (!row) return { ok: false, reason: 'Ese comando personalizado no existe.' };
  if (!requester.staff && row.createdBy !== requester.id) {
    return { ok: false, reason: 'Solo su creador o el staff pueden borrarlo.' };
  }
  const table = ciszubotSchema.customCommands;
  await db.delete(table).where(and(eq(table.guildId, guildId), eq(table.trigger, trigger)));
  return { ok: true };
}

/** Ejecuta el comando personalizado si existe (usado por el handler de mensajes). */
export async function runCustomCommand(
  guildId: string,
  trigger: string,
  ctx: { userId: string; username: string; guildName: string; memberCount: number },
  reply: (content: string) => Promise<unknown>,
): Promise<boolean> {
  const row = await findCustomCommand(guildId, trigger);
  if (!row) return false;
  const text = row.response
    .replaceAll('{user}', `<@${ctx.userId}>`)
    .replaceAll('{username}', ctx.username)
    .replaceAll('{guild}', ctx.guildName)
    .replaceAll('{members}', String(ctx.memberCount));
  await reply(text).catch(() => undefined);
  try {
    const table = ciszubotSchema.customCommands;
    await db.update(table).set({ uses: row.uses + 1 }).where(eq(table.id, row.id));
  } catch (error) {
    logger.warn('runCustomCommand bump uses:', error);
  }
  return true;
}
