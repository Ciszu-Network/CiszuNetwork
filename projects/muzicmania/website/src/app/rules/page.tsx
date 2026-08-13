'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';

// --- Icons Library ---
const I = {
  gavel: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="m14.5 12.5-8 8a2.12 2.12 0 0 1-3-3l8-8"/><path d="m16 16 2 2"/><path d="m19.03 12.03 2-2a2.828 2.828 0 1 0-4-4l-2 2"/><path d="m5 11 3 3"/><path d="m15 5 3 3"/></svg>,
  seal: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/><path d="M12 7v5l3 3"/></svg>,
};

const RULES_ARTICLES = [
  { id: 1, title: "CONDUCTA Y RESPETO MUTUO", content: "Se prohíbe terminantemente cualquier forma de acoso, discurso de odio o toxicidad dentro del ecosistema de MuzicMania. El respeto hacia otros usuarios y miembros del Staff es la base fundamental de nuestra comunidad." },
  { id: 2, title: "INTEGRIDAD DEL JUEGO (ANTI-CHEAT)", content: "MuzicMania mantiene una política de tolerancia cero ante el uso de bots, macros, scripts de automatización o cualquier software de terceros que manipule el rendimiento real del jugador. El incumplimiento conlleva el baneo inmediato y permanente." },
  { id: 3, title: "IDENTIDAD DE USUARIO Y PERFILES", content: "Los nombres de usuario no deben contener lenguaje ofensivo, discriminatorio o contenido sensible. MuzicMania se reserva el derecho de modificar nombres inapropiados o suspender cuentas infractoras." },
  { id: 4, title: "SUPLANTACIÓN DE IDENTIDAD", content: "Queda prohibido fingir ser otro usuario, artista o miembro oficial del equipo de MuzicMania. La suplantación de identidad es considerada una falta grave contra la confianza de la comunidad." },
  { id: 5, title: "REPORTE OBLIGATORIO DE FALLOS", content: "Los usuarios tienen el deber ético de informar cualquier bug crítico o vulnerabilidad técnica mediante los canales oficiales (Soporte o Discord). El reporte de fallos contribuye a la estabilidad del sistema." },
  { id: 6, title: "PROHIBICIÓN DE EXPLOITS Y ABUSO", content: "El uso deliberado de errores de programación ('exploits') para obtener ventajas competitivas o manipular puntuaciones está estrictamente prohibido y será sancionado según la gravedad del acto." },
  { id: 7, title: "POLÍTICA DE CUENTA ÚNICA", content: "Para garantizar la equidad en los rankings globales, cada jugador deberá utilizar una única cuenta principal. El uso de cuentas múltiples ('multi-accounting') para manipular tablas de clasificación no está permitido." },
  { id: 8, title: "PRIVACIDAD Y SEGURIDAD PERSONAL", content: "Está prohibido compartir, difundir o solicitar información personal (Doxxing) de otros miembros de la comunidad. La seguridad de los datos de nuestros usuarios es una prioridad absoluta." },
  { id: 9, title: "AUTORIDAD Y DECISIONES DE MODERACIÓN", content: "Las decisiones tomadas por el equipo de Moderación y Staff son finales. El desacato sistemático a las instrucciones de los moderadores será motivo de sanción disciplinaria." },
  { id: 10, title: "COMPARTICIÓN DE CUENTAS (ACCOUNT SHARING)", content: "Se prohíbe el préstamo o compartición de cuentas con el fin de que terceros suban el récord o 'elo' del propietario original. La cuenta es personal e intransferible." },
  { id: 11, title: "VINCULACIÓN CON COMUNIDADES EXTERNAS", content: "El comportamiento en servidores de Discord oficiales y otras plataformas vinculadas influye directamente en el estatus de la cuenta dentro del juego. Las sanciones en comunidades externas pueden replicarse en la plataforma." },
  { id: 12, title: "COMUNICACIÓN Y USO DEL CHAT", content: "El spam, la difusión de enlaces maliciosos o el uso excesivo de mayúsculas y elementos disruptivos en los canales de comunicación están prohibidos para asegurar una convivencia fluida." },
  { id: 13, title: "INTEGRIDAD TÉCNICA DEL SISTEMA", content: "Cualquier intento de ingeniería inversa, inyeccion de código o ataques de denegación de servicio (DDoS) contra la infraestructura de MuzicMania será perseguido mediante medidas técnicas y legales." },
  { id: 14, title: "COMERCIO DE CUENTAS Y BIENES", content: "La venta, compra o intercambio de cuentas de MuzicMania por dinero real o bienes externos está estrictamente prohibida. MuzicMania no se hace responsable de transacciones realizadas fuera de su control." },
  { id: 15, title: "REPRESENTACIÓN DE MARCA Y LOGOTIPOS", content: "Queda prohibido el uso de los logotipos e imágenes oficiales de MuzicMania para fines comerciales o de representación engañosa sin el consentimiento explícito de Ciszu Network y Ciszuko Antony." },
  { id: 16, title: "MODIFICADORES Y CLIENTES EXTERNOS", content: "No se permite el uso de versiones modificadas del cliente del juego que alteren la visualización de las notas o la mecánica de juego para obtener ventajas sobre los usuarios del cliente oficial." },
  { id: 17, title: "TRANSPARENCIA EN EL PROCESO DE APELACIÓN", content: "Todo usuario sancionado tiene derecho a solicitar una revisión de su caso mediante el sistema oficial de apelaciones, siempre y cuando se proporcione evidencia válida y se mantenga un tono respetuoso." },
];

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

export default function RulesPage() {
  usePageTitle('RULES');
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
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-neon-red/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-neon-blue/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-0 pb-28 space-y-16">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-red flex items-center justify-center">
                   {I.gavel}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-red via-white to-neon-red bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  REGLAS
                </h1>
             </div>
             <p className="text-neon-red font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Código de Conducta y Fair Play
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
               <div className="w-8 h-8 text-white/20">{I.seal}</div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Reglamento Oficial de MuzicMania</span>
            </div>

            <div className="space-y-10">
              {RULES_ARTICLES.map((art) => (
                <motion.article 
                  key={art.id}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex gap-6 md:gap-8">
                    <div className="flex-shrink-0 pt-1">
                      <span className="text-neon-red font-mono font-bold text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        {art.id.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-xl font-header font-black text-white italic uppercase tracking-tighter group-hover:text-neon-red transition-colors">
                        ART. {art.id}: {art.title}
                      </h2>
                      <p className="text-gray-400 font-bold leading-relaxed text-sm md:text-base selection:bg-neon-red/30">
                        {art.content}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Footer Sign-off */}
            <div className="pt-16 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
               <div className="space-y-1 text-center md:text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">Jurisdicción de la Red Ciszu</p>
                 <p className="text-[9px] font-bold text-gray-500 italic">Actualizado 10/06/2026</p>
               </div>
               <div className="w-24 h-1 bg-neon-red/50 rounded-full" />
            </div>

          </div>
        </motion.div>

        <QuickDocks />

      </div>
    </MainLayout>
  );
}

