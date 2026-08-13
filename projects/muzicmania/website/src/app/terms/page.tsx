'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';

// --- Icons Library ---
const I = {
  terms: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  balance: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 10a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M3 6h18"/><path d="M12 2v4"/></svg>,
};

const TERMS_ARTICLES = [
  { id: 1, title: "ACUERDO VINCULANTE DE USO", content: "Al acceder, registrarse o utilizar MuzicMania, usted acepta quedar vinculado legalmente por los términos y condiciones de este documento. Este contrato rige toda interacción entre el usuario y la plataforma oficial de la Red Ciszu." },
  { id: 2, title: "REQUISITOS DE EDAD Y CAPACIDAD", content: "El uso de MuzicMania requiere tener la capacidad legal mínima según la legislación de su país de origen. Los menores de edad deben contar con el consentimiento de sus tutores legales para participar en actividades que requieran registro de datos." },
  { id: 3, title: "REGISTRO Y RESPONSABILIDAD DE CUENTA", content: "Usted es el único responsable de mantener la seguridad y confidencialidad de sus credenciales de acceso. Cualquier actividad realizada bajo su perfil de MuzicMania se considerará efectuada por usted directamente." },
  { id: 4, title: "USO PERMITIDO DEL SOFTWARE", content: "MuzicMania otorga una licencia limitada para el uso recreativo de su plataforma. Queda estrictamente prohibido el uso de la misma para fines ilícitos, spam, distribución de malware o cualquier actividad que degrade el servicio." },
  { id: 5, title: "CÓDIGO DE CONDUCTA (REGLAS DE ORO)", content: "Los usuarios deben adherirse a los principios de Fair Play descritos en la sección de Reglas. El acoso, la discriminación y la toxicidad en los espacios comunitarios resultarán en la terminación inmediata del servicio." },
  { id: 6, title: "PROPIEDAD INTELECTUAL Y DERECHOS DE AUTOR", content: "Todo el código fuente, diseño de interfaz, artes gráficos y logotipos son propiedad exclusiva de Ciszu Network y Ciszuko Antony. La música está sujeta a las licencias individuales de sus respectivos autores (NCS/Creative Commons)." },
  { id: 7, title: "LICENCIA DE USUARIO FINAL (EULA)", content: "El acceso a MuzicMania no constituye una venta de su software. Se le concede una licencia revocable, no exclusiva e intransferible para ejecutar el cliente del juego dentro de los navegadores compatibles." },
  { id: 8, title: "BIENES VIRTUALES Y PROGRESIÓN", content: "Cualquier moneda virtual, ítem estético o progresión obtenida dentro de MuzicMania no posee valor monetario real y no es canjeable por dinero. El autor se reserva el derecho de equilibrar o modificar estos valores en cualquier momento." },
  { id: 9, title: "DISPONIBILIDAD Y GARANTÍA DEL SERVICIO", content: "MuzicMania se proporciona 'TAL CUAL' y 'SEGÚN DISPONIBILIDAD'. No garantizamos que el servicio sea ininterrumpido o libre de errores, aunque nos esforzamos por mantener una estabilidad del 99.9%." },
  { id: 10, title: "LIMITACIÓN DE RESPONSABILIDAD LEGAL", content: "En la medida máxima permitida por la ley, MuzicMania y sus desarrolladores no serán responsables de daños directos, indirectos o accidentales derivados del uso o la incapacidad de uso de la plataforma." },
  { id: 11, title: "INDEMNIZACIÓN Y DEFENSA", content: "Usted acepta indemnizar y eximir de responsabilidad a Ciszu Network y Ciszuko Antony frente a cualquier reclamación, pérdida o gasto resultante de su incumplimiento de estos términos o del uso indebido del software." },
  { id: 12, title: "SUSPENSIÓN Y TERMINACIÓN DIRECTA", content: "Nos reservamos el derecho de suspender o eliminar cualquier cuenta que viole estos términos, las reglas del juego o las directrices de la comunidad, sin previo aviso y sin posibilidad de reembolso de bienes virtuales." },
  { id: 13, title: "LEGISLACIÓN VIGENTE Y ARBITRAJE", content: "Estos términos se rigen por los principios generales del derecho electrónico internacional. Cualquier disputa no resuelta de manera amistosa podrá ser sometida a procesos de arbitraje digital." },
  { id: 14, title: "COMUNICACIONES OFICIALES Y SOPORTE", content: "Toda notificación oficial respecto a estos términos se realizará mediante el canal general de Discord o la sección de anuncios en la web oficial. El soporte legal se gestionará únicamente vía correo electrónico corporativo." },
];

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

export default function TermsPage() {
  usePageTitle('TERMS');
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
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-neon-orange/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-neon-yellow/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-0 pb-28 space-y-16">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-orange flex items-center justify-center">
                   {I.terms}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-orange via-neon-yellow to-neon-orange bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  TÉRMINOS
                </h1>
             </div>
             <p className="text-neon-orange font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Acuerdo Legal de Jugador
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
               <div className="w-8 h-8 text-white/20">{I.balance}</div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Contrato Marco de Uso MuzicMania</span>
            </div>

            <div className="space-y-10">
              {TERMS_ARTICLES.map((art) => (
                <motion.article 
                  key={art.id}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex gap-6 md:gap-8">
                    <div className="flex-shrink-0 pt-1">
                      <span className="text-neon-orange font-mono font-bold text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        {art.id.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-hidden">
                      <h2 className="text-xl font-header font-black text-white italic uppercase tracking-tighter group-hover:text-neon-orange transition-colors">
                        ART. {art.id}: {art.title}
                      </h2>
                      <p className="text-gray-400 font-bold leading-relaxed text-sm md:text-base selection:bg-neon-orange/30">
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
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">Jurisprudencia de Ciszu Network</p>
                  <p className="text-[9px] font-bold text-gray-500 italic">Actualizado 10/06/2026</p>
               </div>
               <div className="w-24 h-1 bg-neon-orange/50 rounded-full" />
            </div>

          </div>
        </motion.div>

        <QuickDocks />

      </div>
    </MainLayout>
  );
}

