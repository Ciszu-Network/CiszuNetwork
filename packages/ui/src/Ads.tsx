'use client';

/**
 * ADS — Sistema de anuncios de Ciszu Network (compartido para las 4 webs).
 *
 * Tipos:
 *   - intrusive  : modal CENTRAL. SOLO tras una acción específica del usuario
 *                  (actualmente: fin de partida en MuzicMania). Nunca en
 *                  navegación normal.
 *   - particulares: flotante de esquina (normal, navegación). Frecuencia larga.
 *   - reward     : modal tras acción (recompensa con espera = la mitad).
 *   - optional   : píldora/banner inferior (normal, navegación).
 *
 * Reglas:
 *   - SOLO flotantes (esquinas/inferior) en navegación normal; NUNCA centro.
 *   - Etiqueta "AD" amarilla en todos; banner real (isotipo) o hueco de verificación.
 *   - Botón de cierre rojo redondeado; footer con "Términos y condiciones"
 *     (enlace a la sección de anuncios del sitio).
 *   - Z-index bajo: siempre por detrás de notifs/FABs (gotoup/gotodown).
 *   - No se auto-propaga: un sitio NO anuncia su propia URL (se filtra por site).
 *   - Rotación (no repetir el mismo), intervalo MUY largo entre anuncios y un
 *     solo anuncio flotante a la vez.
 *   - Mini "Próximo anuncio en..." para anuncios periódicos/opcionales (los
 *     intencionales tras acción NO cuentan).
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
  /** URL del isotipo/banner real del anuncio */
  image?: string;
  /** true = hueco para anuncio REAL (aún sin creatividad) */
  placeholder?: boolean;
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
}

const AdsContext = createContext<AdsContextValue | null>(null);

// ---------- Config por site ----------
const SITE_ACCENT: Record<string, string> = {
  ciszunetwork: '#3b82f6',
  ciszukoantony: '#a855f7',
  ciszubot: '#38bdf8',
  muzicmania: '#c026d3',
};
const SITE_URL: Record<string, string> = {
  ciszunetwork: 'https://ciszunetwork.vercel.app',
  ciszukoantony: 'https://ciszukoantony.vercel.app',
  ciszubot: 'https://ciszubot.vercel.app',
  muzicmania: 'https://muzicmania.vercel.app',
  ciszugamens: 'https://ciszugamens.vercel.app',
};
const SITE_TERMS: Record<string, string> = {
  ciszunetwork: 'https://ciszunetwork.vercel.app/policies#anuncios',
  ciszukoantony: 'https://ciszukoantony.vercel.app/policies#anuncios',
  ciszubot: 'https://ciszubot.vercel.app/privacidad#anuncios',
  muzicmania: 'https://muzicmania.vercel.app/terms#anuncios',
};

