import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand, SimulatedMessage } from '../types/command';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { db, ciszubotSchema, eq, and, desc, sql } from '../services/supabase';
import { langOf, tr } from '../services/i18n';

async function countInvites(guildId: string, userId: string): Promise<number> {
  const rows = await db
    .select({ total: sql<number>`coalesce(sum(${ciszubotSchema.invites.points}), 0)` })
    .from(ciszubotSchema.invites)
    .where(and(eq(ciszubotSchema.invites.guildId, guildId), eq(ciszubotSchema.invites.inviterId, userId)));
  return Number(rows[0]?.total ?? 0);
}

async function topInvites(guildId: string, limit = 10): Promise<Array<{ userId: string; total: number }>> {
  const rows = await db
    .select({
      userId: ciszubotSchema.invites.inviterId,
      total: sql<number>`coalesce(sum(${ciszubotSchema.invites.points}), 0)`,
    })
    .from(ciszubotSchema.invites)
    .where(eq(ciszubotSchema.invites.guildId, guildId))
    .groupBy(ciszubotSchema.invites.inviterId)
    .orderBy(desc(sql`coalesce(sum(${ciszubotSchema.invites.points}), 0)`))
    .limit(limit);
  return rows.map((r) => ({ userId: r.userId, total: Number(r.total) }));
}

