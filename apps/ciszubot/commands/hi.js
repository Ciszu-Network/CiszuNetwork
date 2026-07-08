const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'hi',
    description: 'Saluda al usuario con un mensaje amigable',
    aliases: ['hola', 'saludar', 'saludo', 'hello', 'hey', 'hihi', 'h'],
    usage: 'cz!hi [@usuario]',
    category: 'Social',
    
    // Definición del slash command
    slashCommand: new SlashCommandBuilder()
        .setName('hi')
        .setDescription('Saluda al usuario con un mensaje amigable')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que quieres saludar (opcional)')
                .setRequired(false)),
    
    async execute(message, args) {
        // Determinar el usuario objetivo
        let targetUser = message.author;
        if (args.length > 0) {
            // Intentar obtener el usuario mencionado
            const mention = message.mentions.users.first();
            if (mention) {
                targetUser = mention;
            }
        }
        
        // Mensajes de saludo variados
        const mensajesSaludo = [
            `¡Hola ${targetUser}! ¡Qué alegría verte por aquí!`,
            `¡Hey ${targetUser}! ¡Bienvenido de nuevo!`,
            `¡Saludos ${targetUser}! ¡Espero que tengas un gran día!`,
            `¡Hola ${targetUser}! ¡Qué gusto saludarte!`,
            `¡Hey ${targetUser}! ¡Qué tal todo?`,
            `¡Hola ${targetUser}! ¡Me alegra mucho verte!`,
            `¡Saludos ${targetUser}! ¡Qué bueno que estás aquí!`,
            `¡Hey ${targetUser}! ¡Qué onda!`,
            `¡Hola ${targetUser}! ¡Qué tal tu día!`,
            `¡Hola ${targetUser}! ¡Qué gusto tenerte por aquí!`,
            `¡Hola ${targetUser}! ¡Qué placer verte!`,
            `¡Hey ${targetUser}! ¡Qué bueno que llegaste!`,
            `¡Saludos ${targetUser}! ¡Qué alegría tenerte aquí!`,
            `¡Hola ${targetUser}! ¡Qué tal tu estado de ánimo!`,
            `¡Hey ${targetUser}! ¡Qué gusto encontrarte!`,
            `¡Hola ${targetUser}! ¡Qué bien que estás aquí!`,
            `¡Saludos ${targetUser}! ¡Qué contento estoy de verte!`,
            `¡Hey ${targetUser}! ¡Qué tal tu semana!`,
            `¡Hola ${targetUser}! ¡Qué alegría que hayas venido!`,
            `¡Hola ${targetUser}! ¡Qué bueno que te apareciste!`
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
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `CiszuBot • Solicitado por ${message.author.tag}`,
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    }
};