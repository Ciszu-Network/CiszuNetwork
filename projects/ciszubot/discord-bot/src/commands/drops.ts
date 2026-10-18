import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig, DropEntry } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { isPremiumGuild } from '../services/featureFlags';
import { FREE_DROP_LIMIT } from '../services/drops';

const DEFAULT_ENTRY = (id: string, name: string): DropEntry => ({
  id,
  name,
  enabled: false,
  channels: [],
  min: 50,
  max: 200,
  interval_min: 60,
  interval_max: 180,
  message: null,
  excluded_roles: [],
});

/** Drops como lista: free hasta 3, premium ilimitados. */
const command: BotCommand = {
  name: 'drops',
  description: 'Configura la lista de drops de dinero (staff)',
  aliases: ['dropsconfig', 'caidas'],
  usage: 'cz!drops [status | add id [nombre] | remove id | id on|off|channel|amount|interval|message|exclude]',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName('drops')
    .setDescription('Configura la lista de drops de dinero')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la lista de drops'))
    .addSubcommand((s) =>
      s
        .setName('add')
        .setDescription('Añade un drop a la lista')
        .addStringOption((o) => o.setName('id').setDescription('ID único (ej: drop1)').setRequired(true))
        .addStringOption((o) => o.setName('nombre').setDescription('Nombre visible').setRequired(false)),
    )
    .addSubcommand((s) =>
      s
        .setName('remove')
        .setDescription('Elimina un drop de la lista')
        .addStringOption((o) => o.setName('id').setDescription('ID del drop').setRequired(true)),
    ),

  async execute(message, args) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const list = cfg.drops.list;
    const sub = (args[0] ?? '').toLowerCase();

    const premium = await isPremiumGuild(guildId);
    const limit = premium ? Infinity : FREE_DROP_LIMIT;

    const statusEmbed = () =>
      new EmbedBuilder()
        .setColor(list.some((d) => d.enabled) ? '#22c55e' : '#6b7280')
        .setTitle('💎 Drops de dinero')
        .setDescription(
          `**Plan:** ${premium ? '⭐ Premium (drops ilimitados)' : `🆓 Free (hasta ${FREE_DROP_LIMIT} drops)`}\n` +
            `**Drops configurados:** ${list.length}${premium ? '' : ` / ${FREE_DROP_LIMIT}`}\n\n` +
            (list.length > 0
              ? list
                  .map(
                    (d) =>
                      `${d.enabled ? '✅' : '⬜'} **${d.id}** (${d.name}) — ${d.min}–${d.max} ${cfg.coin_emoji} · cada ${d.interval_min}-${d.interval_max} min` +
                      `${d.channels.length > 0 ? ` · canales: ${d.channels.map((c) => `<#${c}>`).join(', ')}` : ' · cualquier canal'}` +
                      `${d.excluded_roles.length > 0 ? ` · excluye ${d.excluded_roles.map((r) => `<@&${r}>`).join(', ')}` : ''}`,
                  )
                  .join('\n')
              : 'Sin drops. Crea uno: `cz!drops add drop1 Drop principal`'),
        )
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

    if (!sub || sub === 'status' || sub === 'list') {
      await message.reply({ embeds: [statusEmbed()] });
      return;
    }

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    const save = (next: DropEntry[]) => updateGuildConfig(guildId, { drops: { list: next } });

    if (sub === 'add') {
      const id = (args[1] ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20);
      const name = args.slice(2).join(' ').trim() || id;
      if (!id) {
        await message.reply('❌ Uso: `cz!drops add <id> [nombre]` (ej: `cz!drops add drop1 Lluvia de monedas`).');
        return;
      }
      if (list.some((d) => d.id === id)) {
        await message.reply(`❌ Ya existe un drop con id \`${id}\`.`);
        return;
      }
      if (list.length >= limit) {
        await message.reply(
          `❌ El plan Free permite hasta **${FREE_DROP_LIMIT}** drops. Con **Premium** son ilimitados: ${'https://ciszubot.vercel.app/premium'}`,
        );
        return;
      }
      await save([...list, DEFAULT_ENTRY(id, name.slice(0, 50))]);
      await message.reply(
        `✅ Drop \`${id}\` (${name}) añadido. Configúralo: \`cz!drops ${id} on\`, \`cz!drops ${id} amount 50 200\`, \`cz!drops ${id} interval 60 180\`.`,
      );
      return;
    }

    if (sub === 'remove') {
      const id = (args[1] ?? '').toLowerCase();
      await save(list.filter((d) => d.id !== id));
      await message.reply(`✅ Drop \`${id}\` eliminado (si existía).`);
      return;
    }

    // Subcomandos por drop: cz!drops <id> <campo> ...
    const entry = list.find((d) => d.id === sub);
    if (!entry) {
      await message.reply('❌ Subcomandos: `status`, `add`, `remove` o `cz!drops <id> <campo>` (mira `cz!drops status`).');
      return;
    }
    const field = (args[1] ?? '').toLowerCase();
    const patch = (p: Partial<DropEntry>) => save(list.map((d) => (d.id === entry.id ? { ...d, ...p } : d)));

    if (field === 'on' || field === 'off') {
      await patch({ enabled: field === 'on' });
      await message.reply(`✅ Drop \`${entry.id}\` ${field === 'on' ? 'activado' : 'desactivado'}.`);
      return;
    }
    if (field === 'name') {
      const name = args.slice(2).join(' ').trim();
      if (!name) return void (await message.reply('❌ Uso: `cz!drops <id> name <nombre>`.'));
      await patch({ name: name.slice(0, 50) });
      await message.reply(`✅ Nombre del drop \`${entry.id}\`: **${name}**.`);
      return;
    }
    if (field === 'channel') {
      const channelId = message.mentions?.channels?.first()?.id;
      if (!channelId) return void (await message.reply('❌ Uso: `cz!drops <id> channel #canal [remove]`.'));
      const remove = (args[2] ?? '').toLowerCase() === 'remove';
      const channels = remove
        ? entry.channels.filter((c) => c !== channelId)
        : Array.from(new Set([...entry.channels, channelId]));
      await patch({ channels });
      await message.reply(`✅ Canal <#${channelId}> ${remove ? 'quitado de' : 'añadido a'} \`${entry.id}\`.`);
      return;
    }
    if (field === 'amount') {
      const min = parseInt(args[2] ?? '', 10);
      const max = parseInt(args[3] ?? '', 10);
      if (isNaN(min) || isNaN(max) || min < 1 || max < min || max > 1_000_000) {
        return void (await message.reply('❌ Uso: `cz!drops <id> amount <min> <max>`.'));
      }
      await patch({ min, max });
      await message.reply(`✅ Cantidad de \`${entry.id}\`: **${min}–${max}** ${cfg.coin_emoji}.`);
      return;
    }
    if (field === 'interval') {
      const min = parseInt(args[2] ?? '', 10);
      const max = parseInt(args[3] ?? '', 10);
      if (isNaN(min) || isNaN(max) || min < 5 || max < min || max > 1440) {
        return void (await message.reply('❌ Uso: `cz!drops <id> interval <min> <max>` (mínimo 5 min).'));
      }
      await patch({ interval_min: min, interval_max: max });
      await message.reply(`✅ Intervalo de \`${entry.id}\`: **${min}–${max} min**.`);
      return;
    }
    if (field === 'message') {
      const text = args.slice(2).join(' ').trim();
      if (!text) return void (await message.reply('❌ Uso: `cz!drops <id> message <texto>` o `reset`.'));
      const value = text.toLowerCase() === 'reset' ? null : text.slice(0, 300);
      await patch({ message: value });
      await message.reply(value ? '✅ Mensaje personalizado guardado.' : '✅ Mensaje restaurado al por defecto.');
      return;
    }
    if (field === 'exclude') {
      const roleId = message.mentions?.roles?.first()?.id;
      if (!roleId) return void (await message.reply('❌ Uso: `cz!drops <id> exclude @rol` (repite para quitarlo).'));
      const excluded = entry.excluded_roles.includes(roleId)
        ? entry.excluded_roles.filter((r) => r !== roleId)
        : [...entry.excluded_roles, roleId];
      await patch({ excluded_roles: excluded });
      await message.reply(`✅ Rol <@&${roleId}> ${entry.excluded_roles.includes(roleId) ? 'ya no está' : 'ahora está'} excluido de \`${entry.id}\`.`);
      return;
    }

    await message.reply('❌ Campos por drop: `on|off`, `name`, `channel`, `amount`, `interval`, `message`, `exclude`.');
  },
};

export default command;
