'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { getGuestName } from '@/lib/guest';
import {
  applyFontSize,
  applyMuted,
  getPreferences,
  updatePreferences,
  pushPreferencesToProfile,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_STEP,
  type PreferenceLang,
} from '@/lib/preferences';
import { supabase } from '@/config/supabase';
import { I } from '@/config/navigation';

export const GuestIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c.8-3.2 3.6-5 7.5-5s6.7 1.8 7.5 5" />
    <circle cx="12" cy="8" r="7.5" strokeDasharray="2 2" opacity="0.45" />
  </svg>
);

const MoonIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="currentColor" strokeWidth={1}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round" />
  </svg>
);

const VolumeMuteIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
    <path d="m14 9 6 6M20 9l-6 6" strokeLinecap="round" />
  </svg>
);

const VolumeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" strokeLinecap="round" />
  </svg>
);

const HELP_LINKS = [
  { name: 'FAQ', href: '/faq', icon: I.faq },
  { name: 'Support', href: '/support', icon: I.support },
  { name: 'Contact', href: '/contact', icon: I.contact },
  { name: 'Feedback', href: '/feedback', icon: I.feedback },
];

export default function AuthMenu({ onClose }: { onClose: () => void }) {
  const { user, theme, setTheme, language, setLanguage } = useAppStore();
  const [guestName] = useState(() => getGuestName());
  const [prefs, setPrefs] = useState(() => getPreferences());

  const setThemeSafe = (t: 'dark' | 'light') => setTheme(t);
  const setLangSafe = (l: PreferenceLang) => setLanguage(l);

  const changeZoom = (delta: number) => {
    const next = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, prefs.fontSize + delta));
    const updated = updatePreferences({ fontSize: next });
    setPrefs(updated);
    applyFontSize(next);
    if (user) pushPreferencesToProfile(user.id);
  };

  const toggleMuted = () => {
    const next = !prefs.muted;
    const updated = updatePreferences({ muted: next });
    setPrefs(updated);
    applyMuted(next);
    if (user) pushPreferencesToProfile(user.id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <div className="bg-[#070712]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-fade-in-down origin-top max-h-[80vh] overflow-y-auto">
      {/* Header de sesión */}
      <div className={`px-4 py-3 border-b border-white/10 flex items-center gap-3 ${
        user ? 'bg-gradient-to-br from-neon-blue/25 via-[#6600ff]/15 to-neon-pink/15'
             : 'bg-gradient-to-br from-white/5 to-white/[0.02]'
      }`}>
        {user ? (
          <>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-neon-blue/60 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-pink flex items-center justify-center text-white shadow-[0_0_15px_rgba(61,106,223,0.5)] shrink-0">
                <span className="font-header font-black text-lg">{user.display_name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-header font-bold text-sm truncate">{user.display_name}</p>
              <p className="text-gray-400 text-[11px] truncate">@{user.username}</p>
              <p className="text-gray-500 text-[10px] truncate">{user.email}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-gray-300 shrink-0">
              <GuestIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-header font-bold text-sm truncate">{guestName}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Sesión de invitado</p>
            </div>
          </>
        )}
      </div>

      {/* Acciones de sesión */}
      <div className="p-3 border-b border-white/10 space-y-2">
        {user ? (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-neon-pink/25 to-neon-pink/10 hover:from-neon-pink/40 border border-neon-pink/30 text-neon-pink hover:text-white rounded-xl font-header font-bold text-sm transition-all active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-neon-blue/25 to-neon-blue/10 hover:from-neon-blue/45 border border-neon-blue/30 text-neon-blue hover:text-white rounded-xl font-header font-bold text-sm transition-all active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-neon-pink/25 to-neon-pink/10 hover:from-neon-pink/40 border border-neon-pink/30 text-neon-pink hover:text-white rounded-xl font-header font-bold text-sm transition-all active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Registrarse
            </Link>
          </>
        )}
      </div>

      {/* Preferencias */}
      <div className="p-3 space-y-4">
        <p className="px-1 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
          Preferencias
        </p>

        {/* Idioma */}
        <div className="px-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="text-neon-blue">{I.globe}</span> Idioma
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(['ES', 'EN'] as PreferenceLang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLangSafe(l)}
                className={`py-1.5 rounded-lg border font-header font-bold text-xs transition-all active:scale-95 ${
                  language === l
                    ? 'border-neon-blue bg-neon-blue/20 text-neon-blue shadow-[0_0_10px_rgba(61,106,223,0.3)]'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/25'
                }`}
              >
                {l === 'ES' ? 'Español' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Tema */}
        <div className="px-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className={theme === 'dark' ? 'text-neon-blue' : 'text-yellow-400'}>{theme === 'dark' ? <MoonIcon /> : <SunIcon />}</span>
            Tema
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setThemeSafe('dark')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border font-header font-bold text-xs transition-all active:scale-95 ${
                theme === 'dark'
                  ? 'border-neon-blue bg-neon-blue/20 text-neon-blue shadow-[0_0_10px_rgba(61,106,223,0.3)]'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/25'
              }`}
            >
              <MoonIcon /> Oscuro
            </button>
            <button
              onClick={() => setThemeSafe('light')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border font-header font-bold text-xs transition-all active:scale-95 ${
                theme === 'light'
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.3)]'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/25'
              }`}
            >
              <SunIcon /> Claro
            </button>
          </div>
        </div>

        {/* Zoom */}
        <div className="px-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            Zoom
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => changeZoom(-FONT_SIZE_STEP)}
              disabled={prefs.fontSize <= FONT_SIZE_MIN}
              className="flex-1 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:border-white/25 font-header font-bold text-sm transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              Zoom -
            </button>
            <span className="w-16 text-center text-xs font-header font-black text-neon-cyan tabular-nums">
              {prefs.fontSize}%
            </span>
            <button
              onClick={() => changeZoom(FONT_SIZE_STEP)}
              disabled={prefs.fontSize >= FONT_SIZE_MAX}
              className="flex-1 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:border-white/25 font-header font-bold text-sm transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              Zoom +
            </button>
          </div>
        </div>

        {/* Silenciar pestaña */}
        <div className="px-1">
          <button
            onClick={toggleMuted}
            className={`w-full flex items-center justify-between gap-2 py-2 px-3 rounded-lg border font-header font-bold text-xs transition-all active:scale-95 ${
              prefs.muted
                ? 'border-neon-pink bg-neon-pink/15 text-neon-pink shadow-[0_0_10px_rgba(255,51,204,0.25)]'
                : 'border-white/10 bg-white/5 text-gray-300 hover:text-white hover:border-white/25'
            }`}
          >
            <span className="flex items-center gap-2">
              {prefs.muted ? <VolumeMuteIcon /> : <VolumeIcon />}
              Silenciar pestaña
            </span>
            <span className={`w-8 h-[18px] rounded-full relative transition-colors ${prefs.muted ? 'bg-neon-pink' : 'bg-white/15'}`}>
              <span className={`absolute top-0.5 w-[14px] h-[14px] rounded-full bg-white transition-all ${prefs.muted ? 'left-[18px]' : 'left-0.5'}`} />
            </span>
          </button>
        </div>

        {/* Ayuda */}
        <div className="px-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="text-neon-pink">{I.help}</span> Ayuda
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {HELP_LINKS.map((l) => (
              <Link
                key={l.name}
                href={l.href}
                onClick={onClose}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-neon-blue hover:border-neon-blue/40 font-header font-bold text-[11px] transition-all active:scale-95"
              >
                <span className="opacity-70 shrink-0">{l.icon}</span>
                {l.name}
              </Link>
            ))}
          </div>
        </div>

        <p className="px-1 text-[9px] text-gray-600 font-bold text-center">
          Preferencias guardadas en este dispositivo{user ? ' y sincronizadas a tu perfil' : ''}.
        </p>
      </div>
    </div>
  );
}