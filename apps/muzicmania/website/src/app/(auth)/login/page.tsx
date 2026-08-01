'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { Button } from '@/components/atoms/Button';
import ReCAPTCHA from 'react-google-recaptcha';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import AuthFeedback from '@/components/molecules/AuthFeedback';

// --- Icons Library ---
const I = {
  lock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  mail: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  login: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  user: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  shield: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

const InputField = ({ label, name, icon, type = "text", placeholder, maxLength, required = false, value, error, onChange, onBlur }: any) => {
  return (
    <div className="space-y-1 relative">
      <div className="flex items-center justify-between ml-1 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 text-neon-blue">{icon}</div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
        {maxLength && (
          <span className={`text-[9px] font-bold ${value.length >= maxLength ? 'text-red-400' : 'text-gray-600'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className={`w-full bg-black/60 border ${error ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-5 py-4 text-white font-header font-bold placeholder:text-gray-700 focus:border-neon-blue/50 transition-all outline-none [color-scheme:dark]`}
      />
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-[10px] font-bold mt-1 ml-2">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function LoginPage() {
  const [form, setForm] = useState({
    identifier: '',
    password: '',
    confirmPassword: '',
    twoFactor: '',
    captchaToken: null as string | null
  });

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep2, setForgotStep2] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast, setUser, user } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ isVisible: boolean; type: 'success' | 'error' | 'loading' | 'info'; title: string; message: string }>({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [needs2FA, setNeeds2FA] = useState(false); // Simulando flujo 2FA

  useEffect(() => {
    // Si ya hay usuario logeado, mandarlo a su perfil o pedirle que cierre sesión.
    if (user) {
      router.push(`/profile/@${user.username}`);
    }
  }, [user, router]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'identifier':
        if (value.length === 0) error = 'Este campo es obligatorio';
        else if (value.includes(' ') && !value.includes('@')) error = 'No se permiten espacios en usuario o email';
        break;
      case 'password':
        if (value.length === 0) error = 'La contraseña es obligatoria';
        break;
      case 'twoFactor':
        if (needs2FA && value.length !== 6) error = 'El código debe tener 6 dígitos';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Object.keys(form).forEach(key => validateField(key, form[key as keyof typeof form] as string));
    
    if (!form.captchaToken && process.env.NODE_ENV === 'production') {
      setErrors(prev => ({ ...prev, captcha: 'Debes completar el reCAPTCHA' }));
      return;
    }

    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors) return;

    setFeedback({ isVisible: true, type: 'loading', title: 'Verificando', message: 'Iniciando sesión en el sistema...' });
    try {
      if (!needs2FA) {
        let emailToUse = form.identifier;
        let cleanIdentifier = form.identifier.trim();
        let isUsername = false;

        if (cleanIdentifier.startsWith('@')) {
          cleanIdentifier = cleanIdentifier.substring(1);
          isUsername = true;
        } else if (!cleanIdentifier.includes('@')) {
          isUsername = true;
        }

        if (isUsername) {
          const { data: emailData, error: emailError } = await supabase.rpc('get_email_by_username', { 
            p_username: cleanIdentifier 
          });
          
          if (!emailError && emailData) {
            emailToUse = emailData;
          } else {
            throw new Error(`El usuario @${cleanIdentifier} no fue encontrado.`);
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: form.password,
        });

        if (error) {
          if (error.message === 'Invalid login credentials') {
            throw new Error('Credenciales inválidas. Verifica tu usuario/email y contraseña.');
          }
          throw error;
        }

        // Obtener datos extendidos del perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('[PROFILE SYNC ERROR]:', profileError);
        }

        // Guardar en el store global
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: profile?.username || 'user',
          display_name: profile?.display_name || data.user.email,
          avatar_url: profile?.avatar_url,
          role: profile?.role || 'user'
        });

        // Sincronizar ajustes locales a la nube si es la primera vez o han cambiado
        const { lang, darkMode } = useAppStore.getState();
        await supabase
          .from('profiles')
          .update({
            settings_lang: lang,
            settings_theme: darkMode ? 'dark' : 'light'
          })
          .eq('id', data.user.id);

        setFeedback({ 
          isVisible: true, 
          type: 'success', 
          title: 'Acceso Concedido', 
          message: `¡Bienvenido de nuevo, ${profile?.display_name || data.user.email}! Tus ajustes se han sincronizado.` 
        });

        // Esperar un momento para que el usuario vea el éxito y luego redirigir
        setTimeout(() => {
          router.push(`/profile/${profile?.username ? `@${profile.username}` : data.user.id}`);
        }, 1500);

      } else {
        showToast('[SISTEMA]: 2FA no implementado en esta versión beta.');
      }
    } catch (err: any) {
      setFeedback({ 
        isVisible: true, 
        type: 'error', 
        title: 'Fallo de Autenticación', 
        message: err.message || 'Error desconocido al iniciar sesión' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!form.captchaToken) {
      setErrors({ captcha: 'Por favor, verifica que eres humano' });
      return;
    }

    setLoading(true);

    try {
      if (!forgotStep2) {
        // Enviar código de reseteo
        const { error } = await supabase.auth.resetPasswordForEmail(form.identifier);
        if (error) throw error;
        
        setFeedback({
          isVisible: true,
          type: 'success',
          title: 'Código Enviado',
          message: 'Revisa tu bandeja de entrada o spam. Hemos enviado el código de verificación.'
        });
        setForgotStep2(true);
      } else {
        // Validar contraseña
        if (form.password.length < 8) {
          throw new Error('La contraseña debe tener al menos 8 caracteres');
        }
        if (form.password !== form.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }

        // Recuperar sesión y establecer nueva contraseña
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: form.identifier,
          token: form.twoFactor,
          type: 'recovery'
        });
        
        if (verifyError) throw verifyError;

        const { error: updateError } = await supabase.auth.updateUser({
          password: form.password
        });

        if (updateError) throw updateError;

        setFeedback({
          isVisible: true,
          type: 'success',
          title: 'Identidad Restaurada',
          message: 'Tu contraseña ha sido actualizada. Iniciando sesión...'
        });

        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err: any) {
      setFeedback({
        isVisible: true,
        type: 'error',
        title: 'Error de Recuperación',
        message: err.message || 'Ocurrió un error inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-neon-blue/5 rounded-full blur-[180px] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-0 pb-32 space-y-20">
        
        <motion.header 
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants} 
          className="relative space-y-8 pt-12"
        >
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center justify-center gap-6 group">
                <div className="w-12 h-12 text-neon-blue flex items-center justify-center drop-shadow-[0_0_15px_rgba(39,158,255,0.4)]">
                   {I.login}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  ACCESO
                </h1>
             </div>
             <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Bienvenido de nuevo a la dimensión rítmica
             </p>
          </div>
        </motion.header>

        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants}
          className="max-w-md mx-auto relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-[3rem] blur opacity-20 transition duration-500" />
          <div className="relative p-8 md:p-10 bg-doc-dark border border-white/10 rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-3xl">
            <form onSubmit={isForgotPassword ? handleForgotPasswordSubmit : handleSubmit} className="space-y-6">
              
              <AnimatePresence mode="popLayout">
                {isForgotPassword ? (
                  <motion.div key="forgot" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <div className="text-center space-y-2 mb-4">
                      <div className="w-10 h-10 mx-auto text-neon-blue">{I.lock}</div>
                      <h3 className="text-white font-black uppercase tracking-widest text-sm">Recuperar Identidad</h3>
                      <p className="text-gray-400 text-[10px] font-bold">Enviaremos un código de 6 dígitos a tu email.</p>
                    </div>
                    {!forgotStep2 ? (
                      <InputField label="Email de la cuenta" name="identifier" icon={I.mail} placeholder="tu@email.com" required value={form.identifier} error={errors.identifier} onChange={handleChange} onBlur={() => validateField('identifier', form.identifier)} />
                    ) : (
                      <>
                        <InputField label="Código de 6 dígitos" name="twoFactor" icon={I.shield} type="text" placeholder="123456" maxLength={6} required value={form.twoFactor} error={errors.twoFactor} onChange={handleChange} />
                        <InputField label="Nueva Contraseña" name="password" icon={I.lock} type="password" placeholder="••••••••" required value={form.password} error={errors.password} onChange={handleChange} />
                        <InputField label="Repetir Contraseña" name="confirmPassword" icon={I.lock} type="password" placeholder="••••••••" required value={form.confirmPassword} error={errors.confirmPassword} onChange={handleChange} />
                      </>
                    )}
                  </motion.div>
                ) : !needs2FA ? (
                  <motion.div key="credentials" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <InputField label="Usuario o Email" name="identifier" icon={I.user} placeholder="CapaSinNombre o tu@email.com" required value={form.identifier} error={errors.identifier} onChange={handleChange} onBlur={() => validateField('identifier', form.identifier)} />
                    <InputField label="Contraseña" name="password" icon={I.lock} type="password" placeholder="••••••••" required value={form.password} error={errors.password} onChange={handleChange} onBlur={() => validateField('password', form.password)} />
                  </motion.div>
                ) : (
                  <motion.div key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="text-center space-y-2 mb-4">
                      <div className="w-10 h-10 mx-auto text-neon-cyan">{I.shield}</div>
                      <h3 className="text-white font-black uppercase tracking-widest text-sm">Autenticación de 2 Factores</h3>
                      <p className="text-gray-400 text-[10px] font-bold">Ingresa el código de 6 dígitos (expira tras un solo uso)</p>
                    </div>
                    <InputField label="Código 2FA" name="twoFactor" icon={I.shield} type="text" placeholder="123456" maxLength={6} required value={form.twoFactor} error={errors.twoFactor} onChange={handleChange} onBlur={() => validateField('twoFactor', form.twoFactor)} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2 flex flex-col items-center gap-2">
                {/* @ts-expect-error react-google-recaptcha typings error */}
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  theme="dark"
                  onChange={(val: string | null) => {
                    setForm(prev => ({ ...prev, captchaToken: val }));
                    if (val) setErrors(prev => ({ ...prev, captcha: '' }));
                  }}
                  onExpired={() => {
                    setForm(prev => ({ ...prev, captchaToken: null }));
                  }}
                />
                {errors.captcha && <span className="text-red-500 text-[10px] font-bold">{errors.captcha}</span>}
              </div>

              <div className="pt-2">
                <Button type="submit" variant="neon" fullWidth size="lg" disabled={loading} className="hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {loading ? 'PROCESANDO...' : isForgotPassword ? (forgotStep2 ? 'RESTABLECER CLAVE' : 'ENVIAR CÓDIGO') : (needs2FA ? 'VERIFICAR Y ACCEDER' : 'INICIALIZAR SESIÓN')}
                </Button>
                {isForgotPassword && (
                  <button type="button" onClick={() => { setIsForgotPassword(false); setForgotStep2(false); }} className="w-full mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-all">
                    ← Volver al Acceso Normal
                  </button>
                )}
              </div>
            </form>

            {!isForgotPassword && (
              <div className="pt-6 border-t border-white/5 text-center flex flex-col gap-3">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  ¿Problemas de acceso?{' '}
                  <button onClick={() => setIsForgotPassword(true)} className="text-gray-300 hover:text-white transition-colors underline decoration-white/20 underline-offset-8">
                    RECUPERAR CLAVE
                  </button>
                </p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                ¿Sin credenciales?{' '}
                <Link href="/register" className="text-neon-cyan hover:text-white transition-colors underline decoration-neon-cyan/20 underline-offset-8">
                  CREAR IDENTIDAD
                </Link>
              </p>
              </div>
            )}
          </div>
        </motion.section>

        <QuickDocks />
      </div>

      <AuthFeedback 
        isVisible={feedback.isVisible}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onConfirm={() => setFeedback({ ...feedback, isVisible: false })}
      />
    </MainLayout>
  );
}
