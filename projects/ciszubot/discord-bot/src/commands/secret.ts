import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand, SimulatedMessage } from '../types/command';
import { db, ciszubotSchema, eq, sql } from '../services/supabase';
import { getGuildConfig, updateGuildConfig } from '../services/configService';
import { config } from '../config';
import { BOT_ASSETS } from '../config/links';
import { invalidateFlagsCache } from '../services/featureFlags';
import { FEATURE_DEFS } from '../config/features';
import { langOf, tr } from '../services/i18n';

/** ID del dueño del ecosistema: siempre tiene acceso a la categoría secreta. */
const OWNER_ID = '627304822017622016';

async function hasSecretAccess(message: SimulatedMessage): Promise<boolean> {
  if (message.author.id === OWNER_ID) return true;
  if (!message.guild) return false;
  const cfg = await getGuildConfig(message.guild.id);
  return cfg.secret_user_ids.includes(message.author.id);
}

async function countTable(name: string): Promise<number> {
  const res = await db.execute(sql.raw(`select count(*)::int as n from ciszubot.${name}`));
  const rows = (res as unknown as { rows?: Array<{ n: number }> }).rows ?? (res as unknown as Array<{ n: number }>);
  return Number((rows as Array<{ n: number }>)[0]?.n ?? 0);
}

