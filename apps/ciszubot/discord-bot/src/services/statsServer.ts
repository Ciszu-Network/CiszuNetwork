import express from 'express';
import path from 'path';
import type { Client } from 'discord.js';
import { logger } from './logger';

interface BotStats {
  online: boolean;
  guilds: number;
  users: number;
  commands: number;
  uptime: number;
  lastActivity: string | null;
  commandsExecuted: number;
}

const botStats: BotStats = {
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

export function setupStatsServer(): void {
  const app = express();
  const port = 5000;
  const publicDir = path.join(__dirname, '..', '..', 'public');

  app.use(express.static(publicDir));
  app.use(express.json());

  app.get('/api/stats', (_req, res) => {
    res.json(botStats);
  });

  app.post('/api/update-stats', (req, res) => {
    Object.assign(botStats, req.body);
    res.json({ success: true });
  });

  app.listen(port, () => {
    logger.info(`🌐 Servidor web iniciado en http://localhost:${port}`);
  });
}
