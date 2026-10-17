import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';

const command: BotCommand = {
  name: 'nitro',
  description: 'Reenvía mensajes con emojis Nitro/externos vía webhook (staff)',
  aliases: ['nitroemoji'],
  usage: 'cz!nitro [on|off|status]',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('nitro')
    .setDescription('Reenvía mensajes con emojis Nitro/externos')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) => s.setName('on').setDescription('Activa el reenvío de emojis Nitro'))
    .addSubcommand((s) => s.setName('off').setDescription('Desactiva el reenvío'))
    .addSubcommand((s) => s.setName('status').setDescription('Muestra el estado')),

  async execute(message, args) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();

    if (!sub || sub === 'status') {
      const embed = new EmbedBuilder()
        .setColor(cfg.nitro_repost_enabled ? '#22c55e' : '#6b7280')
        .setTitle('✨ Emojis Nitro')
        .setDescription(
          `**Estado:** ${cfg.nitro_repost_enabled ? '✅ Activado' : '⛔ Desactivado'}\n\n` +
            'Cuando alguien usa un emoji externo que el bot no puede usar, el bot reenvía su mensaje ' +
            'por webhook (manteniendo nombre y avatar) para que el emoji se vea sin Nitro.\n\n' +
            'Configura: `cz!nitro on` · `cz!nitro off` (requiere permiso Gestionar Webhooks).',
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

    if (sub === 'on' || sub === 'off') {
      await updateGuildConfig(guildId, { nitro_repost_enabled: sub === 'on' });
      await message.reply(`✅ Emojis Nitro ${sub === 'on' ? 'activados' : 'desactivados'}.`);
      return;
    }

    await message.reply('❌ Subcomandos: `on`, `off`, `status`.');
  },
};

export default command;
