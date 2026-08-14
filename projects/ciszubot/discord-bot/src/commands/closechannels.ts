import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import type { BotCommand } from '../types/command';
import { db, ciszubotSchema, eq, and } from '../services/supabase';

const closePrivate = (): BotCommand => ({
  name: 'closeprivate',
  description: 'Cierra tu canal privado',
  aliases: ['cerrarprivado'],
  usage: 'cz!closeprivate',
  category: 'Social',
  slashCommand: new SlashCommandBuilder().setName('closeprivate').setDescription('Cierra tu canal privado'),
  async execute(message) {
    if (!message.guild || !message.channel) return;
    const channel = message.channel as never as { id: string; name: string; deletable: boolean; delete(reason?: string): Promise<unknown> };
    if (!channel.name.startsWith('privado-')) {
      await message.reply('❌ Este comando solo funciona en canales privados de CiszuBot.');
      return;
    }
    await message.reply('🔒 Cerrando tu canal privado...').catch(() => undefined);
    setTimeout(() => {
      if (channel.deletable) void channel.delete('Canal privado cerrado');
    }, 1500);
  },
});

const closeChannel = (): BotCommand => ({
  name: 'close',
  description: 'Cierra el canal actual (tickets y canales gestionados)',
  aliases: ['cerrarcanal'],
  usage: 'cz!close',
  category: 'Moderación',
  permissions: [PermissionFlagsBits.ManageChannels],
  slashCommand: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Cierra el canal actual')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(message) {
    if (!message.guild || !message.channel) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Canales**.');
      return;
    }
    const channelId = (message.channel as never as { id: string }).id;
    const tickets = ciszubotSchema.botTickets;
    const ticketRows = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(and(eq(tickets.channelId, channelId), eq(tickets.open, true)))
      .limit(1);
    const ticket = ticketRows[0];
    if (ticket) {
      await db.update(tickets).set({ open: false }).where(eq(tickets.id, ticket.id));
    }
    await message.reply('🔒 Cerrando canal...').catch(() => undefined);
    setTimeout(() => {
      const ch = message.guild?.channels.cache.get(channelId);
      if (ch && 'deletable' in ch && ch.deletable) void ch.delete('Canal cerrado');
    }, 1500);
  },
});

export default [closePrivate, closeChannel];
