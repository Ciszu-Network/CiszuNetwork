import { Suspense } from 'react';
import HomeContent from '@/components/home/HomeContent';
import AuthErrorNotice from '@/components/auth/AuthErrorNotice';
import type { BotStatus } from '@/lib/botStatus';

export const revalidate = 60;

/**
 * Estado real del bot desde Supabase (`ciszubot.bot_status`). Si la red o las
 * credenciales fallan se devuelve `null` y la home muestra placeholders "—"
 * (nunca cifras inventadas). El cliente refresca en vivo con el mismo origen.
 */
async function getBotStatus(): Promise<BotStatus | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://obwzzmbvkrcscqwptlqo.supabase.co';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    const res = await fetch(
      `${url}/rest/v1/bot_status?select=online,last_seen,started_at,version,guilds,commands_total,prefix&id=eq.1`,
      {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Accept-Profile': 'ciszubot' },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as BotStatus[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const status = await getBotStatus();

  return (
    <>
      {/* ?auth=error → modal de aviso (sin romper el ISR de la home). */}
      <Suspense fallback={null}>
        <AuthErrorNotice />
      </Suspense>
      <HomeContent status={status} serverNow={Date.now()} />
    </>
  );
}