const command: BotCommand = {
  name: 'invites',
  description: 'Muestra tus invitaciones (y las de otros)',
  aliases: ['invitaciones', 'invitacionescontador'],
  usage: 'cz!invites [@usuario | points N | reward N @rol | channel #canal | message <texto> | reset @usuario]',
  category: 'Social',
  slashCommand: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Muestra tus invitaciones')
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(false)),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const guildId = message.guild.id;
    const cfg = await getGuildConfig(guildId);
    const sub = (args[0] ?? '').toLowerCase();

    if (sub === 'points') {
      if (!(await isStaff(message))) {
        await message.reply(STAFF_ERROR);
        return;
      }
      const points = parseInt(args[1] ?? '', 10);
      if (isNaN(points) || points < 1 || points > 100) {
        await message.reply(tr(L, '❌ Uso: `cz!invites points <1-100>` (puntos por invitación válida).', '❌ Usage: `cz!invites points <1-100>` (points per valid invite).'));
        return;
      }
      await updateGuildConfig(guildId, { invite_points_per: points });
      await message.reply(tr(L, `✅ Cada invitación válida dará **${points} punto(s)** al invitador.`, `✅ Each valid invite will give **${points} point(s)** to the inviter.`));
      return;
    }

    if (sub === 'channel') {
      if (!(await isStaff(message))) {
        await message.reply(STAFF_ERROR);
        return;
      }
      if ((args[1] ?? '').toLowerCase() === 'off') {
        await updateGuildConfig(guildId, { invite_channel_id: null });
        await message.reply(tr(L, '✅ Avisos de invitación desactivados.', '✅ Invite announcements disabled.'));
        return;
      }
      const channel = message.mentions?.channels?.first();
      if (!channel || (channel.type !== 0 && channel.type !== 5)) {
        await message.reply(tr(L, '❌ Uso: `cz!invites channel #canal` (o `off`).', '❌ Usage: `cz!invites channel #channel` (or `off`).'));
        return;
      }
      await updateGuildConfig(guildId, { invite_channel_id: channel.id });
      await message.reply(tr(L, `✅ Los avisos de invitación se enviarán a <#${channel.id}>.`, `✅ Invite announcements will be sent to <#${channel.id}>.`));
      return;
    }

    if (sub === 'message') {
      if (!(await isStaff(message))) {
        await message.reply(STAFF_ERROR);
        return;
      }
      const text = args.slice(1).join(' ').trim();
      if (!text) {
        await message.reply(tr(L, '❌ Uso: `cz!invites message <texto>` con `{user}`, `{inviter}`, `{count}` y `{guild}`.', '❌ Usage: `cz!invites message <text>` with `{user}`, `{inviter}`, `{count}` and `{guild}`.'));
        return;
      }
      await updateGuildConfig(guildId, { invite_message: text.slice(0, 2000) });
      await message.reply(tr(L, '✅ Mensaje de invitación actualizado.', '✅ Invite message updated.'));
      return;
    }

    if (sub === 'reward') {
      if (!(await isStaff(message))) {
        await message.reply(STAFF_ERROR);
        return;
      }
      if ((args[1] ?? '').toLowerCase() === 'remove') {
        const threshold = parseInt(args[2] ?? '', 10);
        if (isNaN(threshold)) {
          await message.reply(tr(L, '❌ Uso: `cz!invites reward remove <n>`.', '❌ Usage: `cz!invites reward remove <n>`.'));
          return;
        }
        const rewards = cfg.invite_rewards.filter((r) => r.invites !== threshold);
        await updateGuildConfig(guildId, { invite_rewards: rewards });
        await message.reply(tr(L, `✅ Recompensa de **${threshold}** invitaciones eliminada.`, `✅ Reward for **${threshold}** invites removed.`));
        return;
      }
      const threshold = parseInt(args[1] ?? '', 10);
      const roleId = message.mentions?.roles?.first()?.id;
      if (isNaN(threshold) || threshold < 1 || !roleId) {
        await message.reply(tr(L, '❌ Uso: `cz!invites reward <n> @rol` (ej: `cz!invites reward 10 @Activo`).', '❌ Usage: `cz!invites reward <n> @role` (e.g.: `cz!invites reward 10 @Active`).'));
        return;
      }
      const rewards = [...cfg.invite_rewards.filter((r) => r.invites !== threshold), { invites: threshold, role_id: roleId }];
      await updateGuildConfig(guildId, { invite_rewards: rewards });
      await message.reply(tr(L, `✅ A las **${threshold}** invitaciones se dará el rol <@&${roleId}>.`, `✅ At **${threshold}** invites the role <@&${roleId}> will be granted.`));
      return;
    }

    if (sub === 'reset') {
      if (!(await isStaff(message))) {
        await message.reply(STAFF_ERROR);
        return;
      }
      const target = message.mentions?.users?.first();
      if (!target) {
        await message.reply(tr(L, '❌ Uso: `cz!invites reset @usuario`.', '❌ Usage: `cz!invites reset @user`.'));
        return;
      }
      await db
        .delete(ciszubotSchema.invites)
        .where(and(eq(ciszubotSchema.invites.guildId, guildId), eq(ciszubotSchema.invites.inviterId, target.id)));
      await message.reply(tr(L, `✅ Invitaciones de **${target.tag ?? target.username}** reseteadas.`, `✅ Invites for **${target.tag ?? target.username}** reset.`));
      return;
    }

    const mentioned = message.mentions?.users?.first();
    const userId = mentioned?.id ?? message.author.id;
    const tag = mentioned?.tag ?? mentioned?.username ?? message.author.tag;
    const total = await countInvites(guildId, userId);
    const top = await topInvites(guildId);

    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(tr(L, `📨 Invitaciones de ${tag}`, `📨 ${tag}'s invites`))
      .setDescription(tr(L, `**${total}** punto(s) por invitaciones válidas.`, `**${total}** point(s) from valid invites.`))
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    if (top.length > 0) {
      embed.addFields({
        name: tr(L, '🏆 Top invitadores', '🏆 Top inviters'),
        value: top
          .map((t, i) => `**${i + 1}.** <@${t.userId}> — ${t.total} ${tr(L, 'punto(s)', 'point(s)')}`)
          .join('\n')
          .slice(0, 1024),
        inline: false,
      });
    }
    if (cfg.invite_rewards.length > 0) {
      embed.addFields({
        name: tr(L, '🎁 Recompensas', '🎁 Rewards'),
        value: cfg.invite_rewards
          .sort((a, b) => a.invites - b.invites)
          .map((r) => `${r.invites} ${tr(L, 'invitaciones', 'invites')} → <@&${r.role_id}>`)
          .join('\n'),
        inline: false,
      });
    }

    await message.reply({ embeds: [embed] });
  },
};

export default command;
