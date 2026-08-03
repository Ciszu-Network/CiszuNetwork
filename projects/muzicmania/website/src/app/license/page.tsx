'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';

// --- Icons Library ---
const I = {
  license: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  verified: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>,
};

const LICENSE_ARTICLES = [
  { id: 1, title: "PROPIEDAD INTELECTUAL Y AUTORÍA", content: "MuzicMania es una obra intelectual cuya propiedad y derechos de autor pertenecen íntegramente a Ciszu Network y Ciszuko Antony (Francisco Garcia). Todos los derechos no concedidos explícitamente en este documento quedan reservados." },
  { id: 2, title: "CONCESIÓN DE LICENCIA DE USO", content: "Se otorga permiso para el uso personal, educativo y no comercial de este software. La modificación de los archivos fuente se permite bajo los términos de la Licencia MIT detallados en el Artículo 4, siempre que se mantenga el aviso de copyright." },
  { id: 3, title: "SOFTWARE DE TERCEROS Y DEPENDENCIAS", content: "MuzicMania utiliza frameworks y librerías de terceros, incluyendo pero no limitado a React, Next.js, Tailwind CSS y Framer Motion. Cada una de estas herramientas opera bajo sus propias licencias de software libre (MIT/Apache)." },
  { 
    id: 4, 
    title: "TEXTO ÍNTEGRO DE LA LICENCIA MIT", 
    content: "MIT License\n\nCopyright (c) 2026 Ciszu Network — Ciszuko Antony\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.",
    isCode: true
  },
  { id: 5, title: "LICENCIAS DE CONTENIDO MULTIMEDIA", content: "La música utilizada en la plataforma proviene mayoritariamente de NoCopyrightSounds (NCS) o artistas bajo licencia Creative Commons. El uso de estos contenidos fuera de MuzicMania debe adherirse a los términos específicos de cada autor original." },
  { id: 6, title: "ATRIBUCIÓN OBLIGATORIA", content: "Toda redistribución o uso derivado del código fuente de MuzicMania debe incluir de forma visible la atribución a Ciszu Network — Ciszuko Antony y un enlace a los repositorios oficiales." },
  { id: 7, title: "RESTRICCIONES DE COMERCIALIZACIÓN", content: "Queda estrictamente prohibida la venta, sub-licenciamiento comercial o inclusión de MuzicMania en paquetes de software de pago sin un acuerdo de licencia comercial previo y por escrito con el autor." },
  { id: 8, title: "LIMITACIÓN JURÍDICA DE RESPONSABILIDAD", content: "En ningún caso el autor o los titulares del copyright serán responsables de ninguna reclamación, daños u otras responsabilidades, ya sea en una acción de contrato, agravio o de otro modo, que surja de o en conexión con el software." },
  { id: 9, title: "JURISDICCIÓN Y MODIFICACIONES", content: "MuzicMania se reserva el derecho de modificar los términos de esta licencia en cualquier momento. El uso continuado de la plataforma tras dichos cambios implica la aceptación de los nuevos términos de licenciamiento." },
];

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

export default function LicensePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <MainLayout>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-0 pb-28 space-y-16">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-cyan flex items-center justify-center">
                   {I.license}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-cyan bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  LICENCIA
                </h1>
             </div>
             <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Open Source & Transparencia
             </p>
          </div>
        </motion.header>

        {/* --- DOCUMENT CONTAINER --- */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative bg-doc-dark border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl overflow-hidden"
        >
          {/* Subtle Document Lines */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px)', backgroundSize: '100% 3rem' }} />

          <div className="relative space-y-12">
            
            <div className="flex items-center gap-4 pb-8 border-b border-white/5 opacity-50">
               <div className="w-8 h-8 text-white/20">{I.verified}</div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Documento de Validez Tecnográfica</span>
            </div>

            <div className="space-y-10">
              {LICENSE_ARTICLES.map((art) => (
                <motion.article 
                  key={art.id}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex gap-6 md:gap-8">
                    <div className="flex-shrink-0 pt-1">
                      <span className="text-neon-cyan font-mono font-bold text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        {art.id.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-hidden">
                      <h2 className="text-xl font-header font-black text-white italic uppercase tracking-tighter group-hover:text-neon-cyan transition-colors">
                        ART. {art.id}: {art.title}
                      </h2>
                      {art.isCode ? (
                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl font-mono text-[10px] md:text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">
                          {art.content}
                        </div>
                      ) : (
                        <p className="text-gray-400 font-bold leading-relaxed text-sm md:text-base selection:bg-neon-cyan/30">
                          {art.content}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Footer Sign-off */}
            <div className="pt-16 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
               <div className="space-y-1 text-center md:text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">Declaración de Libertad de Software</p>
                 <p className="text-[9px] font-bold text-gray-500 italic">Red Ciszu - MuzicMania 2026</p>
               </div>
               <div className="w-24 h-1 bg-neon-cyan/50 rounded-full" />
            </div>

          </div>
        </motion.div>

        <QuickDocks />

      </div>
    </MainLayout>
  );
}

