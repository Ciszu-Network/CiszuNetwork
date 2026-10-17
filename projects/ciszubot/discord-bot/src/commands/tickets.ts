import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig, TicketCategory, TicketConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { panelComponents, panelEmbed } from '../services/tickets';

/** Config del sistema de tickets por categorías (estilo Ticket Tool). */
const command: BotCommand = {
  name: 'tickets',
  description: 'Configura el sistema de tickets por categorías',
  aliases: ['ticket', 'ticketconfig'],
  usage: 'cz!tickets [status|on|off|panel #canal|log #canal|autodelete h|category add id label|remove id|cat id campo valor]',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('tickets')
    .setDescription('Configura el sistema de tickets')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la configuración'))
    .addSubcommand((s) => s.setName('on').setDescription('Activa los tickets'))
    .addSubcommand((s) => s.setName('off').setDescription('Desactiva los tickets'))
    .addSubcommand((s) =>
      s
        .setName('panel')
        .setDescription('Publica el panel de tickets en un canal')
        .addChannelOption((o) => o.setName('canal').setDescription('Canal del panel').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('log')
        .setDescription('Canal de registro de tickets')
        .addChannelOption((o) => o.setName('canal').setDescription('Canal de logs').setRequired(true)),
    ),

  async execute(message, args) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const config: TicketConfig = cfg.ticket_config;
    const sub = (args[0] ?? '').toLowerCase();

    const statusEmbed = () =>
      new EmbedBuilder()
        .setColor(config.enabled ? '#22c55e' : '#6b7280')
        .setTitle('🎫 Sistema de tickets')
        .setDescription(
          `**Estado:** ${config.enabled ? '✅ Activado' : '⛔ Desactivado'}\n` +
            `**Panel:** ${config.panel_channel_id ? `<#${config.panel_channel_id}>` : 'no publicado'}\n` +
            `**Logs:** ${config.log_channel_id ? `<#${config.log_channel_id}>` : 'no configurado'}\n` +
            `**Auto-borrado:** ${config.auto_delete_hours}h\n\n` +
            `**Categorías (${config.categories.length}):**\n` +
            (config.categories.length > 0
              ? config.categories
                  .map(
                    (c) =>
                      `${c.emoji} **${c.id}** — ${c.label}${c.role_ids.length > 0 ? ` · staff: ${c.role_ids.map((r) => `<@&${r}>`).join(', ')}` : ''}` +
                      `${c.grant_role_id ? ` · otorga <@&${c.grant_role_id}>` : ''}${c.form.length > 0 ? ` · formulario (${c.form.length})` : ''}`,
                  )
                  .join('\n')
              : 'ninguna'),
        )
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

    if (!sub || sub === 'status') {
      await message.reply({ embeds: [statusEmbed()] });
      return;
    }

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    const save = (patch: Partial<TicketConfig>) => updateGuildConfig(guildId, { ticket_config: { ...config, ...patch } });

    if (sub === 'on' || sub === 'off') {
      await save({ enabled: sub === 'on' });
      await message.reply(`✅ Tickets ${sub === 'on' ? 'activados' : 'desactivados'}.`);
      return;
    }

    if (sub === 'panel') {
      const channelId = message.mentions?.channels?.first()?.id;
      if (!channelId) {
        await message.reply('❌ Uso: `cz!tickets panel #canal`.');
        return;
      }
      if (config.categories.length === 0) {
        await message.reply('❌ Primero crea una categoría: `cz!tickets category add soporte Soporte`.');
        return;
      }
      const channel = message.guild.channels.cache.get(channelId);
      if (!channel || !('send' in channel)) {
        await message.reply('❌ Canal no válido.');
        return;
      }
      await channel.send({ embeds: [panelEmbed(config)], components: panelComponents(config) });
      await save({ panel_channel_id: channelId, enabled: true });
      await message.reply(`✅ Panel publicado en <#${channelId}> y tickets activados.`);
      return;
    }

    if (sub === 'log') {
      const channelId = message.mentions?.channels?.first()?.id;
      if (!channelId) {
        await message.reply('❌ Uso: `cz!tickets log #canal`.');
        return;
      }
      await save({ log_channel_id: channelId });
      await message.reply(`✅ Logs de tickets: <#${channelId}>.`);
      return;
    }

    if (sub === 'autodelete') {
      const hours = parseInt(args[1] ?? '', 10);
      if (isNaN(hours) || hours < 0 || hours > 720) {
        await message.reply('❌ Uso: `cz!tickets autodelete <horas>` (0 = borrado inmediato).');
        return;
      }
      await save({ auto_delete_hours: hours });
      await message.reply(`✅ Auto-borrado de tickets cerrados: **${hours}h**.`);
      return;
    }

    if (sub === 'category') {
      const action = (args[1] ?? '').toLowerCase();
      if (action === 'add') {
        const id = (args[2] ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '');
        const label = args.slice(3).join(' ').trim() || id;
        if (!id) {
          await message.reply('❌ Uso: `cz!tickets category add <id> <nombre>` (ej: `category add soporte Soporte técnico`).');
          return;
        }
        if (config.categories.some((c) => c.id === id)) {
          await message.reply(`❌ Ya existe la categoría \`${id}\`.`);
          return;
        }
        const category: TicketCategory = {
          id,
          label: label.slice(0, 100),
          emoji: '🎫',
          description: '',
          discord_category_id: null,
          role_ids: [],
          grant_role_id: null,
          form: [],
          welcome: '¡Hola {user}! Cuéntanos tu caso y el equipo te atenderá pronto.',
          color: '#00d4ff',
        };
        await save({ categories: [...config.categories, category] });
        await message.reply(`✅ Categoría \`${id}\` creada. Edítala: \`cz!tickets cat ${id} ...\``);
        return;
      }
      if (action === 'remove') {
        const id = (args[2] ?? '').toLowerCase();
        const categories = config.categories.filter((c) => c.id !== id);
        await save({ categories });
        await message.reply(`✅ Categoría \`${id}\` eliminada (si existía).`);
        return;
      }
      await message.reply('❌ Subcomandos: `category add <id> <nombre>` · `category remove <id>`.');
      return;
    }

    if (sub === 'cat') {
      const id = (args[1] ?? '').toLowerCase();
      const field = (args[2] ?? '').toLowerCase();
      const category = config.categories.find((c) => c.id === id);
      if (!category) {
        await message.reply(`❌ No existe la categoría \`${id}\`.`);
        return;
      }
      const update = (patch: Partial<TicketCategory>) =>
        save({ categories: config.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
      const value = args.slice(3).join(' ').trim();

      if (field === 'label') {
        if (!value) return void (await message.reply('❌ Uso: `cz!tickets cat <id> label <texto>`.'));
        await update({ label: value.slice(0, 100) });
        await message.reply(`✅ \`${id}\` → label: **${value}**.`);
        return;
      }
      if (field === 'emoji') {
        await update({ emoji: (value || '🎫').slice(0, 64) });
        await message.reply(`✅ \`${id}\` → emoji: ${value || '🎫'}.`);
        return;
      }
      if (field === 'desc') {
        await update({ description: value.slice(0, 100) });
        await message.reply(`✅ \`${id}\` → descripción actualizada.`);
        return;
      }
      if (field === 'discord') {
        const catId = message.mentions?.channels?.find?.((c) => c.type === 4)?.id;
        if (!catId) return void (await message.reply('❌ Menciona una categoría de Discord: `cz!tickets cat <id> discord <categoría>`.'));
        await update({ discord_category_id: catId });
        await message.reply(`✅ \`${id}\` → los tickets se crearán en <#${catId}>.`);
        return;
      }
      if (field === 'role') {
        const action = (args[3] ?? '').toLowerCase();
        const roleId = message.mentions?.roles?.first()?.id;
        if (action === 'remove' && roleId) {
          await update({ role_ids: category.role_ids.filter((r) => r !== roleId) });
          await message.reply(`✅ \`${id}\` → rol <@&${roleId}> quitado.`);
          return;
        }
        if (!roleId) return void (await message.reply('❌ Uso: `cz!tickets cat <id> role @rol` o `... role remove @rol`.'));
        await update({ role_ids: Array.from(new Set([...category.role_ids, roleId])).slice(0, 10) });
        await message.reply(`✅ \`${id}\` → staff: <@&${roleId}> (${category.role_ids.length + 1} rol(es)).`);
        return;
      }
      if (field === 'grant') {
        const roleId = message.mentions?.roles?.first()?.id;
        if ((args[3] ?? '').toLowerCase() === 'off' || !roleId) {
          await update({ grant_role_id: null });
          await message.reply(`✅ \`${id}\` → ya no otorga rol.`);
          return;
        }
        await update({ grant_role_id: roleId });
        await message.reply(`✅ \`${id}\` → al abrir el ticket se otorga <@&${roleId}>.`);
        return;
      }
      if (field === 'form') {
        if (value.toLowerCase() === 'clear' || value.toLowerCase() === 'off') {
          await update({ form: [] });
          await message.reply(`✅ \`${id}\` → formulario eliminado (apertura directa).`);
          return;
        }
        if (!value) return void (await message.reply('❌ Uso: `cz!tickets cat <id> form Pregunta 1; Pregunta 2` (máx. 5).'));
        const form = value.split(';').map((s) => s.trim()).filter(Boolean).slice(0, 5);
        await update({ form });
        await message.reply(`✅ \`${id}\` → formulario de ${form.length} pregunta(s).`);
        return;
      }
      if (field === 'welcome') {
        if (!value) return void (await message.reply('❌ Uso: `cz!tickets cat <id> welcome <texto>` (variable {user}).'));
        await update({ welcome: value.slice(0, 1000) });
        await message.reply(`✅ \`${id}\` → mensaje de bienvenida actualizado.`);
        return;
      }
      if (field === 'color') {
        const color = value.startsWith('#') ? value : `#${value}`;
        if (!/^#[0-9a-fA-F]{6}$/.test(color)) return void (await message.reply('❌ Uso: `cz!tickets cat <id> color #00d4ff`.'));
        await update({ color });
        await message.reply(`✅ \`${id}\` → color ${color}.`);
        return;
      }

      await message.reply('❌ Campos: `label`, `emoji`, `desc`, `discord`, `role`, `grant`, `form`, `welcome`, `color`.');
      return;
    }

    await message.reply('❌ Subcomandos: `status`, `on`, `off`, `panel`, `log`, `autodelete`, `category`, `cat`.');
  },
};

export default command;
