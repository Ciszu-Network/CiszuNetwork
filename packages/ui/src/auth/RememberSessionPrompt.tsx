'use client';

/**
 * RememberSessionPrompt — modal opcional que aparece en el index tras iniciar
 * sesión o registrarse, para recordar que puede "recordar la sesión".
 *
 * Las sesiones expiran (por proyecto, cada ~7 días) y muchos usuarios pierden
 * la sesión al apagar el equipo; activar "recordar" la persiste en el
 * dispositivo para no volver a escribir la contraseña tan a menudo.
 *
 * Es OPCIONAL: si el usuario lo cierra sin decidir no se guarda ninguna
 * preferencia de recordado (solo deja de mostrarse). La decisión también
 * puede cambiarse luego en la configuración de la cuenta.
 */

import { useEffect, useState } from 'react';
import { isRememberEnabled, setRememberEnabled } from './rememberSession';

export interface RememberSessionPromptProps {
  /** Id del usuario autenticado (null/undefined = no mostrar). */
  userId?: string | null;
  /** Identificador del website (p. ej. "ciszubot"); independiza la decisión. */
  site: string;
  /** Nombre visible de la web para el texto ("CiszuBot"). */
  siteName?: string;
  /** Solo mostrar en el index (por defecto true). */
  onlyHome?: boolean;
}

export default function RememberSessionPrompt({
  userId,
  site,
  siteName = 'Ciszu Network',
  onlyHome = true,
}: RememberSessionPromptProps) {
  const [open, setOpen] = useState(false);
  const [decided, setDecided] = useState(false);

  useEffect(() => {
    if (!userId) return;
    if (onlyHome && window.location.pathname !== '/') return;
    try {
      const seen = window.localStorage.getItem(`ciszu-remember-prompt:${site}:${userId}`);
      if (!seen && !isRememberEnabled(site)) setOpen(true);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [userId, site, onlyHome]);

  const dismiss = (choice: 'on' | 'off' | 'seen') => {
    try {
      if (userId) window.localStorage.setItem(`ciszu-remember-prompt:${site}:${userId}`, '1');
    } catch {
      /* almacenamiento no disponible */
    }
    if (choice === 'on') setRememberEnabled(site, true);
    if (choice === 'off') setRememberEnabled(site, false);
    setDecided(true);
    setOpen(false);
  };

  if (!open || decided) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recordar sesión"
      className="fixed inset-0 z-[115] flex items-center justify-center bg-black/70 p-4"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-neon-blue/40 bg-card p-6 text-center shadow-[0_0_40px_-10px_rgba(0,212,255,0.6)]">
        <button
          type="button"
          onClick={() => dismiss('seen')}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-full border border-border p-1.5 text-muted transition hover:text-ink"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-pink text-white">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <h3 className="font-header text-lg font-black uppercase tracking-wide text-ink">
          ¿Recordar tu sesión?
        </h3>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Tu sesión en {siteName} expira cada cierto tiempo y tendrás que iniciar sesión otra vez.
          Activa <strong className="text-ink">recordar sesión</strong> para mantenerla en este
          dispositivo y no perderla al apagar el equipo. Puedes cambiarlo cuando quieras en la
          configuración de tu cuenta.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => dismiss('on')}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition-transform hover:scale-[1.03] active:scale-95"
          >
            Sí, recordar
          </button>
          <button
            type="button"
            onClick={() => dismiss('off')}
            className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-muted transition hover:text-ink"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
