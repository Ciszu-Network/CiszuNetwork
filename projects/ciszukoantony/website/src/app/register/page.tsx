'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { usePageTitle } from '@/lib/usePageTitle';
import { supabase } from '@/config/supabase';

const I = {
  mail: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  lock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  user: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  register: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>,
  google: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12s4.39 10 10.1 10c5.91 0 9.02-4.16 9.02-10 0-1.04-.15-1.8-.8-2.9z" /></svg>,
  microsoft: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <rect x="1" y="1" width="10.5" height="10.5" fill="#f25022" />
      <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7fba00" />
      <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00a4ef" />
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#ffb900" />
    </svg>
  ),
};

function InputField({ label, name, type = 'text', placeholder, required = false, value, error, onChange }: any) {
  return (
    <div className="space-y-1.5 relative">
      <div className="flex items-center justify-between ml-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {name === 'password' && value && (
          <span className={`text-[9px] font-bold ${value.length < 8 ? 'text-red-400' : 'text-neon-green'}`}>
            {value.length < 8 ? `${value.length}/8 mín` : 'OK'}
          </span>
        )}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-black/60 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-5 py-3.5 text-white font-header font-bold placeholder:text-gray-700 focus:border-neon-pink/60 focus:shadow-[0_0_15px_rgba(255,51,204,0.15)] transition-all outline-none [color-scheme:dark]`}
      />
      {error && <p className="text-red-400 text-[10px] font-bold mt-1 ml-2">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  usePageTitle('REGISTER');
  const user = useAppStore((s) => s.user);
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [betaToast, setBetaToast] = useState<string | null>(null);

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  useEffect(() => {
    if (betaToast) {
      const t = setTimeout(() => setBetaToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [betaToast]);

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const validate = (name: string, value: string) => {
    let error = '';
    if (name === 'username') {
      if (!value) error = 'El usuario es obligatorio';
      else if (value.includes(' ')) error = 'No se permiten espacios';
      else if (value.length < 3) error = 'Mínimo 3 caracteres';
      else if (value.length > 20) error = 'Máximo 20 caracteres';
    }
    if (name === 'email' && !/^\S+@\S+\.\S+$/.test(value)) error = 'Formato de email inválido';
    if (name === 'password' && value.length > 0 && value.length < 8) error = 'Mínimo 8 caracteres';
    if (name === 'confirm' && value !== form.password) error = 'Las contraseñas no coinciden';
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
    if (name === 'password' && form.confirm) validate('confirm', form.confirm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    Object.keys(form).forEach((k) => {
      const err = validate(k, form[k as keyof typeof form]);
      if (err) errs[k] = err;
    });
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setFeedback(null);
    try {
      const username = form.username.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      });
      if (error) throw error;

      if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
        throw new Error('Este email ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.');
      }

      setFeedback({
        type: 'success',
        message: data.session
          ? 'Cuenta creada e identidad confirmada. Acceso concedido.'
          : 'Cuenta creada. Revisa tu email para confirmar el registro.',
      });
      setTimeout(() => router.push('/login'), data.session ? 900 : 2500);
    } catch (err: any) {
      console.error('[REGISTER ERROR]:', err);
      setFeedback({ type: 'error', message: err.message || 'Error desconocido al registrarse.' });
    } finally {
      setLoading(false);
    }
  };

  const oauthBeta = (provider: string) => {
    setBetaToast(`OAuth de ${provider} disponible en futura versión beta`);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 mx-auto mb-4 text-neon-pink drop-shadow-[0_0_15px_rgba(255,51,204,0.5)]"
          >
            {I.register}
          </motion.div>
          <h1 className="text-4xl font-header font-black uppercase tracking-tight bg-gradient-to-r from-neon-pink via-[#6600ff] to-neon-blue bg-clip-text text-transparent">
            CREAR CISZU ID
          </h1>
          <p className="text-gray-500 font-header font-bold uppercase tracking-[0.4em] text-[10px] mt-2">
            Únete al ecosistema de Ciszuko Antony
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink via-[#6600ff] to-neon-blue rounded-3xl blur opacity-20 transition duration-500 group-hover:opacity-40" />
          <div className="relative p-7 md:p-8 bg-doc-dark border border-white/10 rounded-3xl shadow-2xl space-y-6 backdrop-blur-3xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField label="Nombre de usuario" name="username" placeholder="ej: ciszuko" required value={form.username} error={errors.username} onChange={handleChange} />
              <InputField label="Email" name="email" type="email" placeholder="tu@email.com" required value={form.email} error={errors.email} onChange={handleChange} />
              <InputField label="Contraseña" name="password" type="password" placeholder="••••••••" required value={form.password} error={errors.password} onChange={handleChange} />
              <InputField label="Confirmar contraseña" name="confirm" type="password" placeholder="••••••••" required value={form.confirm} error={errors.confirm} onChange={handleChange} />

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold ${
                    feedback.type === 'success'
                      ? 'border-neon-green/40 bg-neon-green/10 text-neon-green'
                      : 'border-red-500/40 bg-red-500/10 text-red-400'
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-pink via-[#6600ff] to-neon-blue text-white font-header font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,51,204,0.3)] hover:shadow-[0_0_30px_rgba(61,106,223,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'CREANDO CUENTA...' : 'REGISTRARME'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">o regístrate con</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => oauthBeta('Google')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-header font-bold text-xs transition-all active:scale-95"
              >
                {I.google} Google
              </button>
              <button
                onClick={() => oauthBeta('Microsoft')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-header font-bold text-xs transition-all active:scale-95"
              >
                {I.microsoft} Microsoft
              </button>
            </div>

            <div className="pt-2 border-t border-white/5 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-neon-pink hover:text-white transition-colors underline decoration-neon-pink/20 underline-offset-8">
                  INICIAR SESIÓN
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {betaToast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in-up">
          <div className="px-5 py-3 rounded-xl bg-brand/20 border border-brand/30 backdrop-blur-xl text-sm text-white shadow-lg shadow-brand/10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
            {betaToast}
          </div>
        </div>
      )}
    </div>
  );
}