'use client';

import React, { useEffect, useState } from 'react';
import { CloudflareGuard as SharedCloudflareGuard } from '@ciszu/ui';
import { useAppStore } from '@/store/useAppStore';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { isTauri } from '@/lib/isTauri';

/**
 * CloudflareGuard (MuzicMania) — adaptador del guard COMPARTIDO de @ciszu/ui.
 *
 * Todas las webs usan el mismo sistema (packages/ui) con props por app. Este
 * adaptador conserva lo propio de MuzicMania:
 *  - Tauri (desktop): desactiva el guard vía la prop `disabled` del compartido.
 *  - Store global (isCloudflareVerified): se sincroniza vía onVerified.
 * La URL del logo y el accent neon-cyan (#00f0ff) de la marca.
 */
export function CloudflareGuard({ children }: { children: React.ReactNode }) {
  const { setIsCloudflareVerified } = useAppStore();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(isTauri());
  }, []);

  return (
    <SharedCloudflareGuard
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      storageKey="cf_verified"
      logo={resolveAssetPath(
        'projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg'
      )}
      title="MuzicMania"
      subtitle="MuzicMania Security • Cloudflare"
      accent="#00f0ff"
      verifyPath="/api/verify-turnstile"
      disabled={isDesktop}
      onVerified={() => setIsCloudflareVerified(true)}
    >
      {children}
    </SharedCloudflareGuard>
  );
}