const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, Events, REST, Routes, EmbedBuilder } = require('discord.js');
const Discord = require('discord.js');
const express = require("express");
const fs = require("fs");
const path = require('path');
require('dotenv').config();
const logger = require('./logger');
const config = require('./bot-config.json');
const { updateBotStats } = require('./server');
const app = express();
const prefix = "cz!";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
client.aliases = new Collection();

// Cargar comandos
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath, { recursive: true });
    logger.info('Directorio commands creado');
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
        logger.info(`Comando cargado: ${command.name}`);

        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
                client.aliases.set(alias, command.name);
                logger.info(`Alias cargado: ${alias} -> ${command.name}`);
            });
        }
    } else {
        logger.warn(`El comando en ${filePath} no tiene las propiedades requeridas`);
    }
}

// Event listeners
client.once('ready', () => {
    logger.info(`${client.user.tag} está en línea!`);
    logger.info(`El bot está sirviendo a ${client.guilds.cache.size} servidor(es)`);

    client.user.setActivity(config.activity.name, { type: config.activity.type });
    updateBotStats(client);

    setInterval(() => {
        updateBotStats(client);
    }, 30000);
});

client.once(Events.ClientReady, async c => {
    console.log(`¡Listo! Conectado como ${c.user.tag}`);

    // Cargar comandos de barra diagonal
    const slashcommands = [];
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        // Si el comando tiene una definición de slash command, añadirla al registro
        if (command.slashCommand) {
            slashcommands.push(command.slashCommand.toJSON());
        }
    }

    // Registrar comandos de barra diagonal
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

    try {
        console.log('Comenzando a refrescar los comandos de aplicación (/).');

        await rest.put(
            Routes.applicationcommands(c.user.id), // Comandos globales
            { body: slashcommands },
        );

        console.log('Comandos de aplicación (/) recargados exitosamente.');
    } catch (error) {
        console.error(error);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    
    if (!command) {
        console.error(`Comando "${interaction.commandName}" no encontrado.`);
        return;
    }
    
    try {
        // Crear un objeto "message" simulado para mantener compatibilidad
        const simulatedMessage = {
            client: interaction.client,
            author: interaction.user,
            guild: interaction.guild,
            channel: interaction.channel,
            reply: async (content) => {
                if (interaction.replied || interaction.deferred) {
                    return await interaction.followUp(content);
                } else {
                    return await interaction.reply(content);
                }
            }
        };
        
        // Extraer argumentos del slash command
        const args = [];
        if (interaction.options) {
            // Añadir todos los argumentos
            interaction.options.data.forEach(option => {
                // Para argumentos de tipo string
                if (option.type === 'STRING') {
                    args.push(option.value);
                }
                // Para argumentos de tipo user
                else if (option.type === 'USER') {
                    // Para comandos que esperan una mención de usuario, añadimos la mención
                    args.push(`<@${option.value}>`);
                }
                // Para otros tipos de argumentos, añadir el valor directamente
                else if (option.value !== undefined) {
                    args.push(option.value);
                }
            });
        }
        
        // Ejecutar el comando con el mensaje simulado y argumentos del slash command
        await command.execute(simulatedMessage, args);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '¡Hubo un error al ejecutar este comando!', ephemeral: true });
        } else {
            await interaction.reply({ content: '¡Hubo un error al ejecutar este comando!', ephemeral: true });
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    let prefixUsed = null;
    let isMention = false;
    if (message.content.startsWith(prefix)) {
        prefixUsed = prefix;
    } else if (
        message.mentions.users.has(client.user.id) &&
        message.content.includes(`<@${client.user.id}>`) &&
        !message.reference
    ) {
        prefixUsed = `<@${client.user.id}>`;
        isMention = true;
    }

    if (prefixUsed) {
        const args = message.content.slice(prefixUsed.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        // Si no hay comando después del prefijo o mención, mostrar mensaje de saludo
        if (!commandName) {
            if (isMention) {
                // Mensajes de saludo variados
                const mensajesSaludo = [
                    '¡Hola! ¿En qué puedo ayudarte?',
                    '¿Qué pasa? ¿Necesitas algo?',
                    '¡Hey! ¿Cómo estás?',
                    '¿Qué onda? ¿Todo bien?',
                    '¡Saludos! ¿En qué puedo servirte?',
                    '¿Qué tal tu día? ¿Necesitas ayuda con algo?',
                    '¡Hola de nuevo! ¿Qué puedo hacer por ti?',
                    '¿Qué tal? ¿Estás buscando algún comando?',
                    '¡Hey! ¿Te puedo ayudar en algo?',
                    '¿Qué pasa? ¿Todo bien por aquí?'
                ];
                
                // Seleccionar un mensaje aleatorio
                const mensajeSaludo = mensajesSaludo[Math.floor(Math.random() * mensajesSaludo.length)];
                
                // Generar un color aleatorio
                const color = Math.floor(Math.random() * 16777215);
                
                // Crear embed con el saludo
                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle('👋 ¡Hola!')
                    .setDescription(mensajeSaludo)
                    .setFooter({
                        text: `CiszuBot • Solicitado por ${message.author.tag}`,
                        iconURL: message.client.user.displayAvatarURL()
                    })
                    .setTimestamp();
                
                await message.reply({ embeds: [embed] });
                return;
            } else {
                return;
            }
        }

        let command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));

        if (!command) {
            logger.warn(`Comando desconocido intentado: ${commandName} por ${message.author.tag}`);
            // Mejor respuesta usando EmbedBuilder
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Comando no encontrado')
                .setDescription(`El comando "${commandName}" no está registrado.`)
                .setFooter({ text: `Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
            await message.reply({ embeds: [embed] });
            return;
        }

        try {
            logger.info(`Comando '${commandName}' (${command.name}) ejecutado por ${message.author.tag} en ${message.guild?.name || 'DM'}`);
            await command.execute(message, args);
        } catch (error) {
            logger.error(`Error al ejecutar el comando '${commandName}':`, error);
            try {
                await message.reply({
                    content: '❌ Ocurrió un error al ejecutar este comando. Por favor, inténtalo de nuevo más tarde.',
                    ephemeral: true
                });
            } catch (replyError) {
                logger.error('No se pudo enviar el mensaje de error:', replyError);
            }
        }
    }
});

client.on('guildCreate', (guild) => {
    logger.info(`Unido a un nuevo servidor: ${guild.name} (ID: ${guild.id})`);
    logger.info(`El servidor tiene ${guild.memberCount} miembros`);
});

client.on('guildDelete', (guild) => {
    logger.info(`Salió del servidor: ${guild.name} (ID: ${guild.id})`);
});

client.on('error', (error) => {
    logger.error('Error del cliente de Discord:', error);
});

client.on('warn', (warning) => {
    logger.warn('Advertencia del cliente de Discord:', warning);
});

if (process.env.NODE_ENV === 'development') {
    client.on('debug', (info) => {
        logger.debug('Debug del cliente de Discord:', info);
    });
}

// Apagado seguro
function gracefulShutdown(signal) {
    logger.info(`Recibido ${signal}, apagando de forma segura...`);
    if (client.readyAt) {
        client.destroy();
    }
    process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (error) => {
    logger.error('Rechazo de promesa no manejado:', error);
});

process.on('uncaughtException', (error) => {
    logger.error('Excepción no capturada:', error);
    process.exit(1);
});

// Configuración de Express
app.listen(3000, () => {
    console.log('Servidor Express iniciado en el puerto 3000');
});

client.login(process.env.BOT_TOKEN).catch(err => {
    console.error("Error al iniciar sesión con el token del bot:", err);
});