import { redirect } from 'next/navigation';
import { getBotGuildIds, getGuildsForUser, getSessionUserId } from '@/lib/auth';
import { isPremiumBeta } from '@/lib/premiumFlags';
import PremiumClient from './client';

export const dynamic = 'force-dynamic';

/**
 * Página Premium de CiszuBot.
 *
 * Acceso (cuando la beta termine): sesión CISZU ID + Discord + bot en al menos
 * un servidor del usuario. Durante la beta, el cliente muestra un modal
 * bloqueante con el disclaimer (todo gratis por ahora) y no hay checkout.
 */
export default async function PremiumPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/?auth=login');

  const [guilds, botGuildIds, beta] = await Promise.all([
    getGuildsForUser(userId),
    getBotGuildIds(),
    isPremiumBeta(),
  ]);

  // null = no se pudo verificar ⇒ false (la UI lo distingue con su CTA)
  const hasBotInServer = botGuildIds === null ? false : guilds.some((g) => botGuildIds.has(g.id));

  return <PremiumClient beta={beta} hasBotInServer={hasBotInServer} />;
}
