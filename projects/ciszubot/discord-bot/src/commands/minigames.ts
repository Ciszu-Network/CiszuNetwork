import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';
import { randomBetween } from '../services/economy';

const dice = (): BotCommand => ({
  name: 'dice',
  description: 'Lanza un dado (1-6)',
  aliases: ['dado', 'roll'],
  usage: 'cz!dice',
  category: 'Diversión',
  slashCommand: new SlashCommandBuilder().setName('dice').setDescription('Lanza un dado (1-6)'),
  async execute(message) {
    const value = randomBetween(1, 6);
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('🎲 ¡Lanzaste el dado!')
      .setDescription(`${faces[value - 1]} Te salió el **${value}**.`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
    await message.reply({ embeds: [embed] });
  },
});

const rps = (): BotCommand => ({
  name: 'rps',
  description: 'Piedra, papel o tijeras contra el bot',
  aliases: ['ppt', 'piedrapapelotijeras'],
  usage: 'cz!rps <piedra|papel|tijeras>',
  category: 'Diversión',
  slashCommand: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Piedra, papel o tijeras')
    .addStringOption((o) =>
      o
        .setName('opcion')
        .setDescription('Tu elección')
        .addChoices({ name: 'Piedra', value: 'piedra' }, { name: 'Papel', value: 'papel' }, { name: 'Tijeras', value: 'tijeras' })
        .setRequired(true)
    ),
  async execute(message, args) {
    const options = ['piedra', 'papel', 'tijeras'];
    const emojis = { piedra: '🪨', papel: '📄', tijeras: '✂️' } as const;
    const player = (args[0] ?? '').toLowerCase();
    if (!options.includes(player)) {
      await message.reply('❌ Uso: `cz!rps <piedra|papel|tijeras>`');
      return;
    }
    const botChoice = options[randomBetween(0, 2)];
    const result =
      player === botChoice
        ? '🤝 ¡Empate!'
        : (player === 'piedra' && botChoice === 'tijeras') ||
          (player === 'papel' && botChoice === 'piedra') ||
          (player === 'tijeras' && botChoice === 'papel')
          ? '🎉 ¡Ganaste!'
          : '😢 Perdiste...';

    const embed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle(`${emojis[player as keyof typeof emojis]} vs ${emojis[botChoice as keyof typeof emojis]}`)
      .setDescription(`Elegiste **${player}**, el bot eligió **${botChoice}**.\n\n**${result}**`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
    await message.reply({ embeds: [embed] });
  },
});

const rate = (): BotCommand => ({
  name: 'rate',
  description: 'Cuánto te quiere el bot (0-100%)',
  aliases: ['cuan'],
  usage: 'cz!rate [categoria]',
  category: 'Diversión',
  slashCommand: new SlashCommandBuilder().setName('rate').setDescription('Rating aleatorio'),
  async execute(message, args) {
    const thing = args.join(' ') || 'tu día';
    const value = randomBetween(0, 100);
    const embed = new EmbedBuilder()
      .setColor('#ff33cc')
      .setTitle('🤖 Rating')
      .setDescription(`**${thing}** tiene un **${value}%** de rating.`)
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
    await message.reply({ embeds: [embed] });
  },
});

export default [dice, rps, rate];
