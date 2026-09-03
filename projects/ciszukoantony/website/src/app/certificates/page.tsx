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

// Los documentos viven en el CDN propio (ciszu-cdn), espejo de shared/docs.
const CDN_BASE =
  process.env.NEXT_PUBLIC_CDN_URL ||
  'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn';

const fileUrl = (name: string) =>
  `${CDN_BASE}/shared/docs/certificados/${name.split('/').map(encodeURIComponent).join('/')}`;

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[(m || 1) - 1]} ${y}`;
};

const catColor = (id: string) => CATEGORIES.find((c) => c.id === id)?.color || '#94a3b8';
const catLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label || id;

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
  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      onClick={() => onOpen(cert)}
      className="group text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 cursor-pointer flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full"
          style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
        >
          {catLabel(cert.category)}
        </span>
        {cert.files.length > 1 && (
          <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
            {cert.files.length} docs
          </span>
        )}
      </div>

      <div>
        <h3 className="font-header font-bold text-[15px] text-white leading-snug group-hover:text-neon-blue transition-colors">
          {cert.title}
        </h3>
        <p className="mt-1 text-xs text-gray-400">{cert.provider}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {fmtDate(cert.date)}
        </span>
        {cert.collection && (
          <span className="truncate max-w-[55%] text-right" title={cert.collection.name}>
            {cert.collection.name}
          </span>
        )}
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
        className="relative w-full max-w-2xl my-auto rounded-2xl border border-white/10 bg-[#0a0a14]/95 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.7)] p-6 sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 flex items-center justify-center transition-all cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <span
          className="inline-block text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full"
          style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
        >
          {catLabel(cert.category)}
        </span>

        <h2 className="mt-3 font-header font-black text-2xl text-white leading-tight">{cert.title}</h2>
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

        <div className="mt-6">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Documents ({cert.files.length})
          </p>
          <div className="space-y-2">
            {cert.files.map((f) => (
              <div
                key={f.name}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
              >
                <span className="text-[13px] text-gray-300 truncate flex-1 min-w-[140px]">{f.label}</span>
                <span className="font-mono text-[10px] text-gray-600 max-w-[200px] truncate">{f.name}</span>
                <div className="flex gap-1.5">
                  <a
                    href={fileUrl(f.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 transition-all"
                  >
                    View
                  </a>
                  <a
                    href={fileUrl(f.name)}
                    download={f.name}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-neon-blue/20 border border-neon-blue/40 hover:bg-neon-blue hover:text-white transition-all"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
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
      </motion.div>
    </motion.div>
  );
}

export default function CertificatesPage() {
  usePageTitle('Certificates');
  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Certificate | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CERTIFICATES.filter((c) => {
      if (category !== 'all' && c.category !== category) return false;
      if (!q) return true;
      const hay = `${c.title} ${c.provider} ${c.collection?.name || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [category, query]);

  const relatedOf = (c: Certificate) =>
    CERTIFICATES.filter(
      (x) =>
        x.id !== c.id &&
        (c.collection ? x.collection?.id === c.collection.id : x.category === c.category),
    ).slice(0, 5);

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent mb-3">
            Certificates
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">
            {CERTIFICATES.length} learning credentials · {OTHER_DOCS.length} supporting documents
          </p>
        </motion.div>

        {/* Official verification links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
        >
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 mr-1">Official links:</span>
          {OFFICIAL_LINKS.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 transition-all"
            >
              {l.label}
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ))}
        </motion.div>

        {/* Fair-use disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 p-5 rounded-2xl border border-white/10 bg-white/[0.02]"
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
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
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
                {c.label}
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
              placeholder="Search by course, provider or collection…"
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-neon-blue transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c, i) => (
              <CertificateCard key={c.id} cert={c} index={i} onOpen={setSelected} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No certificates match your search.</p>
          </div>
        )}

        {/* Supporting documents */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="font-header font-black text-2xl text-white text-center mb-2">
            Supporting documents
          </h2>
          <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-6">
            Transcripts, records & reports — not certificates
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OTHER_DOCS.map((c, i) => (
              <CertificateCard key={c.id} cert={c} index={i} onOpen={setSelected} />
            ))}
          </div>
        </motion.section>

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
    </div>
  );
}
