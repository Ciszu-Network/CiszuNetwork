import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { CUSTOM_FREE_LIMIT, createCustomCommand, deleteCustomCommand, listCustomCommands, normalizeTrigger } from '../services/customCommands';
import { isStaff } from '../utils/permissions';

/**
 * cz!customcmd add <trigger> <respuesta> — crea un comando propio (cz!<trigger>).
 * cz!customcmd del <trigger> — borra (creador o staff).
 * cz!customcmd list — lista los del servidor.
 * Límite: 5 free / ilimitados premium. Variables: {user} {username} {guild} {members}.
 */
const command: BotCommand = {
  name: 'customcmd',
  description: 'Crea tus propios comandos del servidor (cz!<trigger>)',
  aliases: ['cc', 'miscomandos'],
  usage: 'cz!customcmd add <trigger> <respuesta> · del <trigger> · list',
  category: 'Utilidad',
  slashCommand: new SlashCommandBuilder()
    .setName('customcmd')
    .setDescription('Comandos personalizados del servidor')
    .addStringOption((o) =>
      o
        .setName('accion')
        .setDescription('Qué hacer')
        .setRequired(true)
        .addChoices(
          { name: 'Agregar', value: 'add' },
          { name: 'Borrar', value: 'del' },
          { name: 'Listar', value: 'list' },
        ),
    )
    .addStringOption((o) => o.setName('trigger').setDescription('Palabra del comando (a-z, 0-9; ej: reglas)').setRequired(false))
    .addStringOption((o) => o.setName('respuesta').setDescription('Texto que responderá el bot').setRequired(false)),

  async execute(message, args) {
    if (!message.guild) return;
    const sub = (args[0] ?? 'list').toLowerCase();
    const client = message.client;

    if (sub === 'add' || sub === 'agregar') {
      const rawTrigger = args[1] ?? '';
      const trigger = normalizeTrigger(rawTrigger);
      if (!trigger) {
        await message.reply('❌ Trigger inválido. Usa solo letras/números (2-20), ej: `cz!customcmd add reglas Lee las reglas del servidor`.');
        return;
      }
      if (client.commands.get(trigger)) {
        await message.reply(`❌ \`cz!${trigger}\` ya es un comando del bot. Elige otra palabra.`);
        return;
      }
      const response = args.slice(2).join(' ').trim();
      if (!response) {
        await message.reply('❌ Falta la respuesta. Uso: `cz!customcmd add <trigger> <respuesta>`');
        return;
      }
      const res = await createCustomCommand(message.guild.id, trigger, response, message.author.id);
      await message.reply(
        res.ok
          ? `✅ Creado: \`cz!${trigger}\` responderá tu texto. Variables: {user} {username} {guild} {members}.`
          : `❌ ${res.reason ?? 'No se pudo crear.'}`,
      );
      return;
    }

    if (sub === 'del' || sub === 'borrar' || sub === 'remove') {
      const trigger = normalizeTrigger(args[1] ?? '');
      if (!trigger) {
        await message.reply('❌ Uso: `cz!customcmd del <trigger>`');
        return;
      }
      const staff = Boolean(message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) || (await isStaff(message).catch(() => false));
      const res = await deleteCustomCommand(message.guild.id, trigger, { id: message.author.id, staff });
      await message.reply(res.ok ? `✅ Borrado \`cz!${trigger}\`.` : `❌ ${res.reason ?? 'No se pudo borrar.'}`);
      return;
    }

    // list
    const rows = await listCustomCommands(message.guild.id);
    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.primary)
      .setTitle('🧩 Comandos personalizados')
      .setDescription(
        rows.length === 0
          ? `Todavía no hay comandos personalizados.\nCrea uno con \`cz!customcmd add <trigger> <respuesta>\` (hasta ${CUSTOM_FREE_LIMIT} en free; premium ilimitados).`
          : rows.map((r) => `• \`cz!${r.trigger}\` — ${r.uses} uso(s)${r.createdBy ? ` · por <@${r.createdBy}>` : ''}`).join('\n'),
      )
      .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
};

export default command;
