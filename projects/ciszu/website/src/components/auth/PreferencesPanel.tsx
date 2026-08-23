'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { LanguagesModal } from '@ciszu/ui';
import {
  loadPreferences,
  updatePreferences,
  applyZoom,
  setMuteTab,
  syncPreferencesToProfile,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
} from '@/lib/preferences';

const LANGS = [
  {
    code: 'es-latam',
    label: 'Español (Latam)',
    flag: (
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
    ),
  },
  {
    code: 'es-es',
    label: 'Español (España)',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#ad1519"/><rect width="512" height="300" y="106" fill="#fabd00"/><circle cx="150" cy="256" r="50" fill="#ad1519"/></svg>,
  },
  {
    code: 'en-us',
    label: 'English (US)',
    flag: (
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
    ),
  },
  {
    code: 'en-uk',
    label: 'English (UK)',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#012169"/><path d="M0 0l512 512M512 0L0 512" stroke="#fff" strokeWidth="60"/><path d="M0 0l512 512M512 0L0 512" stroke="#cf142b" strokeWidth="30"/><rect width="512" height="100" y="206" fill="#fff"/><rect width="100" height="512" x="206" fill="#fff"/><rect width="512" height="60" y="226" fill="#cf142b"/><rect width="60" height="512" x="226" fill="#cf142b"/></svg>,
  },
  {
    code: 'pt',
    label: 'Português (Brasil)',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#009c3b"/><path d="M256 70l186 186-186 186L70 256z" fill="#ffdf00"/><circle cx="256" cy="256" r="100" fill="#002776"/></svg>,
  },
  {
    code: 'fr',
    label: 'Français',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#002395"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ed2939"/></svg>,
  },
  {
    code: 'it',
    label: 'Italiano',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#009246"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ce2b37"/></svg>,
  },
  {
    code: 'de',
    label: 'Deutsch',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#000"/><rect width="512" height="170" y="171" fill="#d00"/><rect width="512" height="171" y="341" fill="#ffce00"/></svg>,
  },
  {
    code: 'ru',
    label: 'Русский',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#fff"/><rect width="512" height="170" y="171" fill="#0039a6"/><rect width="512" height="171" y="341" fill="#d52b1e"/></svg>,
  },
  {
    code: 'ja',
    label: '日本語 (Japanese)',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="120" fill="#bc002d"/></svg>,
  },
  {
    code: 'ko',
    label: '한국어 (Korean)',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="80" fill="#cd2e3a"/><path d="M256 176a80 80 0 0 0 0 160c44 0 44-80 80-80s36 80 80 80" fill="#0047a0"/></svg>,
  },
];

const AVAILABLE_LANGS = ['es-latam', 'es-es', 'en-us', 'en-uk'];

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

const HELP_LINKS = [
  { href: '/support', label: 'Centro de Soporte', icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ) },
  { href: '/faq', label: 'Preguntas Frecuentes', icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ) },
  { href: '/contact', label: 'Contacto', icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  ) },
  { href: '/guidelines', label: 'Guías', icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  ) },
];

