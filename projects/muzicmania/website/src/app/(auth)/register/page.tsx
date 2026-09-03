'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import { Button } from '@/components/atoms/Button';
import ReCAPTCHA from 'react-google-recaptcha';
import CountrySelect from '@/components/atoms/CountrySelect';
import DateSelect from '@/components/atoms/DateSelect';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/config/supabase';
import { useRouter } from 'next/navigation';
import AuthFeedback from '@/components/molecules/AuthFeedback';
import { usePageTitle } from '@/lib/usePageTitle';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { AuthBenefitsPanel, AuthSecondaryActions, CiszuIdBrand, OAuthProviders as SharedOAuthProviders, useToast, useActivityGuard } from '@ciszu/ui';

// --- Icons Library ---
const I = {
  user: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  lock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  register: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  calendar: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  globe: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  phone: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  badge: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 15v5s3-1.5 5-5V7a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v8c2 3.5 5 5 5 5z"/></svg>,
  eye: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// Beneficios "libro de 2 caras" (punto 5 de la tarea de anuncios).
const REGISTER_BENEFITS = [
  {
    icon: <span className="w-full h-full text-neon-purple"><svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg></span>,
    title: 'Menos anuncios',
    description: 'Al registrarte quitamos los anuncios de footer y reducimos la frecuencia del resto. Más ritmo, menos interrupciones.',
  },
  {
    icon: <span className="w-full h-full text-neon-cyan"><svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z"/></svg></span>,
    title: 'Guarda tu progreso',
    description: 'Scores, partidas y preferencias sincronizados en la nube entre todos tus dispositivos.',
  },
  {
    icon: <span className="w-full h-full text-neon-pink"><svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg></span>,
    title: 'Recompensas y VIP futuro',
    description: 'Acceso a recompensas y, próximamente, a un rango VIP que quita los anuncios por completo.',
  },
  {
    icon: <span className="w-full h-full text-neon-blue"><svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3L21 2"/><path d="M17 6l3 3"/></svg></span>,
    title: 'Un solo CISZU ID',
    description: 'Una cuenta para todas las webs del ecosistema: Ciszu Network, CiszukoAntony, MuzicMania y CiszuBot.',
  },
];

const REGISTER_FOOTER = 'Crear tu cuenta es gratis. Usamos tus datos para personalizar anuncios y darte menos publicidad — consulta nuestras políticas en Ciszu Network.';

const InputField = ({ label, name, icon, type = "text", placeholder, maxLength, required = false, isOptional = false, value, error, onChange, onBlur, options }: any) => {
  return (
    <div className="space-y-1 relative">
      <div className="flex items-center justify-between ml-1 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 text-neon-pink">{icon}</div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            {label} {required && <span className="text-red-500">*</span>}
            {isOptional && <span className="text-gray-600 text-[8px] ml-1">(Opcional)</span>}
          </label>
        </div>
        {maxLength && type !== 'select' && (
          <span className={`text-[9px] font-bold ${value.length >= maxLength ? 'text-red-400' : 'text-gray-600'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      
      {type === 'select' ? (
        <CountrySelect value={value} onChange={onChange} error={error} />
      ) : type === 'date' ? (
        <DateSelect value={value} onChange={onChange} error={error} name={name} />
      ) : (
        <input 
          type={type} 
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          className={`w-full bg-black/60 border ${error ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-5 py-4 text-white font-header font-bold placeholder:text-gray-700 focus:border-neon-pink/50 transition-all outline-none [color-scheme:dark]`}
        />
      )}
      
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

export default function RegisterPage() {
  usePageTitle('REGISTER');
  const { begin: beginActivity, end: endActivity } = useActivityGuard();
  const { setHasAcceptedCookies,  user } = useAppStore();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ isVisible: boolean; type: 'success' | 'error' | 'loading' | 'info'; title: string; message: string }>({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      router.push(`/profile/@${user.username}`);
    }
  }, [user, router]);

  const [form, setForm] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    realName: '',
    realLastName: '',
    phone: '',
    nationality: '',
    acceptedTerms: false,
    captchaToken: null as string | null
  });

  // Guard de acciones no recuperables: registro con contenido → no navegar sin aviso.
  useEffect(() => {
    const hasInput = Object.values(form).some((v) => String(v).trim().length > 0);
    if (hasInput) beginActivity('auth-form');
    else endActivity('auth-form');
  }, [form, beginActivity, endActivity]);
  useEffect(() => {
    return () => endActivity('auth-form');
     
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: 'bg-gray-700' });
  const [showOptional, setShowOptional] = useState(false);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  const validatePassword = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score += 1;
    if (pass.length > 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    let text = 'Muy Débil';
    let color = 'bg-red-500';

    if (score >= 5) { text = 'Fuerte'; color = 'bg-neon-cyan'; }
    else if (score >= 3) { text = 'Media'; color = 'bg-yellow-500'; }
    else if (score >= 1) { text = 'Débil'; color = 'bg-red-400'; }
    
    if (pass.length === 0) { text = ''; color = 'bg-gray-700'; score = 0; }

    setPasswordStrength({ score, text, color });
    return score;
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'username':
        if (value.includes(' ')) error = 'No se permiten espacios';
        else if (value.length > 0 && value.length < 3) error = 'Mínimo 3 caracteres';
        else if (value.length > 20) error = 'Máximo 20 caracteres';
        break;
      case 'displayName':
        if (value.length > 0 && value.length < 3) error = 'Mínimo 3 caracteres';
        else if (value.length > 30) error = 'Máximo 30 caracteres';
        break;
      case 'email':
        if (value.length > 0 && !/^\S+@\S+\.\S+$/.test(value)) error = 'Formato de email inválido (requiere @)';
        break;
      case 'password':
        if (value.length > 0 && value.length < 8) error = 'Mínimo 8 caracteres';
        break;
      case 'confirmPassword':
        if (value.length > 0 && value !== form.password) error = 'Las contraseñas no coinciden';
        break;
      case 'birthDate':
        if (value) {
          const birthYear = new Date(value).getFullYear();
          const currentYear = new Date().getFullYear();
          if (currentYear - birthYear < 13) error = 'Debes tener al menos 13 años';
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setForm(prev => ({ ...prev, [name]: val }));

    if (type !== 'checkbox') {
      validateField(name, value);
    }
    if (name === 'password') {
      validatePassword(value);
      if (form.confirmPassword) validateField('confirmPassword', form.confirmPassword);
    }
    if (name === 'acceptedTerms' && checked) {
      localStorage.setItem('cookies_accepted', 'true');
      setHasAcceptedCookies(true);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validar todo
    const newErrors: Record<string, string> = {};
    Object.keys(form).forEach(key => {
      const err = validateField(key, form[key as keyof typeof form] as string);
      if (err) newErrors[key] = err;
    });
    
    if (!form.captchaToken) {
      newErrors.captcha = 'Debes completar el reCAPTCHA';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setFeedback({ isVisible: true, type: 'loading', title: 'Registrando', message: 'Verificando disponibilidad de cuenta...' });
    try {
      // ── Verificar username único ANTES de crear la cuenta ──────────────────
      const { data: isAvailable, error: usernameCheckError } = await supabase
        .rpc('check_username_available', { p_username: form.username.trim().toLowerCase() });

      if (!usernameCheckError && isAvailable === false) {
        throw new Error(`El nombre de usuario "@${form.username}" ya está en uso. Elige otro.`);
      }

      setFeedback({ isVisible: true, type: 'loading', title: 'Registrando', message: 'Creando tu cuenta en el sistema MuzicMania...' });

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username.trim().toLowerCase(),
            display_name: form.displayName,
            first_name: form.realName,
            last_name: form.realLastName,
            birth_date: form.birthDate,
            country: form.nationality,
            phone: form.phone
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          throw new Error('Este email ya está registrado. ¿Olvidaste tu contraseña? Ve a Login y usa "Recuperar Clave".');
        }
        if (error.message.includes('invalid')) {
          throw new Error('El formato del email no es válido.');
        }
        throw new Error(error.message);
      }

      if (data.user) {
        // Si el usuario ya existe pero no ha confirmado el email, Supabase devuelve user sin session
        if (!data.session && data.user.identities?.length === 0) {
          throw new Error('Este email ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.');
        }

        setFeedback({ 
          isVisible: true, 
          type: 'success', 
          title: 'Registro Exitoso', 
          message: 'Tu cuenta ha sido creada. Serás redirigido al login para acceder.' 
        });
        
        setTimeout(() => {
          router.push('/login');
        }, 2500);
      }
    } catch (err: any) {
      setFeedback({ 
        isVisible: true, 
        type: 'error', 
        title: 'Fallo de Registro', 
        message: err.message || 'Error desconocido' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-neon-purple/5 rounded-full blur-[180px] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-0 pb-32 space-y-20">
        <motion.header 
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants} 
          className="relative space-y-8 pt-12"
        >
          <div className="mb-10">
            <CiszuIdBrand
              ciszuIsotype={<img src={resolveAssetPath('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg')} alt="Ciszu ID" width={36} height={36} />}
              appIsotype={<img src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')} alt="MuzicMania" width={36} height={36} />}
              ciszuHref="https://ciszunetwork.vercel.app"
              appHref="/"
              title="CISZU ID"
              subtitle="Crea tu cuenta en MuzicMania con CISZU ID"
            />
          </div>
        </motion.header>

        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants}
          className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-start"
        >
          <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-neon-pink rounded-[3rem] blur opacity-20 transition duration-500" />
          <div className="relative p-6 md:p-10 bg-doc-dark border border-white/10 rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Nombre de Usuario" name="username" icon={I.user} placeholder="CapaSinNombre" maxLength={20} required value={form.username} error={errors.username} onChange={handleChange} onBlur={() => validateField('username', form.username)} />
                <InputField label="Nombre a Mostrar" name="displayName" icon={I.badge} placeholder="Capa Heroica" maxLength={30} required value={form.displayName} error={errors.displayName} onChange={handleChange} onBlur={() => validateField('displayName', form.displayName)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Dirección Email" name="email" icon={I.mail} type="email" placeholder="tu@email.com" required value={form.email} error={errors.email} onChange={handleChange} onBlur={() => validateField('email', form.email)} />
                <InputField label="Fecha de Nacimiento" name="birthDate" icon={I.calendar} type="date" required value={form.birthDate} error={errors.birthDate} onChange={handleChange} onBlur={() => validateField('birthDate', form.birthDate)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 relative">
                  <InputField label="Contraseña" name="password" icon={I.lock} type="password" placeholder="••••••••" required value={form.password} error={errors.password} onChange={handleChange} onBlur={() => validateField('password', form.password)} />
                  {/* Password Strength Bar */}
                  {form.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div key={level} className={`h-full flex-1 transition-all duration-500 ${passwordStrength.score >= level ? passwordStrength.color : 'bg-transparent'}`} />
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-gray-500">Seguridad:</span>
                        <span className={passwordStrength.color.replace('bg-', 'text-')}>{passwordStrength.text}</span>
                      </div>
                    </div>
                  )}
                </div>
                <InputField label="Confirmar Contraseña" name="confirmPassword" icon={I.lock} type="password" placeholder="••••••••" required value={form.confirmPassword} error={errors.confirmPassword} onChange={handleChange} onBlur={() => validateField('confirmPassword', form.confirmPassword)} />
              </div>

              {/* Extras Opcionales Toggle */}
              <div className="pt-2">
                <button type="button" onClick={() => setShowOptional(!showOptional)} className="flex items-center gap-2 text-neon-cyan hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                  <div className={`w-3 h-3 transition-transform ${showOptional ? 'rotate-90' : ''}`}>{I.globe}</div>
                  {showOptional ? 'Ocultar Datos Opcionales' : 'Completar Datos Opcionales (Recomendado)'}
                </button>
              </div>

              <AnimatePresence>
                {showOptional && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }} 
                    exit={{ height: 0, opacity: 0, overflow: 'hidden' }} 
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 mt-2">
                      <InputField label="Nombres Reales" name="realName" icon={I.user} placeholder="John" isOptional value={form.realName} error={errors.realName} onChange={handleChange} onBlur={() => validateField('realName', form.realName)} />
                      <InputField label="Apellidos Reales" name="realLastName" icon={I.user} placeholder="Doe" isOptional value={form.realLastName} error={errors.realLastName} onChange={handleChange} onBlur={() => validateField('realLastName', form.realLastName)} />
                      <InputField label="Nacionalidad" name="nationality" icon={I.globe} type="select" placeholder="Selecciona tu país" isOptional value={form.nationality} error={errors.nationality} onChange={handleChange} onBlur={() => validateField('nationality', form.nationality)} />
                      <InputField label="Número Teléfono (Para 2FA)" name="phone" icon={I.phone} type="tel" placeholder="+1 234 567 8900" isOptional value={form.phone} error={errors.phone} onChange={handleChange} onBlur={() => validateField('phone', form.phone)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4">
                <label className="flex items-start gap-3 cursor-pointer group/chk">
                  <div className="relative flex items-center justify-center shrink-0 w-5 h-5 mt-0.5">
                    <input 
                      type="checkbox" 
                      name="acceptedTerms"
                      checked={form.acceptedTerms}
                      onChange={handleChange}
                      required
                      className="peer appearance-none w-full h-full border-2 border-white/20 rounded bg-black/50 checked:bg-neon-purple checked:border-neon-purple transition-all"
                    />
                    <svg viewBox="0 0 24 24" className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                    Acepto los <Link href="/terms" className="text-neon-cyan hover:underline">Términos de Servicio</Link>, la Política de Privacidad y consiento el uso de <span className="text-white">Cookies</span> obligatorias.
                  </p>
                </label>
              </div>

              <div className="pt-2 flex flex-col items-center gap-2">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  theme="dark"
                  onChange={(val: string | null) => {
                    setForm(prev => ({ ...prev, captchaToken: val }));
                    setErrors(prev => ({ ...prev, captcha: '' }));
                  }}
                  onExpired={() => {
                    setForm(prev => ({ ...prev, captchaToken: null }));
                  }}
                />
                {errors.captcha && <span className="text-red-500 text-[10px] font-bold">{errors.captcha}</span>}
              </div>

              <div className="pt-4">
                <Button type="submit" variant="neon" fullWidth size="lg" className="!bg-neon-purple shadow-neon-purple hover:scale-[1.02] active:scale-[0.98] transition-all">
                  ALTA DE USUARIO
                </Button>
              </div>
            </form>

            <SharedOAuthProviders
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
            <div className="absolute inset-y-2 left-0 w-px bg-gradient-to-b from-neon-purple/50 via-white/10 to-neon-pink/50" />
            <div className="absolute inset-y-2 -left-1.5 w-3 rounded-full opacity-50 bg-gradient-to-b from-neon-purple to-neon-pink blur-[1px]" />
          </div>

          {/* Página derecha: beneficios */}
          <AuthBenefitsPanel
            badge="CISZU ID"
            title="¿Por qué crear tu cuenta?"
            items={REGISTER_BENEFITS}
            footerNote={REGISTER_FOOTER}
            accent="#a855f7"
            accentAlt="#f472b6"
          />
        </motion.section>

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
