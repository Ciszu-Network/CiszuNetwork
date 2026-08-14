import {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} from 'discord.js';
import path from 'path';
import 'dotenv/config';
import { config, BOT_TOKEN, GUILD_ID } from './config';
import { logger } from './services/logger';
import { CommandRegistry } from './utils/commandRegistry';
import { incrementCommands, getTotalCommands, setupStatsServer, updateStats } from './services/statsServer';
import { logCommand, updateBotStatus } from './services/supabase';
import { registerListeners, handleButton } from './listeners';
import { scheduleStatsPosting } from './services/botlists';
import { initErrorTracking, captureError } from './services/sentry';

initErrorTracking();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new CommandRegistry();
client.commands.load(path.join(__dirname));
registerListeners(client);

// ─── Ready (una sola vez, con Events.ClientReady) ───
client.once(Events.ClientReady, async (readyClient) => {
  logger.info(`${readyClient.user.tag} está en línea!`);
  logger.info(`El bot está sirviendo a ${readyClient.guilds.cache.size} servidor(es)`);
  readyClient.user.setActivity(config.activity.name, { type: config.activity.type as never });

  updateStats(readyClient);
  setInterval(() => updateStats(readyClient), 30000);

  // Heartbeat de estado en Supabase (cada 60s) — lo consume la web oficial
  const sendHeartbeat = async () => {
    try {
      await updateBotStatus({
        online: true,
        guilds: readyClient.guilds.cache.size,
        commandsTotal: getTotalCommands(),
        version: 'v3.2.0',
        lastSeen: new Date(),
      });
    } catch (error) {
      logger.warn('Heartbeat fallido:', error);
    }
  };
  sendHeartbeat();
  setInterval(sendHeartbeat, 60000);

  // Estadísticas a bot lists (top.gg auto + DiscordBotList cada 30 min)
  scheduleStatsPosting(readyClient);

  // Registrar comandos de barra — CORREGIDO: applicationCommands con C mayúscula
  const slashCommands = Array.from(client.commands.commands.values())
    .filter((cmd) => cmd.slashCommand)
    .map((cmd) => cmd.slashCommand!.toJSON());

  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  try {
    logger.info('Refrescando comandos de aplicación (/)...');
    if (GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(readyClient.user.id, GUILD_ID), { body: slashCommands });
      logger.info(`Comandos (/) registrados en el guild ${GUILD_ID}.`);
    } else {
      const existing = (await rest.get(Routes.applicationCommands(readyClient.user.id))) as Array<{
        id: string;
        type: number;
      }>;
      const entryPoint = existing.filter((cmd) => cmd.type === 4);
      const body = [...entryPoint, ...slashCommands];
      await rest.put(Routes.applicationCommands(readyClient.user.id), { body });
      logger.info('Comandos de aplicación (/) recargados exitosamente.');
    }
  } catch (error) {
    logger.error('Error al registrar comandos de aplicación:', error);
  }
});

