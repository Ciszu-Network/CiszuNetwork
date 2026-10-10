'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClientI18n } from '@/hooks/useClientI18n';

/**
 * Aviso de error de autenticación: `api/auth/discord/callback` redirige a
 * `/?auth=error` cuando el OAuth con Discord falla (cancelado, state inválido,
 * red...). Este modal comunica el fallo en claro y limpia el parámetro para
 * que no se repita al navegar. No corrige el error de fondo (por diseño,
 * fuera de alcance por ahora): solo lo controla y lo hace visible.
 */
export default function AuthErrorNotice() {
  const { dict } = useClientI18n();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.get('auth') !== 'error') return;
    setOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.delete('auth');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [params]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.authNotice.ariaLabel}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-card p-6 text-center shadow-[0_0_40px_-10px_rgba(255,0,80,0.6)]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/50 bg-red-500/15 font-header text-xl font-black text-red-400">
          !
        </div>
        <h3 className="font-header text-lg font-black uppercase tracking-wide text-ink">
          {dict.authNotice.title}
        </h3>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Discord no completó la autorización (cancelada, expirada o con un error temporal).
          Vuelve a intentarlo desde el botón «Iniciar sesión con Discord» del menú; si
          persiste, prueba más tarde o escríbenos por soporte.
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-6 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition-transform hover:scale-[1.03] active:scale-95"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
