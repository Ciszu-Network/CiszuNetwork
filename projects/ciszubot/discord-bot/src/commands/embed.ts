import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { db, ciszubotSchema, eq, and } from '../services/supabase';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { logger } from '../services/logger';

interface EmbedData {
  title?: string;
  description?: string;
  color?: string | number;
  url?: string;
  image?: string;
  thumbnail?: string;
  footer?: string;
  author?: string;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

function buildEmbed(data: EmbedData): EmbedBuilder {
  const embed = new EmbedBuilder();
  if (data.title) embed.setTitle(data.title.slice(0, 256));
  if (data.description) embed.setDescription(data.description.slice(0, 4096));
  if (data.color) {
    const color = typeof data.color === 'number' ? data.color : (data.color.startsWith('#') ? data.color : `#${data.color}`);
    embed.setColor(color as `#${string}`);
  } else {
    embed.setColor('#4f46e5');
  }
  if (data.url) embed.setURL(data.url);
  if (data.image) embed.setImage(data.image);
  if (data.thumbnail) embed.setThumbnail(data.thumbnail);
  if (data.footer) embed.setFooter({ text: data.footer.slice(0, 2048) });
  if (data.author) embed.setAuthor({ name: data.author.slice(0, 256) });
  if (Array.isArray(data.fields)) {
    embed.addFields(data.fields.slice(0, 25).map((f) => ({ name: String(f.name).slice(0, 256), value: String(f.value).slice(0, 1024), inline: Boolean(f.inline) })));
  }
  return embed;
}

function parseJson(raw: string): EmbedData | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as EmbedData;
  } catch {
    return null;
  }
}

