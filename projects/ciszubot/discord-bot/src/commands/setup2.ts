import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import type { BotCommand } from '../types/command';
import { updateGuildConfig, getGuildConfig } from '../services/configService';

const setupTickets = (): BotCommand => ({
  name: 'setuptickets',
  description: 'Configura el sistema de tickets (canal de soporte + categoría + rol)',
  aliases: ['tickets'],
  usage: 'cz!setuptickets <#canal> [categoría] [@rol]  |  off para desactivar',
  category: 'Configuración',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('setuptickets')
    .setDescription('Configura el sistema de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((o) => o.setName('canal').setDescription('Canal donde crear el panel').setRequired(true))
    .addChannelOption((o) => o.setName('categoria').setDescription('Categoría para los tickets').setRequired(false))
    .addRoleOption((o) => o.setName('rol').setDescription('Rol de soporte').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    if (args[0]?.toLowerCase() === 'off') {
      await updateGuildConfig(message.guild.id, { tickets_enabled: false });
      await message.reply('✅ Tickets desactivados.');
      return;
    }
    const channel = message.mentions?.channels?.first() ?? message.guild.channels.cache.get(args[0] ?? '');
    if (!channel || channel.type !== 0) {
      await message.reply('❌ Menciona un canal de texto: `cz!setuptickets #canal [categoría] [@rol]`');
      return;
    }
    const category = message.mentions?.channels?.find?.((c) => c.type === 4);
    const role = message.mentions?.roles?.first();

    await updateGuildConfig(message.guild.id, {
      tickets_enabled: true,
      tickets_category_id: category?.id ?? null,
      tickets_role_id: role?.id ?? null,
    });

    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('🎫 Sistema de Tickets')
      .setDescription('Pulsa el botón para abrir un ticket de soporte.')
      .setFooter({ text: 'CiszuBot • Tickets' })
      .setTimestamp();
    await channel?.send?.({
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 1,
              label: 'Abrir ticket',
              emoji: { name: '🎫' },
              custom_id: 'ticket_create',
            },
          ],
        },
      ],
    });
    await message.reply(`✅ Sistema de tickets activado en <#${channel.id}>.`);
  },
});

const setupLeveling = (): BotCommand => ({
  name: 'setupleveling',
  description: 'Activa/desactiva el sistema de niveles (on/off [canal])',
  aliases: ['leveling', 'niveles'],
  usage: 'cz!setupleveling <on|off> [#canal]',
  category: 'Configuración',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('setupleveling')
    .setDescription('Activa/desactiva el sistema de niveles')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) =>
      o
        .setName('estado')
        .setDescription('on/off')
        .addChoices({ name: 'Activar', value: 'on' }, { name: 'Desactivar', value: 'off' })
        .setRequired(true)
    )
    .addChannelOption((o) => o.setName('canal').setDescription('Canal de anuncios de nivel (opcional)').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    const state = (args[0] ?? '').toLowerCase();
    if (state !== 'on' && state !== 'off') {
      await message.reply('❌ Uso: `cz!setupleveling <on|off> [#canal]`');
      return;
    }
    const channel = message.mentions?.channels?.first();
    const patch = { leveling_enabled: state === 'on', level_channel_id: channel ? channel.id : (await getGuildConfig(message.guild.id)).level_channel_id };
    await updateGuildConfig(message.guild.id, patch);
    await message.reply(
      state === 'on'
        ? `✅ Niveles activados${channel ? ` con anuncios en <#${channel.id}>` : ''}. Gana XP hablando en el chat!`
        : '✅ Niveles desactivados.'
    );
  },
});

const setupPrivateChannels = (): BotCommand => ({
  name: 'setupprivate',
  description: 'Activa canales privados por botón (on/off [categoría])',
  aliases: ['privatechannels', 'canalesprivados'],
  usage: 'cz!setupprivate <on|off> [#canal-panel] [categoría]',
  category: 'Configuración',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('setupprivate')
    .setDescription('Activa canales privados por botón')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) =>
      o
        .setName('estado')
        .setDescription('on/off')
        .addChoices({ name: 'Activar', value: 'on' }, { name: 'Desactivar', value: 'off' })
        .setRequired(true)
    )
    .addChannelOption((o) => o.setName('panel').setDescription('Canal donde poner el panel').setRequired(false)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    const state = (args[0] ?? '').toLowerCase();
    if (state !== 'on' && state !== 'off') {
      await message.reply('❌ Uso: `cz!setupprivate <on|off> [#canal-panel] [categoría]`');
      return;
    }
    const panel = message.mentions?.channels?.find?.((c) => c.type === 0);
    const category = message.mentions?.channels?.find?.((c) => c.type === 4);

    await updateGuildConfig(message.guild.id, {
      private_channels: state === 'on',
      private_category_id: category?.id ?? null,
    });

    if (state === 'on' && panel) {
      const embed = new EmbedBuilder()
        .setColor('#ff33cc')
        .setTitle('🔒 Canales Privados')
        .setDescription('Pulsa el botón para crear tu canal privado.')
        .setFooter({ text: 'CiszuBot • Canales Privados' })
        .setTimestamp();
      await panel?.send?.({
        embeds: [embed],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 1,
                label: 'Crear canal privado',
                emoji: { name: '🔒' },
                custom_id: 'private_channel_join',
              },
            ],
          },
        ],
      });
    }
    await message.reply(state === 'on' ? '✅ Canales privados activados.' : '✅ Canales privados desactivados.');
  },
});

const setupLogs = (): BotCommand => ({
  name: 'setuplogs',
  description: 'Configura el canal de logs del servidor',
  aliases: ['logs', 'logschannel'],
  usage: 'cz!setuplogs <#canal|off>',
  category: 'Configuración',
  permissions: [PermissionFlagsBits.ManageGuild],
  slashCommand: new SlashCommandBuilder()
    .setName('setuplogs')
    .setDescription('Configura el canal de logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((o) => o.setName('canal').setDescription('Canal de logs').setRequired(true)),
  async execute(message, args) {
    if (!message.guild) return;
    if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await message.reply('❌ Necesitas permiso de **Gestionar Servidor**.');
      return;
    }
    if (args[0]?.toLowerCase() === 'off') {
      await updateGuildConfig(message.guild.id, { logs_channel_id: null });
      await message.reply('✅ Logs desactivados.');
      return;
    }
    const channel = message.mentions?.channels?.first();
    if (!channel) {
      await message.reply('❌ Menciona un canal: `cz!setuplogs #canal`');
      return;
    }
    await updateGuildConfig(message.guild.id, { logs_channel_id: channel.id });
    await message.reply(`✅ Logs activados en <#${channel.id}>.`);
  },
});

export default [setupTickets, setupLeveling, setupPrivateChannels, setupLogs];
