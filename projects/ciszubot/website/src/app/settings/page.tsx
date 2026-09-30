'use client';

import { AccountSettingsPanel } from '@ciszu/ui';
import { supabase } from '@/config/supabase';

/**
 * Configuración de cuenta (CISZU ID) — paridad entre webs.
 * El panel compartido cubre perfil (nombre display), seguridad (contraseña +
 * OTP C-XXX XXX), sesión (recordar/cerrar), notificaciones y debug.
 */
export default function SettingsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative overflow-hidden">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="font-header text-2xl font-black uppercase tracking-widest text-ink">Configuración de cuenta</h1>
          <p className="mt-1 text-sm text-muted">
            Tu cuenta CISZU ID en <span className="text-ink">CiszuBot</span>.
          </p>
        </header>
        <AccountSettingsPanel supabase={supabase} site="ciszubot" siteName="CiszuBot" />
      </div>
    </div>
  );
}
