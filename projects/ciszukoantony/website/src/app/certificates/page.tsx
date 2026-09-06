'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  CATEGORIES,
  CERTIFICATES,
  OFFICIAL_LINKS,
  OTHER_DOCS,
  type Certificate,
} from '@/data/certificates';
import { PREVIEWS_BY_FILE } from '@/data/certificates.previews';
import QuickDocks from '@/components/molecules/QuickDocks';

const CDN_BASE =
  process.env.NEXT_PUBLIC_CDN_URL ||
  'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn';

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

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[(m || 1) - 1]} ${y}`;
};

const catColor = (id: string) => CATEGORIES.find((c) => c.id === id)?.color || '#94a3b8';
const catLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label || id;

const ALL_DOCS: Certificate[] = [...CERTIFICATES, ...OTHER_DOCS];

const PROVIDER_OPTIONS = [
  { id: 'cisco', label: 'Cisco Networking Academy', color: '#1B75BC' },
  { id: 'microsoft', label: 'Microsoft Learn', color: '#0078D4' },
  { id: 'ibm', label: 'IBM SkillsBuild', color: '#0096D6' },
  { id: 'hp', label: 'HP Life', color: '#0096D6' },
  { id: 'ef-set', label: 'EF SET (Education First)', color: '#00A3E0' },
  { id: 'penn-elp', label: 'University of Pennsylvania (Penn ELP)', color: '#990000' },
  { id: '16personalities', label: '16Personalities (NERIS Analytics)', color: '#00C9A7' },
  { id: 'online-es', label: 'Online Courses Platform (ES)', color: '#F472B6' },
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
  if (provider.includes('online') || provider.includes('es') || cert.collection?.id === 'cursos-online-es') return 'online-es';
  return 'other';
}

const SORT_OPTIONS = [
  { id: 'date-desc', label: 'Date ↓ (Newest first)', fn: (a: Certificate, b: Certificate) => (b.date || '').localeCompare(a.date || '') },
  { id: 'date-asc', label: 'Date ↑ (Oldest first)', fn: (a: Certificate, b: Certificate) => (a.date || '').localeCompare(b.date || '') },
  { id: 'alpha-asc', label: 'A–Z', fn: (a: Certificate, b: Certificate) => a.title.localeCompare(b.title) },
  { id: 'alpha-desc', label: 'Z–A', fn: (a: Certificate, b: Certificate) => b.title.localeCompare(a.title) },
  { id: 'provider', label: 'Provider', fn: (a: Certificate, b: Certificate) => a.provider.localeCompare(b.provider) },
  { id: 'category', label: 'Category', fn: (a: Certificate, b: Certificate) => catLabel(a.category).localeCompare(catLabel(b.category)) },
];

const EXTERNAL_LINKS = [
  { label: 'Cisco Networking Academy', url: 'https://skillsforall.com', icon: '🔗' },
  { label: 'Microsoft Learn', url: 'https://learn.microsoft.com', icon: '📚' },
  { label: 'IBM SkillsBuild', url: 'https://skillsbuild.org', icon: '🏷️' },
  { label: 'HP Life', url: 'https://www.hp.com/us-en/life.html', icon: '💻' },
  { label: 'EF SET', url: 'https://www.efset.org', icon: '🇬🇧' },
  { label: 'Penn ELP', url: 'https://www.elp.upenn.edu', icon: '🎓' },
  { label: '16Personalities', url: 'https://www.16personalities.com', icon: '🧠' },
  { label: 'Simplilearn', url: 'https://simpli-web.app.link/e/aaWENDBP75b', icon: '📜' },
];

const COMPANIES = [
  { name: 'Cisco Networking Academy', logo: 'cisco', desc: 'Global IT training & certification platform (Skills for All).', category: 'Networking & IT' },
  { name: 'Microsoft Learn', logo: 'microsoft', desc: 'Official Microsoft learning platform for cloud, AI, dev tools.', category: 'Cloud & Development' },
  { name: 'IBM SkillsBuild', logo: 'ibm', desc: 'Free digital learning platform by IBM for tech & professional skills.', category: 'Tech & Professional Skills' },
  { name: 'HP Life', logo: 'hp', desc: 'Free business & IT skills training by HP Foundation.', category: 'Business & IT Skills' },
  { name: 'EF SET (Education First)', logo: 'ef', desc: 'Standardized English proficiency test (CEFR-aligned).', category: 'Language Assessment' },
  { name: 'University of Pennsylvania (Penn ELP)', logo: 'penn', desc: 'Ivy League English language programs & certifications.', category: 'Higher Education' },
  { name: '16Personalities (NERIS Analytics)', logo: '16p', desc: 'Personality assessment based on Jungian typology (MBTI-inspired).', category: 'Psychometrics' },
  { name: 'Simplilearn', logo: 'simplilearn', desc: 'Online bootcamps & certifications for digital economy skills.', category: 'Professional Training' },
];

function CertificateCard({
  cert,
  onOpen,
  index,
}: {
  cert: Certificate;
  onOpen: (c: Certificate) => void;
  index: number;
}) {
  const color = catColor(cert.category);
  const providerGroup = getProviderGroup(cert);

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
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform group-hover:scale-105"
                style={{
                  backgroundImage: `url(${previewUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
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

        <span className="absolute top-2 right-2 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-full z-10 backdrop-blur-md"
          style={{
            color,
            backgroundColor: `${color}22`,
            border: `1px solid ${color}66`,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
          {catLabel(cert.category)}
        </span>

        <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-full z-10 backdrop-blur-md"
          style={{ backgroundColor: PROVIDER_OPTIONS.find(p => p.id === providerGroup)?.color + '22' || '#94a3b822', border: `1px solid ${PROVIDER_OPTIONS.find(p => p.id === providerGroup)?.color || '#94a3b8'}66` }}>
          {PROVIDER_OPTIONS.find(p => p.id === providerGroup)?.label || 'Other'}
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
  const color = catColor(cert.category);
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
          <span
            className="inline-block text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full"
            style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
          >
            {catLabel(cert.category)}
          </span>

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

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {fmtDate(cert.date)}
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
                            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542-7-4.477 0-8.268-2.943-9.542-7z" />
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
                          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542-7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </a>
                      <a
                        href={fileUrl(f.name)}
                        download={f.name}
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
  const [category, setCategory] = useState<string>('all');
  const [provider, setProvider] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<string>('date-desc');
  const [selected, setSelected] = useState<Certificate | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = ALL_DOCS.filter((c) => {
      if (category !== 'all' && c.category !== category) return false;
      if (provider !== 'all' && getProviderGroup(c) !== provider) return false;
      if (!q) return true;
      const hay = `${c.title} ${c.provider} ${c.collection?.name || ''} ${fmtDate(c.date)}`.toLowerCase();
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
        (c.collection ? x.collection?.id === c.collection.id : x.category === c.category),
    ).slice(0, 5);

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent mb-3">
            Certificates & Documents
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">
            {ALL_DOCS.length} total documents · {CERTIFICATES.length} certificates · {OTHER_DOCS.length} supporting docs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                category === 'all'
                  ? 'bg-white text-black border-white'
                  : 'text-gray-300 border-white/15 hover:border-white/40 hover:text-white'
              }`}
            >
              All
            </button>
            {CATEGORIES.filter((c) => c.id !== 'other').map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(category === c.id ? 'all' : c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  category === c.id
                    ? 'text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
                style={
                  category === c.id
                    ? { backgroundColor: c.color, borderColor: c.color }
                    : { borderColor: `${c.color}55`, color: undefined }
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9h6v6H9z" />
                  </svg>
                  {c.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 mr-1">Provider:</span>
            <button
              onClick={() => setProvider('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                provider === 'all'
                  ? 'bg-white text-black border-white'
                  : 'text-gray-300 border-white/15 hover:border-white/40 hover:text-white'
              }`}
            >
              All
            </button>
            {PROVIDER_OPTIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(provider === p.id ? 'all' : p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  provider === p.id
                    ? 'text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
                style={
                  provider === p.id
                    ? { backgroundColor: p.color, borderColor: p.color }
                    : { borderColor: `${p.color}55`, color: undefined }
                }
              >
                {p.label}
              </button>
            ))}
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
              placeholder="Search by course, provider, collection, date…"
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-neon-blue transition-all"
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-neon-blue outline-none"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((c, i) => (
              <CertificateCard key={c.id} cert={c} index={i} onOpen={setSelected} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No documents match your search.</p>
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
                <span className="text-base">🔗</span>
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
                <span className="text-base">{l.icon}</span>
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
                    {c.logo === 'cisco' && (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    )}
                    {c.logo === 'microsoft' && (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                        <path d="M18.7 15.3c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4v2h-4v4h4v2h-4v4c0 1.1-.9 2-2 2zm-14.6 1.4c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-4v2h4v4h-4v4h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4v-2h4v-4h-4v-4h4zM5.5 7.4c0-1.1.9-2 2-2h4v2h-4v4h-4v-4h-4v-2h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4v-2h4v-4h-4v4h-4zm13 1.1c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4zm0-10.5c-1.1 0-2-.9-2-2h-4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2z" />
                      </svg>
                    )}
                    {c.logo === 'ibm' && (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                        <text x="2" y="18" fontSize="16" fontWeight="bold">IBM</text>
                      </svg>
                    )}
                    {c.logo === 'hp' && (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                        <text x="4" y="18" fontSize="14" fontWeight="bold">HP</text>
                      </svg>
                    )}
                    {c.logo === 'ef' && (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                        <text x="4" y="18" fontSize="14" fontWeight="bold">EF</text>
                      </svg>
                    )}
                    {c.logo === 'penn' && (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                        <text x="4" y="18" fontSize="14" fontWeight="bold">Penn</text>
                      </svg>
                    )}
                    {c.logo === '16p' && (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                        <text x="2" y="18" fontSize="16" fontWeight="bold">16P</text>
                      </svg>
                    )}
                    {c.logo === 'simplilearn' && (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                        <text x="2" y="18" fontSize="14" fontWeight="bold">SL</text>
                      </svg>
                    )}
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
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-neon-pink shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-xs text-gray-600"
        >
          Constantly learning — documents are stored in the Ciszu Network CDN and verified against
          the original files.
        </motion.p>
      </div>

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

      <QuickDocks />
    </div>
  );
}