const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'directsay',
    description: 'Hace que el bot repita tu mensaje directamente sin embed',
    aliases: ['decirdirecto', 'deds', 'dsay', 'ds', 'repeatdirect'],
    usage: 'cz!directsay <mensaje>',
    category: 'Diversión',
    
    // Definición del slash command
    slashCommand: new SlashCommandBuilder()
        .setName('directsay')
        .setDescription('Hace que el bot repita tu mensaje directamente sin embed')
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('El mensaje que quieres que repita el bot')
                .setRequired(true)),
    
    async execute(message, args) {
        // Verificar si se proporcionó un mensaje
        if (args.length === 0) {
            return await message.reply('❌ Debes proporcionar un mensaje para que el bot lo repita.');
        }
        
        // Obtener el mensaje a repetir
        const messageToSay = args.join(' ');
        
        // Enviar el mensaje directamente
        await message.reply(messageToSay);
    }
};