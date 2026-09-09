'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/config/supabase';
import { usePageTitle } from '@/lib/usePageTitle';
import Image from 'next/image';
import { assetResolver } from '@ciszunetwork/cdn';
import { useToast } from '@ciszu/ui';

const CISZU_ISOTYPE = assetResolver.resolve('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg');
const ANTONY_ISOTYPE = assetResolver.resolve('projects/ciszukoantony/content/logos/images/outline/isotype/color/ciszuko_logo_isotipo_outline_zwhite_ccolor.ai.svg');

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
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verified, setVerified] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const hash = window.location.hash;
      
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

      if (type !== 'recovery') {
        setInvalidLink(true);
        setError('Este enlace no es para recuperación de contraseña. Solicita uno nuevo desde login.');
        return;
      }

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

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative overflow-hidden">
      <div className="mb-10">
        <Image src={CISZU_ISOTYPE} alt="Ciszu ID" width={40} height={40} className="w-9 h-9" />
        <Image src={ANTONY_ISOTYPE} alt="Ciszuko Antony" width={40} height={40} className="w-9 h-9" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink rounded-3xl blur opacity-20 transition duration-500 group-hover:opacity-40" />
          <div className="relative p-7 md:p-8 bg-doc-dark border border-white/10 rounded-3xl shadow-2xl space-y-6 backdrop-blur-3xl">
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

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-pink via-[#6600ff] to-neon-blue text-white font-header font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,51,204,0.3)] hover:shadow-[0_0_30px_rgba(61,106,223,0.4)] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? 'PROCESANDO…' : 'RESTABLECER CONTRASEÑA'}
                </motion.button>
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
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-neon-pink via-[#6600ff] to-neon-blue text-white font-header font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all"
                >
                  VOLVER AL LOGIN
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}