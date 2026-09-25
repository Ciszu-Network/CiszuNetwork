'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoHero, type InfoTheme, useToast } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import {
  ALL_DOCUMENTS,
  CATEGORIES,
  CERTIFICATES,
  OFFICIAL_LINKS,
  OTHER_DOCS,
  catalogRef,
  principalCategory,
  type Certificate,
} from '@/data/certificates';
import { getCategoryIcon } from '@/data/categoryIcons';
import { CiscoIcon, HpIcon, IbmIcon, MicrosoftIcon, SimpleLearnIcon } from '@/data/providerIcons';
import { PREVIEWS_BY_FILE } from '@/data/certificates.previews';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const CDN_BASE =
  process.env.NEXT_PUBLIC_CDN_URL ||
  'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn';

// Logos de marca oficiales (simple-icons) servidos desde el CDN. No son
// aproximaciones dibujadas a mano: son los SVG oficiales de cada marca.
const BRAND_LOGO_BASE = `${CDN_BASE}/assets/brand-logos`;
const BRAND_IMG: Record<string, string> = {
  cisco: `${BRAND_LOGO_BASE}/cisco.svg`,
  microsoft: `${BRAND_LOGO_BASE}/microsoft.svg`,
  ibm: `${BRAND_LOGO_BASE}/ibm.svg`,
  hp: `${BRAND_LOGO_BASE}/hp.svg`,
  simplilearn: `${BRAND_LOGO_BASE}/simplilearn.svg`,
};
// Marcas sin SVG oficial en simple-icons: wordmark tipográfico limpio con el
// color corporativo (nunca emojis, nunca paths inventados).
const BRAND_WORDMARK: Record<string, { text: string; color: string }> = {
  ef: { text: 'EF SET', color: '#00A3E0' },
  penn: { text: 'PENN', color: '#990000' },
  '16p': { text: '16P', color: '#00C9A7' },
  simplilearn: { text: 'SL', color: '#FF7A1A' },
};

const fileUrl = (name: string) => {
  const parts = name.split('/');
  const encodedName = parts.map((p) => encodeURIComponent(p)).join('/');
  return `${CDN_BASE}/shared/docs/certificados/${encodedName}`;
};

const previewUrlBuilder = (name: string) => {
  const parts = name.split('/');
  const encodedName = parts.map((p) => encodeURIComponent(p)).join('/');
  return `${CDN_BASE}/shared/docs/certificados/previews/${encodedName}`;
};

const resolvePreview = (cert: Certificate): { name: string; isPreview: boolean } | undefined => {
  const mainName = cert.files[0]?.name;
  if (!mainName) return undefined;
  const mapped = PREVIEWS_BY_FILE[mainName];
  if (mapped) return { name: mapped, isPreview: true };
  return { name: mainName, isPreview: false };
};

const NO_DATE = 'No date in document';

const fmtDate = (iso?: string) => {
  if (!iso) return NO_DATE;
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[(m || 1) - 1]} ${y}`;
};

const catColor = (id: string) => CATEGORIES.find((c) => c.id === id)?.color || '#94a3b8';
const catLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label || id;
const providerColor = (id: string) => PROVIDER_OPTIONS.find((p) => p.id === id)?.color || '#94a3b8';
const providerLabel = (id: string) => PROVIDER_OPTIONS.find((p) => p.id === id)?.label || id;

const sortMeta: Record<string, { label: string; icon: string }> = {
  'date-desc': { label: 'Newest first', icon: '↓' },
  'date-asc': { label: 'Oldest first', icon: '↑' },
  'alpha-asc': { label: 'A → Z', icon: 'A' },
  'alpha-desc': { label: 'Z → A', icon: 'Z' },
  'ref-asc': { label: 'Catalog ref', icon: '#' },
  provider: { label: 'Provider', icon: 'P' },
  category: { label: 'Category', icon: 'C' },
};

const CategoryIcon = ({ id, className }: { id: string; className?: string }) => {
  const Icon = getCategoryIcon(id);
  return <Icon className={className} />;
};

// ---------------------------------------------------------------------------
// Iconos compartidos (trazos estándar tipo Lucide, verificados).
// ---------------------------------------------------------------------------
const IconShieldCheck = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconInfo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const IconAlert = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const IconScale = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

/** Logo de proveedor: SVG oficial desde el CDN si existe, wordmark si no. */
const BrandLogo = ({ id, className }: { id: string; className?: string }) => {
  const img = BRAND_IMG[id];
  if (img) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-white/90 p-1.5 ${className || ''}`}
        title={id}
      >
        <img src={img} alt={`${id} logo`} className="h-full w-full object-contain" loading="lazy" />
      </span>
    );
  }
  const mark = BRAND_WORDMARK[id];
  if (mark) {
    return (
      <span
        className={`inline-flex items-center justify-center font-black tracking-tight ${className || ''}`}
        style={{ color: mark.color }}
      >
        {mark.text}
      </span>
    );
  }
  return null;
};

