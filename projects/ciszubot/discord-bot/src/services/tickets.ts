import {
  ButtonInteraction,
  ChannelType,
  EmbedBuilder,
  Guild,
  GuildMember,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionsBitField,
  StringSelectMenuInteraction,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
  User,
} from 'discord.js';
import { db, ciszubotSchema, eq, and } from './supabase';
import { getGuildConfig, TicketCategory, TicketConfig } from './configService';
import { logger } from './logger';

/**
 * Sistema de tickets por categorías (estilo Ticket Tool): panel con selector,
 * formularios opcionales (modales), canales privados con permisos por
 * categoría, rol al abrir, reclamar/cerrar con registro y auto-borrado.
 */

/** Selector de categorías del panel (máx. 25). */
export function panelComponents(config: TicketConfig) {
  const options = config.categories.slice(0, 25).map((cat) => ({
    label: cat.label.slice(0, 100),
    value: cat.id,
    description: cat.description.slice(0, 100) || undefined,
    emoji: cat.emoji || undefined,
  }));
  if (options.length === 0) return [];
  return [
    {
      type: 1,
      components: [{ type: 3, custom_id: 'ticket_open', placeholder: '📩 Abrir un ticket…', options }],
    },
  ];
}

export function panelEmbed(config: TicketConfig): EmbedBuilder {
  const list = config.categories.map((c) => `${c.emoji || '🎫'} **${c.label}**${c.description ? ` — ${c.description}` : ''}`).join('\n');
  return new EmbedBuilder()
    .setColor('#00d4ff')
    .setTitle('🎫 Centro de soporte')
    .setDescription(`Selecciona una categoría para abrir tu ticket:\n\n${list || 'Sin categorías configuradas.'}`)
    .setFooter({ text: 'CiszuBot • Tickets' })
    .setTimestamp();
}

export function findCategory(config: TicketConfig, id: string): TicketCategory | null {
  return config.categories.find((c) => c.id === id) ?? null;
}

/** Paso 1: el usuario elige categoría → modal (si tiene formulario) o creación directa. */
export async function handleTicketOpen(interaction: StringSelectMenuInteraction): Promise<void> {
  const guild = interaction.guild;
  if (!guild) return;
  const cfg = await getGuildConfig(guild.id);
  if (!cfg.ticket_config.enabled) {
    await interaction.followUp({ content: '❌ Los tickets están desactivados.', ephemeral: true }).catch(() => undefined);
    return;
  }
  const category = findCategory(cfg.ticket_config, interaction.values[0]);
  if (!category) {
    await interaction.followUp({ content: '❌ Categoría no válida.', ephemeral: true }).catch(() => undefined);
    return;
  }

  if (category.form.length > 0) {
    const modal = new ModalBuilder().setCustomId(`ticket_form:${category.id}`).setTitle(category.label.slice(0, 45));
    for (const [i, question] of category.form.slice(0, 5).entries()) {
      modal.addComponents(
        new (require('discord.js').ActionRowBuilder)().addComponents(
          new TextInputBuilder()
            .setCustomId(`q${i}`)
            .setLabel(question.slice(0, 45))
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500),
        ),
      );
    }
    await interaction.showModal(modal);
    return;
  }

  await createTicket(guild, interaction.user, interaction.member as GuildMember | null, category, null, cfg.ticket_config);
  await interaction.followUp({ content: `✅ Ticket creado. Revisa <#${interaction.channelId}> o tus canales.`, ephemeral: true }).catch(() => undefined);
}

/** Paso 2 (si hay formulario): se envían las respuestas y se crea el ticket. */
export async function handleTicketForm(interaction: ModalSubmitInteraction): Promise<void> {
  const guild = interaction.guild;
  if (!guild) return;
  const categoryId = interaction.customId.slice('ticket_form:'.length);
  const cfg = await getGuildConfig(guild.id);
  const category = findCategory(cfg.ticket_config, categoryId);
  if (!category) {
    await interaction.reply({ content: '❌ Categoría no válida.', ephemeral: true }).catch(() => undefined);
    return;
  }
  const answers = category.form.slice(0, 5).map((question, i) => ({
    question,
    answer: interaction.fields.getTextInputValue(`q${i}`),
  }));
  await interaction.deferReply({ ephemeral: true });
  const channel = await createTicket(guild, interaction.user, interaction.member as GuildMember | null, category, answers, cfg.ticket_config);
  await interaction.editReply({
    content: channel ? `✅ Ticket creado en <#${channel.id}>.` : '❌ No se pudo crear el ticket (revisa los permisos del bot).',
  }).catch(() => undefined);
}

