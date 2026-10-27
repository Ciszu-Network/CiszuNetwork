import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS } from '../config/links';

/**
 * Un comando por página/recurso clave del ecosistema (atajos rápidos):
 * cz!reviews · cz!faq · cz!youtube · cz!github · cz!vercel · cz!disboard ·
 * cz!topgg · cz!techstack · cz!plang.
 */

type Simple = {
  name: string;
  description: string;
  aliases: string[];
  title: string;
  body: string;
  url: string;
  urlLabel: string;
  extra?: { label: string; url: string };
};

const SIMPLE_COMMANDS: Simple[] = [
  {
    name: 'reviews',
    description: 'Reseñas de la comunidad sobre CiszuBot',
    aliases: ['resenas', 'reseñas'],
    title: '⭐ Reseñas',
    body: 'Lee las reseñas de la comunidad y deja la tuya sobre CiszuBot.',
    url: `${LINKS.website}/reviews`,
    urlLabel: 'Ver reseñas',
    extra: { label: 'Dejar reseña', url: `${LINKS.website}/reviews` },
  },
  {
    name: 'faq',
    description: 'Preguntas frecuentes de CiszuBot',
    aliases: ['preguntas', 'preguntasfrecuentes'],
    title: '❓ Preguntas frecuentes',
    body: 'Las dudas más comunes sobre el bot: configuración, premium, permisos y más.',
    url: `${LINKS.website}/faq`,
    urlLabel: 'Ver FAQ',
  },
  {
    name: 'youtube',
    description: 'Canal de YouTube de Ciszu Network',
    aliases: ['canal', 'yt'],
    title: '📺 YouTube',
    body: 'Videos, anuncios y contenido del ecosistema en el canal oficial.',
    url: LINKS.youtube,
    urlLabel: 'Ir al canal',
  },
  {
    name: 'github',
    description: 'Repositorio open source de Ciszu Network',
    aliases: ['repositorio', 'opensource'],
    title: '🐙 GitHub',
    body: 'El código del ecosistema es abierto: revisa el monorepo, reporta issues y sigue los cambios.',
    url: LINKS.github,
    urlLabel: 'Ver en GitHub',
    extra: { label: 'Reportar issue', url: `${LINKS.github}/CiszuNetwork/issues` },
  },
  {
    name: 'repo',
    description: 'Repositorio oficial del ecosistema en GitHub',
    aliases: ['monorepo'],
    title: '🐙 Repositorio oficial',
    body: 'Monorepo público de Ciszu Network: webs, bot de Discord, paquetes compartidos, migraciones y automatizaciones.',
    url: LINKS.github,
    urlLabel: 'Abrir GitHub',
    extra: { label: 'Reportar issue', url: `${LINKS.github}/CiszuNetwork/issues` },
  },
  {
    name: 'website',
    description: 'Web oficial de CiszuBot',
    aliases: ['botweb'],
    title: '🤖 Web de CiszuBot',
    body: 'Estado en vivo, catálogo de comandos, dashboard, soporte, votaciones y donaciones del bot.',
    url: LINKS.website,
    urlLabel: 'Abrir CiszuBot',
    extra: { label: 'Dashboard', url: `${LINKS.website}/dashboard` },
  },
  {
    name: 'webpages',
    description: 'Todas las webs del ecosistema',
    aliases: ['webs', 'sitios', 'sites'],
    title: '🌐 Webs del ecosistema',
    body: [
      `• **CiszuBot** — ${LINKS.websiteLabel}`,
      `• **Ciszu Network** — ${LINKS.networkLabel}`,
      `• **Ciszuko Antony** — ${LINKS.antonyLabel}`,
      '• **MuzicMania** — muzicmania.vercel.app',
      '• **CiszuGamens** — ciszugamens.vercel.app',
    ].join('\n'),
    url: LINKS.network,
    urlLabel: 'Ciszu Network',
  },
  {
    name: 'ecosystem',
    description: 'Proyectos y servicios del ecosistema Ciszu Network',
    aliases: ['ecosistema', 'proyectos'],
    title: '🌍 Ecosistema Ciszu Network',
    body: 'Descubre todos los proyectos, servicios y productos que forman parte del ecosistema digital de Ciszuko Antony.',
    url: `${LINKS.network}/projects`,
    urlLabel: 'Ver proyectos',
  },
  {
    name: 'ciszu',
    description: 'Web principal de Ciszu Network',
    aliases: ['ciszunetwork'],
    title: '🌍 Ciszu Network',
    body: 'La web principal de la organización: identidad, proyectos, servicios, documentación y contacto.',
    url: LINKS.network,
    urlLabel: 'Abrir Ciszu Network',
  },
  {
    name: 'portfolio',
    description: 'Portfolio personal de Ciszuko Antony',
    aliases: ['portafolio'],
    title: '🎨 Ciszuko Antony',
    body: 'Portfolio personal del creador: proyectos, logos, medios, música y trayectoria.',
    url: LINKS.portfolio,
    urlLabel: 'Abrir portfolio',
  },
  {
    name: 'curriculum',
    description: 'Currículum de Ciszuko Antony',
    aliases: ['cv', 'curriculo'],
    title: '📄 Currículum',
    body: 'Currículums en PDF con previsualización completa, experiencia, formación, habilidades y certificados verificables.',
    url: LINKS.curriculum,
    urlLabel: 'Ver currículum',
  },
  {
    name: 'vercel',
    description: 'Webs desplegadas del ecosistema (deploys)',
    aliases: ['deploys', 'despliegues'],
    title: '▲ Webs desplegadas',
    body: `Todas las webs del ecosistema corren en Vercel:\n\n• **CiszuBot** — ${LINKS.websiteLabel}\n• **Ciszu Network** — ${LINKS.networkLabel}\n• **Ciszuko Antony** — ${LINKS.antonyLabel}\n• **MuzicMania** — muzicmania.vercel.app`,
    url: LINKS.network,
    urlLabel: 'Ciszu Network',
  },
  {
    name: 'disboard',
    description: 'El servidor en DISBOARD',
    aliases: [],
    title: '🔍 DISBOARD',
    body: 'Visita la ficha del servidor en DISBOARD y déjanos un bump.',
    url: LINKS.disboardServer,
    urlLabel: 'Ver en DISBOARD',
  },
  {
    name: 'topgg',
    description: 'CiszuBot en top.gg (vota por el bot)',
    aliases: ['votarbot'],
    title: '🏆 top.gg',
    body: 'Vota por CiszuBot en top.gg para ayudarnos a crecer — cada voto cuenta.',
    url: LINKS.topggBot,
    urlLabel: 'Ver en top.gg',
    extra: { label: 'Votar', url: LINKS.topggBotVote },
  },
  {
    name: 'techstack',
    description: 'Stack tecnológico del ecosistema',
    aliases: ['stack', 'tecnologias'],
    title: '🧩 Stack tecnológico',
    body: [
      '• **Frontend** — Next.js 15 (App Router) + React + Tailwind 4',
      '• **Bot** — Discord.js + TypeScript sobre Node 24',
      '• **Backend/Datos** — Supabase (Postgres + Auth + Storage CDN)',
      '• **Deploys** — Vercel + GitHub Actions + Docker (bot 24/7)',
      '• **Calidad** — Vitest, Playwright, CodeQL, ZAP, Sentry, PostHog',
      '• **Monorepo** — pnpm workspaces + Turborepo',
    ].join('\n'),
    url: `${LINKS.network}/information`,
    urlLabel: 'Más información',
  },
  {
    name: 'plang',
    description: 'Lenguajes de programación que usa el proyecto',
    aliases: ['lenguajes'],
    title: '💻 Lenguajes de programación',
    body: [
      '• **TypeScript / JavaScript** — webs, bot y paquetes compartidos',
      '• **SQL** — migraciones y lógica en Postgres (Supabase)',
      '• **PowerShell** — automatización y consolas de desarrollo',
      '• **Python** — herramientas de documentación y pipelines',
      '• **Rust / C#** — herramientas locales e instaladores',
      '• **CSS** — Tailwind 4 y estilos del sistema de diseño',
    ].join('\n'),
    url: `${LINKS.github}`,
    urlLabel: 'Ver el código',
  },
  {
    name: 'donaciones',
    description: 'Apoya el proyecto (donaciones)',
    aliases: ['donate', 'donacion', 'apoyar'],
    title: '💜 Donaciones',
    body: 'Apoya a Ciszu Network para mantener el bot y las webs en línea. ¡Cada aporte ayuda!',
    url: `${LINKS.website}/donate`,
    urlLabel: 'Donar',
    extra: { label: 'Ko-fi', url: LINKS.koFi },
  },
  {
    name: 'partnerprogram',
    description: 'Programa de partners y colaboraciones',
    aliases: ['partners', 'colaborar', 'colaborador', 'colaboradores'],
    title: '🤝 Partners',
    body: '¿Quieres ser partner o colaborar con Ciszu Network? Únete al Discord y habla con el equipo.',
    url: LINKS.discordServer,
    urlLabel: 'Unirse al Discord',
  },
  {
    name: 'info',
    description: 'Información sobre Ciszu Network',
    aliases: ['informacion', 'about'],
    title: 'ℹ️ Información',
    body: 'Conoce la organización, sus proyectos y su misión en la web principal.',
    url: `${LINKS.network}/information`,
    urlLabel: 'Más información',
  },
  {
    name: 'auth',
    description: 'Tu cuenta CISZU ID (iniciar sesión / registro)',
    aliases: ['login', 'cuenta', 'registro'],
    title: '🔐 Cuenta CISZU ID',
    body: 'Inicia sesión o crea tu cuenta CISZU ID para usar el dashboard y las funciones con cuenta.',
    url: `${LINKS.website}/login`,
    urlLabel: 'Iniciar sesión',
    extra: { label: 'Crear cuenta', url: `${LINKS.website}/register` },
  },
];

function buildCommand(def: Simple): BotCommand {
  return {
    name: def.name,
    description: def.description,
    aliases: def.aliases,
    usage: `cz!${def.name}`,
    category: 'Información',
    async execute(message) {
      const embed = new EmbedBuilder()
        .setColor(BOT_COLORS.primary)
        .setTitle(def.title)
        .setDescription(`${def.body}\n\n${def.url}`)
        .setURL(def.url)
        .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(def.urlLabel).setURL(def.url),
      );
      if (def.extra) {
        row.addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(def.extra.label).setURL(def.extra.url));
      }

      await message.reply({ embeds: [embed], components: [row] });
    },
  };
}

export default SIMPLE_COMMANDS.map(buildCommand);
