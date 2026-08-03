'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';

// --- Icons Library ---
const I = {
  help:    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>,
  search:  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  chevron: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={3}><path d="m6 9 6 6 6-6"/></svg>,
  music:   <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  zap:     <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
};

const faqData = [
  // --- JUGABILIDAD ---
  { 
    id: 1, question: '¿Cómo cambio la velocidad de las notas?', 
    answer: 'Usa las teclas F3 y F4 durante la selección de canción o pausa para ajustar el "Scroll Speed". Esto ayuda a que las notas se separen o se junten más.',
    icon: I.zap, color: 'red', tags: 'velocidad scroll speed notas rapido lento'
  },
  { 
    id: 2, question: '¿Puedo jugar con un control o mando?', 
    answer: 'Sí, MuzicMania soporta mandos genéricos y de consolas mediante el estándar Gamepad API del navegador. Solo conéctalo y presiona cualquier botón.',
    icon: I.help, color: 'blue', tags: 'control mando gamepad joystick'
  },
  { 
    id: 3, question: '¿Cómo calibro el desfase (Offset)?', 
    answer: 'Si sientes que el audio y las notas no coinciden, ve a Ajustes > Audio y ajusta el Offset en milisegundos. Un valor positivo retrasa las notas.',
    icon: I.help, color: 'purple', tags: 'calibracion offset audio delay'
  },
  { 
    id: 4, question: '¿Qué significan las calificaciones (Perfect, Great, etc.)?', 
    answer: 'Perfect: Impacto preciso. Great: Ligero desfase. Good: Desfase notable. Bad/Miss: Error en la nota. Tu combo se rompe con Bad o Miss.',
    icon: I.help, color: 'green', tags: 'calificacion accuracy perfect miss'
  },
  // --- TÉCNICO ---
  { 
    id: 5, question: '¿Cuál es el mejor navegador para jugar?', 
    answer: 'Recomendamos navegadores basados en Chromium (Chrome, Edge, Brave, Opera) para obtener la menor latencia de audio posible.',
    icon: I.help, color: 'cyan', tags: 'navegador chrome edge performance'
  },
  { 
    id: 6, question: 'El juego va lento (lag), ¿qué hago?', 
    answer: 'Asegúrate de tener la aceleración por hardware activada en tu navegador y cierra pestañas pesadas. También puedes bajar la calidad visual en Ajustes.',
    icon: I.help, color: 'orange', tags: 'lag rendimiento lento fps'
  },
  { 
    id: 7, question: '¿Cómo reporto un bug?', 
    answer: 'Usa el formulario de contacto o nuestro canal de Discord en la sección #bug-reports. Adjunta capturas y especifica tu navegador.',
    icon: I.help, color: 'pink', tags: 'bug error reporte fallo'
  },
  // --- CUENTA Y COMUNIDAD ---
  { 
    id: 8, question: '¿Para qué sirve registrarse?', 
    answer: 'Al registrarte, tus récords se guardan en el Leaderboard global, puedes subir de nivel, ganar insignias y personalizar tu perfil.',
    icon: I.help, color: 'purple', tags: 'registro cuenta login progreso'
  },
  { 
    id: 9, question: '¿Puedo cambiar mi nombre de usuario?', 
    answer: 'Sí, desde los ajustes de perfil. Solo puedes cambiarlo una vez cada 30 días para evitar confusión en el ranking.',
    icon: I.help, color: 'blue', tags: 'nombre usuario perfil cambiar'
  },
  { 
    id: 10, question: '¿Es gratis?', 
    answer: 'MuzicMania es 100% gratuito. No hay suscripciones ni compras que afecten la jugabilidad.',
    icon: I.help, color: 'green', tags: 'gratis pago dinero free'
  },
  // --- EXPANSIÓN (Nuevas Preguntas) ---
  { id: 11, question: '¿Qué es Ciszu Network?', answer: 'Es la matriz creativa y tecnológica detras de MuzicMania, fundada por Ciszuko Antony para gestionar proyectos digitales.', icon: I.help, color: 'cyan', tags: 'ciszu network matriz empresa' },
  { id: 12, question: '¿Habrá modo multijugador?', answer: 'Estamos desarrollando un modo 1vs1 en tiempo real para la versión Beta 2.0. ¡Prepárate para los duelos!', icon: I.help, color: 'pink', tags: 'multiplayer 1v1 online' },
  { id: 13, question: '¿Puedo usar mi propia música?', answer: 'Actualmente no, pero el modo "Editor de Niveles" permitirá cargar archivos .ogg locales para mapear tus propios beats en el futuro.', icon: I.music, color: 'purple', tags: 'custom musica propia local' },
  { id: 14, question: '¿Cómo puedo ser moderador?', answer: 'Abrimos convocatorias periódicamente en Discord para usuarios activos y respetuosos con la comunidad.', icon: I.help, color: 'blue', tags: 'staff moderador ayudar' },
  { id: 15, question: '¿El juego funciona sin Internet?', answer: 'Necesitas conexión para cargar los recursos iniciales y guardar puntos, pero una vez cargada la canción, puedes terminarla offline.', icon: I.help, color: 'orange', tags: 'offline internet conexion' },
  { id: 16, question: '¿Qué tecnologías usa MuzicMania?', answer: 'Se construye con Next.js 15, React 19, tailwind CSS 4, Supabase y Framer Motion.', icon: I.help, color: 'cyan', tags: 'stack tecnologia desarrollo' },
  { id: 17, question: '¿Las canciones tienen Copyright?', answer: 'Usamos licencias de libre uso (NCS, Creative Commons) o acuerdos directos con artistas. Nada de piratería.', icon: I.music, color: 'red', tags: 'copyright derechos legal' },
  { id: 18, question: '¿Cómo subo de nivel?', answer: 'Jugando canciones completas. El nivel se calcula basándose en tu Accuracy promedio y la dificultad de los tracks.', icon: I.help, color: 'green', tags: 'nivel xp experiencia' },
  { id: 19, question: '¿Hay un modo práctica?', answer: 'Sí, puedes activar el modo "No Fail" en ajustes de partida para no perder aunque falles todas las notas.', icon: I.help, color: 'blue', tags: 'practica no fail entrenamiento' },
  { id: 20, question: '¿Por qué el nombre MuzicMania?', answer: 'Representa la "manía" o pasión desbordante por el ritmo y la música interactiva.', icon: I.music, color: 'pink', tags: 'nombre historia significado' },
  { id: 21, question: '¿Puedo personalizar el color del Neón?', answer: 'Sí, los usuarios con rango "Supporter" pueden cambiar el esquema de colores de la interfaz.', icon: I.help, color: 'cyan', tags: 'personalizacion colores neon' },
  { id: 22, question: '¿Cómo funcionan los Beats por Minuto (BPM)?', answer: 'El BPM define la velocidad rítmica de la canción. A mayor BPM, más frenética es la jugabilidad.', icon: I.zap, color: 'red', tags: 'bpm ritmo velocidad' },
  { id: 23, question: '¿Hay versiones para iPhone o Android?', answer: 'Estamos optimizando la web para móviles. Una App nativa está en el Roadmap para 2026.', icon: I.help, color: 'orange', tags: 'movil ios android app' },
  { id: 24, question: '¿Qué es el combo máximo?', answer: 'Es el número de notas consecutivas que has acertado sin cometer errores (Miss).', icon: I.help, color: 'green', tags: 'combo maximo record' },
  { id: 25, question: '¿Puedo borrar mi cuenta?', answer: 'Sí, desde Ajustes de Privacidad. Ten en cuenta que esto eliminará todos tus récords permanentemente.', icon: I.help, color: 'red', tags: 'borrar cuenta privacidad' },
  { id: 26, question: '¿Cómo gano insignias (Badges)?', answer: 'Completando desafíos específicos, como terminar una canción en dificultad Master con 100% de Accuracy.', icon: I.help, color: 'purple', tags: 'insignia logros badges' },
  { id: 27, question: '¿Qué es el modo Espectador?', answer: 'Permite ver las partidas de otros usuarios en el Leaderboard para aprender sus patrones de juego.', icon: I.help, color: 'blue', tags: 'espectador ver partidas' },
  { id: 28, question: '¿Cómo contacto al creador?', answer: 'A través de la sección de Soporte o mencionando a @CiszukoAntony en nuestras redes oficiales.', icon: I.help, color: 'pink', tags: 'contacto ciszuko antony' },
  { id: 29, question: '¿El código es Abierto (Open Source)?', answer: 'El motor principal es privado por ahora, pero las APIs de Highscores serán públicas para desarrolladores pronto.', icon: I.help, color: 'cyan', tags: 'open source github codigo' },
  { id: 30, question: '¿Cuántas canciones hay?', answer: 'Añadimos nuevos tracks semanalmente. El objetivo es tener un catálogo de más de 100 pistas para el lanzamiento oficial.', icon: I.music, color: 'blue', tags: 'cantidad canciones tracks' },
  { id: 31, question: '¿Puedo streamear el juego en Twitch?', answer: '¡Totalmente! Las canciones están permitidas para streaming sin riesgo de DMCA en la mayoría de los casos.', icon: I.help, color: 'purple', tags: 'twitch stream dmca youtube' },
  { id: 32, question: '¿Qué pasa si olvido mi contraseña?', answer: 'Usa el enlace de "Recuperar Contraseña" en el Login. Recibirás un token de acceso en tu correo registrado.', icon: I.help, color: 'orange', tags: 'contraseña recuperar password' },
  { id: 33, question: '¿El juego tiene anuncios?', answer: 'No. MuzicMania se financia mediante donaciones voluntarias de la comunidad a Ciszu Network.', icon: I.help, color: 'green', tags: 'anuncios publicidad ads' },
  { id: 34, question: '¿Cómo ajusto el volumen?', answer: 'En el menú de pausa o en Ajustes. Puedes nivelar la música y los efectos de impacto por separado.', icon: I.music, color: 'blue', tags: 'volumen audio sonido settings' },
  { id: 35, question: '¿Qué es el Ghost Tap?', answer: 'Es la capacidad de presionar teclas sin que cuente como error si no hay una nota cerca. Se puede activar en ajustes.', icon: I.help, color: 'cyan', tags: 'ghost tap notas error' },
  { id: 36, question: '¿Hay eventos especiales?', answer: 'Sí, realizamos torneos mensuales con insignias exclusivas para los ganadores.', icon: I.help, color: 'pink', tags: 'eventos torneos premios' },
  { id: 37, question: '¿Puedo jugar con teclado mecánico?', answer: 'Es lo más recomendable para mayor precisión y respuesta táctil.', icon: I.help, color: 'blue', tags: 'teclado mecanico pc' },
  { id: 38, question: '¿Cómo funciona el sistema de búsqueda?', answer: 'Puedes buscar canciones por nombre, artista o género en la pantalla de selección.', icon: I.help, color: 'white', tags: 'buscar buscador tracks' },
  { id: 39, question: '¿Qué es el SR (Skill Rating)?', answer: 'Es un valor numérico que representa tu nivel de habilidad general basándose en todas tus puntuaciones.', icon: I.help, color: 'purple', tags: 'sr skill rating habilidad' },
  { id: 40, question: '¿Puedo jugar en pantalla completa?', answer: 'Sí, presiona la tecla "F" durante el juego o usa el botón de fullscreen en el Navbar.', icon: I.help, color: 'cyan', tags: 'fullscreen pantalla completa' },
  { id: 41, question: '¿Qué pasa si alguien hace trampas?', answer: 'Nuestro sistema detecta macros y scripts. Las cuentas sospechosas son baneadas permanentemente del Leaderboard.', icon: I.help, color: 'red', tags: 'trampas hacks ban seguridad' },
  { id: 42, question: '¿Dónde se guardan las capturas?', answer: 'Si usas nuestro sistema de capturas interno, se descargan directamente a tu carpeta de Descargas.', icon: I.help, color: 'blue', tags: 'screenshot capturas imagenes' },
  { id: 43, question: '¿Por qué algunas canciones están bloqueadas?', answer: 'Algunas pistas requieren que alcances cierto nivel de XP o que completes canciones anteriores.', icon: I.help, color: 'orange', tags: 'bloqueado nivel desbloquear' },
  { id: 44, question: '¿Cómo ayudo al proyecto?', answer: 'Compartiendo el juego, reportando errores o donando mediante BuyMeACoffee en el footer.', icon: I.help, color: 'pink', tags: 'ayuda donar colaborar' },
  { id: 45, question: '¿Qué es el modo Sudden Death?', answer: 'Un modificador donde fallar una sola nota significa el fin de la partida inmediatamente.', icon: I.help, color: 'red', tags: 'sudden death muerte súbita' },
  { id: 46, question: '¿Hay un tutorial básico?', answer: 'Sí, al iniciar el juego por primera vez se te invita a completar el tutorial "Basic Beats".', icon: I.help, color: 'green', tags: 'tutorial aprender inicio' },
  { id: 47, question: '¿Se puede jugar con 2 personas en una PC?', answer: 'El modo Local Versus permite que dos jugadores usen el mismo teclado (WASD vs Flechas).', icon: I.help, color: 'blue', tags: 'local versus 2 jugadores' },
  { id: 48, question: '¿Qué es la página de Información?', answer: 'Es el centro de documentación donde detallamos la identidad, colores e historia de MuzicMania.', icon: I.help, color: 'cyan', tags: 'informacion docs' },
  { id: 49, question: '¿Habrá skins para las notas?', answer: 'Sí, estamos diseñando diferentes estilos de flechas y circulos rítmicos para personalizar la visual.', icon: I.help, color: 'purple', tags: 'skins notas diseño' },
  { id: 50, question: '¿Quién es el mejor jugador actual?', answer: 'Revisa el Top 1 global en nuestro Leaderboard. ¡Tal vez seas tú mañana!', icon: I.help, color: 'white', tags: 'top ranking mejor jugador' },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const filteredFaq = faqData.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.question.toLowerCase().includes(q) || 
      item.tags.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q)
    );
  });

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <MainLayout>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-neon-cyan/5 rounded-full blur-[200px] animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-0 pb-28 space-y-16">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-cyan flex items-center justify-center">
                   {I.help}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-cyan via-white to-neon-cyan bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  AYUDA
                </h1>
             </div>
             <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Centro de Soporte y Preguntas Frecuentes
             </p>
          </div>
        </motion.header>

        {/* --- SEARCH BAR --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="max-w-2xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full blur opacity-25 group-focus-within:opacity-75 transition duration-500" />
          <div className="relative flex items-center bg-black/80 rounded-full border border-white/10 px-6 py-4 backdrop-blur-3xl shadow-2xl focus-within:border-neon-blue/40 transition-all duration-300">
            <div className="w-6 h-6 text-gray-500 group-focus-within:text-neon-blue transition-colors">
              {I.search}
            </div>
            <input 
              type="text" 
              placeholder="Busca una pregunta (ej: bug, cuenta, móvil)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-4 text-white font-header font-bold placeholder:text-gray-700 transition-all"
            />
          </div>
        </motion.section>

        {/* --- FAQ ITEMS --- */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="grid grid-cols-1 gap-6 px-2 md:px-0">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredFaq.length > 0 ? (
                filteredFaq.map((item) => (
                  <motion.div 
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-doc-dark border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300 group ${openId === item.id ? 'border-neon-cyan/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] bg-white/5' : 'hover:border-white/20'}`}
                  >
                    <button 
                      onClick={() => setOpenId(openId === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between p-8 text-left relative z-10"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 p-3 bg-black/40 rounded-2xl border border-white/5 text-neon-${item.color} group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-300`}>
                          {item.icon}
                        </div>
                        <h3 className={`text-lg md:text-xl font-header font-black uppercase italic tracking-tighter transition-colors ${openId === item.id ? 'text-white' : 'text-gray-300'}`}>
                          {item.question}
                        </h3>
                      </div>
                      <div className={`w-6 h-6 transition-transform duration-500 ${openId === item.id ? 'rotate-180 text-neon-cyan' : 'text-gray-600'}`}>
                        {I.chevron}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {openId === item.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="px-8 pb-10 pt-2 border-t border-white/5 text-gray-400 font-bold text-sm md:text-base leading-relaxed max-w-3xl ml-20">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="p-20 text-center space-y-6 bg-doc-dark border border-white/5 rounded-[3rem]"
                >
                   <div className="w-16 h-16 text-gray-800 mx-auto">
                     {I.help}
                   </div>
                   <div className="space-y-2">
                     <p className="text-gray-500 font-header font-black uppercase italic text-xl tracking-widest">No se encontraron resultados</p>
                     <p className="text-xs text-gray-700 font-black uppercase tracking-[0.3em]">Intenta con otros términos o reinicia la búsqueda</p>
                   </div>
                   <button 
                     onClick={() => setSearchTerm('')}
                     className="px-10 py-4 bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan rounded-xl font-header font-black uppercase tracking-widest text-xs hover:bg-neon-cyan hover:text-black transition-all"
                   >
                     Reiniciar búsqueda
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        <QuickDocks />

      </div>
    </MainLayout>
  );
}

