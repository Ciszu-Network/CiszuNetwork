'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';

// --- Pure SVG Icon Library ---
const I = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  lifeBuoy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>,
  chevronRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  monitor: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  cpu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M9 9h6v6H9z"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>,
  alertCircle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  messageCircle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
};

const HELP_DOCKS = [
  { 
    id: 1, title: "Recuperación de Cuenta", category: "Cuenta", color: "neon-blue", icon: I.shield, href: "/support",
    desc: "Si has perdido el acceso a tu cuenta, puedes iniciar un proceso de recuperación manual verificando tu identidad a través del correo electrónico vinculado.",
    tags: "login password contraseña recuperar perdido email correo seguridad identity"
  },
  { 
    id: 2, title: "Ajuste de Latencia (Offset)", category: "Juego", color: "neon-red", icon: I.zap, href: "/information#tutorial",
    desc: "Calibra el tiempo de respuesta visual y sonoro para asegurar que tus pulsaciones sean precisas. Un buen offset es la clave para obtener puntuaciones perfectas.",
    tags: "calibracion offset delay audio sincronizacion lag beat tiempo rítmico"
  },
  { 
    id: 3, title: "Controles y WASD", category: "Guía", color: "neon-blue", icon: I.monitor, href: "/information#tutorial",
    desc: "Aprende a configurar tu mapeo de teclas preferido. Soporte completo para WASD, Flechas y configuraciones personalizadas para una ergonomía superior.",
    tags: "teclado controls keyboard mouse raton controles pad mando joystick configuracion teclas setup mapping"
  },
  { 
    id: 4, title: "Optimización de FPS", category: "Técnico", color: "neon-cyan", icon: I.cpu, href: "/information#ecosistema",
    desc: "Guía técnica para maximizar el rendimiento de tu navegador. Evita el stuttering y las caídas de frames durante las canciones de alto BPM.",
    tags: "fps lag rendimiento performance optimizacion frames monitor hardware gpu cpu fluidez"
  },
  { 
    id: 5, title: "Reporte de Bugs", category: "Soporte", color: "neon-pink", icon: I.alertCircle, href: "/contact",
    desc: "¿Encontraste algo que no funciona bien? Reporta errores visuales o de lógica directamente a nuestro equipo para una corrección rápida.",
    tags: "bug error reporte fallo glitch crash mal funcionamiento problema staff ticket"
  },
  { 
    id: 6, title: "Problemas de Audio", category: "Técnico", color: "neon-blue", icon: I.messageCircle, href: "/support",
    desc: "Soluciones a problemas comunes de falta de sonido, distorsión o eco. Optimiza la salida de audio de tu sistema para la mejor experiencia rítmica.",
    tags: "sonido audio music musica volumen output salida distorsion eco speaker cascos audifonos"
  },
  { 
    id: 7, title: "Skins Personalizadas", category: "Personalización", color: "neon-cyan", icon: I.chevronRight, href: "/library",
    desc: "Domina el arte de la personalización visual. Aprende a aplicar texturas y temas que se adapten a tu estilo de juego.",
    tags: "aspecto skins colores visual temas apariencia flechas notes notas personalizacion"
  },
  { 
    id: 8, title: "Login y Registro", category: "Cuenta", color: "neon-blue", icon: I.shield, href: "/support",
    desc: "Gestión segura de cuentas. Aprende a vincular servicios externos y mantener tu progreso sincronizado en la nube de MuzicMania.",
    tags: "cuenta account login registrar ingreso entrar crear nube sync sincronizacion"
  },
  { 
    id: 9, title: "Privacidad de Perfil", category: "Cuenta", color: "neon-pink", icon: I.globe, href: "/policy",
    desc: "Tú controlas quién ve tus estadísticas. Ajusta la visibilidad de tu perfil y récords personales en la tabla de líderes globales.",
    tags: "privacidad privacy datos perfil ocultar visible seguridad records ranking personal"
  },
  { 
    id: 10, title: "Seguridad 2FA", category: "Cuenta", color: "neon-blue", icon: I.shield, href: "/profile",
    desc: "Protege tu cuenta con autenticación de dos factores. Una capa extra de seguridad para evitar accesos no autorizados a tus datos.",
    tags: "seguridad protection 2fa autenticacion codigo proteccion hack cuenta seguro"
  },
  { 
    id: 11, title: "Rankings Globales", category: "Competitivo", color: "neon-yellow", icon: I.globe, href: "/leaderboard",
    desc: "Mídete contra los mejores del mundo. Consulta los rankings actualizados en tiempo real y descubre en qué posición estás.",
    tags: "ranking leaderboard top mejores puntos scores puntuacion global mundial"
  },
  { 
    id: 12, title: "Modo Multijugador", category: "Social", color: "neon-blue", icon: I.messageCircle, href: "/information",
    desc: "Compite cara a cara. Información sobre el estado del servidor multiplayer y cómo crear salas para enfrentarte a tus amigos.",
    tags: "multiplayer online social amigos salas versus pvp competitivo jugar remoto"
  },
  { 
    id: 13, title: "Tienda y Créditos", category: "Comercio", color: "neon-blue", icon: I.chevronRight, href: "/about",
    desc: "Explora el catálogo de cosméticos y apoya el desarrollo continuo del motor mediante micro-transacciones éticas y transparentes.",
    tags: "tienda shop comprar creditos dinero coins monedas cosmeticos apoyo donar"
  },
  { 
    id: 14, title: "Ayuda Directa", category: "Soporte", color: "neon-blue", icon: I.messageCircle, href: "/contact",
    desc: "Habla con nuestro Staff. Si tu problema no está en este manual, nuestro equipo te asistirá de forma personalizada.",
    tags: "staff contacto mensaje directo soporte ayuda humano asistencia ticket"
  },
  { 
    id: 15, title: "Normas de Comunidad", category: "Legal", color: "neon-red", icon: I.alertCircle, href: "/rules",
    desc: "Mantén un ambiente sano. Lee las reglas de convivencia y comportamiento que rigen a todos los miembros de Ciszu Network.",
    tags: "reglas normas reglas comportamiento toxicidad respeto reglas comunidad foro"
  },
  { 
    id: 16, title: "Términos de Servicio", category: "Legal", color: "neon-blue", icon: I.chevronRight, href: "/terms",
    desc: "El marco legal de tu estancia aquí. Consulta tus derechos y responsabilidades como usuario del motor de ritmo MuzicMania.",
    tags: "legal terminos condiciones contrato tos service derechos obligaciones legalidad"
  },
  { 
    id: 17, title: "Soporte Técnico 24/7", category: "Soporte", color: "neon-pink", icon: I.messageCircle, href: "/support",
    desc: "Asistencia ininterrumpida para fallos críticos de la plataforma. Nuestro sistema de monitoreo asegura estabilidad constante.",
    tags: "soporte tecnico support 24h ayuda asistencias mantenimientos servidor caido"
  },
  { 
    id: 18, title: "Eventos y Torneos", category: "Comunidad", color: "neon-yellow", icon: I.globe, href: "/changelog",
    desc: "No te pierdas de nada. Mantente al día con las próximas temporadas competitivas y eventos especiales con premios exclusivos.",
    tags: "eventos torneos seasons temporadas premios noticias novedades updates"
  },
  { 
    id: 19, title: "Calibración Monitor", category: "Técnico", color: "neon-blue", icon: I.monitor, href: "/information#tutorial",
    desc: "Optimiza la tasa de refresco y el lag de entrada de tu pantalla para una sincronización visual perfecta con las notas.",
    tags: "hz monitor pantalla refresco lag visual sincronizacion vista ojos fluidez"
  },
  { 
    id: 20, title: "Mapas y Canciones", category: "Contenido", color: "neon-cyan", icon: I.chevronRight, href: "/library",
    desc: "Explora la inmensa biblioteca de pistas. Desde clásicos oficiales hasta contribuciones estelares de la comunidad.",
    tags: "canciones tracks mapas music musica biblioteca library play contenido niveles"
  },
  { 
    id: 21, title: "Contribución Código", category: "Dev", color: "neon-blue", icon: I.cpu, href: "/information#ecosistema",
    desc: "Si eres desarrollador y el ritmo corre por tus venas, descubre cómo puedes ayudar a mejorar el código del proyecto.",
    tags: "dev git github codigo programacion contribuir ayudar desarrollo motor engine"
  },
  { 
    id: 22, title: "Soporte / Donaciones", category: "Apoyo", color: "neon-pink", icon: I.chevronRight, href: "/about",
    desc: "MuzicMania crece gracias a ti. Descubre las formas en las que puedes contribuir económicamente a mantener los servidores online.",
    tags: "donar apoyar dinero patreon payment pago ayuda servidor costos financiero"
  },
  { 
    id: 23, title: "API para Devs", category: "Dev", color: "neon-cyan", icon: I.cpu, href: "/documentation",
    desc: "Documentación técnica avanzada para integrar los datos rítmicos de MuzicMania en tus propias aplicaciones o sitios web.",
    tags: "api devs documentacion integracion datos programadores desarrollo externo web"
  },
  { 
    id: 24, title: "Estado de Servidores", category: "Técnico", color: "neon-green", icon: I.globe, href: "/stats",
    desc: "Consulta en tiempo real el rendimiento de nuestra infraestructura y si hay mantenimientos programados para el sistema.",
    tags: "estado server status infra mantenimiento online uptime respuesta red ping"
  },
];

