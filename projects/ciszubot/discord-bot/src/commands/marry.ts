import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { db, ciszubotSchema, eq, and, or } from '../services/supabase';
import { setProposal } from '../services/proposals';
import { getGuildConfig } from '../services/configService';

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
    if (!message.guild) return;
    const target = message.mentions?.users?.first();
    if (!target) {
      await message.reply('❌ Uso: `cz!marry @usuario`.');
      return;
    }
    if (target.id === message.author.id) {
      await message.reply('❌ No puedes casarte contigo mismo... ¿o sí? 🤔');
      return;
    }
    const targetUser = await message.client.users.fetch(target.id).catch(() => null);
    if (targetUser?.bot) {
      await message.reply('❌ No puedes casarte con un bot. 😅');
      return;
    }

    // Config del servidor: casamiento activado y roles excluidos (por defecto,
    // si no hay lista configurada, se excluye a admins — y los bots siempre).
    const cfg = await getGuildConfig(message.guild.id);
    if (cfg.marriage_enabled === false) {
      await message.reply('❌ El casamiento está desactivado en este servidor.');
      return;
    }
    type MemberLike = { roles: { cache: { has(id: string): boolean } }; permissions: { has(p: string): boolean } } | null;
    const proposerMember = (await message.guild.members.fetch(message.author.id).catch(() => null)) as MemberLike;
    const targetMember = (await message.guild.members.fetch(target.id).catch(() => null)) as MemberLike;
    const excluded = cfg.marriage_excluded_role_ids;
    const isExcluded = (m: MemberLike): boolean =>
      Boolean(m && (excluded.some((r) => m.roles.cache.has(r)) || (excluded.length === 0 && m.permissions.has('ManageGuild'))));
    if (isExcluded(proposerMember) || isExcluded(targetMember)) {
      await message.reply('❌ Una de las partes está excluida del casamiento en este servidor (admins o roles excluidos).');
      return;
    }

    const existing = await findMarriage(message.guild.id, message.author.id);
    if (existing) {
      await message.reply('❌ Ya estás casado/a. Usa `cz!divorce` primero.');
      return;
    }
    const targetMarriage = await findMarriage(message.guild.id, target.id);
    if (targetMarriage) {
      await message.reply(`❌ **${target.tag ?? target.username}** ya está casado/a.`);
      return;
    }

    setProposal({
      proposer: message.author.id,
      proposerTag: message.author.tag,
      target: target.id,
      guildId: message.guild.id,
      expires: Date.now() + 60_000,
    });

    const embed = new EmbedBuilder()
      .setColor('#ff69b4')
      .setTitle('💍 ¡Propuesta de matrimonio!')
      .setDescription(`**${message.author.tag}** le propone matrimonio a **${target.tag ?? target.username}**.\n\n¿Aceptas? (60 segundos)`)
      .setFooter({ text: 'CiszuBot • Social', iconURL: message.client.user?.displayAvatarURL() })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('marry_accept').setLabel('💍 Acepto').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('marry_decline').setLabel('💔 Rechazo').setStyle(ButtonStyle.Danger),
    );

    await message.reply({ content: `<@${target.id}>`, embeds: [embed], components: [row] });
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
    if (!message.guild) return;
    const marriage = await findMarriage(message.guild.id, message.author.id);
    if (!marriage) {
      await message.reply('❌ No estás casado/a.');
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

export default [marry, divorce, partner];
