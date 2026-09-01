'use client';

/**
 * ADS — Sistema de anuncios de Ciszu Network (compartido para las 4 webs).
 *
 * Tipos:
 *   - intrusive  : modal CENTRAL. SOLO tras una acción específica del usuario
 *                  (actualmente: fin de partida en MuzicMania). Nunca en
 *                  navegación normal.
 *   - particulares: flotante de esquina (normal, navegación). Frecuencia larga.
 *   - reward     : modal tras acción (recompensa con espera = la mitad). Cerrar
 *                  avisa de que se pierde la recompensa.
 *   - optional   : píldora/banner inferior (normal, navegación).
 *
 * Formatos (todos con temporizador visible: barra amarilla + contador):
 *   - sponsored : patrocinado de Ciszu Network → 10s (20s si intrusivo/reward).
 *   - image     : imagen de terceros → 30s (60s si intrusivo/reward).
 *   - video     : vídeo de terceros → duración + (mitad en la 2ª reproducción;
 *                 2x si intrusivo/reward).
 *   - carousel  : hasta 4 anuncios en cadena (15s cada uno).
 *
 * Reglas:
 *   - SOLO flotantes (esquinas/inferior) en navegación normal; NUNCA centro.
 *   - Etiqueta "AD" amarilla; isotipo/logotipo real vía CDN; cierre rojo
 *     redondeado; footer con "Términos y condiciones" → sección anuncios del sitio.
 *   - Z-index bajo (z-[30]): siempre por detrás de notifs/FABs (gotoup/gotodown).
 *   - No se auto-propaga: un sitio NO anuncia su propia web (filtro por host).
 *   - Balance 25% patrocinado / 75% terceros en los pasivos.
 *   - Rotación (no repetir), intervalo MUY largo, un solo flotante a la vez.
 *   - Usuario inactivo = más propenso a recibir anuncios.
 *   - Mini "Próximo anuncio en..." para periódicos/opcionales y carruseles; los
 *     intencionales tras acción NO cuentan.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AssetResolver } from '@ciszunetwork/cdn';
import { trackEvent } from './GoogleAnalytics';

export type AdType = 'intrusive' | 'particulares' | 'reward' | 'optional';
export type AdFormat = 'sponsored' | 'image' | 'video' | 'carousel';
export type AdSource = 'ciszunetwork' | 'muzicmania' | 'ciszubot' | 'ciszukoantony' | 'ciszugamens' | 'external';

export interface AdContent {
  title: string;
  description: string;
  cta: string;
  href: string;
  accent?: string;
  /** URL del isotipo/banner real del anuncio */
  image?: string;
  /** true = hueco para anuncio REAL (aún sin creatividad): "Próximamente" */
  placeholder?: boolean;
  /** Formato: sponsored (10s) | image (30s) | video (1.5x) | carousel (max 4) */
  format?: AdFormat;
  /** Producto/web anunciado (para no auto-propagar y balance 25/75) */
  source?: AdSource;
  /** Duración base en segundos (default: video 15, image 30, sponsored 10) */
  durationSec?: number;
  /** URL del vídeo (format 'video') */
  videoSrc?: string;
  /** Items del carrusel (format 'carousel'); máximo 4 mostrados */
  carouselItems?: AdContent[];
  /** false = anuncio no-closable (no se muestra la X) */
  closable?: boolean;
}

export interface AdConfig {
  id: string;
  type: AdType;
  placement: string;
  content: AdContent;
  /** Segundos mínimos entre impresiones (periódicos/opcionales) */
  minIntervalSec?: number;
  /** reward: segundos de espera para reclamar (la mitad) */
  rewardWaitSec?: number;
}

export interface AdsProviderProps {
  /** Nombre corto de la web (ciszunetwork | ciszukoantony | muzicmania | ciszubot) */
  site: string;
  children: React.ReactNode;
  catalog?: AdConfig[];
  /** true si el usuario está autenticado (CISZU ID): menos anuncios (sin footer/opcionales). */
  authenticated?: boolean;
  /** true si el usuario es premium (suscripción futura): sin anuncios. */
  premium?: boolean;
}

interface RewardStatus { canClaim: boolean; remainingSec: number }

interface AdsContextValue {
  site: string;
  catalog: AdConfig[];
  current: AdConfig | null;
  show: (id: string) => AdConfig | null;
  trigger: (type: AdType, placement: string) => AdConfig | null;
  dismiss: () => void;
  rewardStatus: (ad: AdConfig) => RewardStatus;
  claimReward: (ad: AdConfig) => boolean;
  floatingActive: boolean;
  setFloatingActive: (v: boolean) => void;
  /** ms hasta el próximo anuncio periódico/opcional (los intencionales NO cuentan) */
  getNextPeriodicAdIn: () => number;
  /** true si el usuario lleva >60s sin interactuar (favorece anuncios) */
  isInactive: () => boolean;
}

const AdsContext = createContext<AdsContextValue | null>(null);

// ---------- Config por site ----------
const SITE_ACCENT: Record<string, string> = {
  ciszunetwork: '#3b82f6',  // azulado
  ciszukoantony: '#a855f7', // más morado
  ciszubot: '#38bdf8',      // celeste
  muzicmania: '#c026d3',    // morado-rosado
  ciszugamens: '#22d3ee',
};
const SITE_URL: Record<string, string> = {
  ciszunetwork: 'https://ciszunetwork.vercel.app',
  ciszukoantony: 'https://ciszukoantony.vercel.app',
  ciszubot: 'https://ciszubot.vercel.app',
  muzicmania: 'https://muzicmania.vercel.app',
  ciszugamens: 'https://discord.gg/W3kMtMMj6E',
};
const SITE_TERMS: Record<string, string> = {
  ciszunetwork: '/policies#anuncios',
  ciszukoantony: '/policies#anuncios',
  ciszubot: '/terminos#anuncios',
  muzicmania: '/terms#anuncios',
};