/** Categoría secreta: comandos técnicos y de gestión solo para la lista blanca. */
const command: BotCommand = {
  name: 'secret',
  description: 'Comandos técnicos de gestión (solo lista blanca)',
  aliases: ['secreto', 'dev'],
  usage: 'cz!secret [status|config|stats|feature|premium|whitelist]',
  category: 'Secreto',
  slashCommand: new SlashCommandBuilder()
    .setName('secret')
    .setDescription('Comandos técnicos de gestión (solo lista blanca)')
    .addSubcommand((s) => s.setName('status').setDescription('Estado real del bot'))
    .addSubcommand((s) => s.setName('config').setDescription('Config completa del servidor'))
    .addSubcommand((s) => s.setName('stats').setDescription('Estadísticas de la base de datos'))
    .addSubcommand((s) =>
      s
        .setName('feature')
        .setDescription('Activa/desactiva una función global')
        // Sin addChoices: Discord limita a 25 y FEATURE_DEFS ya pasa de 25.
        // El slug se valida en código contra FEATURE_DEFS.
        .addStringOption((o) => o.setName('funcion').setDescription('Slug (ej: music, economy, social_afk…)').setRequired(true))
        .addStringOption((o) =>
          o
            .setName('estado')
            .setDescription('on u off')
            .setRequired(true)
            .addChoices({ name: 'Activar', value: 'on' }, { name: 'Desactivar', value: 'off' }),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('premium')
        .setDescription('Gestiona el premium de un servidor por ID')
        .addStringOption((o) => o.setName('guildid').setDescription('ID del servidor').setRequired(true))
        .addStringOption((o) =>
          o
            .setName('accion')
            .setDescription('plan u off')
            .setRequired(true)
            .addChoices({ name: 'Activar (beta)', value: 'beta' }, { name: 'Activar (premium)', value: 'premium' }, { name: 'Quitar', value: 'off' }),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('whitelist')
        .setDescription('Gestiona la lista blanca del servidor')
        .addStringOption((o) =>
          o
            .setName('accion')
            .setDescription('add o remove')
            .setRequired(true)
            .addChoices({ name: 'Añadir', value: 'add' }, { name: 'Quitar', value: 'remove' }),
        )
        .addStringOption((o) => o.setName('userid').setDescription('ID de usuario').setRequired(true)),
    ),

  async execute(message, args) {
    const L = await langOf(message);
    if (!(await hasSecretAccess(message))) {
      await message.reply(tr(L, '🔒 Este comando no existe.', '🔒 This command does not exist.'));
      return;
    }
    if (!message.guild) return;
    const guildId = message.guild.id;
    const sub = (args[0] ?? '').toLowerCase();

    if (!sub || sub === 'status') {
      const mem = process.memoryUsage();
      const uptimeSec = Math.floor((message.client.uptime ?? 0) / 1000);
      const days = Math.floor(uptimeSec / 86400);
      const hours = Math.floor((uptimeSec % 86400) / 3600);
      const mins = Math.floor((uptimeSec % 3600) / 60);
      const embed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle(tr(L, '🛰️ Estado real del bot', '🛰️ Bot real status'))
        .addFields(
          { name: 'Versión', value: `v${config.version}`, inline: true },
          { name: 'Uptime', value: `${days}d ${hours}h ${mins}m`, inline: true },
          { name: 'Servidores', value: String(message.client.guilds.cache.size), inline: true },
          { name: 'Comandos cargados', value: String(message.client.commands.commands.size), inline: true },
          { name: 'RAM (heap)', value: `${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`, inline: true },
          { name: 'Ping', value: `${message.client.ws.ping} ms`, inline: true },
        )
        .setThumbnail(BOT_ASSETS.isotype)
        .setFooter({ text: 'CiszuBot • Categoría secreta' })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (sub === 'config') {
      const cfg = await getGuildConfig(guildId);
      const json = JSON.stringify(cfg, null, 1);
      const chunks: string[] = [];
      for (let i = 0; i < json.length && chunks.length < 5; i += 1900) chunks.push(json.slice(i, i + 1900));
      for (const chunk of chunks) {
        await message.reply(`\`\`\`json\n${chunk}\n\`\`\``);
      }
      return;
    }

    if (sub === 'stats') {
      const [wallets, levels, warns, invites, marriages, tickets, snipes] = await Promise.all([
        countTable('wallets'),
        countTable('levels'),
        countTable('warns'),
        countTable('invites'),
        countTable('marriages'),
        countTable('tickets'),
        countTable('snipes'),
      ]);
      const embed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle(tr(L, '📊 Estadísticas de la base de datos', '📊 Database statistics'))
        .addFields(
          { name: '👛 Wallets', value: String(wallets), inline: true },
          { name: '📈 Niveles', value: String(levels), inline: true },
          { name: '⚠️ Warns', value: String(warns), inline: true },
          { name: '📨 Invitaciones', value: String(invites), inline: true },
          { name: '💞 Matrimonios', value: String(marriages), inline: true },
          { name: '🎫 Tickets', value: String(tickets), inline: true },
          { name: '🔪 Snipes', value: String(snipes), inline: true },
        )
        .setFooter({ text: 'CiszuBot • Categoría secreta' })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (sub === 'feature') {
      const slug = (args[1] ?? '').toLowerCase();
      const mode = (args[2] ?? '').toLowerCase();
      if (!FEATURE_DEFS.some((f) => f.slug === slug) || (mode !== 'on' && mode !== 'off')) {
        await message.reply(`❌ Uso: \`cz!secret feature <${FEATURE_DEFS.map((f) => f.slug).join('|')}> on|off\`.`);
        return;
      }
      const enabled = mode === 'on';
      const reason = enabled ? null : `Desactivada por ${message.author.tag} (categoría secreta)`;
      await db
        .insert(ciszubotSchema.featureFlags)
        .values({ feature: slug, enabled, reason, updatedBy: message.author.id })
        .onConflictDoUpdate({
          target: ciszubotSchema.featureFlags.feature,
          set: { enabled, reason, updatedBy: message.author.id, updatedAt: sql`now()` },
        });
      invalidateFlagsCache();
      await message.reply(`✅ Función **${slug}** ${enabled ? 'ACTIVADA' : 'DESACTIVADA'} globalmente.`);
      return;
    }

    if (sub === 'premium') {
      const targetGuild = (args[1] ?? '').trim();
      const action = (args[2] ?? '').toLowerCase();
      if (!/^\d{17,20}$/.test(targetGuild) || !['beta', 'premium', 'off'].includes(action)) {
        await message.reply(tr(L, '❌ Uso: `cz!secret premium <guildId> beta|premium|off`.', '❌ Usage: `cz!secret premium <guildId> beta|premium|off`.'));
        return;
      }
      if (action === 'off') {
        await db.delete(ciszubotSchema.premiumGuilds).where(eq(ciszubotSchema.premiumGuilds.guildId, targetGuild));
        await message.reply(`✅ Premium quitado al servidor \`${targetGuild}\`.`);
        return;
      }
      await db
        .insert(ciszubotSchema.premiumGuilds)
        .values({ guildId: targetGuild, plan: action, status: 'active' })
        .onConflictDoUpdate({
          target: ciszubotSchema.premiumGuilds.guildId,
          set: { plan: action, status: 'active', updatedAt: sql`now()` },
        });
      await message.reply(`✅ Servidor \`${targetGuild}\` ahora tiene premium **${action}**.`);
      return;
    }

    if (sub === 'whitelist') {
      const action = (args[1] ?? '').toLowerCase();
      const userId = (args[2] ?? '').trim();
      if ((action !== 'add' && action !== 'remove') || !/^\d{17,20}$/.test(userId)) {
        await message.reply(tr(L, '❌ Uso: `cz!secret whitelist add|remove <userId>`.', '❌ Usage: `cz!secret whitelist add|remove <userId>`.'));
        return;
      }
      const cfg = await getGuildConfig(guildId);
      const ids =
        action === 'add'
          ? Array.from(new Set([...cfg.secret_user_ids, userId]))
          : cfg.secret_user_ids.filter((id) => id !== userId);
      await updateGuildConfig(guildId, { secret_user_ids: ids });
      await message.reply(`✅ Usuario \`${userId}\` ${action === 'add' ? 'añadido a' : 'quitado de'} la lista blanca (${ids.length} total).`);
      return;
    }

    await message.reply(tr(L, '❌ Subcomandos: `status`, `config`, `stats`, `feature`, `premium`, `whitelist`.', '❌ Subcommands: `status`, `config`, `stats`, `feature`, `premium`, `whitelist`.'));
  },
};

export default command;
