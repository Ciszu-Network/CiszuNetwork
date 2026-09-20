'use client';

/**
 * Recuperación de contraseña (CISZU ID) — página dedicada.
 *
 * CONTRATO (ver @ciszunetwork/utils/auth-recovery):
 *   1. PRIMERO se evalúa el enlace. NUNCA se inicia sesión con un enlace
 *      inválido: si el enlace no es válido se explica el motivo y se acabó.
 *   2. Si el enlace es válido, la sesión de recuperación es TEMPORAL: al
 *      guardar la contraseña nueva se cierra sola y hay que volver a entrar.
 *   3. La contraseña nueva NO puede ser la anterior.
 *   4. El enlace es de un solo uso; si falla, se dice POR QUÉ y desde cuándo.
 *
 * Página generada desde scripts/apply-reset-password-pages.mjs: para cambiar el
 * comportamiento de las 4 webs, edita la plantilla y vuelve a ejecutarlo.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  PasswordStrengthBar,
  RecoveryNotice,
  SmartImage,
  passwordMeetsMinimum,
  useToast,
} from '@ciszu/ui';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import {
  RECOVERY_LINK_TTL_MS,
  clearRecoveryMarkers,
  describeDuration,
  evaluateRecoveryLink,
  parseRecoveryHash,
  readRequestedAt,
  readSessionMarker,
  resolveInvalidSince,
  validateNewPassword,
  writeSessionMarker,
  type RecoveryLinkStatus,
} from '@ciszunetwork/utils';

const CISZU_ISOTYPE = resolveAssetPath('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg');


const SITE_NAME = 'MuzicMania';

export default function ResetPasswordPage() {
  usePageTitle('RESET_PASSWORD');
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<RecoveryLinkStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const emailRef = useRef<string | null>(null);

  // 1) Evaluar el enlace ANTES de mostrar el formulario.
  useEffect(() => {
    let settled = false;
    const finish = (result: RecoveryLinkStatus) => {
      if (settled) return;
      settled = true;
      setStatus(result);
      setChecking(false);
    };

    const verified = () => {
      writeSessionMarker();
      return evaluateRecoveryLink({ hasToken: true, hasSession: true });
    };

    const parsed = parseRecoveryHash(typeof window === 'undefined' ? '' : window.location.hash);
    const marker = readSessionMarker();
    // Una sesión normal NO habilita esta pantalla: hace falta evidencia del
    // enlace de recuperación (token en la URL o marca de esta pestaña).
    const hasEvidence = parsed.hasToken || marker !== null;

    // Tipos explícitos: el cliente de cada web no siempre infiere el callback.
    const { data: sub } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!hasEvidence) return;
      if (event === 'PASSWORD_RECOVERY') {
        emailRef.current = session?.user?.email ?? emailRef.current;
        finish(verified());
      }
    });

    const evaluateNow = async () => {
      if (hasEvidence) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          emailRef.current = data.session.user.email ?? null;
          finish(verified());
          return;
        }
        const { data: fetched } = await supabase.auth.getUser();
        if (fetched?.user) {
          emailRef.current = fetched.user.email ?? null;
          finish(verified());
          return;
        }
      }

      const requestedAt = readRequestedAt();
      finish(
        evaluateRecoveryLink({
          hasToken: parsed.hasToken,
          hasSession: false,
          sessionMarker: null,
          issuedAt: requestedAt,
          reason: parsed.reason ?? (hasEvidence ? null : 'invalid'),
        }),
      );
    };

    void evaluateNow();

    // Red de seguridad: si supabase-js no resuelve el hash (sin red, bloqueadores),
    // no dejamos la pantalla en "comprobando" para siempre.
    const timeout = window.setTimeout(() => void evaluateNow(), 4000);

    return () => {
      settled = true;
      window.clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  // Instante en que el enlace dejó de servir, para poder decir cuánto lleva así.
  const invalidSince = status && !status.canSetPassword ? resolveInvalidSince() : null;
  const invalidFor = invalidSince ? describeDuration(Date.now() - invalidSince) : null;

  // 2) Guardar la contraseña nueva.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const check = validateNewPassword({ next: password, confirm });
    if (!check.ok) {
      setError(check.errors[0]);
      return;
    }
    if (!passwordMeetsMinimum(password)) {
      setError('La contraseña no alcanza el nivel mínimo de seguridad (Media).');
      return;
    }

    setLoading(true);
    try {
      // La contraseña nueva no puede ser la anterior. Supabase no expone la
      // anterior, así que se comprueba intentando entrar con la candidata: si
      // entra, es que es la misma.
      const email = emailRef.current;
      if (email) {
        const { data: probe, error: probeError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!probeError && probe.session) {
          await supabase.auth.signOut().catch(() => {});
          clearRecoveryMarkers();
          throw new Error('La contraseña nueva no puede ser igual a la anterior. Puedes volver a intentarlo desde el correo.');
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // Sesión TEMPORAL: se cierra sola y hay que volver a iniciar sesión.
      await supabase.auth.signOut().catch(() => {});
      clearRecoveryMarkers();
      setDone(true);
      toast('Contraseña actualizada. Vuelve a iniciar sesión con la nueva.', 'success');
      window.setTimeout(() => router.replace('/login'), 2600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg min-h-[calc(100vh-60px)] relative overflow-hidden pb-24">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-neon-blue/10 blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-neon-purple/10 blur-[140px] pointer-events-none" />

      <div className="pt-14 mb-8 px-4 flex items-center justify-center gap-3">
        <SmartImage src={CISZU_ISOTYPE} alt="Ciszu ID" width={40} height={40} className="w-9 h-9" />

      </div>

      <div className="max-w-md mx-auto px-4 relative">
        <div className="text-center mb-6 space-y-1">
          <h1 className="text-white font-black uppercase tracking-widest text-sm">CISZU ID</h1>
          <p className="text-gray-400 text-[11px] font-bold">Recupera el acceso a tu cuenta de MuzicMania</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-neon-blue rounded-[2rem] blur opacity-20" />
          <div className="relative p-6 md:p-8 bg-surface border border-border rounded-[2rem] shadow-2xl space-y-5 backdrop-blur-3xl">
            {checking ? (
              <div className="text-center space-y-3 py-6">
                <div className="w-10 h-10 mx-auto border-2 border-white/20 border-t-neon-blue rounded-full animate-spin" />
                <p className="text-gray-400 text-[11px] font-bold">Comprobando el enlace…</p>
              </div>
            ) : done ? (
              <RecoveryNotice
                tone="success"
                title="Contraseña actualizada"
                message="Tu contraseña ha sido restablecida y por seguridad cerramos la sesión. Inicia sesión con tu contraseña nueva."
                actionLabel="Ir al login"
                onAction={() => router.replace('/login')}
              />
            ) : status && !status.canSetPassword ? (
              <RecoveryNotice
                tone="warning"
                title={status.title}
                message={status.message}
                invalidFor={invalidFor}
                actionLabel="Pedir un enlace nuevo"
                onAction={() => router.replace('/login?forgot=1')}
                secondaryLabel="Volver al login"
                onSecondary={() => router.replace('/login')}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <RecoveryNotice
                  tone="info"
                  title="Enlace verificado"
                  message="Establece tu contraseña nueva. El enlace es de un solo uso y la sesión se cerrará al guardarla."
                  className="!p-4"
                />

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-neon-blue transition-all"
                  />
                </div>
                <PasswordStrengthBar password={password} />

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">
                    Repetir contraseña
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-neon-blue transition-all"
                  />
                </div>

                <p className="text-[10px] font-bold text-gray-500 leading-relaxed">
                  Mínimo 8 caracteres. No puede ser igual a tu contraseña anterior.
                </p>

                {error && <p className="text-red-400 text-[11px] font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl btn-primary font-header font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {loading ? 'Procesando…' : 'Restablecer contraseña'}
                </button>
              </form>
            )}

            <p className="text-[10px] text-faint font-bold leading-relaxed text-center">
              Los enlaces de recuperación caducan {Math.round(RECOVERY_LINK_TTL_MS / 60000)} minutos después de pedirlos.
              Este proceso se aplica a {SITE_NAME}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
