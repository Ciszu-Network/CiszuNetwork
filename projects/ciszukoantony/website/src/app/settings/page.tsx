'use client';

import { AccountSettingsPanel } from '@ciszu/ui';
import { supabase } from '@/config/supabase';
import { useDict } from '@/components/providers/I18nProvider';

/**
 * Configuración de cuenta (CISZU ID) — paridad entre webs.
 * El panel compartido cubre perfil (nombre display), seguridad (contraseña +
 * OTP C-XXX XXX), sesión (recordar/cerrar), notificaciones y debug.
 */
export default function SettingsPage() {
  const dict = useDict();
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative overflow-hidden">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="font-header text-2xl font-black uppercase tracking-widest text-ink">{dict.settingsPage.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {dict.settingsPage.subtitleA} <span className="text-ink">{"Ciszuko Antony"}</span>.
          </p>
        </header>
        <AccountSettingsPanel supabase={supabase} site="ciszukoantony" siteName="Ciszuko Antony" />
      </div>
    </div>
  );
}