// ---------- Timing (reglas de negocio) ----------
// Intervalo entre anuncios periódicos/opcionales: 5 min mínimo / 10 min máximo.
const AD_TIMING = {
  sponsoredSec: 10,          // patrocinado de Ciszu Network
  imageSec: 30,              // imagen de terceros
  videoBaseSec: 15,          // vídeo de terceros
  carouselItemSec: 15,       // cada item de carrusel
  carouselMaxItems: 4,       // límite de carrusel
  inactiveThresholdSec: 60,  // umbral de inactividad
  sponsoredWeight: 0.25,     // 25% patrocinado / 75% terceros
  periodicMinSec: 300,       // intervalo mínimo entre periódicos/opcionales (5 min)
  periodicMaxSec: 600,       // intervalo máximo (10 min)
} as const;

function periodicInterval(): number {
  return (Math.random() * (AD_TIMING.periodicMaxSec - AD_TIMING.periodicMinSec) + AD_TIMING.periodicMinSec) * 1000;
}

// ---------- Isotipos reales vía CDN (outline gradient color; fallback not-outline; fallback color) ----------
const resolver = new AssetResolver();
const ISOTIPO: Record<Exclude<AdSource, 'external'>, string> = {
  // ciszunetwork: outline degradado zwhite (Z blanco) + ccolor (C color) — SVG
  ciszunetwork: resolver.resolve('projects/ciszu/content/logos/images/outline/isotype/gradient/color/ciszu_logo_isotipo_outline_degradado_zwhite_ccolor.svg'),
  // ciszukoantony: outline degradado zwhite (Z blanco) + ccolor (C azul) — SVG
  ciszukoantony: resolver.resolve('projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.svg'),
  // muzicmania: NO hay outline → usamos not-outline degradado color — SVG
  muzicmania: resolver.resolve('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg'),
  // ciszubot: versión CIRCLE (petición expresa) — PNG
  ciszubot: resolver.resolve('projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png'),
  // ciszugamens: isotipo real (not-outline degradado color, azul sobre blanco) — SVG
  ciszugamens: resolver.resolve('projects/ciszugamens/content/logos/images/not-outline/isotype/gradient/color/ciszugamens_logo_isotipo_degradado_outline_color_cblue_zwhite.svg'),
};

// ---------- Logotipos reales vía CDN (outline gradient color; fallback not-outline; fallback color) ----------
const LOGOTIPO: Record<Exclude<AdSource, 'external'>, string> = {
  // ciszunetwork: outline zcolor + ccolor simple — SVG
  ciszunetwork: resolver.resolve('projects/ciszu/content/logos/images/outline/logotype/gradient/color/ciszu_logotipo_outline_zcolor_ccolor_simple.svg'),
  // ciszukoantony: outline degradado color simple — PNG (no SVG en outline/logotype/gradient/color)
  ciszukoantony: resolver.resolve('projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_simple.png'),
  // muzicmania: NO hay outline → not-outline degradado color — SVG
  muzicmania: resolver.resolve('projects/muzicmania/content/logos/images/not-outline/logotype/gradient/color/muzicmania_logotipo_degradado_color.svg'),
  // ciszubot: outline color (NO hay gradient en outline) → color normal — SVG
  ciszubot: resolver.resolve('projects/ciszubot/content/logos/images/outline/logotype/color/ciszubot_logotipo_outline_color.svg'),
  // ciszugamens: logotipo real (not-outline degradado color) — PNG (sin SVG de logotipo)
  ciszugamens: resolver.resolve('projects/ciszugamens/content/logos/images/not-outline/logotype/gradient/color/ciszugamens_logotipo_degradado_outline_color.png'),
};

