import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, TextChannel } from 'discord.js';
import type { BotCommand } from '../types/command';
import { db, ciszubotSchema, eq, and, or } from '../services/supabase';
import { setProposal, getProposal, deleteProposal } from '../services/proposals';
import { getGuildConfig } from '../services/configService';
import { langOf, tr } from '../services/i18n';

async function proposalsAllowed(userId: string): Promise<boolean> {
  const rows = await db
    .select({ settings: ciszubotSchema.profiles.settingsControls })
    .from(ciszubotSchema.profiles)
    .where(eq(ciszubotSchema.profiles.id, userId))
    .limit(1);
  const settings = rows[0]?.settings as Record<string, unknown> | undefined;
  return settings?.marriageProposals !== false;
}

async function findMarriage(guildId: string, userId: string) {
  const m = ciszubotSchema.marriages;
  const rows = await db
    .select()
    .from(m)
    .where(and(eq(m.guildId, guildId), eq(m.active, true), or(eq(m.userId, userId), eq(m.partnerId, userId))))
    .limit(1);
  return rows[0] ?? null;
}

const marry: BotCommand = {
  name: 'marry',
  description: 'Pide matrimonio a alguien',
  aliases: ['casar', 'proponer'],
  usage: 'cz!marry @usuario',
  category: 'Social',
  slashCommand: new SlashCommandBuilder()
    .setName('marry')
    .setDescription('Pide matrimonio a alguien')
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true)),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply(tr(L, '❌ Uso: `cz!marry @usuario`.', '❌ Usage: `cz!marry @user`.'));
      return;
    }
    if (target.id === message.author.id) {
      await message.reply(tr(L, '❌ No puedes casarte contigo mismo... ¿o sí? 🤔', '❌ You cannot marry yourself... or can you? 🤔'));
      return;
    }
    const targetUser = await message.client.users.fetch(target.id).catch(() => null);
    if (!targetUser) {
      await message.reply(tr(L, '❌ No pude encontrar a ese usuario.', '❌ I could not find that user.'));
      return;
    }
    if (targetUser.bot) {
      await message.reply(tr(L, '❌ No puedes casarte con un bot. 😅', '❌ You cannot marry a bot. 😅'));
      return;
    }

    // Config del servidor: casamiento activado, roles excluidos y la regla de
    // admin↔admin (configurable). Reglas fijas: bots nunca; admin↔usuario y
    // usuario↔usuario siempre permitido.
    const cfg = await getGuildConfig(message.guild.id);
    if (cfg.marriage_enabled === false) {
      await message.reply(tr(L, '❌ El casamiento está desactivado en este servidor.', '❌ Marriage is disabled on this server.'));
      return;
    }
    type MemberLike = { roles: { cache: { has(id: string): boolean } }; permissions: { has(p: string): boolean } } | null;
    const proposerMember = (await message.guild.members.fetch(message.author.id).catch(() => null)) as MemberLike;
    const targetMember = (await message.guild.members.fetch(target.id).catch(() => null)) as MemberLike;
    const excluded = cfg.marriage_excluded_role_ids;
    const hasExcludedRole = (m: MemberLike): boolean => Boolean(m && excluded.some((r) => m.roles.cache.has(r)));
    if (hasExcludedRole(proposerMember) || hasExcludedRole(targetMember)) {
      await message.reply(tr(L, '❌ Una de las partes tiene un rol excluido del casamiento en este servidor.', '❌ One of the parties has a role excluded from marriage on this server.'));
      return;
    }
    const isAdmin = (m: MemberLike): boolean => Boolean(m && m.permissions.has('ManageGuild'));
    if (cfg.marriage_allow_admin_pairs === false && isAdmin(proposerMember) && isAdmin(targetMember)) {
      await message.reply(tr(L, '❌ En este servidor los administradores no pueden casarse entre ellos (regla configurable).', '❌ On this server admins cannot marry each other (configurable rule).'));
      return;
    }

    const existing = await findMarriage(message.guild.id, message.author.id);
    if (existing) {
      await message.reply(tr(L, '❌ Ya estás casado/a. Usa `cz!divorce` primero.', '❌ You are already married. Use `cz!divorce` first.'));
      return;
    }
    const targetMarriage = await findMarriage(message.guild.id, target.id);
    if (targetMarriage) {
      await message.reply(tr(L, '❌ Esa persona ya está casada.', '❌ That person is already married.'));
      return;
    }
    if (!(await proposalsAllowed(target.id))) {
      await message.reply(
        tr(
          L,
          '❌ Esa persona ha desactivado las propuestas de matrimonio en su perfil.',
          '❌ That person has disabled marriage proposals in their profile.',
        ),
      );
      return;
    }

    const channel = message.channel as TextChannel | null;
    if (!channel) return;
    const announcement = new EmbedBuilder()
      .setColor('#ff69b4')
      .setTitle(tr(L, '💍 Propuesta de matrimonio', '💍 Marriage proposal'))
      .setDescription(
        tr(
          L,
          `**${message.author.tag}** ha enviado una propuesta de matrimonio.\nLa persona elegida tiene **60 segundos** para responder en privado.`,
          `**${message.author.tag}** has sent a marriage proposal.\nThe chosen person has **60 seconds** to answer privately.`,
        ),
      )
      .setFooter({ text: 'CiszuBot • Social', iconURL: message.client.user?.displayAvatarURL() })
      .setTimestamp();
    const announcementMessage = await channel.send({ embeds: [announcement] }).catch(() => null);
    if (!announcementMessage) {
      await message.reply(tr(L, '❌ No pude publicar la propuesta en este canal.', '❌ I could not post the proposal in this channel.'));
      return;
    }
    await message.delete?.().catch(() => undefined);

    const proposal = setProposal({
      proposer: message.author.id,
      proposerTag: message.author.tag,
      target: target.id,
      guildId: message.guild.id,
      channelId: channel.id,
      announcementMessageId: announcementMessage.id,
      expires: Date.now() + 60_000,
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`marry_accept:${proposal.id}`).setLabel(tr(L, '💍 Acepto', '💍 Accept')).setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`marry_decline:${proposal.id}`).setLabel(tr(L, '💔 Rechazo', '💔 Decline')).setStyle(ButtonStyle.Danger),
    );

    const dmEmbed = new EmbedBuilder()
      .setColor('#ff69b4')
      .setTitle(tr(L, '💍 Te han propuesto matrimonio', '💍 Someone proposed to you'))
      .setDescription(
        tr(
          L,
          `**${message.author.tag}** te ha propuesto matrimonio.\n\n¿Aceptas?`,
          `**${message.author.tag}** proposed to you.\n\nDo you accept?`,
        ),
      )
      .setFooter({ text: 'CiszuBot • Social', iconURL: message.client.user?.displayAvatarURL() })
      .setTimestamp();

    const dm = await targetUser?.send({ embeds: [dmEmbed], components: [row] }).catch(() => null);
    if (!dm) {
      deleteProposal(proposal.id);
      await announcementMessage.edit({
        embeds: [
          new EmbedBuilder()
            .setColor('#6b7280')
            .setTitle(tr(L, '💔 Propuesta no entregada', '💔 Proposal not delivered'))
            .setDescription(
              tr(
                L,
                'No pude enviar la propuesta por mensaje privado. La persona debe permitir DMs del bot.',
                'I could not deliver the proposal via direct message. The person must allow DMs from the bot.',
              ),
            )
            .setTimestamp(),
        ],
        components: [],
      }).catch(() => undefined);
      return;
    }

    setTimeout(() => {
      void (async () => {
        const pending = getProposal(proposal.id);
        if (!pending) return;
        deleteProposal(proposal.id);
        const guild = message.client.guilds.cache.get(pending.guildId);
        const announceChannel = guild?.channels.cache.get(pending.channelId) as TextChannel | undefined;
        const messageToEdit = pending.announcementMessageId
          ? await announceChannel?.messages.fetch(pending.announcementMessageId).catch(() => null)
          : null;
        await messageToEdit?.edit({
          embeds: [
            new EmbedBuilder()
              .setColor('#6b7280')
              .setTitle(tr(L, '⌛ Sin respuesta', '⌛ No response'))
              .setDescription(
                tr(L, 'Nadie respondió a la propuesta de matrimonio.', 'Nobody answered the marriage proposal.'),
              )
              .setTimestamp(),
          ],
          components: [],
        }).catch(() => undefined);
      })();
    }, 60_000);
  },
};

