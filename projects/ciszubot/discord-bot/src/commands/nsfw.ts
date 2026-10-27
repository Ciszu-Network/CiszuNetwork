import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { getGuildConfig, isNsfwUnlocked } from '../services/configService';
import {
  NSFW_BASES,
  NSFW_STYLES,
  effectiveGender,
  isNsfwSelectionEnabled,
  nsfwAliasesFor,
  resolveNsfwSelection,
} from '../services/nsfw/catalog';
import type { NsfwBaseDef } from '../services/nsfw/catalog';
import { fetchNsfwMedia } from '../services/nsfw/providers';
import { langOf, tr } from '../services/i18n';

function buildSlashCommand(def: NsfwBaseDef) {
  const builder = new SlashCommandBuilder()
    .setName(def.base)
    .setDescription(def.description)
    .setNSFW(true)
    .addStringOption((option) =>
      option
        .setName('estilo')
        .setDescription('Estilo del contenido')
        .setRequired(false)
        .addChoices(...NSFW_STYLES.map((style) => ({ name: style, value: style }))),
    )
    .addUserOption((option) =>
      option.setName('usuario').setDescription('Usuario con quien realizar la acción').setRequired(false),
    );

  if (def.genders.length > 0) {
    builder.addStringOption((option) =>
      option
        .setName('genero')
        .setDescription('Género del contenido')
        .setRequired(false)
        .addChoices(...def.genders.map((gender) => ({ name: gender, value: gender }))),
    );
  }

  const variants = def.purrbotVariants;
  if (variants) {
    builder.addStringOption((option) =>
      option
        .setName('variante')
        .setDescription('Variante del trío')
        .setRequired(false)
        .addChoices(...Object.keys(variants).map((variant) => ({ name: variant, value: variant }))),
    );
  }

  return builder;
}

async function runNsfwCommand(
  message: Parameters<BotCommand['execute']>[0],
  args: string[],
  invokedName: string,
): Promise<unknown> {
  const L = await langOf(message);
  if (!message.guild) return;
  const channel = message.channel as { nsfw?: boolean } | null;
  if (!channel?.nsfw) {
    return message.reply(
      tr(
        L,
        '🔞 Este comando solo funciona en canales marcados como **NSFW** (edad restringida).',
        '🔞 This command only works in channels marked as **NSFW** (age-restricted).',
      ),
    );
  }

  const cfg = await getGuildConfig(message.guild.id);
  if (!isNsfwUnlocked(cfg)) {
    return message.reply(
      tr(
        L,
        '❌ El apartado **+18** está bloqueado. Activa los tres candados en el dashboard → **General** → **+18**.',
        '❌ The **+18** section is locked. Enable all three locks in the dashboard → **General** → **+18**.',
      ),
    );
  }
  if (!cfg.nsfw_commands_enabled) {
    return message.reply(
      tr(
        L,
        '❌ Los comandos **+18** están desactivados (dashboard → +18 → Comandos).',
        '❌ The **+18** commands are disabled (dashboard → +18 → Commands).',
      ),
    );
  }

  const selection = resolveNsfwSelection(invokedName, args);
  if (!selection) {
    return message.reply(
      tr(L, '❌ Comando +18 no reconocido. Usa `cz!help`.', '❌ Unknown +18 command. Use `cz!help`.'),
    );
  }
  if (!isNsfwSelectionEnabled(selection, cfg.nsfw_content)) {
    return message.reply(
      tr(
        L,
        '🔞 Este contenido está desactivado por las preferencias +18 de este servidor.',
        '🔞 This content is disabled by this server’s +18 preferences.',
      ),
    );
  }

  const target = message.mentions?.users?.first() ?? null;
  const gender = effectiveGender(selection, cfg.nsfw_content);
  const media = await fetchNsfwMedia(selection, gender);
  if (!media) {
    return message.reply(
      tr(
        L,
        '❌ No hay resultados disponibles para esa combinación. Prueba otro estilo o género.',
        '❌ No results available for that combination. Try another style or gender.',
      ),
    );
  }

  const embed = new EmbedBuilder()
    .setColor(BOT_COLORS.primary)
    .setTitle(`🔞 ${media.title}`)
    .setImage(media.url)
    .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
    .setTimestamp();
  if (media.link) {
    embed.setDescription(tr(L, `[Ver el vídeo completo](${media.link})`, `[Watch the full video](${media.link})`));
  }
  embed.addFields(
    { name: tr(L, 'Fuente', 'Source'), value: media.source, inline: true },
    { name: tr(L, 'Estilo', 'Style'), value: selection.style, inline: true },
    { name: tr(L, 'Género', 'Gender'), value: gender, inline: true },
    { name: tr(L, 'Contenido', 'Content'), value: tr(L, 'Adultos (+18)', 'Adults (+18)'), inline: true },
  );
  if (target) {
    embed.addFields({
      name: tr(L, 'Con', 'With'),
      value: `<@${target.id}>`,
      inline: true,
    });
  }
  return message.reply({ embeds: [embed] });
}

const commands: BotCommand[] = NSFW_BASES.map((def) => ({
  name: def.base,
  description: def.description,
  aliases: nsfwAliasesFor(def),
  usage: def.usage ?? `cz!${def.base} [estilo] [género] [@usuario]`,
  category: '+18',
  slashCommand: buildSlashCommand(def),
  execute(message, args, invokedName) {
    return runNsfwCommand(message, args, invokedName ?? def.base);
  },
}));

export default commands;