// ---------- Catálogo (los sponsors NO se anuncian a sí mismos; se filtra por site) ----------
export const DEFAULT_AD_CATALOG: AdConfig[] = [
  // --- Esquina (particulares): patrocinados + huecos reales ---
  {
    id: 'ciszu_account', type: 'particulares', placement: 'corner', minIntervalSec: 420,
    content: { title: 'Crea tu cuenta CISZU ID', description: 'Un solo perfil para todo el ecosistema.', cta: 'Crear cuenta', href: 'https://ciszunetwork.vercel.app/register', accent: '#3b82f6', format: 'sponsored', source: 'ciszunetwork', image: ISOTIPO.ciszunetwork },
  },
  {
    id: 'muzicmania_play', type: 'particulares', placement: 'corner', minIntervalSec: 420,
    content: { title: 'MuzicMania', description: 'Juego de ritmo: compite por la tabla de líderes.', cta: 'Jugar', href: 'https://muzicmania.vercel.app/play', accent: '#c026d3', format: 'sponsored', source: 'muzicmania', image: ISOTIPO.muzicmania },
  },
  {
    id: 'ciszubot_bot', type: 'particulares', placement: 'corner', minIntervalSec: 420,
    content: { title: 'CiszuBot', description: 'El bot oficial de Discord del ecosistema.', cta: 'Probar', href: 'https://ciszubot.vercel.app', accent: '#38bdf8', format: 'sponsored', source: 'ciszubot', image: ISOTIPO.ciszubot },
  },
  {
    id: 'antony_portfolio', type: 'particulares', placement: 'corner', minIntervalSec: 420,
    content: { title: 'Ciszuko Antony', description: 'Conoce mi portfolio: logos, medios y música.', cta: 'Ver', href: 'https://ciszukoantony.vercel.app', accent: '#a855f7', format: 'sponsored', source: 'ciszukoantony', image: ISOTIPO.ciszukoantony },
  },
  {
    id: 'ciszugamens_server', type: 'particulares', placement: 'corner', minIntervalSec: 420,
    content: { title: 'Ciszugamens', description: 'Únete al servidor de Discord de la comunidad gamer.', cta: 'Unirme', href: 'https://discord.gg/W3kMtMMj6E', accent: '#22d3ee', format: 'sponsored', source: 'ciszugamens', image: ISOTIPO.ciszugamens },
  },
  {
    id: 'real_placeholder_corner', type: 'particulares', placement: 'corner', minIntervalSec: 540,
    content: { title: 'Espacio para tu anuncio', description: 'Anuncio de terceros próximo (imagen).', cta: 'Próximamente', href: '#', accent: '#facc15', format: 'image', source: 'external', placeholder: true, durationSec: 30 },
  },
  {
    id: 'real_video_corner', type: 'particulares', placement: 'corner', minIntervalSec: 540,
    content: { title: 'Tu anuncio en vídeo', description: 'Anuncio en vídeo de terceros próximo.', cta: 'Próximamente', href: '#', accent: '#facc15', format: 'video', source: 'external', placeholder: true, durationSec: 15 },
  },
  {
    id: 'real_carousel_corner', type: 'particulares', placement: 'corner', minIntervalSec: 540,
    content: { title: 'Carrusel de anuncios', description: 'Varios anuncios en cadena, próximamente.', cta: 'Próximamente', href: '#', accent: '#facc15', format: 'carousel', source: 'external', placeholder: true, durationSec: 15, carouselItems: [
      { title: 'Anuncio 1', description: 'Anuncio personalizado próximo.', cta: 'Próximamente', href: '#', accent: '#facc15', placeholder: true, format: 'image' },
      { title: 'Anuncio 2', description: 'Anuncio personalizado próximo.', cta: 'Próximamente', href: '#', accent: '#facc15', placeholder: true, format: 'image' },
      { title: 'Anuncio 3', description: 'Anuncio personalizado próximo.', cta: 'Próximamente', href: '#', accent: '#facc15', placeholder: true, format: 'image' },
    ] },
  },
  // --- Intrusivo / recompensa (tras acción) ---
  {
    id: 'muzicmania_after_game', type: 'intrusive', placement: 'game_end',
    content: { title: '¿Disfrutaste la partida?', description: 'Sigue jugando y compite en la tabla de líderes.', cta: 'Jugar de nuevo', href: 'https://muzicmania.vercel.app/play', accent: '#c026d3', format: 'sponsored', source: 'muzicmania', image: ISOTIPO.muzicmania },
  },
  {
    id: 'reward_score', type: 'reward', placement: 'game_end', minIntervalSec: 600, rewardWaitSec: 30,
    content: { title: 'Anuncio con recompensa', description: 'Espera unos segundos y obtén la MITAD de puntos extra.', cta: 'Reclamar recompensa', href: '#', accent: '#22c55e', format: 'image', source: 'external', placeholder: true, durationSec: 30 },
  },
  // --- Banner inferior (optional): huecos reales + un patrocinado ---
  {
    id: 'real_image_pill', type: 'optional', placement: 'body', minIntervalSec: 420,
    content: { title: 'Publicidad real próxima', description: 'Estamos verificando la app y necesitamos más tráfico.', cta: 'Próximamente', href: '#', accent: '#facc15', format: 'image', source: 'external', placeholder: true, durationSec: 30 },
  },
  {
    id: 'real_carousel_pill', type: 'optional', placement: 'body', minIntervalSec: 420,
    content: { title: 'Carrusel de anuncios', description: 'Varios anuncios en cadena, próximamente.', cta: 'Próximamente', href: '#', accent: '#facc15', format: 'carousel', source: 'external', placeholder: true, durationSec: 15, carouselItems: [
      { title: 'Anuncio 1', description: 'Anuncio personalizado próximo.', cta: 'Próximamente', href: '#', accent: '#facc15', placeholder: true, format: 'image' },
      { title: 'Anuncio 2', description: 'Anuncio personalizado próximo.', cta: 'Próximamente', href: '#', accent: '#facc15', placeholder: true, format: 'image' },
      { title: 'Anuncio 3', description: 'Anuncio personalizado próximo.', cta: 'Próximamente', href: '#', accent: '#facc15', placeholder: true, format: 'image' },
    ] },
  },
  {
    id: 'ciszu_account_pill', type: 'optional', placement: 'body', minIntervalSec: 420,
    content: { title: 'Crea tu cuenta CISZU ID', description: 'Un solo perfil para todo el ecosistema.', cta: 'Crear cuenta', href: 'https://ciszunetwork.vercel.app/register', accent: '#3b82f6', format: 'sponsored', source: 'ciszunetwork', image: ISOTIPO.ciszunetwork },
  },
];

// ---------- Piezas visuales ----------
function AdLabel() {
  return (
    <span className="absolute left-2 top-2 z-10 rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-black uppercase leading-none text-black">
      AD
    </span>
  );
}

