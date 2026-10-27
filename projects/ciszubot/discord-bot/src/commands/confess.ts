import { EmbedBuilder, SlashCommandBuilder, TextChannel } from 'discord.js';
import { db, ciszubotSchema } from '@ciszunetwork/db';
import type { BotCommand } from '../types/command';
import { getGuildConfig } from '../services/configService';
import { langOf, tr } from '../services/i18n';
import { logger } from '../services/logger';

type ConfessMode = 'anonymous' | 'public';

const MODE_ALIASES: Record<string, ConfessMode> = {
  anon: 'anonymous',
  anonimo: 'anonymous',
  anónimo: 'anonymous',
  anonymous: 'anonymous',
  public: 'public',
  publica: 'public',
  pública: 'public',
};

const command: BotCommand = {
  name: 'confess',
  description: 'Publica una confesión anónima o pública',
  aliases: ['confesar', 'anonimo', 'secreto', 'c', 'confession'],
  usage: 'cz!confess [anon|public] <mensaje>',
  category: 'Diversión',

  slashCommand: new SlashCommandBuilder()
    .setName('confess')
    .setDescription('Publica una confesión anónima o pública')
    .addStringOption((option) =>
      option
        .setName('modo')
        .setDescription('Anónima o pública')
        .setRequired(false)
        .addChoices(
          { name: 'Anónima', value: 'anonymous' },
          { name: 'Pública', value: 'public' },
        ),
    )
    .addStringOption((option) =>
      option.setName('mensaje').setDescription('El mensaje que quieres confesar').setRequired(true),
    ),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) {
      await message.reply(tr(L, '❌ Las confesiones solo funcionan en servidores.', '❌ Confessions only work in servers.'));
      return;
    }

    const cfg = await getGuildConfig(message.guild.id);
    const first = (args[0] ?? '').toLowerCase();
    let mode: ConfessMode | null = MODE_ALIASES[first] ?? null;
    const body = mode ? args.slice(1).join(' ').trim() : args.join(' ').trim();

    if (!body) {
      await message.reply(
        tr(
          L,
          '❌ Debes escribir un mensaje. Uso: `cz!confess [anon|public] <mensaje>`.',
          '❌ You must write a message. Usage: `cz!confess [anon|public] <message>`.',
        ),
      );
      return;
    }

    if (!mode) {
      if (cfg.confess_allow_anonymous) mode = 'anonymous';
      else if (cfg.confess_allow_public) mode = 'public';
    }
    if (!mode) {
      await message.reply(
        tr(
          L,
          '❌ Las confesiones están desactivadas en este servidor.',
          '❌ Confessions are disabled in this server.',
        ),
      );
      return;
    }
    if (mode === 'anonymous' && !cfg.confess_allow_anonymous) {
      await message.reply(
        tr(L, '❌ Las confesiones anónimas están desactivadas.', '❌ Anonymous confessions are disabled.'),
      );
      return;
    }
    if (mode === 'public' && !cfg.confess_allow_public) {
      await message.reply(
        tr(L, '❌ Las confesiones públicas están desactivadas.', '❌ Public confessions are disabled.'),
      );
      return;
    }

    const memberRoles = message.member
      ? [...(message.member.roles as unknown as { cache: Map<string, unknown> }).cache.keys()]
      : [];
    if (cfg.confess_excluded_role_ids.length > 0 && memberRoles.some((r) => cfg.confess_excluded_role_ids.includes(r))) {
      await message.reply(
        tr(L, '❌ Tienes un rol excluido de las confesiones.', '❌ You have a role excluded from confessions.'),
      );
      return;
    }

    const anonymous = mode === 'anonymous';
    const embed = new EmbedBuilder()
      .setColor(anonymous ? '#8b5cf6' : '#22c55e')
      .setTitle(
        anonymous
          ? tr(L, '🤫 Confesión Anónima', '🤫 Anonymous Confession')
          : tr(L, '💬 Confesión Pública', '💬 Public Confession'),
      )
      .setDescription(body)
      .addFields({
        name: tr(L, '👤 Autor', '👤 Author'),
        value: anonymous
          ? tr(L, 'Usuario Anónimo', 'Anonymous User')
          : `<@${message.author.id}> (${message.author.tag})`,
        inline: true,
      })
      .setFooter({ text: 'CiszuBot', iconURL: message.client.user?.displayAvatarURL() })
      .setTimestamp();

    let targetChannel = message.channel as TextChannel | null;
    if (cfg.confess_channel_id) {
      const configured = message.guild.channels.cache.get(cfg.confess_channel_id) as TextChannel | undefined;
      if (configured && configured.isTextBased()) targetChannel = configured;
    }
    const sent = await targetChannel?.send({ embeds: [embed] });

    try {
      await db.insert(ciszubotSchema.confessions).values({
        guildId: message.guild.id,
        userId: message.author.id,
        anonymous,
        content: body.slice(0, 4000),
        channelId: targetChannel?.id ?? null,
        messageId: sent?.id ?? null,
      });
    } catch (error) {
      logger.warn('confession record:', error);
    }

    try {
      await message.delete?.();
    } catch {
      const deleteEmbed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle(tr(L, '⚠️ Advertencia', '⚠️ Warning'))
        .setDescription(
          tr(
            L,
            'No pude borrar tu mensaje original. Asegúrate de que el bot tenga permisos para eliminar mensajes.',
            'I could not delete your original message. Make sure the bot has permission to delete messages.',
          ),
        )
        .setFooter({ text: 'CiszuBot', iconURL: message.client.user?.displayAvatarURL() })
        .setTimestamp();
      const temp = await message.reply({ embeds: [deleteEmbed] });
      setTimeout(() => {
        (temp as { delete?: () => Promise<unknown> }).delete?.().catch(() => undefined);
      }, 10000);
    }
  },
};

export default command;
