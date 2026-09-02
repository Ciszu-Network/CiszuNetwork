'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assetResolver } from '@ciszunetwork/cdn';
import { supabase } from '@/config/supabase';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  AuthBenefitsPanel,
  AuthField,
  AuthSecondaryActions,
  CiszuIdBrand,
  OAuthProviders,
  PasswordStrengthBar,
  passwordMeetsMinimum,
  SmartImage,
  useToast,
} from '@ciszu/ui';

const IconUser = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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
    icon: <span className="w-full h-full text-neon-pink"><IconShield /></span>,
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
    icon: <span className="w-full h-full text-neon-cyan"><IconKey /></span>,
    title: 'Un solo CISZU ID',
    description: 'Una cuenta para todas las webs del ecosistema: Ciszu Network, CiszukoAntony, MuzicMania y CiszuBot.',
  },
];

const REGISTER_FOOTER = 'Crear tu cuenta es gratis. Usamos tus datos para personalizar anuncios y darte menos publicidad — consulta nuestras políticas en Ciszu Network.';

const CISZU_ISOTYPE = assetResolver.resolve('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg');

export default function RegisterPage() {
  usePageTitle('REGISTER');
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setLocalError(null);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const u = form.username.trim();
    if (!u) next.username = 'Este campo es obligatorio';
    else if (u.includes(' ')) next.username = 'No se permiten espacios';
    else if (u.length < 3) next.username = 'Mínimo 3 caracteres';
    else if (u.length > 20) next.username = 'Máximo 20 caracteres';

    if (!form.displayName.trim()) next.displayName = 'Este campo es obligatorio';
    else if (form.displayName.trim().length > 30) next.displayName = 'Máximo 30 caracteres';

    if (!form.email.trim()) next.email = 'Este campo es obligatorio';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Formato de email inválido (requiere @)';

    if (!form.password) next.password = 'La contraseña es obligatoria';
    else if (!passwordMeetsMinimum(form.password))
      next.password = 'La contraseña no cumple el nivel mínimo de seguridad CISZU ID (al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo)';

    if (!form.confirmPassword) next.confirmPassword = 'Este campo es obligatorio';
    else if (form.confirmPassword !== form.password) next.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            username: form.username.trim().toLowerCase(),
            display_name: form.displayName.trim() || form.username.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          throw new Error('Este email ya está registrado. ¿Olvidaste tu contraseña? Ve a login y pulsa RECUPÉRALA.');
        }
        throw new Error(error.message);
      }

      if (data.user) {
        setEmailSent(true);
        toast('Cuenta creada. Revisa tu email para confirmarla.', 'success');
        router.push('/login');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Error desconocido al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-neon-pink/10 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-4">
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
            subtitle="Crea tu cuenta en Ciszu Network con CISZU ID"
          />
        </div>

        {/* Libro de 2 caras: formulario (izquierda) + beneficios (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-brand-light rounded-[2.5rem] blur opacity-20 transition duration-500" />
            <div className="relative bg-[#070710]/95 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-6 backdrop-blur-2xl shadow-2xl">
            {emailSent ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                <p className="text-emerald-400 font-black uppercase tracking-widest text-sm">Verifica tu correo</p>
                <p className="text-gray-400 text-xs font-bold leading-relaxed">
                  Te hemos enviado un email de confirmación. Puedes seguir usando Ciszu Network y
                  completar la verificación cuando quieras desde la configuración de tu cuenta.
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AuthField
                      label="Nombre de Usuario"
                      name="username"
                      icon={<span className="w-full h-full text-neon-pink"><IconUser /></span>}
                      placeholder="tunickname"
                      required
                      maxLength={20}
                      autoComplete="username"
                      value={form.username}
                      onChange={handleChange}
                      error={errors.username}
                      requirements={['3–20 caracteres', 'Sin espacios', 'Sin símbolos especiales']}
                    />
                    <AuthField
                      label="Nombre a Mostrar"
                      name="displayName"
                      icon={<span className="w-full h-full text-neon-pink"><IconUser /></span>}
                      placeholder="Tu nombre"
                      required
                      maxLength={30}
                      value={form.displayName}
                      onChange={handleChange}
                      error={errors.displayName}
                      requirements={['3–30 caracteres', 'Nombre visible para los demás']}
                    />
                  </div>

                  <AuthField
                    label="Dirección Email"
                    name="email"
                    icon={<span className="w-full h-full text-neon-pink"><IconMail /></span>}
                    type="email"
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    requirements={['Formato de email válido (p. ej. nombre@dominio.com)']}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <AuthField
                        label="Contraseña"
                        name="password"
                        icon={<span className="w-full h-full text-neon-pink"><IconLock /></span>}
                        type="password"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                        requirements={['Mínimo 8 caracteres', 'Al menos 1 mayúscula', 'Al menos 1 minúscula', 'Al menos 1 número y 1 símbolo', 'Nivel mínimo: Media (3/5 en la barra)']}
                      />
                      <PasswordStrengthBar password={form.password} />
                    </div>
                    <AuthField
                      label="Confirmar Contraseña"
                      name="confirmPassword"
                      icon={<span className="w-full h-full text-neon-pink"><IconLock /></span>}
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      requirements={['Debe ser idéntica al campo "Contraseña"']}
                    />
                  </div>

                  {localError && <p className="text-red-400 text-[11px] font-bold">{localError}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-pink to-brand-accent text-black font-header font-black uppercase tracking-widest text-sm hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(255,51,204,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'PROCESANDO…' : 'CREAR CUENTA'}
                  </button>
                </form>

                <OAuthProviders
                  onSelect={(p) => toast(`OAuth de ${p} disponible en futura versión beta`, 'warning')}
                />

                <div className="pt-3">
                  <p className="text-center text-[9px] text-white/30 font-bold uppercase tracking-[0.25em]">
                    ¿Sin cuenta en Ciszu Network?
                  </p>
                  <p className="text-center text-[10px] text-gray-500 font-bold mt-1">
                    Crea tu cuenta y úsala en todas nuestras apps con un solo{' '}
                    <a href="https://ciszunetwork.vercel.app/register" className="text-neon-cyan hover:underline">CISZU ID</a>.
                  </p>
                </div>

                <AuthSecondaryActions
                  mode="register"
                  loginHref="/login"
                  supportHref="/support"
                  linkClass="text-gray-300 hover:text-white transition-colors underline decoration-white/20 underline-offset-8"
                />
              </>
            )}
          </div>
          </div>

          {/* Lomo central del libro (solo escritorio) */}
          <div className="relative hidden lg:block self-stretch">
            <div className="absolute inset-y-2 left-0 w-px bg-gradient-to-b from-neon-pink/50 via-white/10 to-brand-light/50" />
            <div className="absolute inset-y-2 -left-1.5 w-3 rounded-full opacity-50 bg-gradient-to-b from-neon-pink to-brand-light blur-[1px]" />
          </div>

          {/* Página derecha: beneficios */}
          <AuthBenefitsPanel
            badge="CISZU ID"
            title="¿Por qué crear tu cuenta?"
            items={REGISTER_BENEFITS}
            footerNote={REGISTER_FOOTER}
            accent="#ff33cc"
            accentAlt="#3a6bf0"
          />
        </div>
      </div>
    </div>
  );
}