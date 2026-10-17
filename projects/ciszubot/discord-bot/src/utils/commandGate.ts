import { EmbedBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { LINKS, BOT_COLORS, BOT_FOOTER, BOT_ASSETS } from '../config/links';
import { resolveFeatureForCommand, isPremiumCommand, featureLabel } from '../config/features';
import { getFeatureState, getGuildFeatureOverride, isPremiumBeta, isPremiumGuild } from '../services/featureFlags';
import { getGuildConfig } from '../services/configService';

/**
 * Interceptor global previo a `command.execute` (prefijo y slash):
 *  · función desactivada por flag → bloquea con embed de motivo
 *  · rate limit por comando (config del servidor) → "espera X segundos"
 *  · función premium en beta → avisa (embed premium + disclaimer beta aparte)
 *    y deja ejecutar (durante la beta todo es gratis)
 *  · función premium sin beta y sin suscripción del servidor → bloquea con CTA
 */

export const PREMIUM_URL = `${LINKS.website}/premium`;

/** Último uso por usuario/servidor/comando (rate limit en memoria). */
const cooldownTracker = new Map<string, number>();

function cooldownEmbed(remaining: number, tag: string, iconURL?: string | null): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BOT_COLORS.secondary)
    .setTitle('⏳ Espera un momento')
    .setDescription(`Debes esperar **${remaining} segundo${remaining === 1 ? '' : 's'}** antes de volver a usar este comando.`)
    .setFooter(BOT_FOOTER(tag, iconURL))
    .setTimestamp();
}

function disabledEmbed(reason: string | null, tag: string, iconURL?: string | null, feature?: string | null): EmbedBuilder {
  const what = feature ? `La función **${feature}**` : 'Esta función';
  return new EmbedBuilder()
    .setColor(BOT_COLORS.danger)
    .setTitle('⛔ Comando no activado')
    .setDescription(
      `${what} está **desactivada** en este momento: el comando no está configurado para usarse.\n` +
        (reason ? `\n**Motivo:** ${reason}\n` : '') +
        `\nPide a la administración que la active desde el panel: ${LINKS.website}/dashboard`,
    )
    .setThumbnail(BOT_ASSETS.isotype)
    .setFooter(BOT_FOOTER(tag, iconURL))
    .setTimestamp();
}

function premiumEmbed(tag: string, iconURL?: string | null): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#fbbf24')
    .setTitle('⭐ Función Premium')
    .setDescription(
      'Esta función forma parte de **CiszuBot Premium**.\n' +
        `Pide a la administración de este servidor que active Premium: ${PREMIUM_URL}`,
    )
    .setFooter(BOT_FOOTER(tag, iconURL))
    .setTimestamp();
}

function betaEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BOT_COLORS.secondary)
    .setTitle('🧪 BETA — gratis por ahora')
    .setDescription('Todas las funciones premium son **gratis** durante la beta. Puedes usarla sin costo.');
}

function premiumBlockedEmbed(tag: string, iconURL?: string | null): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#fbbf24')
    .setTitle('⭐ Función Premium')
    .setDescription(
      'Esta función es **Premium** y no está activa en este servidor.\n' +
        `Pide a la administración que active CiszuBot Premium: ${PREMIUM_URL}`,
    )
    .setFooter(BOT_FOOTER(tag, iconURL))
    .setTimestamp();
}

export interface GateContext {
  command: BotCommand;
  guildId: string | null;
  tag: string;
  iconURL?: string | null;
  /** Transporte del mensaje (reply de prefijo o followUp de slash). */
  send: (content: { embeds: EmbedBuilder[] }) => Promise<unknown>;
}

/** Devuelve true si el comando puede ejecutarse (y ya emitió avisos si tocaba). */
export async function gateCommand(ctx: GateContext): Promise<boolean> {
  const { command, guildId, tag, iconURL, send } = ctx;

  const slug = resolveFeatureForCommand(command);
  if (slug) {
    const state = await getFeatureState(slug);
    if (!state.enabled) {
      await send({ embeds: [disabledEmbed(state.reason, tag, iconURL, featureLabel(slug))] });
      return false;
    }
    if (guildId) {
      const guildOverride = await getGuildFeatureOverride(guildId, slug);
      if (guildOverride === false) {
        await send({ embeds: [disabledEmbed('Desactivada en este servidor', tag, iconURL, featureLabel(slug))] });
        return false;
      }
    }
  }

  // Rate limit por comando configurado por el servidor ("espera X segundos")
  if (guildId) {
    const cfg = await getGuildConfig(guildId);
    const seconds = cfg.command_cooldowns[command.name];
    if (seconds && seconds > 0) {
      const key = `${guildId}:${tag}:${command.name}`;
      const now = Date.now();
      const last = cooldownTracker.get(key) ?? 0;
      const wait = seconds * 1000 - (now - last);
      if (wait > 0) {
        await send({ embeds: [cooldownEmbed(Math.ceil(wait / 1000), tag, iconURL)] });
        return false;
      }
      cooldownTracker.set(key, now);
    }
  }

  if (!isPremiumCommand(command)) return true;

  if (await isPremiumBeta()) {
    await send({ embeds: [premiumEmbed(tag, iconURL), betaEmbed()] });
    return true;
  }

  if (guildId && (await isPremiumGuild(guildId))) return true;

  await send({ embeds: [premiumBlockedEmbed(tag, iconURL)] });
  return false;
}
