import { ActionRowBuilder, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { LINKS } from '../config/links';
import { resolveFeatureForCommand, isPremiumCommand } from '../config/features';
import { getFeatureState, isPremiumBeta } from '../services/featureFlags';

const emojiMap: Record<string, string> = {
  ping: '🏓', pong: '🏓', help: '📖', say: '💬', directsay: '💬', confess: '🤫',
  hi: '👋', bye: '👋', profile: '👤', test: '🧪', info: 'ℹ️', stats: '📊',
  server: '🏠', user: '👤', '8ball': '🎱', serverinfo: '🏠',
  bump: '🚀', promo: '🌐', invite: '🤖', vote: '🗳️', donate: '💜', links: '🔗', status: '📊',
};

/** Emoji propio por CATEGORÍA (el menú y los campos del help lo usan). */
const categoryEmoji: Record<string, string> = {
  'Música': '🎵',
  'Diversión': '🎮',
  'Economía': '💰',
  'Información': '📖',
  'Utilidad': '🧰',
  'Moderación': '🛡️',
  'Configuración': '⚙️',
  'Niveles': '📈',
  'Social': '👥',
  'Búsqueda': '🔎',
  'Secreto': '🕵️',
  'General': '📁',
};
const catEmoji = (cat: string): string => categoryEmoji[cat] ?? '📁';

const command: BotCommand = {
  name: 'help',
  description: 'Muestra información del bot y lista de comandos disponibles',
  aliases: ['ayuda', 'comandos', 'botinfo', 'comando', 'commands', 'botayuda', 'botcomandos', 'bothelp', 'h', 'cmds', 'cmd'],
  usage: 'cz!help [comando]',
  category: 'Información',

  slashCommand: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra información del bot y lista de comandos disponibles')
    .addStringOption((option) =>
      option.setName('comando').setDescription('Nombre del comando para obtener información detallada').setRequired(false),
    ),

  async execute(message, args) {
    const commands = message.client.commands as unknown as {
      commands: Map<string, BotCommand>;
      aliases: Map<string, string>;
    };
    const allCommands = Array.from(commands.commands.values());

    // Comando específico
    if (args.length > 0) {
      const name = args[0].toLowerCase();
      const found = allCommands.find((c) => c.name === name || c.aliases.includes(name));
      if (!found) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#4f46e5')
          .setTitle('❌ Comando no encontrado')
          .setDescription(`No se encontró el comando \`${name}\``)
          .addFields({ name: '💡 Sugerencia', value: 'Usa `cz!help` para ver todos los comandos disponibles', inline: false })
          .setFooter({ text: 'CiszuBot', iconURL: message.client.user?.displayAvatarURL() })
          .setTimestamp();
        return message.reply({ embeds: [errorEmbed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#4f46e5')
        .setTitle(`📖 Comando: ${found.name}`)
        .setDescription(found.description || 'Sin descripción disponible')
        .addFields(
          { name: '📝 Uso', value: `\`${found.usage || `cz!${found.name}`}\``, inline: true },
          { name: '📂 Categoría', value: found.category || 'General', inline: true },
        );
      if (found.aliases.length > 0) {
        embed.addFields({ name: '🔗 Aliases', value: found.aliases.map((a) => `\`${a}\``).join(', '), inline: false });
      }
      const detailSlug = resolveFeatureForCommand(found);
      const detailState = detailSlug ? await getFeatureState(detailSlug) : null;
      if (detailState && !detailState.enabled) {
        embed.addFields({ name: '⛔ Desactivada', value: detailState.reason ?? 'Sin motivo especificado', inline: false });
      }
      if (isPremiumCommand(found)) {
        const beta = await isPremiumBeta();
        embed.addFields({
          name: '⭐ Premium',
          value: beta ? 'Gratis durante la beta' : 'Requiere Premium del servidor',
          inline: false,
        });
      }
      embed.setFooter({
        text: `CiszuBot • Solicitado por ${message.author.tag}`,
        iconURL: message.client.user?.displayAvatarURL(),
      }).setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // Help general
    const totalServers = message.client.guilds?.cache.size ?? 1;
    const embed = new EmbedBuilder()
      .setColor('#4f46e5')
      .setTitle('🤖 CiszuBot - Ayuda y Comandos')
      .setDescription(`¡Hola! Soy CiszuBot, el bot todo en uno. Tengo **${allCommands.length} comandos** disponibles y estoy sirviendo en **${totalServers} servidor(es)**.`)
      .setThumbnail(message.client.user?.displayAvatarURL() ?? null)
      .setFooter({
        text: `CiszuBot • Solicitado por ${message.author.tag}`,
        iconURL: message.client.user?.displayAvatarURL(),
      })
      .setTimestamp();

    const categories: Record<string, string[]> = {};
    for (const cmd of allCommands) {
      const cat = cmd.category || 'General';
      (categories[cat] ??= []).push(`\`cz!${cmd.name}\` - ${cmd.description || 'Sin descripción'}`);
    }
    for (const [cat, list] of Object.entries(categories)) {
      const sample = allCommands.find((c) => (c.category || 'General') === cat);
      const catSlug = sample ? resolveFeatureForCommand(sample) : null;
      const catState = catSlug ? await getFeatureState(catSlug) : null;
      const mark = catState && !catState.enabled ? ' · ⛔ desactivada' : '';
      embed.addFields({ name: `${catEmoji(cat)} ${cat}${mark}`, value: list.join('\n'), inline: false });
    }

    embed.addFields(
      {
        name: '🔧 Información del Bot',
        value: `• Prefijo: \`cz!\`\n• Comandos: ${allCommands.length}\n• Servidores: ${totalServers}\n• Idioma: Español`,
        inline: true,
      },
      {
        name: '🌟 Consejos Rápidos',
        value: '• Usa `cz!help <comando>` para info detallada\n• Puedes mencionarme en lugar del prefijo\n• Los comandos no distinguen mayúsculas',
        inline: true,
      },
      {
        name: '🌐 Web oficial',
        value: `Estado en vivo, comandos, votación y soporte: ${LINKS.website}`,
        inline: false,
      },
    );

    // Menú de selección por categorías (máx. 25 opciones del API de Discord)
    const catOptions = Array.from(new Set(allCommands.map((c) => c.category || 'General'))).sort();
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder('Selecciona una categoría de comandos')
      .addOptions(
        catOptions.slice(0, 25).map((cat) => ({
          label: cat,
          description: `Comandos de la categoría ${cat}`,
          value: `cat:${cat}`,
          emoji: catEmoji(cat),
        })),
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    return message.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
