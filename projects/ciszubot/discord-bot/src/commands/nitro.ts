import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { GuildMember, Message } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { langOf, tr } from '../services/i18n';
import { hasExternalEmoji, isNitroRoleExcluded, sendNitroWebhook } from '../services/nitro';

const SETTING_SUBS = new Set(['on', 'off', 'status', 'mode']);

const command: BotCommand = {
  name: 'nitro',
  description: 'Reenvía emojis Nitro/externos vía webhook (automático o manual)',
  aliases: ['nitroemoji'],
  usage: 'cz!nitro [on|off|status|mode auto|manual] · cz!nitro <emoji>',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('nitro')
    .setDescription('Reenvía mensajes con emojis Nitro/externos')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) => s.setName('on').setDescription('Activa el reenvío de emojis Nitro'))
    .addSubcommand((s) => s.setName('off').setDescription('Desactiva el reenvío'))
    .addSubcommand((s) => s.setName('status').setDescription('Muestra el estado')),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();
    const realMessage = message as unknown as Message;

    let manualContent = '';
    if (!SETTING_SUBS.has(sub)) {
      manualContent = args.join(' ').trim();
      if (!manualContent && realMessage.reference?.messageId && typeof realMessage.fetchReference === 'function') {
        const referenced = await realMessage.fetchReference().catch(() => null);
        manualContent = referenced?.content?.trim() ?? '';
      }
    }

    if (manualContent && hasExternalEmoji(manualContent, message.guild.emojis.cache)) {
      if (!cfg.nitro_repost_enabled) {
        await message.reply(tr(L, '⛔ Los emojis Nitro están desactivados. Un staff puede activarlos con `cz!nitro on`.', '⛔ Nitro emojis are disabled. A staff member can enable them with `cz!nitro on`.'));
        return;
      }
      const member = message.member as unknown as GuildMember | null;
      if (isNitroRoleExcluded(member, cfg.nitro_excluded_role_ids)) {
        await message.reply(tr(L, '⛔ Tu rol está excluido del reenvío de emojis Nitro.', '⛔ Your role is excluded from Nitro emoji reposting.'));
        return;
      }
      const sent = await sendNitroWebhook(realMessage, manualContent);
      if (!sent) {
        await message.reply(tr(L, '❌ No pude reenviar el emoji. Revisa que el bot tenga **Gestionar webhooks** en este canal.', '❌ I could not repost the emoji. Check that the bot has **Manage Webhooks** in this channel.'));
      }
      return;
    }

    if (!sub || sub === 'status') {
      const mode = cfg.nitro_repost_mode === 'manual'
        ? tr(L, 'Manual (comando + emoji)', 'Manual (command + emoji)')
        : tr(L, 'Automático (el bot detecta)', 'Automatic (bot detects)');
      const excluded = cfg.nitro_excluded_role_ids.length;
      const instructions = cfg.nitro_repost_mode === 'manual'
        ? tr(L, 'En modo manual cada usuario debe escribir `cz!nitro <emoji>` o responder a un mensaje con `cz!nitro`.', 'In manual mode each user must type `cz!nitro <emoji>` or reply to a message with `cz!nitro`.')
        : tr(L, 'El bot reenvía automáticamente los mensajes con emojis externos.', 'The bot automatically reposts messages with external emojis.');
      const embed = new EmbedBuilder()
        .setColor(cfg.nitro_repost_enabled ? '#22c55e' : '#6b7280')
        .setTitle(tr(L, '✨ Emojis Nitro', '✨ Nitro emojis'))
        .setDescription(
          `**${tr(L, 'Estado', 'Status')}:** ${cfg.nitro_repost_enabled ? tr(L, '✅ Activado', '✅ Enabled') : tr(L, '⛔ Desactivado', '⛔ Disabled')}\n` +
            `**${tr(L, 'Modo', 'Mode')}:** ${mode}\n` +
            `**${tr(L, 'Roles excluidos', 'Excluded roles')}:** ${excluded}\n\n${instructions}`,
        )
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (cfg.nitro_repost_mode === 'manual' && manualContent) {
      await message.reply(tr(L, '❌ El mensaje no contiene un emoji externo. Uso: `cz!nitro <emoji>`.', '❌ The message does not contain an external emoji. Usage: `cz!nitro <emoji>`.'));
      return;
    }

    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }

    if (sub === 'on' || sub === 'off') {
      await updateGuildConfig(guildId, { nitro_repost_enabled: sub === 'on' });
      await message.reply(tr(L, `✅ Emojis Nitro ${sub === 'on' ? 'activados' : 'desactivados'}.`, `✅ Nitro emojis ${sub === 'on' ? 'enabled' : 'disabled'}.`));
      return;
    }

    if (sub === 'mode') {
      const value = (args[1] ?? '').toLowerCase();
      if (value !== 'auto' && value !== 'manual') {
        await message.reply(tr(L, '❌ Uso: `cz!nitro mode auto|manual`.', '❌ Usage: `cz!nitro mode auto|manual`.'));
        return;
      }
      await updateGuildConfig(guildId, { nitro_repost_mode: value });
      await message.reply(tr(L, `✅ Modo Nitro: **${value === 'manual' ? 'manual' : 'automático'}**.`, `✅ Nitro mode: **${value === 'manual' ? 'manual' : 'automatic'}**.`));
      return;
    }

    await message.reply(tr(L, '❌ Subcomandos: `on`, `off`, `status`, `mode`.', '❌ Subcommands: `on`, `off`, `status`, `mode`.'));
  },
};

export default command;