// ---------- Catálogo (los sponsors NO se anuncian a sí mismos; se filtra por site) ----------
export const DEFAULT_AD_CATALOG: AdConfig[] = [
  {
    id: 'ciszu_account', type: 'particulares', placement: 'corner', minIntervalSec: 10800,
    content: { title: 'Crea tu cuenta CISZU ID', description: 'Un solo perfil para todo el ecosistema.', cta: 'Crear cuenta', href: SITE_URL.ciszunetwork + '/register' },
  },
  {
    id: 'muzicmania_play', type: 'particulares', placement: 'corner', minIntervalSec: 10800,
    content: { title: 'MuzicMania', description: 'Juego de ritmo: compite por la tabla de líderes.', cta: 'Jugar', href: SITE_URL.muzicmania + '/play' },
  },
  {
    id: 'ciszubot_bot', type: 'particulares', placement: 'corner', minIntervalSec: 10800,
    content: { title: 'CiszuBot', description: 'El bot oficial de Discord del ecosistema.', cta: 'Probar', href: SITE_URL.ciszubot },
  },
  {
    id: 'antony_portfolio', type: 'particulares', placement: 'corner', minIntervalSec: 10800,
    content: { title: 'Ciszuko Antony', description: 'Conoce mi portfolio: logos, medios y música.', cta: 'Ver', href: SITE_URL.ciszukoantony },
  },
  {
    id: 'ciszugamens_server', type: 'particulares', placement: 'corner', minIntervalSec: 10800,
    content: { title: 'Ciszugamens', description: 'Únete al servidor de la comunidad gamer.', cta: 'Unirme', href: SITE_URL.ciszugamens },
  },
  {
    id: 'real_placeholder_corner', type: 'particulares', placement: 'corner', minIntervalSec: 7200,
    content: { title: 'Espacio para tu anuncio', description: 'Anuncio personalizado próximo.', cta: 'Próximamente', href: '#', placeholder: true },
  },
  {
    id: 'muzicmania_after_game', type: 'intrusive', placement: 'game_end',
    content: { title: '¿Disfrutaste la partida?', description: 'Sigue jugando y compite en la tabla de líderes.', cta: 'Jugar de nuevo', href: SITE_URL.muzicmania + '/play' },
  },
  {
    id: 'reward_score', type: 'reward', placement: 'game_end', minIntervalSec: 600, rewardWaitSec: 30,
    content: { title: 'Anuncio con recompensa', description: 'Espera unos segundos y obtén la MITAD de puntos extra.', cta: 'Reclamar recompensa', href: '#', accent: '#22c55e' },
  },
  {
    id: 'real_placeholder_pill', type: 'optional', placement: 'body', minIntervalSec: 10800,
    content: { title: 'Publicidad real próxima', description: 'Estamos verificando la app y necesitamos más tráfico.', cta: 'Próximamente', href: '#', placeholder: true },
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

function AdClose({ onClick, className }: { onClick: () => void; className?: string }) {
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

function AdBanner({ ad }: { ad: AdConfig }) {
  const c = ad.content;
  if (c.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={c.image} alt={c.title} className="h-28 w-full rounded-lg object-cover" />;
  }
  if (c.placeholder) {
    return (
      <div className="flex h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-yellow-500/40 bg-yellow-500/5 px-3 text-center">
        <p className="text-[11px] font-bold text-yellow-400">Anuncio personalizado próximo</p>
        <p className="mt-1 text-[10px] leading-snug text-neutral-400">
          Estamos verificando la app y necesitamos más tráfico. Aquí aparecerá el anuncio real.
        </p>
      </div>
    );
  }
  // Banner de marca (gradiente) como base; se sustituirá por el isotipo real vía `image`.
  return (
    <div
      className="flex h-28 w-full flex-col items-center justify-center rounded-lg"
      style={{ background: `linear-gradient(135deg, ${c.accent || '#22d3ee'}33, ${c.accent || '#22d3ee'}cc)` }}
    >
      <span className="px-4 text-center text-base font-bold text-white drop-shadow">{c.title}</span>
    </div>
  );
}

function AdTerms({ site }: { site: string }) {
  const url = SITE_TERMS[site] || SITE_TERMS.ciszunetwork;
  return (
    <p className="mt-3 text-center text-[11px] text-neutral-500">
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-300">
        Términos y condiciones
      </a>{' '}
      · publicidad de Ciszu Network
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

// ---------- Provider ----------
export function AdsProvider({ site, children, catalog = DEFAULT_AD_CATALOG }: AdsProviderProps) {
  const [current, setCurrent] = useState<AdConfig | null>(null);
  const [floatingActive, setFloatingActive] = useState(false);
  const dismissedRef = useRef<Record<string, true>>({});
  const seenRef = useRef<Record<string, number>>({});
  const claimedRef = useRef<Record<string, number>>({});
  const lastShownRef = useRef<string | null>(null);
  const hydrated = useRef(false);

  const dKey = `ciszu_ads_${site}_dismissed`;
  const sKey = `ciszu_ads_${site}_seen`;
  const cKey = `ciszu_ads_${site}_claimed`;

  // Catálogo: acento por site + NO anunciar el propio sitio.
  const effective = useMemo(() => {
    const accent = SITE_ACCENT[site] || '#22d3ee';
    const host = SITE_URL[site] ? new URL(SITE_URL[site]).host : '';
    return catalog
      .filter((a) => !host || !a.content.href.includes(host))
      .map((a) => ({ ...a, content: { ...a.content, accent: a.content.accent || accent } }));
  }, [catalog, site]);

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
    const pick = valid.find((a) => a.id !== lastShownRef.current) ?? valid[0];
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
    () => ({ site, catalog: effective, current, show, trigger, dismiss, rewardStatus, claimReward, floatingActive, setFloatingActive, getNextPeriodicAdIn }),
    [site, effective, current, show, trigger, dismiss, rewardStatus, claimReward, floatingActive, getNextPeriodicAdIn]
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
`;

// ---------- Modal central (SOLO tras acción específica) ----------
function AdModalInner() {
  const { current, dismiss, rewardStatus, claimReward, site } = useAds();
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
    if (isReward) { claimReward(ad); return; }
    trackEvent('ad_click', { ad_id: ad.id, ad_type: ad.type, href: c.href });
    window.open(c.href, '_blank', 'noopener,noreferrer');
    dismiss();
  };

  return createPortal(
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-[800] flex items-center justify-center">
      <style>{ADS_CSS}</style>
      <div onClick={dismiss} className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ animation: 'ciszu-ad-fade .25s ease-out' }} />
      <div
        className="relative w-[min(92vw,420px)] rounded-2xl border border-white/10 bg-[#0b0e14] p-6 shadow-2xl"
        style={{ animation: 'ciszu-ad-pop .35s cubic-bezier(.16,1,.3,1)' }}
      >
        <AdClose onClick={dismiss} className="absolute right-3 top-3 h-8 w-8" />
        <AdLabel />
        <div className="mb-3"><AdBanner ad={ad} /></div>
        <h3 className="text-lg font-bold text-white">{c.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">{c.description}</p>

        {isReward && (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            {status.canClaim ? (
              <p className="text-sm font-semibold text-green-400">Recompensa disponible: la mitad</p>
            ) : (
              <p className="text-sm text-neutral-400">Espera <span className="font-bold text-white">{status.remainingSec}s</span> para reclamar</p>
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
        <AdTerms site={site} />
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

  const tryShow = useCallback(() => {
    if (!ads || ads.current || ads.floatingActive) return;
    const picked = ads.trigger('particulares', placement);
    if (picked) { ads.setFloatingActive(true); setAd(picked); setVisible(true); }
  }, [ads, placement]);

  useEffect(() => {
    if (!ads) return;
    const first = window.setTimeout(tryShow, 45000);
    const iv = window.setInterval(tryShow, 90000);
    return () => { window.clearTimeout(first); window.clearInterval(iv); };
  }, [tryShow, ads]);

  if (!ads || !visible || !ad) return null;
  const c = ad.content;
  const pos = side === 'bottom-left' ? { left: 12, bottom: 12 } : { right: 12, bottom: 12 };

  const close = () => { setVisible(false); ads.setFloatingActive(false); ads.dismiss(); };

  return createPortal(
    <div className={`fixed z-[30] ${className ?? ''}`} style={{ ...pos, animation: 'ciszu-ad-rise .4s ease-out' }}>
      <style>{ADS_CSS}</style>
      <div className="relative w-[min(88vw,300px)] rounded-xl border border-white/10 bg-[#0e1118] p-3 pt-6 shadow-xl">
        <AdClose onClick={close} className="absolute right-2 top-2 h-7 w-7" />
        <AdLabel />
        <AdBanner ad={ad} />
        <p className="mt-2 text-sm font-bold text-white">{c.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">{c.description}</p>
        {!c.placeholder && (
          <a href={c.href} target="_blank" rel="noopener noreferrer"
            onClick={() => trackEvent('ad_click', { ad_id: ad.id, ad_type: ad.type, href: c.href })}
            className="mt-2 inline-block rounded-lg px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
            style={{ background: c.accent || '#22d3ee' }}>{c.cta}</a>
        )}
        <AdTerms site={ads.site} />
      </div>
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

  useEffect(() => {
    if (!ads) return;
    const t = window.setTimeout(() => {
      if (ads.floatingActive || ads.current) return;
      const picked = ads.trigger('optional', placement);
      if (picked) { ads.setFloatingActive(true); setAd(picked); }
    }, 30000);
    return () => window.clearTimeout(t);
  }, [ads, placement]);

  if (!ads || !ad || hidden) return null;
  const c = ad.content;
  const pos = side === 'top-center' ? { top: 12, left: '50%', transform: 'translateX(-50%)' } : { bottom: 12, left: '50%', transform: 'translateX(-50%)' };

  const close = () => { setHidden(true); ads.setFloatingActive(false); ads.dismiss(); };

  return createPortal(
    <div className={`fixed z-[30] ${className ?? ''}`} style={{ ...pos, animation: 'ciszu-ad-rise .4s ease-out' }}>
      <style>{ADS_CSS}</style>
      <div className="relative flex w-[min(94vw,520px)] items-center gap-2 rounded-full border border-white/10 bg-[#0e1118] py-2 pl-2 pr-2 shadow-xl">
        <span className="shrink-0 rounded bg-yellow-400 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-black">AD</span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-white">{c.title}</p>
          <p className="truncate text-[11px] text-neutral-400">{c.description}</p>
        </div>
        {!c.placeholder && (
          <a href={c.href} target="_blank" rel="noopener noreferrer"
            onClick={() => trackEvent('ad_click', { ad_id: ad.id, ad_type: ad.type, href: c.href })}
            className="ml-auto shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
            style={{ background: c.accent || '#22d3ee' }}>{c.cta}</a>
        )}
        <AdClose onClick={close} className="h-7 w-7 shrink-0" />
      </div>
    </div>,
    document.body
  );
}

// ---------- Mini "Próximo anuncio en..." (periódicos/opcionales, NO intencionales) ----------
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

  if (!ads || nextMs <= 0 || ads.current || ads.floatingActive) return null;
  const h = Math.floor(nextMs / 3600000);
  const m = Math.floor((nextMs % 3600000) / 60000);
  const s = Math.floor((nextMs % 60000) / 1000);
  const label = h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;

  return createPortal(
    <div className="fixed bottom-2 left-2 z-[20]">
      <style>{ADS_CSS}</style>
      <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] text-neutral-400 backdrop-blur-sm">
        Próximo anuncio en <span className="font-bold text-white">{label}</span>
      </div>
    </div>,
    document.body
  );
}