function AdClose({ onClick, className, closable = true }: { onClick: () => void; className?: string; closable?: boolean }) {
  if (!closable) return null;
  return (
    <button
      aria-label="Cerrar anuncio"
      onClick={onClick}
      className={`grid place-items-center rounded-full bg-red-500/80 text-white transition hover:bg-red-500 ${className ?? ''}`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
        <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </button>
  );
}

/** Barra de temporizador amarilla + contador de segundos restantes */
function CountdownBar({ total, remaining }: { total: number; remaining: number }) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px] font-bold text-yellow-400">
        <span>{Math.max(0, Math.ceil(remaining))}s</span>
        <span>Auto-cierre</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-yellow-400 transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AdBanner({ ad, compact = false }: { ad: AdConfig; compact?: boolean }) {
  const c = ad.content;
  const h = compact ? 'h-10' : 'h-28';
  if (c.placeholder) {
    return (
      <div className={`flex ${h} w-full flex-col items-center justify-center rounded-lg border border-dashed border-yellow-500/40 bg-yellow-500/5 px-3 text-center`}>
        <p className="text-[11px] font-bold text-yellow-400">Próximamente</p>
        {!compact && <p className="mt-0.5 text-[10px] leading-snug text-neutral-400">Estamos verificando la app y necesitamos más tráfico. Aquí aparecerá el anuncio real.</p>}
      </div>
    );
  }
  if (c.format === 'image' && c.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={c.image} alt={c.title} className={`${h} w-full rounded-lg object-cover`} />;
  }
  const accent = c.accent || '#22d3ee';
  const isSponsored = c.source && c.source !== 'external';
  // Patrocinados de Ciszu Network: gradiente vibrante + brillo superior + shimmer animado.
  return (
    <div
      className={`relative flex ${h} w-full items-center justify-center gap-3 overflow-hidden rounded-lg`}
      style={{ background: isSponsored
        ? `linear-gradient(135deg, ${accent}, ${accent}99 55%, ${accent}66)`
        : `linear-gradient(135deg, ${accent}2e, ${accent}d9)` }}
    >
      {isSponsored && <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />}
      {isSponsored && <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />}
      {c.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.image} alt={c.title} className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} shrink-0 object-contain drop-shadow-lg`} />
      )}
      <span className={`px-2 text-center font-bold text-white drop-shadow ${compact ? 'text-xs' : 'text-lg'}`}>{c.title}</span>
    </div>
  );
}

function AdTerms({ site }: { site: string }) {
  const url = SITE_TERMS[site] || SITE_TERMS.ciszunetwork;
  return (
    <p className="mt-3 text-center text-[11px] text-neutral-500">
      <a href={url} className="underline hover:text-neutral-300">Términos y condiciones</a>{' '}
      · publicidad de Ciszu Network ·{' '}
      <a href="https://ciszunetwork.vercel.app/register" className="underline hover:text-neutral-300">Regístrate para ver menos anuncios</a>
    </p>
  );
}

// ---------- Persistencia ----------
function readJson<T>(key: string, fb: T): T {
  if (typeof window === 'undefined') return fb;
  try { const r = window.localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fb; } catch { return fb; }
}
function writeJson(key: string, v: unknown) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignora */ }
}

// ---------- Registro de impresión en DB (telemetría del sistema ADS) ----------
const ADS_IMPRESSION_URL = 'https://ciszunetwork.vercel.app/api/ads/impression';
let adsImpressionBusy = false;
function recordImpression(site: string, ad: AdConfig) {
  if (typeof window === 'undefined' || adsImpressionBusy) return;
  adsImpressionBusy = true;
  fetch(ADS_IMPRESSION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site,
      ad_id: ad.id,
      ad_type: ad.type,
      ad_source: ad.content.source ?? 'external',
    }),
  }).catch(() => { /* telemetría no bloqueante: ignora fallos de red */ }).finally(() => {
    adsImpressionBusy = false;
  });
}

// ---------- Duración total por formato/tipo ----------
export function adDurationSec(ad: AdConfig): number {
  const c = ad.content;
  const f = c.format ?? 'sponsored';
  const base = c.durationSec ?? (f === 'video' ? AD_TIMING.videoBaseSec : f === 'image' ? AD_TIMING.imageSec : AD_TIMING.sponsoredSec);
  const isCenter = ad.type === 'intrusive' || ad.type === 'reward';
  if (f === 'video') return base + (isCenter ? base : Math.ceil(base / 2));
  return isCenter ? base * 2 : base;
}

// ---------- Auto-cierre con contador (sponsored/image/video en 2 fases) ----------
function useAutoClose(ad: AdConfig, onDone: () => void) {
  const c = ad.content;
  const isCenter = ad.type === 'intrusive' || ad.type === 'reward';
  const isVideo = c.format === 'video' && !!c.videoSrc;
  const base = c.durationSec ?? (c.format === 'video' ? AD_TIMING.videoBaseSec : c.format === 'image' ? AD_TIMING.imageSec : AD_TIMING.sponsoredSec);
  const [remaining, setRemaining] = useState(adDurationSec(ad));
  const [phase, setPhase] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  }, []);

  // Resetear SIEMPRE el temporizador y el flag cuando cambia el anuncio (ad.id):
  // evita que un anuncio nuevo herede un contador ya gastado o un doneRef viejo
  // que lo cierra antes de tiempo o que no se reinicie al cambiar de anuncio.
  useEffect(() => {
    setRemaining(adDurationSec(ad));
    setPhase(0);
    doneRef.current = false;
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad.id]);

  useEffect(() => {
    if (isVideo && phase === 0) {
      setRemaining(base);
      const v = videoRef.current;
      if (v) { v.currentTime = 0; void v.play().catch(() => {}); }
    }
    const iv = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { window.clearInterval(iv); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad.id, phase]);

  // Cierre cuando el contador llega a 0 (fuera del updater de setState, que en
  // React 18+ puede ejecutarse dos veces y disparar el cierre prematuro).
  useEffect(() => {
    if (remaining <= 0 && !doneRef.current) {
      finish();
    }
  }, [remaining, finish]);

  const handleVideoEnded = useCallback(() => {
    if (!isVideo) return;
    if (phase === 0) {
      setPhase(1);
      setRemaining(isCenter ? base : Math.ceil(base / 2));
      const v = videoRef.current;
      if (v) { v.currentTime = 0; void v.play().catch(() => {}); }
    } else {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isCenter, base, finish, isVideo]);

  return { remaining, total: adDurationSec(ad), phase, videoRef, handleVideoEnded };
}

// ---------- Provider ----------
export function AdsProvider({ site, children, catalog = DEFAULT_AD_CATALOG, authenticated = false, premium = false }: AdsProviderProps) {
  const [current, setCurrent] = useState<AdConfig | null>(null);
  const [floatingActive, setFloatingActive] = useState(false);
  const dismissedRef = useRef<Record<string, true>>({});
  const seenRef = useRef<Record<string, number>>({});
  const claimedRef = useRef<Record<string, number>>({});
  const lastShownRef = useRef<string | null>(null);
  const lastActivityRef = useRef(Date.now());
  const hydrated = useRef(false);

const dKey = `ciszu_ads_${site}_dismissed`;
  const sKey = `ciszu_ads_${site}_seen`;
  const cKey = `ciszu_ads_${site}_claimed`;

  // Periodo de gracia: 10s sin anuncios desde que se entra a la página (independiente del rango).
  const graceUntilRef = useRef(Date.now() + 10000);

// Catálogo: acento por site + NO anunciar el propio sitio + balance 25/75 se
  // resuelve en el pick (trigger). Premium = sin anuncios; autenticado = sin
  // anuncios de footer/opcionales (se mantienen esquina y tras-acción).
  const effective = useMemo(() => {
    const accent = SITE_ACCENT[site] || '#22d3ee';
    const host = SITE_URL[site] ? new URL(SITE_URL[site]).host : '';
    return catalog
      .filter((a) => !host || !a.content.href.includes(host))
      .filter((a) => !(premium && a.type !== 'intrusive' && a.type !== 'reward'))
      .filter((a) => !(authenticated && !premium && a.type === 'optional'))
      .map((a) => ({ ...a, content: { ...a.content, accent: a.content.accent || accent } }));
  }, [catalog, site, authenticated, premium]);

  useEffect(() => {
    dismissedRef.current = readJson(dKey, {});
    seenRef.current = readJson(sKey, {});
    claimedRef.current = readJson(cKey, {});
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

// Detección de inactividad: cualquier interacción reinicia el contador.
  useEffect(() => {
    const reset = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('pointermove', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('scroll', reset, true);
    return () => {
      window.removeEventListener('pointermove', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('scroll', reset, true);
    };
  }, []);

  // Si el usuario abandona la página (recarga/cierre) con un anuncio de recompensa
  // activo SIN reclamar, la recompensa se pierde: se marca como vista/reclamada para
  // que no pueda reclamarla en la siguiente visita sin verla otra vez.
  useEffect(() => {
    const onLeave = () => {
      if (current && current.type === 'reward' && !claimedRef.current[current.id]) {
        claimedRef.current[current.id] = Date.now();
        writeJson(cKey, claimedRef.current);
        trackEvent('ad_reward_lost', { ad_id: current.id, site });
      }
    };
    window.addEventListener('beforeunload', onLeave);
    window.addEventListener('pagehide', onLeave);
    return () => {
      window.removeEventListener('beforeunload', onLeave);
      window.removeEventListener('pagehide', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, cKey, site]);

  const isInactive = useCallback(
    () => Date.now() - lastActivityRef.current > AD_TIMING.inactiveThresholdSec * 1000,
    []
  );

const markSeen = useCallback((id: string) => {
    seenRef.current[id] = Date.now();
    writeJson(sKey, seenRef.current);
    const ad = effective.find((a) => a.id === id);
    if (ad) recordImpression(site, ad);
  }, [sKey, effective, site]);

const show = useCallback((id: string): AdConfig | null => {
    if (Date.now() < graceUntilRef.current) return null; // periodo de gracia 10s
    const ad = effective.find((a) => a.id === id);
    if (!ad) return null;
    if (dismissedRef.current[id]) return null;
    const last = seenRef.current[id] ?? 0;
    const interval = (ad.minIntervalSec ?? 0) * 1000;
    if (interval > 0 && Date.now() - last < interval) return null;
    markSeen(id);
    lastShownRef.current = id;
    setCurrent(ad);
    trackEvent('ad_impression', { ad_id: id, ad_type: ad.type, placement: ad.placement, site });
    return ad;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effective, markSeen, site]);

  const trigger = useCallback((type: AdType, placement: string): AdConfig | null => {
    const valid = effective.filter((ad) => {
      if (ad.type !== type || ad.placement !== placement) return false;
      if (dismissedRef.current[ad.id]) return false;
      const last = seenRef.current[ad.id] ?? 0;
      const interval = (ad.minIntervalSec ?? 0) * 1000;
      return !(interval > 0 && Date.now() - last < interval);
    });
    if (valid.length === 0) return null;
    // Pasivos: balance 25% patrocinado / 75% terceros.
    let pool = valid;
    if (type === 'particulares' || type === 'optional') {
      const sponsored = valid.filter((a) => a.content.source !== 'external');
      const real = valid.filter((a) => a.content.source === 'external');
      if (sponsored.length > 0 && real.length > 0) {
        pool = Math.random() < AD_TIMING.sponsoredWeight ? sponsored : real;
      } else {
        pool = sponsored.length > 0 ? sponsored : real;
      }
    }
    const pick = pool.find((a) => a.id !== lastShownRef.current) ?? pool[0];
    return show(pick.id);
  }, [effective, show]);

  const dismiss = useCallback(() => {
    if (!current) return;
    const ad = current;
    trackEvent('ad_dismiss', { ad_id: ad.id, ad_type: ad.type, site });
    if (ad.type === 'optional' || ad.type === 'particulares') markSeen(ad.id);
    setCurrent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, markSeen, site]);

  const rewardStatus = useCallback((ad: AdConfig): RewardStatus => {
    if (ad.type !== 'reward') return { canClaim: false, remainingSec: 0 };
    const last = seenRef.current[ad.id] ?? 0;
    const wait = (ad.rewardWaitSec ?? 0) * 1000;
    const elapsed = Date.now() - last;
    if (elapsed >= wait) return { canClaim: true, remainingSec: 0 };
    return { canClaim: false, remainingSec: Math.ceil((wait - elapsed) / 1000) };
  }, []);

  const claimReward = useCallback((ad: AdConfig): boolean => {
    if (ad.type !== 'reward') return false;
    const status = rewardStatus(ad);
    if (!status.canClaim) return false;
    claimedRef.current[ad.id] = Date.now();
    writeJson(cKey, claimedRef.current);
    trackEvent('ad_reward_claimed', { ad_id: ad.id, site });
    setCurrent(null);
    return true;
  }, [rewardStatus, cKey, site]);

  const getNextPeriodicAdIn = useCallback((): number => {
    const now = Date.now();
    let min = Infinity;
    for (const a of effective) {
      if (a.type !== 'particulares' && a.type !== 'optional') continue;
      if (!a.minIntervalSec) continue;
      if (dismissedRef.current[a.id]) continue;
      const last = seenRef.current[a.id] ?? 0;
      const due = last + a.minIntervalSec * 1000;
      if (due > now) min = Math.min(min, due - now);
    }
    return Number.isFinite(min) ? min : 0;
  }, [effective]);

  const value = useMemo<AdsContextValue>(
    () => ({ site, catalog: effective, current, show, trigger, dismiss, rewardStatus, claimReward, floatingActive, setFloatingActive, getNextPeriodicAdIn, isInactive }),
    [site, effective, current, show, trigger, dismiss, rewardStatus, claimReward, floatingActive, getNextPeriodicAdIn, isInactive]
  );

  return (
    <AdsContext.Provider value={value}>
      {children}
      {hydrated.current && <AdModalInner />}
      {hydrated.current && <NextAdCountdown />}
    </AdsContext.Provider>
  );
}

export function useAds(): AdsContextValue {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds debe usarse dentro de <AdsProvider>');
  return ctx;
}

function useAdsSafe(): AdsContextValue | null {
  return useContext(AdsContext);
}

// ---------- Estilos ----------
const ADS_CSS = `
@keyframes ciszu-ad-pop { from { opacity: 0; transform: translate(-50%,-48%) scale(.92); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
@keyframes ciszu-ad-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ciszu-ad-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ciszu-ad-shrink { from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: scale(1); } }
`;

// ---------- Modal central (SOLO tras acción específica) ----------
function AdModalInner() {
  const { current, dismiss, rewardStatus, claimReward, site } = useAds();
  const [confirmLoss, setConfirmLoss] = useState(false);

  // useAutoClose no puede ser condicional; usamos un AdConfig vacío como guard.
  const timer = useAutoClose(current ?? ({ type: 'intrusive', placement: '', content: { title: '', description: '', cta: '', href: '#' } } as AdConfig), dismiss);

  useEffect(() => { setConfirmLoss(false); }, [current?.id]);

  if (!current) return null;
  // SOLO centro para los que nacen de una acción (intrusivo/recompensa).
  // Los pasivos (particulares/optional) se muestran en esquina/banner, NUNCA al centro.
  if (current.type !== 'intrusive' && current.type !== 'reward') return null;
  const ad = current;
  const status = rewardStatus(ad);
  const isReward = ad.type === 'reward';
  const c = ad.content;
  const closable = c.closable !== false;

  const onCta = () => {
    if (isReward) { claimReward(ad); return; }
    trackEvent('ad_click', { ad_id: ad.id, ad_type: ad.type, href: c.href });
    window.open(c.href, '_blank', 'noopener,noreferrer');
    dismiss();
  };

  const onClose = () => {
    if (isReward) { setConfirmLoss(true); return; } // avisa de la pérdida de recompensa
    dismiss();
  };

return createPortal(
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-[800] flex items-center justify-center">
      <style>{ADS_CSS}</style>
      <div onClick={() => closable && onClose()} className="absolute inset-0 bg-black/70 backdrop-blur-md" style={{ animation: 'ciszu-ad-fade .25s ease-out' }} />
      <div
        className="relative w-[min(94vw,500px)] rounded-2xl border border-white/10 bg-[#0b0e14] p-6 shadow-2xl"
        style={{ animation: 'ciszu-ad-pop .35s cubic-bezier(.16,1,.3,1)' }}
      >
        <AdClose onClick={onClose} closable={closable} className="absolute right-3 top-3 h-8 w-8" />
        <AdLabel />
        <div className="mb-3">
          {c.format === 'video' && c.videoSrc ? (
            <video ref={timer.videoRef} src={c.videoSrc} muted autoPlay playsInline className="h-32 w-full rounded-lg bg-black object-contain" onEnded={timer.handleVideoEnded} />
          ) : (
            <AdBanner ad={ad} />
          )}
        </div>
        <h3 className="text-lg font-bold text-white">{c.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">{c.description}</p>

        {isReward && (
          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            {status.canClaim ? (
              <p className="text-sm font-semibold text-green-400">Recompensa disponible: la mitad</p>
            ) : (
              <p className="text-sm text-neutral-400">Espera <span className="font-bold text-white">{status.remainingSec}s</span> para reclamar</p>
            )}
          </div>
        )}

        <CountdownBar total={timer.total} remaining={timer.remaining} />

        <button
          onClick={onCta}
          disabled={isReward && !status.canClaim}
          className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: c.accent || '#22d3ee' }}
        >
          {isReward ? (status.canClaim ? c.cta : 'Espera para reclamar') : c.cta}
        </button>
        <AdTerms site={site} />

        {confirmLoss && isReward && (
          <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-black/85 p-6" style={{ animation: 'ciszu-ad-fade .2s ease-out' }}>
            <div className="w-full text-center">
              <p className="text-sm font-bold text-yellow-400">Vas a perder la recompensa</p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-300">Si cierras este anuncio perderás la mitad de puntos extra de tu próxima partida.</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setConfirmLoss(false)} className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">Seguir viendo</button>
                <button onClick={dismiss} className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-500">Cerrar y perder</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ---------- Tarjeta de anuncio pasivo (esquina / banner inferior) ----------
function PassiveAdCard({ ad, onDone, compact = false, site }: { ad: AdConfig; onDone: () => void; compact?: boolean; site: string }) {
  const c = ad.content;
  if (c.format === 'carousel' && c.carouselItems?.length) {
    return <CarouselCard ad={ad} onDone={onDone} compact={compact} site={site} />;
  }
  return <SingleAdCard ad={ad} onDone={onDone} compact={compact} site={site} />;
}

function SingleAdCard({ ad, onDone, compact, site }: { ad: AdConfig; onDone: () => void; compact: boolean; site: string }) {
  const c = ad.content;
  const closable = c.closable !== false;
  const timer = useAutoClose(ad, onDone);
  const isVideo = c.format === 'video' && !!c.videoSrc;

  return (
    <div className={`relative rounded-xl border border-white/10 bg-[#0e1118] shadow-xl ${compact ? 'flex items-center gap-2 py-2 pl-2 pr-2' : 'p-4'}`}>
      <AdClose onClick={onDone} closable={closable} className="absolute right-2 top-2 h-7 w-7" />
      <span className="shrink-0 rounded bg-yellow-400 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-black">AD</span>

      {!compact && (
        <div className="mb-2">
          {isVideo ? (
            <video ref={timer.videoRef} src={c.videoSrc} muted autoPlay playsInline className="h-20 w-full rounded-lg bg-black object-contain" onEnded={timer.handleVideoEnded} />
          ) : (
            <AdBanner ad={ad} />
          )}
        </div>
      )}
      {compact && !c.placeholder && c.image && <div className="ml-1 hidden h-8 w-8 shrink-0 sm:block"><img src={c.image} alt={c.title} className="h-8 w-8 object-contain" /></div>}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-white">{c.title}</p>
        <p className="truncate text-[11px] text-neutral-400">{c.description}</p>
      </div>

      {!c.placeholder && !compact && (
        <a href={c.href} target="_blank" rel="noopener noreferrer"
          onClick={() => trackEvent('ad_click', { ad_id: ad.id, ad_type: ad.type, href: c.href })}
          className="mt-2 inline-block rounded-lg px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
          style={{ background: c.accent || '#22d3ee' }}>{c.cta}</a>
      )}

      <div className={compact ? 'w-16 shrink-0' : 'w-full'}>
        <CountdownBar total={timer.total} remaining={timer.remaining} />
      </div>

      {!compact && <AdTerms site={site} />}
    </div>
  );
}

function CarouselCard({ ad, onDone, compact, site }: { ad: AdConfig; onDone: () => void; compact: boolean; site: string }) {
  const items = ad.content.carouselItems ?? [];
  const max = Math.min(items.length, AD_TIMING.carouselMaxItems);
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState<number>(AD_TIMING.carouselItemSec);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const iv = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(iv);
          const next = idx + 1;
          if (next >= max) { finish(); return 0; }
          setIdx(next);
          return AD_TIMING.carouselItemSec;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, max, finish]);

  const item = items[idx];
  const closable = ad.content.closable !== false;

  return (
    <div className={`relative rounded-xl border border-white/10 bg-[#0e1118] shadow-xl ${compact ? 'flex items-center gap-2 py-2 pl-2 pr-2' : 'p-4'}`}>
      <AdClose onClick={finish} closable={closable} className="absolute right-2 top-2 h-7 w-7" />
      <span className="shrink-0 rounded bg-yellow-400 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-black">AD</span>

      {!compact && <div className="mb-2"><AdBanner ad={{ ...ad, content: item }} /></div>}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-white">{item.title}</p>
        <p className="truncate text-[11px] text-neutral-400">{item.description}</p>
      </div>

      {!compact && (
        <a href={item.href} target="_blank" rel="noopener noreferrer"
          onClick={() => trackEvent('ad_click', { ad_id: ad.id, ad_type: ad.type, href: item.href })}
          className="mt-2 inline-block rounded-lg px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
          style={{ background: item.accent || '#facc15' }}>{item.cta}</a>
      )}

      <div className={compact ? 'w-16 shrink-0' : 'w-full'}>
        <CountdownBar total={AD_TIMING.carouselItemSec} remaining={remaining} />
        {idx > 0 && (
          <p className="mt-1 text-right text-[10px] font-semibold text-yellow-400/80">Próximo anuncio en {Math.max(0, Math.ceil(remaining))}s</p>
        )}
      </div>

      {!compact && <AdTerms site={site} />}
    </div>
  );
}

