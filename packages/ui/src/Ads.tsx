'use client';

/**
 * ADS — Sistema de anuncios de Ciszu Network (compartido para las 4 webs).
 *
 * Cuatro tipos de anuncio (todos con opción de cerrarse):
 *   - intrusive   : modal centrado con blur de fondo, aparece SIEMPRE tras una
 *                   acción (fin de partida, compra...). Cierra con la X.
 *   - particulares: aparecen de vez en cuando en lugares concretos (flotantes en
 *                   esquinas, en el body) sin ser intrusivos. Se pueden cerrar;
 *                   si se cierran esperan su intervalo para volver.
 *   - reward      : anuncio de recompensa periódico/temporal. Al mostrarse hay
 *                   que esperar un tiempo (rewardWaitSec) para reclamar la
 *                   recompensa (LA MITAD). Cerrar = no reclamar.
 *   - optional    : aparece en lugares donde puedes quitarlo en cualquier momento
 *                   (como los intrusivos), pero es prescindible y se despide
 *                   permanentemente al cerrarlo.
 *
 * Respaldo: anuncios propios de Ciszu Network (promo del ecosistema) + tracking
 * de impresiones/clics/cierres vía Google Analytics 4 (trackEvent). Cuando se
 * active AdSense u otro proveedor, el contenido del catálogo puede apuntar a
 * esa red sin tocar la mecánica.
 *
 * Regla de diseño: los anuncios NUNCA se incrustan en el flujo de la página
 * (no cambian el estilo/layout de la web → cero riesgos visuales). Todo es
 * overlay flotante: modal centrado con blur (intrusivo/recompensa), esquinas
 * (particulares) y píldora inferior (opcional).
 *
 * Uso (en cada layout, dentro de ToastProvider):
 *   <AdsProvider site="ciszunetwork" />
 *   // desde cualquier componente:
 *   const { trigger } = useAds();
 *   trigger('intrusive', 'game_end');   // tras una partida
 *   <AdFloat placement="corner" side="bottom-right" />
 *   <AdPill placement="body" />
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { trackEvent } from './GoogleAnalytics';

export type AdType = 'intrusive' | 'particulares' | 'reward' | 'optional';

export interface AdContent {
  title: string;
  description: string;
  cta: string;
  href: string;
  accent?: string;
}

export interface AdConfig {
  id: string;
  type: AdType;
  placement: string;
  content: AdContent;
  /** particulares/reward: segundos mínimos entre impresiones */
  minIntervalSec?: number;
  /** reward: segundos de espera para reclamar la recompensa (la mitad) */
  rewardWaitSec?: number;
}

export interface AdsProviderProps {
  /** Nombre corto de la web (ciszunetwork | ciszukoantony | muzicmania | ciszubot) */
  site: string;
  children: React.ReactNode;
  catalog?: AdConfig[];
}

interface RewardStatus {
  canClaim: boolean;
  remainingSec: number;
}

interface AdsContextValue {
  catalog: AdConfig[];
  current: AdConfig | null;
  /** Muestra un anuncio por id (respeta cierres e intervalo). Devuelve el anuncio o null */
  show: (id: string) => AdConfig | null;
  /** Dispara un anuncio por tipo + placement (p. ej. intrusive tras una acción) */
  trigger: (type: AdType, placement: string) => AdConfig | null;
  /** Cierra el anuncio actual */
  dismiss: () => void;
  /** Recompensa: estado de si se puede reclamar (espera del reward) */
  rewardStatus: (ad: AdConfig) => RewardStatus;
  /** Reclama la recompensa (solo si ya se puede). Devuelve true si se reclamó */
  claimReward: (ad: AdConfig) => boolean;
}

const AdsContext = createContext<AdsContextValue | null>(null);

