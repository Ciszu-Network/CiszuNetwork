'use client';

/**
 * AuthCodePanel — pantalla de verificación en dos pasos por email (CISZU ID).
 *
 * CONTRATO DEL CÓDIGO (ver @ciszunetwork/utils/auth-codes):
 *   - Formato oficial `C-123 434`: prefijo `C`, guion, 3 dígitos, espacio, 3 dígitos.
 *   - TEMPORAL: 3 horas.
 *   - ÚNICO POR WEBSITE: el emitido en una web no vale en otra.
 *   - Reenviable con enfriamiento y tope; al agotar el tope o los intentos, el
 *     acceso queda suspendido temporalmente.
 *
 * POR QUÉ ESTE COMPONENTE: no existía ninguna pantalla que pidiera el código;
 * las rutas de API estaban escritas pero nada las llamaba, así que en la
 * práctica el 2FA no se podía completar.
 *
 * Componente presentacional: el estado (`msLeft`, política de reenvío, motivo)
 * lo calcula la página con la lógica compartida. Así las 4 webs se comportan
 * igual y la lógica está cubierta por tests.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { WarningTriangleIcon } from './RecoveryNotice';

/** Formatea dígitos sueltos al patrón `C-123 434` mientras se escribe. */
export function formatAuthCodeInput(raw: string): string {
  const digits = (raw ?? '').toUpperCase().replace(/[^0-9]/g, '').slice(0, 6);
  if (digits.length <= 3) return digits.length ? `C-${digits}` : '';
  return `C-${digits.slice(0, 3)} ${digits.slice(3)}`;
}

/** ¿Están los 6 dígitos completos? */
export function isAuthCodeComplete(value: string): boolean {
  return /^C-\d{3} \d{3}$/.test(formatAuthCodeInput(value));
}

/**
 * Cuenta atrás basada en un instante objetivo, no en decrementos.
 *
 * Por qué: restar 1000 al contador en cada tick acumula el retraso del
 * temporizador del navegador (pestañas en segundo plano, equipo ocupado) y la
 * cuenta terminaba mostrando un tiempo que no era el real. Fijando el objetivo
 * y restando la hora actual, el valor mostrado siempre es correcto.
 */
export function useCountdown(msLeft: number | null | undefined): number {
  const [remaining, setRemaining] = useState(() => Math.max(0, msLeft ?? 0));

  useEffect(() => {
    if (msLeft === null || msLeft === undefined) {
      setRemaining(0);
      return;
    }
    const target = Date.now() + Math.max(0, msLeft);
    setRemaining(Math.max(0, target - Date.now()));
    const id = window.setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
    return () => window.clearInterval(id);
  }, [msLeft]);

  return remaining;
}

