'use client';

import React, { useEffect, useState } from 'react';
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
  useActivityGuard,
  RecaptchaGate,
  TwoFactorGate,
} from '@ciszu/ui';
import { Button } from '@heroui/react';
import { useDict } from '@/lib/useDict';
import { fillTemplate } from '@/lib/i18n';

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


const CISZU_ISOTYPE = assetResolver.resolve('projects/ciszu/content/logos/images/outline/isotype/gradient/color/ciszu_logo_isotipo_outline_degradado_zwhite_ccolor.svg');

export default function RegisterPage() {
  usePageTitle('REGISTER');
  const t = useDict();
  const { toast } = useToast();
  const REGISTER_BENEFITS = [
    {
      icon: <span className="w-full h-full text-neon-pink"><IconShield /></span>,
      title: t.registerPage.benefits.lessAds.title,
      description: t.registerPage.benefits.lessAds.desc,
    },
    {
      icon: <span className="w-full h-full text-neon-cyan"><IconCloud /></span>,
      title: t.registerPage.benefits.data.title,
      description: t.registerPage.benefits.data.desc,
    },
    {
      icon: <span className="w-full h-full text-neon-pink"><IconGift /></span>,
      title: t.registerPage.benefits.rewards.title,
      description: t.registerPage.benefits.rewards.desc,
    },
    {
      icon: <span className="w-full h-full text-neon-cyan"><IconKey /></span>,
      title: t.registerPage.benefits.single.title,
      description: t.registerPage.benefits.single.desc,
    },
  ];
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
  // Registro pendiente de verificación C-XXX XXX: guarda el token de la sesión
  // recién creada (la sesión se cierra hasta completar la verificación).
  const [pending, setPending] = useState<{ token: string; email: string } | null>(null);
  // El token de v2 es de un solo uso: cada envío fallido reinicia el widget.
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const v3ExecutorRef = React.useRef<(() => Promise<string | null>) | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);

  // Guard de acciones no recuperables: formulario de registro con contenido.
  const { begin: beginActivity, end: endActivity } = useActivityGuard();
  useEffect(() => {
    const hasInput = Object.values(form).some((v) => String(v).trim().length > 0);
    if (hasInput) beginActivity('auth-form');
    else endActivity('auth-form');
  }, [form, beginActivity, endActivity]);
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
    const u = form.username.trim();
    if (!u) next.username = t.registerPage.errRequired;
    else if (u.includes(' ')) next.username = t.registerPage.errNoSpaces;
    else if (u.length < 3) next.username = t.registerPage.errMin3;
    else if (u.length > 20) next.username = t.registerPage.errMax20;

    if (!form.displayName.trim()) next.displayName = t.registerPage.errRequired;
    else if (form.displayName.trim().length > 30) next.displayName = t.registerPage.errMax30;

    if (!form.email.trim()) next.email = t.registerPage.errRequired;
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = t.registerPage.errInvalidEmail;

    if (!form.password) next.password = t.registerPage.errPasswordRequired;
    else if (!passwordMeetsMinimum(form.password))
      next.password = t.registerPage.errPasswordWeak;

    if (!form.confirmPassword) next.confirmPassword = t.registerPage.errRequired;
    else if (form.confirmPassword !== form.password) next.confirmPassword = t.registerPage.errPasswordsDiffer;

    if (!acceptedTerms) next.terms = t.registerPage.errTerms;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      // Token de reCAPTCHA fresco (caduca en 2 minutos): se pide justo antes
      // de enviar. En Enterprise el executor es el que genera el token.
      const captcha = (await v3ExecutorRef.current?.()) ?? null;
      if (!captcha) {
        throw new Error(t.registerPage.errCaptchaRequired);
      }
      const verifyRes = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captcha, action: 'register' }),
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyData.success) {
        throw new Error(verifyData.error || t.registerPage.errCaptchaFailed);
      }

      // Guardia por IP: no se crean cuentas desde orígenes sancionados.
      const guard = (await fetch('/api/auth/register/guard', { method: 'POST' })
        .then((r) => r.json())
        .catch(() => null)) as { blocked?: boolean } | null;
      if (guard?.blocked) {
        throw new Error(t.registerPage.errIpBlocked);
      }

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
          // ¿Correo de una cuenta ELIMINADA? Puede re-crearse (con aviso) reemplazando datos.
          const rc = await fetch('/api/auth/account/reclaim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: form.email.trim(),
              password: form.password,
              username: form.username.trim().toLowerCase(),
              display_name: (form.displayName ?? '').trim() || form.username.trim(),
            }),
          });
          const rd = (await rc.json().catch(() => ({}))) as { success?: boolean; state?: string };
          if (rd.state === 'reclaimed') {
            const { data: s } = await supabase.auth.signInWithPassword({
              email: form.email.trim(),
              password: form.password,
            });
            const token = s.session?.access_token;
            if (!token) throw new Error(t.registerPage.errReclaimLogin);
            const gen = await fetch('/api/auth/2fa/generate', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
            const genData = await gen.json().catch(() => ({}));
            if (!gen.ok || genData.success === false) {
              throw new Error(genData.error || t.registerPage.errSendKey);
            }
            toast(t.registerPage.toastReclaimed, 'success');
            await supabase.auth.signOut().catch(() => {});
            setPending({ token, email: form.email.trim() });
            return;
          }
          if (rd.state === 'pending') {
            throw new Error(t.registerPage.errReclaimPending);
          }
          if (rd.state === 'banned') {
            throw new Error(t.registerPage.errReclaimBanned);
          }
          throw new Error(t.registerPage.errAlreadyRegistered);
        }
        throw new Error(error.message);
      }

      if (data.user) {
        const token = data.session?.access_token;
        if (!token) throw new Error(t.registerPage.errStartVerify);

        // Código C-XXX XXX al email (servicio 2FA compartido: límites, 3 h, reenvíos).
        const startRes = await fetch('/api/auth/2fa/generate', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const startData = await startRes.json().catch(() => ({}));
        if (!startRes.ok || startData.success === false) {
          throw new Error(startData.error || t.registerPage.errSendKey);
        }

        // La sesión se cierra hasta verificar: sin verificación la cuenta queda
        // sin confirmar y no podrá iniciar sesión (no existe de forma utilizable).
        await supabase.auth.signOut().catch(() => {});
        setPending({ token, email: form.email.trim() });
      }
    } catch (err: any) {
      setLocalError(err.message || t.registerPage.errUnknown);
      setCaptchaResetKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  /** Código verificado: confirma el email, activa el OTP de la web y entra. */
  const handleVerified = async () => {
    if (!pending) return;
    setLocalError('');
    try {
      const res = await fetch('/api/auth/register/complete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${pending.token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.error || t.registerPage.errComplete);
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: pending.email,
        password: form.password,
      });
      if (signInError) throw signInError;
      setPending(null);
      toast(t.registerPage.toastVerified, 'success');
      router.replace('/');
    } catch (err: any) {
      setPending(null);
      setLocalError(err?.message || t.registerPage.errComplete);
    }
  };

  /** Sin verificación no hay cuenta: se vuelve al formulario con aviso. */
  const handleCancelVerify = () => {
    setPending(null);
    toast(t.registerPage.toastVerifyCancelled, 'error');
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
            subtitle={t.registerPage.subtitle}
          />
        </div>

        {/* Libro de 2 caras: formulario (izquierda) + lomo (centro) + beneficios (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-start">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-brand-light rounded-[2.5rem] blur opacity-20 transition duration-500" />
            <div className="relative bg-[#070710]/95 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-6 backdrop-blur-2xl shadow-2xl">
            {pending ? (
              <div className="space-y-4" data-testid="register-verification">
                <TwoFactorGate
                  accessToken={pending.token}
                  email={pending.email}
                  siteName="Ciszu Network"
                  force
                  onVerified={handleVerified}
                  onCancel={handleCancelVerify}
                />
              </div>
            ) : emailSent ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                <p className="text-emerald-400 font-black uppercase tracking-widest text-sm">{t.registerPage.verifyTitle}</p>
                <p className="text-gray-400 text-xs font-bold leading-relaxed">
                  {t.registerPage.verifyText}
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AuthField
                      label={t.registerPage.labelUsername}
                      name="username"
                      icon={<span className="w-full h-full text-neon-pink"><IconUser /></span>}
                      placeholder={t.registerPage.phUsername}
                      required
                      maxLength={20}
                      autoComplete="username"
                      value={form.username}
                      onChange={handleChange}
                      error={errors.username}
                      requirements={[t.registerPage.reqUsername1, t.registerPage.reqUsername2, t.registerPage.reqUsername3]}
                    />
                    <AuthField
                      label={t.registerPage.labelDisplayName}
                      name="displayName"
                      icon={<span className="w-full h-full text-neon-pink"><IconUser /></span>}
                      placeholder={t.registerPage.phDisplayName}
                      required
                      maxLength={30}
                      value={form.displayName}
                      onChange={handleChange}
                      error={errors.displayName}
                      requirements={[t.registerPage.reqDisplay1, t.registerPage.reqDisplay2]}
                    />
                  </div>

                  <AuthField
                    label={t.registerPage.labelEmail}
                    name="email"
                    icon={<span className="w-full h-full text-neon-pink"><IconMail /></span>}
                    type="email"
                    placeholder={t.registerPage.phEmail}
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    requirements={[t.registerPage.reqEmail1]}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <AuthField
                        label={t.registerPage.labelPassword}
                        name="password"
                        icon={<span className="w-full h-full text-neon-pink"><IconLock /></span>}
                        type="password"
                        placeholder={t.registerPage.phPassword}
                        required
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                        requirements={[t.registerPage.reqPassword1, t.registerPage.reqPassword2, t.registerPage.reqPassword3, t.registerPage.reqPassword4, t.registerPage.reqPassword5]}
                      />
                      <PasswordStrengthBar password={form.password} />
                    </div>
                    <AuthField
                      label={t.registerPage.labelConfirm}
                      name="confirmPassword"
                      icon={<span className="w-full h-full text-neon-pink"><IconLock /></span>}
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      requirements={[t.registerPage.reqConfirm1]}
                    />
                  </div>

<div className="flex items-start gap-3">
                      <div className="relative flex items-center justify-center shrink-0 w-5 h-5 mt-0.5">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="peer appearance-none w-full h-full border-2 border-white/20 rounded bg-black/50 checked:bg-neon-pink checked:border-neon-purple transition-all"
                        />
                        <svg viewBox="0 0 24 24" className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                        {t.registerPage.termsA}<a href="/terms" className="text-neon-cyan hover:underline">{t.registerPage.termsLink}</a>{t.registerPage.termsB}<a href="/privacy" className="text-neon-cyan hover:underline">{t.registerPage.privacyLink}</a>{t.registerPage.termsC}
                      </p>
                    </div>
                    {errors.terms && <p className="text-red-400 text-[11px] font-bold">{errors.terms}</p>}

                    <div className="flex items-start gap-3">
                      <div className="relative flex items-center justify-center shrink-0 w-5 h-5 mt-0.5">
                        <input
                          type="checkbox"
                          checked={acceptedMarketing}
                          onChange={(e) => setAcceptedMarketing(e.target.checked)}
                          className="peer appearance-none w-full h-full border-2 border-white/20 rounded bg-black/50 checked:bg-neon-pink checked:border-neon-purple transition-all"
                        />
                        <svg viewBox="0 0 24 24" className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                        {t.registerPage.marketingA}<a href="/terms" className="text-neon-cyan hover:underline">Ciszu Network</a>{t.registerPage.marketingB}<strong className="text-neon-pink">{t.registerPage.marketingStrong}</strong>
                      </p>
                    </div>
                    {errors.marketing && <p className="text-red-400 text-[11px] font-bold">{errors.marketing}</p>}

                    <RecaptchaGate
                      siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY_CISZU || ''}
                      action="register"
                      v3ExecutorRef={v3ExecutorRef}
                      resetKey={captchaResetKey}
                    />
                    {errors.captcha && <p className="text-red-400 text-[11px] font-bold">{errors.captcha}</p>}

                  {localError && <p className="text-red-400 text-[11px] font-bold">{localError}</p>}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isDisabled={loading}
                    className="w-full font-header font-black uppercase tracking-widest text-sm"
                  >
                    {loading ? t.registerPage.submitting : t.registerPage.submit}
                  </Button>
                </form>

                <OAuthProviders
                  onSelect={(p) => toast(fillTemplate(t.registerPage.oauthSoon, { provider: p }), 'warning')}
                />

                <div className="pt-3">
                  <p className="text-center text-[9px] text-white/30 font-bold uppercase tracking-[0.25em]">
                    {t.registerPage.noAccount}
                  </p>
                  <p className="text-center text-[10px] text-gray-500 font-bold mt-1">
                    {t.registerPage.createWith}
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
            title={t.registerPage.benefitsTitle}
            items={REGISTER_BENEFITS}
            footerNote={t.registerPage.footerNote}
            accent="#ff33cc"
            accentAlt="#3a6bf0"
          />
        </div>
      </div>
    </div>
  );
}