'use client';

import { supabase } from '@/config/supabase';
import { SanctionAppeal } from '@ciszu/ui';
import { useDict } from '@/lib/useDict';

export default function AppealPage() {
  const dict = useDict();
  return (
    <main className="min-h-screen bg-bg px-4 py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-ink">{dict.appealPage.title}</h1>
        <p className="mt-2 text-sm text-muted">
          {dict.appealPage.subtitle}
        </p>
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <SanctionAppeal supabase={supabase} site="ciszunetwork" />
        </div>
      </div>
    </main>
  );
}