// ─── Interacciones (slash + botones + selects) ───
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({
        content: `Comando "${interaction.commandName}" no encontrado.`,
        ephemeral: true,
      });
      return;
    }

    try {
      const args: string[] = [];
      const userOptions: Array<{ id: string; tag?: string; username?: string; displayAvatarURL?: (opts?: { size?: number }) => string }> = [];
      const roleOptions: Array<{ id: string }> = [];
      const channelOptions: Array<{ id: string; type: number; send?: (content: unknown) => Promise<unknown> }> = [];
      for (const opt of interaction.options.data) {
        if (opt.type === 3) args.push(opt.value as string);
        else if (opt.type === 6) {
          const user = interaction.options.getUser(opt.name);
          args.push(`<@${opt.value}>`);
          userOptions.push(user as never);
        } else if (opt.type === 8) {
          args.push(`<@&${opt.value}>`);
          roleOptions.push({ id: String(opt.value) });
        } else if (opt.type === 7) {
          const channel = interaction.options.getChannel(opt.name) as never as { id: string; type: number; send?: (c: unknown) => Promise<unknown> };
          args.push(`<#${opt.value}>`);
          channelOptions.push({ id: String(opt.value), type: channel?.type ?? 0, send: channel?.send });
        } else if (opt.value !== undefined) args.push(String(opt.value));
      }

      // Enviar "pensando" para evitar el timeout de 3 segundos
      await interaction.deferReply({ ephemeral: false });

      const simulatedMessage = {
        client: interaction.client,
        author: interaction.user,
        guild: interaction.guild,
        channel: interaction.channel as never,
        createdTimestamp: Date.now(),
        member: interaction.member,
        mentions: {
          users: { first: () => userOptions[0] },
          roles: { first: () => roleOptions[0] },
          channels: {
            first: () => channelOptions[0],
            find: (predicate: (c: { id: string; type: number }) => boolean) => channelOptions.find(predicate),
          },
        },
        reply: async (content: unknown) => {
          if (interaction.replied || interaction.deferred) {
            return interaction.followUp(content as never);
          }
          return interaction.reply(content as never);
        },
        edit: async (content: unknown) => interaction.editReply(content as never),
        delete: async () => undefined,
      };

      await command.execute(simulatedMessage as never, args);
      incrementCommands();
      logCommand(
        interaction.guildId ?? 'DM',
        interaction.user.id,
        interaction.commandName,
        args,
      );
    } catch (error) {
      logger.error(`Error en slash '/${interaction.commandName}':`, error);
      captureError(error, { context: 'slash_command', command: interaction.commandName, user: interaction.user.id });
      const content = '❌ Hubo un error al ejecutar este comando.';
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content, ephemeral: true }).catch(() => undefined);
      } else {
        await interaction.reply({ content, ephemeral: true }).catch(() => undefined);
      }
    }
  }

  // Botones y menús de selección (fix: antes no se respondían → timeouts)
  if (interaction.isStringSelectMenu() && interaction.customId === 'help_select') {
    await interaction.deferUpdate().catch(() => undefined);
    const selected = interaction.values[0];

    // Categoría seleccionada → listar comandos de esa categoría
    if (selected.startsWith('cat:')) {
      const cat = selected.slice(4);
      const cmds = Array.from(client.commands.commands.values()).filter((c) => (c.category || 'General') === cat);
      if (cmds.length === 0) {
        await interaction.followUp({ content: '❌ ¡Categoría no encontrada!', ephemeral: true }).catch(() => undefined);
        return;
      }
      const catEmbed = new EmbedBuilder()
        .setColor(config.colors.primary as `#${string}`)
        .setTitle(`📁 ${cat} — ${cmds.length} comandos`)
        .setDescription(cmds.map((c) => `\`${config.prefix}${c.name}\` - ${c.description || 'Sin descripción'}`).join('\n').slice(0, 4096))
        .setFooter({ text: `CiszuBot • Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();
      await interaction.followUp({ embeds: [catEmbed], ephemeral: true }).catch(() => undefined);
      return;
    }

    const command = client.commands.get(selected);
    if (!command) {
      await interaction.followUp({ content: '❌ ¡Comando no encontrado!', ephemeral: true }).catch(() => undefined);
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary as `#${string}`)
      .setTitle(`📖 Comando: ${command.name}`)
      .setDescription(command.description || 'Sin descripción disponible')
      .addFields(
        { name: '📝 Uso', value: `\`${command.usage || `${config.prefix}${command.name}`}\``, inline: true },
        { name: '📂 Categoría', value: command.category || 'General', inline: true },
      );
    if (command.aliases.length > 0) {
      embed.addFields({ name: '🔗 Aliases', value: command.aliases.map((a) => `\`${a}\``).join(', '), inline: false });
    }
    embed.setFooter({
      text: `CiszuBot • Solicitado por ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    }).setTimestamp();

    await interaction.followUp({ embeds: [embed], ephemeral: true }).catch(() => undefined);
  }

  if (interaction.isButton()) {
    await interaction.deferUpdate().catch(() => undefined);
    await handleButton(interaction, client).catch((error) => logger.error('handleButton:', error));
  }
});

// ─── Mensajes con prefijo ───
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  let prefixUsed: string | null = null;
  let isMention = false;
  if (message.content.startsWith(config.prefix)) {
    prefixUsed = config.prefix;
  } else if (
    message.mentions.users.has(client.user!.id) &&
    message.content.includes(`<@${client.user!.id}>`) &&
    !message.reference
  ) {
    prefixUsed = `<@${client.user!.id}>`;
    isMention = true;
  }

  if (prefixUsed) {
    const args = message.content.slice(prefixUsed.length).trim().split(/ +/g);
    const commandName = args.shift()?.toLowerCase() ?? '';

    if (!commandName) {
      if (isMention) {
        const saludos = [
          '¡Hola! ¿En qué puedo ayudarte?',
          '¿Qué pasa? ¿Necesitas algo?',
          '¡Hey! ¿Cómo estás?',
          '¿Qué onda? ¿Todo bien?',
          '¡Saludos! ¿En qué puedo servirte?',
          '¿Qué tal tu día? ¿Necesitas ayuda con algo?',
          '¡Hola de nuevo! ¿Qué puedo hacer por ti?',
          '¿Qué tal? ¿Estás buscando algún comando?',
          '¡Hey! ¿Te puedo ayudar en algo?',
          '¿Qué pasa? ¿Todo bien por aquí?',
        ];
        const color = Math.floor(Math.random() * 16777215);
        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle('👋 ¡Hola!')
          .setDescription(saludos[Math.floor(Math.random() * saludos.length)])
          .setFooter({
            text: `CiszuBot • Solicitado por ${message.author.tag}`,
            iconURL: message.client.user?.displayAvatarURL(),
          })
          .setTimestamp();
        await message.reply({ embeds: [embed] });
      }
      return;
    }

    const command = client.commands.get(commandName);
    if (!command) {
      logger.warn(`Comando desconocido: ${commandName} por ${message.author.tag}`);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Comando no encontrado')
        .setDescription(`El comando "${commandName}" no está registrado.`)
        .setFooter({
          text: `Solicitado por ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        });
      await message.reply({ embeds: [embed] });
      return;
    }

    try {
      logger.info(`Comando '${commandName}' ejecutado por ${message.author.tag} en ${message.guild?.name || 'DM'}`);
      await command.execute(message as never, args);
      incrementCommands();
      logCommand(message.guild?.id ?? 'DM', message.author.id, commandName, args);
    } catch (error) {
      logger.error(`Error al ejecutar '${commandName}':`, error);
      captureError(error, { context: 'prefix_command', command: commandName, user: message.author.id });
      await message.reply('❌ Ocurrió un error al ejecutar este comando.').catch(() => undefined);
    }
  }
});