/** Embeds personalizados (comando premium): crear, guardar, enviar y webhooks. */
const command: BotCommand = {
  name: 'embed',
  description: 'Crea y envía embeds personalizados (JSON)',
  aliases: ['embeds'],
  usage: 'cz!embed [json {..} | save nombre {..} | send nombre [#canal] | list | delete nombre | webhook nombre url]',
  category: 'Utilidad',
  slashCommand: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Crea y envía embeds personalizados')
    .setDefaultMemberPermissions(0)
    .addSubcommand((s) =>
      s
        .setName('json')
        .setDescription('Envía un embed desde JSON')
        .addStringOption((o) => o.setName('json').setDescription('JSON del embed').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('save')
        .setDescription('Guarda un embed con nombre')
        .addStringOption((o) => o.setName('nombre').setDescription('Nombre').setRequired(true))
        .addStringOption((o) => o.setName('json').setDescription('JSON del embed').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('send')
        .setDescription('Envía un embed guardado')
        .addStringOption((o) => o.setName('nombre').setDescription('Nombre').setRequired(true))
        .addChannelOption((o) => o.setName('canal').setDescription('Canal destino').setRequired(false)),
    )
    .addSubcommand((s) => s.setName('list').setDescription('Lista los embeds guardados'))
    .addSubcommand((s) =>
      s
        .setName('delete')
        .setDescription('Elimina un embed guardado')
        .addStringOption((o) => o.setName('nombre').setDescription('Nombre').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('webhook')
        .setDescription('Guarda un webhook para enviar el embed por él')
        .addStringOption((o) => o.setName('nombre').setDescription('Nombre').setRequired(true))
        .addStringOption((o) => o.setName('url').setDescription('URL del webhook').setRequired(true)),
    ),

  async execute(message, args) {
    if (!message.guild) return;
    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }
    const guildId = message.guild.id;
    const sub = (args[0] ?? '').toLowerCase();
    const embeds = ciszubotSchema.customEmbeds;

    if (sub === 'json') {
      const raw = args.slice(1).join(' ');
      const data = parseJson(raw);
      if (!data) {
        await message.reply('❌ JSON inválido. Ejemplo: `cz!embed json {"title":"Hola","description":"Mundo","color":"#00d4ff"}`');
        return;
      }
      await message.channel?.send({ embeds: [buildEmbed(data)] });
      return;
    }

    if (sub === 'save') {
      const name = (args[1] ?? '').trim().toLowerCase().slice(0, 32);
      const raw = args.slice(2).join(' ');
      const data = parseJson(raw);
      if (!name || !data) {
        await message.reply('❌ Uso: `cz!embed save <nombre> <json>`.');
        return;
      }
      const existing = await db
        .select({ id: embeds.id })
        .from(embeds)
        .where(and(eq(embeds.guildId, guildId), eq(embeds.name, name)))
        .limit(1);
      if (existing[0]) {
        await db.update(embeds).set({ data }).where(eq(embeds.id, existing[0].id));
      } else {
        await db.insert(embeds).values({
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          guildId,
          name,
          data,
          createdBy: message.author.id,
        });
      }
      await message.reply(`✅ Embed **${name}** guardado. Envíalo con \`cz!embed send ${name}\`.`);
      return;
    }

    if (sub === 'send') {
      const name = (args[1] ?? '').trim().toLowerCase();
      const rows = await db
        .select()
        .from(embeds)
        .where(and(eq(embeds.guildId, guildId), eq(embeds.name, name)))
        .limit(1);
      const row = rows[0];
      if (!row) {
        await message.reply(`❌ No existe el embed \`${name}\`. Míralos con \`cz!embed list\`.`);
        return;
      }
      const channelId = message.mentions?.channels?.first()?.id;
      const target = channelId ? message.guild.channels.cache.get(channelId) : message.channel;
      if (!target || !('send' in target)) {
        await message.reply('❌ Canal no válido.');
        return;
      }
      const embed = buildEmbed(row.data as EmbedData);
      if (row.webhookUrl) {
        try {
          await fetch(row.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed.toJSON()] }),
          });
          await message.reply('✅ Embed enviado por webhook.');
          return;
        } catch (error) {
          logger.warn('embed webhook send:', error);
        }
      }
      await target.send({ embeds: [embed] });
      return;
    }

    if (sub === 'list') {
      const rows = await db.select({ name: embeds.name, webhookUrl: embeds.webhookUrl }).from(embeds).where(eq(embeds.guildId, guildId));
      const embed = new EmbedBuilder()
        .setColor('#4f46e5')
        .setTitle('📦 Embeds guardados')
        .setDescription(
          rows.length > 0
            ? rows.map((r) => `• **${r.name}**${r.webhookUrl ? ' (webhook)' : ''}`).join('\n')
            : 'No hay embeds guardados. Crea uno: `cz!embed save bienvenida {"title":"Hola!"}`',
        )
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    if (sub === 'delete') {
      const name = (args[1] ?? '').trim().toLowerCase();
      await db.delete(embeds).where(and(eq(embeds.guildId, guildId), eq(embeds.name, name)));
      await message.reply(`✅ Embed \`${name}\` eliminado (si existía).`);
      return;
    }

    if (sub === 'webhook') {
      const name = (args[1] ?? '').trim().toLowerCase();
      const url = (args[2] ?? '').trim();
      if (!name || !/^https:\/\/discord(app)?\.com\/api\/webhooks\//.test(url)) {
        await message.reply('❌ Uso: `cz!embed webhook <nombre> <url de webhook de Discord>`.');
        return;
      }
      const rows = await db
        .select({ id: embeds.id })
        .from(embeds)
        .where(and(eq(embeds.guildId, guildId), eq(embeds.name, name)))
        .limit(1);
      if (!rows[0]) {
        await message.reply(`❌ No existe el embed \`${name}\`. Créalo primero con \`cz!embed save\`.`);
        return;
      }
      await db.update(embeds).set({ webhookUrl: url }).where(eq(embeds.id, rows[0].id));
      await message.reply(`✅ Webhook guardado para **${name}**. \`cz!embed send ${name}\` lo usará.`);
      return;
    }

    await message.reply('❌ Subcomandos: `json`, `save`, `send`, `list`, `delete`, `webhook`.');
  },
};

export default command;
