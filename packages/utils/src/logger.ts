import pino from 'pino';

/**
 * Logger estructurado (pino) para servicios server-side.
 *
 * Emite JSON estructurado por stdout (NDJSON), legible por gestores de logs
 * (Vercel Logs, Docker). En producción, si existe `BETTERSTACK_TELEMETRY_TOKEN`
 * (vault: `services/supabase/.env` → `BETTERSTACK_TELEMETRY_TOKEN`), se añade un
 * transporte `@logtail/pino` que reenvía los logs a Better Stack Telemetry
 * (live tail, logs SQL buscables). En desarrollo se usa pino-pretty para
 * legibilidad en terminal y NO se envía a Better Stack (evita gastar el cupo
 * free con logs de desarrollo).
 *
 * Reglas:
 * - Server-only: no importar desde componentes client (fugaría secrets/levels).
 * - Nivel por entorno: `LOG_LEVEL` o `development`→debug / prod→info.
 * - `pino.transport` corre en worker threads (Node runtime); en Next.js usar
 *   siempre runtime `nodejs` (no edge) cuando se importe este logger con token.
 * - Nunca loguear secretos, tokens ni cuerpos completos de auth.
 */

const isDev = process.env.NODE_ENV !== 'production';

const hasBetterStack = Boolean(process.env.BETTERSTACK_TELEMETRY_TOKEN) && !isDev;

const transport = isDev
  ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
  : hasBetterStack
    ? {
        target: '@logtail/pino',
        options: {
          sourceToken: process.env.BETTERSTACK_TELEMETRY_TOKEN,
        },
      }
    : undefined;

export const logger = pino({
  name: 'ciszunetwork',
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  base: {
    service: process.env.LOG_LABEL ?? 'ciszunetwork',
    env: process.env.NODE_ENV ?? 'development',
  },
  transport,
});

export default logger;