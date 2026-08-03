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
  permissions?: bigint[];
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
  mentions?: {
    users: {
      first(): { id: string; tag?: string; username?: string; displayAvatarURL?(opts?: { size?: number }): string } | undefined;
    };
    roles: { first(): { id: string } | undefined };
    channels: {
      first(): { id: string; type: number; send?(content: unknown): Promise<unknown> } | undefined;
      find?(predicate: (c: { id: string; type: number }) => boolean): { id: string; type: number; send?(content: unknown): Promise<unknown> } | undefined;
    };
  };
  member?: {
    id: string;
    permissions: { has(bits: bigint): boolean };
    roles: { add(role: unknown): Promise<unknown> };
    voice?: { channel?: { id: string; name: string } | null };
  } | null;
  reply(content: string | { embeds?: unknown[]; content?: string; components?: unknown[] }): Promise<unknown>;
  edit?(content: string | { embeds?: unknown[]; content?: string | null }): Promise<unknown>;
  delete?(): Promise<unknown>;
}
