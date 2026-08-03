import { Client } from 'discord.js';
import { logger } from './logger';

/**
 * Publica estadísticas del bot en top.gg y DiscordBotList.
 * Los tokens se leen de env: TOP_GG_TOKEN y DISCORDBOTLIST_TOKEN.
 * Si no hay tokens configurados, el módulo se desactiva silenciosamente.
 */

let autoPoster: { on: (event: string, cb: () => void) => void; start: () => void } | null = null;
let dbl: { postStats: (stats: { guilds: number; users: number }) => Promise<unknown> } | null = null;

async function init(client: Client): Promise<void> {
  if (autoPoster || dbl) return;

  const topggToken = process.env.TOP_GG_TOKEN;
  if (topggToken) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { AutoPoster } = require('@top-gg/sdk') as {
        AutoPoster: new (token: string, client: Client) => { on: (e: string, cb: () => void) => void; start: () => void };
      };
      autoPoster = new AutoPoster(topggToken, client);
      autoPoster.on('posted', () => logger.info('Estadísticas publicadas en top.gg'));
      autoPoster.on('error', () => logger.warn('Error posteando a top.gg'));
      autoPoster.start();
      logger.info('AutoPoster de top.gg activado');
    } catch (error) {
      logger.warn('No se pudo inicializar top.gg:', error);
    }
  }

  const dblToken = process.env.DISCORDBOTLIST_TOKEN;
  if (dblToken) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { DiscordBotList } = require('discordbotlist') as {
        DiscordBotList: new (token: string) => { postStats: (s: { guilds: number; users: number }) => Promise<unknown> };
      };
      dbl = new DiscordBotList(dblToken);
      logger.info('Cliente de DiscordBotList inicializado');
    } catch (error) {
      logger.warn('No se pudo inicializar DiscordBotList:', error);
    }
  }
}

export async function postBotStats(client: Client): Promise<void> {
  try {
    await init(client);
    const guilds = client.guilds.cache.size;
    const users = client.users.cache.size;
    if (dbl) {
      await dbl.postStats({ guilds, users }).catch((err: Error) => logger.warn('DBL postStats:', err.message));
    }
    if (!autoPoster && !dbl) {
      // Sin tokens — nada que hacer
    }
  } catch (error) {
    logger.warn('postBotStats:', error);
  }
}

/** Programa el posteo periódico (top.gg AutoPoster ya lo hace; este es el de DBL) */
export function scheduleStatsPosting(client: Client): void {
  void postBotStats(client);
  setInterval(() => void postBotStats(client), 30 * 60 * 1000);
}

/**
 * Valida la firma de un webhook de voto de top.gg.
 * Endpoint HTTP: POST /api/votes (ver statsServer.ts)
 */
export function createTopGgWebhookHandler() {
  const token = process.env.TOP_GG_TOKEN;
  if (!token) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Webhook } = require('@top-gg/sdk') as {
      Webhook: new (token: string) => { middleware: unknown };
    };
    return new Webhook(token);
  } catch {
    return null;
  }
}
