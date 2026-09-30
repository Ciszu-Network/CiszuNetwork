'use client';

/**
 * SanctionNotice — modal de sanción activa (ban/mute) para la cuenta afectada.
 *
 * Se monta en los navbars: si el usuario tiene una sanción ACTIVA muestra un
 * modal con motivo, fecha, autor y vigencia. En webs con perfil público
 * (muzicmania) un BAN redirige primero al perfil del usuario y allí aparece.
 * Se recuerda por sesión (sessionStorage) para no repetirse en cada navegación.
 */

import { useEffect, useState } from 'react';

export interface SanctionNoticeSupabase {
  schema?(name: string): any;
  auth: {
    getUser(): Promise<{
      data: { user: { id: string; user_metadata?: Record<string, unknown> | null } | null };
    }>;
  };
}

export interface SanctionNoticeProps {
  supabase: SanctionNoticeSupabase;
  site: string;
  siteName?: string;
  /** Muzicmania: URL de perfil para redirigir cuando hay un BAN activo. */
  profileUrl?: (username: string) => string;
}

type Sanction = {
  id: string;
  type: string;
  reason: string;
  actor: string;
  created_at: string;
  expires_at: string | null;
};

export default function SanctionNotice({
  supabase,
  site,
  siteName = 'Ciszu Network',
  profileUrl,
}: SanctionNoticeProps) {
  const [sanction, setSanction] = useState<Sanction | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) return;
        const publicDb: any = supabase.schema?.('public');
        if (!publicDb) return;

        const res = await publicDb
          .from('sanctions')
          .select('id, type, reason, actor, created_at, expires_at')
          .eq('user_id', user.id)
          .in('type', ['ban', 'mute'])
          .order('created_at', { ascending: false })
          .limit(5);

        const rows = ((res?.data as Sanction[] | null) ?? []);
        const now = Date.now();
        const active = rows.find((r) => !r.expires_at || Date.parse(r.expires_at) > now);
        if (!active) return;

        // Ban + web con perfil público: llevar al perfil (spec) y mostrar allí.
        if (active.type === 'ban' && profileUrl) {
          const username =
            typeof user.user_metadata?.username === 'string' ? user.user_metadata.username : '';
          if (username) {
            const target = profileUrl(username);
            if (window.location.pathname !== target) {
              window.location.replace(target);
              return;
            }
          }
        }

        let seen = false;
        try {
          seen = window.sessionStorage.getItem(`ciszu-sanction-seen:${site}:${active.id}`) === '1';
        } catch {
          /* almacenamiento no disponible */
        }
        if (!seen && !cancelled) setSanction(active);
      } catch {
        /* nunca romper la navegación por este aviso */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, site, profileUrl]);

  if (!sanction) return null;

  const isBan = sanction.type === 'ban';
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isBan ? 'Cuenta baneada' : 'Cuenta muteada'}
      className="fixed inset-0 z-[118] flex items-center justify-center bg-black/75 p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-card p-6 text-center shadow-[0_0_40px_-10px_rgba(255,0,80,0.6)]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/50 bg-red-500/15 font-header text-xl font-black text-red-400">
          !
        </div>
        <h3 className="font-header text-lg font-black uppercase tracking-wide text-ink">
          {isBan ? 'Tu cuenta fue baneada' : 'Tu cuenta fue muteada'}
        </h3>
        <div className="mt-3 space-y-1 text-left text-xs font-bold text-muted">
          <p>
            <span className="text-ink">Motivo:</span> {sanction.reason || 'No especificado'}
          </p>
          <p>
            <span className="text-ink">Fecha:</span> {new Date(sanction.created_at).toLocaleString('es-VE')}
          </p>
          <p>
            <span className="text-ink">Provocado por:</span> {sanction.actor}
          </p>
          <p>
            <span className="text-ink">Vigencia:</span>{' '}
            {sanction.expires_at
              ? `hasta ${new Date(sanction.expires_at).toLocaleString('es-VE')}`
              : 'permanente hasta levantarla manualmente'}
          </p>
        </div>
        <p className="mt-3 text-[11px] font-bold text-muted">
          {isBan
            ? `Mientras el ban esté activo, el uso de ${siteName} queda restringido. Si crees que es un error, contacta con soporte (ciszunetwork@outlook.com).`
            : `El mute restringe la publicación de contenido en ${siteName}. Al cumplirse el tiempo indicado se levanta automáticamente.`}
        </p>
        <button
          type="button"
          onClick={() => {
            try {
              window.sessionStorage.setItem(`ciszu-sanction-seen:${site}:${sanction.id}`, '1');
            } catch {
              /* almacenamiento no disponible */
            }
            setSanction(null);
          }}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-6 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition-transform hover:scale-[1.03] active:scale-95"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
