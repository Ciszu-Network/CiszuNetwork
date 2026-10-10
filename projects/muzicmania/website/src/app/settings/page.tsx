'use client';

import { AccountSettingsPanel } from '@ciszu/ui';
import { useT } from '@/hooks/useT';
import { supabase } from '@/config/supabase';

/**
 * {t.pages.misc.settingsTitle} (CISZU ID) — paridad entre webs.
 * El panel compartido cubre perfil (nombre display), seguridad (contraseña +
 * OTP C-XXX XXX), sesión (recordar/cerrar), notificaciones y debug.
 */
export default function SettingsPage() {
  const t = useT();
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative overflow-hidden">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="font-header text-2xl font-black uppercase tracking-widest text-ink">{t.pages.misc.settingsTitle}</h1>
          <p className="mt-1 text-sm text-muted">
            {t.pages.misc.settingsSubtitleA} <span className="text-ink">MuzicMania</span>.
          </p>
        </header>
        <AccountSettingsPanel supabase={supabase} site="muzicmania" siteName="MuzicMania" />
      </div>
    </div>
  );
}
