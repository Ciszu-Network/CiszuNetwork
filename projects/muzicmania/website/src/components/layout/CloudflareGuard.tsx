'use client';

import React, { useEffect, useState } from 'react';
import { CloudflareGuard as SharedCloudflareGuard } from '@ciszu/ui';
import { useAppStore } from '@/store/useAppStore';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { isTauri } from '@/lib/isTauri';

/**
 * CloudflareGuard (MuzicMania) — wrapper del guard COMPARTIDO de @ciszu/ui.
 *
 * Migrado 11 ago 2026: antes usaba @marsidev/react-turnstile (legacy, solo para
 * MuzicMania). Ahora las 4 webs usan el mismo sistema (packages/ui), con props
 * por app (siteKey/logo/title/subtitle/accent/storageKey/verifyPath).
 *
 * Este wrapper conserva lo propio de MuzicMania:
 *  - Tauri (desktop): salta la verificación Cloudflare.
 *  - Store global (isCloudflareVerified): se sincroniza vía onVerified.
 *    La URL del logo y el accent neon-cyan (#00f0ff) de la marca.
 */
export function CloudflareGuard({ children }: { children: React.ReactNode }) {
  const { setIsCloudflareVerified } = useAppStore();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(isTauri());
  }, []);

  // En Tauri (desktop), saltar verificación Cloudflare
  if (isDesktop) {
    return <>{children}</>;
  }

  // El guard compartido gestiona la verificación por sesión (sessionStorage) y por
  // su propio estado interno; por eso NO hacemos un gate rápido aquí: si devolviéramos
  // children en cuanto onVerified dispara el store, desmontaríamos el guard justo al
  // empezar su animación de salida (fundido) y se cortaría a negro. El store se
  // sincroniza igualmente por si algún otro código consulta isCloudflareVerified.
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
      onVerified={() => setIsCloudflareVerified(true)}
    >
      {children}
    </SharedCloudflareGuard>
  );
}