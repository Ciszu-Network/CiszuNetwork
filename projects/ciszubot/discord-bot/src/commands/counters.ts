import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { langOf, tr } from '../services/i18n';

const TYPES = ['members', 'bots', 'humans', 'channels', 'roles', 'online'] as const;

const command: BotCommand = {
  name: 'counters',
  description: 'Configura canales contadores con datos reales del servidor',
  aliases: ['contadores', 'stats'],
  usage: 'cz!counters [add <tipo> #canal | remove <tipo> | list]',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('counters')
    .setDescription('Configura canales contadores')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) =>
      s
        .setName('add')
        .setDescription('Añade un contador')
        .addStringOption((o) =>
          o
            .setName('tipo')
            .setDescription('Qué contar')
            .setRequired(true)
            .addChoices(...TYPES.map((t) => ({ name: t, value: t }))),
        )
        .addChannelOption((o) => o.setName('canal').setDescription('Canal de voz que será el contador').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('remove')
        .setDescription('Quita un contador')
        .addStringOption((o) =>
          o
            .setName('tipo')
            .setDescription('Qué contar')
            .setRequired(true)
            .addChoices(...TYPES.map((t) => ({ name: t, value: t }))),
        ),
    )
    .addSubcommand((s) => s.setName('list').setDescription('Lista los contadores')),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();

    const listEmbed = () =>
      new EmbedBuilder()
        .setColor('#00d4ff')
        .setTitle(tr(L, '📊 Contadores del servidor', '📊 Server counters'))
        .setDescription(
          cfg.counters.length > 0
            ? cfg.counters.map((c) => `• **${c.type}** → <#${c.channel_id}>`).join('\n')
            : 'Sin contadores configurados.\n\nAñade uno: `cz!counters add members #canal`',
        )
        .setFooter({ text: `Tipos: ${TYPES.join(', ')}`, iconURL: message.client.user?.displayAvatarURL() });

    if (!sub || sub === 'list') {
      await message.reply({ embeds: [listEmbed()] });
      return;
    }

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    if (sub === 'add') {
      const type = (args[1] ?? '').toLowerCase();
      const channelId = message.mentions?.channels?.first()?.id;
      if (!TYPES.includes(type as (typeof TYPES)[number]) || !channelId) {
        await message.reply(`❌ Uso: \`cz!counters add <${TYPES.join('|')}> #canal\`.`);
        return;
      }
      const counters = [...cfg.counters.filter((c) => c.type !== type), { type, channel_id: channelId }];
      await updateGuildConfig(guildId, { counters });
      await message.reply(`✅ Contador **${type}** → <#${channelId}>. Se actualizará al entrar/salir gente.`);
      return;
    }

    if (sub === 'remove') {
      const type = (args[1] ?? '').toLowerCase();
      const counters = cfg.counters.filter((c) => c.type !== type);
      await updateGuildConfig(guildId, { counters });
      await message.reply(`✅ Contador **${type}** eliminado.`);
      return;
    }

    await message.reply(tr(L, '❌ Subcomandos: `add`, `remove`, `list`.', '❌ Subcommands: `add`, `remove`, `list`.'));
  },
};

export default command;