// ---------- Catálogo por defecto (promo Ciszu Network; sin emojis) ----------
export const DEFAULT_AD_CATALOG: AdConfig[] = [
  {
    id: 'muzicmania_after_game',
    type: 'intrusive',
    placement: 'game_end',
    content: {
      title: '¿Disfrutaste la partida?',
      description: 'Sigue jugando y compite por la tabla de líderes en MuzicMania.',
      cta: 'Jugar de nuevo',
      href: 'https://muzicmania.vercel.app/play',
      accent: '#22d3ee',
    },
  },
  {
    id: 'discord_community',
    type: 'particulares',
    placement: 'corner',
    minIntervalSec: 180,
    content: {
      title: 'Únete a la comunidad',
      description: 'Discord oficial de Ciszu Network: novedades, soporte y eventos.',
      cta: 'Entrar al Discord',
      href: 'https://discord.gg/ciszunetwork',
      accent: '#f472b6',
    },
  },
  {
    id: 'reward_score',
    type: 'reward',
    placement: 'game_end',
    minIntervalSec: 600,
    rewardWaitSec: 30,
    content: {
      title: 'Anuncio con recompensa',
      description: 'Espera unos segundos y obtén la MITAD de puntos extra en tu próxima partida.',
      cta: 'Reclamar recompensa',
      href: '#',
      accent: '#22c55e',
    },
  },
  {
    id: 'ecosystem_body',
    type: 'optional',
    placement: 'body',
    content: {
      title: 'Descubre el ecosistema',
      description: 'Cuatro webs, un bot y un juego: todo el universo de Ciszuko Antony.',
      cta: 'Explorar',
      href: 'https://ciszunetwork.vercel.app',
      accent: '#a3e635',
    },
  },
];

// ---------- Persistencia (localStorage) ----------
function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* privacidad/almacenamiento lleno: ignora */
  }
}

