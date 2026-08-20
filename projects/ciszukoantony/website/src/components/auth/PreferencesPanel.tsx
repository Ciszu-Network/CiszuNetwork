'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
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
import { I } from '@/config/navigation';

const MoonIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
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

const FlagES = () => (
  <svg viewBox="0 0 512 512" className="w-4 h-4 rounded-full overflow-hidden">
    <rect width="512" height="512" fill="#ad1519" />
    <rect width="512" height="300" y="106" fill="#fabd00" />
    <circle cx="150" cy="256" r="50" fill="#ad1519" />
  </svg>
);

const FlagEN = () => (
  <svg viewBox="0 0 512 512" className="w-4 h-4 rounded-full overflow-hidden">
    <rect width="512" height="512" fill="#012169" />
    <path d="M0 0l512 512M512 0L0 512" stroke="#fff" strokeWidth="60" />
    <path d="M0 0l512 512M512 0L0 512" stroke="#cf142b" strokeWidth="30" />
    <rect width="512" height="100" y="206" fill="#fff" />
    <rect width="100" height="512" x="206" fill="#fff" />
    <rect width="512" height="60" y="226" fill="#cf142b" />
    <rect width="60" height="512" x="226" fill="#cf142b" />
  </svg>
);

const HELP_LINKS = [
  { name: 'FAQ', href: '/faq', icon: I.faq },
  { name: 'Support', href: '/support', icon: I.support },
  { name: 'Contact', href: '/contact', icon: I.contact },
  { name: 'Feedback', href: '/feedback', icon: I.feedback },
];

/**
 * Panel de preferencias locales (LOGIN_REGISTER_PROTOCOLS §4). Vive dentro del
 * modal centrado PreferencesModal. Los controles de tema e idioma coinciden con
 * los del menú hamburguesa/footer de la web.
 */
export default function PreferencesPanel() {
  const { user, theme, setTheme, language, setLanguage } = useAppStore();
  const [prefs, setPrefs] = useState(() => getPreferences());

  const syncToProfile = () => {
    if (user) pushPreferencesToProfile(user.id);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    updatePreferences({ theme: next });
    syncToProfile();
  };

  const setLangSafe = (l: PreferenceLang) => {
    setLanguage(l);
    updatePreferences({ lang: l });
    syncToProfile();
  };

  const changeZoom = (delta: number) => {
    const next = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, prefs.fontSize + delta));
    const updated = updatePreferences({ fontSize: next });
    setPrefs(updated);
    applyFontSize(next);
    syncToProfile();
  };

  const toggleMuted = () => {
    const next = !prefs.muted;
    const updated = updatePreferences({ muted: next });
    setPrefs(updated);
    applyMuted(next);
    syncToProfile();
  };

  const sectionTitleCls = 'text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2';

  const langBtnCls = (active: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg border font-header font-bold text-xs transition-all active:scale-95 ${
      active
        ? 'border-neon-blue bg-neon-blue/15 text-neon-blue shadow-[0_0_10px_rgba(61,106,223,0.3)]'
        : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/25'
    }`;

  return (
    <div className="space-y-4">
      {/* Tema e idioma: mismos controles que el menú hamburguesa/footer */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={toggleTheme}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
            theme === 'dark' ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
          }`}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? (
            <SunIcon className="w-5 h-5 text-black transition-transform duration-500 group-hover:rotate-90" />
          ) : (
            <MoonIcon className="w-5 h-5 text-black transition-transform duration-500 group-hover:-rotate-12" />
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <button onClick={() => setLangSafe('ES')} className={langBtnCls(language === 'ES')} title="Español">
            <FlagES /> ES
          </button>
          <button onClick={() => setLangSafe('EN')} className={langBtnCls(language === 'EN')} title="English">
            <FlagEN /> EN
          </button>
        </div>
      </div>

      {/* Zoom */}
      <div>
        <p className={`${sectionTitleCls} flex items-center gap-1.5 text-neon-cyan`}>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          Zoom
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeZoom(-FONT_SIZE_STEP)}
            disabled={prefs.fontSize <= FONT_SIZE_MIN}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-neon-blue/50 font-header font-bold text-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Disminuir zoom"
          >
            Zoom −
          </button>
          <span className="w-16 text-center text-xs font-header font-black text-neon-cyan tabular-nums">
            {prefs.fontSize}%
          </span>
          <button
            onClick={() => changeZoom(FONT_SIZE_STEP)}
            disabled={prefs.fontSize >= FONT_SIZE_MAX}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-neon-blue/50 font-header font-bold text-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Aumentar zoom"
          >
            Zoom +
          </button>
        </div>
      </div>

      {/* Silenciar pestaña */}
      <button
        onClick={toggleMuted}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all active:scale-95 ${
          prefs.muted
            ? 'border-neon-pink bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20'
            : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-neon-pink/40'
        }`}
        title="Silenciar pestaña"
      >
        <span className="flex items-center gap-2 font-header font-bold text-xs uppercase tracking-widest">
          {prefs.muted ? <VolumeMuteIcon /> : <VolumeIcon />}
          Silenciar pestaña
        </span>
        <span className={`w-9 h-5 rounded-full relative transition-colors ${prefs.muted ? 'bg-neon-pink' : 'bg-white/15'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${prefs.muted ? 'left-4' : 'left-0.5'}`} />
        </span>
      </button>

      {/* Ayuda */}
      <div>
        <p className={`${sectionTitleCls} flex items-center gap-1.5 text-neon-pink`}>
          <span>{I.help}</span> Ayuda
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {HELP_LINKS.map((l) => (
            <Link
              key={l.name}
              href={l.href}
              className="flex items-center gap-2 py-2 px-3 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-neon-blue hover:border-neon-blue/40 font-header font-bold text-[11px] transition-all active:scale-95"
            >
              <span className="opacity-70 shrink-0">{l.icon}</span>
              {l.name}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-gray-600 font-bold text-center">
        Preferencias guardadas en este dispositivo{user ? ' y sincronizadas a tu perfil' : ''}.
      </p>
    </div>
  );
}