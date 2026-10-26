import {
  Client,
  Events,
  GuildMember,
  PartialGuildMember,
  Message,
  PermissionsBitField,
  TextChannel,
  VoiceChannel,
  ChannelType,
  EmbedBuilder,
  ButtonInteraction,
  PartialMessage,
} from 'discord.js';
import { getGuildConfig, getPrefix, GuildConfig } from '../services/configService';
import { handleCounting } from '../services/counting';
import { voteSuggestion } from '../services/suggestions';
import { closePoll, resumePolls, votePoll } from '../services/polls';
import { handleTriviaMessage } from '../services/trivia';
import { addXp } from '../services/levels';
import { db, ciszubotSchema, eq, and, desc } from '../services/supabase';
import { logger } from '../services/logger';
import { resumeActiveGiveaways, joinGiveaway, bumpMemberMessages } from '../services/giveaways';
import { tryClaimDrop, completeDrop, scheduleDrops } from '../services/drops';
import { takeProposal } from '../services/proposals';
import { processAllianceMessage, sendAllianceError } from '../services/alliances';
import { handleTicketClaim, handleTicketClose } from '../services/tickets';
import { scheduleActions } from '../services/actions';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { hasExternalEmoji, isNitroRoleExcluded, sendNitroWebhook } from '../services/nitro';

/**
 * Listeners del bot: XP/niveles (mensaje custom + roles), snipe, AFK,
 * bienvenidas/despedidas, autoroles, contadores, tickets, giveaways,
 * automod, invitaciones, starboard, VCs privados, logs y emojis Nitro.
 */

const xpCooldowns = new Map<string, number>();
const XP_AMOUNT = 25;
const XP_COOLDOWN_MS = 60_000;

/** Última actividad vista por miembro (para el auto-AFK por inactividad). */
const lastActivity = new Map<string, number>();

function xpKey(userId: string, guildId: string): string {
  return `${userId}:${guildId}`;
}

async function handleXp(message: Message): Promise<void> {
  if (!message.guild) return;
  const cfg = await getGuildConfig(message.guild.id);
  if (!cfg.leveling_enabled) return;

  const key = xpKey(message.author.id, message.guild.id);
  const now = Date.now();
  const last = xpCooldowns.get(key) ?? 0;
  if (now - last < XP_COOLDOWN_MS) return;
  xpCooldowns.set(key, now);

  const amount = Math.round(XP_AMOUNT * (cfg.xp_rate ?? 1));
  const result = await addXp(message.author.id, message.guild.id, amount);
  if (!result?.leveledUp) return;

  // Roles por nivel
  const level = result.level;
  if (Array.isArray(cfg.level_roles) && cfg.level_roles.length > 0 && message.member) {
    for (const reward of cfg.level_roles) {
      if (level >= reward.level) {
        const role = message.guild.roles.cache.get(reward.role_id);
        if (role && !message.member.roles.cache.has(role.id) && message.member.manageable) {
          await message.member.roles.add(role).catch(() => undefined);
        }
      }
    }
  }

  const text = (cfg.level_message ?? '🎉 ¡{user} subió al nivel {level} en {guild}!')
    .replaceAll('{user}', `<@${message.author.id}>`)
    .replaceAll('{mention}', `<@${message.author.id}>`)
    .replaceAll('{level}', String(level))
    .replaceAll('{guild}', message.guild.name)
    .replaceAll('{username}', message.author.username);

  const embed = new EmbedBuilder()
    .setColor('#ff33cc')
    .setTitle(`🎉 ¡Nivel ${level}!`)
    .setDescription(text)
    .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
    .setTimestamp();

  if (cfg.level_channel_id) {
    const channel = message.guild.channels.cache.get(cfg.level_channel_id) as TextChannel | undefined;
    if (channel) {
      await channel.send({ content: `<@${message.author.id}>`, embeds: [embed] }).catch(() => undefined);
      return;
    }
  }
  await message.reply({ embeds: [embed] }).catch(() => undefined);
}

// ─── Automod ───

const spamTracker = new Map<string, { t: number; content: string }[]>();

/** Devuelve la regla incumplida o null. */
async function automodViolation(message: Message, cfg: GuildConfig): Promise<string | null> {
  if (!cfg.automod_enabled || !message.guild) return null;
  const am = cfg.automod_config;
  const content = message.content ?? '';
  if (am.links && /(https?:\/\/|www\.)\S+/i.test(content)) return 'links';
  if (am.invites && /(discord\.gg\/|discord(app)?\.com\/invite\/)\S+/i.test(content)) return 'invitaciones';
  if (am.caps) {
    const letters = content.replace(/[^a-zA-Z]/g, '');
    if (letters.length >= 10 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.7) return 'mayúsculas';
  }
  if (am.words.length > 0) {
    const lower = content.toLowerCase();
    const hit = am.words.find((w) => lower.includes(w));
    if (hit) return `palabra prohibida`;
  }
  if (am.spam || am.flood) {
    const key = `${message.author.id}:${message.guild.id}`;
    const now = Date.now();
    const recent = (spamTracker.get(key) ?? []).filter((e) => now - e.t < 10_000);
    recent.push({ t: now, content: content.trim().toLowerCase() });
    spamTracker.set(key, recent);
    if (am.spam && content.trim().length > 0 && recent.filter((e) => e.content === content.trim().toLowerCase()).length >= 3) {
      spamTracker.set(key, []);
      return 'spam (mensaje repetido)';
    }
    if (am.flood && recent.length >= 8) {
      spamTracker.set(key, []);
      return 'flood (demasiados mensajes seguidos)';
    }
  }
  return null;
}

