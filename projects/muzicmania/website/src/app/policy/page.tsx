'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';

// --- Icons Library ---
const I = {
  policy: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/></svg>,
  eye: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
};

const POLICY_ARTICLES = [
  { id: 1, title: "COMPROMISO DE PRIVACIDAD Y ÉTICA DE DATOS", content: "MuzicMania se compromete a proteger la privacidad de sus usuarios mediante el cumplimiento riguroso de normativas internacionales de protección de datos. Nuestra prioridad es garantizar que tu experiencia rítmica sea segura y transparente." },
  { id: 2, title: "CATEGORÍAS DE DATOS RECOPILADOS", content: "Recopilamos información necesaria para el funcionamiento de la plataforma: datos de identificación (Username), datos técnicos (browser/OS) y datos de rendimiento (puntuaciones y estadísticas de juego)." },
  { id: 3, title: "DATOS DE IDENTIFICACIÓN DE CUENTA", content: "Para el registro y persistencia de perfiles, solicitamos un correo electrónico gestionado mediante Supabase Auth. Este dato se utiliza exclusivamente para la autenticación y recuperación de la cuenta." },
  { id: 4, title: "DATOS DE RENDIMIENTO Y LEADERSBOARDS", content: "Tus puntuaciones, combos y récords personales son recopilados para generar el ranking global de MuzicMania. Estos datos son públicos para fomentar la competencia sana dentro de la plataforma." },
  { id: 5, title: "GALLETAS (COOKIES) Y ALMACENAMIENTO LOCAL", content: "Utilizamos LocalStorage para guardar tus ajustes de juego (volumen, offset, skins) y cookies técnicas de sesión. No utilizamos cookies de rastreo publicitario de terceros." },
  { id: 6, title: "SEGURIDAD DE LA INFRAESTRUCTURA SUPABASE", content: "MuzicMania utiliza Supabase para el almacenamiento de datos, empleando cifrado AES-256 en reposo y conexiones SSL/TLS seguras en tránsito para proteger tu información contra accesos no autorizados." },
  { id: 7, title: "PROCESAMIENTO DE PAGOS Y TRANSACCIONES", content: "En caso de adquisiciones en la tienda oficial, los datos financieros son procesados por plataformas externas certificadas (PCI-DSS). MuzicMania no almacena números de tarjetas de crédito en sus servidores." },
  { id: 8, title: "COMPARTICIÓN CON PROVEEDORES DE SERVICIOS", content: "Compartimos datos mínimos necesarios con proveedores logísticos (Supabase para DB, Vercel para Hosting) únicamente para garantizar la disponibilidad continua del servicio." },
  { id: 9, title: "NO COMERCIALIZACIÓN DE INFORMACIÓN PERSONAL", content: "Garantizamos bajo declaración oficial que MuzicMania no vende, alquila ni comercializa los datos personales de sus usuarios bajo ninguna circunstancia." },
  { id: 10, title: "RETENCIÓN Y ELIMINACIÓN DE DATOS", content: "Conservamos tus datos mientras tu cuenta esté activa. Los usuarios tienen el derecho de solicitar la eliminación total de su perfil y registros históricos mediante el panel de configuración." },
  { id: 11, title: "DERECHOS DEL USUARIO (ACCESO Y RECTIFICACIÓN)", content: "Tienes derecho a acceder a toda la información que MuzicMania posee sobre ti, así como a rectificar cualquier dato inexacto directamente desde la interfaz de usuario." },
  { id: 12, title: "CONTACTO DEL OFICIAL DE PRIVACIDAD", content: "Para cualquier duda, reclamación o solicitud relacionada con tus datos, puedes contactar a nuestro equipo mediante los canales oficiales de soporte técnico en Discord o vía email." },
];

export default function PolicyPage() {
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
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-neon-pink/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-0 pb-28 space-y-16">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={itemVariants} className="relative space-y-8 pt-12 text-center">
          <div className="flex flex-col items-center gap-1">
             <div className="flex items-center justify-center gap-6 group">
                <div className="w-12 h-12 text-neon-pink flex items-center justify-center">
                   {I.policy}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-pink via-white to-neon-pink bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  PRIVACIDAD
                </h1>
             </div>
             <p className="text-neon-pink font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Protección de tu Identidad Digital
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
               <div className="w-8 h-8 text-white/20">{I.eye}</div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Protocolo de Privacidad de la Red Ciszu</span>
            </div>

            <div className="space-y-10">
              {POLICY_ARTICLES.map((art) => (
                <motion.article 
                  key={art.id}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex gap-6 md:gap-8">
                    <div className="flex-shrink-0 pt-1">
                      <span className="text-neon-pink font-mono font-bold text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        {art.id.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-hidden">
                      <h2 className="text-xl font-header font-black text-white italic uppercase tracking-tighter group-hover:text-neon-pink transition-colors">
                        ART. {art.id}: {art.title}
                      </h2>
                      <p className="text-gray-400 font-bold leading-relaxed text-sm md:text-base selection:bg-neon-pink/30">
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
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">Seguridad de Datos de MuzicMania</p>
                 <p className="text-[9px] font-bold text-gray-500 italic">Actualizado 2026-04-18</p>
               </div>
               <div className="w-24 h-1 bg-neon-pink/50 rounded-full" />
            </div>

          </div>
        </motion.div>

        <QuickDocks />

      </div>
    </MainLayout>
  );
}

