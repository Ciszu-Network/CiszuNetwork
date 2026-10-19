import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { BOT_COLORS, BOT_FOOTER } from '../config/links';
import { getGuildConfig } from '../services/configService';
import { postNsfwRandom } from '../services/autoposts';

/**
 * cz!nsfwpic — imagen +18 aleatoria. Requiere: apartado +18 activo, comandos
 * +18 activos y estar en un canal marcado como NSFW en Discord.
 */
const command: BotCommand = {
  name: 'nsfwpic',
  description: 'Imagen +18 aleatoria (solo en canales NSFW)',
  aliases: ['nsfw', 'pic18'],
  usage: 'cz!nsfwpic',
  category: '+18',
  slashCommand: new SlashCommandBuilder().setName('nsfwpic').setDescription('Imagen +18 aleatoria (solo canales NSFW)'),
  async execute(message) {
    if (!message.guild) return;
    const channel = message.channel as { nsfw?: boolean } | null;
    if (!channel?.nsfw) {
      await message.reply('🔞 Este comando solo funciona en canales marcados como **NSFW** (edad restringida).');
      return;
    }
    const cfg = await getGuildConfig(message.guild.id);
    if (!cfg.nsfw_enabled) {
      await message.reply('❌ El apartado **+18** está desactivado en este servidor (dashboard → +18).');
      return;
    }
    if (!cfg.nsfw_commands_enabled) {
      await message.reply('❌ Los comandos **+18** están desactivados (dashboard → +18 → Comandos).');
      return;
    }
    const ok = await postNsfwRandom(message.client, message.channel as never);
    if (!ok) {
      const embed = new EmbedBuilder()
        .setColor(BOT_COLORS.danger)
        .setTitle('❌ No se pudo obtener la imagen')
        .setDescription('La fuente de imágenes +18 no respondió. Intenta de nuevo.')
        .setFooter(BOT_FOOTER(message.author.tag, message.client.user?.displayAvatarURL()));
      await message.reply({ embeds: [embed] });
    }
  },
};

export default command;