async function handleAutomod(message: Message, cfg: GuildConfig): Promise<boolean> {
  const violation = await automodViolation(message, cfg);
  if (!violation) return false;
  const me = message.guild?.members.me;
  const textChannel = 'permissionsFor' in message.channel ? (message.channel as TextChannel) : null;
  const deletable = me && textChannel ? textChannel.permissionsFor(me)?.has(PermissionsBitField.Flags.ManageMessages) : false;
  if (deletable) await message.delete().catch(() => undefined);
  await message
    .reply(`❌ <@${message.author.id}>, tu mensaje fue eliminado por el **automod** (${violation}).`)
    .then((reply) => setTimeout(() => reply.delete().catch(() => undefined), 6000))
    .catch(() => undefined);
  return true;
}

// ─── Emojis Nitro (reenvío por webhook) ───

async function handleNitroRepost(message: Message, cfg: GuildConfig, prefix: string): Promise<void> {
  if (!cfg.nitro_repost_enabled || !message.guild || !message.content) return;
  if (cfg.nitro_repost_mode === 'manual') return;
  if (isNitroRoleExcluded(message.member, cfg.nitro_excluded_role_ids)) return;
  if (message.content.startsWith(prefix) || message.content.startsWith(`<@${message.client.user?.id}>`)) return;
  if (!hasExternalEmoji(message.content, message.guild.emojis.cache)) return;
  await sendNitroWebhook(message, message.content);
}

// ─── AFK ───

async function handleAfk(message: Message): Promise<void> {
  if (!message.guild) return;
  const afk = ciszubotSchema.afk;
  try {
    const own = await db
      .select({ reason: afk.reason, since: afk.since })
      .from(afk)
      .where(and(eq(afk.userId, message.author.id), eq(afk.guildId, message.guild.id)))
      .limit(1);
    if (own[0]) {
      await db.delete(afk).where(and(eq(afk.userId, message.author.id), eq(afk.guildId, message.guild.id)));
      await message
        .reply(`👋 ¡Bienvenido de vuelta, <@${message.author.id}>! Te quité tu AFK.`).catch(() => undefined);

      // Quitar rol de AFK + prefijo [AFK] del apodo.
      try {
        const cfg = await getGuildConfig(message.guild.id);
        const member = await message.guild.members.fetch(message.author.id).catch(() => null);
        if (member && member.manageable) {
          if (cfg.afk_role_id) {
            const role = message.guild.roles.cache.get(cfg.afk_role_id);
            if (role) await member.roles.remove(role).catch(() => undefined);
          }
          if (cfg.afk_prefix_enabled && member.nickname?.startsWith('[AFK]')) {
            const cleaned = member.nickname.replace(/^\[AFK\]\s*/, '');
            await member.setNickname(cleaned || null).catch(() => undefined);
          }
        }
      } catch {
        /* sin permisos */
      }
    }

    const mentions = message.mentions.users;
    if (mentions.size > 0) {
      for (const [userId] of mentions) {
        if (userId === message.author.id) continue;
        const target = await db
          .select({ reason: afk.reason, since: afk.since })
          .from(afk)
          .where(and(eq(afk.userId, userId), eq(afk.guildId, message.guild.id)))
          .limit(1);
        if (target[0]) {
          const since = target[0].since ? new Date(target[0].since) : new Date();
          await message
            .reply({
              content: `💤 **<@${userId}>** está AFK desde <t:${Math.floor(since.getTime() / 1000)}:R>:\n> ${target[0].reason ?? 'Sin razón especificada'}`,
            })
            .catch(() => undefined);
        }
      }
    }
  } catch (error) {
    logger.warn('handleAfk:', error);
  }
}

// ─── Logs del servidor ───

async function logEvent(guild: GuildMember['guild'], embed: EmbedBuilder): Promise<void> {
  const cfg = await getGuildConfig(guild.id);
  if (!cfg.logs_channel_id) return;
  const channel = guild.channels.cache.get(cfg.logs_channel_id) as TextChannel | undefined;
  if (channel) await channel.send({ embeds: [embed] }).catch(() => undefined);
}

// ─── Bienvenidas / despedidas / autoroles / contadores ───

