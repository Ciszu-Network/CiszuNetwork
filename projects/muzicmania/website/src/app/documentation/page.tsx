'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { DOCS_METADATA, DocMetadata } from '@/config/docs';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { usePageTitle } from '@/lib/usePageTitle';

// --- Icons Library (Pure SVG) ---
const I = {
  book: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  file: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  search: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  download: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  sync: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><polyline points="21 3 21 8 16 8"/></svg>,
  terminal: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  clock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  user: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  zip: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M12 12V3"/><path d="M16 8l-4 4-4-4"/></svg>,
  info: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  about: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r="1.2" fill="currentColor"/></svg>,
  shield: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  history: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
  mail: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  star: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  helpCircle: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  compass: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  lifeBuoy: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>,
  list: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  lock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  bookOpen: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  users: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  activity: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  trophy: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  music: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  messageSquare: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  barChart: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  fileText: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  word: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M9 15l1.5-6h1l1 3 1-3h1L15 15h-1l-1-4-1 4h-1l-1-4-1 4z"/></svg>,
  rar: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M12 12v6"/><path d="M10 15h4"/></svg>,
  chrome: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>,
  browser: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="18" rx="2" ry="2"/><line x1="2" y1="8" x2="22" y2="8"/></svg>,
  edit: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

// --- Software Recommendations ---
const SOFTWARE_TOOLS = [
  { name: 'WinRAR', url: 'https://www.win-rar.com/', icon: I.rar, color: 'text-neon-purple' },
  { name: '7-Zip', url: 'https://www.7-zip.org/', icon: I.zip, color: 'text-neon-pink' },
  { name: 'Chrome', url: 'https://www.google.com/chrome/', icon: I.chrome, color: 'text-neon-blue' },
  { name: 'Firefox', url: 'https://www.mozilla.org/firefox/', icon: I.browser, color: 'text-neon-cyan' },
  { name: 'Notepad++', url: 'https://notepad-plus-plus.org/', icon: I.edit, color: 'text-neon-green' },
  { name: 'MS Word', url: 'https://www.microsoft.com/word', icon: I.word, color: 'text-neon-blue' },
];

// ── Color maps a nivel de módulo: strings completos para que Tailwind NO los purgue en build ──
const FMT_COLOR: Record<string, { hover: string; text: string; drop: string }> = {
  blue:   { hover: 'hover:border-neon-blue',   text: 'text-neon-blue',   drop: 'drop-shadow-neon-blue' },
  cyan:   { hover: 'hover:border-neon-cyan',   text: 'text-neon-cyan',   drop: 'drop-shadow-neon-cyan' },
  pink:   { hover: 'hover:border-neon-pink',   text: 'text-neon-pink',   drop: 'drop-shadow-neon-pink' },
  purple: { hover: 'hover:border-neon-purple', text: 'text-neon-purple', drop: 'drop-shadow-neon-purple' },
};
const PKG_COLOR: Record<string, { bg: string; border: string; hover: string; text: string }> = {
  blue:   { bg: 'bg-neon-blue/5',   border: 'border-neon-blue/20',   hover: 'hover:bg-neon-blue/10',   text: 'text-neon-blue' },
  purple: { bg: 'bg-neon-purple/5', border: 'border-neon-purple/20', hover: 'hover:bg-neon-purple/10', text: 'text-neon-purple' },
  pink:   { bg: 'bg-neon-pink/5',   border: 'border-neon-pink/20',   hover: 'hover:bg-neon-pink/10',   text: 'text-neon-pink' },
};

export default function DocumentationPortal() {
  usePageTitle('DOCUMENTATION');
  const [selectedDoc, setSelectedDoc] = useState('DOCUMENTATION');
  const [searchQuery, setSearchQuery] = useState('');
  const [content, setContent] = useState('');
  const [format, setFormat] = useState<'txt' | 'md'>('txt');
  const [loading, setLoading] = useState(false);

  const docIds = Object.keys(DOCS_METADATA).sort();
  const filteredDocs = docIds.filter(id => 
    id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    DOCS_METADATA[id].title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const meta = DOCS_METADATA[selectedDoc];

  useEffect(() => {
    fetchContent();
  }, [selectedDoc, format]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const path = `/docs/${format}/${selectedDoc}.${format}`;
      const res = await fetch(path);
      if (res.ok) {
        const text = await res.text();
        const identifier = `${selectedDoc}_V${meta.version}_${meta.lastUpdate.replace(/-/g, '_')}_MUZICMANIA`;
        const header = format === 'txt' ? `DOCUMENTATION - MUZICMANIA PORTAL\nDOC_ID: ${selectedDoc}\nIDENTIFIER: ${identifier}\n------------------------------------------------\n\n` : '';
        const cleanText = text.replace(/^MUZICMANIA - DOCUMENTACIÓN OFICIAL[\s\S]*?------------------------------------------------\n\n/, '')
                             .replace(/^# MUZICMANIA - DOCUMENTACIÓN OFICIAL[\s\S]*?---\n\n/, '');
        setContent(header + cleanText);
      } else {
        setContent('ERROR_DOC_NOT_FOUND: Nodo no localizado en el repositorio: ' + selectedDoc);
      }
    } catch (e) {
      setContent('ERROR_CONNECTION_LOST: Falla en la sincronización con el servidor de documentos.');
    }
    setLoading(false);
  };

  const generateRandomSuffix = () => Math.floor(100000 + Math.random() * 900000).toString();

  const downloadFile = (ext: string) => {
    const identifier = `${selectedDoc}_V${meta.version}_${meta.lastUpdate.replace(/-/g, '_')}_MUZICMANIA`;
    const randomSuffix = generateRandomSuffix();
    const filename = `${identifier}_${randomSuffix}.${ext}`;
    
    if (ext === 'txt' || ext === 'md') {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    } else {
      const a = document.createElement('a');
      a.href = `/docs/${ext}/${selectedDoc}.${ext}`;
      a.download = filename;
      a.click();
    }
  };

  const handlePackageDownload = (pkgExt: string) => {
    const identifier = `${selectedDoc}_V${meta.version}_${meta.lastUpdate.replace(/-/g, '_')}_MUZICMANIA_PKG`;
    const randomSuffix = generateRandomSuffix();
    const filename = `${identifier}_${randomSuffix}.${pkgExt}`;
    
    const a = document.createElement('a');
    a.href = `/docs/${pkgExt}/${selectedDoc}.${pkgExt}`;
    a.download = filename;
    a.click();
  };


  const sectionVariants = {

    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -50, filter: 'blur(10px)' },
    visible: { 
      opacity: 1, 
      x: 0, 
      filter: 'blur(0px)',
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2
      } 
    }
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-neon-blue/5 rounded-full blur-[250px]" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-0 pb-32 space-y-16">
        
        {/* --- DOCUMENTATION HEADER --- */}
        <motion.header 
          id="hero"
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants} 
          className="relative space-y-8 pt-12"
        >
           <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center justify-center gap-6 group">
                 <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
                    {I.bookOpen}
                 </div>
                 <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-white to-neon-purple bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                   DOCUMENTACIÓN
                 </h1>
              </div>
              <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
                SISTEMA DE ASSETS DE ALTA FIDELIDAD V2.0.0
              </p>
           </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* --- SIDEBAR: REPOSITORY --- */}
          <aside className="lg:col-span-4 space-y-8 h-full sticky top-32">
             <div className="p-1 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent shadow-2xl">
                <div className="p-8 bg-doc-dark border border-white/5 rounded-[2.9rem] flex flex-col h-[750px]">
                   <div className="space-y-6 mb-8">
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-blue transition-colors">{I.search}</div>
                         <input 
                           type="text" 
                           placeholder="FILTRAR NODOS..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-black/60 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] focus:border-neon-blue/50 outline-none transition-all placeholder:text-gray-700"
                         />
                      </div>
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{filteredDocs.length} DOCS CARGADOS</span>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                      {filteredDocs.map(id => (
                        <button 
                           key={id}
                           onClick={() => setSelectedDoc(id)}
                           className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all group ${
                             selectedDoc === id ? 'bg-neon-blue/10 border border-neon-blue/30 text-neon-blue shadow-[0_0_20px_rgba(39,158,255,0.1)]' : 'hover:bg-white/5 text-gray-500 border border-transparent'
                           }`}
                        >
                           <div className={`w-5 h-5 flex-shrink-0 ${selectedDoc === id ? 'text-neon-blue' : 'text-gray-600 group-hover:text-gray-400'}`}>
                              {(I as any)[DOCS_METADATA[id].icon] || I.file}
                           </div>
                           <span className="text-[9px] font-black uppercase tracking-widest leading-tight">{DOCS_METADATA[id].title}</span>
                        </button>
                      ))}
                   </div>

                   {/* SOFTWARE RECOMMENDATIONS */}
                   <div className="mt-8 pt-8 border-t border-white/5 space-y-5">
                      <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-2">
                        <div className="w-3 h-3 text-neon-blue">{I.terminal}</div> PROGRAMAS DE USO RECOMENDADOS
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                         {SOFTWARE_TOOLS.map(sw => (
                           <a key={sw.name} href={sw.url} target="_blank" className="p-3 bg-black/60 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all group">
                              <div className={`w-4 h-4 ${sw.color} group-hover:scale-110 transition-transform`}>{sw.icon}</div>
                              <span className="text-[9px] font-black text-gray-500 group-hover:text-white transition-colors uppercase tracking-widest overflow-hidden text-ellipsis">{sw.name}</span>
                           </a>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* FILE INFO PANEL */}
             <div className="p-1 rounded-[3rem] bg-gradient-to-br from-neon-purple/20 to-transparent shadow-2xl">
                <div className="p-8 bg-doc-dark border border-white/10 rounded-[2.9rem] space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-5 h-5 text-neon-purple drop-shadow-neon-purple">{I.info}</div>
                         <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">DETALLES DEL ARCHIVO</h3>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-neon-purple animate-pulse shadow-[0_0_15px_#BF00FF]" />
                   </div>
                   
                   <div className="space-y-4 pt-2">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[9px] font-black text-gray-600 uppercase">Ruta Física</span>
                         <span className="text-[9px] font-black text-white">/docs/{format}/{selectedDoc}.{format}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[9px] font-black text-gray-600 uppercase">MIME Type</span>
                         <span className="text-[9px] font-black text-white">{format === 'txt' ? 'text/plain' : 'text/markdown'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[9px] font-black text-gray-600 uppercase">Nomenclatura</span>
                         <span className="text-[9px] font-black text-white uppercase">v{meta.version}_dynamic</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[9px] font-black text-gray-600 uppercase">Identificador</span>
                         <span className="text-[9px] font-black text-white font-mono uppercase">MZN_NODE_{selectedDoc.slice(0,3)}</span>
                      </div>
                   </div>

                   <p className="text-[9px] text-gray-600 font-bold leading-relaxed uppercase italic">
                      Este documento utiliza codificación UTF-8 verificada para garantizar la compatibilidad con caracteres especiales y nomenclatura dinámica.
                   </p>
                </div>
             </div>
          </aside>

          {/* --- MAIN VISOR --- */}
          <main className="lg:col-span-8 space-y-12">
             {/* DOC INFO HEADER */}
             <motion.div key={selectedDoc} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-12 bg-doc-dark border border-white/10 rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-neon-blue font-black text-[12rem] italic pointer-events-none uppercase tracking-tighter transition-all group-hover:scale-110">{(I as any)[meta.icon] ? selectedDoc : 'DOC'}</div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                   <div className="space-y-6 flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                         <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.2em]">NODE v{meta.version}</span>
                         <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-4 h-4">{I.clock}</div> {meta.lastUpdate}
                         </span>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 text-neon-blue drop-shadow-neon-blue flex-shrink-0">{(I as any)[meta.icon] || I.book}</div>
                         <h2 className="text-4xl md:text-6xl font-header font-black text-white uppercase italic tracking-tighter leading-tight">{meta.title}</h2>
                      </div>
                      <p className="text-gray-400 font-bold text-base md:text-lg leading-snug uppercase max-w-2xl italic border-l-4 border-white/10 pl-6 line-clamp-2">"{meta.description}"</p>
                   </div>
                   <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-black text-white uppercase tracking-widest bg-black/40 px-8 py-4 rounded-3xl border border-white/10 shadow-xl flex-shrink-0 whitespace-nowrap">
                      <div className="w-5 h-5 text-neon-blue">{I.user}</div> {meta.author}
                   </div>
                </div>
             </motion.div>

             {/* THE VISOR */}
             <div className="bg-doc-dark border border-white/10 rounded-[4rem] shadow-2xl overflow-hidden flex flex-col h-[850px] relative">
                <div className="px-12 py-8 border-b border-white/5 bg-black/50 flex items-center justify-between backdrop-blur-xl">
                   <div className="flex items-center gap-4">
                      <div className="w-5 h-5 text-neon-blue drop-shadow-neon-blue animate-pulse">{I.terminal}</div>
                      <span className="text-[11px] font-black text-white uppercase tracking-[0.3em] italic">Visor de Datos de Alta Fidelidad</span>
                   </div>
                   <div className="flex gap-2 bg-black/80 p-2 rounded-2xl border border-white/10 shadow-inner">
                      {(['txt', 'md'] as const).map(f => (
                        <button 
                          key={f}
                          onClick={() => setFormat(f)}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                            format === f ? 'bg-white text-black shadow-2xl scale-105' : 'text-gray-500 hover:text-white'
                          }`}
                        >
                           {f}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex-1 overflow-auto p-12 md:p-16 bg-black/60 relative group/view custom-scrollbar">
                   {loading ? (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-20">
                        <div className="flex flex-col items-center gap-6">
                           <div className="w-16 h-16 border-4 border-neon-blue/10 border-t-neon-blue rounded-full animate-spin" />
                           <p className="text-[11px] font-black text-neon-blue uppercase tracking-[0.5em] animate-pulse">Sincronizando Nodo...</p>
                        </div>
                     </div>
                   ) : (
                     <div className="font-mono text-[14px] md:text-base leading-[1.8] text-gray-300 selection:bg-neon-blue/30 selection:text-white transition-all">
                        {format === 'md' ? (
                          <div className="prose prose-invert max-w-none 
                            prose-headings:font-header prose-headings:uppercase prose-headings:tracking-tighter prose-headings:italic
                            prose-h1:text-4xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
                            prose-p:text-gray-300 prose-p:leading-relaxed
                            prose-li:text-gray-400 prose-strong:text-neon-blue prose-strong:drop-shadow-neon-blue
                            prose-code:bg-black/40 prose-code:p-1 prose-code:rounded prose-code:text-neon-cyan
                          ">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        ) : (
                          <pre className="whitespace-pre-wrap">{content}</pre>
                        )}
                     </div>
                   )}
                </div>

                <div className="h-8 bg-gradient-to-t from-neon-blue/5 to-transparent flex items-center justify-center">
                   <div className="w-32 h-[2px] bg-white/10 rounded-full" />
                </div>
             </div>

             {/* DOWNLOAD SECTION */}
             <div className="p-12 bg-doc-dark border border-white/10 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex items-center justify-between gap-8 border-b border-white/5 pb-8">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 text-neon-blue drop-shadow-neon-blue">{I.download}</div>
                      <div>
                         <h3 className="text-3xl font-header font-black text-white uppercase italic tracking-tighter">CENTRO DE DESCARGAS</h3>
                         <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.3em]">Protocolos de Nomenclatura Dinámica v2.0</p>
                      </div>
                   </div>
                </div>

                {/* FORMATS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                     { ext: 'txt',  label: 'Texto Plano',   color: 'blue' },
                     { ext: 'md',   label: 'Markdown',      color: 'cyan' },
                     { ext: 'pdf',  label: 'Documento PDF', color: 'pink' },
                     { ext: 'docx', label: 'MS Word',       color: 'purple' }
                   ].map(fmt => {
                     const fc = FMT_COLOR[fmt.color];
                     return (
                       <button 
                         key={fmt.ext}
                         onClick={() => downloadFile(fmt.ext)}
                         className={`group relative p-8 bg-black/40 border-t-2 border-white/5 rounded-[2.5rem] ${fc.hover} transition-all text-center space-y-4 overflow-hidden shadow-xl flex flex-col items-center`}
                       >
                         <span className="block text-[11px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors relative z-10">{fmt.label}</span>
                         <div className={`text-3xl font-black ${fc.text} tracking-tighter ${fc.drop} relative z-10`}>.{fmt.ext.toUpperCase()}</div>
                         <div className="pt-2 flex items-center justify-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity relative z-10">
                           <div className="w-3 h-3 text-white">{I.download}</div>
                           <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">OBTENER</span>
                         </div>
                       </button>
                     );
                   })}
                </div>

                {/* COMPRESSION GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { ext: 'zip', icon: I.zip, color: 'blue' },
                     { ext: 'rar', icon: I.rar, color: 'purple' },
                     { ext: '7z',  icon: I.zip, color: 'pink' }
                   ].map(pkg => {
                     const pc = PKG_COLOR[pkg.color];
                     return (
                       <button 
                         key={pkg.ext}
                         onClick={() => handlePackageDownload(pkg.ext)}
                         className={`p-8 ${pc.bg} border ${pc.border} rounded-[2.5rem] ${pc.hover} transition-all flex items-center gap-8 group shadow-lg`}
                       >
                         <div className={`w-12 h-12 ${pc.text} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>{pkg.icon}</div>
                         <div className="text-left space-y-1">
                           <span className="block text-[12px] font-black text-white uppercase tracking-widest italic">PAQUETE {pkg.ext.toUpperCase()}</span>
                           <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Compresión Dinámica</span>
                         </div>
                       </button>
                     );
                   })}
                </div>
             </div>
          </main>
        </div>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
