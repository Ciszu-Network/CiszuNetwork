import express from 'express';
import path from 'path';
import type { Server } from 'http';
import type { Client } from 'discord.js';
import { createRateLimiter } from '@ciszunetwork/utils';
import { logger } from './logger';
import { addMoney } from './economy';
import { createTopGgWebhookHandler } from './botlists';
import { bumpCounter } from './cacheService';

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

export function setupStatsServer(client?: Client): Server {
  activeClient = client ?? null;
  const app = express();
  const port = Number(process.env.PORT || 5000);
  const publicDir = path.join(__dirname, '..', '..', 'public');
  // Anti-abuso: máx. 10 votos por IP y hora (webhooks sin auth del lado top.gg)
  const voteLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });
  const clientIp = (req: express.Request): string =>
    (req.headers['x-forwarded-for']?.toString().split(',')[0] ?? req.ip ?? req.socket.remoteAddress ?? 'unknown').trim();

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
      const rl = voteLimiter.allow(clientIp(req));
      if (!rl.allowed) {
        res.status(429).json({ error: 'rate_limited', retryAfterMs: rl.resetInMs });
        return;
      }
      const vote = req.body as { user?: string; type?: string };
      void bumpCounter('topgg_votes').catch(() => undefined);
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

  // Webhook de votos de DiscordBotList (POST /api/votes/dbl) — recompensa 500 monedas por voto
  const dblSecret = process.env.DBL_WEBHOOK_SECRET || process.env.DISCORDBOTLIST_TOKEN;
  if (dblSecret) {
    app.post('/api/votes/dbl', express.json(), (req, res) => {
      const auth = req.headers.authorization;
      if (auth !== dblSecret) {
        res.status(401).send('Unauthorized');
        return;
      }
      const rl = voteLimiter.allow(`dbl:${clientIp(req)}`);
      if (!rl.allowed) {
        res.status(429).json({ error: 'rate_limited', retryAfterMs: rl.resetInMs });
        return;
      }
      const vote = req.body as { id?: string; username?: string; avatar?: string };
      void bumpCounter('dbl_votes').catch(() => undefined);
      if (vote?.id) {
        const userId = vote.id;
        const guildId = activeClient?.guilds.cache.first()?.id;
        if (guildId) {
          void addMoney(userId, guildId, 500, 'dbl_vote', `Voto en DiscordBotList de ${vote.username ?? userId}`);
          logger.info(`🎉 Voto recibido de ${vote.username ?? userId} en DiscordBotList — recompensa otorgada`);
        }
      }
      res.status(200).send('OK');
    });
    logger.info('Webhook de votos de DiscordBotList activo en POST /api/votes/dbl');
  }

  // Devolvemos el server para poder gestionarlo (y cerrarlo en tests).
  return app.listen(port, () => {
    logger.info(`🌐 Servidor web iniciado en http://localhost:${port}`);
  });
}
