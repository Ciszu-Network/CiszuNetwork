import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { db, ciszubotSchema, eq, and, desc } from '@ciszunetwork/db';
import { logger } from './logger';
import type { GuildConfig } from './configService';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';

/**
 * Sistema de sugerencias (cz!suggest):
 * - Un canal específico recibe las sugerencias como embeds con botones 👍/👎.
 * - Los votos son con toggle (se puede quitar o cambiar el voto).
 * - El staff aprueba o cancela con razón (cz!suggest aprobar/cancelar).
 * - Límites: cooldown por usuario y máximo de pendientes por usuario; además
 *   se pueden excluir roles.
 */

type SuggestionRow = {
  id: number;
  guildId: string;
  userId: string;
  channelId: string | null;
  messageId: string | null;
  content: string;
  status: string;
  reason: string | null;
  decidedBy: string | null;
  upVotes: number;
  downVotes: number;
  voters: unknown;
  createdAt: Date;
};

function votersOf(row: { voters: unknown }): Record<string, 'up' | 'down'> {
  return (row.voters && typeof row.voters === 'object' ? row.voters : {}) as Record<string, 'up' | 'down'>;
}

function suggestEmbed(row: SuggestionRow, authorTag: string, iconURL?: string | null): EmbedBuilder {
  const statusLine =
    row.status === 'approved'
      ? `✅ **Aprobada** por <@${row.decidedBy}>${row.reason ? ` — ${row.reason}` : ''}`
      : row.status === 'cancelled'
        ? `⛔ **Cancelada** por <@${row.decidedBy}>${row.reason ? ` — ${row.reason}` : ''}`
        : '🕒 **Pendiente** de revisión';
  const color = row.status === 'approved' ? BOT_COLORS.success : row.status === 'cancelled' ? BOT_COLORS.danger : BOT_COLORS.primary;
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`💡 Sugerencia #${row.id}`)
    .setDescription(row.content.slice(0, 4000))
    .addFields(
      { name: '👍 A favor', value: `${row.upVotes}`, inline: true },
      { name: '👎 En contra', value: `${row.downVotes}`, inline: true },
      { name: 'Autor', value: `<@${row.userId}>`, inline: true },
      { name: 'Estado', value: statusLine, inline: false },
    )
    .setFooter(BOT_FOOTER(authorTag, iconURL))
    .setTimestamp(row.createdAt);
}

function suggestButtons(id: number, disabled = false): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`sug_up:${id}`).setLabel('A favor').setEmoji('👍').setStyle(ButtonStyle.Success).setDisabled(disabled),
    new ButtonBuilder().setCustomId(`sug_down:${id}`).setLabel('En contra').setEmoji('👎').setStyle(ButtonStyle.Danger).setDisabled(disabled),
  );
}

async function getSuggestion(id: number): Promise<SuggestionRow | null> {
  const table = ciszubotSchema.suggestions;
  const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
  return (rows[0] as SuggestionRow | undefined) ?? null;
}

/** Crea una sugerencia nueva (valida canal, roles excluidos, cooldown y límite). */
export async function createSuggestion(
  guildId: string,
  channel: TextChannel,
  author: { id: string; tag: string; displayAvatarURL(): string },
  content: string,
  cfg: GuildConfig,
  memberRoles: string[],
): Promise<{ ok: boolean; reason?: string; id?: number }> {
  const text = content.trim();
  if (!text) return { ok: false, reason: 'La sugerencia está vacía.' };
  if (text.length > 1000) return { ok: false, reason: 'La sugerencia es demasiado larga (máximo 1000 caracteres).' };

  if (cfg.suggestions_excluded_role_ids.length > 0 && memberRoles.some((r) => cfg.suggestions_excluded_role_ids.includes(r))) {
    return { ok: false, reason: 'Tienes un rol excluido para enviar sugerencias.' };
  }

  const table = ciszubotSchema.suggestions;

  if (cfg.suggestions_cooldown_minutes > 0) {
    const last = await db
      .select({ createdAt: table.createdAt })
      .from(table)
      .where(and(eq(table.guildId, guildId), eq(table.userId, author.id)))
      .orderBy(desc(table.createdAt))
      .limit(1);
    const lastAt = last[0]?.createdAt?.getTime() ?? 0;
    const waitMs = cfg.suggestions_cooldown_minutes * 60_000 - (Date.now() - lastAt);
    if (lastAt && waitMs > 0) {
      return { ok: false, reason: `Debes esperar **${Math.ceil(waitMs / 60_000)} min** antes de enviar otra sugerencia.` };
    }
  }

  if (cfg.suggestions_max_active > 0) {
    const pending = await db
      .select({ id: table.id })
      .from(table)
      .where(and(eq(table.guildId, guildId), eq(table.userId, author.id), eq(table.status, 'pending')));
    if (pending.length >= cfg.suggestions_max_active) {
      return { ok: false, reason: `Ya tienes **${pending.length}** sugerencia(s) pendiente(s) (máximo ${cfg.suggestions_max_active}).` };
    }
  }

  const inserted = await db
    .insert(table)
    .values({ guildId, userId: author.id, channelId: channel.id, content: text, status: 'pending' })
    .returning({ id: table.id });
  const id = inserted[0]?.id;
  if (!id) return { ok: false, reason: 'No se pudo registrar la sugerencia.' };

  const row = await getSuggestion(id);
  const fallback: SuggestionRow = {
    id,
    guildId,
    userId: author.id,
    channelId: channel.id,
    messageId: null,
    content: text,
    status: 'pending',
    reason: null,
    decidedBy: null,
    upVotes: 0,
    downVotes: 0,
    voters: {},
    createdAt: new Date(),
  };
  const message = await channel
    .send({ embeds: [suggestEmbed(row ?? fallback, author.tag, author.displayAvatarURL())], components: [suggestButtons(id)] })
    .catch((error) => {
      logger.warn('createSuggestion send:', error);
      return null;
    });
  if (message) {
    await db.update(table).set({ messageId: message.id }).where(eq(table.id, id));
  }
  return { ok: true, id };
}

