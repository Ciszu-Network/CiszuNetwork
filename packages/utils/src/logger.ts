import pino from 'pino';

/**
 * Logger estructurado (pino) para servicios server-side.
 *
 * Emite JSON estructurado por stdout (NDJSON), legible por gestores de logs
 * (Vercel Logs, Docker) y por Better Stack/OTLP mediante transporte cuando se
 * disponga de token de fuente (`BETTERSTACK_SOURCE_TOKEN`). En desarrollo se
 * transporta con pino-pretty para legibilidad en terminal.
 *
 * Reglas:
 * - Server-only: no importar desde componentes client (fugaría secrets/levels).
 * - Nivel por entorno: `LOG_LEVEL` o `development`→debug / prod→info.
 * - Nunca loguear secretos, tokens ni cuerpos completos de auth.
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  name: 'ciszunetwork',
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  base: {
    service: process.env.LOG_LABEL ?? 'ciszunetwork',
    env: process.env.NODE_ENV ?? 'development',
  },
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined,
});

// Contra Better Stack (⚠️ condicional, §9.1 de TOOLS_EVALUATION_PLAN): añadir un
// transporte OTLP pino cuando exista source token, p.ej. un transporte que haga
// POST al endpoint de ingest, o desplegar un collector OTLP en el VPS al ejecutar
// VPS_PLAN. `BETTERSTACK_SOURCE_TOKEN` ya queda reservado como variable de entorno.

export default logger;