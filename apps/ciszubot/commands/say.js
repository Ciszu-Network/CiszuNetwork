const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'say',
    description: 'Hace que el bot repita tu mensaje en un embed',
    aliases: ['decir', 'di', 'pronunciar', 'repetir', 's', 'repeat'],
    usage: 'cz!say <mensaje>',
    category: 'Diversión',
    
    // Definición del slash command
    slashCommand: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Hace que el bot repita tu mensaje en un embed')
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('El mensaje que quieres que repita el bot')
                .setRequired(true)),
    
    async execute(message, args) {
        // Verificar si se proporcionó un mensaje
        if (args.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#8b5cf6')
                .setTitle('❌ Error')
                .setDescription('Debes proporcionar un mensaje para que el bot lo repita.')
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
        
        // Obtener el mensaje a repetir
        const messageToSay = args.join(' ');
        
        // Crear embed con el mensaje
        const embed = new EmbedBuilder()
            .setColor('#8b5cf6')
            .setTitle('💬 Mensaje Repetido')
            .setDescription(messageToSay)
            .addFields({
                name: '👤 Autor Original',
                value: `${message.author.tag}`,
                inline: true
            })
            .setFooter({
                text: 'CiszuBot',
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    }
};