// GlobalAdvisorConfirm — componente SERVIDOR (RSC) del sistema de mensajes
// globales (GLOBAL_ADVISOR_SYSTEM).
//
// Confirma la ENTREGA de los anuncios relevantes para `site` en cada render de
// página, de forma INDEPENDIENTE del usuario: si el mensaje "llega a la web"
// (se sirve al acceder), se marca en global_announcement_deliveries aunque
// nadie lo lea/cierre. Complementa al GlobalAdvisor (cliente) que también
// confirma en su polling.
//
// Uso (solo en layouts/servidor):
//   import { GlobalAdvisorConfirm } from '@ciszu/ui/server';
//   <GlobalAdvisorConfirm site="ciszu" />
//
// Sin 'use client' -> se ejecuta en el servidor. Usa la anon key (pública),
// la RLS de ciszunetwork permite el upsert de entregas a anon.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const IS_BUILD = process.env.NEXT_PHASE === 'build' || process.env.VERCEL === '1';
const FETCH_TIMEOUT_MS = 4000;

export type AdvisorSite = 'ciszu' | 'ciszukoantony' | 'muzicmania' | 'ciszubot';

const BASE_HEADERS: Record<string, string> = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Accept-Profile': 'ciszunetwork',
};

interface Row {
  id: number;
  target: string;
  expires_at: string | null;
}

async function confirmDeliveries(site: string): Promise<void> {
  if (!SUPABASE_ANON_KEY || IS_BUILD) return;
  try {
    const since = encodeURIComponent(new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString());
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/global_announcements?select=id,target,expires_at&created_at=gt.${since}&order=created_at.asc`,
      { headers: BASE_HEADERS, cache: 'no-store', signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return;
    const items = (await res.json()) as Row[];
    const now = Date.now();
    const relevant = items.filter((a) => {
      if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
      const targets = String(a.target || 'global').split(',').map((t) => t.trim());
      return a.target === 'global' || targets.includes(site);
    });
    for (const a of relevant) {
      try {
        const deliveryController = new AbortController();
        const deliveryTimeout = setTimeout(() => deliveryController.abort(), FETCH_TIMEOUT_MS);
        await fetch(
          `${SUPABASE_URL}/rest/v1/global_announcement_deliveries?announcement_id=eq.${a.id}&site=eq.${site}`,
          {
            method: 'POST',
            headers: {
              ...BASE_HEADERS,
              'Content-Profile': 'ciszunetwork',
              Prefer: 'resolution=merge-duplicates,return=minimal',
            },
            body: JSON.stringify({ announcement_id: a.id, site }),
            signal: deliveryController.signal,
          }
        );
        clearTimeout(deliveryTimeout);
      } catch { /* continuar con el resto */ }
    }
  } catch { /* la confirmación nunca debe romper el render */ }
}

export async function GlobalAdvisorConfirm({ site }: { site: AdvisorSite }) {
  await confirmDeliveries(site);
  return null;
}

export default GlobalAdvisorConfirm;