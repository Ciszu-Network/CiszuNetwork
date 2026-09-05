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
} from '@/lib/preferences';
import { I } from '@/config/navigation';
import { LanguagesModal, useToast, LANGUAGE_OPTIONS, isLangAvailable, LANG_BLOCKED_MESSAGE } from '@ciszu/ui';

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

const HELP_LINKS = [
  { name: 'FAQ', href: '/faq', icon: I.faq },
  { name: 'Support', href: '/support', icon: I.support },
  { name: 'Contact', href: '/contact', icon: I.contact },
  { name: 'Feedback', href: '/feedback', icon: I.feedback },
];

/**
 * Panel de preferencias locales (sistema compartido con las demás webs).
 * Idioma: LanguagesModal con los 4 idiomas INDIVIDUALES (es-latam, es-es,
 * en-us, en-uk) + bloqueados atenuados con toast rojo. Tema: mismo botón
 * sol/luna del resto de webs. Cambios de idioma/tema avisan con toast azul
 * y recargan la página (el store programa la recarga diferida).
 */
export default function PreferencesPanel() {
  const { user, theme, setTheme, language, setLanguage } = useAppStore();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState(() => getPreferences());
  const [langOpen, setLangOpen] = useState(false);

  const syncToProfile = () => {
    if (user) pushPreferencesToProfile(user.id);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: next });
    syncToProfile();
    setTheme(next);
    toast(next === 'dark' ? 'Modo oscuro activado' : 'Modo claro activado', 'info');
  };

  const handleLangSelect = (code: string) => {
    if (!isLangAvailable(code)) {
      // Idiomas bloqueados: toast de ERROR (rojo).
      toast(LANG_BLOCKED_MESSAGE, 'error');
      return;
    }
    if (code === language) return;
    // Los 4 idiomas son individuales: se guarda el código exacto.
    updatePreferences({ lang: code as never });
    setPrefs((p) => ({ ...p, lang: code as never }));
    syncToProfile();
    setLanguage(code as never);
    toast(`Idioma cambiado a ${LANGUAGE_OPTIONS.find((l) => l.code === code)?.label ?? code}`, 'info');
  };

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.code === language) ?? LANGUAGE_OPTIONS[0];
  const isDark = theme === 'dark';

  // Clases adaptadas al tema claro/oscuro.
  const surfaceBtn = isDark
    ? 'bg-white/5 border-white/10 text-white hover:border-neon-cyan/60 hover:text-neon-cyan'
    : 'bg-black/5 border-black/10 text-black hover:border-neon-cyan/80 hover:text-brand-dark';
  const sectionTitleCls = `text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-white/40' : 'text-black/50'}`;

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
    toast(next ? 'Pestaña silenciada' : 'Pestaña restaurada', 'info');
  };

  const toggleRedirectGuard = () => {
    const next = !prefs.redirectGuard;
    const updated = updatePreferences({ redirectGuard: next });
    setPrefs(updated);
    syncToProfile();
    toast(next ? 'Aviso de redirección activado' : 'Aviso de redirección desactivado', 'info');
  };

  const toggleActivityGuard = () => {
    const next = !prefs.activityGuard;
    const updated = updatePreferences({ activityGuard: next });
    setPrefs(updated);
    syncToProfile();
    toast(next ? 'Protección de acciones activada' : 'Protección de acciones desactivada', 'info');
  };

  const switchCls = (on: boolean, onTrack: string) =>
    `w-9 h-5 rounded-full relative transition-colors ${on ? onTrack : isDark ? 'bg-white/15' : 'bg-black/15'}`;

  return (
    <div className="space-y-4">
      {/* Tema e idioma: mismos controles que el menú hamburguesa/footer */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group shrink-0 ${
            isDark ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
          }`}
        >
          {isDark ? (
            <MoonIcon className="w-5 h-5 text-black transition-transform duration-500 group-hover:-rotate-12" />
          ) : (
            <SunIcon className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-90" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setLangOpen(true)}
          className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all active:scale-95 cursor-pointer text-xs font-bold font-header ${
            isDark
              ? 'bg-white/5 border-white/10 text-white hover:border-neon-cyan/60'
              : 'bg-black/5 border-black/10 text-black hover:border-neon-cyan/80'
          }`}
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
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="shrink-0 w-6 h-6 rounded-full overflow-hidden border border-white/10">{currentLang.flag}</span>
            <span className="truncate max-w-[90px] opacity-80">{currentLang.label}</span>
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
            className={`p-2 rounded-lg border transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer ${surfaceBtn}`}
            title="Quitar zoom"
            aria-label="Quitar zoom"
          >
            <IcoZoomMinus />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className={`relative flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
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
            className={`p-2 rounded-lg border transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer ${surfaceBtn}`}
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
            : surfaceBtn
        }`}
        title="Silenciar pestaña"
      >
        <span className="flex items-center gap-2 font-header font-bold text-xs uppercase tracking-widest">
          {prefs.muted ? <VolumeMuteIcon /> : <VolumeIcon />}
          Silenciar pestaña
        </span>
        <span className={switchCls(prefs.muted, 'bg-neon-pink')}>
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
              : surfaceBtn
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
          <span className={switchCls(prefs.redirectGuard, 'bg-blue-500/70')}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${prefs.redirectGuard ? 'left-4' : 'left-0.5'}`} />
          </span>
        </button>
        <button
          onClick={toggleActivityGuard}
          className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all active:scale-95 mt-2 ${
            prefs.activityGuard
              ? 'bg-red-500/10 border-red-500/40 text-red-300 hover:bg-red-500/20'
              : surfaceBtn
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
          <span className={switchCls(prefs.activityGuard, 'bg-red-500/70')}>
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
              className={`flex items-center gap-2 py-2 px-3 rounded-lg border transition-all active:scale-95 font-header font-bold text-[11px] ${
                isDark
                  ? 'border-white/10 bg-white/5 text-gray-300 hover:text-neon-blue hover:border-neon-blue/40'
                  : 'border-black/10 bg-black/5 text-gray-700 hover:text-brand-dark hover:border-neon-blue/60'
              }`}
            >
              <span className="opacity-70 shrink-0">{l.icon}</span>
              {l.name}
            </Link>
          ))}
        </div>
      </div>

      <p className={`text-[9px] font-bold text-center ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
        Preferencias guardadas en este dispositivo{user ? ' y sincronizadas a tu perfil' : ''}.
      </p>

      <LanguagesModal
        open={langOpen}
        title="Seleccionar idioma"
        current={language}
        onSelect={handleLangSelect}
        onClose={() => setLangOpen(false)}
        langs={LANGUAGE_OPTIONS.map((l) => ({
          ...l,
          available: isLangAvailable(l.code),
          active: l.code === language,
        }))}
      />
    </div>
  );
}