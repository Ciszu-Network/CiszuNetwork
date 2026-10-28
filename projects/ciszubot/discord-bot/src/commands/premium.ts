import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { LINKS, BOT_FOOTER, BOT_ASSETS } from '../config/links';
import { isPremiumBeta, isPremiumGuild } from '../services/featureFlags';
import { db, ciszubotSchema, eq } from '../services/supabase';
import { langOf, tr } from '../services/i18n';

const command: BotCommand = {
  name: 'premium',
  description: 'Información y estado de CiszuBot Premium',
  aliases: ['vip'],
  usage: 'cz!premium [status]',
  category: 'Información',

  slashCommand: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Información y estado de CiszuBot Premium')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) => s.setName('info').setDescription('Información de Premium'))
    .addSubcommand((s) => s.setName('status').setDescription('Estado del premium en este servidor')),

  async execute(message, args) {
    const L = await langOf(message);
    const beta = await isPremiumBeta();
    const sub = (args[0] ?? '').toLowerCase();

    if (sub === 'status') {
      if (!message.guild) return;
      const active = await isPremiumGuild(message.guild.id);
      const rows = await db
        .select()
        .from(ciszubotSchema.premiumGuilds)
        .where(eq(ciszubotSchema.premiumGuilds.guildId, message.guild.id))
        .limit(1);
      const row = rows[0];
      const embed = new EmbedBuilder()
        .setColor(active ? '#22c55e' : '#6b7280')
        .setTitle(tr(L, '⭐ Premium de este servidor', '⭐ This server\'s Premium'))
        .setDescription(
          `**Estado:** ${active ? '✅ Activo' : '⛔ No activo'}\n` +
            `**Plan:** ${row?.plan ?? '—'}\n` +
            `**Expira:** ${row?.expiresAt ? `<t:${Math.floor(row.expiresAt.getTime() / 1000)}:D>` : 'sin expiración'}\n` +
            (beta ? '\n🧪 **Beta Trial:** actívalo en Preferencias del bot y en General del servidor.' : ''),
        )
        .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (sub === 'activate' || sub === 'deactivate') {
      await message.reply(
        tr(
          L,
          '🔐 La activación Premium ahora se gestiona desde el dashboard: primero en **Preferencias del bot** de tu cuenta y después en **General** del servidor.',
          '🔐 Premium activation is now managed from the dashboard: first in your account **Bot preferences**, then in the server **General** section.',
        ),
      );
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#fbbf24')
      .setTitle(tr(L, '⭐ CiszuBot Premium', '⭐ CiszuBot Premium'))
      .setThumbnail(BOT_ASSETS.isotype)
      .setImage(BOT_ASSETS.banner)
      .setDescription(
        'Premium desbloquea funciones exclusivas para tu servidor: música, búsqueda, embeds personalizados, ' +
          'drops ilimitados y más.\n\n' +
          `Precios y detalles: ${LINKS.website}/premium\n\n` +
          'Activa Premium desde el dashboard: Preferencias del bot de tu cuenta → General del servidor. Consulta el estado con `cz!premium status`.',
      )
      .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    if (beta) {
      embed.addFields({
        name: tr(L, '🧪 Beta Trial', '🧪 Beta Trial'),
        value: tr(
          L,
          'Tienes Premium Dorado temporal. Actívalo en **Preferencias del bot** de tu cuenta y después en **General** del servidor.',
          'You have temporary Gold Premium. Enable it in your account **Bot preferences** and then in the server **General** section.',
        ),
      });
    }

    await message.reply({ embeds: [embed] });
  },
};

export default command;
