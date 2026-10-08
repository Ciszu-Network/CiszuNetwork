'use client';

import { supabase } from '@/config/supabase';
import { SanctionAppeal } from '@ciszu/ui';

export default function AppealPage() {
  return (
    <main className="min-h-screen bg-bg px-4 py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-ink">Apelación de sanciones</h1>
        <p className="mt-2 text-sm text-muted">
          Revisa tus sanciones activas y envía una apelación al equipo. También sirve si no tienes sanciones.
        </p>
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <SanctionAppeal supabase={supabase} site="ciszukoantony" />
        </div>
      </div>
    </main>
  );
}
