'use client';

import MainLayout from '@/components/templates/MainLayout';
import { Info } from 'lucide-react';


export default function AboutPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* --- HERO --- */}
        <header id="hero" className="relative space-y-8 pt-12 text-center">
          <div className="flex flex-col items-center gap-1">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
                   <Info className="w-12 h-12" />
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  SOBRE NOSOTROS
                </h1>
             </div>
             <p className="text-neon-blue font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               EL FUTURO DEL RITMO WEB
             </p>
          </div>
        </header>
      <div className="space-y-12">
        <section className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <p className="text-xl text-white font-semibold">
              <span className="text-neon-blue">MuzicMania</span> no es solo un simulador de ritmo; es una oda a la era digital, la estética neón y la precisión técnica.
            </p>
            <p>
              Nacido como un proyecto independiente, busca fusionar la fluidez de los juegos arcade clásicos con las capacidades modernas de la web. Nuestra misión es democratizar el acceso a la música y el arte visual cyberpunk.
            </p>
          </div>
          <div className="w-48 h-48 bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-3xl flex items-center justify-center shadow-neon-blue/50 shadow-2xl animate-pulse">
            <img src="/content/logos/isotipo.svg" alt="MuzicMania" className="w-24 h-24 drop-shadow-glow" />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Latencia Zero', desc: 'Audio procesado por WebAudio API para respuestas instantáneas.', color: 'text-neon-blue', border: 'border-neon-blue' },
            { title: 'Visuales Reactivos', desc: 'El fondo y las luces bailan al ritmo de la frecuencia real del track.', color: 'text-neon-pink', border: 'border-neon-pink' },
            { title: 'Cloud Sync', desc: 'Tus récords se guardan y sincronizan en todos tus dispositivos.', color: 'text-neon-cyan', border: 'border-neon-cyan' }
          ].map((feature, i) => (
            <div key={i} className={`p-6 bg-white/5 border-l-4 ${feature.border} rounded-r-xl space-y-2`}>
              <h3 className={`font-header font-black ${feature.color}`}>{feature.title}</h3>
              <p className="text-sm text-gray-400 font-medium">{feature.desc}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-header font-black text-neon-pink">CÓMO JUGAR</h2>
          <div className="bg-neon-blue/10 border-2 border-neon-blue rounded-3xl p-8">
            <ol className="list-decimal list-inside space-y-4 text-lg font-medium">
              <li>Selecciona una canción de la lista en el modo <span className="text-neon-blue">Jugar</span>.</li>
              <li>Las flechas caerán desde arriba sincronizadas con la música.</li>
              <li>Presiona la tecla correspondiente (<span className="text-neon-cyan">Flechas o WASD</span>) cuando la flecha llegue a la zona de hit.</li>
              <li>Acumula combos para multiplicar tu puntuación y alcanzar el Top Global.</li>
            </ol>
          </div>
        </section>


      </div>
      </div>
    </MainLayout>
  );
}
