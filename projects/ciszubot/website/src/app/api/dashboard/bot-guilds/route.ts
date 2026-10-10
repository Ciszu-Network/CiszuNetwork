import { NextResponse } from 'next/server';
import { getSessionUserId, getBotGuilds, invalidateBotGuildsCache } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Lista de servidores donde está el bot (para detección de invitaciones).
 * Con ?refresh=1 invalida la caché antes de responder.
 */
export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false, guilds: [] }, { status: 401 });

  const url = new URL(req.url);
  if (url.searchParams.get('refresh') === '1') await invalidateBotGuildsCache();

  const guilds = await getBotGuilds();
  return NextResponse.json({ ok: guilds !== null, guilds: guilds ?? [] });
}