// ---------- Mini "Próximo anuncio en..." (opcional/periódico, próximo e inminente) ----------
function NextAdCountdown() {
  const ads = useAdsSafe();
  const [nextMs, setNextMs] = useState(0);

  useEffect(() => {
    if (!ads) return;
    const compute = () => setNextMs(ads.getNextPeriodicAdIn());
    compute();
    const iv = window.setInterval(compute, 1000);
    return () => window.clearInterval(iv);
  }, [ads]);

// Solo se muestra si el próximo anuncio periódico/opcional está inminente (< 2 min).
  if (!ads || nextMs <= 0 || nextMs > 120000 || ads.current || ads.floatingActive) return null;
  const s = Math.ceil(nextMs / 1000);

  return createPortal(
    <div className="fixed bottom-2 left-2 z-[20]">
      <style>{ADS_CSS}</style>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] text-neutral-400 backdrop-blur-sm" style={{ animation: 'ciszu-ad-shrink .25s ease-out' }}>
        <NextArrowIcon />
        Próximo anuncio en <span className="font-bold text-white">{s}s</span>
      </div>
    </div>,
    document.body
  );
}

/** Icono de flecha doble a la derecha (próximo anuncio) — parpadeante. */
function NextArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 animate-pulse text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
    </svg>
  );
}

