import express from 'express';
import path from 'path';
import type { Client } from 'discord.js';
import { logger } from './logger';
import { addMoney } from './economy';
import { createTopGgWebhookHandler } from './botlists';

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

let activeClient: Client | null = null;

export function setupStatsServer(client?: Client): void {
  activeClient = client ?? null;
  const app = express();
  const port = Number(process.env.PORT || 5000);
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

  // Webhook de votos de top.gg (POST /api/votes) — recompensa 500 monedas por voto
  const webhook = createTopGgWebhookHandler();
  if (webhook) {
    app.post('/api/votes', express.json(), (req, res) => {
      const vote = req.body as { user?: string; type?: string };
      if (vote?.user) {
        const userId = vote.user;
        const guildId = activeClient?.guilds.cache.first()?.id;
        if (guildId) {
          void addMoney(userId, guildId, 500, 'topgg_vote', 'Voto en top.gg');
          logger.info(`🎉 Voto recibido de ${userId} en top.gg — recompensa otorgada`);
        }
      }
      res.status(200).send('OK');
    });
    logger.info('Webhook de votos de top.gg activo en POST /api/votes');
  }

  app.listen(port, () => {
    logger.info(`🌐 Servidor web iniciado en http://localhost:${port}`);
  });
}
