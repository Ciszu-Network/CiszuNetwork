import { Body, Controller, Get, Headers, Post, Req, Res } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Client } from 'discord.js';
import { createRateLimiter } from '@ciszunetwork/utils';
import { logger } from './logger';
import { botStats } from './statsState';
import { addMoney } from './economy';
import { bumpCounter } from './cacheService';

/**
 * Microservicio HTTP del bot (NestJS + adaptador Fastify).
 * - GET  /api/stats         estado en vivo
 * - POST /api/update-stats  actualización manual de campos
 * - POST /api/votes         webhook de votos de top.gg
 * - POST /api/votes/dbl     webhook de votos de DiscordBotList
 */

const TOP_GG_TOKEN = () => process.env.TOP_GG_TOKEN;
const DBL_SECRET = () => process.env.DBL_WEBHOOK_SECRET || process.env.DISCORDBOTLIST_TOKEN;

// Anti-abuso: máx. 10 votos por IP y hora (webhooks sin auth del lado top.gg)
const voteLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });

let activeClient: Client | null = null;

export function setActiveClient(client: Client | null): void {
  activeClient = client;
}

function clientIp(req: FastifyRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || req.ip || 'unknown';
}

@Controller('api')
export class StatsController {
  @Get('stats')
  getStats(): typeof botStats {
    return botStats;
  }

  @Post('update-stats')
  updateStats(@Body() body: Record<string, unknown>): { success: boolean } {
    Object.assign(botStats, body);
    return { success: true };
  }

  @Post('votes')
  handleTopGgVote(@Req() req: FastifyRequest, @Res() res: FastifyReply): FastifyReply {
    const topGgToken = TOP_GG_TOKEN();
    if (topGgToken) {
      const auth = req.headers.authorization;
      if (auth !== topGgToken) return res.status(401).send('Unauthorized');
    }
    const rl = voteLimiter.allow(clientIp(req));
    if (!rl.allowed) {
      return res.status(429).send({ error: 'rate_limited', retryAfterMs: rl.resetInMs });
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
    return res.status(200).send('OK');
  }

  @Post('votes/dbl')
  handleDblVote(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Headers('authorization') authorization?: string
  ): FastifyReply {
    if (DBL_SECRET() && authorization !== DBL_SECRET()) {
      return res.status(401).send('Unauthorized');
    }
    const rl = voteLimiter.allow(`dbl:${clientIp(req)}`);
    if (!rl.allowed) {
      return res.status(429).send({ error: 'rate_limited', retryAfterMs: rl.resetInMs });
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
    return res.status(200).send('OK');
  }
}