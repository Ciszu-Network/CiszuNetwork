import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { langOf, tr } from '../services/i18n';

const command: BotCommand = {
  name: 'staff',
  description: 'Configura el rol de staff del servidor (acceso a comandos de staff)',
  aliases: ['staffrole'],
  usage: 'cz!staff [role @rol | off | status]',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('staff')
    .setDescription('Configura el rol de staff del servidor')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) =>
      s
        .setName('role')
        .setDescription('Rol que puede usar los comandos de staff')
        .addRoleOption((o) => o.setName('rol').setDescription('Rol de staff').setRequired(true)),
    )
    .addSubcommand((s) => s.setName('off').setDescription('Quita el rol de staff (solo admins)'))
    .addSubcommand((s) => s.setName('status').setDescription('Muestra el estado')),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();

    if (!sub || sub === 'status') {
      const embed = new EmbedBuilder()
        .setColor(cfg.staff_role_id ? '#22c55e' : '#6b7280')
        .setTitle('👮 Rol de staff')
        .setDescription(
          `**Rol actual:** ${cfg.staff_role_id ? `<@&${cfg.staff_role_id}>` : 'ninguno (solo permiso Gestionar Servidor)'}\n\n` +
            'El rol de staff puede usar: money admin, drops, automod, cooldowns, welcome/goodbye, logs, starboard, ' +
            'nitro, counters, privatevc, staff, invites (config) y demás comandos de gestión.\n\n' +
            'Configura: `cz!staff role @rol` · `cz!staff off`',
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

    if (sub === 'off') {
      await updateGuildConfig(guildId, { staff_role_id: null });
      await message.reply(tr(L, '✅ Rol de staff eliminado (solo admins podrán usar los comandos de staff).', '✅ Staff role removed (only admins will be able to use staff commands).'));
      return;
    }

    if (sub === 'role') {
      const roleId = message.mentions?.roles?.first()?.id;
      if (!roleId) {
        await message.reply(tr(L, '❌ Uso: `cz!staff role @rol`.', '❌ Usage: `cz!staff role @role`.'));
        return;
      }
      await updateGuildConfig(guildId, { staff_role_id: roleId });
      await message.reply(`✅ Rol de staff: <@&${roleId}>.`);
      return;
    }

    await message.reply(tr(L, '❌ Subcomandos: `role`, `off`, `status`.', '❌ Subcommands: `role`, `off`, `status`.'));
  },
};

export default command;
