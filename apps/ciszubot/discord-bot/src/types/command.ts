import type { Client, Collection, Guild, TextChannel } from 'discord.js';
import type { CommandRegistry } from '../utils/commandRegistry';

// Extensión del Client de discord.js con nuestros registros
declare module 'discord.js' {
  interface Client {
    commands: CommandRegistry;
  }
}

/** Estructura base de un comando del bot */
export interface BotCommand {
  name: string;
  description: string;
  aliases: string[];
  usage: string;
  category: string;
  slashCommand?: {
    toJSON(): unknown;
  };
  execute(message: SimulatedMessage, args: string[]): Promise<unknown>;
}

/** Canal con capacidad de envío (evita la unión problemática de tipos) */
export type SendableChannel = Pick<TextChannel, 'send' | 'name' | 'id'>;

/** Mensaje simulado que une comandos de prefijo y slash commands */
export interface SimulatedMessage {
  client: Client;
  author: {
    id: string;
    tag: string;
    username: string;
    createdTimestamp: number;
    bot: boolean;
    displayAvatarURL(opts?: { size?: number }): string;
  };
  guild: Guild | null;
  channel: SendableChannel | null;
  createdTimestamp: number;
  mentions?: { users: { first(): { id: string } | undefined } };
  reply(content: string | { embeds?: unknown[]; content?: string; components?: unknown[] }): Promise<unknown>;
  edit?(content: string | { embeds?: unknown[]; content?: string | null }): Promise<unknown>;
  delete?(): Promise<unknown>;
}
