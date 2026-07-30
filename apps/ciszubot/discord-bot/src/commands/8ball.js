const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: '8ball',
    description: 'Responde a tus preguntas con la sabiduría de la bola 8',
    aliases: ['bola8', 'pregunta', 'oraculo', '8b', 'magicball'],
    usage: 'cz!8ball <pregunta>',
    category: 'Diversión',
    
    // Definición del slash command
    slashCommand: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Responde a tus preguntas con la sabiduría de la bola 8')
        .addStringOption(option =>
            option.setName('pregunta')
                .setDescription('La pregunta que quieres hacerle a la bola 8')
                .setRequired(true)),
    
    async execute(message, args) {
        // Verificar si se proporcionó una pregunta
        if (args.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#8b5cf6')
                .setTitle('❌ Error')
                .setDescription('Debes hacer una pregunta para que la bola 8 te responda.')
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
        
        const respuestas = [
            'Sí, definitivamente',
            'Es cierto',
            'Es muy probable',
            'Las perspectivas son buenas',
            'Puedes confiar en ello',
            'Como yo lo veo, sí',
            'Muy probablemente',
            'Las perspectivas no son tan buenas',
            'Concéntrate y pregunta de nuevo',
            'Mejor no te lo digo ahora',
            'No puedo predecirlo ahora',
            'Pregunta más tarde',
            'Mis fuentes dicen que no',
            'Las perspectivas no son muy buenas',
            'Muy dudoso',
            'No cuentes con ello',
            'Mi respuesta es no',
            'Mis fuentes dicen que no',
            'Absolutamente',
            'Sin duda',
            'Claro que sí',
            'Por supuesto',
            'Definitivamente no',
            'Ni lo sueñes',
            'No lo creo',
            'Tal vez',
            'Es posible',
            'Podría ser',
            'No estoy seguro',
            'Pregúntame mañana',
            'Eso es un secreto',
            'No te lo puedo decir',
            'Lo dudo mucho',
            'No hay chance',
            'Seguro que sí',
            'Seguro que no',
            'Quizás',
            'Probablemente',
            'No lo sé',
            'Eso es complicado'
        ];
        
        const pregunta = args.join(' ');
        const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
        
        const embed = new EmbedBuilder()
            .setColor('#8b5cf6')
            .setTitle('🎱 Bola 8 Mágica')
            .setDescription(`**Pregunta:** ${pregunta}\n\n**Respuesta:** ${respuesta}`)
            .setFooter({
                text: `CiszuBot • Consultado por ${message.author.tag}`,
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    }
};