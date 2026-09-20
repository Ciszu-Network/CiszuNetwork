'use client';

/**
 * RecoveryNotice — aviso del estado del enlace de recuperación de contraseña.
 *
 * POR QUÉ: antes, un enlace caducado o ya usado dejaba al usuario en una
 * pantalla que decía "Enlace inválido" con un icono de ERROR (un círculo con
 * una "i" generada) y sin explicar nada más. El usuario no sabía si el enlace
 * había caducado, si ya lo había usado o si lo había copiado a medias.
 *
 * Ahora: icono de ADVERTENCIA (triángulo con signo de exclamación, SVG real y
 * trazo cerrado) + motivo + desde cuándo está inválido + qué hacer.
 *
 * Componente presentacional: recibe el estado ya evaluado (la lógica vive en
 * `evaluateRecoveryLink` de @ciszunetwork/utils) para que las 4 webs muestren
 * exactamente lo mismo.
 */

import type { ReactNode } from 'react';

/** Triángulo de advertencia con exclamación. SVG real, sin fuentes de iconos. */
export function WarningTriangleIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Advertencia"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/** Escudo con check: enlace verificado. */
export function VerifiedShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Enlace verificado"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export type RecoveryNoticeTone = 'warning' | 'success' | 'info';

export interface RecoveryNoticeProps {
  tone?: RecoveryNoticeTone;
  title: string;
  message: string;
  /** Tiempo que lleva inválido, ya formateado ("2 h 15 min"). */
  invalidFor?: string | null;
  /** Texto del botón principal. */
  actionLabel?: string;
  onAction?: () => void;
  /** Texto del botón secundario. */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Contenido extra bajo el mensaje (p. ej. campos del formulario). */
  children?: ReactNode;
  className?: string;
  /** Marca el bloque para el aviso inicial del enlace. */
  icon?: ReactNode;
}

const TONE_STYLES: Record<RecoveryNoticeTone, { border: string; bg: string; text: string; glow: string }> = {
  warning: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_40px_-18px_rgba(245,158,11,0.9)]',
  },
  success: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_40px_-18px_rgba(16,185,129,0.9)]',
  },
  info: {
    border: 'border-sky-500/40',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    glow: 'shadow-[0_0_40px_-18px_rgba(56,189,248,0.9)]',
  },
};

export default function RecoveryNotice({
  tone = 'warning',
  title,
  message,
  invalidFor,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  children,
  className = '',
  icon,
}: RecoveryNoticeProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      role={tone === 'warning' ? 'alert' : 'status'}
      className={`rounded-2xl border p-5 text-center space-y-3 ${styles.border} ${styles.bg} ${styles.glow} ${className}`}
    >
      <div className={`w-12 h-12 mx-auto ${styles.text}`}>
        {icon ?? (tone === 'success' ? <VerifiedShieldIcon className="w-full h-full" /> : <WarningTriangleIcon className="w-full h-full" />)}
      </div>

      <p className={`${styles.text} font-black uppercase tracking-widest text-xs`}>{title}</p>
      <p className="text-gray-400 text-[11px] font-bold leading-relaxed max-w-sm mx-auto">{message}</p>

      {invalidFor ? (
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
          Lleva sin ser válido: {invalidFor}
        </p>
      ) : null}

      {children}

      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="px-6 py-3 rounded-xl btn-primary font-header font-black uppercase tracking-widest text-[11px] active:scale-95"
            >
              {actionLabel}
            </button>
          )}
          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className="px-6 py-3 rounded-xl border border-white/15 text-white/80 hover:text-white hover:border-white/30 font-header font-black uppercase tracking-widest text-[11px] transition-colors active:scale-95"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Recordatorio del contrato del enlace, para la pantalla de "olvidé mi
 * contraseña". Se muestra SIEMPRE, antes de pedir el enlace.
 */
export function RecoveryOneUseNotice({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-sky-500/25 bg-sky-500/5 p-3 text-left ${className}`}
    >
      <span className="w-4 h-4 text-sky-400 shrink-0 mt-0.5">
        <WarningTriangleIcon className="w-full h-full" />
      </span>
      <p className="text-[10px] font-bold leading-relaxed text-sky-200/80">
        El enlace de recuperación es de <strong>un solo uso</strong> y caduca en 1 hora. Mientras no lo uses, tu
        contraseña actual sigue activa. Si pides demasiados enlaces seguidos tendrás que esperar 12 horas.
      </p>
    </div>
  );
}
