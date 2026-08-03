'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/templates/MainLayout';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import QuickDocks from '@/components/molecules/QuickDocks';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
// Iconos personalizados SVGs de Sistemas Operativos
const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.102zM10.95 1.937L24 0v11.55H10.95V1.937zM10.95 12.45H24v11.55l-13.05-1.937v-9.613z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 2.99 1.11.09 2.24-.55 3-1.43z" />
  </svg>
);

const LinuxIcon = () => (
  <svg role="img" viewBox="0 0 24 24" className="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139z"/>
  </svg>
);

const AndroidIcon = () => (
  <svg role="img" viewBox="0 0 24 24" className="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.4395 5.5586c-.675 1.1664-1.352 2.3318-2.0274 3.498-.0366-.0155-.0742-.0286-.1113-.043-1.8249-.6957-3.484-.8-4.42-.787-1.8551.0185-3.3544.4643-4.2597.8203-.084-.1494-1.7526-3.021-2.0215-3.4864a1.1451 1.1451 0 00-.1406-.1914c-.3312-.364-.9054-.4859-1.379-.203-.475.282-.7136.9361-.3886 1.5019 1.9466 3.3696-.0966-.2158 1.9473 3.3593.0172.031-.4946.2642-1.3926 1.0177C2.8987 12.176.452 14.772 0 18.9902h24c-.119-1.1108-.3686-2.099-.7461-3.0683-.7438-1.9118-1.8435-3.2928-2.7402-4.1836a12.1048 12.1048 0 00-2.1309-1.6875c.6594-1.122 1.312-2.2559 1.9649-3.3848.2077-.3615.1886-.7956-.0079-1.1191a1.1001 1.1001 0 00-.8515-.5332c-.5225-.0536-.9392.3128-1.0488.5449zm-.0391 8.461c.3944.5926.324 1.3306-.1563 1.6503-.4799.3197-1.188.0985-1.582-.4941-.3944-.5927-.324-1.3307.1563-1.6504.4727-.315 1.1812-.1086 1.582.4941zM7.207 13.5273c.4803.3197.5506 1.0577.1563 1.6504-.394.5926-1.1038.8138-1.584.4941-.48-.3197-.5503-1.0577-.1563-1.6504.4008-.6021 1.1087-.8106 1.584-.4941z"/>
  </svg>
);

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

const LayersIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 12 12 17 22 12"></polyline>
    <polyline points="2 17 12 22 22 17"></polyline>
  </svg>
);

const MobileIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </svg>
);

const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const VersionIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const DownloadOverlay = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center gap-8"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="w-24 h-24 drop-shadow-[0_0_40px_rgba(0,212,255,0.6)]">
        <img
          src={resolveAssetPath('projects/muzicmania/content/logos/imagen/not outline/isotipo/degradado/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')}
          alt="MuzicMania"
          className="w-full h-full object-contain"
        />
      </div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-4xl md:text-6xl font-header font-black uppercase tracking-tighter bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent"
      >
        GRACIAS POR DESCARGAR
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-neon-cyan font-black tracking-[0.3em] uppercase text-xs"
      >
        MUZICMANIA SE ESTÁ PREPARANDO...
      </motion.p>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-gray-600 font-bold tracking-[0.2em] uppercase text-[10px]"
      >
        HAZ CLIC EN CUALQUIER PARTE PARA CERRAR
      </motion.p>
    </motion.div>
  </motion.div>
);

