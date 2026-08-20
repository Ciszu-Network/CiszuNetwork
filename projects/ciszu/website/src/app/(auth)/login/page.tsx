'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { assetResolver } from '@ciszunetwork/cdn';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store';
import { syncPreferencesToProfile, loadPreferences } from '@/lib/preferences';

const IconMail = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconGoogle = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

const IconMicrosoft = () => (
  <svg viewBox="0 0 23 23" className="w-4 h-4">
    <path fill="#F35325" d="M1 1h10v10H1z" />
    <path fill="#81BC06" d="M12 1h10v10H12z" />
    <path fill="#05A6F0" d="M1 12h10v10H1z" />
    <path fill="#FFBA08" d="M12 12h10v10H12z" />
  </svg>
);

const InputField = ({ label, name, icon, type = 'text', placeholder, value, onChange }: {
  label: string;
  name: string;
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2 ml-1">
      <span className="w-3 h-3 text-brand-light flex items-center justify-center">{icon}</span>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{label}</label>
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      autoComplete={type === 'password' ? 'current-password' : 'email'}
      className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white font-header font-bold placeholder:text-gray-700 focus:border-brand-light/60 transition-all outline-none [color-scheme:dark]"
    />
  </div>
);

const oauthPlaceholder = (provider: 'Google' | 'Microsoft', showToast: (msg: string) => void) => {
  showToast(`OAuth de ${provider} disponible en futura versión beta`);
};

export default function LoginPage() {
  const { setUser, showToast } = useAppStore();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        throw new Error(error.message === 'Invalid login credentials'
          ? 'Credenciales inválidas. Verifica tu email y contraseña.'
          : error.message);
      }

      // Sincronizar perfil desde ciszunetwork.profiles al store
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      setUser({
        id: data.user.id,
        email: data.user.email ?? '',
        username: profile?.username || data.user.email?.split('@')[0]?.toLowerCase() || 'user',
        display_name: profile?.display_name || data.user.email || 'Usuario',
        avatar_url: profile?.avatar_url ?? undefined,
        role: profile?.role || 'user',
      });

      // Subir preferencias locales al perfil si existen
      const localPrefs = loadPreferences();
      const hasLocal = typeof window !== 'undefined' && window.localStorage.getItem('ciszu_preferences') !== null;
      if (hasLocal) {
        await syncPreferencesToProfile(data.user.id, localPrefs);
      }

      showToast('Bienvenido de nuevo, ' + (profile?.display_name || data.user.email));
      router.push('/');
    } catch (err: any) {
      setLocalError(err.message || 'Error desconocido al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand/15 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src={assetResolver.resolve('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg')}
              alt="Ciszu ID"
              width={64}
              height={64}
              className="drop-shadow-brand"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-brand-light via-brand-accent to-neon-blue bg-clip-text text-transparent uppercase tracking-tighter mb-2">
            Acceso
          </h1>
          <p className="text-brand-light font-black tracking-[0.35em] uppercase text-[10px] md:text-xs">
            CISZU ID · Bienvenido de nuevo
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-light to-neon-pink rounded-[2.5rem] blur opacity-20 transition duration-500" />
          <div className="relative bg-[#070710]/95 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-6 backdrop-blur-2xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Email"
                name="email"
                icon={<IconMail />}
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
              />
              <InputField
                label="Contraseña"
                name="password"
                icon={<IconLock />}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />

              {localError && (
                <p className="text-red-400 text-[11px] font-bold">{localError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-light to-brand-accent text-black font-header font-black uppercase tracking-widest text-sm hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(58,107,240,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'PROCESANDO…' : 'INICIAR SESIÓN'}
              </button>
            </form>

            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                ¿Sin credenciales?{' '}
                <Link href="/register" className="text-neon-cyan hover:text-white transition-colors underline decoration-neon-cyan/20 underline-offset-8">
                  CREAR CUENTA
                </Link>
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-center text-[9px] font-black uppercase tracking-[0.25em] text-white/30 mb-3">
                Opciones adicionales
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => oauthPlaceholder('Google', showToast)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:border-brand-light/50 hover:text-brand-light transition-all active:scale-95 cursor-pointer"
                >
                  <IconGoogle /> Google
                </button>
                <button
                  type="button"
                  onClick={() => oauthPlaceholder('Microsoft', showToast)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:border-brand-light/50 hover:text-brand-light transition-all active:scale-95 cursor-pointer"
                >
                  <IconMicrosoft /> Microsoft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}