'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';

// --- Icons Library ---
const I = {
  document: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  stamp: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 22h14"/><path d="M12 17v-5"/><path d="M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M5 17h14v-3a7 7 0 1 0-14 0Z"/></svg>,
};

const ARTICLES = [
  { id: 1, title: "OBJETO DEL PRESENTE DOCUMENTO", content: "MuzicMania se define como un ecosistema técnico y creativo interactivo. El presente documento establece el marco normativo y operativo para todos los usuarios y colaboradores dentro de la plataforma, garantizando la estabilidad y coherencia del sistema." },
  { id: 2, title: "ESTÁNDARES DE NAVEGACIÓN", content: "Para una experiencia óptima libre de micro-stuttering, se prescribe el uso de navegadores basados en el motor Chromium (Google Chrome, Microsoft Edge, Brave). El usuario debe asegurar que la 'Aceleración por Hardware' esté activa en los ajustes del navegador." },
  { id: 3, title: "SINCRONIZACIÓN Y CONECTIVIDAD", content: "MuzicMania requiere una conexión a internet persistente para la validación de récords en el Leaderboard global. Los recursos visuales y de audio se cargan de forma asíncrona para optimizar la latencia." },
  { id: 4, title: "CALIBRACIÓN DE AUDIO (OFFSET)", content: "Debido a las variaciones en hardware de salida (Bluetooth, altavoces, procesadores de audio), el usuario es responsable de utilizar el sistema de calibración manual (Ajustes > Audio) para sincronizar el impacto visual con el auditivo." },
  { id: 5, title: "AJUSTES DE VELOCIDAD (SCROLL SPEED)", content: "La velocidad de despliegue de las notas es configurable mediante las teclas de acceso rápido (F3 y F4). Se recomienda ajustar este valor individualmente según la capacidad de reacción y resolución de pantalla del usuario." },
  { id: 6, title: "SISTEMA DE PERIFÉRICOS", content: "Se recomienda el uso de teclados con tecnología N-Key Rollover (NKRO) para evitar el bloqueo de pulsaciones simultáneas en niveles de dificultad superior o extrema." },
  { id: 7, title: "IDENTIDAD VISUAL Y NEÓN", content: "Toda integración visual debe adherirse a la paleta oficial (Cyan, Púrpura, Rosa, Neón). Queda prohibido el uso de colores estáticos básicos o elementos que rompan la estética Synthwave/Futurista." },
  { id: 8, title: "ICONOGRAFÍA Y VECTORES", content: "El sistema de interfaz utiliza exclusivamente SVG Sprites centralizados. Está estrictamente prohibido el uso de Emojis unicode o librerías externas como FontAwesome para elementos de navegación interna." },
  { id: 9, title: "TIPOGRAFÍA OFICIAL", content: "Se establece 'Exo 2' como fuente principal para encabezados y 'Rajdhani' para cuerpos de texto y botones. El incumplimiento de esta jerarquía invalida cualquier propuesta de diseño oficial." },
  { id: 10, title: "SEMÁNTICA DE CÓDIGO", content: "Toda estructura de la plataforma debe seguir el estándar HTML5 semántico (<main>, <section>, <article>). Esto garantiza la accesibilidad para lectores de pantalla y la indexación profesional en motores de búsqueda." },
  { id: 11, title: "PROPIEDAD INTELECTUAL", content: "MuzicMania utiliza música bajo licencias de libre uso (NCS, Creative Commons) o mediante acuerdos directos. Se respeta la autoría original y queda prohibida la redistribución de tracks fuera del entorno del juego." },
  { id: 12, title: "CÓDIGO DE CONDUCTA", content: "Se prohíbe cualquier conducta de acoso, toxicidad o suplantación de identidad en los perfiles de Ciszu Network. La plataforma fomenta un entorno de respeto y crecimiento artístico mutuo." },
  { id: 13, title: "REPORTE DE VULNERABILIDADES", content: "El descubrimiento de fallos críticos o vulnerabilidades debe reportarse de manera privada a través de los canales oficiales de soporte, evitando la difusión pública que pueda comprometer la integridad de la plataforma." },
  { id: 14, title: "INTEGRIDAD DE PUNTUACIONES (ANTI-CHEAT)", content: "El uso de macros, scripts de automatización o cualquier software externo que manipule las pulsaciones reales del usuario resultará en el baneo permanente de la cuenta y la eliminación de récords." },
  { id: 15, title: "GESTIÓN DE CUENTAS", content: "Los perfiles de usuario pertenecen al ecosistema de Ciszu Network. El usuario es responsable de la seguridad de sus credenciales y de la veracidad de la información proporcionada en su perfil." },
  { id: 16, title: "PRIVACIDAD DE DATOS", content: "Toda información personal recolectada se gestiona mediante protocolos de seguridad avanzada vía Supabase Auth. No se comparten datos con terceros fuera del ámbito operativo de MuzicMania." },
  { id: 17, title: "CONTRIBUCIÓN CREATIVA", content: "Se invita a la comunidad a proponer nuevas canciones ('Charts') y arte conceptual. Toda contribución aprobada será acreditada debidamente al autor original en la sección de Créditos." },
  { id: 18, title: "CICLO DE ACTUALIZACIONES", content: "MuzicMania se encuentra en un estado de evolución constante (Fase Beta). Las funciones existentes pueden ser modificadas o retiradas para mejorar la estabilidad y experiencia general del sistema." },
  { id: 19, title: "COMPATIBILIDAD MÓVIL", content: "Aunque la versión web es responsiva, la experiencia óptima se reserva para equipos de escritorio. Las aplicaciones nativas para iOS y Android están sujetas al Roadmap oficial de 2026." },
  { id: 20, title: "SALUD VISUAL Y FOTOSENSIBILIDAD", content: "Dada la naturaleza del juego, se incluye contenido con efectos de luces intermitentes y flashes neón. Se recomienda discreción a usuarios sensibles a estímulos visuales intensos." },
  { id: 21, title: "CANALES DE SOPORTE", content: "El único medio oficial para asistencia técnica directa es la sección de Soporte de la web o el servidor de Discord verificado de Ciszu Network." },
  { id: 22, title: "AUTORIDAD DE GESTIÓN", content: "Ciszuko Antony (Francisco Garcia), como creador de MuzicMania, se reserva el derecho final de interpretación de estas directrices y de la administración de accesos a la plataforma." },
];

