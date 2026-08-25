'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { assetResolver } from '@ciszunetwork/cdn';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  AuthField,
  AuthSecondaryActions,
  CiszuIdBrand,
  OAuthProviders,
  useToast,
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
const ANTONY_ISOTYPE = assetResolver.resolve('projects/ciszukoantony/content/logos/images/outline/isotype/color/ciszuko_logo_isotipo_outline_zwhite_ccolor.ai.svg');

export default function LoginPage() {
  usePageTitle('LOGIN');
  const user = useAppStore((s) => s.user);
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [forgot, setForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setLocalError(null);
  };

  React.useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

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

      setTimeout(() => router.push('/'), 900);
    } catch (err: any) {
      console.error('[LOGIN ERROR]:', err);
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
      console.error('[FORGOT ERROR]:', err);
      setLocalError(err.message || 'No se pudo enviar el enlace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
        <div className="mb-10">
          <CiszuIdBrand
            ciszuIsotype={
              <Image src={CISZU_ISOTYPE} alt="Ciszu ID" width={40} height={40} className="w-9 h-9" />
            }
            appIsotype={
              <Image src={ANTONY_ISOTYPE} alt="Ciszuko Antony" width={40} height={40} className="w-9 h-9" />
            }
            ciszuHref="https://ciszunetwork.vercel.app"
            appHref="/"
            title="CISZU ID"
            subtitle="Inicia sesión en Ciszuko Antony con CISZU ID"
          />
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink rounded-3xl blur opacity-20 transition duration-500 group-hover:opacity-40" />
          <div className="relative p-7 md:p-8 bg-doc-dark border border-white/10 rounded-3xl shadow-2xl space-y-6 backdrop-blur-3xl">
            {forgot ? (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div className="text-center space-y-2">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Recuperar identidad</h3>
                  <p className="text-gray-400 text-[10px] font-bold">Enviaremos un enlace temporal de un solo uso a tu email. Revisa tu bandeja o spam.</p>
                </div>
                <AuthField
                  label="Email de la cuenta"
                  name="email"
                  icon={<span className="w-full h-full text-neon-blue"><IconMail /></span>}
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
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white font-header font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(61,106,223,0.35)] transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
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
                    icon={<span className="w-full h-full text-neon-blue"><IconMail /></span>}
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
                    icon={<span className="w-full h-full text-neon-blue"><IconLock /></span>}
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

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white font-header font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(61,106,223,0.35)] hover:shadow-[0_0_30px_rgba(255,51,204,0.4)] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? 'VERIFICANDO…' : 'INICIAR SESIÓN'}
                  </motion.button>
                </form>

                <OAuthProviders
                  onSelect={(p) => toast(`OAuth de ${p} disponible en futura versión beta`, 'warning')}
                />

                <AuthSecondaryActions
                  mode="login"
                  onForgotPassword={() => setForgot(true)}
                  registerHref="/register"
                  supportHref="/support"
                />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}