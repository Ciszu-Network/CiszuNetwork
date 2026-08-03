import {
  Client,
  Events,
  GuildMember,
  PartialGuildMember,
  Message,
  PermissionsBitField,
  TextChannel,
  ChannelType,
  EmbedBuilder,
  ButtonInteraction,
} from 'discord.js';
import { getGuildConfig, getPrefix } from '../services/configService';
import { addXp } from '../services/levels';
import { getSupabase } from '../services/supabase';
import { logger } from '../services/logger';
import { resumeActiveGiveaways } from '../services/giveaways';

/**
 * Listeners del bot: XP/niveles, snipe, AFK, bienvenidas, autoroles,
 * contadores de canales, tickets y giveaways.
 */

const xpCooldowns = new Map<string, number>();
const XP_AMOUNT = 25;
const XP_COOLDOWN_MS = 60_000;

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
  if (result?.leveledUp) {
    const embed = new EmbedBuilder()
      .setColor('#ff33cc')
      .setTitle(`🎉 ¡Subiste de nivel ${result.level}!`)
      .setDescription(`Has alcanzado el **nivel ${result.level}** en **${message.guild.name}**.`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    if (cfg.level_channel_id) {
      const channel = message.guild.channels.cache.get(cfg.level_channel_id) as TextChannel | undefined;
      if (channel) {
        await channel.send({ content: `<@${message.author.id}>`, embeds: [embed] }).catch(() => undefined);
        return;
      }
    }
    await message.reply({ embeds: [embed] }).catch(() => undefined);
  }
}

async function handleAfk(message: Message): Promise<void> {
  if (!message.guild) return;
  const db = getSupabase();
  try {
    // Quitar AFK propio si habla
    const { data: own } = await db.from('afk').select('reason, since').eq('user_id', message.author.id).eq('guild_id', message.guild.id).maybeSingle();
    if (own) {
      await db.from('afk').delete().eq('user_id', message.author.id).eq('guild_id', message.guild.id);
      await message
        .reply(`👋 ¡Bienvenido de vuelta, <@${message.author.id}>! Te quité tu AFK.`).catch(() => undefined);
    }

    // Avisar si menciona a alguien con AFK
    const mentions = message.mentions.users;
    if (mentions.size > 0) {
      for (const [userId] of mentions) {
        if (userId === message.author.id) continue;
        const { data: target } = await db
          .from('afk')
          .select('reason, since')
          .eq('user_id', userId)
          .eq('guild_id', message.guild.id)
          .maybeSingle();
        if (target) {
          const since = target.since ? new Date(target.since) : new Date();
          await message
            .reply({
              content: `💤 **<@${userId}>** está AFK desde <t:${Math.floor(since.getTime() / 1000)}:R>:\n> ${target.reason ?? 'Sin razón especificada'}`,
            })
            .catch(() => undefined);
        }
      }
    }
  } catch (error) {
    logger.warn('handleAfk:', error);
  }
}

async function handleWelcome(member: GuildMember | PartialGuildMember): Promise<void> {
  const guild = member.guild;
  if (!guild) return;
  const cfg = await getGuildConfig(guild.id);

  // Autorol
  if (cfg.autorole_ids.length > 0) {
    for (const roleId of cfg.autorole_ids) {
      const role = guild.roles.cache.get(roleId);
      if (role && member.manageable) {
        await member.roles.add(role).catch(() => undefined);
      }
    }
  }

  // Mensaje de bienvenida
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
        .replaceAll('{guild}', guild.name)
        .replaceAll('{members}', String(guild.memberCount));
      await channel.send(text).catch(() => undefined);
    }
  }
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

export function registerListeners(client: Client): void {
  client.on(Events.MessageCreate, (message) => {
    if (message.author.bot || !message.guild) return;
    void getPrefix(message.guild.id).then((prefix) => {
      if (!message.content.startsWith(prefix) && !message.content.startsWith(`<@${client.user?.id}>`)) {
        void handleXp(message);
      }
    });
    void handleAfk(message);
  });

  client.on(Events.MessageDelete, async (message) => {
    if (!message.guild || !message.author || message.author.bot) return;
    try {
      const db = getSupabase();
      await db.from('snipes').upsert({
        guild_id: message.guild.id,
        channel_id: message.channel.id,
        user_id: message.author.id,
        content: message.content ?? null,
        attachment: message.attachments.first()?.url ?? null,
        deleted_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn('snipes upsert:', error);
    }
  });

  client.on(Events.GuildMemberAdd, (member) => {
    void handleWelcome(member);
    void updateCounters(member);
  });

  client.on(Events.GuildMemberRemove, (member) => {
    void handleGoodbye(member);
    void updateCounters(member);
  });

  client.on(Events.GuildCreate, (guild) => {
    void resumeActiveGiveaways(guild);
  });

  client.once(Events.ClientReady, (readyClient) => {
    for (const guild of readyClient.guilds.cache.values()) {
      void resumeActiveGiveaways(guild);
    }
  });
}

// ─── Botones de sistemas (tickets, canales privados) ───

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
      const db = getSupabase();
      const { data: open } = await db.from('tickets').select('id').eq('guild_id', guild.id).eq('user_id', interaction.user.id).eq('open', true).maybeSingle();
      if (open) {
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

      await db.from('tickets').insert({
        guild_id: guild.id,
        channel_id: channel.id,
        user_id: interaction.user.id,
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
    try {
      const db = getSupabase();
      const { data: ticket } = await db.from('tickets').select('*').eq('channel_id', interaction.channelId).eq('open', true).maybeSingle();
      if (ticket) {
        await db.from('tickets').update({ open: false }).eq('id', ticket.id);
      }
      await interaction.followUp({ content: '🔒 Cerrando ticket...' }).catch(() => undefined);
      setTimeout(() => {
        const channel = guild.channels.cache.get(interaction.channelId);
        if (channel && 'deletable' in channel && channel.deletable) {
          void channel.delete('Ticket cerrado').catch(() => undefined);
        }
      }, 2000);
    } catch (error) {
      logger.error('ticket_close:', error);
    }
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
}
