const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'bye',
    description: 'Se despide del usuario con un mensaje amigable',
    aliases: ['adios', 'despedir', 'despedida', 'chao', 'hasta-luego', 'byebye', 'b'],
    usage: 'cz!bye [@usuario]',
    category: 'Social',
    
    // Definición del slash command
    slashCommand: new SlashCommandBuilder()
        .setName('bye')
        .setDescription('Se despide del usuario con un mensaje amigable')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que quieres despedir (opcional)')
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
        
        // Mensajes de despedida variados
        const mensajesDespedida = [
            `¡Adiós ${targetUser}! ¡Que tengas un buen día!`,
            `¡Chao ${targetUser}! ¡Nos vemos pronto!`,
            `¡Hasta luego ${targetUser}! ¡Cuídate mucho!`,
            `¡Adiós ${targetUser}! ¡Fue un placer verte!`,
            `¡Chao ${targetUser}! ¡Que todo te vaya bien!`,
            `¡Hasta la próxima ${targetUser}! ¡Que tengas suerte!`,
            `¡Adiós ${targetUser}! ¡Espero verte de nuevo pronto!`,
            `¡Chao ${targetUser}! ¡Que tengas un excelente día!`,
            `¡Hasta luego ${targetUser}! ¡Gracias por tu visita!`,
            `¡Adiós ${targetUser}! ¡Que la fuerza te acompañe!`,
            `¡Chao ${targetUser}! ¡Que tengas un día maravilloso!`,
            `¡Hasta luego ${targetUser}! ¡Cuídate mucho!`,
            `¡Adiós ${targetUser}! ¡Fue genial verte!`,
            `¡Chao ${targetUser}! ¡Que todo te salga bien!`,
            `¡Hasta la próxima ${targetUser}! ¡Que tengas un gran día!`,
            `¡Adiós ${targetUser}! ¡Espero que nos veamos pronto!`,
            `¡Chao ${targetUser}! ¡Que tengas una semana excelente!`,
            `¡Hasta luego ${targetUser}! ¡Gracias por tu tiempo!`,
            `¡Adiós ${targetUser}! ¡Que el universo te sonría!`,
            `¡Chao ${targetUser}! ¡Que todo te vaya de maravilla!`
        ];
        
        // Seleccionar un mensaje aleatorio
        const mensajeDespedida = mensajesDespedida[Math.floor(Math.random() * mensajesDespedida.length)];
        
        // Generar un color aleatorio
        const color = Math.floor(Math.random() * 16777215);
        
        // Crear embed con la despedida
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('👋 ¡Adiós!')
            .setDescription(mensajeDespedida)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `CiszuBot • Solicitado por ${message.author.tag}`,
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    }
};