// ---------- Provider ----------
export function AdsProvider({ site, children, catalog = DEFAULT_AD_CATALOG }: AdsProviderProps) {
  const [current, setCurrent] = useState<AdConfig | null>(null);
  const dismissedRef = useRef<Record<string, true>>({});
  const seenRef = useRef<Record<string, number>>({});
  const claimedRef = useRef<Record<string, number>>({});
  const hydrated = useRef(false);

  const dKey = `ciszu_ads_${site}_dismissed`;
  const sKey = `ciszu_ads_${site}_seen`;
  const cKey = `ciszu_ads_${site}_claimed`;

  // Hidrata los refs al montar
  useEffect(() => {
    dismissedRef.current = readJson(dKey, {});
    seenRef.current = readJson(sKey, {});
    claimedRef.current = readJson(cKey, {});
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  const markSeen = useCallback((id: string) => {
    seenRef.current[id] = Date.now();
    writeJson(sKey, seenRef.current);
  }, [sKey]);

  const show = useCallback((id: string): AdConfig | null => {
    const ad = catalog.find((a) => a.id === id);
    if (!ad) return null;
    if (dismissedRef.current[id]) return null;
    const last = seenRef.current[id] ?? 0;
    const interval = (ad.minIntervalSec ?? 0) * 1000;
    if (interval > 0 && Date.now() - last < interval) return null;
    markSeen(id);
    setCurrent(ad);
    trackEvent('ad_impression', { ad_id: id, ad_type: ad.type, placement: ad.placement, site });
    return ad;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, markSeen, site]);

  const trigger = useCallback((type: AdType, placement: string): AdConfig | null => {
    const candidates = catalog.filter((a) => a.type === type && a.placement === placement);
    for (const ad of candidates) {
      if (dismissedRef.current[ad.id]) continue;
      const last = seenRef.current[ad.id] ?? 0;
      const interval = (ad.minIntervalSec ?? 0) * 1000;
      if (interval > 0 && Date.now() - last < interval) continue;
      return show(ad.id);
    }
    return null;
  }, [catalog, show]);

  const dismiss = useCallback(() => {
    if (!current) return;
    const ad = current;
    trackEvent('ad_dismiss', { ad_id: ad.id, ad_type: ad.type, site });
    if (ad.type === 'optional') {
      dismissedRef.current[ad.id] = true;
      writeJson(dKey, dismissedRef.current);
    } else if (ad.type === 'particulares') {
      // Cerrar un particular = snooze: lo marca como visto para respetar su intervalo.
      markSeen(ad.id);
    }
    // intrusive/reward: solo se cierra; volverá en la siguiente acción.
    setCurrent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, dKey, markSeen, site]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardStatus, cKey, site]);

  const value = useMemo<AdsContextValue>(
    () => ({ catalog, current, show, trigger, dismiss, rewardStatus, claimReward }),
    [catalog, current, show, trigger, dismiss, rewardStatus, claimReward]
  );

  return (
    <AdsContext.Provider value={value}>
      {children}
      {hydrated.current && <AdModalInner />}
    </AdsContext.Provider>
  );
}

export function useAds(): AdsContextValue {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds debe usarse dentro de <AdsProvider>');
  return ctx;
}

// Variante null-safe: los componentes flotantes NO deben romper la página si se
// montan sin <AdsProvider> (evita errores 500 en SSR por mal anidamiento).
function useAdsSafe(): AdsContextValue | null {
  return useContext(AdsContext);
}

// ---------- Estilos de animación (una sola vez) ----------
const ADS_CSS = `
@keyframes ciszu-ad-pop { from { opacity: 0; transform: translate(-50%,-48%) scale(.92); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
@keyframes ciszu-ad-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ciszu-ad-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
`;

// ---------- Modal intrusivo / recompensa ----------
function AdModalInner() {
  const { current, dismiss, rewardStatus, claimReward } = useAds();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (current?.type !== 'reward') return;
    const iv = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(iv);
  }, [current]);

  if (!current) return null;
  const ad = current;
  const status = rewardStatus(ad);
  const isReward = ad.type === 'reward';
  const c = ad.content;

  const onCta = () => {
    if (isReward) {
      if (claimReward(ad)) return; // reclamado: el modal se cierra
      return;
    }
    trackEvent('ad_click', { ad_id: ad.id, ad_type: ad.type, href: c.href });
    window.open(c.href, '_blank', 'noopener,noreferrer');
    dismiss();
  };

  return createPortal(
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-[1100] flex items-center justify-center" style={{ fontFamily: 'inherit' }}>
      <style>{ADS_CSS}</style>
      <div
        onClick={dismiss}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        style={{ animation: 'ciszu-ad-fade .25s ease-out' }}
      />
      <div
        className="relative w-[min(92vw,420px)] rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{
          background: 'linear-gradient(160deg,#0b0e14 0%,#131722 100%)',
          borderColor: 'rgba(255,255,255,.08)',
          animation: 'ciszu-ad-pop .35s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <button
          aria-label="Cerrar anuncio"
          onClick={dismiss}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white"
        >
          X
        </button>
        <div className="mb-3 h-1 w-12 rounded-full" style={{ background: c.accent || '#22d3ee' }} />
        <h3 className="text-lg font-bold text-white">{c.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">{c.description}</p>

        {isReward && (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            {status.canClaim ? (
              <p className="text-sm font-semibold text-green-400">Recompensa disponible: la mitad</p>
            ) : (
              <p className="text-sm text-neutral-400">
                Espera <span className="font-bold text-white">{status.remainingSec}s</span> para reclamar la recompensa
              </p>
            )}
          </div>
        )}

        <button
          onClick={onCta}
          disabled={isReward && !status.canClaim}
          className="mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: c.accent || '#22d3ee' }}
        >
          {isReward ? (status.canClaim ? c.cta : 'Espera para reclamar') : c.cta}
        </button>
        <p className="mt-3 text-center text-[11px] text-neutral-500">
          Anuncio de Ciszu Network · puedes cerrarlo en cualquier momento
        </p>
      </div>
    </div>,
    document.body
  );
}

// ---------- Flotante de esquina (particulares) ----------
export interface AdFloatProps {
  placement?: string;
  side?: 'bottom-left' | 'bottom-right';
  className?: string;
}

