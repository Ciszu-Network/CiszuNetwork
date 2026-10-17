import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER, LINKS } from '../config/links';

/**
 * Un comando por página clave de la web (la autenticación incluida).
 * `cz!web` lista todas las páginas; `cz!web <pagina>` enlaza una concreta.
 */

const PAGES: Record<string, { label: string; path: string; description: string }> = {
  inicio: { label: 'Inicio', path: '/', description: 'Página principal de CiszuBot' },
  premium: { label: 'Premium', path: '/premium', description: 'Planes y funciones Premium' },
  dashboard: { label: 'Dashboard', path: '/dashboard', description: 'Panel de configuración del bot' },
  comandos: { label: 'Comandos', path: '/commands', description: 'Lista completa de comandos' },
  ayuda: { label: 'Ayuda', path: '/help', description: 'Centro de ayuda' },
  documentacion: { label: 'Documentación', path: '/documentation', description: 'Documentación oficial' },
  estado: { label: 'Estado', path: '/stats', description: 'Estado y estadísticas en vivo' },
  donaciones: { label: 'Donaciones', path: '/donate', description: 'Apoya el proyecto' },
  descargas: { label: 'Descargas', path: '/downloads', description: 'Descargas oficiales' },
  resenas: { label: 'Reseñas', path: '/reviews', description: 'Reseñas de la comunidad' },
  feedback: { label: 'Feedback', path: '/feedback', description: 'Envía sugerencias o errores' },
  apelaciones: { label: 'Apelaciones', path: '/appeal', description: 'Apela un ban' },
  contacto: { label: 'Contacto', path: '/contact', description: 'Contacta con el equipo' },
  equipo: { label: 'Equipo', path: '/team', description: 'Equipo de Ciszu Network' },
  changelog: { label: 'Changelog', path: '/changelog', description: 'Cambios recientes' },
  reglas: { label: 'Reglas', path: '/rules', description: 'Reglas de la comunidad' },
  terminos: { label: 'Términos', path: '/terms', description: 'Términos de servicio' },
  privacidad: { label: 'Privacidad', path: '/privacy', description: 'Política de privacidad' },
  licencia: { label: 'Licencia', path: '/license', description: 'Licencia del proyecto' },
  foro: { label: 'Foro', path: '/forum', description: 'Foro de la comunidad' },
  faq: { label: 'FAQ', path: '/faq', description: 'Preguntas frecuentes' },
  login: { label: 'Iniciar sesión', path: '/login', description: 'Inicia sesión con tu cuenta CISZU ID' },
  registro: { label: 'Registro', path: '/register', description: 'Crea tu cuenta CISZU ID' },
  recuperar: { label: 'Recuperar cuenta', path: '/reset-password', description: 'Restablece tu contraseña' },
};

const ALIASES: Record<string, string> = {
  home: 'inicio', commands: 'comandos', docs: 'documentacion', documentation: 'documentacion',
  status: 'estado', stats: 'estado', donate: 'donaciones', downloads: 'descargas',
  reviews: 'resenas', review: 'resenas', appeal: 'apelaciones', contact: 'contacto',
  team: 'equipo', rules: 'reglas', terms: 'terminos', privacy: 'privacidad',
  license: 'licencia', forum: 'foro', help: 'ayuda', auth: 'login', register: 'registro',
  signup: 'registro', reset: 'recuperar', password: 'recuperar', privacy_policy: 'privacidad',
  tos: 'terminos', vote: 'premium',
};

const command: BotCommand = {
  name: 'web',
  description: 'Enlaces a las páginas de la web (uno por página)',
  aliases: ['pagina', 'pages', 'sitio'],
  usage: 'cz!web [pagina]',
  category: 'Información',
  slashCommand: new SlashCommandBuilder()
    .setName('web')
    .setDescription('Enlaces a las páginas de la web')
    .addStringOption((o) =>
      o
        .setName('pagina')
        .setDescription('Página concreta (ej: premium, dashboard, login)')
        .setRequired(false)
        .addChoices(...Object.entries(PAGES).slice(0, 25).map(([value, p]) => ({ name: p.label, value }))),
    ),

  async execute(message, args) {
    const key = (args[0] ?? '').toLowerCase();
    const resolved = ALIASES[key] ?? key;
    const page = PAGES[resolved];

    if (key && page) {
      const embed = new EmbedBuilder()
        .setColor(BOT_COLORS.primary)
        .setTitle(`🌐 ${page.label}`)
        .setDescription(`${page.description}\n\n${LINKS.website}${page.path}`)
        .setURL(`${LINKS.website}${page.path}`)
        .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()))
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (key && !page) {
      await message.reply(`❌ Página desconocida. Mira la lista con \`cz!web\`.`);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(BOT_COLORS.primary)
      .setTitle('🌐 Páginas de la web')
      .setDescription(
        Object.entries(PAGES)
          .map(([slug, p]) => `• \`cz!web ${slug}\` — ${p.label}`)
          .join('\n')
          .slice(0, 4096),
      )
      .setFooter(BOT_FOOTER(`Solicitado por ${message.author.tag}`, message.client.user?.displayAvatarURL()))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
};

export default command;
