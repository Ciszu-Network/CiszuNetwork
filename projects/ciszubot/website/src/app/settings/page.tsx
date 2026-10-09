'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AccountSettingsPanel } from '@ciszu/ui';
import { supabase } from '@/config/supabase';

/**
 * Configuración de cuenta (CISZU ID) — paridad entre webs.
 * Dual Login: el dashboard de CiszuBot usa Discord; esta configuración requiere
 * CISZU ID. Con ambas sesiones, control total.
 */
export default function SettingsPage() {
  const [state, setState] = useState<'loading' | 'guest' | 'authed'>('loading');

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setState(data.session ? 'authed' : 'guest');
      })
      .catch(() => {
        if (active) setState('guest');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative overflow-hidden">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="font-header text-2xl font-black uppercase tracking-widest text-ink">Configuración de cuenta</h1>
          <p className="mt-1 text-sm text-muted">
            Tu cuenta CISZU ID en <span className="text-ink">CiszuBot</span>.{' '}
            <span className="text-amber-400 font-bold">Dual Login:</span> el dashboard usa Discord; esta
            configuración requiere CISZU ID.
          </p>
        </header>

        {state === 'loading' && <p className="text-sm text-muted">Comprobando sesión…</p>}

        {state === 'guest' && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6 space-y-3">
            <p className="text-sm font-bold text-ink">Necesitas iniciar sesión con CISZU ID</p>
            <p className="text-xs text-muted">
              Estás en CiszuBot con Discord (o sin sesión). La configuración de cuenta pertenece a CISZU ID.
              Inicia con tu CISZU ID para gestionarla; con ambas sesiones tendrás control total.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-2.5 font-header text-xs font-black uppercase tracking-widest text-white"
            >
              Iniciar con CISZU ID
            </Link>
          </div>
        )}

        {state === 'authed' && (
          <AccountSettingsPanel supabase={supabase} site="ciszubot" siteName="CiszuBot" />
        )}
      </div>
    </div>
  );
}
