import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { langOf, tr } from '../services/i18n';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';

const URL_RE = /^https?:\/\/[^\s]+$/i;

function cleanUrl(value: string): string | null {
  const url = value.trim();
  return URL_RE.test(url) ? url : null;
}

const command: BotCommand = {
  name: 'bump',
  description: 'Bumpea y promociona el servidor en las listas de Discord',
  aliases: ['bumpear', 'promocionar', 'boost', 'topgg'],
  usage: 'cz!bump [config|setname|setlink|setdisboard|settopgg|setdbl|on|off|reset]',
  category: 'Utilidad',

  slashCommand: new SlashCommandBuilder()
    .setName('bump')
    .setDescription('Bumpea y promociona el servidor en las listas de Discord')
    .addSubcommand((sub) => sub.setName('config').setDescription('Muestra la configuración de bump'))
    .addSubcommand((sub) => sub
      .setName('setname')
      .setDescription('Cambia el nombre del servidor mostrado en bump')
      .addStringOption((opt) => opt.setName('nombre').setDescription('Nombre del servidor').setRequired(true).setMaxLength(80)))
    .addSubcommand((sub) => sub
      .setName('setlink')
      .setDescription('Cambia la invitación del servidor')
      .addStringOption((opt) => opt.setName('url').setDescription('https://discord.gg/...').setRequired(true).setMaxLength(500)))
    .addSubcommand((sub) => sub
      .setName('setdisboard')
      .setDescription('Cambia el enlace de Disboard')
      .addStringOption((opt) => opt.setName('url').setDescription('URL de Disboard').setRequired(true).setMaxLength(500)))
    .addSubcommand((sub) => sub
      .setName('settopgg')
      .setDescription('Cambia el enlace de Top.gg')
      .addStringOption((opt) => opt.setName('url').setDescription('URL de Top.gg').setRequired(true).setMaxLength(500)))
    .addSubcommand((sub) => sub
      .setName('setdbl')
      .setDescription('Cambia el enlace de Discord Bot List')
      .addStringOption((opt) => opt.setName('url').setDescription('URL de Discord Bot List').setRequired(true).setMaxLength(500)))
    .addSubcommand((sub) => sub.setName('on').setDescription('Activa el comando bump'))
    .addSubcommand((sub) => sub.setName('off').setDescription('Desactiva el comando bump'))
    .addSubcommand((sub) => sub.setName('reset').setDescription('Restaura los valores de Ciszugamens')),

  async execute(message, args) {
    const L = await langOf(message);
    const guildId = message.guild?.id;
    const cfg = guildId ? await getGuildConfig(guildId) : null;
    const sub = (args[0] ?? '').toLowerCase();
    const configCommands = new Set(['config', 'setname', 'setlink', 'setdisboard', 'settopgg', 'setdbl', 'on', 'off', 'reset']);

    if (guildId && configCommands.has(sub)) {
      if (!(await isStaff(message))) {
        await message.reply(STAFF_ERROR);
        return;
      }

      if (sub === 'config') {
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(BOT_COLORS.secondary)
              .setTitle('⚙️ Configuración de bump')
              .setDescription(
                `**Servidor:** ${cfg?.bump_server_name}\n` +
                `**Invitación:** ${cfg?.bump_server_link}\n` +
                `**Disboard:** ${cfg?.bump_disboard_url}\n` +
                `**Top.gg:** ${cfg?.bump_topgg_url}\n` +
                `**Discord Bot List:** ${cfg?.bump_dbl_url}\n` +
                `**Estado:** ${cfg?.bump_enabled ? 'activado' : 'desactivado'}\n\n` +
                '`cz!bump setname <nombre>` · `cz!bump setlink <url>`\n' +
                '`cz!bump setdisboard <url>` · `cz!bump settopgg <url>` · `cz!bump setdbl <url>`\n' +
                '`cz!bump on|off|reset`',
              )
              .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
              .setTimestamp(),
          ],
        });
        return;
      }

      if (sub === 'on' || sub === 'off') {
        await updateGuildConfig(guildId, { bump_enabled: sub === 'on' });
        await message.reply(sub === 'on' ? '✅ Comando bump activado.' : '✅ Comando bump desactivado.');
        return;
      }

      if (sub === 'reset') {
        await updateGuildConfig(guildId, {
          bump_server_name: 'Ciszugamens',
          bump_server_link: 'https://discord.gg/W3kMtMMj6E',
          bump_disboard_url: 'https://disboard.org/es/server/1215544133142450187',
          bump_topgg_url: 'https://top.gg/es/discord/servers/871620279188504576',
          bump_dbl_url: 'https://discordbotlist.com/servers/ciszugamens',
          bump_enabled: true,
        });
        await message.reply('✅ Bump restaurado a Ciszugamens por defecto.');
        return;
      }

      const value = args.slice(1).join(' ').trim();
      if (!value) {
        await message.reply(`Uso: \`cz!bump ${sub} <valor>\`.`);
        return;
      }
      if (sub === 'setname') {
        if (value.length > 80) {
          await message.reply('El nombre no puede superar 80 caracteres.');
          return;
        }
        await updateGuildConfig(guildId, { bump_server_name: value });
        await message.reply(`✅ Nombre del servidor: **${value}**.`);
        return;
      }

      const url = cleanUrl(value);
      if (!url) {
        await message.reply('URL inválida. Debe empezar por `http://` o `https://`.');
        return;
      }
      const field = sub === 'setlink'
        ? 'bump_server_link'
        : sub === 'setdisboard'
          ? 'bump_disboard_url'
          : sub === 'settopgg'
            ? 'bump_topgg_url'
            : 'bump_dbl_url';
      await updateGuildConfig(guildId, { [field]: url });
      await message.reply(`✅ Enlace actualizado: ${url}`);
      return;
    }

    if (guildId && cfg && !cfg.bump_enabled) {
      await message.reply('El comando bump está desactivado en este servidor.');
      return;
    }

    const serverName = cfg?.bump_server_name || 'Ciszugamens';
    const serverLink = cfg?.bump_server_link;
    const disboardUrl = cfg?.bump_disboard_url;
    const topggUrl = cfg?.bump_topgg_url;
    const dblUrl = cfg?.bump_dbl_url;

    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.secondary)
      .setTitle(tr(L, '🚀 Bump del servidor', '🚀 Server bump'))
      .setDescription(
        tr(
          L,
          `Ayuda a que **${serverName}** crezca bumpeándolo en las listas de servidores. Cada bump lo posiciona mejor y lo muestra a más gente.`,
          `Help **${serverName}** grow by bumping it on server lists. Every bump improves its position and visibility.`,
        ),
      )
      .addFields(
        {
          name: tr(L, '📣 Disboard', '📣 Disboard'),
          value: tr(
            L,
            'Abre la ficha del servidor en Disboard y usa su bump (o `!d bump` dentro del servidor).',
            'Open the server page on Disboard and use its bump (or `!d bump` inside the server).',
          ),
          inline: false,
        },
        {
          name: tr(L, '⭐ Top.gg', '⭐ Top.gg'),
          value: tr(
            L,
            `Vota y comparte **${serverName}** en Top.gg para conseguir más visibilidad.`,
            `Vote and share **${serverName}** on Top.gg for more visibility.`,
          ),
          inline: false,
        },
        {
          name: '🖥️ Discord Bot List',
          value: tr(
            L,
            `La ficha de **${serverName}** también está en Discord Bot List.`,
            `**${serverName}** is also listed on Discord Bot List.`,
          ),
          inline: false,
        },
      )
      .setFooter(BOT_FOOTER(`Solicitado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>();
    if (serverLink) row.addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(`Unirse a ${serverName}`.slice(0, 80)).setURL(serverLink));
    if (disboardUrl) row.addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Bump en Disboard').setURL(disboardUrl));
    if (topggUrl) row.addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Top.gg').setURL(topggUrl));
    if (dblUrl) row.addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Discord Bot List').setURL(dblUrl));

    return message.reply({ embeds: [embed], components: row.components.length > 0 ? [row] : [] });
  },
};

export default command;