export default function PreferencesPanel() {
  const { theme, setTheme, language, setLanguage, zoom, setZoom, tabMuted, setTabMuted, user, showToast } = useAppStore();
  const [langOpen, setLangOpen] = useState(false);

  // Aplicar preferencias persistidas al montar (cajita, fuera del evento de click).
  useEffect(() => {
    const prefs = loadPreferences();
    applyZoom(prefs.zoom);
    setMuteTab(prefs.tabMuted);
  }, []);

  const syncToProfile = () => {
    if (!user) return;
    syncPreferencesToProfile(user.id, loadPreferences());
  };

  const applyLanguage = (lang: 'es' | 'en') => {
    setLanguage(lang);
    updatePreferences({ lang });
    showToast(lang === 'es' ? 'Idioma: Español' : 'Language: English');
    syncToProfile();
  };

  const handleLangSelect = (code: string) => {
    if (code === 'es-latam' || code === 'es-es') return applyLanguage('es');
    if (code === 'en-us' || code === 'en-uk') return applyLanguage('en');
    showToast('Esta función no está desarrollada para la beta aún');
  };

  const currentLang = LANGS.find((l) =>
    language === 'es'
      ? l.code === 'es-latam'
      : l.code === 'en-us',
  ) ?? LANGS[0];

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    updatePreferences({ theme: next });
    showToast(next === 'dark' ? 'Modo oscuro activado' : 'Modo claro activado');
    syncToProfile();
  };

  const changeZoom = (delta: number) => {
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + delta));
    setZoom(next);
    applyZoom(next);
    updatePreferences({ zoom: next });
    syncToProfile();
  };

  const toggleMuteTab = () => {
    const next = !tabMuted;
    setTabMuted(next);
    setMuteTab(next);
    updatePreferences({ tabMuted: next });
    showToast(next ? 'Pestaña silenciada' : 'Pestaña restaurada');
    syncToProfile();
  };

  const sectionTitleCls = 'text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2';

  return (
    <div className="px-2 pt-1 pb-2 space-y-4">
      {/* Tema e idioma: mismos controles que el navbar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={toggleTheme}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
            theme === 'dark' ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
          }`}
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5 text-black transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth={1}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <button
          onClick={() => setLangOpen(true)}
          className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer active:scale-95 group ${
            theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:border-brand-light/50' : 'bg-black/5 border-black/10 text-black hover:border-brand-light'
          }`}
          title="Cambiar idioma"
        >
          <span className="flex items-center gap-2 text-xs font-header font-bold uppercase tracking-widest">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Idioma
          </span>
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full overflow-hidden shadow-inner border border-white/10">{currentLang.flag}</span>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-brand-light" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </div>

      {/* Zoom (barra con botones −/+ en extremos; inicia en 100%) */}
      <div>
        <p className={sectionTitleCls}>Zoom</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={zoom <= ZOOM_MIN}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:border-brand-light/50 hover:text-brand-light transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Quitar zoom"
            aria-label="Quitar zoom"
          >
            <IcoZoomMinus />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-light to-brand-accent transition-all duration-200"
                style={{ width: `${((zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100}%` }}
              />
            </div>
            <span className="w-12 text-center text-xs font-header font-black text-brand-light tabular-nums shrink-0">{zoom}%</span>
          </div>
          <button
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={zoom >= ZOOM_MAX}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:border-brand-light/50 hover:text-brand-light transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Sumar zoom"
            aria-label="Sumar zoom"
          >
            <IcoZoomPlus />
          </button>
        </div>
      </div>

      {/* Silenciar pestaña */}
      <button
        onClick={toggleMuteTab}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all active:scale-95 ${
          tabMuted
            ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
            : 'bg-white/5 border-white/10 text-white/80 hover:border-brand-light/50 hover:text-brand-light'
        }`}
        title="Silenciar pestaña"
      >
        <span className="flex items-center gap-2 font-header font-bold text-xs uppercase tracking-widest">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {tabMuted ? (
              <g>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </g>
            ) : (
              <g>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </g>
            )}
          </svg>
          Silenciar pestaña
        </span>
        <span className={`w-9 h-5 rounded-full relative transition-colors ${tabMuted ? 'bg-red-500/70' : 'bg-white/15'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${tabMuted ? 'left-4' : 'left-0.5'}`} />
        </span>
      </button>

      {/* Ayuda */}
      <div>
        <p className={sectionTitleCls}>Ayuda</p>
        <div className="grid grid-cols-1 gap-1">
          {HELP_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-header font-bold text-gray-400 hover:text-brand-light hover:bg-white/5 transition-all"
            >
              <span className="text-brand-light/70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {user && (
        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center">
          Preferencias sincronizadas con tu cuenta
        </p>
      )}

      <LanguagesModal
        open={langOpen}
        title="Seleccionar idioma"
        current={language}
        onSelect={handleLangSelect}
        onClose={() => setLangOpen(false)}
        langs={LANGS.map((l) => ({
          ...l,
          available: AVAILABLE_LANGS.includes(l.code),
          active:
            language === 'es'
              ? l.code === 'es-latam' || l.code === 'es-es'
              : l.code === 'en-us' || l.code === 'en-uk',
        }))}
      />
    </div>
  );
}