export function AdFloat({ placement = 'corner', side = 'bottom-right', className }: AdFloatProps) {
  const ads = useAdsSafe();
  const [visible, setVisible] = useState(false);
  const [ad, setAd] = useState<AdConfig | null>(null);

  const tryShow = useCallback(() => {
    if (!ads || ads.current) return; // sin provider o con modal abierto, no molestar
    const picked = ads.trigger('particulares', placement);
    if (picked) {
      setAd(picked);
      setVisible(true);
    }
  }, [ads, placement]);

  useEffect(() => {
    if (!ads) return;
    const first = window.setTimeout(tryShow, 8000);
    const iv = window.setInterval(tryShow, 60000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(iv);
    };
  }, [tryShow, ads]);

  if (!ads || !visible || !ad) return null;

  const c = ad.content;
  const pos =
    side === 'bottom-left'
      ? { left: 16, bottom: 16 }
      : { right: 16, bottom: 16 };

  return createPortal(
    <div className={`fixed z-[900] ${className ?? ''}`} style={{ ...pos, animation: 'ciszu-ad-rise .4s ease-out' }}>
      <style>{ADS_CSS}</style>
      <div className="relative w-[min(86vw,320px)] rounded-xl border border-white/10 bg-[#0e1118] p-4 shadow-xl">
        <button
          aria-label="Cerrar"
          onClick={() => { setVisible(false); ads?.dismiss(); }}
          className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-white"
        >
          X
        </button>
        <div className="mb-2 h-0.5 w-8 rounded-full" style={{ background: c.accent || '#f472b6' }} />
        <p className="text-sm font-bold text-white">{c.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-400">{c.description}</p>
        <a
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('ad_click', { ad_id: ad.id, ad_type: ad.type, href: c.href })}
          className="mt-3 inline-block rounded-lg px-3 py-1.5 text-xs font-semibold text-black transition hover:brightness-110"
          style={{ background: c.accent || '#f472b6' }}
        >
          {c.cta}
        </a>
      </div>
    </div>,
    document.body
  );
}

// ---------- Píldora flotante (opcional / particulares) ----------
// Regla de diseño: los anuncios NUNCA se incrustan en el flujo de la página
// (evita romper el layout/estilos). Todo es overlay flotante: modal centrado
// (intrusivo/recompensa), esquinas (particulares) o píldora inferior (opcional).
export interface AdPillProps {
  placement?: string;
  side?: 'bottom-center' | 'top-center';
  className?: string;
}

export function AdPill({ placement = 'body', side = 'bottom-center', className }: AdPillProps) {
  const ads = useAdsSafe();
  const [ad, setAd] = useState<AdConfig | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!ads) return;
    const t = window.setTimeout(() => {
      const picked = ads.trigger('optional', placement);
      if (picked) setAd(picked);
    }, 2000);
    return () => window.clearTimeout(t);
  }, [ads, placement]);

  if (!ads || !ad || hidden) return null;
  const c = ad.content;
  const pos =
    side === 'top-center'
      ? { top: 16, left: '50%', transform: 'translateX(-50%)' }
      : { bottom: 16, left: '50%', transform: 'translateX(-50%)' };

  return createPortal(
    <div className={`fixed z-[900] ${className ?? ''}`} style={{ ...pos, animation: 'ciszu-ad-rise .4s ease-out' }}>
      <style>{ADS_CSS}</style>
      <div className="flex w-[min(94vw,560px)] items-center gap-3 rounded-full border border-white/10 bg-[#0e1118] py-2 pl-3 pr-2 shadow-xl">
        <div className="h-8 w-1 shrink-0 rounded-full" style={{ background: c.accent || '#a3e635' }} />
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-white">{c.title}</p>
          <p className="truncate text-[11px] text-neutral-400">{c.description}</p>
        </div>
        <a
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('ad_click', { ad_id: ad.id, ad_type: ad.type, href: c.href })}
          className="ml-auto shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-black transition hover:brightness-110"
          style={{ background: c.accent || '#a3e635' }}
        >
          {c.cta}
        </a>
        <button
          aria-label="Cerrar"
          onClick={() => { setHidden(true); ads?.dismiss(); }}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-white"
        >
          X
        </button>
      </div>
    </div>,
    document.body
  );
}