const InfoCard = ({ title, desc, icon, color }: { title: string; desc: string; icon: React.ReactNode; color: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all flex gap-6 items-start relative group overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/5 blur-xl group-hover:bg-${color}/10 transition-all rounded-full`} />
    <div className={`w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-${color} p-3 shrink-0`}>
      {icon}
    </div>
    <div className="space-y-2 relative z-10">
      <h3 className="font-header font-black uppercase text-sm tracking-widest text-white italic">{title}</h3>
      <p className="text-gray-400 text-xs font-bold leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default function DownloadPage() {
  const { showToast } = useAppStore();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Allowlist: valores válidos de SO y arquitectura (vienen de botones fijos)
  const VALID_OS = new Set(['w10', 'w11']);
  const VALID_ARCH = new Set(['x86', 'x64', 'arm']);

  const handleDownloadWindows = (e: React.MouseEvent, os: string, arch: string) => {
    e.preventDefault();
    if (!VALID_OS.has(os) || !VALID_ARCH.has(arch)) return;
    if (!isArchAvailable(os, arch)) {
      const osName = os === 'w10' ? 'Windows 10' : 'Windows 11';
      const archName = arch === 'x86' ? '32 bits' : arch === 'x64' ? '64 bits' : 'ARM64';
      showToast(`[SISTEMA]: El instalador para ${osName} (${archName}) aún no ha sido compilado. Prueba con otra arquitectura.`);
      return;
    }
    setIsDownloading(`${os}-${arch}`);
    const url = new URL('/api/download/windows', window.location.origin);
    url.searchParams.set('os', os);
    url.searchParams.set('arch', arch);
    setTimeout(() => {
      window.location.href = url.toString();
    }, 2000);
  };

  const handleUnsupportedOS = (os: string) => {
    showToast(`[SISTEMA]: La descarga de MuzicMania para ${os} es una función beta cerrada y estará disponible próximamente.`);
  };

  const handleCloseOverlay = () => {
    if (!isDownloading) return;
    setIsDownloading(null);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  // Las combinaciones realmente compiladas (las demas muestran error personalizado)
  const AVAILABLE: Record<string, string[]> = {
    w10: ['x64'],
    w11: ['x64'],
  };

  const archRows: { arch: string; label: string; size: string }[] = [
    { arch: 'x86', label: 'x86 (32 bits)', size: '~ 2.8 MB' },
    { arch: 'x64', label: 'x64 (64 bits)', size: '~ 3.5 MB' },
    { arch: 'arm', label: 'ARM64', size: '~ 3.2 MB' },
  ];

  const isArchAvailable = (os: string, arch: string) => AVAILABLE[os]?.includes(arch);

  return (
    <MainLayout>
      <AnimatePresence>
        {isDownloading && <DownloadOverlay onClose={handleCloseOverlay} />}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Neon Background Glows */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-neon-blue/5 rounded-full blur-[180px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon-pink/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-32 space-y-24">
        
        {/* CABECERA GIGANTE */}
        <motion.header 
          id="hero"
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants} 
          className="relative space-y-8 pt-12"
        >
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                  <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                CENTRO DE DESCARGAS
              </h1>
            </div>
            <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
              INSTALADORES NATIVOS PARA WINDOWS • PRÓXIMAMENTE EN MÁS PLATAFORMAS
            </p>
          </div>
        </motion.header>

        {/* OPCIONES DE DESCARGAS GRIDS */}
        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* macOS y Linux van inline después de Windows, por eso col-3 */}
          {/* WINDOWS PC */}
          <div className="relative group p-1 bg-gradient-to-br from-neon-blue/30 via-transparent to-transparent rounded-[2.5rem] shadow-2xl md:col-span-3">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none" />
            <div className="relative p-8 bg-[#05050a] border border-white/5 rounded-[2.5rem] flex flex-col justify-between backdrop-blur-3xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 text-neon-blue flex items-center justify-center p-2.5 bg-neon-blue/10 border border-neon-blue/20 rounded-2xl">
                    <WindowsIcon />
                  </div>
                  <div>
                    <h2 className="text-xl font-header font-black text-white italic uppercase tracking-tight">WINDOWS EDITION</h2>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mt-0.5">Compatibilidad total x86 • x64 • ARM64</span>
                  </div>
                </div>

                <p className="text-gray-300 font-bold text-xs leading-relaxed">
                  Experiencia nativa con tasa de refresco desbloqueada (soporte 144Hz+), aislamiento total de atajos de teclado y la menor latencia de audio por hardware.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* WINDOWS 10 - MSI */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="text-neon-blue shrink-0">
                        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                          <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.102zM10.95 1.937L24 0v11.55H10.95V1.937zM10.95 12.45H24v11.55l-13.05-1.937v-9.613z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-header font-black text-white uppercase tracking-tight text-sm italic">WINDOWS 10</h3>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Instalador MSI</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {archRows.map(({ arch, label, size }) => {
                        const available = isArchAvailable('w10', arch);
                        return (
                        <div key={`w10-${arch}`} className={`flex items-center justify-between bg-black/40 border ${available ? 'border-white/5' : 'border-rose-900/30'} rounded-xl px-4 py-3`}>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span className={available ? 'text-white' : 'text-gray-600'}>{label}</span>
                            <span className="ml-3 text-gray-600">{size}</span>
                          </div>
                          {available ? (
                            <button
                              onClick={(e) => handleDownloadWindows(e, 'w10', arch)}
                              disabled={isDownloading !== null}
                              className="py-2 px-4 bg-neon-blue/20 text-neon-blue rounded-lg font-header font-black uppercase tracking-widest text-[10px] hover:bg-neon-blue hover:text-black transition-all flex items-center gap-1.5 cursor-pointer border border-neon-blue/30 hover:border-neon-blue disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <DownloadIcon />
                              DESCARGAR
                            </button>
                          ) : (
                            <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest">NO COMPILADO</span>
                          )}
                        </div>
                      )})}
                    </div>
                  </div>

                  {/* WINDOWS 11 - EXE */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="text-neon-cyan shrink-0">
                        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                          <rect x="1" y="1" width="10" height="10" rx="1.5" />
                          <rect x="13" y="1" width="10" height="10" rx="1.5" />
                          <rect x="1" y="13" width="10" height="10" rx="1.5" />
                          <rect x="13" y="13" width="10" height="10" rx="1.5" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-header font-black text-white uppercase tracking-tight text-sm italic">WINDOWS 11</h3>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Instalador EXE</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {archRows.map(({ arch, label, size }) => {
                        const available = isArchAvailable('w11', arch);
                        return (
                        <div key={`w11-${arch}`} className={`flex items-center justify-between bg-black/40 border ${available ? 'border-white/5' : 'border-rose-900/30'} rounded-xl px-4 py-3`}>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span className={available ? 'text-white' : 'text-gray-600'}>{label}</span>
                            <span className="ml-3 text-gray-600">{size}</span>
                          </div>
                          {available ? (
                            <button
                              onClick={(e) => handleDownloadWindows(e, 'w11', arch)}
                              disabled={isDownloading !== null}
                              className="py-2 px-4 bg-neon-cyan/20 text-neon-cyan rounded-lg font-header font-black uppercase tracking-widest text-[10px] hover:bg-neon-cyan hover:text-black transition-all flex items-center gap-1.5 cursor-pointer border border-neon-cyan/30 hover:border-neon-cyan disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <DownloadIcon />
                              DESCARGAR
                            </button>
                          ) : (
                            <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest">NO COMPILADO</span>
                          )}
                        </div>
                      )})}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MACOS PC */}
          <div className="relative group p-1 bg-[#05050a]/40 rounded-[2.5rem] border border-white/5">
            <div className="relative p-8 flex flex-col justify-between min-h-[420px]">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 text-gray-500 flex items-center justify-center p-2.5 bg-white/5 border border-white/10 rounded-2xl">
                    <AppleIcon />
                  </div>
                  <div>
                    <h2 className="text-xl font-header font-black text-gray-400 italic uppercase tracking-tight">MACOS EDITION</h2>
                    <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 block mt-0.5 w-fit">CERRADO</span>
                  </div>
                </div>

                <p className="text-gray-500 font-bold text-xs leading-relaxed">
                  Compilado nativo optimizado tanto para procesadores Apple Silicon (M1/M2/M3) como Intel Core. Actualmente disponible solo para beta testers autorizados.
                </p>

                <div className="space-y-2 text-[10px] text-gray-600 font-black uppercase tracking-widest border-t border-white/5 pt-4">
                  <div className="flex justify-between"><span>VERSIÓN:</span><span>v1.0.0</span></div>
                  <div className="flex justify-between"><span>TAMAÑO:</span><span>~ 4.2 MB</span></div>
                  <div className="flex justify-between"><span>FORMATO:</span><span>Paquete (.DMG)</span></div>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => handleUnsupportedOS('macOS')}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-500 hover:text-white rounded-xl font-header font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative"
                >
                  <LockBadge />
                  UNIRSE A LA BETA
                </button>
              </div>
            </div>
          </div>

          {/* LINUX PC */}
          <div className="relative group p-1 bg-[#05050a]/40 rounded-[2.5rem] border border-white/5">
            <div className="relative p-8 flex flex-col justify-between min-h-[420px]">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 text-gray-500 flex items-center justify-center p-2.5 bg-white/5 border border-white/10 rounded-2xl">
                    <LinuxIcon />
                  </div>
                  <div>
                    <h2 className="text-xl font-header font-black text-gray-400 italic uppercase tracking-tight">LINUX EDITION</h2>
                    <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 block mt-0.5 w-fit">CERRADO</span>
                  </div>
                </div>

                <p className="text-gray-500 font-bold text-xs leading-relaxed">
                  Formato de empaquetado universal para todas las distribuciones principales (Ubuntu, Debian, Fedora, Arch). Seguridad y ligereza máxima en sandboxing.
                </p>

                <div className="space-y-2 text-[10px] text-gray-600 font-black uppercase tracking-widest border-t border-white/5 pt-4">
                  <div className="flex justify-between"><span>VERSIÓN:</span><span>v1.0.0</span></div>
                  <div className="flex justify-between"><span>TAMAÑO:</span><span>~ 3.9 MB</span></div>
                  <div className="flex justify-between"><span>FORMATO:</span><span>AppImage / .DEB</span></div>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => handleUnsupportedOS('Linux')}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-500 hover:text-white rounded-xl font-header font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative"
                >
                  <LockBadge />
                  UNIRSE A LA BETA
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* MOBILE EDITIONS */}
        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants}
          className="space-y-8"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 text-neon-pink">
                <MobileIcon />
              </div>
              <h2 className="text-2xl font-header font-black text-neon-pink italic uppercase tracking-tight">
                EDICIONES MÓVILES
              </h2>
            </div>
            <div className="h-[1px] flex-grow bg-white/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ANDROID */}
            <div className="bg-[#05050a]/40 border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-neon-pink/5 blur-xl group-hover:bg-neon-pink/10 transition-all rounded-full pointer-events-none" />
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 text-gray-500 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-3 shrink-0">
                  <AndroidIcon />
                </div>
                <div className="space-y-1">
                  <h3 className="font-header font-black text-lg text-white uppercase italic">ANDROID MOBILE SHIELD</h3>
                  <p className="text-gray-400 text-xs font-bold leading-relaxed max-w-md">
                    Descarga directa de APK optimizado para pantallas táctiles y tasa de respuesta de Hz adaptable.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleUnsupportedOS('Android')}
                className="w-full md:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-xl border border-white/10 font-header font-black text-xs uppercase tracking-widest shrink-0 transition-all cursor-pointer relative flex items-center justify-center gap-2"
              >
                <LockBadge />
                COMPRAR ALPHA
              </button>
            </div>

            {/* IOS */}
            <div className="bg-[#05050a]/40 border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-neon-pink/5 blur-xl group-hover:bg-neon-pink/10 transition-all rounded-full pointer-events-none" />
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 text-gray-500 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-3 shrink-0">
                  <AppleIcon />
                </div>
                <div className="space-y-1">
                  <h3 className="font-header font-black text-lg text-white uppercase italic">IOS MOBILE EDITION</h3>
                  <p className="text-gray-400 text-xs font-bold leading-relaxed max-w-md">
                    Instalador para iPhones y iPads distribuido a través de Apple TestFlight.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleUnsupportedOS('iOS')}
                className="w-full md:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-xl border border-white/10 font-header font-black text-xs uppercase tracking-widest shrink-0 transition-all cursor-pointer relative flex items-center justify-center gap-2"
              >
                <LockBadge />
                COMPRAR ALPHA
              </button>
            </div>
          </div>
        </motion.section>

        {/* BENEFICIOS DE LA VERSIÓN DE ESCRITORIO */}
        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants}
          className="space-y-10"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 text-white">
                <WrenchIcon />
              </div>
              <h2 className="text-2xl md:text-3xl font-header font-black text-white italic uppercase tracking-tight">
                MEJORAS DE ARQUITECTURA DE ESCRITORIO
              </h2>
            </div>
            <div className="h-[1px] flex-grow bg-white/5 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard 
              title="Prioridad del Proceso" 
              desc="Al ejecutarse en un proceso aislado a través del núcleo de Tauri en Rust, MuzicMania recibe prioridad sobre otros subprocesos de Windows, garantizando cero congelamientos."
              icon={<MonitorIcon />}
              color="neon-blue"
            />
            <InfoCard 
              title="Aislamiento del Teclado" 
              desc="Se interceptan y bloquean atajos de navegador conflictivos (F5, F11, Alt+D, Spacebar scroll). Tus controles y combos permanecen 100% seguros y estables."
              icon={<TerminalIcon />}
              color="neon-purple"
            />
            <InfoCard 
              title="Motor Gráfico WebView2" 
              desc="Se utiliza el SDK nativo de Windows Chromium con aceleración directa por GPU y asignación de buffer independiente para mantener frames óptimos (144 fps)."
              icon={<LayersIcon />}
              color="neon-pink"
            />
          </div>
        </motion.section>

        {/* REQUISITOS DEL SISTEMA */}
        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          <div className="bg-[#05050a]/90 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group space-y-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 blur-3xl group-hover:bg-neon-blue/10 transition-all pointer-events-none" />
            <h3 className="font-header font-black tracking-tighter text-xl text-neon-blue italic uppercase border-b border-white/5 pb-4">
              REQUISITOS MÍNIMOS DE SISTEMA
            </h3>
            <ul className="text-gray-400 text-xs font-bold space-y-4 uppercase tracking-wider">
              <li className="flex justify-between border-b border-white/5 pb-2"><span>SISTEMA OPERATIVO:</span><span className="text-white">Windows 10 (64-bits)</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>PROCESADOR:</span><span className="text-white">Intel Core i3 o AMD equivalente</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>MEMORIA RAM:</span><span className="text-white">4 GB RAM</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>GRÁFICOS:</span><span className="text-white">Gráficos integrados Intel HD</span></li>
              <li className="flex justify-between pb-2"><span>ESPACIO EN DISCO:</span><span className="text-white">15 MB disponibles</span></li>
            </ul>
          </div>

          <div className="bg-[#05050a]/90 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group space-y-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 blur-3xl group-hover:bg-neon-pink/10 transition-all pointer-events-none" />
            <h3 className="font-header font-black tracking-tighter text-xl text-neon-pink italic uppercase border-b border-white/5 pb-4">
              REQUISITOS RECOMENDADOS
            </h3>
            <ul className="text-gray-400 text-xs font-bold space-y-4 uppercase tracking-wider">
              <li className="flex justify-between border-b border-white/5 pb-2"><span>SISTEMA OPERATIVO:</span><span className="text-white">Windows 11 (64-bits)</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>PROCESADOR:</span><span className="text-white">Intel Core i5 / AMD Ryzen 5</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>MEMORIA RAM:</span><span className="text-white">8 GB RAM o superior</span></li>
              <li className="flex justify-between border-b border-white/5 pb-2"><span>TASA DE REFRESCO:</span><span className="text-white">Pantalla de 144Hz o superior</span></li>
              <li className="flex justify-between pb-2"><span>MOTOR DE RENDER:</span><span className="text-white">WebView2 Runtime Instalado</span></li>
            </ul>
          </div>
        </motion.section>

        {/* LOG DE VERSIONES */}
        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants}
          className="space-y-8"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 text-neon-blue">
                <VersionIcon />
              </div>
              <h2 className="text-2xl font-header font-black text-white italic uppercase tracking-tight">
                CENTRO DE VERSIONES
              </h2>
            </div>
            <div className="h-[1px] flex-grow bg-white/5" />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left font-header text-xs text-gray-400 uppercase tracking-widest border-collapse">
              <thead>
                <tr className="bg-black/60 text-white border-b border-white/10">
                  <th className="p-5 font-black">Versión</th>
                  <th className="p-5 font-black">Plataforma</th>
                  <th className="p-5 font-black">Fecha</th>
                  <th className="p-5 font-black">Peso</th>
                  <th className="p-5 font-black">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-all">
                  <td className="p-5 font-black text-white">v1.0.0</td>
                  <td className="p-5 font-bold">Windows 10 x64 (.MSI)</td>
                  <td className="p-5 font-bold">31/05/2026</td>
                  <td className="p-5 font-bold">~ 1.6 MB</td>
                  <td className="p-5 font-black text-neon-blue">ACTIVO / ESTABLE</td>
                </tr>
                <tr className="hover:bg-white/5 transition-all">
                  <td className="p-5 font-black text-white">v1.0.0</td>
                  <td className="p-5 font-bold">Windows 11 x64 (.EXE)</td>
                  <td className="p-5 font-bold">10/06/2026</td>
                  <td className="p-5 font-bold">~ 1.2 MB</td>
                  <td className="p-5 font-black text-neon-cyan">ACTIVO / ESTABLE</td>
                </tr>
                <tr className="hover:bg-white/5 transition-all opacity-50">
                  <td className="p-5 font-black">v1.0.0</td>
                  <td className="p-5 font-bold">macOS / Linux (DMG / AppImage)</td>
                  <td className="p-5 font-bold">Próximamente</td>
                  <td className="p-5 font-bold">—</td>
                  <td className="p-5 font-bold text-rose-500">BETA CERRADA</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Link 
              href="/changelog" 
              className="inline-flex items-center gap-2 text-neon-blue/60 hover:text-neon-blue transition-colors font-header font-black text-xs uppercase tracking-widest"
            >
              VER HISTORIAL COMPLETO
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </motion.section>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}

// Subcomponente de candado decorativo
const LockBadge = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-red-500 animate-pulse" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