// ─── Guild events ───
client.on('guildCreate', (guild) => {
  logger.info(`Unido a un nuevo servidor: ${guild.name} (ID: ${guild.id}) — ${guild.memberCount} miembros`);
});

client.on('guildDelete', (guild) => {
  logger.info(`Salió del servidor: ${guild.name} (ID: ${guild.id})`);
});

client.on('error', (error) => logger.error('Error del cliente de Discord:', error));
client.on('warn', (warning) => logger.warn('Advertencia del cliente de Discord:', warning));

if (process.env.NODE_ENV === 'development') {
  client.on('debug', (info) => logger.debug('Debug del cliente de Discord:', info));
}

// ─── Shutdown seguro ───
function gracefulShutdown(signal: string): void {
  logger.info(`Recibido ${signal}, apagando de forma segura...`);
  updateBotStatus({
    online: false,
    guilds: client.guilds.cache.size,
    commandsTotal: getTotalCommands(),
    version: 'v3.2.0',
    lastSeen: new Date(),
  }).catch(() => undefined);
  if (client.readyAt) client.destroy();
  process.exit(0);
}
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (error) => {
  logger.error('Rechazo de promesa no manejado:', error);
  captureError(error);
});
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada:', error);
  captureError(error);
  process.exit(1);
});

// ─── Microservicio HTTP NestJS+Fastify (antes Express `statsServer`) ───
void setupStatsServer(client);

client.login(BOT_TOKEN).catch((err) => {
  logger.error('Error al iniciar sesión con el token del bot:', err);
});
