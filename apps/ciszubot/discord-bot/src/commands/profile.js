const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'profile',
    description: 'Muestra información detallada del usuario',
    aliases: ['perfil', 'usuario', 'info-usuario', 'userinfo', 'u', 'perfil-usuario'],
    usage: 'cz!profile [@usuario]',
    category: 'Información',
    
    // Definición del slash command
    slashCommand: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Muestra información detallada del usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario del que quieres obtener información (opcional)')
                .setRequired(false)),
    
    async execute(message, args) {
        // Determinar el usuario objetivo
        let targetUser = message.author;
        if (args.length > 0) {
            // Intentar obtener el usuario mencionado
            const mention = message.mentions.users.first();
            if (mention) {
                targetUser = mention;
            } else {
                // Intentar buscar por ID
                try {
                    const userId = args[0].replace(/[<@!>]/g, '');
                    targetUser = await message.client.users.fetch(userId);
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#8b5cf6')
                        .setTitle('❌ Usuario no encontrado')
                        .setDescription('No se pudo encontrar el usuario especificado.')
                        .addFields({
                            name: '📝 Uso correcto',
                            value: `\`${this.usage}\``,
                            inline: false
                        })
                        .setFooter({
                            text: 'CiszuBot • Bot en español',
                            iconURL: message.client.user.displayAvatarURL()
                        })
                        .setTimestamp();
                    
                    return await message.reply({ embeds: [errorEmbed] });
                }
            }
        }
        
        // Obtener información del miembro del servidor
        let member = null;
        try {
            member = await message.guild.members.fetch(targetUser.id);
        } catch (error) {
            // Usuario no está en el servidor
        }
        
        // Calcular fechas
        const accountCreated = Math.floor(targetUser.createdTimestamp / 1000);
        const joinedServer = member ? Math.floor(member.joinedTimestamp / 1000) : null;
        
        // Obtener roles (si el usuario está en el servidor)
        const roles = member ? member.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => role.toString())
            .slice(0, 10) : [];
        
        // Crear embed con información del usuario
        const embed = new EmbedBuilder()
            .setColor('#8b5cf6')
            .setTitle(`👤 Perfil de ${targetUser.username}`)
            .setDescription(`Información detallada del usuario`)
            .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
            .addFields(
                {
                    name: '📛 Nombre de usuario',
                    value: targetUser.username,
                    inline: true
                },
                {
                    name: '🔖 Tag completo',
                    value: targetUser.tag,
                    inline: true
                },
                {
                    name: '🆔 ID',
                    value: targetUser.id,
                    inline: true
                },
                {
                    name: '📅 Cuenta creada',
                    value: `<t:${accountCreated}:F>\n<t:${accountCreated}:R>`,
                    inline: true
                }
            );
        
        if (member && joinedServer) {
            embed.addFields({
                name: '🏠 Se unió al servidor',
                value: `<t:${joinedServer}:F>\n<t:${joinedServer}:R>`,
                inline: true
            });
        }
        
        // Añadir información del avatar
        embed.addFields({
            name: '🖼️ Avatar',
            value: `[Enlace al avatar](${targetUser.displayAvatarURL({ size: 1024 })})`,
            inline: true
        });
        
        // Añadir roles si el usuario está en el servidor
        if (member) {
            embed.addFields(
                {
                    name: '🎭 Apodo en el servidor',
                    value: member.nickname || 'Sin apodo',
                    inline: true
                },
                {
                    name: '🏆 Rol más alto',
                    value: member.roles.highest.toString(),
                    inline: true
                },
                {
                    name: '🌈 Color de rol',
                    value: member.displayHexColor || '#000000',
                    inline: true
                }
            );
            
            if (roles.length > 0) {
                embed.addFields({
                    name: `🎯 Roles (${member.roles.cache.size - 1})`,
                    value: roles.join(', ') + (member.roles.cache.size > 11 ? '...' : ''),
                    inline: false
                });
            }
        }
        
        // Información adicional
        embed.addFields({
            name: '🤖 Es un bot',
            value: targetUser.bot ? 'Sí' : 'No',
            inline: true
        });
        
        if (member) {
            embed.addFields({
                name: '📱 Estado',
                value: member.presence?.status || 'Desconectado',
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