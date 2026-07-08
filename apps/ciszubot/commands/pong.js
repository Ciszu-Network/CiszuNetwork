const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'pong',
    description: 'Muestra el ping del bot con "ping"',
    aliases: ['latencia2', 'ms2', 'pongping', 'p2'],
    usage: 'cz!pong',
    category: 'Utilidad',
    
    // Definición del slash command
    slashCommand: new SlashCommandBuilder()
        .setName('pong')
        .setDescription('Muestra el ping del bot con "ping"'),
    
    async execute(message, args) {
        // Obtener timestamp antes de enviar el mensaje
        const sent = await message.reply('🏓 Calculando ping...');
        
        // Calcular latencias
        const messageLatency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);
        
        // Crear embed con información de latencia
        const embed = new EmbedBuilder()
            .setColor('#4f46e5')
            .setTitle('🏓 Ping!')
            .setDescription('Aquí tienes la información de latencia del bot.')
            .addFields(
                {
                    name: '📨 Latencia de Mensaje',
                    value: `${messageLatency}ms`,
                    inline: true
                },
                {
                    name: '🌐 Latencia de API',
                    value: `${apiLatency}ms`,
                    inline: true
                },
                {
                    name: '📊 Estado',
                    value: this.getStatusEmoji(messageLatency, apiLatency),
                    inline: true
                }
            )
            .setFooter({
                text: `CiszuBot • Solicitado por ${message.author.tag}`,
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();
        
        // Editar el mensaje original con el embed
        await sent.edit({
            content: null,
            embeds: [embed]
        });
    },
    
    getStatusEmoji(messageLatency, apiLatency) {
        const avgLatency = (messageLatency + apiLatency) / 2;
        
        if (avgLatency < 100) return '🟢 Excelente';
        if (avgLatency < 200) return '🟡 Bueno';
        if (avgLatency < 300) return '🟠 Regular';
        return '🔴 Malo';
    }
};