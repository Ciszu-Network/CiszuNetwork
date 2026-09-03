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
import { LanguagesModal } from '@ciszu/ui';

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

const IcoZoomMinus = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const IcoZoomPlus = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
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

const LANGS_DISPLAY = [
  { code: 'ES-LA', label: 'Español (Latam)', flag: (
    <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner">
      <rect width="512" height="170.6" fill="#ffcc00"/>
      <rect width="512" height="170.6" y="170.6" fill="#003399"/>
      <rect width="512" height="170.6" y="341.2" fill="#cf142b"/>
      <g fill="#fff" transform="translate(256,230) scale(4)">
        <circle cx="0" cy="0" r="18" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2,2"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-45) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-22.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(22.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(45) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-67.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(67.5) translate(0,-18) scale(0.4)"/>
      </g>
    </svg>
  ) },
  { code: 'ES-ES', label: 'Español (España)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#ad1519"/><rect width="512" height="300" y="106" fill="#fabd00"/><circle cx="150" cy="256" r="50" fill="#ad1519"/></svg> },
  { code: 'EN-US', label: 'English (US)', flag: (
    <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner font-sans">
      <rect width="512" height="512" fill="#bd3d44"/>
      <rect width="512" height="36" y="36.5" fill="#fff"/><rect width="512" height="36" y="109.5" fill="#fff"/><rect width="512" height="36" y="182.5" fill="#fff"/><rect width="512" height="36" y="255.5" fill="#fff"/><rect width="512" height="36" y="328.5" fill="#fff"/><rect width="512" height="36" y="401.5" fill="#fff"/><rect width="512" height="36" y="474.5" fill="#fff"/>
      <rect width="240" height="260" fill="#192f5d"/>
      <g fill="#fff">
        <circle cx="30" cy="35" r="5"/><circle cx="70" cy="35" r="5"/><circle cx="110" cy="35" r="5"/><circle cx="150" cy="35" r="5"/><circle cx="190" cy="35" r="5"/>
        <circle cx="50" cy="65" r="5"/><circle cx="90" cy="65" r="5"/><circle cx="130" cy="65" r="5"/><circle cx="170" cy="65" r="5"/><circle cx="210" cy="65" r="5"/>
        <circle cx="30" cy="95" r="5"/><circle cx="70" cy="95" r="5"/><circle cx="110" cy="95" r="5"/><circle cx="150" cy="95" r="5"/><circle cx="190" cy="95" r="5"/>
        <circle cx="50" cy="125" r="5"/><circle cx="90" cy="125" r="5"/><circle cx="130" cy="125" r="5"/><circle cx="170" cy="125" r="5"/><circle cx="210" cy="125" r="5"/>
        <circle cx="30" cy="155" r="5"/><circle cx="70" cy="155" r="5"/><circle cx="110" cy="155" r="5"/><circle cx="150" cy="155" r="5"/><circle cx="190" cy="155" r="5"/>
      </g>
    </svg>
  ) },
  { code: 'EN-UK', label: 'English (UK)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#012169"/><path d="M0 0l512 512M512 0L0 512" stroke="#fff" strokeWidth="60"/><path d="M0 0l512 512M512 0L0 512" stroke="#cf142b" strokeWidth="30"/><rect width="512" height="100" y="206" fill="#fff"/><rect width="100" height="512" x="206" fill="#fff"/><rect width="512" height="60" y="226" fill="#cf142b"/><rect width="60" height="512" x="226" fill="#cf142b"/></svg> },
  { code: 'PT', label: 'Português (Brasil)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#009c3b"/><path d="M256 70l186 186-186 186L70 256z" fill="#ffdf00"/><circle cx="256" cy="256" r="100" fill="#002776"/></svg> },
  { code: 'FR', label: 'Français', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#002395"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ed2939"/></svg> },
  { code: 'IT', label: 'Italiano', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#009246"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ce2b37"/></svg> },
  { code: 'DE', label: 'Deutsch', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#000"/><rect width="512" height="170" y="171" fill="#d00"/><rect width="512" height="171" y="341" fill="#ffce00"/></svg> },
  { code: 'RU', label: 'Русский', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#fff"/><rect width="512" height="170" y="171" fill="#0039a6"/><rect width="512" height="171" y="341" fill="#d52b1e"/></svg> },
  { code: 'JA', label: '日本語 (Japanese)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="120" fill="#bc002d"/></svg> },
  { code: 'KO', label: '한국어 (Korean)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="80" fill="#cd2e3a"/><path d="M256 176a80 80 0 0 0 0 160c44 0 44-80 80-80s36 80 80 80" fill="#0047a0"/></svg> },
];

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
  const [langOpen, setLangOpen] = useState(false);

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
    setPrefs(updatePreferences({ lang: l }));
    syncToProfile();
  };

  const handleLangSelect = (code: string) => {
    if (code === 'EN-US' || code === 'EN-UK') { setLangSafe('EN'); return; }
    if (code === 'ES-LA' || code === 'ES-ES') { setLangSafe('ES'); return; }
  };

  const currentLang = LANGS_DISPLAY.find((l) =>
    language === 'ES'
      ? l.code === 'ES-LA'
      : l.code === 'EN-US',
  ) ?? LANGS_DISPLAY[0];

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

  const toggleRedirectGuard = () => {
    const next = !prefs.redirectGuard;
    const updated = updatePreferences({ redirectGuard: next });
    setPrefs(updated);
    syncToProfile();
  };

  const toggleActivityGuard = () => {
    const next = !prefs.activityGuard;
    const updated = updatePreferences({ activityGuard: next });
    setPrefs(updated);
    syncToProfile();
  };

  const sectionTitleCls = 'text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2';

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
            <MoonIcon className="w-5 h-5 text-black transition-transform duration-500 group-hover:-rotate-12" />
          ) : (
            <SunIcon className="w-5 h-5 text-black transition-transform duration-500 group-hover:rotate-90" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setLangOpen(true)}
          className="flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-neon-cyan/50 text-gray-200 transition-all active:scale-95 text-xs font-bold font-header"
          title="Cambiar idioma"
        >
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
            Idioma
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="shrink-0">{currentLang.flag}</span>
            <span className="truncate max-w-[90px]">{currentLang.label}</span>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeZoom(-FONT_SIZE_STEP)}
            disabled={prefs.fontSize <= FONT_SIZE_MIN}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-neon-cyan/50 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            title="Quitar zoom"
            aria-label="Quitar zoom"
          >
            <IcoZoomMinus />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-blue transition-all duration-200"
                style={{ width: `${((prefs.fontSize - FONT_SIZE_MIN) / (FONT_SIZE_MAX - FONT_SIZE_MIN)) * 100}%` }}
              />
            </div>
            <span className="w-12 text-center text-xs font-header font-black text-neon-cyan tabular-nums shrink-0">
              {prefs.fontSize}%
            </span>
          </div>
          <button
            onClick={() => changeZoom(FONT_SIZE_STEP)}
            disabled={prefs.fontSize >= FONT_SIZE_MAX}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-neon-cyan/50 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            title="Sumar zoom"
            aria-label="Sumar zoom"
          >
            <IcoZoomPlus />
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

      {/* Navegación segura */}
      <div>
        <p className={sectionTitleCls}>Navegación</p>
        <button
          onClick={toggleRedirectGuard}
          className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all active:scale-95 ${
            prefs.redirectGuard
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 hover:bg-blue-500/20'
              : 'bg-white/5 border-white/10 text-white/80 hover:border-blue-400/50 hover:text-blue-300'
          }`}
          title="Aviso de redirección"
        >
          <span className="flex items-center gap-2 font-header font-bold text-xs uppercase tracking-widest">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Aviso de redirección
          </span>
          <span className={`w-9 h-5 rounded-full relative transition-colors ${prefs.redirectGuard ? 'bg-blue-500/70' : 'bg-white/15'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${prefs.redirectGuard ? 'left-4' : 'left-0.5'}`} />
          </span>
        </button>
        <button
          onClick={toggleActivityGuard}
          className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all active:scale-95 mt-2 ${
            prefs.activityGuard
              ? 'bg-red-500/10 border-red-500/40 text-red-300 hover:bg-red-500/20'
              : 'bg-white/5 border-white/10 text-white/80 hover:border-red-400/50 hover:text-red-300'
          }`}
          title="Protección de acciones no recuperables"
        >
          <span className="flex items-center gap-2 font-header font-bold text-xs uppercase tracking-widest">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            Proteger acciones
          </span>
          <span className={`w-9 h-5 rounded-full relative transition-colors ${prefs.activityGuard ? 'bg-red-500/70' : 'bg-white/15'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${prefs.activityGuard ? 'left-4' : 'left-0.5'}`} />
          </span>
        </button>
      </div>

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

      <LanguagesModal
        open={langOpen}
        title="Seleccionar idioma"
        current={language}
        onSelect={handleLangSelect}
        onClose={() => setLangOpen(false)}
        langs={LANGS_DISPLAY.map((l) => ({
          ...l,
          available: ['ES-LA', 'ES-ES', 'EN-US', 'EN-UK'].includes(l.code),
          active:
            language === 'ES'
              ? l.code === 'ES-LA' || l.code === 'ES-ES'
              : l.code === 'EN-US' || l.code === 'EN-UK',
        }))}
      />
    </div>
  );
}