async function handleWelcome(member: GuildMember | PartialGuildMember): Promise<void> {
  const guild = member.guild;
  if (!guild) return;
  const cfg = await getGuildConfig(guild.id);

  if (cfg.autorole_ids.length > 0) {
    for (const roleId of cfg.autorole_ids) {
      const role = guild.roles.cache.get(roleId);
      if (role && member.manageable) {
        await member.roles.add(role).catch(() => undefined);
      }
    }
  }

  if (cfg.welcome_channel_id) {
    const channel = guild.channels.cache.get(cfg.welcome_channel_id) as TextChannel | undefined;
    if (channel) {
      const text = (cfg.welcome_message ?? 'Bienvenido/a {user} a {guild}!')
        .replaceAll('{user}', `<@${member.id}>`)
        .replaceAll('{mention}', `<@${member.id}>`)
        .replaceAll('{guild}', guild.name)
        .replaceAll('{members}', String(guild.memberCount))
        .replaceAll('{username}', member.user.username);
      await channel.send(text).catch(() => undefined);
    }
  }

  await logEvent(
    guild,
    new EmbedBuilder()
      .setColor(BOT_COLORS.success)
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .setDescription(`📥 **Entrada:** <@${member.id}>`)
      .setFooter({ text: `Miembros: ${guild.memberCount}` })
      .setTimestamp(),
  );
}

async function handleGoodbye(member: GuildMember | PartialGuildMember): Promise<void> {
  const guild = member.guild;
  if (!guild) return;
  const cfg = await getGuildConfig(guild.id);
  if (cfg.goodbye_channel_id) {
    const channel = guild.channels.cache.get(cfg.goodbye_channel_id) as TextChannel | undefined;
    if (channel) {
      const text = (cfg.goodbye_message ?? 'Adiós {user}, que te vaya bien!')
        .replaceAll('{user}', member.user.username)
        .replaceAll('{username}', member.user.username)
        .replaceAll('{guild}', guild.name)
        .replaceAll('{members}', String(guild.memberCount));
      await channel.send(text).catch(() => undefined);
    }
  }
  await logEvent(
    guild,
    new EmbedBuilder()
      .setColor(BOT_COLORS.danger)
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .setDescription(`📤 **Salida:** ${member.user.tag}`)
      .setFooter({ text: `Miembros: ${guild.memberCount}` })
      .setTimestamp(),
  );
}

async function updateCounters(member: GuildMember | PartialGuildMember): Promise<void> {
  const guild = member.guild;
  if (!guild) return;
  const cfg = await getGuildConfig(guild.id);
  if (!cfg.counters || cfg.counters.length === 0) return;
  await guild.members.fetch().catch(() => undefined);

  const totals = {
    members: guild.memberCount,
    bots: guild.members.cache.filter((m) => m.user.bot).size,
    humans: guild.memberCount - guild.members.cache.filter((m) => m.user.bot).size,
    channels: guild.channels.cache.size,
    roles: guild.roles.cache.size,
    online: guild.members.cache.filter((m) => m.presence?.status !== 'offline').size,
  };

  for (const counter of cfg.counters) {
    const channel = guild.channels.cache.get(counter.channel_id) as TextChannel | undefined;
    if (!channel) continue;
    const value = totals[counter.type as keyof typeof totals] ?? 0;
    const name = channel.name.replace(/\d+.*$/, String(value));
    if (channel.name !== name) {
      await channel.setName(name).catch(() => undefined);
    }
  }
}

// ─── Invitaciones ───

const inviteCache = new Map<string, Map<string, number>>();

async function refreshInvites(client: Client, guildId: string): Promise<void> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
  const invites = await guild.invites.fetch().catch(() => null);
  if (!invites) return;
  const map = new Map<string, number>();
  for (const [code, invite] of invites) map.set(code, invite.uses ?? 0);
  inviteCache.set(guildId, map);
}