// Marcas sin SVG oficial: iniciales con el color corporativo. Cada emisor tiene
// su PROPIO icono, de modo que la etiqueta de universidad/emisor siempre muestra
// icono + texto (nunca un cuadro vacío).
const PROVIDER_MARK: Record<string, { text: string; color: string }> = {
  'ef-set': { text: 'EF', color: '#00A3E0' },
  'penn-elp': { text: 'PENN', color: '#990000' },
  '16personalities': { text: '16P', color: '#00C9A7' },
  'online-es': { text: 'ES', color: '#F472B8' },
  'simplelearn': { text: 'SL', color: '#FF7A1A' },
  other: { text: 'DOC', color: '#94A3B8' },
};

/**
 * Icono de la etiqueta de universidad/emisor: SVG oficial si existe, iniciales
 * de marca si no. Se usa en los filtros y en los tags de cada certificado.
 */
const ProviderIcon = ({ id, className }: { id: string; className?: string }) => {
  const IconComponent = {
    cisco: CiscoIcon,
    microsoft: MicrosoftIcon,
    ibm: IbmIcon,
    hp: HpIcon,
    simplelearn: SimpleLearnIcon,
  }[id];

  if (IconComponent) {
    return <IconComponent className={className} style={{ color: 'inherit' }} />;
  }

  const img = BRAND_IMG[id];
  if (img) {
    return <img src={img} alt="" className={className} loading="lazy" style={{ objectFit: 'contain' }} />;
  }
  const mark = PROVIDER_MARK[id];
  if (!mark) return null;
  return (
    <span
      className={`inline-flex items-center justify-center font-black leading-none ${className || ''}`}
      style={{ color: mark.color, fontSize: 6, letterSpacing: '-0.02em' }}
      aria-hidden
    >
      {mark.text}
    </span>
  );
};

const ALL_DOCS: Certificate[] = ALL_DOCUMENTS;

const PROVIDER_OPTIONS = [
  { id: 'cisco', label: 'Cisco Networking Academy', color: '#1B75BC' },
  { id: 'microsoft', label: 'Microsoft Learn', color: '#0078D4' },
  { id: 'ibm', label: 'IBM SkillsBuild', color: '#0096D6' },
  { id: 'hp', label: 'HP Life', color: '#0096D6' },
  { id: 'ef-set', label: 'EF SET (Education First)', color: '#00A3E0' },
  { id: 'penn-elp', label: 'University of Pennsylvania (Penn ELP)', color: '#990000' },
  { id: '16personalities', label: '16Personalities (NERIS Analytics)', color: '#00C9A7' },
  { id: 'online-es', label: 'Online Courses Platform (ES)', color: '#F472B8' },
  { id: 'simplelearn', label: 'SimpleLearn (Simplilearn)', color: '#FF7A1A' },
  { id: 'other', label: 'Other / Unknown', color: '#94A3B8' },
];

function getProviderGroup(cert: Certificate): string {
  const provider = cert.provider.toLowerCase();
  if (provider.includes('cisco')) return 'cisco';
  if (provider.includes('microsoft') || provider.includes('learn.microsoft')) return 'microsoft';
  if (provider.includes('ibm') || provider.includes('skillsbuild')) return 'ibm';
  if (provider.includes('hp') || provider.includes('hp life')) return 'hp';
  if (provider.includes('ef set') || provider.includes('efset')) return 'ef-set';
  if (provider.includes('penn') || provider.includes('english language programs')) return 'penn-elp';
  if (provider.includes('16personalities') || provider.includes('neris')) return '16personalities';
  if (provider.includes('simplelearn') || provider.includes('simplilearn')) return 'simplelearn';
  if (provider.includes('online') || provider.includes('es') || cert.collection?.id === 'cursos-online-es') return 'online-es';
  return 'other';
}

