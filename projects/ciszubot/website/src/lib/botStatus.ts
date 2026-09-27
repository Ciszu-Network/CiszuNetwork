/**
 * Estado del bot compartido entre el servidor (page.tsx) y el cliente
 * (HomeContent). Solo contiene tipos y funciones puras: la lectura remota
 * vive en cada lado (fetch SSR con revalidate en `page.tsx`, polling en vivo
 * en `useLiveBotStatus`).
 */

/** ID público de la aplicación de Discord (mismo del INVITE_URL). */
export const BOT_ID = '1395532235872141312';

/** Fila de `ciszubot.bot_status` (PostgREST, snake_case). */
export interface BotStatus {
  online: boolean;
  last_seen: string | null;
  started_at: string | null;
  version: string | null;
  guilds: number;
  commands_total: number;
  prefix: string;
}

/** Uptime legible a partir de `started_at` (h/m/s). */
export function formatUptime(startedAt: string | null, now: number): string {
  if (!startedAt) return '—';
  const diff = Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${diff}s`;
}

/**
 * El bot envía heartbeat cada 60s: si la última señal tiene más de 3 minutos,
 * se considera desconectado aunque la columna `online` siga en true.
 */
export function isHeartbeatFresh(lastSeen: string | null, now: number): boolean {
  if (!lastSeen) return false;
  const ts = Date.parse(lastSeen);
  return Number.isFinite(ts) && now - ts < 3 * 60 * 1000;
}

/** ¿El bot está operativo ahora mismo? */
export function isBotOnline(status: BotStatus | null, now: number): boolean {
  if (!status) return false;
  return Boolean(status.online) && isHeartbeatFresh(status.last_seen, now);
}
