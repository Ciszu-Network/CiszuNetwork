'use client';

import { useEffect, useState } from 'react';
import { BOT_STATUS_SELECT, type BotStatus } from '@/lib/botStatus';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Estado del bot en vivo desde Supabase (`ciszubot.bot_status`), con el valor
 * SSR como semilla. Refresca cada 60s — el mismo intervalo del heartbeat real
 * del bot. Si no hay credenciales o falla la red, conserva el último valor
 * conocido (nunca inventa cifras).
 */
export default function useLiveBotStatus(initial: BotStatus | null): BotStatus | null {
  const [status, setStatus] = useState<BotStatus | null>(initial);

  useEffect(() => {
    setStatus(initial);
  }, [initial]);

  useEffect(() => {
    if (!SB_KEY) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(
          `${SB_URL}/rest/v1/bot_status?select=${BOT_STATUS_SELECT}&id=eq.1`,
          {
            headers: {
              apikey: SB_KEY,
              Authorization: `Bearer ${SB_KEY}`,
              'Accept-Profile': 'ciszubot',
            },
            cache: 'no-store',
          }
        );
        if (!res.ok) return;
        const rows = (await res.json()) as BotStatus[];
        if (!cancelled && Array.isArray(rows) && rows[0]) setStatus(rows[0]);
      } catch {
        // Conserva el último estado conocido.
      }
    };

    load();
    const interval = window.setInterval(load, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return status;
}
