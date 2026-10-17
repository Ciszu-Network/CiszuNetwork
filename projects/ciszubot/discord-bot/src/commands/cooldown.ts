import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';

const command: BotCommand = {
  name: 'cooldown',
  description: 'Rate limit por comando: "espera X segundos" (staff)',
  aliases: ['ratelimit', 'cd'],
  usage: 'cz!cooldown [set <comando> <segundos> | remove <comando> | list]',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('cooldown')
    .setDescription('Rate limit por comando')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) =>
      s
        .setName('set')
        .setDescription('Establece un cooldown a un comando')
        .addStringOption((o) => o.setName('comando').setDescription('Nombre del comando').setRequired(true))
        .addIntegerOption((o) => o.setName('segundos').setDescription('Segundos de espera').setRequired(true).setMinValue(1).setMaxValue(3600)),
    )
    .addSubcommand((s) =>
      s
        .setName('remove')
        .setDescription('Quita el cooldown de un comando')
        .addStringOption((o) => o.setName('comando').setDescription('Nombre del comando').setRequired(true)),
    )
    .addSubcommand((s) => s.setName('list').setDescription('Lista los cooldowns configurados')),

  async execute(message, args) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();
    const cooldowns = cfg.command_cooldowns;

    const listEmbed = () =>
      new EmbedBuilder()
        .setColor('#00d4ff')
        .setTitle('⏳ Cooldowns por comando')
        .setDescription(
          Object.keys(cooldowns).length > 0
            ? Object.entries(cooldowns)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([cmd, secs]) => `• \`${cmd}\` — **${secs}s**`)
                .join('\n')
            : 'Sin cooldowns configurados.\n\nAñade uno: `cz!cooldown set work 60`',
        )
        .setFooter({ text: 'Los cooldowns aplican a todos los usuarios por igual', iconURL: message.client.user?.displayAvatarURL() });

    if (!sub || sub === 'list') {
      await message.reply({ embeds: [listEmbed()] });
      return;
    }

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    if (sub === 'set') {
      const cmdName = (args[1] ?? '').toLowerCase();
      const seconds = parseInt(args[2] ?? '', 10);
      const exists = message.client.commands.get(cmdName);
      if (!exists) {
        await message.reply(`❌ El comando \`${cmdName}\` no existe.`);
        return;
      }
      if (isNaN(seconds) || seconds < 1 || seconds > 3600) {
        await message.reply('❌ Los segundos deben estar entre 1 y 3600.');
        return;
      }
      await updateGuildConfig(guildId, { command_cooldowns: { ...cooldowns, [cmdName]: seconds } });
      await message.reply(`✅ \`${cmdName}\` ahora tiene un cooldown de **${seconds}s** (mensaje "espera X segundos").`);
      return;
    }

    if (sub === 'remove') {
      const cmdName = (args[1] ?? '').toLowerCase();
      const next = { ...cooldowns };
      delete next[cmdName];
      await updateGuildConfig(guildId, { command_cooldowns: next });
      await message.reply(`✅ Cooldown de \`${cmdName}\` eliminado.`);
      return;
    }

    await message.reply('❌ Subcomandos: `set`, `remove`, `list`.');
  },
};

export default command;
