'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import QuickDocks from '@/components/molecules/QuickDocks';

const GhostIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>);
const TerminalIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>);

export default function NotFound() {
  const [showLog, setShowLog] = useState(false);

  return (
    <div className="min-h-screen bg-[#030000] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-header not-italic pb-20">
      {/* Fondo de alerta roja profunda */}
      <div className="absolute inset-0 bg-red-950/20 blur-[150px] rounded-full animate-pulse pointer-events-none" />
      
      {/* Efecto Scanlines CRT */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-10"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 3px 100%'
        }}
      />

      {/* Grid de seguridad al fondo */}
      <div className="absolute inset-0 pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, #ff0000 1px, transparent 1px), linear-gradient(to bottom, #ff0000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 70%)'
        }}
      />

      <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Contenedor Horizontal para el Fantasma + 404 (Ahorra espacio vertical) */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
           
           {/* Fantasma Rebotante Blanco y Rojo */}
           <motion.div 
             animate={{ y: [0, -20, 0] }} 
             transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
             className="relative flex items-center justify-center"
           >
             <GhostIcon className="w-32 h-32 md:w-48 md:h-48 text-white relative z-10 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]" />
             {/* Sombra roja trasera como efecto 3D / Desfase */}
             <GhostIcon className="w-32 h-32 md:w-48 md:h-48 text-red-600 absolute top-1 left-2 blur-[2px] opacity-70" />
           </motion.div>

           {/* Glitch 404 Text */}
           <div className="relative">
              {/* Glitch Capa 1: Cían oscuro desplazado */}
              <motion.h1 
                animate={{ x: [-4, 4, -2, 2, 0], y: [2, -2, 2, -2, 0], opacity: [0.8, 1, 0.4, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2.8 }}
                className="absolute top-0 left-0 text-8xl md:text-[12rem] lg:text-[14rem] font-black uppercase text-cyan-500 mix-blend-screen tracking-tighter"
              >
                404
              </motion.h1>
              
              {/* Glitch Capa 2: Rojo brillante desplazado al otro lado */}
              <motion.h1 
                animate={{ x: [4, -4, 2, -2, 0], y: [-2, 2, -2, 2, 0], opacity: [0.8, 1, 0.4, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.5, delay: 0.1 }}
                className="absolute top-0 left-0 text-8xl md:text-[12rem] lg:text-[14rem] font-black uppercase text-red-600 mix-blend-screen tracking-tighter -ml-2 mt-2"
              >
                404
              </motion.h1>

              {/* Capa Frontal Blanca / Base */}
              <h1 className="relative text-8xl md:text-[12rem] lg:text-[14rem] font-black uppercase text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] leading-none">
                404
              </h1>
           </div>
        </div>

        <div className="space-y-4 mt-8 md:mt-12 z-30 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3 bg-red-950/80 border-2 border-red-600 px-6 py-2 rounded-none shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          >
             <TerminalIcon className="w-5 h-5 text-red-500 animate-pulse" />
             <p className="text-red-500 font-black tracking-[0.5em] uppercase text-sm md:text-base">
                INFRACCIÓN DE SISTEMA
             </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-gray-300 max-w-xl mx-auto space-y-2 mt-2"
          >
            <p className="text-sm md:text-lg font-bold leading-relaxed uppercase tracking-wider text-center">
              FATAL ERROR. ESTÁS NAVEGANDO EN CÓDIGO MUERTO.
            </p>
            <p className="text-xs md:text-sm font-bold leading-relaxed uppercase tracking-widest text-center text-red-500/70">
              LA RUTA SOLICITADA HA SIDO PURGADA DEL NÚCLEO.
            </p>
          </motion.div>
        </div>

        {/* Botón Volver a Zona Segura */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
           className="pt-10 z-30"
        >
          <Link href="/">
            <button className="relative group overflow-hidden bg-black border-2 border-red-600 px-10 py-4 font-black text-red-500 uppercase tracking-[0.3em] text-lg lg:text-xl transition-all hover:text-white hover:border-white shadow-[0_0_10px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]">
               <span className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
               VOLVER A ZONA SEGURA
            </button>
          </Link>
        </motion.div>
      </div>

      {/* EASTER EGG: Interactivo (Botón Sys_Log) */}
      <div className="absolute bottom-6 left-6 z-[200] flex flex-col-reverse md:flex-col items-start gap-3">
        <button 
          onClick={() => setShowLog(!showLog)}
          className="flex items-center gap-2 text-red-900 hover:text-red-500 transition-colors bg-black/80 px-4 py-2 border-l-4 border-red-900/50 hover:border-red-500 group"
        >
           <TerminalIcon className="w-4 h-4 group-hover:animate-pulse" />
           <span className="text-[10px] md:text-xs uppercase font-black tracking-widest leading-none">Sys_Log</span>
        </button>

        {showLog && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="p-5 bg-red-950/90 border border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.3)] backdrop-blur-md max-w-sm"
          >
            <p className="text-red-400 font-mono text-[9px] md:text-xs uppercase tracking-[0.2em] font-bold leading-relaxed">
              &gt; LOG_SYS: ERROR_UNAUTHORIZED.<br/><br/>
              &gt; SI ESTÁS BUSCANDO UNA VULNERABILIDAD, BUG O PUERTO ABIERTO...<br/>
              &gt; TE EQUIVOCASTE DE VECTOR.<br/>
              &gt; EL PERÍMETRO ESTÁ ASEGURADO. RETÍRATE INMEDIATAMENTE.<br/>
              <span className="animate-pulse inline-block mt-2 text-red-600">_</span>
            </p>
          </motion.div>
        )}
      </div>

      <QuickDocks />

    </div>
  );
}
