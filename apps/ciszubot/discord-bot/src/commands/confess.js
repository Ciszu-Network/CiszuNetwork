const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'confess',
    description: 'Envía un mensaje anónimo y borra tu mensaje original',
    aliases: ['confesar', 'anonimo', 'secreto', 'c', 'confession'],
    usage: 'cz!confess <mensaje>',
    category: 'Diversión',
    
    // Definición del slash command
    slashCommand: new SlashCommandBuilder()
        .setName('confess')
        .setDescription('Envía un mensaje anónimo y borra tu mensaje original')
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('El mensaje que quieres confesar anónimamente')
                .setRequired(true)),
    
    async execute(message, args) {
        // Verificar si se proporcionó un mensaje
        if (args.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#8b5cf6')
                .setTitle('❌ Error')
                .setDescription('Debes proporcionar un mensaje para confesarlo anónimamente.')
                .addFields({
                    name: '📝 Uso correcto',
                    value: `\`${this.usage}\``,
                    inline: false
                })
                .setFooter({
                    text: 'CiszuBot',
                    iconURL: message.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            return await message.reply({ embeds: [errorEmbed] });
        }
        
        // Obtener el mensaje a confesar
        const confessionMessage = args.join(' ');
        
        // Crear embed con la confesión anónima
        const embed = new EmbedBuilder()
            .setColor('#8b5cf6')
            .setTitle('🤫 Confesión Anónima')
            .setDescription(confessionMessage)
            .addFields({
                name: '👤 Autor',
                value: 'Usuario Anónimo',
                inline: true
            })
            .setFooter({
                text: 'CiszuBot',
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();
        
        // Enviar la confesión
        await message.channel.send({ embeds: [embed] });
        
        // Borrar el mensaje original del usuario solo si estamos en un servidor
        if (message.guild) {
            try {
                await message.delete();
            } catch (error) {
                // Si no se puede borrar, enviar mensaje temporal
                const deleteEmbed = new EmbedBuilder()
                    .setColor('#8b5cf6')
                    .setTitle('⚠️ Advertencia')
                    .setDescription('No pude borrar tu mensaje original. Asegúrate de que el bot tenga permisos para eliminar mensajes.')
                    .setFooter({
                        text: 'CiszuBot',
                        iconURL: message.client.user.displayAvatarURL()
                    })
                    .setTimestamp();
                
                const tempMessage = await message.reply({ embeds: [deleteEmbed] });
                
                // Borrar el mensaje de advertencia después de 10 segundos
                setTimeout(() => {
                    tempMessage.delete().catch(() => {});
                }, 10000);
            }
        }
    }
};