/** Crea el canal privado del ticket con permisos por categoría. */
export async function createTicket(
  guild: Guild,
  user: User,
  member: GuildMember | null,
  category: TicketCategory,
  answers: Array<{ question: string; answer: string }> | null,
  config: TicketConfig,
): Promise<TextChannel | null> {
  try {
    const tickets = ciszubotSchema.botTickets;
    const open = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(and(eq(tickets.guildId, guild.id), eq(tickets.userId, user.id), eq(tickets.open, true)))
      .limit(1);
    if (open[0]) return null;

    const permissionOverwrites = [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      {
        id: user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.AttachFiles,
        ],
      },
      ...category.role_ids.map((roleId) => ({
        id: roleId,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.ManageMessages,
        ],
      })),
      {
        id: guild.members.me!.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ManageChannels,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
    ];

    const channel = await guild.channels.create({
      name: `${category.emoji || '🎫'}-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)}`.slice(0, 90),
      type: ChannelType.GuildText,
      parent: category.discord_category_id ?? undefined,
      topic: `Ticket de ${user.tag} · ${category.label}`,
      permissionOverwrites,
    });

    await db.insert(tickets).values({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      guildId: guild.id,
      channelId: channel.id,
      userId: user.id,
      topic: `Ticket de ${user.tag} · ${category.label}`,
      open: true,
      category: category.id,
      answers: answers ?? null,
    });

    if (category.grant_role_id && member) {
      const role = guild.roles.cache.get(category.grant_role_id);
      if (role && member.manageable) await member.roles.add(role).catch(() => undefined);
    }

    const embed = new EmbedBuilder()
      .setColor((category.color || '#00d4ff') as `#${string}`)
      .setTitle(`${category.emoji || '🎫'} ${category.label}`)
      .setDescription(
        (category.welcome || '¡Hola {user}! El equipo te atenderá pronto.')
          .replaceAll('{user}', `<@${user.id}>`)
          .replaceAll('{username}', user.username),
      )
      .setFooter({ text: 'CiszuBot • Tickets' })
      .setTimestamp();
    if (answers && answers.length > 0) {
      for (const entry of answers.slice(0, 5)) {
        embed.addFields({ name: entry.question.slice(0, 256), value: entry.answer.slice(0, 1024) || '—' });
      }
    }

    await channel.send({
      content: `<@${user.id}> ${category.role_ids.map((r) => `<@&${r}>`).join(' ')}`.trim(),
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            { type: 2, style: 1, label: 'Reclamar', custom_id: 'ticket_claim' },
            { type: 2, style: 4, label: 'Cerrar', custom_id: 'ticket_close' },
          ],
        },
      ],
    });

    return channel;
  } catch (error) {
    logger.error('createTicket:', error);
    return null;
  }
}

/** Reclama el ticket (lo marca como atendido por el staff que pulsa). */
export async function handleTicketClaim(interaction: ButtonInteraction): Promise<void> {
  const guild = interaction.guild;
  if (!guild) return;
  const tickets = ciszubotSchema.botTickets;
  const rows = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.channelId, interaction.channelId), eq(tickets.open, true)))
    .limit(1);
  const ticket = rows[0];
  if (!ticket) {
    await interaction.followUp({ content: '❌ Este canal no es un ticket abierto.', ephemeral: true }).catch(() => undefined);
    return;
  }
  if (ticket.claimedBy) {
    await interaction.followUp({ content: `❌ Ya lo reclamó <@${ticket.claimedBy}>.`, ephemeral: true }).catch(() => undefined);
    return;
  }
  await db.update(tickets).set({ claimedBy: interaction.user.id }).where(eq(tickets.id, ticket.id));
  const claimChannel = interaction.channel as TextChannel | null;
  await claimChannel
    ?.send({ content: `🙋 <@${interaction.user.id}> se encargará de este ticket.` })
    .catch(() => undefined);
}

/** Cierra el ticket: registra, avisa en el canal de logs y borra el canal. */
export async function handleTicketClose(interaction: ButtonInteraction): Promise<void> {
  const guild = interaction.guild;
  if (!guild) return;
  try {
    const tickets = ciszubotSchema.botTickets;
    const rows = await db
      .select()
      .from(tickets)
      .where(and(eq(tickets.channelId, interaction.channelId), eq(tickets.open, true)))
      .limit(1);
    const ticket = rows[0];
    const cfg = await getGuildConfig(guild.id);

    if (ticket) {
      await db
        .update(tickets)
        .set({ open: false, closedBy: interaction.user.id, closedAt: new Date() })
        .where(eq(tickets.id, ticket.id));
    }

    const logChannelId = cfg.ticket_config.log_channel_id;
    if (logChannelId && ticket) {
      const logChannel = guild.channels.cache.get(logChannelId) as TextChannel | undefined;
      if (logChannel) {
        const category = ticket.category ? findCategory(cfg.ticket_config, ticket.category) : null;
        await logChannel
          .send({
            embeds: [
              new EmbedBuilder()
                .setColor('#ef4444')
                .setTitle('🎫 Ticket cerrado')
                .setDescription(
                  `**Usuario:** <@${ticket.userId}>\n**Cerrado por:** <@${interaction.user.id}>\n` +
                    `**Categoría:** ${category ? `${category.emoji} ${category.label}` : '—'}\n**Canal:** #${(interaction.channel as TextChannel | null)?.name ?? '—'}`,
                )
                .setFooter({ text: 'CiszuBot • Tickets' })
                .setTimestamp(),
            ],
          })
          .catch(() => undefined);
      }
    }

    await interaction.followUp({ content: '🔒 Cerrando ticket...' }).catch(() => undefined);
    setTimeout(() => {
      const channel = guild.channels.cache.get(interaction.channelId);
      if (channel && 'deletable' in channel && channel.deletable) {
        void channel.delete('Ticket cerrado').catch(() => undefined);
      }
    }, 3000);
  } catch (error) {
    logger.error('handleTicketClose:', error);
  }
}
