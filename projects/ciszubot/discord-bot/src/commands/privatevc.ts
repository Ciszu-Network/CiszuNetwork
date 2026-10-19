import { ChannelType, EmbedBuilder, SlashCommandBuilder, VoiceChannel } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { db, ciszubotSchema, eq, and } from '../services/supabase';
import { langOf, tr } from '../services/i18n';

const command: BotCommand = {
  name: 'privatevc',
  description: 'Sistema de canales de voz privados (panel + crear)',
  aliases: ['privados', 'pvc'],
  usage: 'cz!privatevc [setup #hub [categoría] | off | rename nombre | limit n | delete]',
  category: 'Configuración',
  slashCommand: new SlashCommandBuilder()
    .setName('privatevc')
    .setDescription('Sistema de canales de voz privados')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) =>
      s
        .setName('setup')
        .setDescription('Configura el canal hub (al unirte se crea tu VC privado)')
        .addChannelOption((o) =>
          o.setName('hub').setDescription('Canal de voz hub').setRequired(true).addChannelTypes(ChannelType.GuildVoice),
        ),
    )
    .addSubcommand((s) => s.setName('off').setDescription('Desactiva los canales privados'))
    .addSubcommand((s) =>
      s
        .setName('rename')
        .setDescription('Renombra tu canal privado')
        .addStringOption((o) => o.setName('nombre').setDescription('Nuevo nombre').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('limit')
        .setDescription('Limita los usuarios de tu canal privado (0 = sin límite)')
        .addIntegerOption((o) => o.setName('cantidad').setDescription('Usuarios').setRequired(true).setMinValue(0).setMaxValue(99)),
    )
    .addSubcommand((s) => s.setName('delete').setDescription('Elimina tu canal privado'))
    .addSubcommand((s) => s.setName('status').setDescription('Muestra la configuración')),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();

    const ownChannel = async () => {
      const rows = await db
        .select()
        .from(ciszubotSchema.privateChannels)
        .where(and(eq(ciszubotSchema.privateChannels.guildId, guildId), eq(ciszubotSchema.privateChannels.ownerId, message.author.id)))
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      return message.guild!.channels.cache.get(row.channelId) ?? (await message.guild!.channels.fetch(row.channelId).catch(() => null));
    };

    if (sub === 'rename' || sub === 'limit' || sub === 'delete') {
      const channel = await ownChannel();
      if (!channel) {
        await message.reply(tr(L, '❌ No tienes un canal privado activo.', '❌ You do not have an active private channel.'));
        return;
      }
      if (sub === 'delete') {
        await db.delete(ciszubotSchema.privateChannels).where(eq(ciszubotSchema.privateChannels.channelId, channel.id));
        await channel.delete('Canal privado cerrado por su dueño').catch(() => undefined);
        await message.reply(tr(L, '✅ Tu canal privado fue eliminado.', '✅ Your private channel was deleted.'));
        return;
      }
      if (sub === 'rename') {
        const name = args.slice(1).join(' ').trim().slice(0, 90);
        if (!name) {
          await message.reply(tr(L, '❌ Uso: `cz!privatevc rename <nombre>`.', '❌ Usage: `cz!privatevc rename <name>`.'));
          return;
        }
        await channel.setName(name).catch(() => undefined);
        await message.reply(`✅ Canal renombrado a **${name}**.`);
        return;
      }
      const limit = parseInt(args[1] ?? '', 10);
      if (isNaN(limit) || limit < 0 || limit > 99) {
        await message.reply(tr(L, '❌ Uso: `cz!privatevc limit <0-99>` (0 = sin límite).', '❌ Usage: `cz!privatevc limit <0-99>` (0 = no limit).'));
        return;
      }
      if (channel.type !== ChannelType.GuildVoice) {
        await message.reply(tr(L, '❌ Tu canal privado no es de voz.', '❌ Your private channel is not a voice channel.'));
        return;
      }
      await (channel as VoiceChannel).setUserLimit(limit).catch(() => undefined);
      await message.reply(`✅ Límite de usuarios: **${limit === 0 ? 'sin límite' : limit}**.`);
      return;
    }

    if (!sub || sub === 'status') {
      const embed = new EmbedBuilder()
        .setColor(cfg.private_vc_hub_id ? '#22c55e' : '#6b7280')
        .setTitle(tr(L, '🔒 Canales de voz privados', '🔒 Private voice channels'))
        .setDescription(
          `**Estado:** ${cfg.private_vc_hub_id ? '✅ Activados' : '⛔ Desactivados'}\n` +
            `**Hub:** ${cfg.private_vc_hub_id ? `<#${cfg.private_vc_hub_id}>` : 'no configurado'}\n` +
            `**Categoría:** ${cfg.private_category_id ? `<#${cfg.private_category_id}>` : 'por defecto'}\n\n` +
            'Al unirse al hub, el bot crea un VC privado con panel de botones (bloquear, ocultar, borrar...).\n' +
            'Configura: `cz!privatevc setup #hub [categoría]` · `cz!privatevc off`',
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
      await updateGuildConfig(guildId, { private_vc_hub_id: null });
      await message.reply(tr(L, '✅ Canales privados desactivados.', '✅ Private channels disabled.'));
      return;
    }

    if (sub === 'setup') {
      const hubId = message.mentions?.channels?.first()?.id;
      if (!hubId) {
        await message.reply(tr(L, '❌ Uso: `cz!privatevc setup #hub [@categoría]`.', '❌ Usage: `cz!privatevc setup #hub [@category]`.'));
        return;
      }
      const category = message.mentions?.channels?.find?.((c) => c.type === ChannelType.GuildCategory)?.id;
      await updateGuildConfig(guildId, {
        private_vc_hub_id: hubId,
        private_channels: true,
        private_category_id: category ?? cfg.private_category_id,
      });
      await message.reply(`✅ Hub de canales privados: <#${hubId}>. Únete a ese canal para crear el tuyo.`);
      return;
    }

    await message.reply(tr(L, '❌ Subcomandos: `setup`, `off`, `rename`, `limit`, `delete`, `status`.', '❌ Subcommands: `setup`, `off`, `rename`, `limit`, `delete`, `status`.'));
  },
};

export default command;
