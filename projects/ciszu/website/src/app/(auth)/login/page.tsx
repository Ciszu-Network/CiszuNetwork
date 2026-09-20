'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { assetResolver } from '@ciszunetwork/cdn';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store';
import { syncPreferencesToProfile, loadPreferences } from '@/lib/preferences';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  AuthBenefitsPanel,
  AuthField,
  AuthSecondaryActions,
  CiszuIdBrand,
  OAuthProviders,
  SmartImage,
  useToast,
  useActivityGuard,
  RecaptchaGate,
  RecoveryOneUseNotice,
  TwoFactorGate,
} from '@ciszu/ui';
import { Button } from '@heroui/react';
import {
  describeDuration,
  evaluateRecoveryRequest,
  readRequestTimestamps,
  recordRecoveryRequest,
  writeRequestedAt,
} from '@ciszunetwork/utils';

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

const IconSparkles = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
  </svg>
);

const LOGIN_BENEFITS = [
  {
    icon: <span className="w-full h-full text-brand-light"><IconShield /></span>,
    title: 'Menos anuncios',
    description: 'Al iniciar sesión quitamos los anuncios de footer y reduce la frecuencia del resto. Tu navegación, más limpia.',
  },
  {
    icon: <span className="w-full h-full text-neon-cyan"><IconCloud /></span>,
    title: 'Tus datos, siempre contigo',
    description: 'Preferencias, progreso y configuración guardados en la nube y sincronizados entre todos tus dispositivos.',
  },
  {
    icon: <span className="w-full h-full text-neon-pink"><IconGift /></span>,
    title: 'Recompensas y VIP futuro',
    description: 'Los usuarios registrados podrán optar a recompensas y, próximamente, a un rango VIP que quita los anuncios.',
  },
];

const LOGIN_FOOTER = 'Iniciar sesión es gratis. Usamos tus datos para personalizar anuncios y ofrecerte menos publicidad — consulta nuestras políticas en Ciszu Network.';

const CISZU_ISOTYPE = assetResolver.resolve('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg');

