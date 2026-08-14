import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import type { Server } from 'http';
import type { Client } from 'discord.js';
import { logger } from './logger';
import { StatsModule } from './stats.module';
import { setActiveClient } from './stats.controller';
import { updateStats, incrementCommands, getTotalCommands } from './statsState';

export { updateStats, incrementCommands, getTotalCommands };

let activeClient: Client | null = null;

/**
 * Microservicio HTTP del bot (NestJS + adaptador Fastify).
 * Reemplaza el antiguo `express()` — canaliza statics, `/api/stats`,
 * `/api/update-stats` y los webhooks de votos (top.gg / DiscordBotList).
 * Devuelve el `http.Server` de Fastify para poder gestionarlo (tests).
 */
export async function setupStatsServer(client?: Client): Promise<Server> {
  activeClient = client ?? null;
  setActiveClient(activeClient);

  const app = await NestFactory.create<NestFastifyApplication>(StatsModule, new FastifyAdapter());
  app.enableShutdownHooks();
  app.enableCors({ origin: false });

  const publicDir = path.join(__dirname, '..', '..', 'public');
  await app.register(fastifyStatic as never, { root: publicDir });

  const port = Number(process.env.PORT || 5000);
  await app.listen(port, '0.0.0.0');

  const server = app.getHttpServer();
  const httpServer = server as unknown as Server;
  logger.info(`🌐 Servidor web iniciado en http://localhost:${(httpServer.address() as { port: number })?.port ?? port}`);
  return httpServer;
}