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
  PasswordStrengthBar,
  evaluatePassword,
  passwordMeetsMinimum,
  useToast,
  AuthBenefitsPanel,
  useActivityGuard,
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

const IconUser = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconCloud = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z" />
  </svg>
);

const IconGift = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
  </svg>
);

const IconKey = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M10.7 12.3L21 2" />
    <path d="M17 6l3 3" />
  </svg>
);

const REGISTER_BENEFITS = [
  {
    icon: <span className="w-full h-full text-neon-blue"><IconShield /></span>,
    title: 'Menos anuncios',
    description: 'Al registrarte quitamos los anuncios de footer y reducimos la frecuencia del resto. Menos publicidad, mejor experiencia.',
  },
  {
    icon: <span className="w-full h-full text-neon-cyan"><IconCloud /></span>,
    title: 'Guarda tus datos',
    description: 'Tu progreso, preferencias y configuración se guardan en la nube y se sincronizan en todos tus dispositivos.',
  },
  {
    icon: <span className="w-full h-full text-neon-pink"><IconGift /></span>,
    title: 'Recompensas y VIP futuro',
    description: 'Acceso a recompensas y, próximamente, a un rango VIP que quita los anuncios por completo.',
  },
  {
    icon: <span className="w-full h-full text-neon-blue"><IconKey /></span>,
    title: 'Un solo CISZU ID',
    description: 'Una cuenta para todas las webs del ecosistema: Ciszu Network, CiszukoAntony, MuzicMania y CiszuBot.',
  },
];

const REGISTER_FOOTER = 'Crear tu cuenta es gratis. Usamos tus datos para personalizar anuncios y darte menos publicidad — consulta nuestras políticas en Ciszu Network.';

const CISZU_ISOTYPE = assetResolver.resolve('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg');
const ANTONY_ISOTYPE = assetResolver.resolve('projects/ciszukoantony/content/logos/images/outline/isotype/color/ciszuko_logo_isotipo_outline_zwhite_ccolor.ai.svg');

