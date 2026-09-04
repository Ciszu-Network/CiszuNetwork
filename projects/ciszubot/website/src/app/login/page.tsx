'use client';

import { useState, useEffect, useCallback } from 'react';
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
  useToast,
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

const LOGIN_BENEFITS = [
  {
    icon: <span className="w-full h-full text-neon-blue"><IconShield /></span>,
    title: 'Menos anuncios',
    description: 'Al iniciar sesión quitamos los anuncios de footer y reducimos la frecuencia del resto. Tu navegación, más limpia.',
  },
  {
    icon: <span className="w-full h-full text-neon-cyan"><IconCloud /></span>,
    title: 'Tus datos, siempre contigo',
    description: 'Preferencias, configuración y progreso guardados en la nube y sincronizados entre tus dispositivos.',
  },
  {
    icon: <span className="w-full h-full text-neon-pink"><IconGift /></span>,
    title: 'Recompensas y VIP futuro',
    description: 'Los usuarios registrados podrán optar a recompensas y, próximamente, a un rango VIP que quita los anuncios.',
  },
];

const LOGIN_FOOTER = 'Iniciar sesión es gratis. Usamos tus datos para personalizar anuncios y ofrecerte menos publicidad — consulta nuestras políticas en Ciszu Network.';

const IconUser = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CISZU_ISOTYPE = 'projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg';
const BOT_ISOTYPE = 'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png';

export default function LoginPage() {
  usePageTitle('LOGIN');
  const router = useRouter();
  const { user } = useAppStore();
  const { begin: beginActivity, end: endActivity } = useActivityGuard();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [forgot, setForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Guard de acciones no recuperables: login con contenido → no navegar sin aviso.
  useEffect(() => {
    const hasInput = form.identifier.trim().length > 0 || form.password.length > 0;
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
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) setError(null);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.identifier.trim()) next.identifier = 'Introduce tu email o @usuario';
    if (!form.password) next.password = 'La contraseña es obligatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      let emailToUse = form.identifier.trim();

      if (emailToUse && !emailToUse.includes('@')) {
        const username = emailToUse.replace(/^@/, '');
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', username.toLowerCase())
          .maybeSingle();
        if (!profile?.email) throw new Error(`El usuario @${username} no fue encontrado.`);
        emailToUse = profile.email;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: form.password,
      });

      if (signInError) throw signInError;

      router.replace('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotEmail.trim() || !/^\S+@\S+\.\S+$/.test(forgotEmail.trim())) {
      setErrors((prev) => ({ ...prev, email: 'Introduce un email válido' }));
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim());
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg min-h-[calc(100vh-60px)] relative overflow-hidden pb-24">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[#5865F2]/10 blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-neon-blue/10 blur-[140px] pointer-events-none" />

      <div className="pt-14 mb-10 px-4">
        <CiszuIdBrand
          ciszuIsotype={<SmartImage src={CISZU_ISOTYPE} alt="Ciszu ID" width={40} height={40} className="w-9 h-9" />}
          appIsotype={<SmartImage src={BOT_ISOTYPE} alt="CiszuBot" width={40} height={40} className="w-9 h-9 rounded-full" />}
          ciszuHref="https://ciszunetwork.vercel.app"
          appHref="/"
          title="CISZU ID"
          subtitle="Inicia sesión en CiszuBot con CISZU ID"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-start">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#5865F2] to-neon-blue rounded-[2rem] blur opacity-20 transition duration-500" />
          <div className="relative p-6 md:p-8 bg-surface border border-border rounded-[2rem] shadow-2xl space-y-6 backdrop-blur-3xl">
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
                  onChange={(e) => { setForgotEmail(e.target.value); setErrors((prev) => ({ ...prev, email: '' })); }}
                  error={errors.email}
                  requirements={['Formato de email válido (p. ej. nombre@dominio.com)', 'Debe ser la cuenta CISZU ID registrada']}
                />
                {error && <p className="text-red-400 text-[11px] font-bold">{error}</p>}
                {sent ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                    <p className="text-emerald-400 text-xs font-bold">Enlace enviado</p>
                    <p className="text-gray-400 text-[10px] font-bold mt-1">Revisa tu bandeja de entrada o spam. El enlace es de un solo uso.</p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl btn-primary font-header font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {loading ? 'ENVIANDO…' : 'ENVIAR ENLACE'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setForgot(false); setSent(false); setError(null); }}
                  className="w-full text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-all cursor-pointer"
                >
                  ← Volver al acceso normal
                </button>
              </form>
            ) : (
              <>
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
                      Continuar con Discord
                    </a>
                  )}
                  onSelect={(p) => toast(`${p} estará disponible en la beta soon. Usa Discord o CISZU ID por ahora.`, 'warning')}
                />

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-faint">o con CISZU ID</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AuthField
                    label="Email o usuario"
                    name="identifier"
                    icon={<span className="w-full h-full text-neon-blue"><IconUser /></span>}
                    type="text"
                    placeholder="tu@email.com o @usuario"
                    autoComplete="username"
                    required
                    value={form.identifier}
                    onChange={handleChange}
                    error={errors.identifier}
                    requirements={['Email de la cuenta o nombre de usuario precedido de @', 'El usuario se resuelve automáticamente a su email']}
                  />
                  <AuthField
                    label="Contraseña"
                    name="password"
                    icon={<span className="w-full h-full text-neon-blue"><IconLock /></span>}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                  />

                  {error && <p className="text-red-400 text-[11px] font-bold px-1">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl btn-primary font-header font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {loading ? 'Procesando...' : 'Iniciar sesión'}
                  </button>
                </form>

                <OAuthProviders
                  onSelect={(p) => toast(`${p} estará disponible en la beta soon. Usa Discord o CISZU ID por ahora.`, 'warning')}
                />

                <AuthSecondaryActions
                  mode="login"
                  onForgotPassword={() => setForgot(true)}
                  registerHref="/register"
                  supportHref="/soporte"
                  linkClass="text-neon-blue hover:text-white transition-colors underline decoration-neon-blue/30 underline-offset-8"
                />
              </>
            )}
          </div>
        </div>

        {/* Lomo central del libro (solo escritorio) */}
        <div className="relative hidden lg:block self-stretch">
          <div className="absolute inset-y-2 left-0 w-px bg-gradient-to-b from-[#5865F2]/50 via-white/10 to-neon-blue/50" />
          <div className="absolute inset-y-2 -left-1.5 w-3 rounded-full opacity-50 bg-gradient-to-b from-[#5865F2] to-neon-blue blur-[1px]" />
        </div>

        {/* Página derecha: beneficios */}
        <AuthBenefitsPanel
          badge="CISZU ID"
          title="¿Por qué iniciar sesión?"
          items={LOGIN_BENEFITS}
          footerNote={LOGIN_FOOTER}
          accent="#38bdf8"
          accentAlt="#ff33cc"
        />
      </div>
    </div>
  );
}