/** Voto con toggle: mismo voto lo quita; voto distinto lo cambia. */
export async function voteSuggestion(
  client: Client,
  id: number,
  userId: string,
  dir: 'up' | 'down',
): Promise<{ ok: boolean; reason?: string; up?: number; down?: number; mine?: 'up' | 'down' | null }> {
  const row = await getSuggestion(id);
  if (!row) return { ok: false, reason: 'Esa sugerencia ya no existe.' };
  if (row.status !== 'pending') return { ok: false, reason: 'Esa sugerencia ya fue decidida.' };

  const voters = votersOf(row);
  const prev = voters[userId];
  if (prev === dir) delete voters[userId];
  else voters[userId] = dir;

  const up = Object.values(voters).filter((v) => v === 'up').length;
  const down = Object.values(voters).filter((v) => v === 'down').length;

  const table = ciszubotSchema.suggestions;
  await db.update(table).set({ voters, upVotes: up, downVotes: down }).where(eq(table.id, id));

  // Editar el mensaje con el nuevo marcador (si sigue existiendo).
  if (row.channelId && row.messageId) {
    const channel = (client.channels.cache.get(row.channelId) ?? (await client.channels.fetch(row.channelId).catch(() => null))) as TextChannel | null;
    if (channel) {
      const updated = { ...row, voters, upVotes: up, downVotes: down } as SuggestionRow;
      await channel.messages
        .fetch(row.messageId)
        .then((m) => m.edit({ embeds: [suggestEmbed(updated, 'Votación')] }))
        .catch(() => undefined);
    }
  }
  return { ok: true, up, down, mine: voters[userId] ?? null };
}

/** Aprobación/cancelación por el staff (con razón). */
export async function decideSuggestion(
  client: Client,
  id: number,
  adminId: string,
  action: 'approved' | 'cancelled',
  reason: string | null,
): Promise<{ ok: boolean; reason?: string }> {
  const row = await getSuggestion(id);
  if (!row) return { ok: false, reason: 'Esa sugerencia no existe.' };
  if (row.status !== 'pending') return { ok: false, reason: `Esa sugerencia ya fue ${row.status === 'approved' ? 'aprobada' : 'cancelada'}.` };

  const table = ciszubotSchema.suggestions;
  await db
    .update(table)
    .set({ status: action, reason, decidedBy: adminId, decidedAt: new Date() })
    .where(eq(table.id, id));

  if (row.channelId && row.messageId) {
    const channel = (client.channels.cache.get(row.channelId) ?? (await client.channels.fetch(row.channelId).catch(() => null))) as TextChannel | null;
    if (channel) {
      const updated = { ...row, status: action, reason, decidedBy: adminId } as SuggestionRow;
      await channel.messages
        .fetch(row.messageId)
        .then((m) => m.edit({ embeds: [suggestEmbed(updated, 'Decisión del staff')], components: [suggestButtons(id, true)] }))
        .catch(() => undefined);
    }
  }
  return { ok: true };
}
