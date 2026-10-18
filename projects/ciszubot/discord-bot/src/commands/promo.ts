import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS, BOT_ASSETS } from '../config/links';
import { getGuildConfig } from '../services/configService';

/**
 * Promoción del ecosistema: `cz!promo` (resumen) y `cz!promo largo`
 * (mensaje largo en el idioma configurado del servidor: es/en).
 */

const LONG_PROMO: Record<'es' | 'en', { title: string; intro: string; sections: Array<{ name: string; value: string }>; cta: string }> = {
  es: {
    title: '🌐 Ciszu Network — todo un ecosistema en tu servidor',
    intro:
      '**CiszuBot** es el bot oficial de **Ciszu Network**, el ecosistema digital de **Ciszuko Antony**. No es solo un bot: es una plataforma completa, configurable desde su dashboard web y con soporte activo de la comunidad.',
    sections: [
      {
        name: '💰 Economía',
        value: 'Moneda propia configurable, tienda, trabajos, apuestas, depósitos con interés, regalos entre usuarios y ranking.',
      },
      {
        name: '📈 Niveles y recompensas',
        value: 'XP por actividad, tarjetas de nivel, roles automáticos por nivel y multiplicadores configurables.',
      },
      {
        name: '🎉 Sorteos profesionales',
        value: 'Botones de ingreso, requisitos de roles, bonus de participación, pausa, cancelación, relanzamiento y gestión total desde el dashboard.',
      },
      {
        name: '🛡️ Moderación y automod',
        value: 'Ban, kick, mute indefinido y temporal, advertencias, purga, antispam, antiflood y rate limits por servidor.',
      },
      {
        name: '🎫 Tickets, alianzas e invitaciones',
        value: 'Sistema de tickets por categorías, alianzas entre servidores con puntos y recompensas, y seguimiento de invitaciones.',
      },
      {
        name: '🎮 Diversión y social',
        value: 'Minijuegos, casamiento, AFK, confesiones, respuestas automáticas, embeds personalizados y música.',
      },
      {
        name: '🧩 Utilidad',
        value: 'Recordatorios, encuestas, traducción, ayuda completa con cada comando y enlaces a todo el ecosistema.',
      },
      {
        name: '⚙️ Dashboard completo',
        value: `Cada función se configura desde la web: ${LINKS.websiteLabel} — sin comandos complejos, con vista previa y ayuda integrada.`,
      },
    ],
    cta: '**Invita a CiszuBot hoy mismo** y descubre todo lo que puede hacer por tu comunidad.',
  },
  en: {
    title: '🌐 Ciszu Network — a whole ecosystem for your server',
    intro:
      '**CiszuBot** is the official bot of **Ciszu Network**, the digital ecosystem by **Ciszuko Antony**. It is not just a bot: it is a full platform, configurable from its web dashboard with active community support.',
    sections: [
      {
        name: '💰 Economy',
        value: 'Custom currency, shop, jobs, gambling, interest deposits, user-to-user gifts and rankings.',
      },
      {
        name: '📈 Levels and rewards',
        value: 'Activity XP, level cards, automatic level roles and configurable multipliers.',
      },
      {
        name: '🎉 Professional giveaways',
        value: 'Join buttons, role requirements, participation bonuses, pause, cancel, reroll and full dashboard management.',
      },
      {
        name: '🛡️ Moderation and automod',
        value: 'Ban, kick, indefinite and temporary mute, warnings, purge, antispam, antiflood and per-server rate limits.',
      },
      {
        name: '🎫 Tickets, alliances and invites',
        value: 'Category-based ticket system, server alliances with points and rewards, and invite tracking.',
      },
      {
        name: '🎮 Fun and social',
        value: 'Minigames, marriage, AFK, confessions, autoresponders, custom embeds and music.',
      },
      {
        name: '🧩 Utility',
        value: 'Reminders, polls, translation, complete help for every command and links to the whole ecosystem.',
      },
      {
        name: '⚙️ Full dashboard',
        value: `Every feature is configured from the web: ${LINKS.websiteLabel} — no complex commands, with live preview and built-in help.`,
      },
    ],
    cta: '**Invite CiszuBot today** and discover everything it can do for your community.',
  },
};

const command: BotCommand = {
  name: 'promo',
  description: 'Promociona las webs del ecosistema Ciszu Network',
  aliases: ['promocionar', 'webs', 'sitio', 'web', 'promote'],
  usage: 'cz!promo [largo]',
  category: 'Utilidad',

  slashCommand: new SlashCommandBuilder()
    .setName('promo')
    .setDescription('Promociona las webs del ecosistema Ciszu Network')
    .addStringOption((o) =>
      o
        .setName('modo')
        .setDescription('Formato del mensaje')
        .setRequired(false)
        .addChoices({ name: 'Resumen', value: 'corto' }, { name: 'Mensaje largo (idioma del servidor)', value: 'largo' }),
    ),

  async execute(message, args) {
    const wantsLong = ['largo', 'long', 'extendido'].includes((args[0] ?? '').toLowerCase());

    if (wantsLong) {
      // Mensaje largo en el idioma configurado del servidor (es/en).
      const cfg = await getGuildConfig(message.guild?.id ?? 'DM').catch(() => null);
      const lang: 'es' | 'en' = cfg?.lang === 'en' ? 'en' : 'es';
      const content = LONG_PROMO[lang];

      const embed = new EmbedBuilder()
        .setColor(BOT_COLORS.primary)
        .setTitle(content.title)
        .setThumbnail(BOT_ASSETS.isotype)
        .setDescription(content.intro)
        .addFields(content.sections.map((s) => ({ name: s.name, value: s.value, inline: false })))
        .setFooter(BOT_FOOTER(`Solicitado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Invitar a CiszuBot').setURL(LINKS.invite),
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Dashboard').setURL(`${LINKS.website}/dashboard`),
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Ciszu Network').setURL(LINKS.network),
      );

      await message.reply({ content: content.cta, embeds: [embed], components: [row] });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.primary)
      .setTitle('🌐 Ecosistema Ciszu Network')
      .setDescription(
        'Descubre todo lo que hay detrás del bot: la organización, la web del bot y el portfolio de CiszukoAntony.\n\n' +
          '💡 Usa `cz!promo largo` para el mensaje completo (en el idioma del servidor).',
      )
      .addFields(
        {
          name: `🤖 CiszuBot — ${LINKS.websiteLabel}`,
          value: 'Web oficial del bot: estado en vivo, comandos, soporte, votaciones y donaciones.',
          inline: false,
        },
        {
          name: `🌍 Ciszu Network — ${LINKS.networkLabel}`,
          value: 'Web principal de la organización: el ecosistema digital de CiszukoAntony y sus proyectos.',
          inline: false,
        },
        {
          name: `🎨 Ciszuko Antony — ${LINKS.antonyLabel}`,
          value: 'Portfolio personal: logos, medios y música del creador.',
          inline: false,
        },
      )
      .setFooter(BOT_FOOTER(`Solicitado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('CiszuBot').setURL(LINKS.website),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Ciszu Network').setURL(LINKS.network),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Ciszuko Antony').setURL(LINKS.antony),
    );

    return message.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