/** Mini aviso "Próximo anuncio" con flecha doble parpadeante (siempre visible). */
function NextAdHint({ nextAt, now, pos, onNow }: { nextAt: number | null; now: number; pos: React.CSSProperties; onNow?: () => void }) {
  const hintMs = nextAt ? nextAt - now : 0;
  if (hintMs <= 0 || hintMs > 120000) return null;
  return createPortal(
    <div className="fixed z-[20]" style={pos}>
      <style>{ADS_CSS}</style>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] text-neutral-400 backdrop-blur-sm" style={{ animation: 'ciszu-ad-shrink .25s ease-out' }}>
        <NextArrowIcon />
        <span>Próximo anuncio en</span>
        <span className="font-bold text-white">{Math.max(0, Math.ceil(hintMs / 1000))}s</span>
      </div>
    </div>,
    document.body
  );
}

// ---------- Flotante de esquina (particulares) ----------
export interface AdFloatProps { placement?: string; side?: 'bottom-left' | 'bottom-right'; className?: string }

export function AdFloat({ placement = 'corner', side = 'bottom-right', className }: AdFloatProps) {
  const ads = useAdsSafe();
  const [visible, setVisible] = useState(false);
  const [ad, setAd] = useState<AdConfig | null>(null);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const ivRef = useRef<number | null>(null);

  const tryShow = useCallback(() => {
    if (!ads || ads.current || ads.floatingActive) return;
    const picked = ads.trigger('particulares', placement);
    setNextAt(null);
    if (picked) { ads.setFloatingActive(true); setAd(picked); setVisible(true); }
  }, [ads, placement]);

useEffect(() => {
    if (!ads) return;
    let firstDelay = ads.isInactive() ? 15000 : periodicInterval();
    setNextAt(Date.now() + firstDelay);
    const first = window.setTimeout(() => {
      tryShow();
      // Tras el primero, programar el siguiente dentro del rango 5-10 min.
      const iv = window.setInterval(tryShow, periodicInterval());
      ivRef.current = iv;
    }, firstDelay);
    return () => { window.clearTimeout(first); if (ivRef.current) window.clearInterval(ivRef.current); ivRef.current = null; };
  }, [tryShow, ads]);

  // Tick para el mini aviso "Próximo anuncio en Xs" (solo opcional/periódico).
  useEffect(() => {
    const iv = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(iv);
  }, []);

  if (!ads) return null;

const pos = side === 'bottom-left' ? { left: 12, bottom: 12 } : { right: 12, bottom: 12 };

  const close = () => { setVisible(false); ads.setFloatingActive(false); ads.dismiss(); };

  if (!visible || !ad) {
    return <NextAdHint nextAt={nextAt} now={now} pos={pos} />;
  }

  const c = ad.content;
  return createPortal(
    <div className={`fixed z-[30] ${className ?? ''}`} style={{ ...pos, animation: 'ciszu-ad-rise .4s ease-out' }}>
      <style>{ADS_CSS}</style>
      <PassiveAdCard ad={ad} onDone={close} site={ads.site} />
    </div>,
    document.body
  );
}

