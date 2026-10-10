'use client';

import { supabase } from '@/config/supabase';
import { useT } from '@/hooks/useT';
import { SanctionAppeal } from '@ciszu/ui';

export default function AppealPage() {
  const t = useT();
  return (
    <main className="min-h-screen bg-bg px-4 py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-ink">{t.pages.misc.appealTitle}</h1>
        <p className="mt-2 text-sm text-muted">
          {t.pages.misc.appealSubtitle}
        </p>
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <SanctionAppeal supabase={supabase} site="muzicmania" />
        </div>
      </div>
    </main>
  );
}