async function handleInviteJoin(member: GuildMember): Promise<void> {
  const guild = member.guild;
  const before = inviteCache.get(guild.id);
  if (!before) {
    await refreshInvites(member.client, guild.id);
    return;
  }
  const invites = await guild.invites.fetch().catch(() => null);
  if (!invites) return;

  let usedCode: string | null = null;
  let inviterId: string | null = null;
  for (const [code, invite] of invites) {
    const prev = before.get(code) ?? 0;
    if ((invite.uses ?? 0) > prev) {
      usedCode = code;
      inviterId = invite.inviter?.id ?? null;
      break;
    }
  }
  await refreshInvites(member.client, guild.id);
  if (!usedCode || !inviterId || inviterId === member.id) return;

  try {
    const cfg = await getGuildConfig(guild.id);
    const points = Math.max(1, cfg.invite_points_per);
    await db.insert(ciszubotSchema.invites).values({
      guildId: guild.id,
      inviterId,
      invitedId: member.id,
      code: usedCode,
      points,
    });

    const rows = await db
      .select({ total: ciszubotSchema.invites.points })
      .from(ciszubotSchema.invites)
      .where(and(eq(ciszubotSchema.invites.guildId, guild.id), eq(ciszubotSchema.invites.inviterId, inviterId)));
    const total = rows.reduce((sum, r) => sum + Number(r.total), 0);

    if (cfg.invite_channel_id && cfg.invite_message.trim()) {
      const channel = guild.channels.cache.get(cfg.invite_channel_id);
      if (channel?.isTextBased()) {
        const text = cfg.invite_message
          .replaceAll('{user}', `<@${member.id}>`)
          .replaceAll('{inviter}', `<@${inviterId}>`)
          .replaceAll('{count}', String(total))
          .replaceAll('{guild}', guild.name);
        await channel.send({ content: text.slice(0, 2000) }).catch(() => undefined);
      }
    }

    // Recompensas por umbral
    if (cfg.invite_rewards.length > 0) {
      const inviter = await guild.members.fetch(inviterId).catch(() => null);
      if (inviter) {
        for (const reward of cfg.invite_rewards) {
          if (total >= reward.invites) {
            const role = guild.roles.cache.get(reward.role_id);
            if (role && !inviter.roles.cache.has(role.id)) {
              await inviter.roles.add(role).catch(() => undefined);
            }
          }
        }
      }
    }
  } catch (error) {
    logger.warn('handleInviteJoin:', error);
  }
}

// ─── Starboard ───

async function handleStarboard(reactionMessage: Message | PartialMessage, add: boolean): Promise<void> {
  if (!reactionMessage.guild) return;
  const cfg = await getGuildConfig(reactionMessage.guild.id);
  if (!cfg.starboard_channel_id) return;

  const starReaction = reactionMessage.reactions.cache.get(cfg.starboard_emoji);
  const stars = starReaction?.count ?? 0;
  if (stars < cfg.starboard_min) return;
  if (!reactionMessage.author || reactionMessage.author.bot) return;

  const posts = ciszubotSchema.starboardPosts;
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.messageId, reactionMessage.id), eq(posts.guildId, reactionMessage.guild.id)))
    .limit(1);
  const existing = rows[0];
  const starboardChannel = reactionMessage.guild.channels.cache.get(cfg.starboard_channel_id) as TextChannel | undefined;
  if (!starboardChannel) return;

  const embed = new EmbedBuilder()
    .setColor('#fbbf24')
    .setAuthor({ name: reactionMessage.author.tag, iconURL: reactionMessage.author.displayAvatarURL() })
    .setDescription(reactionMessage.content?.slice(0, 4000) || '*Sin texto (adjunto)*')
    .addFields({ name: 'Original', value: `[Ir al mensaje](${reactionMessage.url})` })
    .setFooter({ text: `${cfg.starboard_emoji} ${stars}` })
    .setTimestamp(reactionMessage.createdAt);

  const image = reactionMessage.attachments?.first()?.url;
  if (image) embed.setImage(image);

  try {
    if (existing) {
      if (!add && stars < cfg.starboard_min) return;
      const starboardMessage = await starboardChannel.messages.fetch(existing.starboardMessageId).catch(() => null);
      if (starboardMessage) {
        await starboardMessage.edit({ embeds: [embed] });
        await db.update(posts).set({ stars }).where(and(eq(posts.messageId, reactionMessage.id), eq(posts.guildId, reactionMessage.guild.id)));
      }
      return;
    }
    const sent = await starboardChannel.send({ content: `<#${reactionMessage.channelId}>`, embeds: [embed] });
    await db.insert(posts).values({
      messageId: reactionMessage.id,
      guildId: reactionMessage.guild.id,
      channelId: reactionMessage.channelId,
      starboardMessageId: sent.id,
      stars,
    });
  } catch (error) {
    logger.warn('starboard:', error);
  }
}

// ─── Canales de voz privados ───

async function handlePrivateVcJoin(member: GuildMember, channelId: string): Promise<void> {
  const guild = member.guild;
  const cfg = await getGuildConfig(guild.id);
  if (!cfg.private_vc_hub_id || channelId !== cfg.private_vc_hub_id) return;

  try {
    const channel = await guild.channels.create({
      name: `🔒 ${member.user.username}`.slice(0, 90),
      type: ChannelType.GuildVoice,
      parent: cfg.private_category_id ?? undefined,
      userLimit: 0,
      permissionOverwrites: [
        { id: guild.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect] },
        { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.MoveMembers] },
      ],
    });
    await db.insert(ciszubotSchema.privateChannels).values({ channelId: channel.id, guildId: guild.id, ownerId: member.id });
    await member.voice.setChannel(channel).catch(() => undefined);
    await channel
      .send({
        content: `🔒 Canal privado de <@${member.id}>. Usa el panel o \`cz!privatevc rename/limit/delete\`.`,
        components: [
          {
            type: 1,
            components: [
              { type: 2, style: 2, label: 'Bloquear', custom_id: 'private_vc_lock' },
              { type: 2, style: 2, label: 'Ocultar', custom_id: 'private_vc_hide' },
              { type: 2, style: 4, label: 'Eliminar', custom_id: 'private_vc_delete' },
            ],
          },
        ],
      })
      .catch(() => undefined);
  } catch (error) {
    logger.warn('handlePrivateVcJoin:', error);
  }
}

