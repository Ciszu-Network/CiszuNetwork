const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Muestra información del bot y lista de comandos disponibles',
    aliases: ['ayuda', 'comandos', 'botinfo', "comando", "commands", "botayuda", "botcomandos", "bothelp", "h", "cmds", "cmd"],
    usage: 'cz!help [comando]',
    category: 'Información',
    
    // Definición del slash command
    slashCommand: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra información del bot y lista de comandos disponibles')
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('Nombre del comando para obtener información detallada')
                .setRequired(false)),
    
    async execute(message, args) {
        const { commands } = message.client;
        
        // Si se solicita un comando específico
        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) || 
                           commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
            
            if (!command) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#4f46e5')
                    .setTitle('❌ Comando no encontrado')
                    .setDescription(`No se encontró el comando \`${commandName}\``)
                    .addFields({
                        name: '💡 Sugerencia',
                        value: 'Usa `cz!help` para ver todos los comandos disponibles',
                        inline: false
                    })
                    .setFooter({
                        text: 'CiszuBot',
                        iconURL: message.client.user.displayAvatarURL()
                    })
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }
            
            // Crear embed detallado para comando específico
            const embed = new EmbedBuilder()
                .setColor('#4f46e5')
                .setTitle(`📖 Comando: ${command.name}`)
                .setDescription(command.description || 'Sin descripción disponible')
                .addFields(
                    {
                        name: '📝 Uso',
                        value: `\`${command.usage || `cz!${command.name}`}\``,
                        inline: true
                    },
                    {
                        name: '📂 Categoría',
                        value: command.category || 'General',
                        inline: true
                    }
                );
            
            if (command.aliases && command.aliases.length > 0) {
                embed.addFields({
                    name: '🔗 Aliases',
                    value: command.aliases.map(alias => `\`${alias}\``).join(', '),
                    inline: false
                });
            }
            
            embed.setFooter({
                text: `CiszuBot • Solicitado por ${message.author.tag}`,
                iconURL: message.client.user.displayAvatarURL()
            }).setTimestamp();
            
            return await message.reply({ embeds: [embed] });
        }
        
        // Crear embed general de ayuda
        const totalCommands = commands.size;
        let description = '';
        let serverInfo = '';
        
        if (message.guild) {
            const totalServers = message.client.guilds.cache.size;
            description = `¡Hola! Soy CiszuBot, un bot completamente en español. Tengo **${totalCommands} comandos** disponibles y estoy sirviendo en **${totalServers} servidor(es)**.`;
            serverInfo = `• Servidores: ${totalServers}\n`;
        } else {
            description = `¡Hola! Soy CiszuBot, un bot completamente en español. Tengo **${totalCommands} comandos** disponibles.`;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#4f46e5')
            .setTitle('🤖 CiszuBot - Ayuda y Comandos')
            .setDescription(description)
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({
                text: `CiszuBot • Solicitado por ${message.author.tag}`,
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();
        
        // Agrupar comandos por categoría
        const categories = {};
        commands.forEach(command => {
            const category = command.category || 'General';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(command);
        });
        
        // Añadir campos para cada categoría
        Object.keys(categories).forEach(category => {
            if (categories[category].length > 0) {
                const commandList = categories[category]
                    .map(cmd => `\`cz!${cmd.name}\` - ${cmd.description || 'Sin descripción'}`)
                    .join('\n');
                
                embed.addFields({
                    name: `📁 ${category}`,
                    value: commandList,
                    inline: false
                });
            }
        });
        
        // Añadir información general
        embed.addFields(
            {
                name: '🔧 Información del Bot',
                value: `• Prefijo: \`cz!\`\n• Comandos: ${totalCommands}\n${serverInfo}• Idioma: Español`,
                inline: true
            },
            {
                name: '🌟 Consejos Rápidos',
                value: '• Usa `cz!help <comando>` para info detallada\n• Puedes mencionarme en lugar del prefijo\n• Los comandos no distinguen mayúsculas',
                inline: true
            }
        );
        
        // Crear menú de selección para acceso rápido a comandos (solo en servidores)
        let components = [];
        if (message.guild) {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_select')
                .setPlaceholder('Selecciona un comando para más información')
                .addOptions(
                    Array.from(commands.values())
                        .filter(command => command.name !== 'template') // Excluir template
                        .map(command => ({
                            label: command.name,
                            description: command.description || 'Sin descripción',
                            value: command.name,
                            emoji: this.getCommandEmoji(command.name)
                        }))
                );
            
            const row = new ActionRowBuilder()
                .addComponents(selectMenu);
            
            components = [row];
        }
        
        const response = await message.reply({
            embeds: [embed],
            components: components
        });
        
        // Manejar interacciones del menú de selección
        const filter = (interaction) => {
            return interaction.customId === 'help_select' && interaction.user.id === message.author.id;
        };
        
        const collector = response.createMessageComponentCollector({
            filter,
            time: 60000 // 1 minuto
        });
        
        collector.on('collect', async (interaction) => {
            const selectedCommand = commands.get(interaction.values[0]);
            
            if (!selectedCommand) {
                await interaction.reply({
                    content: '❌ ¡Comando no encontrado!',
                    ephemeral: true
                });
                return;
            }
            
            const commandEmbed = new EmbedBuilder()
                .setColor('#4f46e5')
                .setTitle(`📖 Comando: ${selectedCommand.name}`)
                .setDescription(selectedCommand.description || 'Sin descripción disponible')
                .addFields(
                    {
                        name: '📝 Uso',
                        value: `\`${selectedCommand.usage || `cz!${selectedCommand.name}`}\``,
                        inline: true
                    },
                    {
                        name: '📂 Categoría',
                        value: selectedCommand.category || 'General',
                        inline: true
                    }
                );
            
            if (selectedCommand.aliases && selectedCommand.aliases.length > 0) {
                commandEmbed.addFields({
                    name: '🔗 Aliases',
                    value: selectedCommand.aliases.map(alias => `\`${alias}\``).join(', '),
                    inline: false
                });
            }
            
            commandEmbed.setFooter({
                text: `CiszuBot • Solicitado por ${interaction.user.tag}`,
                iconURL: message.client.user.displayAvatarURL()
            }).setTimestamp();
            
            await interaction.reply({
                embeds: [commandEmbed],
                ephemeral: true
            });
        });
        
        collector.on('end', async () => {
            // Deshabilitar el menú de selección después del timeout
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    StringSelectMenuBuilder.from(selectMenu)
                        .setDisabled(true)
                        .setPlaceholder('Menú de selección expirado')
                );
            
            try {
                await response.edit({ components: [disabledRow] });
            } catch (error) {
                // El mensaje podría haber sido eliminado
            }
        });
    },
    
    getCommandEmoji(commandName) {
        const emojiMap = {
            'ping': '🏓',
            'pong': '🏓',
            'help': '📖',
            'say': '💬',
            'directsay': '💬',
            'confess': '🤫',
            'hi': '👋',
            'bye': '👋',
            'profile': '👤',
            'test': '🧪',
            'info': 'ℹ️',
            'stats': '📊',
            'server': '🏠',
            'user': '👤'
        };
        
        return emojiMap[commandName] || '⚡';
    }
};