/** Duración legible. Duplicado a propósito: el paquete de UI no depende de utils. */
export function describeMs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  if (total < 60) return `${total} s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export type AuthCodePanelState = 'valid' | 'expired' | 'used' | 'suspended' | 'no-code';

export interface AuthCodePanelProps {
  /** Email al que se envió el código (se muestra enmascarado). */
  email?: string;
  /** Código actual. */
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (code: string) => void;
  /** Estado calculado con `evaluateAuthCode`. */
  state?: AuthCodePanelState;
  /** Mensaje del estado. */
  stateMessage?: string;
  /** ms que le quedan al código. */
  msLeft?: number | null;
  loading?: boolean;
  /** Error del último intento. */
  error?: string | null;
  /** Reenviar un código nuevo. */
  onResend?: () => void;
  /** ¿Se puede reenviar ahora? (calculado con `evaluateResend`). */
  resendAllowed?: boolean;
  /** ms de espera antes de poder reenviar. */
  resendWaitMs?: number;
  /** Reenvíos restantes. */
  resendsRemaining?: number;
  /** Cerrar sesión / volver. */
  onCancel?: () => void;
  /** Nombre de la web ("CiszuBot"), para el texto de envío. */
  siteName?: string;
}

export default function AuthCodePanel({
  email,
  value,
  onValueChange,
  onSubmit,
  state = 'valid',
  stateMessage,
  msLeft = null,
  loading = false,
  error,
  onResend,
  resendAllowed = false,
  resendWaitMs = 0,
  resendsRemaining,
  onCancel,
  siteName = 'Ciszu Network',
}: AuthCodePanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const remaining = useCountdown(msLeft);
  const resendWait = useCountdown(resendWaitMs > 0 ? resendWaitMs : null);
  const complete = isAuthCodeComplete(value);
  const suspended = state === 'suspended';
  const blocked = suspended || state === 'no-code';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const maskedEmail = useMemo(() => {
    if (!email) return null;
    const [user, domain] = email.split('@');
    if (!domain) return email;
    const visible = user.slice(0, 2);
    return `${visible}${'•'.repeat(Math.max(1, user.length - 2))}@${domain}`;
  }, [email]);

  return (
    <div className="space-y-5" data-testid="auth-code-panel">
      <div className="text-center space-y-2">
        <h3 className="text-white font-black uppercase tracking-widest text-sm">Verificación en dos pasos</h3>
        <p className="text-gray-400 text-[11px] font-bold leading-relaxed">
          Enviamos una clave temporal a {maskedEmail ? <strong className="text-white">{maskedEmail}</strong> : 'tu correo'} para
          confirmar tu identidad en <strong className="text-white">{siteName}</strong>.
        </p>
      </div>

      {suspended && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-left"
        >
          <span className="w-4 h-4 text-red-400 shrink-0 mt-0.5">
            <WarningTriangleIcon className="w-full h-full" />
          </span>
          <p className="text-[10px] font-bold leading-relaxed text-red-200">
            {stateMessage ?? 'Acceso suspendido temporalmente por demasiados intentos.'}
          </p>
        </div>
      )}

      <div className="space-y-1">
        <label
          htmlFor="auth-code"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1"
        >
          Clave de un solo uso
        </label>
        <input
          id="auth-code"
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          spellCheck={false}
          disabled={blocked}
          value={value}
          onChange={(e) => onValueChange(formatAuthCodeInput(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && complete && !loading && !blocked) onSubmit(value);
          }}
          placeholder="C-123 434"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-lg tracking-[0.35em] font-mono text-white placeholder:text-gray-600 placeholder:tracking-[0.2em] outline-none focus:border-neon-blue transition-all disabled:opacity-50"
          data-testid="auth-code-input"
        />
        <p className="text-[10px] font-bold text-gray-500 ml-1">
          Formato exacto: <span className="font-mono text-gray-300">C-123 434</span> (3 dígitos, espacio, 3 dígitos).
        </p>
      </div>

      {state === 'valid' && remaining > 0 && (
        <p className="text-[10px] font-bold text-center text-gray-400">
          La clave caduca en <strong className="text-white">{describeMs(remaining)}</strong>
        </p>
      )}

      {state !== 'valid' && stateMessage && !suspended && (
        <p className="text-[10px] font-bold text-center text-amber-400">{stateMessage}</p>
      )}

      {error && <p className="text-red-400 text-[11px] font-bold text-center">{error}</p>}

      <button
        type="button"
        disabled={!complete || loading || blocked}
        onClick={() => onSubmit(value)}
        className="w-full py-3.5 rounded-xl btn-primary font-header font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {loading ? 'Verificando…' : 'Verificar clave'}
      </button>

      <div className="flex flex-col items-center gap-2">
        {onResend && (
          <button
            type="button"
            disabled={!resendAllowed || resendWait > 0}
            onClick={onResend}
            className="text-[10px] font-black uppercase tracking-widest text-neon-blue hover:text-white transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            {resendWait > 0
              ? `Podrás reenviar en ${describeMs(resendWait)}`
              : resendAllowed
                ? 'Reenviar clave'
                : 'Sin reenvíos disponibles'}
          </button>
        )}
        {typeof resendsRemaining === 'number' && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
            Reenvíos restantes: {resendsRemaining}
          </span>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            Cancelar y volver
          </button>
        )}
      </div>
    </div>
  );
}