export default function LoginPage() {
  usePageTitle('LOGIN');
  const { setUser } = useAppStore();
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [forgot, setForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // El token de v2 es de un solo uso: cada envío fallido reinicia el widget.
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const v3ExecutorRef = React.useRef<(() => Promise<string | null>) | null>(null);
  // Sesión a medio autenticar: la contraseña ya es válida pero falta la clave 2FA.
  const [twoFactor, setTwoFactor] = useState<{ token: string; email: string } | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);

  // Guard de acciones no recuperables: si hay contenido en el formulario de
  // login y el usuario intenta navegar, se avisa (ActivityGuard rojo).
  const { begin: beginActivity, end: endActivity } = useActivityGuard();
  useEffect(() => {
    const hasInput = form.email.trim().length > 0 || form.password.length > 0;
    if (hasInput) beginActivity('auth-form');
    else endActivity('auth-form');
  }, [form.email, form.password, beginActivity, endActivity]);
  useEffect(() => {
    return () => endActivity('auth-form');
  }, []);

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
    if (!captchaToken) next.captcha = 'Debes completar el reCAPTCHA';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const v3Token = (await v3ExecutorRef.current?.()) ?? null;
      const verifyRes = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ v2Token: captchaToken, v3Token, action: 'login' }),
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Verificación de reCAPTCHA fallida');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        throw new Error(error.message === 'Invalid login credentials'
          ? 'Credenciales inválidas. Verifica tu email y contraseña.'
          : error.message);
      }

      // Si la cuenta tiene la verificación en dos pasos activa EN ESTA WEB, la
      // sesión no se da por buena todavía: se pide la clave antes de entrar.
      const accessToken = data.session?.access_token;
      if (accessToken) {
        const twoFactorStatus = await fetch('/api/auth/2fa/status', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .catch(() => null);

        if (twoFactorStatus?.enabled) {
          setTwoFactor({ token: accessToken, email: data.user?.email ?? '' });
          return;
        }
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

      toast('Bienvenido de nuevo, ' + (profile?.display_name || data.user.email), 'success');
      router.push('/');
    } catch (err: any) {
      setLocalError(err.message || 'Error desconocido al iniciar sesión');
      setCaptchaResetKey((k) => k + 1);
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
    // Hay que esperar 12 horas si se piden demasiados enlaces seguidos.
    const policy = evaluateRecoveryRequest({ timestamps: readRequestTimestamps() });
    if (!policy.allowed) {
      setLocalError(`Demasiadas peticiones de enlace. Vuelve a intentarlo en ${describeDuration(policy.waitMs)}.`);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      // Se registra la petición y su hora: permite aplicar las 12 h y calcular
      // después en /reset-password el instante exacto en que el enlace caducó.
      recordRecoveryRequest();
      writeRequestedAt();
      setSent(true);
    } catch (err: any) {
      setLocalError(err.message || 'No se pudo enviar el enlace');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de verificación en dos pasos: sustituye al formulario de acceso.
  if (twoFactor) {
    return (
      <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
        <div className="max-w-md mx-auto px-4 relative">
          <div className="p-6 md:p-8 bg-surface border border-border rounded-[2rem] shadow-2xl backdrop-blur-3xl">
            <TwoFactorGate
              accessToken={twoFactor.token}
              email={twoFactor.email}
              siteName="Ciszu Network"
              onVerified={() => router.push('/')}
              onCancel={() => {
                setTwoFactor(null);
                void supabase.auth.signOut();
                setLocalError('Verificación cancelada. Vuelve a iniciar sesión cuando tengas la clave.');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand/15 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-4">
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

        {/* Libro de 2 caras: formulario (izquierda) + lomo (centro) + beneficios (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-start">
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
                  <RecoveryOneUseNotice />
                  {localError && <p className="text-red-400 text-[11px] font-bold">{localError}</p>}
                  {sent ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                      <p className="text-emerald-400 text-xs font-bold">Enlace enviado</p>
                      <p className="text-gray-400 text-[10px] font-bold mt-1">Revisa tu bandeja de entrada o spam. El enlace es de un solo uso.</p>
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isDisabled={loading}
                      className="w-full font-header font-black uppercase tracking-widest text-sm"
                    >
                      {loading ? 'ENVIANDO…' : 'ENVIAR ENLACE'}
                    </Button>
                  )}
                  <Button type="button" variant="secondary" size="sm" onPress={() => { setForgot(false); setSent(false); setLocalError(null); }} className="w-full text-[10px] font-bold uppercase tracking-widest">
                    ← Volver al acceso normal
                  </Button>
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

                    <div className="flex items-start gap-3">
                      <div className="relative flex items-center justify-center shrink-0 w-5 h-5 mt-0.5">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="peer appearance-none w-full h-full border-2 border-white/20 rounded bg-black/50 checked:bg-brand-light checked:border-brand-light transition-all"
                        />
                        <svg viewBox="0 0 24 24" className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                        Acepto los <a href="/terms" className="text-neon-cyan hover:underline">Términos de Servicio</a> y la <a href="/privacy" className="text-neon-cyan hover:underline">Política de Privacidad</a>.
                      </p>
                    </div>
                    {errors.terms && <p className="text-red-400 text-[11px] font-bold">{errors.terms}</p>}

                    <div className="flex items-start gap-3">
                      <div className="relative flex items-center justify-center shrink-0 w-5 h-5 mt-0.5">
                        <input
                          type="checkbox"
                          checked={acceptedMarketing}
                          onChange={(e) => setAcceptedMarketing(e.target.checked)}
                          className="peer appearance-none w-full h-full border-2 border-white/20 rounded bg-black/50 checked:bg-brand-light checked:border-brand-light transition-all"
                        />
                        <svg viewBox="0 0 24 24" className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                        Acepto recibir comunicaciones de <a href="/terms" className="text-neon-cyan hover:underline">Ciszu Network</a> (novedades, actualizaciones, ofertas). <strong className="text-neon-pink">No es publicidad de terceros.</strong>
                      </p>
                    </div>
                    {errors.marketing && <p className="text-red-400 text-[11px] font-bold">{errors.marketing}</p>}

                    <RecaptchaGate
                      siteKeyV2={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V2_CISZU || ''}
                      siteKeyV3={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3_CISZU || ''}
                      action="login"
                      onV2Token={setCaptchaToken}
                      v3ExecutorRef={v3ExecutorRef}
                      resetKey={captchaResetKey}
                    />
                    {errors.captcha && <p className="text-red-400 text-[11px] font-bold text-center">{errors.captcha}</p>}

                     <Button
                       type="submit"
                       variant="primary"
                       size="lg"
                       isDisabled={loading}
                       className="w-full font-header font-black uppercase tracking-widest text-sm"
                     >
                       {loading ? 'PROCESANDO…' : 'INICIAR SESIÓN'}
                     </Button>
                  </form>

                  <OAuthProviders
                    onSelect={(p) => toast(`OAuth de ${p} disponible en futura versión beta`, 'warning')}
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

          {/* Lomo central del libro (solo escritorio) */}
          <div className="relative hidden lg:block self-stretch">
            <div className="absolute inset-y-2 left-0 w-px bg-gradient-to-b from-brand-light/50 via-white/10 to-neon-pink/50" />
            <div className="absolute inset-y-2 -left-1.5 w-3 rounded-full opacity-50 bg-gradient-to-b from-brand-light to-neon-pink blur-[1px]" />
          </div>

          {/* Página derecha: beneficios */}
          <AuthBenefitsPanel
            badge="CISZU ID"
            title="¿Por qué iniciar sesión?"
            items={LOGIN_BENEFITS}
            footerNote={LOGIN_FOOTER}
            accent="#3a6bf0"
            accentAlt="#f472b6"
          />
        </div>
      </div>
    </div>
  );
}