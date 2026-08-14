import type { Client } from 'discord.js';

export interface BotStats {
  online: boolean;
  guilds: number;
  users: number;
  commands: number;
  uptime: number;
  lastActivity: string | null;
  commandsExecuted: number;
}

/** Estado compartido entre el microservicio HTTP (NestJS+Fastify) y el resto del bot. */
export const botStats: BotStats = {
  online: false,
  guilds: 0,
  users: 0,
  commands: 0,
  uptime: 0,
  lastActivity: null,
  commandsExecuted: 0,
};

export function updateStats(client: Client): void {
  if (client?.user) {
    botStats.online = client.readyAt !== null;
    botStats.guilds = client.guilds.cache.size;
    botStats.users = client.users.cache.size;
    botStats.uptime = client.uptime ?? 0;
    botStats.lastActivity = new Date().toISOString();
  }
}

export function incrementCommands(): void {
  botStats.commandsExecuted += 1;
}

export function getTotalCommands(): number {
  return botStats.commandsExecuted;
}