import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig, AutomodConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { langOf, tr } from '../services/i18n';

const FLAGS: Array<keyof Omit<AutomodConfig, 'words'>> = ['links', 'invites', 'caps', 'spam', 'flood'];

const command: BotCommand = {
  name: 'automod',
  description: 'Configura la moderación automática',
  aliases: ['automoderacion'],
  usage: 'cz!automod [on|off | links|invites|caps|spam on|off | word add|remove palabra | status]',
  category: 'Moderación',
  slashCommand: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configura la moderación automática')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la configuración'))
    .addSubcommand((s) => s.setName('on').setDescription('Activa el automod'))
    .addSubcommand((s) => s.setName('off').setDescription('Desactiva el automod'))
    .addSubcommand((s) =>
      s
        .setName('toggle')
        .setDescription('Activa/desactiva una regla')
        .addStringOption((o) =>
          o
            .setName('regla')
            .setDescription('Regla')
            .setRequired(true)
            .addChoices(...FLAGS.map((f) => ({ name: f, value: f }))),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('word')
        .setDescription('Añade o quita una palabra prohibida')
        .addStringOption((o) =>
          o
            .setName('accion')
            .setDescription('add o remove')
            .setRequired(true)
            .addChoices({ name: 'Añadir', value: 'add' }, { name: 'Quitar', value: 'remove' }),
        )
        .addStringOption((o) => o.setName('palabra').setDescription('Palabra').setRequired(true)),
    ),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const am = cfg.automod_config;
    const sub = (args[0] ?? '').toLowerCase();

    const statusEmbed = () =>
      new EmbedBuilder()
        .setColor(cfg.automod_enabled ? '#22c55e' : '#6b7280')
        .setTitle(tr(L, '🛡️ Automod', '🛡️ Automod'))
        .setDescription(
          `**Estado:** ${cfg.automod_enabled ? '✅ Activado' : '⛔ Desactivado'}\n\n` +
            FLAGS.map((f) => `${am[f] ? '✅' : '⬜'} **${f}**`).join('\n') +
            `\n⬜ **words** (${am.words.length} palabra(s)${am.words.length > 0 ? `: ${am.words.slice(0, 10).join(', ')}` : ''})\n\n` +
            'Configura: `cz!automod on` · `cz!automod links on` · `cz!automod word add palabra`',
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

    if (sub === 'on' || sub === 'off') {
      await updateGuildConfig(guildId, { automod_enabled: sub === 'on' });
      await message.reply(`✅ Automod ${sub === 'on' ? 'activado' : 'desactivado'}.`);
      return;
    }

    if (FLAGS.includes(sub as (typeof FLAGS)[number])) {
      const mode = (args[1] ?? '').toLowerCase();
      if (mode !== 'on' && mode !== 'off') {
        await message.reply(`❌ Uso: \`cz!automod ${sub} on|off\`.`);
        return;
      }
      await updateGuildConfig(guildId, { automod_config: { ...am, [sub]: mode === 'on' } });
      await message.reply(`✅ Regla **${sub}** ${mode === 'on' ? 'activada' : 'desactivada'}.`);
      return;
    }

    if (sub === 'word') {
      const action = (args[1] ?? '').toLowerCase();
      const word = args.slice(2).join(' ').trim().toLowerCase();
      if ((action !== 'add' && action !== 'remove') || !word) {
        await message.reply(tr(L, '❌ Uso: `cz!automod word add|remove <palabra>`.', '❌ Usage: `cz!automod word add|remove <word>`.'));
        return;
      }
      const words =
        action === 'add'
          ? Array.from(new Set([...am.words, word])).slice(0, 100)
          : am.words.filter((w) => w !== word);
      await updateGuildConfig(guildId, { automod_config: { ...am, words } });
      await message.reply(`✅ Palabra **${word}** ${action === 'add' ? 'añadida a' : 'quitada de'} la lista (${words.length} total).`);
      return;
    }

    await message.reply(tr(L, '❌ Subcomandos: `status`, `on`, `off`, `links|invites|caps|spam on|off`, `word add|remove`.', '❌ Subcommands: `status`, `on`, `off`, `links|invites|caps|spam on|off`, `word add|remove`.'));
  },
};

export default command;
