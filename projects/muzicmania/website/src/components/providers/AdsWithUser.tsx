'use client';

// Envuelve AdsProvider pasándole el userId del usuario autenticado (CISZU ID)
// para que el sistema ADS registre en ads_impressions cuántos anuncios ha
// visto cada usuario registrado (punto 4 del sistema de anuncios).

import { AdsProvider } from '@ciszu/ui';
import { useAppStore } from '@/store/useAppStore';

export default function AdsWithUser({
  site,
  children,
}: {
  site: string;
  children: React.ReactNode;
}) {
  const user = useAppStore().user;
  const userId = user?.id ?? null;
  return (
    <AdsProvider site={site} authenticated={!!user} premium={user?.role === 'vip'} userId={userId}>
      {children}
    </AdsProvider>
  );
}