export default function GuidelinesPage() {
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
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-0 pb-28 space-y-16">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={itemVariants} className="relative space-y-8 pt-12 text-center">
          <div className="flex flex-col items-center gap-1">
             <div className="flex items-center justify-center gap-6 group">
                <div className="w-12 h-12 text-neon-purple flex items-center justify-center">
                   {I.document}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-purple via-white to-neon-purple bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  DIRECTRICES
                </h1>
             </div>
             <p className="text-neon-purple font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Marco Normativo MuzicMania v2.0
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
               <div className="w-8 h-8 text-white/20">{I.stamp}</div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Documento Oficial de la Red Ciszu</span>
            </div>

            <div className="space-y-10">
              {ARTICLES.map((art) => (
                <motion.article 
                  key={art.id}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex gap-6 md:gap-8">
                    <div className="flex-shrink-0 pt-1">
                      <span className="text-neon-purple font-mono font-bold text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        {art.id.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-xl font-header font-black text-white italic uppercase tracking-tighter group-hover:text-neon-purple transition-colors">
                        ART. {art.id}: {art.title}
                      </h2>
                      <p className="text-gray-400 font-bold leading-relaxed text-sm md:text-base selection:bg-neon-purple/30">
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
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">Validado para Producción</p>
                 <p className="text-[9px] font-bold text-gray-500 italic">Ecosistema MuzicMania 2026</p>
               </div>
               <div className="w-24 h-1 bg-neon-purple/50 rounded-full" />
            </div>

          </div>
        </motion.div>

        <QuickDocks />

      </div>
    </MainLayout>
  );
}


