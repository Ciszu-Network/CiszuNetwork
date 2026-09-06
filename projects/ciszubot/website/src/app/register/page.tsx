'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SmartImage } from '@ciszu/ui';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  AuthField,
  AuthSecondaryActions,
  AuthBenefitsPanel,
  CiszuIdBrand,
  OAuthProviders,
  PasswordStrengthBar,
  evaluatePassword,
  passwordMeetsMinimum,
  useToast,
  useActivityGuard,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';

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

const IconUser = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconBadge = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const CISZU_ISOTYPE = 'projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg';
const BOT_ISOTYPE = 'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png';

export default function RegisterPage() {
  usePageTitle('REGISTER');
  const router = useRouter();
  const { user } = useAppStore();
  const { begin: beginActivity, end: endActivity } = useActivityGuard();
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  // Guard de acciones no recuperables: registro con contenido → no navegar sin aviso.
  useEffect(() => {
    const hasInput = Object.values(form).some((v) => String(v).trim().length > 0);
    if (hasInput) beginActivity('auth-form');
    else endActivity('auth-form');
  }, [form, beginActivity, endActivity]);
  useEffect(() => {
    return () => endActivity('auth-form');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) router.replace('/dashboard');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) setError(null);
    if (name === 'password' && form.confirm_password) {
      setErrors((prev) => ({ ...prev, confirm_password: form.confirm_password !== value ? 'Las contraseñas no coinciden' : '' }));
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.username.trim().length < 3 || form.username.trim().length > 20) next.username = 'El usuario debe tener entre 3 y 20 caracteres.';
    else if (/\s/.test(form.username)) next.username = 'El usuario no puede contener espacios.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Introduce un email válido.';
    if (form.password.length < 8) next.password = 'La contraseña debe tener al menos 8 caracteres.';
    else if (!passwordMeetsMinimum(form.password)) next.password = 'La contraseña no alcanza el nivel mínimo (Media).';
    if (form.password !== form.confirm_password) next.confirm_password = 'Las contraseñas no coinciden.';
    if (!acceptedTerms) next.terms = 'Debes aceptar los términos y condiciones.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!captchaToken) {
      setError('Debes completar el CAPTCHA');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo('Creando tu cuenta...');
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username.trim().toLowerCase(),
            display_name: form.display_name.trim() || form.username.trim(),
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered')) {
          throw new Error('Este email ya está registrado. Inicia sesión o usa "Recuperar clave".');
        }
        throw signUpError;
      }

      if (data.session) {
        router.replace('/dashboard');
        return;
      }

      setInfo('Cuenta creada. Ya puedes iniciar sesión con CISZU ID.');
      setTimeout(() => router.replace('/login'), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la cuenta. Intenta de nuevo.');
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg min-h-[calc(100vh-60px)] relative overflow-hidden pb-24">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-neon-purple/10 blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#5865F2]/10 blur-[140px] pointer-events-none" />

      <div className="pt-14 mb-10 px-4">
        <CiszuIdBrand
          ciszuIsotype={<SmartImage src={CISZU_ISOTYPE} alt="Ciszu ID" width={40} height={40} className="w-9 h-9" />}
          appIsotype={<SmartImage src={BOT_ISOTYPE} alt="CiszuBot" width={40} height={40} className="w-9 h-9 rounded-full" />}
          ciszuHref="https://ciszunetwork.vercel.app"
          appHref="/"
          title="CISZU ID"
          subtitle="Crea tu cuenta en CiszuBot con CISZU ID"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-start">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-[#5865F2] rounded-[2rem] blur opacity-20 transition duration-500" />
          <div className="relative p-6 md:p-8 bg-surface border border-border rounded-[2rem] shadow-2xl space-y-6 backdrop-blur-3xl">
            <OAuthProviders
              showDiscord
              renderDiscord={() => (
                <a
                  href="/api/auth/discord"
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#5865F2] text-white font-header font-bold text-sm hover:bg-[#4752c4] hover:-translate-y-0.5 transition-all shadow-[0_8px_22px_-8px_rgba(88,101,242,0.7)] active:scale-95"
                >
                  <span className="w-5 h-5">
                    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                    </svg>
                  </span>
                  Registrarse con Discord
                </a>
              )}
              onSelect={(p) => toast(`${p} estará disponible en la beta soon. Usa Discord o CISZU ID por ahora.`, 'warning')}
            />

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[9px] font-black uppercase tracking-widest text-faint">o crea un CISZU ID</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthField
                label="Usuario"
                name="username"
                icon={<span className="w-full h-full text-neon-purple"><IconUser /></span>}
                type="text"
                placeholder="El nombre de tu cuenta"
                autoComplete="username"
                required
                maxLength={20}
                value={form.username}
                onChange={handleChange}
                error={errors.username}
                requirements={['Mínimo 3 caracteres', 'Máximo 20 caracteres', 'Sin espacios']}
              />
              <AuthField
                label="Nombre a mostrar"
                name="display_name"
                icon={<span className="w-full h-full text-neon-purple"><IconBadge /></span>}
                type="text"
                placeholder="Cómo te verán los demás"
                isOptional
                value={form.display_name}
                onChange={handleChange}
              />
              <AuthField
                label="Email"
                name="email"
                icon={<span className="w-full h-full text-neon-purple"><IconMail /></span>}
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                requirements={['Formato de email válido (p. ej. nombre@dominio.com)']}
              />
              <AuthField
                label="Contraseña"
                name="password"
                icon={<span className="w-full h-full text-neon-purple"><IconLock /></span>}
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
                allowPaste={false}
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                requirements={['Mínimo 8 caracteres', 'Mínimo 12 caracteres', 'Al menos 1 mayúscula', 'Al menos 1 minúscula', 'Al menos 1 número y 1 símbolo']}
              />
              <PasswordStrengthBar password={form.password} />
              <AuthField
                label="Repetir contraseña"
                name="confirm_password"
                icon={<span className="w-full h-full text-neon-purple"><IconLock /></span>}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                allowPaste={false}
                value={form.confirm_password}
                onChange={handleChange}
                error={errors.confirm_password}
              />

              {error && <p className="text-red-400 text-[11px] font-bold px-1">{error}</p>}
              {info && <p className="text-emerald-400 text-[11px] font-bold px-1">{info}</p>}

              <div className="flex items-start gap-3">
                <div className="relative flex items-center justify-center shrink-0 w-5 h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer appearance-none w-full h-full border-2 border-white/20 rounded bg-black/50 checked:bg-neon-purple checked:border-neon-purple transition-all"
                  />
                  <svg viewBox="0 0 24 24" className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                  Acepto los <a href="/terminos" className="text-neon-blue hover:underline">Términos de Servicio</a> y la <a href="/privacidad" className="text-neon-blue hover:underline">Política de Privacidad</a>.
                </p>
              </div>
              {errors.terms && <p className="text-red-400 text-[11px] font-bold px-1">{errors.terms}</p>}

              <div className="flex flex-col items-center gap-2">
                <div id="turnstile-register" className="flex justify-center" />
                {!captchaToken && <span className="text-gray-500 text-[10px] font-bold">Completa el CAPTCHA</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl btn-primary font-header font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

              <p className="text-[10px] text-faint font-bold leading-relaxed px-1">
                Al registrarte aceptas los{' '}
                <a href="/terminos" className="text-neon-blue hover:underline">Términos de Servicio</a> y la{' '}
                <a href="/privacidad" className="text-neon-blue hover:underline">Política de Privacidad</a>.
              </p>
            </form>

            <OAuthProviders
              onSelect={(p) => toast(`${p} estará disponible en la beta soon. Usa Discord o CISZU ID por ahora.`, 'warning')}
            />

            <AuthSecondaryActions
              mode="register"
              loginHref="/login"
              supportHref="/soporte"
              linkClass="text-neon-blue hover:text-white transition-colors underline decoration-neon-blue/30 underline-offset-8"
            />
          </div>
        </div>

        {/* Lomo central del libro (solo escritorio) */}
        <div className="relative hidden lg:block self-stretch">
          <div className="absolute inset-y-2 left-0 w-px bg-gradient-to-b from-neon-pink/50 via-white/10 to-[#5865F2]/50" />
          <div className="absolute inset-y-2 -left-1.5 w-3 rounded-full opacity-50 bg-gradient-to-b from-neon-pink to-[#5865F2] blur-[1px]" />
        </div>

        {/* Página derecha: beneficios */}
        <AuthBenefitsPanel
          badge="CISZU ID"
          title="¿Por qué crear tu cuenta?"
          items={REGISTER_BENEFITS}
          footerNote={REGISTER_FOOTER}
          accent="#ff33cc"
          accentAlt="#38bdf8"
        />
      </div>

      <QuickDocks />
    </div>
  );
}