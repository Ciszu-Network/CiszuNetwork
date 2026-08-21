'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assetResolver } from '@ciszunetwork/cdn';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store';
import { syncPreferencesToProfile, loadPreferences } from '@/lib/preferences';
import {
  AuthField,
  AuthSecondaryActions,
  CiszuIdBrand,
  OAuthProviders,
  SmartImage,
} from '@ciszu/ui';

const IconMail = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CISZU_ISOTYPE = assetResolver.resolve('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg');

export default function LoginPage() {
  const { setUser, showToast } = useAppStore();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [forgot, setForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setLocalError(null);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.email.trim()) next.email = 'Este campo es obligatorio';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Formato de email inválido (requiere @)';
    if (!form.password) next.password = 'La contraseña es obligatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!validate()) return;
    setLoading(true);
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

      const hasLocal = typeof window !== 'undefined' && window.localStorage.getItem('ciszu_preferences') !== null;
      if (hasLocal) {
        await syncPreferencesToProfile(data.user.id, loadPreferences());
      }

      showToast('Bienvenido de nuevo, ' + (profile?.display_name || data.user.email));
      router.push('/');
    } catch (err: any) {
      setLocalError(err.message || 'Error desconocido al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!forgotEmail.trim() || !/^\S+@\S+\.\S+$/.test(forgotEmail.trim())) {
      setErrors(prev => ({ ...prev, email: 'Introduce un email válido' }));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim());
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setLocalError(err.message || 'No se pudo enviar el enlace');
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
        <div className="mb-10">
          <CiszuIdBrand
            solo
            soloSize="w-24 h-24"
            ciszuIsotype={
              <SmartImage src={CISZU_ISOTYPE} alt="Ciszu ID" width={72} height={72} className="w-full h-full" />
            }
            appIsotype={
              <SmartImage src={CISZU_ISOTYPE} alt="Ciszu Network" width={72} height={72} className="w-full h-full" />
            }
            ciszuHref="https://ciszunetwork.vercel.app"
            appHref="/"
            title="CISZU ID"
            subtitle="Inicia sesión en Ciszu Network con CISZU ID"
          />
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-light to-neon-pink rounded-[2.5rem] blur opacity-20 transition duration-500" />
          <div className="relative bg-[#070710]/95 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-6 backdrop-blur-2xl shadow-2xl">
            {forgot ? (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div className="text-center space-y-2">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Recuperar identidad</h3>
                  <p className="text-gray-400 text-[10px] font-bold">Enviaremos un enlace temporal de un solo uso a tu email. Revisa tu bandeja o spam.</p>
                </div>
                <AuthField
                  label="Email de la cuenta"
                  name="email"
                  icon={<span className="w-full h-full text-brand-light"><IconMail /></span>}
                  type="email"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  value={forgotEmail}
                  onChange={(e) => { setForgotEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                  error={errors.email}
                  requirements={['Formato de email válido (p. ej. nombre@dominio.com)', 'Debe ser la cuenta CISZU ID registrada']}
                />
                {localError && <p className="text-red-400 text-[11px] font-bold">{localError}</p>}
                {sent ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                    <p className="text-emerald-400 text-xs font-bold">Enlace enviado</p>
                    <p className="text-gray-400 text-[10px] font-bold mt-1">Revisa tu bandeja de entrada o spam. El enlace es de un solo uso.</p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-light to-brand-accent text-black font-header font-black uppercase tracking-widest text-sm hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(58,107,240,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'ENVIANDO…' : 'ENVIAR ENLACE'}
                  </button>
                )}
                <button type="button" onClick={() => { setForgot(false); setSent(false); setLocalError(null); }}
                  className="w-full text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-all cursor-pointer">
                  ← Volver al acceso normal
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <AuthField
                    label="Email"
                    name="email"
                    icon={<span className="w-full h-full text-brand-light"><IconMail /></span>}
                    type="email"
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    requirements={['Formato de email válido (p. ej. nombre@dominio.com)']}
                  />
                  <AuthField
                    label="Contraseña"
                    name="password"
                    icon={<span className="w-full h-full text-brand-light"><IconLock /></span>}
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    requirements={['Mínimo 8 caracteres', 'Al menos 1 mayúscula', 'Al menos 1 minúscula', 'Al menos 1 número y 1 símbolo']}
                  />

                  {localError && <p className="text-red-400 text-[11px] font-bold">{localError}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-light to-brand-accent text-black font-header font-black uppercase tracking-widest text-sm hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(58,107,240,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'PROCESANDO…' : 'INICIAR SESIÓN'}
                  </button>
                </form>

                <OAuthProviders
                  onSelect={(p) => showToast(`OAuth de ${p} disponible en futura versión beta`)}
                />

                <AuthSecondaryActions
                  mode="login"
                  onForgotPassword={() => setForgot(true)}
                  registerHref="/register"
                  supportHref="/support"
                  linkClass="text-gray-300 hover:text-white transition-colors underline decoration-white/20 underline-offset-8"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}