// ---------- Píldora inferior (optional) ----------
export interface AdPillProps { placement?: string; side?: 'bottom-center' | 'top-center'; className?: string }

export function AdPill({ placement = 'body', side = 'bottom-center', className }: AdPillProps) {
  const ads = useAdsSafe();
  const [ad, setAd] = useState<AdConfig | null>(null);
  const [hidden, setHidden] = useState(false);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const ivRef = useRef<number | null>(null);

  const tryShow = useCallback(() => {
    if (!ads || ads.floatingActive || ads.current) return;
    const picked = ads.trigger('optional', placement);
    setNextAt(null);
    if (picked) { ads.setFloatingActive(true); setAd(picked); }
  }, [ads, placement]);

  useEffect(() => {
    if (!ads) return;
    const delay = ads.isInactive() ? 30000 : periodicInterval();
    setNextAt(Date.now() + delay);
    const t = window.setTimeout(() => {
      tryShow();
      const iv = window.setInterval(tryShow, periodicInterval());
      ivRef.current = iv;
    }, delay);
    return () => { window.clearTimeout(t); if (ivRef.current) window.clearInterval(ivRef.current); ivRef.current = null; };
  }, [tryShow, ads]);

  useEffect(() => {
    const iv = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(iv);
  }, []);

  if (!ads) return null;

const pos = side === 'top-center' ? { top: 12, left: '50%', transform: 'translateX(-50%)' } : { bottom: 12, left: '50%', transform: 'translateX(-50%)' };

  const close = () => { setHidden(true); ads.setFloatingActive(false); ads.dismiss(); };

  if (!ad || hidden) {
    return <NextAdHint nextAt={nextAt} now={now} pos={pos} />;
  }

  return createPortal(
    <div className={`fixed z-[30] ${className ?? ''}`} style={{ ...pos, animation: 'ciszu-ad-rise .4s ease-out' }}>
      <style>{ADS_CSS}</style>
      <PassiveAdCard ad={ad} onDone={close} compact site={ads.site} />
    </div>,
    document.body
  );
}
