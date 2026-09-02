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
  const user = useAppStore((s) => s.user);
  return (
    <AdsProvider site={site} authenticated={!!user} userId={user?.id}>
      {children}
    </AdsProvider>
  );
}