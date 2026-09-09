'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/config/supabase';
import { usePageTitle } from '@/lib/usePageTitle';
import { SmartImage } from '@ciszu/ui';
import { useToast } from '@ciszu/ui';

const CISZU_ISOTYPE = 'projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg';

const RATE_LIMIT_KEY = 'ciszu_reset_rate_limit';
const RATE_LIMIT_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours

function getRateLimitData(): { count: number; firstRequest: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setRateLimitData(count: number, firstRequest: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count, firstRequest }));
  } catch {
    /* noop */
  }
}

function checkRateLimit(): { allowed: boolean; remainingMs: number } {
  const data = getRateLimitData();
  if (!data) return { allowed: true, remainingMs: 0 };
  const elapsed = Date.now() - data.firstRequest;
  if (elapsed >= RATE_LIMIT_WINDOW_MS) {
    // Window expired, reset
    return { allowed: true, remainingMs: 0 };
  }
  if (data.count >= 3) {
    return { allowed: false, remainingMs: RATE_LIMIT_WINDOW_MS - elapsed };
  }
  return { allowed: true, remainingMs: 0 };
}

function incrementRateLimit() {
  const data = getRateLimitData();
  if (!data) {
    setRateLimitData(1, Date.now());
  } else {
    const elapsed = Date.now() - data.firstRequest;
    if (elapsed >= RATE_LIMIT_WINDOW_MS) {
      setRateLimitData(1, Date.now());
    } else {
      setRateLimitData(data.count + 1, data.firstRequest);
    }
  }
}

export default function ResetPasswordPage() {
  usePageTitle('RESET_PASSWORD');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verified, setVerified] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);

  // Check rate limit on mount (for the reset password request page)
  useEffect(() => {
    const { allowed, remainingMs } = checkRateLimit();
    if (!allowed) {
      setRateLimited(true);
      setRateLimitRemaining(remainingMs);
    }
  }, []);

  useEffect(() => {
    if (rateLimited && rateLimitRemaining > 0) {
      const interval = setInterval(() => {
        const { remainingMs } = checkRateLimit();
        setRateLimitRemaining(remainingMs);
        if (remainingMs <= 0) {
          setRateLimited(false);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [rateLimited, rateLimitRemaining]);

  useEffect(() => {
    const verifyToken = async () => {
      const hash = window.location.hash;
      
      // Check if we have a valid token in the URL hash
      if (!hash || !hash.includes('access_token')) {
        setInvalidLink(true);
        setError('Enlace inválido o expirado. Este enlace es de un solo uso y tiene una validez limitada.');
        return;
      }

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      if (!accessToken || !refreshToken) {
        setInvalidLink(true);
        setError('Token de acceso incompleto. Solicita uno nuevo desde login.');
        return;
      }

      // Verify the token is for password recovery
      if (type !== 'recovery') {
        setInvalidLink(true);
        setError('Este enlace no es para recuperación de contraseña. Solicita uno nuevo desde login.');
        return;
      }

      // Set the session manually to verify the token
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError || !data.session) {
        setInvalidLink(true);
        setError('El enlace ha expirado o es inválido. Solicita uno nuevo desde login.');
        return;
      }

      setVerified(true);
    };

    verifyToken();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Check if new password is same as old (we can't directly check, but Supabase will reject if same)
    // We'll rely on Supabase error handling

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        if (updateError.message.includes('same') || updateError.message.includes('identical') || updateError.message.includes('current')) {
          throw new Error('La nueva contraseña no puede ser igual a la actual. Elige una diferente.');
        }
        throw updateError;
      }

      // Sign out immediately after password change (temporary session ends)
      await supabase.auth.signOut();
      
      setSuccess(true);
      toast('Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.', 'success');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // Warning icon for invalid link
  const WarningIcon = () => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );

  // Format remaining time
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand/15 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="mb-10">
          <SmartImage
            src={CISZU_ISOTYPE}
            alt="Ciszu ID"
            width={72}
            height={72}
            className="w-18 h-18 mx-auto"
          />
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-light to-neon-pink rounded-[2.5rem] blur opacity-20 transition duration-500" />
          <div className="relative bg-[#070710]/95 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-6 backdrop-blur-2xl shadow-2xl">
            {success ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                <p className="text-emerald-400 font-black uppercase tracking-widest text-sm">Contraseña actualizada</p>
                <p className="text-gray-400 text-xs font-bold leading-relaxed">
                  Tu contraseña ha sido restablecida. Serás redirigido al login para acceder con tu nueva contraseña.
                </p>
              </div>
            ) : verified ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center space-y-2">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Nueva contraseña</h3>
                  <p className="text-gray-400 text-[10px] font-bold">Establece una contraseña segura para tu cuenta. No puede ser igual a la anterior.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Nueva Contraseña</label>
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

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Confirmar Contraseña</label>
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

                {error && <p className="text-red-400 text-[11px] font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-light to-neon-pink text-black font-header font-black uppercase tracking-widest text-sm hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(255,51,204,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'PROCESANDO…' : 'RESTABLECER CONTRASEÑA'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto text-amber-400">
                  <WarningIcon />
                </div>
                <p className="text-white font-black uppercase tracking-widest text-sm">Enlace inválido o expirado</p>
                <p className="text-gray-400 text-xs font-bold leading-relaxed">
                  {error || 'Este enlace de recuperación ha expirado o ya fue utilizado.'}
                </p>
                <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  ⚠ Los enlaces de recuperación son de UN SOLO USO y expiran por seguridad.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-light to-neon-pink text-black font-header font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all"
                >
                  VOLVER AL LOGIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rate limit modal */}
      {showRateLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#070710]/98 backdrop-blur-2xl border border-amber-500/50 rounded-2xl p-6 max-w-md mx-4 text-center">
            <div className="w-16 h-16 mx-auto text-amber-400 mb-4">
              <WarningIcon />
            </div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Demasiados intentos</h3>
            <p className="text-gray-400 text-xs font-bold leading-relaxed mb-4">
              Has solicitado recuperación de contraseña demasiadas veces recientemente.
            </p>
            <p className="text-amber-400 text-xs font-bold mb-6">
              Próximo intento disponible en: <span className="text-white font-mono">{formatTime(rateLimitRemaining)}</span>
            </p>
            <p className="text-gray-500 text-[10px] font-bold mb-6">
              Por seguridad, solo se permiten 3 solicitudes cada 12 horas.
            </p>
            <button
              onClick={() => setShowRateLimitModal(false)}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-light to-neon-pink text-black font-header font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}