import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const TYPES: Record<string, string> = {
  cat: 'https://cataas.com/cat',
  dog: 'https://dog.ceo/api/breeds/image/random',
  fox: 'https://randomfox.ca/floof/',
  duck: 'https://random-d.uk/api/random',
};

const create = (): BotCommand => ({
  name: 'animal',
  description: 'Muestra una foto aleatoria de un animal (cat, dog, fox, duck)',
  aliases: ['gato', 'perro', 'zorro', 'pato', 'mascota'],
  usage: 'cz!animal <cat|dog|fox|duck>',
  category: 'Diversión',
  slashCommand: new SlashCommandBuilder()
    .setName('animal')
    .setDescription('Foto aleatoria de un animal')
    .addStringOption((o) =>
      o
        .setName('tipo')
        .setDescription('Animal')
        .addChoices({ name: 'Gato', value: 'cat' }, { name: 'Perro', value: 'dog' }, { name: 'Zorro', value: 'fox' }, { name: 'Pato', value: 'duck' })
        .setRequired(false)
    ),
  async execute(message, args) {
    const type = (args[0] ?? '').toLowerCase();
    if (!TYPES[type]) {
      await message.reply('❌ Uso: `cz!animal <cat|dog|fox|duck>`');
      return;
    }
    try {
      const url = TYPES[type];
      let image = url;
      if (type !== 'cat') {
        const res = await fetch(url);
        const json = (await res.json()) as { message?: string; url?: string; image?: string };
        image = json.message ?? json.url ?? json.image ?? url;
      }
      const embed = new EmbedBuilder()
        .setColor('#00d4ff')
        .setTitle(`🐾 ${type === 'cat' ? 'Gato' : type === 'dog' ? 'Perro' : type === 'fox' ? 'Zorro' : 'Pato'} aleatorio`)
        .setImage(image)
        .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply('❌ No pude obtener una imagen, inténtalo de nuevo.');
    }
  },
});

export default create;