const SORT_OPTIONS = [
  { id: 'date-desc', label: 'Date ↓ (Newest first)', fn: (a: Certificate, b: Certificate) => (b.date || '').localeCompare(a.date || '') },
  { id: 'date-asc', label: 'Date ↑ (Oldest first)', fn: (a: Certificate, b: Certificate) => (a.date || '').localeCompare(b.date || '') },
  { id: 'alpha-asc', label: 'A–Z', fn: (a: Certificate, b: Certificate) => a.title.localeCompare(b.title) },
  { id: 'alpha-desc', label: 'Z–A', fn: (a: Certificate, b: Certificate) => b.title.localeCompare(a.title) },
  { id: 'ref-asc', label: 'Catalog ref ↑', fn: (a: Certificate, b: Certificate) => catalogRef(a).localeCompare(catalogRef(b)) },
  { id: 'provider', label: 'Provider', fn: (a: Certificate, b: Certificate) => a.provider.localeCompare(b.provider) },
  { id: 'category', label: 'Category', fn: (a: Certificate, b: Certificate) => catLabel(a.categories[0] || 'other').localeCompare(catLabel(b.categories[0] || 'other')) },
];

const EXTERNAL_LINKS = [
  { label: 'Cisco Networking Academy', url: 'https://skillsforall.com', logo: 'cisco' },
  { label: 'Microsoft Learn', url: 'https://learn.microsoft.com', logo: 'microsoft' },
  { label: 'IBM SkillsBuild', url: 'https://skillsbuild.org', logo: 'ibm' },
  { label: 'HP Life', url: 'https://www.hp.com/us-en/life.html', logo: 'hp' },
  { label: 'EF SET', url: 'https://www.efset.org', logo: 'ef' },
  { label: 'Penn ELP', url: 'https://www.elp.upenn.edu', logo: 'penn' },
  { label: '16Personalities', url: 'https://www.16personalities.com', logo: '16p' },
  { label: 'SimpleLearn', url: 'https://www.simplilearn.com', logo: 'simplilearn' },
];

const COMPANIES = [
  { name: 'Cisco Networking Academy', logo: 'cisco', desc: 'Global IT training & certification platform (Skills for All).', category: 'Networking & IT' },
  { name: 'Microsoft Learn', logo: 'microsoft', desc: 'Official Microsoft learning platform for cloud, AI, dev tools.', category: 'Cloud & Development' },
  { name: 'IBM SkillsBuild', logo: 'ibm', desc: 'Free digital learning platform by IBM for tech & professional skills.', category: 'Tech & Professional Skills' },
  { name: 'HP Life', logo: 'hp', desc: 'Free business & IT skills training by HP Foundation.', category: 'Business & IT Skills' },
  { name: 'EF SET (Education First)', logo: 'ef', desc: 'Standardized English proficiency test (CEFR-aligned).', category: 'Language Assessment' },
  { name: 'University of Pennsylvania (Penn ELP)', logo: 'penn', desc: 'Ivy League English language programs & certifications.', category: 'Higher Education' },
  { name: '16Personalities (NERIS Analytics)', logo: '16p', desc: 'Personality assessment based on Jungian typology (MBTI-inspired).', category: 'Psychometrics' },
  { name: 'SimpleLearn (Simplilearn)', logo: 'simplilearn', desc: 'Online bootcamps & certifications for digital economy skills.', category: 'Professional Training' },
];