async function handlePrivateVcLeave(channelId: string, client: Client): Promise<void> {
  const rows = await db
    .select()
    .from(ciszubotSchema.privateChannels)
    .where(eq(ciszubotSchema.privateChannels.channelId, channelId))
    .limit(1);
  const row = rows[0];
  if (!row) return;
  const guild = client.guilds.cache.get(row.guildId);
  const channel = guild?.channels.cache.get(channelId) as VoiceChannel | undefined;
  if (!guild || !channel) return;
  if (channel.members.size === 0) {
    await db.delete(ciszubotSchema.privateChannels).where(eq(ciszubotSchema.privateChannels.channelId, channelId));
    await channel.delete('Canal privado vacío').catch(() => undefined);
  }
}

// ─── Registro de listeners ───

export function registerListeners(client: Client): void {
  scheduleDrops(client);
  scheduleActions(client);

  // Auto-AFK: cada minuto, marca AFK a quienes no hablan desde hace X minutos
  // (config `afk_auto_minutes` por servidor). Solo vigila a miembros vistos
  // hablando desde el arranque del bot.
  setInterval(() => {
    void (async () => {
      for (const guild of client.guilds.cache.values()) {
        try {
          const cfg = await getGuildConfig(guild.id);
          if (!cfg.afk_auto_minutes || cfg.afk_auto_minutes <= 0) continue;
          const threshold = Date.now() - cfg.afk_auto_minutes * 60_000;
          for (const [key, ts] of [...lastActivity.entries()]) {
            const [guildId, userId] = key.split(':');
            if (guildId !== guild.id || ts > threshold) continue;
            lastActivity.delete(key);
            const afk = ciszubotSchema.afk;
            const rows = await db
              .select({ userId: afk.userId })
              .from(afk)
              .where(and(eq(afk.userId, userId), eq(afk.guildId, guildId)))
              .limit(1);
            if (rows[0]) continue; // ya está AFK
            await db.insert(afk).values({ userId, guildId, reason: 'AFK automático (inactividad)', since: new Date() });
            const member = await guild.members.fetch(userId).catch(() => null);
            if (member && member.manageable) {
              if (cfg.afk_role_id) {
                const role = guild.roles.cache.get(cfg.afk_role_id);
                if (role) await member.roles.add(role).catch(() => undefined);
              }
              if (cfg.afk_prefix_enabled && !member.nickname?.startsWith('[AFK]')) {
                await member.setNickname(`[AFK] ${member.displayName}`.slice(0, 32)).catch(() => undefined);
              }
            }
          }
        } catch {
          /* sin permisos / guild inaccesible */
        }
      }
    })();
  }, 60_000);

  client.on(Events.MessageCreate, (message) => {
    if (message.author.bot || !message.guild) return;
    void (async () => {
      const cfg = await getGuildConfig(message.guild!.id);

      // Canal de alianzas: captura y validación ANTES de todo lo demás.
      if (cfg.alliance_config.enabled && message.channelId === cfg.alliance_config.channel_id) {
        const result = await processAllianceMessage(
          client,
          message.guild!,
          message.member,
          {
            id: message.id,
            content: message.content ?? '',
            channelId: message.channelId,
            delete: () => message.delete(),
            authorId: message.author.id,
            authorTag: message.author.tag,
            iconURL: message.author.displayAvatarURL(),
          },
          cfg,
        );
        if (!result.ok) {
          await message.delete().catch(() => undefined);
          await sendAllianceError(message, cfg.alliance_config, result.reason ?? 'Alianza no válida', message.author.tag, message.author.displayAvatarURL());
        }
        return;
      }

      bumpMemberMessages(message.guild!.id, message.author.id);
      lastActivity.set(`${message.guild!.id}:${message.author.id}`, Date.now());
      if (await handleAutomod(message, cfg)) return;
      const prefix = await getPrefix(message.guild!.id);
      await handleNitroRepost(message, cfg, prefix);
      if (!message.content.startsWith(prefix) && !message.content.startsWith(`<@${client.user?.id}>`)) {
        void handleXp(message);
      }
      void handleAfk(message);
      void handleCounting(message, cfg);
      void handleTriviaMessage(client, message, cfg);
    })();
  });

  client.on(Events.MessageDelete, async (message) => {
    if (!message.guild || !message.author || message.author.bot) return;
    try {
      const snipes = ciszubotSchema.snipes;
      await db.insert(snipes).values({
        guildId: message.guild.id,
        channelId: message.channel.id,
        userId: message.author.id,
        content: message.content ?? null,
        attachment: message.attachments.first()?.url ?? null,
      });
      await logEvent(
        message.guild,
        new EmbedBuilder()
          .setColor(BOT_COLORS.danger)
          .setTitle('🗑️ Mensaje eliminado')
          .setDescription(
            `**Autor:** <@${message.author.id}>\n**Canal:** <#${message.channel.id}>\n**Contenido:** ${(message.content ?? '*adjunto*').slice(0, 1000)}`,
          )
          .setTimestamp(),
      );
    } catch (error) {
      logger.warn('snipes upsert:', error);
    }
  });

  client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    if (!newMessage.guild || !newMessage.author || newMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;
    await logEvent(
      newMessage.guild,
      new EmbedBuilder()
        .setColor('#fbbf24')
        .setTitle('✏️ Mensaje editado')
        .setDescription(
          `**Autor:** <@${newMessage.author.id}>\n**Canal:** <#${newMessage.channel.id}>\n` +
            `**Antes:** ${(oldMessage.content ?? '—').slice(0, 500)}\n**Después:** ${(newMessage.content ?? '—').slice(0, 500)}`,
        )
        .setTimestamp(),
    );
  });

  client.on(Events.MessageReactionAdd, (reaction) => {
    if (reaction.partial) {
      void reaction.fetch().then(() => handleStarboard(reaction.message, true)).catch(() => undefined);
      return;
    }
    void handleStarboard(reaction.message, true);
  });

  client.on(Events.MessageReactionRemove, (reaction) => {
    if (reaction.partial) {
      void reaction.fetch().then(() => handleStarboard(reaction.message, false)).catch(() => undefined);
      return;
    }
    void handleStarboard(reaction.message, false);
  });

  client.on(Events.GuildMemberAdd, (member) => {
    void handleWelcome(member);
    void updateCounters(member);
    void handleInviteJoin(member as GuildMember);
  });

  client.on(Events.GuildMemberRemove, (member) => {
    void handleGoodbye(member);
    void updateCounters(member);
  });

  client.on(Events.GuildBanAdd, (ban) => {
    void logEvent(
      ban.guild,
      new EmbedBuilder()
        .setColor(BOT_COLORS.danger)
        .setTitle('🔨 Usuario baneado')
        .setDescription(`**${ban.user.tag}** (\`${ban.user.id}\`)${ban.reason ? `\n**Razón:** ${ban.reason}` : ''}`)
        .setTimestamp(),
    );
  });

  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    const member = newState.member;
    if (member && !member.user.bot && newState.channelId && newState.channelId !== oldState.channelId) {
      void handlePrivateVcJoin(member, newState.channelId);
    }
    if (oldState.channelId && oldState.channelId !== newState.channelId) {
      setTimeout(() => void handlePrivateVcLeave(oldState.channelId!, client), 1500);
    }
  });

  client.on(Events.InviteCreate, (invite) => {
    if (!invite.guild) return;
    const map = inviteCache.get(invite.guild.id) ?? new Map<string, number>();
    map.set(invite.code, invite.uses ?? 0);
    inviteCache.set(invite.guild.id, map);
  });

  client.on(Events.InviteDelete, (invite) => {
    if (!invite.guild) return;
    inviteCache.get(invite.guild.id)?.delete(invite.code);
  });

  client.on(Events.GuildCreate, (guild) => {
    void resumeActiveGiveaways(guild);
    void refreshInvites(client, guild.id);
  });

  client.once(Events.ClientReady, (readyClient) => {
    for (const guild of readyClient.guilds.cache.values()) {
      void resumeActiveGiveaways(guild);
      void resumePolls(readyClient);
      void refreshInvites(readyClient, guild.id);
    }
  });
}

