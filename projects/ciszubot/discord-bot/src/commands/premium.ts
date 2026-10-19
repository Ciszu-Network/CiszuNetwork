import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import type { BotCommand } from '../types/command';
import { LINKS, BOT_COLORS, BOT_FOOTER, BOT_ASSETS } from '../config/links';
import { isPremiumBeta, isPremiumGuild } from '../services/featureFlags';
import { db, ciszubotSchema, eq, sql } from '../services/supabase';
import { langOf, tr } from '../services/i18n';

const command: BotCommand = {
  name: 'premium',
  description: 'Información y activación de CiszuBot Premium',
  aliases: ['vip'],
  usage: 'cz!premium [activate plan | deactivate | status]',
  category: 'Información',

  slashCommand: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Información y activación de CiszuBot Premium')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) => s.setName('info').setDescription('Información de Premium'))
    .addSubcommand((s) => s.setName('status').setDescription('Estado del premium en este servidor'))
    .addSubcommand((s) =>
      s
        .setName('activate')
        .setDescription('Activa Premium para todo el servidor (solo admins)')
        .addStringOption((o) =>
          o
            .setName('plan')
            .setDescription('Plan vinculado')
            .setRequired(false)
            .addChoices({ name: 'Beta (gratis)', value: 'beta' }, { name: 'Premium', value: 'premium' }),
        ),
    )
    .addSubcommand((s) => s.setName('deactivate').setDescription('Desactiva Premium en este servidor (solo admins)')),

  async execute(message, args) {
    const L = await langOf(message);
    const beta = await isPremiumBeta();
    const sub = (args[0] ?? '').toLowerCase();

    const isAdmin = Boolean(message.member?.permissions.has(PermissionsBitField.Flags.ManageGuild));

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
            (beta ? '\n🧪 **BETA activa:** todas las funciones premium son gratis por ahora.' : ''),
        )
        .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (sub === 'activate' || sub === 'deactivate') {
      if (!message.guild) return;
      if (!isAdmin) {
        await message.reply(tr(L, '❌ Solo los administradores pueden gestionar el Premium del servidor.', '❌ Only administrators can manage the server Premium.'));
        return;
      }
      if (sub === 'deactivate') {
        await db.delete(ciszubotSchema.premiumGuilds).where(eq(ciszubotSchema.premiumGuilds.guildId, message.guild.id));
        await message.reply(tr(L, '✅ Premium desactivado en este servidor.', '✅ Premium disabled on this server.'));
        return;
      }
      const plan = (args[1] ?? '').toLowerCase() === 'premium' ? 'premium' : 'beta';
      await db
        .insert(ciszubotSchema.premiumGuilds)
        .values({ guildId: message.guild.id, plan, status: 'active' })
        .onConflictDoUpdate({
          target: ciszubotSchema.premiumGuilds.guildId,
          set: { plan, status: 'active', updatedAt: sql`now()` },
        });
      const embed = new EmbedBuilder()
        .setColor('#fbbf24')
        .setTitle(tr(L, '⭐ ¡Premium activado!', '⭐ Premium activated!'))
        .setDescription(
          `El plan **${plan}** quedó activo para **todo el servidor**.\n\n` +
            'Funciones desbloqueadas: música, búsqueda, embeds personalizados, drops ilimitados y más.',
        )
        .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
        .setTimestamp();
      await message.reply({ embeds: [embed] });
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
          'Admins: `cz!premium activate` · `cz!premium status` · `cz!premium deactivate`',
      )
      .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    if (beta) {
      embed.addFields({
        name: tr(L, '🧪 BETA — gratis por ahora', '🧪 BETA — free for now'),
        value: 'Todas las funciones premium son **gratis** durante la beta. ¡Disfrútalas sin costo!',
      });
    }

    await message.reply({ embeds: [embed] });
  },
};

export default command;