export default function RegisterPage() {
  usePageTitle('REGISTER');
  const user = useAppStore((s) => s.user);
  const router = useRouter();
  const { begin: beginActivity, end: endActivity } = useActivityGuard();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });

  // Guard de acciones no recuperables: registro con contenido → no navegar sin aviso.
  React.useEffect(() => {
    const hasInput = Object.values(form).some((v) => String(v).trim().length > 0);
    if (hasInput) beginActivity('auth-form');
    else endActivity('auth-form');
  }, [form, beginActivity, endActivity]);
  React.useEffect(() => {
    return () => endActivity('auth-form');
     
  }, []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const renderTurnstile = () => {
    if (typeof window === 'undefined' || !window.turnstile) return null;
    const container = document.getElementById('turnstile-register');
    if (!container) return;
    window.turnstile.render(container, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
      theme: 'dark',
      callback: (token: string) => setCaptchaToken(token),
      'expired-callback': () => setCaptchaToken(null),
    });
  };

  useEffect(() => {
    const timer = setTimeout(renderTurnstile, 100);
    return () => clearTimeout(timer);
  }, []);

  const validate = (name: string, value: string) => {
    let error = '';
    if (name === 'username') {
      if (!value) error = 'El usuario es obligatorio';
      else if (value.includes(' ')) error = 'No se permiten espacios';
      else if (value.length < 3) error = 'Mínimo 3 caracteres';
      else if (value.length > 20) error = 'Máximo 20 caracteres';
    }
    if (name === 'email' && !/^\S+@\S+\.\S+$/.test(value)) error = 'Formato de email inválido';
    if (name === 'password' && value.length > 0 && !passwordMeetsMinimum(value)) error = 'La contraseña no alcanza el nivel mínimo (Media)';
    if (name === 'confirm' && value !== form.password) error = 'Las contraseñas no coinciden';
    if (name === 'terms' && !acceptedTerms) error = 'Debes aceptar los términos y condiciones';
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
    if (!acceptedTerms) errs.terms = 'Debes aceptar los términos y condiciones';
    if (!captchaToken) errs.captcha = 'Debes completar el CAPTCHA';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setLocalError(null);
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

      setCreated(true);
    } catch (err: any) {
      console.error('[REGISTER ERROR]:', err);
      setLocalError(err.message || 'Error desconocido al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 relative overflow-hidden flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <div className="text-center mb-8">
            <CiszuIdBrand
              ciszuIsotype={<Image src={CISZU_ISOTYPE} alt="Ciszu ID" width={40} height={40} className="w-9 h-9" />}
              appIsotype={<Image src={ANTONY_ISOTYPE} alt="Ciszuko Antony" width={40} height={40} className="w-9 h-9" />}
              ciszuHref="https://ciszunetwork.vercel.app"
              appHref="/"
              title="CUENTA CREADA"
              subtitle="Ciszuko Antony · CISZU ID"
            />
          </div>
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center shadow-2xl">
            <p className="text-emerald-400 font-header font-black uppercase tracking-widest text-sm mb-2">
              Revisa tu email
            </p>
            <p className="text-gray-400 text-xs font-bold leading-relaxed">
              Enviamos un enlace de verificación a <span className="text-white">{form.email}</span>.
              Confirma tu correo y vuelve a iniciar sesión con tu nueva cuenta CISZU ID.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white font-header font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(61,106,223,0.35)] hover:shadow-[0_0_30px_rgba(255,51,204,0.4)] transition-all active:scale-95 cursor-pointer"
            >
              IR A INICIAR SESIÓN
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (    <div className="min-h-screen pt-28 pb-20 px-4 relative overflow-hidden">
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
          subtitle="Crea tu cuenta en Ciszuko Antony con CISZU ID"
        />
      </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-start">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink via-[#6600ff] to-neon-blue rounded-3xl blur opacity-20 transition duration-500 group-hover:opacity-40" />
          <div className="relative p-7 md:p-8 bg-doc-dark border border-white/10 rounded-3xl shadow-2xl space-y-6 backdrop-blur-3xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthField
                label="Nombre de usuario"
                name="username"
                icon={<span className="w-full h-full text-neon-blue"><IconUser /></span>}
                placeholder="ej: ciszuko"
                required
                autoComplete="username"
                maxLength={20}
                value={form.username}
                onChange={handleChange}
                error={errors.username}
                requirements={['Mínimo 3 caracteres', 'Máximo 20 caracteres', 'Sin espacios']}
              />
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
                autoComplete="new-password"
                allowPaste={false}
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                requirements={['Mínimo 8 caracteres', 'Mínimo 12 caracteres', 'Al menos 1 mayúscula', 'Al menos 1 minúscula', 'Al menos 1 número y 1 símbolo']}
              />
              <PasswordStrengthBar password={form.password} />
              <AuthField
                label="Confirmar contraseña"
                name="confirm"
                icon={<span className="w-full h-full text-neon-blue"><IconLock /></span>}
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                allowPaste={false}
                value={form.confirm}
                onChange={handleChange}
                error={errors.confirm}
              />

              {localError && <p className="text-red-400 text-[11px] font-bold">{localError}</p>}

              <div className="flex items-start gap-3">
                <div className="relative flex items-center justify-center shrink-0 w-5 h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer appearance-none w-full h-full border-2 border-white/20 rounded bg-black/50 checked:bg-neon-blue checked:border-neon-blue transition-all"
                  />
                  <svg viewBox="0 0 24 24" className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                  Acepto los <a href="/terms" className="text-neon-cyan hover:underline">Términos de Servicio</a> y la <a href="/policies" className="text-neon-cyan hover:underline">Política de Privacidad</a>.
                </p>
              </div>
              {(errors.terms || errors.captcha) && (
                <p className="text-red-400 text-[11px] font-bold">{errors.terms || errors.captcha}</p>
              )}

              <div className="flex flex-col items-center gap-2">
                <div id="turnstile-register" className="flex justify-center" />
                {!captchaToken && <span className="text-gray-500 text-[10px] font-bold">Completa el CAPTCHA</span>}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-pink via-[#6600ff] to-neon-blue text-white font-header font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,51,204,0.3)] hover:shadow-[0_0_30px_rgba(61,106,223,0.4)] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'CREANDO CUENTA…' : 'REGISTRARME'}
              </motion.button>
            </form>

            <OAuthProviders
              onSelect={(p) => toast(`OAuth de ${p} disponible en futura versión beta`, 'warning')}
            />

            <AuthSecondaryActions
              mode="register"
              loginHref="/login"
              supportHref="/support"
            />
          </div>
        </div>

        {/* Lomo central del libro (solo escritorio) */}
        <div className="relative hidden lg:block self-stretch">
          <div className="absolute inset-y-2 left-0 w-px bg-gradient-to-b from-neon-pink/50 via-white/10 to-neon-blue/50" />
          <div className="absolute inset-y-2 -left-1.5 w-3 rounded-full opacity-50 bg-gradient-to-b from-neon-pink to-neon-blue blur-[1px]" />
        </div>

        {/* Página derecha: beneficios */}
        <AuthBenefitsPanel
          badge="CISZU ID"
          title="¿Por qué crear tu cuenta?"
          items={REGISTER_BENEFITS}
          footerNote={REGISTER_FOOTER}
          accent="#ff33cc"
          accentAlt="#3b6ee2"
        />
      </motion.div>
    </div>
  );
}