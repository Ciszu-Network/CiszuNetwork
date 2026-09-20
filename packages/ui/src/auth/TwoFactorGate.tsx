'use client';

/**
 * TwoFactorGate — pantalla de verificación en dos pasos al iniciar sesión.
 *
 * POR QUÉ: no existía NINGUNA pantalla que pidiera el código. Las rutas
 * `/api/auth/2fa/*` estaban escritas pero nadie las llamaba, así que en la
 * práctica el 2FA no se podía completar (y en MuzicMania el login decía
 * literalmente "2FA no implementado en esta versión beta").
 *
 * Es autónomo a propósito: habla con la API por sí mismo y avisa al formulario
 * con `onVerified`. Así los 4 logins lo integran con 3 líneas y el
 * comportamiento es idéntico en todas las webs.
 *
 * Flujo:
 *  1. Consulta el estado. Si el 2FA no está activo en esta web, llama a
 *     `onVerified` de inmediato (no se muestra nada).
 *  2. Si está activo, pide el código (si no había uno vigente) y lo envía por
 *     email, mostrando el tiempo restante y los reenvíos disponibles.
 *  3. Al verificar, avisa con `onVerified`; el formulario continúa su flujo.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import AuthCodePanel, { type AuthCodePanelState } from './AuthCodePanel';

export interface TwoFactorGateProps {
  /** Token de la sesión recién creada (Bearer). */
  accessToken: string;
  /** Email del usuario, para el texto de la pantalla. */
  email?: string;
  /** Nombre de la web ("CiszuBot"). */
  siteName?: string;
  /** Se llama cuando el código es correcto (o el 2FA no está activo). */
  onVerified: () => void;
  /** Se llama si el usuario quiere cancelar. */
  onCancel?: () => void;
  /** Ruta base de la API, por si alguna web la monta en otro sitio. */
  apiBase?: string;
}

interface StatusPayload {
  success?: boolean;
  enabled?: boolean;
  active?: boolean;
  state?: AuthCodePanelState;
  message?: string;
  expiresInMs?: number;
  resendsRemaining?: number;
  resendAllowed?: boolean;
  resendWaitMs?: number;
  error?: string;
}

export default function TwoFactorGate({
  accessToken,
  email,
  siteName = 'Ciszu Network',
  onVerified,
  onCancel,
  apiBase = '/api/auth/2fa',
}: TwoFactorGateProps) {
  const [code, setCode] = useState('');
  const [state, setState] = useState<AuthCodePanelState>('valid');
  const [stateMessage, setStateMessage] = useState<string | undefined>();
  const [msLeft, setMsLeft] = useState<number | null>(null);
  const [resendAllowed, setResendAllowed] = useState(false);
  const [resendWaitMs, setResendWaitMs] = useState(0);
  const [resendsRemaining, setResendsRemaining] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifiedRef = useRef(false);

  const call = useCallback(
    async (path: string, init?: RequestInit): Promise<StatusPayload> => {
      const res = await fetch(`${apiBase}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...(init?.headers ?? {}),
        },
      });
      return (await res.json().catch(() => ({}))) as StatusPayload;
    },
    [accessToken, apiBase],
  );

  const applyStatus = useCallback((data: StatusPayload) => {
    if (typeof data.state === 'string') setState(data.state);
    if (data.message) setStateMessage(data.message);
    if (data.error) setStateMessage(data.error);
    setMsLeft(typeof data.expiresInMs === 'number' ? data.expiresInMs : null);
    setResendAllowed(data.resendAllowed === true);
    setResendWaitMs(typeof data.resendWaitMs === 'number' ? data.resendWaitMs : 0);
    if (typeof data.resendsRemaining === 'number') setResendsRemaining(data.resendsRemaining);
  }, []);

  // 1) Estado inicial: ¿2FA activo en esta web? ¿Hay código vigente?
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await call('/status', { method: 'GET' });
        if (cancelled) return;

        if (!status.enabled) {
          verifiedRef.current = true;
          onVerified();
          return;
        }

        if (status.active) {
          applyStatus(status);
        } else {
          const requested = await call('/generate', { method: 'POST' });
          if (cancelled) return;
          if (requested.success === false) {
            setError(requested.error ?? 'No pudimos enviar la clave.');
            applyStatus(requested);
          } else {
            applyStatus({ ...requested, state: 'valid', message: undefined });
          }
        }
      } catch {
        if (!cancelled) setError('No pudimos comprobar la verificación en dos pasos.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [call, applyStatus, onVerified]);

  const handleVerify = useCallback(
    async (value: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await call('/verify', { method: 'POST', body: JSON.stringify({ code: value }) });
        if (res.success) {
          verifiedRef.current = true;
          onVerified();
          return;
        }
        setError(res.error ?? 'La clave no es correcta.');
        applyStatus(res);
      } catch {
        setError('No pudimos verificar la clave.');
      } finally {
        setLoading(false);
      }
    },
    [call, onVerified, applyStatus],
  );

  const handleResend = useCallback(async () => {
    setError(null);
    try {
      const res = await call('/resend', { method: 'POST' });
      if (res.success === false) {
        setError(res.error ?? 'No pudimos reenviar la clave.');
      }
      applyStatus({ ...res, message: res.error });
      setCode('');
    } catch {
      setError('No pudimos reenviar la clave.');
    }
  }, [call, applyStatus]);

  if (loading && state === 'valid' && !error && msLeft === null) {
    return (
      <div className="py-8 text-center space-y-3" data-testid="two-factor-loading">
        <div className="w-10 h-10 mx-auto border-2 border-white/20 border-t-neon-blue rounded-full animate-spin" />
        <p className="text-gray-400 text-[11px] font-bold">Comprobando la verificación en dos pasos…</p>
      </div>
    );
  }

  return (
    <AuthCodePanel
      email={email}
      siteName={siteName}
      value={code}
      onValueChange={setCode}
      onSubmit={handleVerify}
      state={state}
      stateMessage={stateMessage}
      msLeft={msLeft}
      loading={loading}
      error={error}
      onResend={handleResend}
      resendAllowed={resendAllowed}
      resendWaitMs={resendWaitMs}
      resendsRemaining={resendsRemaining}
      onCancel={onCancel}
    />
  );
}
