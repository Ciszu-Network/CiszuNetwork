'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/config/supabase';
import { usePageTitle } from '@/lib/usePageTitle';
import { resolveAssetPath } from '@ciszunetwork/cdn';

export default function ResetPasswordPage() {
  usePageTitle('RESET_PASSWORD');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const hash = window.location.hash;
      if (!hash || !hash.includes('access_token')) {
        setError('Enlace inválido o expirado. Solicita uno nuevo desde login.');
        return;
      }

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (!accessToken) {
        setError('Token de acceso no encontrado. Solicita uno nuevo desde login.');
        return;
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        token: accessToken,
        type: 'recovery',
      });

      if (verifyError) {
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

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-neon-purple/10 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="mb-10 text-center">
          <img src={resolveAssetPath('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg')} alt="Ciszu ID" width={72} height={72} className="w-18 h-18 mx-auto" />
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-neon-pink rounded-[2.5rem] blur opacity-20 transition duration-500" />
          <div className="relative bg-[#070710]/95 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-6 backdrop-blur-2xl shadow-2xl">
            {success ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                <p className="text-emerald-400 font-black uppercase tracking-widest text-sm">Contraseña actualizada</p>
                <p className="text-gray-400 text-xs font-bold leading-relaxed">
                  Tu contraseña ha sido restablecida. Serás redirigido al login para acceder.
                </p>
              </div>
            ) : verified ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center space-y-2">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Nueva contraseña</h3>
                  <p className="text-gray-400 text-[10px] font-bold">Establece una contraseña segura para tu cuenta.</p>
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
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-header font-black uppercase tracking-widest text-sm hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(255,51,204,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'PROCESANDO…' : 'RESTABLECER CONTRASEÑA'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto text-red-400">
                  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <p className="text-white font-black uppercase tracking-widest text-sm">Enlace inválido</p>
                <p className="text-gray-400 text-xs font-bold leading-relaxed">
                  {error || 'El enlace de recuperación ha expirado o es inválido.'}
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-header font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all"
                >
                  VOLVER AL LOGIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
