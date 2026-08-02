import { SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types/command';

const command: BotCommand = {
  name: 'directsay',
  description: 'Hace que el bot repita tu mensaje directamente sin embed',
  aliases: ['decirdirecto', 'deds', 'dsay', 'ds', 'repeatdirect'],
  usage: 'cz!directsay <mensaje>',
  category: 'Diversión',

  slashCommand: new SlashCommandBuilder()
    .setName('directsay')
    .setDescription('Hace que el bot repita tu mensaje directamente sin embed')
    .addStringOption((option) =>
      option.setName('mensaje').setDescription('El mensaje que quieres que repita el bot').setRequired(true),
    ),

  async execute(message, args) {
    if (args.length === 0) {
      return message.reply('❌ Debes proporcionar un mensaje para que el bot lo repita.');
    }
    return message.reply(args.join(' '));
  },
};

export default command;
