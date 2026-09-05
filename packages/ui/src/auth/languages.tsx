'use client';

/* ------------------------------------------------------------------ *
 * languages.tsx — lista CANÓNICA de idiomas compartida entre las 4 webs.
 *
 * Los 4 idiomas de producción son INDIVIDUALES entre sí (nunca se juntan):
 *   es-latam (Español Latam), es-es (Español España),
 *   en-us (English US),      en-uk (English UK).
 * El resto (pt, fr, it, de, ru, ja, ko) están bloqueados: se muestran
 * atenuados y al hacer click la web avisa con toast de error (rojo).
 * ------------------------------------------------------------------ */

import type { ReactNode } from 'react';

export type LangCode =
  | 'es-latam'
  | 'es-es'
  | 'en-us'
  | 'en-uk'
  | 'pt'
  | 'fr'
  | 'it'
  | 'de'
  | 'ru'
  | 'ja'
  | 'ko';

export interface LanguageOption {
  code: string;
  label: string;
  flag: ReactNode;
  available: boolean;
}

/** Idiomas terminados/desbloqueados. El resto están bloqueados. */
export const AVAILABLE_LANG_CODES: string[] = ['es-latam', 'es-es', 'en-us', 'en-uk'];

export function isLangAvailable(code: string): boolean {
  return AVAILABLE_LANG_CODES.includes(code);
}

export function getLangLabel(code: string): string {
  return LANGUAGE_OPTIONS.find((l) => l.code === code)?.label ?? code;
}

const FlagLatam = () => (
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
);

const FlagES = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#ad1519"/><rect width="512" height="300" y="106" fill="#fabd00"/><circle cx="150" cy="256" r="50" fill="#ad1519"/></svg>
);

const FlagUS = () => (
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
);

const FlagUK = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#012169"/><path d="M0 0l512 512M512 0L0 512" stroke="#fff" strokeWidth="60"/><path d="M0 0l512 512M512 0L0 512" stroke="#cf142b" strokeWidth="30"/><rect width="512" height="100" y="206" fill="#fff"/><rect width="100" height="512" x="206" fill="#fff"/><rect width="512" height="60" y="226" fill="#cf142b"/><rect width="60" height="512" x="226" fill="#cf142b"/></svg>
);

const FlagPT = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#009c3b"/><path d="M256 70l186 186-186 186L70 256z" fill="#ffdf00"/><circle cx="256" cy="256" r="100" fill="#002776"/></svg>
);

const FlagFR = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#002395"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ed2939"/></svg>
);

const FlagIT = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#009246"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ce2b37"/></svg>
);

const FlagDE = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#000"/><rect width="512" height="170" y="171" fill="#d00"/><rect width="512" height="171" y="341" fill="#ffce00"/></svg>
);

const FlagRU = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#fff"/><rect width="512" height="170" y="171" fill="#0039a6"/><rect width="512" height="171" y="341" fill="#d52b1e"/></svg>
);

const FlagJA = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="120" fill="#bc002d"/></svg>
);

const FlagKO = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="80" fill="#cd2e3a"/><path d="M256 176a80 80 0 0 0 0 160c44 0 44-80 80-80s36 80 80 80" fill="#0047a0"/></svg>
);

/** Lista completa: 4 idiomas disponibles + 7 bloqueados (atenuados). */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'es-latam', label: 'Español (Latam)', flag: <FlagLatam />, available: true },
  { code: 'es-es', label: 'Español (España)', flag: <FlagES />, available: true },
  { code: 'en-us', label: 'English (US)', flag: <FlagUS />, available: true },
  { code: 'en-uk', label: 'English (UK)', flag: <FlagUK />, available: true },
  { code: 'pt', label: 'Português (Brasil)', flag: <FlagPT />, available: false },
  { code: 'fr', label: 'Français', flag: <FlagFR />, available: false },
  { code: 'it', label: 'Italiano', flag: <FlagIT />, available: false },
  { code: 'de', label: 'Deutsch', flag: <FlagDE />, available: false },
  { code: 'ru', label: 'Русский', flag: <FlagRU />, available: false },
  { code: 'ja', label: '日本語 (Japanese)', flag: <FlagJA />, available: false },
  { code: 'ko', label: '한국어 (Korean)', flag: <FlagKO />, available: false },
];

/** Mensaje de error estándar para idiomas bloqueados (toast rojo). */
export const LANG_BLOCKED_MESSAGE = 'Este idioma aún no está disponible';

export default LANGUAGE_OPTIONS;