import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

function reverseText(text: string): string {
  return text.split('').reverse().join('');
}

function uwuify(text: string): string {
  return text
    .replace(/r/gi, 'w')
    .replace(/l/gi, 'w')
    .replace(/n/gi, 'ny')
    .replace(/!+/g, ' uwu!')
    .replace(/\./g, '. ')
    .trim();
}

function clapify(text: string): string {
  return text.split(' ').join(' 👏 ');
}

function bubbleify(text: string): string {
  const bubbles: Record<string, string> = {
    a: 'ⓐ', b: 'ⓑ', c: 'ⓒ', d: 'ⓓ', e: 'ⓔ', f: 'ⓕ', g: 'ⓖ', h: 'ⓗ', i: 'ⓘ',
    j: 'ⓙ', k: 'ⓚ', l: 'ⓛ', m: 'ⓜ', n: 'ⓝ', o: 'ⓞ', p: 'ⓟ', q: 'ⓠ', r: 'ⓡ',
    s: 'ⓢ', t: 'ⓣ', u: 'ⓤ', v: 'ⓥ', w: 'ⓦ', x: 'ⓧ', y: 'ⓨ', z: 'ⓩ',
    A: 'Ⓐ', B: 'Ⓑ', C: 'Ⓒ', D: 'Ⓓ', E: 'Ⓔ', F: 'Ⓕ', G: 'Ⓖ', H: 'Ⓗ', I: 'Ⓘ',
    J: 'Ⓙ', K: 'Ⓚ', L: 'Ⓛ', M: 'Ⓜ', N: 'Ⓝ', O: 'Ⓞ', P: 'Ⓟ', Q: 'Ⓠ', R: 'Ⓡ',
    S: 'Ⓢ', T: 'Ⓣ', U: 'Ⓤ', V: 'Ⓥ', W: 'Ⓦ', X: 'Ⓧ', Y: 'Ⓨ', Z: 'Ⓩ',
  };
  return text
    .split('')
    .map((ch) => bubbles[ch] ?? ch)
    .join('');
}

const create = (): BotCommand => ({
  name: 'text',
  description: 'Convierte texto con estilos (reverse, uwu, clap, bubble)',
  aliases: ['convertir', 'estilo', 'textoconvert'],
  usage: 'cz!text <estilo> <texto>  |  estilos: reverse, uwu, clap, bubble',
  category: 'Diversión',
  slashCommand: new SlashCommandBuilder()
    .setName('text')
    .setDescription('Convierte texto con estilos')
    .addStringOption((o) =>
      o
        .setName('estilo')
        .setDescription('Estilo a aplicar')
        .addChoices(
          { name: 'reverse', value: 'reverse' },
          { name: 'uwu', value: 'uwu' },
          { name: 'clap', value: 'clap' },
          { name: 'bubble', value: 'bubble' }
        )
        .setRequired(true)
    )
    .addStringOption((o) => o.setName('texto').setDescription('Texto a convertir').setRequired(true)),
  async execute(message, args) {
    const style = (args[0] ?? '').toLowerCase();
    const text = args.slice(1).join(' ') || 'ejemplo';
    if (!['reverse', 'uwu', 'clap', 'bubble'].includes(style)) {
      await message.reply('❌ Uso: `cz!text <reverse|uwu|clap|bubble> <texto>`');
      return;
    }

    let result: string;
    switch (style) {
      case 'reverse': result = reverseText(text); break;
      case 'uwu': result = uwuify(text); break;
      case 'clap': result = clapify(text); break;
      case 'bubble': result = bubbleify(text); break;
      default: result = text;
    }

    const embed = new EmbedBuilder()
      .setColor('#ff33cc')
      .setTitle(`✨ Texto ${style}`)
      .setDescription(result)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
    await message.reply({ embeds: [embed] });
  },
});

export default create;
