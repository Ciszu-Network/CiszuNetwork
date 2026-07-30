const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'serverinfo',
    description: 'Muestra información detallada del servidor',
    aliases: ['servidor', 'infoserver', 'guild', 'server', 'guildinfo'],
    usage: 'cz!serverinfo',
    category: 'Información',
    
    // Definición del slash command
    slashCommand: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Muestra información detallada del servidor'),
    
    async execute(message, args) {
        // Verificar si el mensaje es de un servidor
        if (!message.guild) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#8b5cf6')
                .setTitle('❌ Error')
                .setDescription('Este comando solo puede ser usado en un servidor.')
                .addFields({
                    name: '📝 Uso correcto',
                    value: 'Usa este comando dentro de un servidor de Discord.',
                    inline: false
                })
                .setFooter({
                    text: 'CiszuBot',
                    iconURL: message.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            return await message.reply({ embeds: [errorEmbed] });
        }
        
        const guild = message.guild;
        
        // Obtener información del servidor
        const owner = await guild.fetchOwner();
        const createdAt = Math.floor(guild.createdTimestamp / 1000);
        
        // Contar canales por tipo
        const channels = guild.channels.cache;
        const textChannels = channels.filter(c => c.type === 0).size;
        const voiceChannels = channels.filter(c => c.type === 2).size;
        const categories = channels.filter(c => c.type === 4).size;
        
        // Contar miembros
        const members = guild.members.cache;
        const humans = members.filter(m => !m.user.bot).size;
        const bots = members.filter(m => m.user.bot).size;
        
        // Nivel de verificación
        const verificationLevels = {
            0: 'Ninguno',
            1: 'Bajo',
            2: 'Medio',
            3: 'Alto',
            4: 'Muy Alto'
        };
        
        const embed = new EmbedBuilder()
            .setColor('#8b5cf6')
            .setTitle(`🏠 Información del Servidor`)
            .setDescription(`Información detallada de **${guild.name}**`)
            .setThumbnail(guild.iconURL({ size: 256 }))
            .addFields(
                {
                    name: '📛 Nombre del servidor',
                    value: guild.name,
                    inline: true
                },
                {
                    name: '🆔 ID del servidor',
                    value: guild.id,
                    inline: true
                },
                {
                    name: '👑 Propietario',
                    value: owner.user.tag,
                    inline: true
                },
                {
                    name: '📅 Creado el',
                    value: `<t:${createdAt}:F>\n<t:${createdAt}:R>`,
                    inline: true
                },
                {
                    name: '👥 Miembros',
                    value: `**Total:** ${guild.memberCount}\n**Humanos:** ${humans}\n**Bots:** ${bots}`,
                    inline: true
                },
                {
                    name: '📺 Canales',
                    value: `**Total:** ${channels.size}\n**Texto:** ${textChannels}\n**Voz:** ${voiceChannels}\n**Categorías:** ${categories}`,
                    inline: true
                },
                {
                    name: '🎭 Roles',
                    value: guild.roles.cache.size.toString(),
                    inline: true
                },
                {
                    name: '😀 Emojis',
                    value: guild.emojis.cache.size.toString(),
                    inline: true
                },
                {
                    name: '🔒 Nivel de verificación',
                    value: verificationLevels[guild.verificationLevel],
                    inline: true
                }
            );
        
        // Añadir boost info si el servidor está boosted
        if (guild.premiumTier > 0) {
            embed.addFields({
                name: '💎 Boost',
                value: `**Nivel:** ${guild.premiumTier}\n**Boosts:** ${guild.premiumSubscriptionCount}`,
                inline: true
            });
        }
        
        // Añadir icono del servidor si existe
        if (guild.iconURL()) {
            embed.addFields({
                name: '🖼️ Icono',
                value: `[Enlace al icono](${guild.iconURL({ size: 1024 })})`,
                inline: true
            });
        }
        
        embed.setFooter({
            text: `CiszuBot • Solicitado por ${message.author.tag}`,
            iconURL: message.client.user.displayAvatarURL()
        }).setTimestamp();
        
        await message.reply({ embeds: [embed] });
    }
};