// ─── Botones de sistemas (tickets, canales privados, drops, matrimonio) ───

export async function handleButton(interaction: ButtonInteraction, client: Client): Promise<void> {
  const { customId } = interaction;
  const guild = interaction.guild;
  if (!guild) return;

  if (customId === 'ticket_create') {
    const cfg = await getGuildConfig(guild.id);
    if (!cfg.tickets_enabled) {
      await interaction.followUp({ content: '❌ Los tickets están desactivados en este servidor.', ephemeral: true }).catch(() => undefined);
      return;
    }
    try {
      const tickets = ciszubotSchema.botTickets;
      const openTickets = await db
        .select({ id: tickets.id })
        .from(tickets)
        .where(and(eq(tickets.guildId, guild.id), eq(tickets.userId, interaction.user.id), eq(tickets.open, true)))
        .limit(1);
      if (openTickets[0]) {
        await interaction.followUp({ content: '❌ Ya tienes un ticket abierto.', ephemeral: true }).catch(() => undefined);
        return;
      }

      const channel = await guild.channels.create({
        name: `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        type: ChannelType.GuildText,
        parent: cfg.tickets_category_id ?? undefined,
        topic: `Ticket de ${interaction.user.tag}`,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
          ...(cfg.tickets_role_id ? [{ id: cfg.tickets_role_id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }] : []),
          { id: client.user!.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
        ],
      });

      await db.insert(ciszubotSchema.botTickets).values({
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        guildId: guild.id,
        channelId: channel.id,
        userId: interaction.user.id,
        topic: `Ticket de ${interaction.user.tag}`,
        open: true,
      });

      const embed = new EmbedBuilder()
        .setColor('#00d4ff')
        .setTitle('🎫 Nuevo ticket')
        .setDescription('El equipo te atenderá pronto. Pulsa el botón para cerrar el ticket.')
        .setFooter({ text: 'CiszuBot • Tickets' })
        .setTimestamp();
      await channel.send({
        content: `<@${interaction.user.id}> ${cfg.tickets_role_id ? `<@&${cfg.tickets_role_id}>` : ''}`,
        embeds: [embed],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 4,
                label: 'Cerrar ticket',
                custom_id: 'ticket_close',
              },
            ],
          },
        ],
      });

      await interaction.followUp({ content: `✅ Ticket creado en <#${channel.id}>`, ephemeral: true }).catch(() => undefined);
    } catch (error) {
      logger.error('ticket_create:', error);
      await interaction.followUp({ content: '❌ No se pudo crear el ticket.', ephemeral: true }).catch(() => undefined);
    }
  }

  if (customId === 'ticket_close') {
    await handleTicketClose(interaction);
  }

  if (customId === 'ticket_claim') {
    await handleTicketClaim(interaction);
  }

  if (customId === 'private_channel_join') {
    const cfg = await getGuildConfig(guild.id);
    if (!cfg.private_channels) {
      await interaction.followUp({ content: '❌ Los canales privados están desactivados.', ephemeral: true }).catch(() => undefined);
      return;
    }
    try {
      const channel = await guild.channels.create({
        name: `privado-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        type: ChannelType.GuildText,
        parent: cfg.private_category_id ?? undefined,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
          { id: client.user!.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
        ],
      });
      await channel.send({
        content: `🔒 Canal privado para <@${interaction.user.id}>. Cierra el canal con **cz!closeprivate** o ciérralo manualmente.`,
      });
      await interaction.followUp({ content: `✅ Canal privado creado: <#${channel.id}>`, ephemeral: true }).catch(() => undefined);
    } catch (error) {
      logger.error('private_channel_join:', error);
    }
  }

  // ─── Giveaways (botón de ingreso) ───
  if (customId.startsWith('giveaway_join:')) {
    const giveawayId = customId.slice('giveaway_join:'.length);
    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
      await interaction.followUp({ content: '❌ No pude verificar tu membresía.', ephemeral: true }).catch(() => undefined);
      return;
    }
    const result = await joinGiveaway(guild, giveawayId, member);
    await interaction
      .followUp({
        content: result.ok
          ? `🎉 ¡Estás dentro! Tienes **${result.entries}** entrada(s). ¡Suerte!`
          : `❌ ${result.reason ?? 'No se pudo participar.'}`,
        ephemeral: true,
      })
      .catch(() => undefined);
    return;
  }

  // ─── Sugerencias (votos con toggle) ───
  if (customId.startsWith('sug_up:') || customId.startsWith('sug_down:')) {
    const dir = customId.startsWith('sug_up:') ? 'up' : 'down';
    const id = parseInt(customId.split(':')[1] ?? '', 10);
    const result = await voteSuggestion(client, id, interaction.user.id, dir);
    await interaction
      .followUp({
        content: result.ok
          ? `✅ Voto registrado (👍 ${result.up} · 👎 ${result.down})` + (result.mine ? ` — tu voto: ${result.mine === 'up' ? '👍 a favor' : '👎 en contra'}` : ' — retiraste tu voto')
          : `❌ ${result.reason ?? 'No se pudo votar.'}`,
        ephemeral: true,
      })
      .catch(() => undefined);
    return;
  }

  // ─── Encuestas (votos y cierre) ───
  if (customId.startsWith('poll_vote:')) {
    const parts = customId.split(':');
    const id = parseInt(parts[1] ?? '', 10);
    const idx = parseInt(parts[2] ?? '', 10);
    const result = await votePoll(client, id, interaction.user.id, idx);
    await interaction
      .followUp({
        content: result.ok ? (result.changed ? '✅ Voto cambiado.' : '✅ Voto registrado.') : `❌ ${result.reason ?? 'No se pudo votar.'}`,
        ephemeral: true,
      })
      .catch(() => undefined);
    return;
  }
  if (customId.startsWith('poll_close:')) {
    const id = parseInt(customId.split(':')[1] ?? '', 10);
    const staff = Boolean(interaction.memberPermissions?.has('ManageGuild'));
    const result = await closePoll(client, id, { id: interaction.user.id, staff });
    await interaction
      .followUp({ content: result.ok ? '🔒 Encuesta cerrada.' : `❌ ${result.reason ?? 'No se pudo cerrar.'}`, ephemeral: true })
      .catch(() => undefined);
    return;
  }

  // ─── Drops ───
  if (customId === 'drop_claim') {
    const memberRoles = interaction.member && 'roles' in interaction.member
      ? [...(interaction.member.roles as { cache: Map<string, unknown> }).cache.keys()]
      : [];
    const result = await tryClaimDrop(guild.id, interaction.message.id, interaction.user.id, memberRoles);
    if (!result.ok) {
      await interaction.followUp({ content: `❌ ${result.reason ?? 'No se pudo reclamar.'}`, ephemeral: true }).catch(() => undefined);
      return;
    }
    completeDrop(guild.id);
    const cfg = await getGuildConfig(guild.id);
    await interaction.message
      .edit({
        embeds: [
          new EmbedBuilder()
            .setColor('#22c55e')
            .setTitle('💎 ¡Drop reclamado!')
            .setDescription(`<@${interaction.user.id}> se llevó **${(result.amount ?? 0).toLocaleString('es-ES')} ${cfg.coin_emoji}**.`)
            .setTimestamp(),
        ],
        components: [],
      })
      .catch(() => undefined);
  }

  // ─── Matrimonio ───
  if (customId === 'marry_accept' || customId === 'marry_decline') {
    const proposal = takeProposal(interaction.user.id, guild.id);
    if (!proposal) {
      await interaction.followUp({ content: '❌ Esta propuesta ya expiró.', ephemeral: true }).catch(() => undefined);
      return;
    }
    if (customId === 'marry_decline') {
      await interaction.message.edit({
        embeds: [
          new EmbedBuilder()
            .setColor('#6b7280')
            .setTitle('💔 Propuesta rechazada')
            .setDescription(`**${proposal.proposerTag}** se quedó con el corazón roto...`)
            .setTimestamp(),
        ],
        components: [],
      }).catch(() => undefined);
      return;
    }
    await db.insert(ciszubotSchema.marriages).values({
      guildId: guild.id,
      userId: proposal.proposer,
      partnerId: interaction.user.id,
      active: true,
    });
    await interaction.message.edit({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff69b4')
          .setTitle('💍 ¡Boda!')
          .setDescription(`<@${proposal.proposer}> y <@${interaction.user.id}> ahora están casados. ¡Felicidades! 🎉`)
          .setTimestamp(),
      ],
      components: [],
    }).catch(() => undefined);
  }

  // ─── Canales de voz privados (panel) ───
  if (customId.startsWith('private_vc_')) {
    const rows = await db
      .select()
      .from(ciszubotSchema.privateChannels)
      .where(eq(ciszubotSchema.privateChannels.channelId, interaction.channelId))
      .limit(1);
    const row = rows[0];
    if (!row) {
      await interaction.followUp({ content: '❌ Este canal no es un canal privado gestionado.', ephemeral: true }).catch(() => undefined);
      return;
    }
    const isOwner = row.ownerId === interaction.user.id;
    const isAdmin = 'permissions' in interaction.member! && (interaction.member!.permissions as { has(p: bigint): boolean }).has(PermissionsBitField.Flags.ManageChannels);
    if (!isOwner && !isAdmin) {
      await interaction.followUp({ content: '❌ Solo el dueño del canal puede usar el panel.', ephemeral: true }).catch(() => undefined);
      return;
    }
    const channel = guild.channels.cache.get(interaction.channelId);
    if (!channel || channel.type !== ChannelType.GuildVoice) return;
    const voice = channel as VoiceChannel;

    if (customId === 'private_vc_lock' || customId === 'private_vc_hide') {
      const currentlyDenied =
        customId === 'private_vc_lock'
          ? voice.permissionOverwrites.cache.get(guild.id)?.deny.has(PermissionsBitField.Flags.Connect)
          : voice.permissionOverwrites.cache.get(guild.id)?.deny.has(PermissionsBitField.Flags.ViewChannel);
      if (customId === 'private_vc_lock') {
        await voice.permissionOverwrites.edit(guild.id, { Connect: currentlyDenied ? null : false });
      } else {
        await voice.permissionOverwrites.edit(guild.id, { ViewChannel: currentlyDenied ? null : false });
      }
      await interaction.followUp({
        content: currentlyDenied ? '✅ Canal desbloqueado/visible.' : '✅ Canal bloqueado/oculto.',
        ephemeral: true,
      }).catch(() => undefined);
      return;
    }

    if (customId === 'private_vc_delete') {
      await db.delete(ciszubotSchema.privateChannels).where(eq(ciszubotSchema.privateChannels.channelId, channel.id));
      await interaction.followUp({ content: '🔒 Eliminando canal...', ephemeral: true }).catch(() => undefined);
      await voice.delete('Canal privado eliminado por su dueño').catch(() => undefined);
    }
  }
}
