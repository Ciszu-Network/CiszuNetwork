import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig, formatCoins } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { langOf, tr } from '../services/i18n';

/** Moneda configurable por servidor: emoji y nombre (cz!coin emoji 🪙). */
const command: BotCommand = {
  name: 'coin',
  description: 'Configura la moneda del servidor (emoji y nombre)',
  aliases: ['moneda', 'coinicon'],
  usage: 'cz!coin [emoji 🪙 | name monedas | reset]',
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName('coin')
    .setDescription('Configura la moneda del servidor')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) =>
      s
        .setName('emoji')
        .setDescription('Cambia el emoji de la moneda')
        .addStringOption((o) => o.setName('emoji').setDescription('Nuevo emoji').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('name')
        .setDescription('Cambia el nombre de la moneda')
        .addStringOption((o) => o.setName('nombre').setDescription('Nuevo nombre').setRequired(true)),
    )
    .addSubcommand((s) => s.setName('reset').setDescription('Vuelve a la moneda por defecto (🪙 monedas)'))
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la moneda actual')),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const cfg = await getGuildConfig(message.guild.id);
    const sub = (args[0] ?? '').toLowerCase();

    if (!sub || sub === 'status') {
      const embed = new EmbedBuilder()
        .setColor('#00d4ff')
        .setTitle(tr(L, `${cfg.coin_emoji} Moneda del servidor`, `${cfg.coin_emoji} Server currency`))
        .setDescription(
          tr(
            L,
            `**Emoji:** ${cfg.coin_emoji}\n**Nombre:** ${cfg.coin_name}\n\nEjemplo: **${formatCoins(cfg, 1500)}**\n\nCambiar: \`cz!coin emoji 🪙\` · \`cz!coin name monedas\` · \`cz!coin reset\``,
            `**Emoji:** ${cfg.coin_emoji}\n**Name:** ${cfg.coin_name}\n\nExample: **${formatCoins(cfg, 1500)}**\n\nChange: \`cz!coin emoji 🪙\` · \`cz!coin name coins\` · \`cz!coin reset\``,
          ),
        )
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    if (sub === 'emoji') {
      const emoji = (args[1] ?? '').trim();
      if (!emoji || emoji.length > 64) {
        await message.reply(tr(L, '❌ Uso: `cz!coin emoji <emoji>`', '❌ Usage: `cz!coin emoji <emoji>`'));
        return;
      }
      await updateGuildConfig(message.guild.id, { coin_emoji: emoji });
      await message.reply(tr(L, `✅ Emoji de la moneda actualizado a ${emoji}`, `✅ Currency emoji updated to ${emoji}`));
      return;
    }

    if (sub === 'name') {
      const name = args.slice(1).join(' ').trim();
      if (!name || name.length > 32) {
        await message.reply(tr(L, '❌ Uso: `cz!coin name <nombre>` (máx. 32 caracteres)', '❌ Usage: `cz!coin name <name>` (max 32 characters)'));
        return;
      }
      await updateGuildConfig(message.guild.id, { coin_name: name });
      await message.reply(tr(L, `✅ Nombre de la moneda actualizado a **${name}**.`, `✅ Currency name updated to **${name}**.`));
      return;
    }

    if (sub === 'reset') {
      await updateGuildConfig(message.guild.id, { coin_emoji: '🪙', coin_name: 'monedas' });
      await message.reply(tr(L, '✅ Moneda restaurada a 🪙 monedas.', '✅ Currency restored to 🪙 coins.'));
      return;
    }

    await message.reply(tr(L, '❌ Subcomandos: `emoji`, `name`, `reset`, `status`.', '❌ Subcommands: `emoji`, `name`, `reset`, `status`.'));
  },
};

export default command;