export default function HelpCenterPage() {
  usePageTitle('HELP');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDock, setSelectedDock] = useState<typeof HELP_DOCKS[0] | null>(null);

  const filteredDocks = HELP_DOCKS.filter(dock => {
    const q = searchQuery.toLowerCase();
    return (
      dock.title.toLowerCase().includes(q) ||
      dock.category.toLowerCase().includes(q) ||
      dock.tags.toLowerCase().includes(q) ||
      dock.desc.toLowerCase().includes(q)
    );
  });

  return (
    <MainLayout>
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-neon-pink/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-0 pb-32 space-y-20">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative space-y-8 pt-12 text-center">
          <div className="flex flex-col items-center gap-1">
             <div className="flex items-center justify-center gap-6 group">
                <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
                   {I.lifeBuoy}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-white to-neon-purple bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  AYUDA
                </h1>
             </div>
             <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Optimización y Soporte Maestro
             </p>
          </div>
        </motion.header>

          <p className="max-w-2xl mx-auto text-gray-400 font-bold text-lg md:text-xl selection:bg-neon-blue/30">
            Explora nuestra base de conocimientos inteligente o busca un tema específico para mejorar tu flujo de juego.
          </p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full blur opacity-25 group-focus-within:opacity-75 transition duration-500" />
            <div className="relative flex items-center bg-black/80 rounded-full border border-white/10 px-6 py-4 backdrop-blur-3xl">
              <div className="w-6 h-6 text-gray-500 group-focus-within:text-neon-blue transition-colors">
                {I.search}
              </div>
              <input 
                type="text" 
                placeholder="Busca un tema de ayuda..."
                className="flex-1 bg-transparent border-none outline-none px-4 text-white font-header font-bold placeholder:text-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

        {/* --- GRID OF DOCKS --- */}
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
             <h2 className="text-2xl font-header font-black uppercase tracking-widest text-white">
               Categorías <span className="text-neon-blue">Inteligentes</span>
             </h2>
             <span className="text-xs font-mono text-gray-600">{filteredDocks.length} Temas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredDocks.map((dock) => (
                <motion.div
                  key={dock.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="group"
                  onClick={() => setSelectedDock(dock)}
                >
                  <div className="block relative h-full">
                    <div className={`absolute inset-0 bg-${dock.color}/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative h-full bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm hover:border-white/20 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-6">
                         <div className={`p-4 bg-${dock.color}/10 rounded-2xl text-${dock.color} group-hover:scale-110 transition-transform shadow-lg shadow-black/40`}>
                            <div className="w-6 h-6">
                              {dock.icon}
                            </div>
                         </div>
                         <div className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors">
                           {I.chevronRight}
                         </div>
                      </div>
                      <div className="space-y-1">
                         <span className={`text-[10px] font-black uppercase tracking-widest text-${dock.color}/60`}>
                           {dock.category}
                         </span>
                         <h3 className="text-lg font-header font-black text-white leading-tight uppercase group-hover:text-neon-blue transition-colors">
                           {dock.title}
                         </h3>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredDocks.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-[3rem] space-y-4">
               <div className="w-12 h-12 text-gray-800 mx-auto">
                 {I.alertCircle}
               </div>
               <p className="text-gray-500 font-bold">Sin resultados para &quot;{searchQuery}&quot;</p>
               <button onClick={() => setSearchQuery('')} className="text-neon-blue font-bold hover:underline font-header">Reiniciar búsqueda</button>
            </motion.div>
          )}
        </section>

        {/* --- MODAL SYSTEM --- */}
        <AnimatePresence>
          {selectedDock && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedDock(null)}
                 className="absolute inset-0 bg-black/80 backdrop-blur-md"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-xl bg-doc-dark border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-8 overflow-hidden"
               >
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-${selectedDock.color}/10 blur-[100px] -z-10`} />
                  
                  <div className="flex justify-between items-start">
                     <div className={`p-5 bg-${selectedDock.color}/10 rounded-2xl text-${selectedDock.color}`}>
                        <div className="w-10 h-10">{selectedDock.icon}</div>
                     </div>
                     <button onClick={() => setSelectedDock(null)} className="p-3 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full">
                        <div className="w-6 h-6">{I.close}</div>
                     </button>
                  </div>

                  <div className="space-y-4">
                     <span className={`text-xs font-black uppercase tracking-[0.3em] text-${selectedDock.color}/70`}>
                        {selectedDock.category}
                     </span>
                     <h3 className="text-4xl font-header font-black text-white uppercase italic leading-none">
                        {selectedDock.title}
                     </h3>
                     <p className="text-gray-400 font-bold text-lg leading-relaxed pt-4 border-t border-white/5">
                        {selectedDock.desc}
                     </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                     <Link href={selectedDock.href} className={`flex-1 px-8 py-5 bg-${selectedDock.color} text-black font-header font-black uppercase tracking-widest rounded-2xl text-center hover:scale-[1.02] transition-all shadow-lg`}>
                        Ir a la fuente
                     </Link>
                     <button onClick={() => setSelectedDock(null)} className="px-8 py-5 bg-white/5 border border-white/10 text-white font-header font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                        Cerrar Previa
                     </button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- READING GUIDE --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-t border-white/5 pt-20">
           <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-header font-black uppercase text-white leading-tight">
                Optimización de <span className="text-neon-cyan">Sistema</span>
              </h2>
              <div className="space-y-6">
                 {[
                   { t: 'Audio Determinista', d: 'Usa dispositivos de salida de baja latencia para que el ritmo nunca se desvíe.' },
                   { t: 'Renderizado Edge', d: 'MuzicMania corre mejor en navegadores basados en Chromium.' },
                   { t: 'Latencia de Entrada', d: 'Un teclado de alta tasa de refresco (1000Hz) es vital para notas rápidas.' }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="w-1 h-12 bg-neon-cyan/40 rounded-full self-center" />
                      <div className="space-y-1">
                        <h4 className="text-white font-bold uppercase text-sm tracking-widest">{item.t}</h4>
                        <p className="text-gray-500 text-sm font-medium">{item.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="relative p-10 bg-doc-dark border border-white/5 rounded-[3rem] space-y-6">
              <h3 className="text-2xl font-header font-black text-white uppercase tracking-tight italic">Calibración de Latencia</h3>
              <p className="text-gray-400 font-medium leading-relaxed font-bold">
                Si notas que las notas llegan antes o después del beat, ajusta el <span className="text-neon-cyan">Global Offset</span>. Un valor de +20ms a +40ms suele corregir el retraso visual.
              </p>
              <Link href="/information#tutorial" className="inline-flex items-center gap-2 text-neon-cyan font-black uppercase text-xs tracking-widest hover:underline font-header">
                Ir al tutorial de calibración {I.chevronRight}
              </Link>
           </div>
        </section>

        {/* --- SUPPORT DISCLAIMER (GREEN) --- */}
        <section className="relative">
          <div className="absolute inset-0 bg-neon-green/10 rounded-[4rem] blur-[100px] opacity-30" />
          <div className="relative p-12 md:p-16 bg-black/60 border-2 border-neon-green/10 rounded-[4rem] text-center space-y-10 backdrop-blur-3xl">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-6xl font-header font-black uppercase text-white tracking-tighter">
                ¿NECESITAS MÁS <span className="text-neon-green">AYUDA</span>?
              </h2>
              <p className="max-w-xl mx-auto text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">
                Nuestro equipo está listo para asistirte de forma personalizada.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
               <Link href="/support" 
                 className="px-12 py-5 bg-neon-green text-black font-header font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:shadow-neon-green/50">
                 SOPORTE
               </Link>
               <Link href="/contact" 
                 className="px-12 py-5 border-2 border-neon-green/40 text-neon-green font-header font-black uppercase tracking-widest rounded-full hover:bg-neon-green/10 transition-all hover:border-neon-green">
                 CONTACTO
               </Link>
            </div>
          </div>
        </section>

        <QuickDocks />

      </div>
    </MainLayout>
  );
}