const divorce: BotCommand = {
  name: 'divorce',
  description: 'Divórciate de tu pareja',
  aliases: ['divorcio'],
  usage: 'cz!divorce',
  category: 'Social',
  slashCommand: new SlashCommandBuilder().setName('divorce').setDescription('Divórciate de tu pareja'),

  async execute(message) {
    const L = await langOf(message);
    if (!message.guild) return;
    const marriage = await findMarriage(message.guild.id, message.author.id);
    if (!marriage) {
      await message.reply(tr(L, '❌ No estás casado/a.', '❌ You are not married.'));
      return;
    }
    const partnerId = marriage.userId === message.author.id ? marriage.partnerId : marriage.userId;
    await db
      .update(ciszubotSchema.marriages)
      .set({ active: false })
      .where(eq(ciszubotSchema.marriages.id, marriage.id));
    const embed = new EmbedBuilder()
      .setColor('#6b7280')
      .setTitle('💔 Divorcio')
      .setDescription(`**${message.author.tag}** se divorció de <@${partnerId}>.`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
};

const partner: BotCommand = {
  name: 'partner',
  description: 'Muestra tu pareja actual',
  aliases: ['pareja'],
  usage: 'cz!partner [@usuario]',
  category: 'Social',
  slashCommand: new SlashCommandBuilder()
    .setName('partner')
    .setDescription('Muestra tu pareja actual')
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(false)),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    const mentioned = message.mentions?.users?.first();
    const userId = mentioned?.id ?? message.author.id;
    const tag = mentioned?.tag ?? mentioned?.username ?? message.author.tag;
    const marriage = await findMarriage(message.guild.id, userId);
    if (!marriage) {
      await message.reply(`💔 **${tag}** está soltero/a.`);
      return;
    }
    const partnerId = marriage.userId === userId ? marriage.partnerId : marriage.userId;
    const since = Math.floor(new Date(marriage.createdAt).getTime() / 1000);
    const embed = new EmbedBuilder()
      .setColor('#ff69b4')
      .setTitle('💞 Pareja')
      .setDescription(`**${tag}** está casado/a con <@${partnerId}> desde <t:${since}:D>.`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
};

const marrysettings: BotCommand = {
  name: 'marrysettings',
  description: 'Activa o desactiva las propuestas de matrimonio en tu perfil',
  aliases: ['marryconfig', 'propuestas', 'ajustescasamiento'],
  usage: 'cz!marrysettings [on|off|status]',
  category: 'Social',
  slashCommand: new SlashCommandBuilder()
    .setName('marrysettings')
    .setDescription('Activa o desactiva las propuestas de matrimonio')
    .addStringOption((o) =>
      o
        .setName('estado')
        .setDescription('Estado de las propuestas')
        .setRequired(false)
        .addChoices(
          { name: 'Activar', value: 'on' },
          { name: 'Desactivar', value: 'off' },
          { name: 'Ver estado', value: 'status' },
        ),
    ),

  async execute(message, args) {
    const L = await langOf(message);
    const sub = (args[0] ?? 'status').toLowerCase();
    const rows = await db
      .select({ settings: ciszubotSchema.profiles.settingsControls })
      .from(ciszubotSchema.profiles)
      .where(eq(ciszubotSchema.profiles.id, message.author.id))
      .limit(1);
    if (!rows[0]) {
      await message.reply(
        tr(
          L,
          '❌ Necesitas una cuenta CISZU ID vinculada para guardar esta preferencia.',
          '❌ You need a linked CISZU ID account to save this preference.',
        ),
      );
      return;
    }
    const settings = (rows[0].settings as Record<string, unknown>) ?? {};
    const current = settings.marriageProposals !== false;
    if (sub === 'status') {
      await message.reply(
        tr(
          L,
          `💍 Propuestas de matrimonio: **${current ? 'activadas' : 'desactivadas'}**.`,
          `💍 Marriage proposals: **${current ? 'enabled' : 'disabled'}**.`,
        ),
      );
      return;
    }
    if (sub !== 'on' && sub !== 'off') {
      await message.reply(tr(L, '❌ Uso: `cz!marrysettings [on|off|status]`.', '❌ Usage: `cz!marrysettings [on|off|status]`.'));
      return;
    }
    const enabled = sub === 'on';
    await db
      .update(ciszubotSchema.profiles)
      .set({ settingsControls: { ...settings, marriageProposals: enabled }, updatedAt: new Date() })
      .where(eq(ciszubotSchema.profiles.id, message.author.id));
    await message.reply(
      tr(
        L,
        `✅ Propuestas de matrimonio **${enabled ? 'activadas' : 'desactivadas'}**.`,
        `✅ Marriage proposals **${enabled ? 'enabled' : 'disabled'}**.`,
      ),
    );
  },
};

export default [marry, divorce, partner, marrysettings];
