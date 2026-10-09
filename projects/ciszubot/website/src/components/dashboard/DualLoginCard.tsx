'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/config/supabase';
import { useClientI18n } from '@/hooks/useClientI18n';

/**
 * Dual Login (CiszuBot): el dashboard usa Discord; la configuración de cuenta
 * usa CISZU ID. Con ambas sesiones, control total. El username mostrado es el
 * de Discord mientras no haya CISZU ID, y se reemplaza por el de CISZU ID al
 * iniciar sesión con él.
 */
export function DualLoginCard({ discordUsername }: { discordUsername: string | null }) {
  const { dict } = useClientI18n();
  const [ciszuUsername, setCiszuUsername] = useState<string | null>(null);
  const [hasCiszuId, setHasCiszuId] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        setReady(true);
        return;
      }
      setHasCiszuId(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.session.user.id)
        .maybeSingle();
      if (!active) return;
      setCiszuUsername((profile as { username?: string | null } | null)?.username ?? null);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;

  const discord = discordUsername ? `@${discordUsername}` : '@discord';
  const ciszu = ciszuUsername ? `@${ciszuUsername}` : '@ciszu-id';
  const username = hasCiszuId ? ciszu : discord;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5865F2]/40 bg-[#5865F2]/10 px-3 py-1 text-[#8ea1ff]">
        Discord {hasCiszuId ? '✓' : discord}
      </span>
      {hasCiszuId ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-400">
          {dict.dashboardPage.dualLinked}: {username} · {dict.dashboardPage.dualControl}
        </span>
      ) : (
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-amber-400 transition hover:bg-amber-400/20"
        >
          {dict.dashboardPage.dualDiscordOnly} — {dict.dashboardPage.dualConnect}
        </Link>
      )}
    </div>
  );
}

export default DualLoginCard;
