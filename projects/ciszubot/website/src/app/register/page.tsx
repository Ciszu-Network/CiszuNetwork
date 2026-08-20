'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store';

const I = {
  user: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  badge: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  register: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  ),
  google: (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a7.14 7.14 0 0 1 0-4.2V7.06H2.18a11.86 11.86 0 0 0 0 10.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  ),
  microsoft: (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
      <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
      <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
    </svg>
  ),
};

interface FieldProps {
  label: string;
  name: string;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

function InputField({ label, name, icon, type = 'text', placeholder, required = false, value, onChange, autoComplete }: FieldProps) {
  return (
    <div className="space-y-1 relative">
      <div className="flex items-center gap-2 mb-1 ml-1">
        <div className="w-3 h-3 text-neon-purple">{icon}</div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full bg-card border border-border rounded-xl px-4 py-3 text-ink font-header font-bold placeholder:text-faint focus:border-[#5865F2]/60 focus:ring-2 focus:ring-[#5865F2]/20 transition-all outline-none [color-scheme:dark]"
      />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validate = (): string | null => {
    const username = form.username.trim().toLowerCase();
    if (username.length < 3 || username.length > 20) return 'El usuario debe tener entre 3 y 20 caracteres.';
    if (/\s/.test(username)) return 'El usuario no puede contener espacios.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Introduce un email válido.';
    if (form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (form.password !== form.confirm_password) return 'Las contraseñas no coinciden.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
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

      <div className="max-w-md mx-auto px-4 pt-14 relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto text-neon-purple flex items-center justify-center drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            {I.register}
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-header font-black uppercase tracking-tighter bg-gradient-to-r from-neon-purple to-[#5865F2] bg-clip-text text-transparent">
            Registro
          </h1>
          <p className="mt-2 text-neon-blue font-black tracking-[0.4em] uppercase text-[10px] md:text-xs">
            Crea tu cuenta en CiszuBot
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-[#5865F2] rounded-[2rem] blur opacity-20 transition duration-500" />
          <div className="relative p-6 md:p-8 bg-surface border border-border rounded-[2rem] shadow-2xl space-y-6 backdrop-blur-3xl">
            <a
              href="/api/auth/discord"
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#5865F2] text-white font-header font-bold text-sm hover:bg-[#4752c4] hover:-translate-y-0.5 transition-all shadow-[0_8px_22px_-8px_rgba(88,101,242,0.7)] active:scale-95"
            >
              <span className="w-5 h-5">{I.discord}</span>
              Registrarse con Discord
            </a>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[9px] font-black uppercase tracking-widest text-faint">o crea un CISZU ID</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Usuario"
                name="username"
                icon={I.user}
                type="text"
                placeholder="El nombre de tu cuenta"
                autoComplete="username"
                required
                value={form.username}
                onChange={handleChange}
              />
              <InputField
                label="Nombre a mostrar (opcional)"
                name="display_name"
                icon={I.badge}
                type="text"
                placeholder="Cómo te verán los demás"
                value={form.display_name}
                onChange={handleChange}
              />
              <InputField
                label="Email"
                name="email"
                icon={I.mail}
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Contraseña"
                  name="password"
                  icon={I.lock}
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
                <InputField
                  label="Repetir contraseña"
                  name="confirm_password"
                  icon={I.lock}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={form.confirm_password}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="text-red-400 text-[11px] font-bold px-1">{error}</p>}
              {info && <p className="text-emerald-400 text-[11px] font-bold px-1">{info}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl btn-primary font-header font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

              <p className="text-[10px] text-faint font-bold leading-relaxed px-1">
                Al registrarte aceptas los{' '}
                <Link href="/terminos" className="text-neon-blue hover:underline">Términos de Servicio</Link> y la{' '}
                <Link href="/privacidad" className="text-neon-blue hover:underline">Política de Privacidad</Link>.
              </p>
            </form>

            <div className="pt-4 border-t border-border text-center">
              <p className="text-[10px] text-faint font-bold uppercase tracking-[0.2em]">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-neon-blue hover:text-white transition-colors underline decoration-neon-blue/30 underline-offset-8">
                  Inicia sesión
                </Link>
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-center text-[9px] font-black uppercase tracking-[0.25em] text-faint mb-3">
                Opciones adicionales
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setToast('Google estará disponible en la beta soon. Usa Discord o CISZU ID por ahora.')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card text-ink text-xs font-bold hover:border-neon-blue/40 hover:text-neon-blue transition-all active:scale-95"
                >
                  <span className="w-4 h-4">{I.google}</span>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setToast('Microsoft estará disponible en la beta soon. Usa Discord o CISZU ID por ahora.')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card text-ink text-xs font-bold hover:border-neon-blue/40 hover:text-neon-blue transition-all active:scale-95"
                >
                  <span className="w-4 h-4">{I.microsoft}</span>
                  Microsoft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in-up pointer-events-none">
          <div className="bg-[#05050a]/95 border border-neon-blue/40 px-6 py-3 rounded-full shadow-[0_4px_30px_rgba(0,212,255,0.4)] backdrop-blur-md flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse shrink-0" />
            <span className="text-neon-blue font-bold uppercase tracking-widest text-[10px] sm:text-xs">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}