function FilterDropdown({ label, icon, options, value, onChange, colorMap, getLabel, multiple = false, optionIcon }: {
  label: string; icon: React.ReactNode; options: { id: string; label: string }[]; value: string | string[]; onChange: (v: string | string[]) => void; colorMap?: Record<string, string>; getLabel?: (id: string) => string; multiple?: boolean; optionIcon?: (id: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeLabel = multiple
    ? (Array.isArray(value) && value.length === 0 ? `All ${label}` : `${value.length} selected`)
    : (value === 'all' ? label : getLabel ? getLabel(value as string) : options.find(o => o.id === value)?.label || value);
  const activeColor = multiple
    ? '#94a3b8'
    : (value === 'all' ? '#94a3b8' : (colorMap?.[value as string] || '#94a3b8'));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer bg-white/5 hover:bg-white/10"
        style={{ borderColor: open ? activeColor : 'rgba(255,255,255,0.12)', color: activeColor }}
      >
        {icon}
        <span className="max-w-[160px] truncate">{activeLabel}</span>
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 ml-1 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a14]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 py-1.5">
          {multiple ? (
            <>
              <button
                onClick={() => { onChange([]); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${(Array.isArray(value) && value.length === 0) ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                All {label}
              </button>
              {options.map((o) => {
                const color = colorMap?.[o.id] || '#94a3b8';
                const isActive = Array.isArray(value) && value.includes(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      const arr = Array.isArray(value) ? value : [];
                      const next = arr.includes(o.id) ? arr.filter(x => x !== o.id) : [...arr, o.id];
                      onChange(next);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {/* Casilla de multiselección: el filtro es multitag. */}
                    <span
                      className="w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors"
                      style={isActive ? { borderColor: color, backgroundColor: color } : { borderColor: 'rgba(255,255,255,0.3)' }}
                      aria-hidden
                    >
                      {isActive && (
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    {optionIcon && <span className="w-4 h-4 flex items-center justify-center shrink-0" style={{ color }}>{optionIcon(o.id)}</span>}
                    {o.label}
                  </button>
                );
              })}
            </>
          ) : (
            <>
              <button
                onClick={() => { onChange('all'); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${value === 'all' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                All {label}
              </button>
              {options.map((o) => {
                const color = colorMap?.[o.id] || '#94a3b8';
                const isActive = value === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => { onChange(o.id); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                      style={isActive ? { borderColor: color, backgroundColor: color } : { borderColor: 'rgba(255,255,255,0.3)' }}
                      aria-hidden
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    {optionIcon && <span className="w-4 h-4 flex items-center justify-center shrink-0" style={{ color }}>{optionIcon(o.id)}</span>}
                    {o.label}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const meta = sortMeta[value] || sortMeta['date-desc'];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M3 6h18M6 12h12M9 18h6" />
        </svg>
        Sort: {meta.label}
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 ml-1 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a14]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 py-1.5">
          {SORT_OPTIONS.map((s) => {
            const m = sortMeta[s.id] || { label: s.id };
            const isActive = value === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { onChange(s.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-3 ${isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-400">
                  {m.icon}
                </span>
                {m.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


function OwnershipBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border w-fit"
      style={{
        color: '#92400e',
        backgroundColor: '#fef3c7',
        borderColor: '#fbbf24',
      }}
      title="Verificado contra el documento original"
    >
      <IconShieldCheck className="w-3 h-3 shrink-0" />
      Owned by FRANCISCO ANTONIO GARCIA MENOLASCINA
      {!compact && <span aria-hidden>· Verified holder</span>}
    </span>
  );
}

function CertificateCard({
  cert,
  onOpen,
  index,
}: {
  cert: Certificate;
  onOpen: (c: Certificate) => void;
  index: number;
}) {
  const color = catColor(principalCategory(cert));
  const providerGroup = getProviderGroup(cert);
  const provider = PROVIDER_OPTIONS.find((p) => p.id === providerGroup);
  const categories = cert.categories;

  const mainFile = cert.files[0];
  const previewFile = resolvePreview(cert);
  const previewUrl = previewFile
    ? previewFile.isPreview
      ? previewUrlBuilder(previewFile.name)
      : fileUrl(previewFile.name)
    : null;
  const isImage = previewFile && /\.(jpg|jpeg|png|webp)$/i.test(previewFile.name);
  const isPdf = previewFile && /\.pdf$/i.test(previewFile.name);
  const hasRealPreview = mainFile ? !!PREVIEWS_BY_FILE[mainFile.name] : false;

  // Preload image for immediate display
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Preload image on mount
  React.useEffect(() => {
    if (isImage && previewUrl) {
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
    }
  }, [previewUrl, isImage]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      onClick={() => onOpen(cert)}
      className="group text-left p-0 overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
        {previewUrl ? (
          <>
            {isImage ? (
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform group-hover:scale-105">
                {!imageLoaded && !imageError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                    <div className="w-8 h-8 border-2 border-neon-cyan/50 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : imageError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 gap-1">
                    <IconAlert className="w-10 h-10 text-red-400" />
                    <p className="text-[10px] text-red-300 font-bold uppercase tracking-wider">Preview failed to load</p>
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: imageLoaded ? 1 : 0 }}
                    loading="eager"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
            ) : isPdf ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        )}

        <span className="absolute top-2 right-2 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-full z-10 backdrop-blur-md inline-flex items-center gap-1.5"
          style={{
            color,
            backgroundColor: `${color}22`,
            border: `1px solid ${color}66`,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
          <span className="w-3 h-3"><CategoryIcon id={principalCategory(cert)} /></span>
          {catLabel(principalCategory(cert))}
        </span>

        <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-full z-10 backdrop-blur-md inline-flex items-center gap-1"
          style={{ backgroundColor: `${provider?.color || '#94a3b8'}22`, border: `1px solid ${provider?.color || '#94a3b8'}66` }}>
          <ProviderIcon id={providerGroup} className="w-2.5 h-3 shrink-0" />
          {provider?.label || 'Other'}
        </span>

        {previewUrl && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-md px-2 py-0.5 z-10">
            <span className="text-[9px] font-bold text-white/90 uppercase tracking-wider">
              {isImage ? 'Image' : 'PDF'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-header font-bold text-[15px] text-white leading-snug group-hover:text-neon-blue transition-colors line-clamp-2">
            {cert.title}
          </h3>
          <p className="mt-1 text-xs text-gray-400 line-clamp-1">{cert.provider}</p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {fmtDate(cert.date)}
          </span>
          {cert.files.length > 1 && (
            <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
              {cert.files.length} files
            </span>
          )}
        </div>

        {/* Etiquetas del documento: muestra hasta 3 tags (principal + hasta 2 secundarios).
            Al entrar al detalle se ven TODAS las categorías. */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {categories.slice(0, 3).map((catId) => {
            const c = catColor(catId);
            return (
              <span
                key={catId}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border"
                style={{ color: c, backgroundColor: `${c}14`, borderColor: `${c}55` }}
              >
                <CategoryIcon id={catId} className="w-3 h-3 shrink-0" />
                {catLabel(catId)}
              </span>
            );
          })}
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border"
            style={{
              color: provider?.color || '#94a3b8',
              backgroundColor: `${provider?.color || '#94a3b8'}14`,
              borderColor: `${provider?.color || '#94a3b8'}55`,
            }}
          >
            <ProviderIcon id={providerGroup} className="w-3.5 h-3.5 shrink-0" />
            {provider?.label || 'Other'}
          </span>
        </div>

        {/* Nomenclatura de catálogo + tag de posesión — presentes en TODAS las cards */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className="font-mono text-[10px] tracking-tight text-neon-cyan bg-neon-cyan/5 border border-neon-cyan/25 rounded-md px-1.5 py-0.5"
            title="Referencia interna de catálogo"
          >
            {catalogRef(cert)}
          </span>
          <OwnershipBadge compact />
        </div>
      </div>
    </motion.button>
  );
}

function DetailModal({
  cert,
  related,
  onClose,
  onPick,
}: {
  cert: Certificate;
  related: Certificate[];
  onClose: () => void;
  onPick: (c: Certificate) => void;
}) {
  const providerGroup = getProviderGroup(cert);
  const provider = PROVIDER_OPTIONS.find((p) => p.id === providerGroup);
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'files'>('preview');

  const shareUrl = () => `${window.location.origin}/certificates#${cert.id}`;

  const doShare = async () => {
    const url = shareUrl();
    try {
      if (navigator.share) {
        await navigator.share({ title: cert.title, text: `${cert.title} — ${cert.provider}`, url });
        return;
      }
      throw new Error('no-share');
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied('link');
        setTimeout(() => setCopied(null), 2000);
      } catch {
        setCopied(null);
      }
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(cert.credentialId || '');
      setCopied('id');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const mainFile = cert.files[0];
  const previewFile = resolvePreview(cert);
  const previewUrl = previewFile
    ? previewFile.isPreview
      ? previewUrlBuilder(previewFile.name)
      : fileUrl(previewFile.name)
    : null;
  const isImage = previewFile && /\.(jpg|jpeg|png|webp)$/i.test(previewFile.name);
  const isPdf = previewFile && /\.pdf$/i.test(previewFile.name);
  const hasRealPreview = mainFile ? !!PREVIEWS_BY_FILE[mainFile.name] : false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/85 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl my-auto rounded-2xl border border-white/10 bg-[#0a0a14]/95 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 flex items-center justify-center transition-all cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Etiquetas de categoría: se muestran TODAS las categorías del documento,
              cada una con su icono y su texto. La principal es la primera. */}
          <div className="flex flex-wrap items-center gap-1.5">
            {cert.categories.map((catId) => {
              const c = catColor(catId);
              return (
                <span
                  key={catId}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border"
                  style={{ color: c, backgroundColor: `${c}1a`, borderColor: `${c}55` }}
                >
                  <CategoryIcon id={catId} className="w-3.5 h-3.5" />
                  {catLabel(catId)}
                </span>
              );
            })}
            <span
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border"
              style={{
                color: provider?.color || '#94a3b8',
                backgroundColor: `${provider?.color || '#94a3b8'}1a`,
                borderColor: `${provider?.color || '#94a3b8'}55`,
              }}
            >
              <ProviderIcon id={providerGroup} className="w-3.5 h-3.5" />
              {provider?.label || 'Other'}
            </span>
          </div>

          <h2 className="mt-3 font-header font-black text-2xl text-white leading-tight pr-8">{cert.title}</h2>
          <p className="mt-1 text-sm text-gray-300">
            {cert.provider}
            {cert.providerUrl && (
              <a
                href={cert.providerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-xs text-neon-blue hover:underline"
              >
                {new URL(cert.providerUrl).hostname}
              </a>
            )}
          </p>

          <div className="mt-3">
            <OwnershipBadge />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-400">
            <span className={`flex items-center gap-1.5 ${cert.date ? '' : 'text-amber-400/80'}`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {fmtDate(cert.date)}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-neon-cyan" title="Referencia interna de catálogo">
              {catalogRef(cert)}
            </span>
            {cert.level && <span>{cert.level}</span>}
            {cert.credentialId && (
              <button
                onClick={copyId}
                title="Copy credential ID"
                className="flex items-center gap-1.5 text-neon-cyan hover:underline cursor-pointer font-mono"
              >
                {copied === 'id' ? 'Copied ✓' : cert.credentialLabel || 'ID'}:
                <span className="font-mono text-[11px]">{cert.credentialId}</span>
              </button>
            )}
          </div>

          {cert.summary && <p className="mt-4 text-sm text-gray-300 leading-relaxed">{cert.summary}</p>}
          {cert.note && (
            <p className="mt-2 text-xs text-gray-500 italic border-l-2 border-white/10 pl-3">{cert.note}</p>
          )}

          {cert.verify && cert.verify.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {cert.verify.map((v) => (
                <a
                  key={v.url}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border text-neon-cyan border-neon-cyan/40 hover:bg-neon-cyan/10 transition-all"
                >
                  {v.label}
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10">
          <div className="flex items-center justify-between px-6 sm:px-8 pt-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
              Document preview
            </p>
            <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('files')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'files'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Files ({cert.files.length})
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 pt-4">
            {viewMode === 'preview' ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                {previewUrl ? (
                  isImage ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt=""
                        className="w-full h-64 sm:h-80 object-contain bg-black/40"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                          Image preview
                        </span>
                      </div>
                    </div>
                   ) : isPdf ? (
                    <div className="relative">
                      {hasRealPreview ? (
                        <img
                          src={previewUrl}
                          alt=""
                          className="w-full h-64 sm:h-80 object-contain bg-black/40"
                        />
                      ) : (
                        <div className="w-full h-64 sm:h-80 bg-black/40 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                          {hasRealPreview ? 'PDF thumbnail' : 'PDF preview'}
                        </span>
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/10 hover:bg-white/20 transition-all border border-white/20"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                           Open
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto text-white/30" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <p className="text-sm text-white/60 mt-3">Preview not available</p>
                      <p className="text-xs text-white/40 mt-1">Use the files section to view the document</p>
                    </div>
                  )
                ) : (
                  <div className="p-8 text-center">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto text-white/30" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <p className="text-sm text-white/60 mt-3">No preview available</p>
                    <p className="text-xs text-white/40 mt-1">Use the files section to view the document</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {cert.files.map((f, i) => (
                  <div
                    key={f.name}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-gray-300 block truncate">{f.label}</span>
                      <span className="font-mono text-[10px] text-gray-600 block truncate mt-1">{f.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={fileUrl(f.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                      </a>
                      <a
                        href={fileUrl(f.name)}
                        download={f.name}
                        onClick={() => toast(`¡Gracias por descargar ${f.label}! Gracias por apoyar Ciszu Network.`, 'success')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-neon-blue/20 border border-neon-blue/40 hover:bg-neon-blue hover:text-white transition-all"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={doShare}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border border-white/15 text-white hover:border-white/40 hover:bg-white/10 transition-all cursor-pointer"
            >
              {copied === 'link' ? 'Link copied ✓' : 'Share'}
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            {cert.collection && (
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border border-white/10 text-gray-300">
                Collection: {cert.collection.name}
              </span>
            )}
          </div>

          {related.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                Similar certificates — same {cert.collection ? 'collection' : 'category'}
              </p>
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onPick(r)}
                    className="text-left px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:border-neon-blue/60 hover:bg-neon-blue/10 transition-all cursor-pointer"
                  >
                    <span className="block text-xs font-bold text-gray-200 max-w-[240px] truncate">{r.title}</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5">{r.provider}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CertificatesPage() {
  usePageTitle('Certificates & Documents');
  const [category, setCategory] = useState<string[]>([]);
  const [provider, setProvider] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<string>('date-desc');
  const [selected, setSelected] = useState<Certificate | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = ALL_DOCS.filter((c) => {
      if (category.length > 0 && !c.categories.some((id) => category.includes(id))) return false;
      if (provider.length > 0 && !provider.includes(getProviderGroup(c))) return false;
      if (!q) return true;
      const hay = `${c.title} ${c.provider} ${c.collection?.name || ''} ${fmtDate(c.date)} ${c.credentialId || ''} ${c.credentialLabel || ''} ${catalogRef(c)}`.toLowerCase();
      return hay.includes(q);
    });

    const sortFn = SORT_OPTIONS.find(s => s.id === sort)?.fn || SORT_OPTIONS[0].fn;
    result.sort(sortFn);
    return result;
  }, [category, provider, query, sort]);

const relatedOf = (c: Certificate) =>
  ALL_DOCS.filter(
    (x) =>
      x.id !== c.id &&
      (c.collection
        ? x.collection?.id === c.collection.id
        : x.categories.some((cat) => c.categories.includes(cat))),
  ).slice(0, 5);

  // Modo "all" (sin filtros ni búsqueda): se divide por categoría principal.
  // Un documento aparece UNA SOLA VEZ en la sección de su categoría principal
  // (el primer tag del array). Así no se duplica aunque tenga 3 tags.
  const grouped = useMemo(() => {
    if (category.length > 0 || provider.length > 0 || query) return null;
    const map = new Map<string, Certificate[]>();
    for (const c of filtered) {
      const principal = principalCategory(c);
      if (!map.has(principal)) map.set(principal, []);
      map.get(principal)!.push(c);
    }
    return CATEGORIES.map((cat) => ({
      cat,
      items: map.get(cat.id) || [],
    })).filter((g) => g.items.length > 0);
  }, [filtered, category, provider, query]);

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="certificates"
          title="Certificates & Documents"
          subtitle={`${ALL_DOCS.length} total documents · ${CERTIFICATES.length} certificates · ${OTHER_DOCS.length} supporting docs · catalog CKO-*`}
          theme={THEME}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <FilterDropdown
              label="Category"
              icon={<svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M4 6h16M4 12h16M4 18h16" /></svg>}
              options={CATEGORIES.filter((c) => c.id !== 'other')}
              value={category}
              onChange={(v) => setCategory(v as string[])}
              colorMap={Object.fromEntries(CATEGORIES.map(c => [c.id, c.color]))}
              getLabel={catLabel}
              multiple
              optionIcon={(id) => <CategoryIcon id={id} className="w-4 h-4" />}
            />
            <FilterDropdown
              label="University / Provider"
              icon={<svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5l6 3 6-3v-5" /></svg>}
              options={PROVIDER_OPTIONS}
              value={provider}
              onChange={(v) => setProvider(v as string[])}
              colorMap={Object.fromEntries(PROVIDER_OPTIONS.map(p => [p.id, p.color]))}
              getLabel={providerLabel}
              multiple
              optionIcon={(id) => <ProviderIcon id={id} className="w-4 h-4" />}
            />
            <SortDropdown value={sort} onChange={setSort} />
          </div>

          <div className="max-w-md mx-auto relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by course, provider, category, catalog ref…"
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-neon-blue transition-all"
            />
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">
              Showing {filtered.length} of {ALL_DOCS.length}
            </span>
            {(category.length > 0 || provider.length > 0 || query || sort !== 'date-desc') && (
              <button
                onClick={() => { setCategory([]); setProvider([]); setQuery(''); setSort('date-desc'); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border border-neon-pink/40 text-neon-pink hover:bg-neon-pink/10 transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                Clear filters
              </button>
            )}
          </div>
        </motion.div>

        {filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {grouped ? (
              grouped.map(({ cat, items }) => {
                const color = cat.color;
                const label = cat.label;
                return (
                  <motion.section
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2" style={{ color }}>
                      <CategoryIcon id={cat.id} className="w-4 h-4" />
                      <h3 className="text-sm font-black uppercase tracking-widest" style={{ color }}>{label}</h3>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">({items.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((c, i) => (
                        <CertificateCard key={c.id} cert={c} index={i} onOpen={setSelected} />
                      ))}
                    </div>
                  </motion.section>
                );
              })
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((c, i) => (
                  <CertificateCard key={c.id} cert={c} index={i} onOpen={setSelected} />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <IconInfo className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-bold">No documents match your filters.</p>
            <p className="text-gray-600 text-xs mt-1">
              {filtered.length} of {ALL_DOCS.length} documents shown
            </p>
            <button
              onClick={() => {
                setCategory([]);
                setProvider([]);
                setQuery('');
                setSort('date-desc');
              }}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-bold border border-white/15 text-gray-300 hover:text-white hover:border-white/40 transition-all cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="font-header font-black text-2xl text-white text-center mb-6">
            Official Verification Links
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {OFFICIAL_LINKS.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                {l.label}
              </a>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-10"
        >
          <h2 className="font-header font-black text-2xl text-white text-center mb-6">
            External Resources & Platforms
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {EXTERNAL_LINKS.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10 transition-all"
              >
                <BrandLogo id={l.logo} className="w-4 h-4" />
                {l.label}
              </a>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <h2 className="font-header font-black text-2xl text-white text-center mb-6">
            Organizations & Platforms Referenced
          </h2>
          <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-6">
            Companies, academies, and platforms mentioned across certificates
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPANIES.map((c) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/5 border border-white/10">
                  <BrandLogo id={c.logo} className="w-10 h-10 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-header font-bold text-white truncate">{c.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{c.category}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{c.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10 p-5 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex gap-3">
            <IconScale className="w-5 h-5 text-neon-pink shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">Fair use — honest portfolio display</p>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                All documents on this page belong to their respective issuers and are shown for
                portfolio purposes only, under fair use and with full authority of the holder. They
                are never modified or falsified, and they never impersonate any institution. Each
                credential is labeled with the real data extracted from the original file; when the
                issuer or date is not stated in the document, it is explicitly noted. The complete
                legal terms are available on the <a href="/policies" className="text-neon-blue hover:underline">Policies</a> page.
              </p>
              <p className="mt-2 text-xs text-gray-500 italic">
                Holder: <span className="font-bold text-white">FRANCISCO ANTONIO GARCIA MENOLASCINA</span>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <OwnershipBadge />
          <p className="mt-3 text-xs text-gray-600">
            Documents stored in the Ciszu Network CDN and verified against the original files.
          </p>
        </motion.div>
      </PageReveal>

      <AnimatePresence>
        {selected && (
          <DetailModal
            cert={selected}
            related={relatedOf(selected)}
            onClose={() => setSelected(null)}
            onPick={(c) => setSelected(c)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
