import { PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import type { BotCommand } from '../types/command';
import { getGuildConfig } from '../services/configService';
import { createSuggestion, decideSuggestion } from '../services/suggestions';
import { isStaff } from '../utils/permissions';

/**
 * cz!suggest <texto> — envía una sugerencia al canal configurado.
 * cz!suggest aprobar <id> [razón] — staff: aprueba la sugerencia.
 * cz!suggest cancelar <id> [razón] — staff: cancela la sugerencia.
 */
const command: BotCommand = {
  name: 'suggest',
  description: 'Envía una sugerencia (y el staff la aprueba o cancela)',
  aliases: ['sugerencia', 'sugerir'],
  usage: 'cz!suggest <texto> · cz!suggest aprobar/cancelar <id> [razón]',
  category: 'Utilidad',
  slashCommand: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Envía una sugerencia al canal de sugerencias')
    .addStringOption((o) =>
      o
        .setName('accion')
        .setDescription('Qué hacer')
        .setRequired(false)
        .addChoices(
          { name: 'Enviar sugerencia', value: 'enviar' },
          { name: 'Aprobar (staff)', value: 'aprobar' },
          { name: 'Cancelar (staff)', value: 'cancelar' },
        ),
    )
    .addStringOption((o) => o.setName('texto').setDescription('Tu sugerencia').setRequired(false).setMaxLength(1000))
    .addIntegerOption((o) => o.setName('id').setDescription('ID de la sugerencia (aprobar/cancelar)').setRequired(false))
    .addStringOption((o) => o.setName('razon').setDescription('Razón de la decisión (staff)').setRequired(false)),

  async execute(message, args) {
    if (!message.guild) return;
    const cfg = await getGuildConfig(message.guild.id);
    const first = (args[0] ?? '').toLowerCase();

    if (first === 'aprobar' || first === 'cancelar') {
      const staff = Boolean(message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) || (await isStaff(message).catch(() => false));
      if (!staff) {
        await message.reply('❌ Solo el staff puede aprobar o cancelar sugerencias.');
        return;
      }
      const id = parseInt(args[1] ?? '', 10);
      if (!id || Number.isNaN(id)) {
        await message.reply('❌ Uso: `cz!suggest aprobar/cancelar <id> [razón]`');
        return;
      }
      const reason = args.slice(2).join(' ') || null;
      const res = await decideSuggestion(message.client, id, message.author.id, first === 'aprobar' ? 'approved' : 'cancelled', reason);
      await message.reply(res.ok ? `✅ Sugerencia #${id} ${first === 'aprobar' ? 'aprobada' : 'cancelada'}.` : `❌ ${res.reason ?? 'No se pudo decidir.'}`);
      return;
    }

    if (!cfg.suggestions_enabled || !cfg.suggestions_channel_id) {
      await message.reply('❌ El sistema de sugerencias no está activado o no tiene canal configurado (dashboard → Sugerencias).');
      return;
    }
    const channel = message.guild.channels.cache.get(cfg.suggestions_channel_id) as TextChannel | undefined;
    if (!channel || !channel.isTextBased()) {
      await message.reply('❌ El canal de sugerencias configurado ya no existe o no es de texto.');
      return;
    }

    const content = (first === 'enviar' ? args.slice(1) : args).join(' ').trim();
    if (!content) {
      await message.reply('❌ Uso: `cz!suggest <texto de tu sugerencia>`');
      return;
    }

    const memberRoles = message.member
      ? [...(message.member.roles as unknown as { cache: Map<string, unknown> }).cache.keys()]
      : [];
    const res = await createSuggestion(
      message.guild.id,
      channel,
      { id: message.author.id, tag: message.author.tag, displayAvatarURL: () => message.author.displayAvatarURL() },
      content,
      cfg,
      memberRoles,
    );
    if (res.ok) {
      await message.reply(`✅ Sugerencia **#${res.id}** enviada a <#${channel.id}>. ¡La comunidad puede votar!`);
    } else {
      await message.reply(`❌ ${res.reason ?? 'No se pudo enviar la sugerencia.'}`);
    }
  },
};

export default command;
