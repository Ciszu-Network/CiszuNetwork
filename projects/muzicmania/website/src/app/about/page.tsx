'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/hooks/useT';
import MainLayout from '@/components/templates/MainLayout';
import { Icon } from '@ciszu/ui';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { usePageTitle } from '@/lib/usePageTitle';


export default function AboutPage() {
  const t = useT();
  usePageTitle('ABOUT');
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* --- HERO --- */}
        <header id="hero" className="relative space-y-8 pt-12 text-center">
          <div className="flex flex-col items-center gap-1">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
                   <Icon name="info" size={48} />
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  {t.pages.aboutExt.heroTitle}
                </h1>
             </div>
             <p className="text-neon-blue font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               {t.pages.aboutExt.futureTitle}
             </p>
          </div>
        </header>
      <div className="space-y-12">
        <section className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <p className="text-xl text-white font-semibold">
              <span className="text-neon-blue">MuzicMania</span> {t.pages.aboutExt.descSegment}
            </p>
            <p>
              Nacido como un proyecto independiente, busca fusionar la fluidez de los juegos arcade clásicos con las capacidades modernas de la web. Nuestra misión es democratizar el acceso a la música y el arte visual cyberpunk.
            </p>
          </div>
          <div className="relative w-48 h-48 shrink-0 rounded-3xl overflow-hidden bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink flex items-center justify-center shadow-neon-blue/50 shadow-2xl">
            <Image
              src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')}
              alt={t.pages.aboutExt.altIsotipo}
              fill
              sizes="192px"
              className="object-contain p-8 drop-shadow-neon-blue"
            />
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
          <h2 className="text-2xl font-header font-black text-neon-pink">{t.pages.aboutExt.howTitle}</h2>
          <div className="bg-neon-blue/10 border-2 border-neon-blue rounded-3xl p-8">
            <ol className="list-decimal list-inside space-y-4 text-lg font-medium">
              <li>{t.pages.aboutExt.stepA} <span className="text-neon-blue">Jugar</span>.</li>
              <li>{t.pages.aboutExt.step2}</li>
              <li>{t.pages.aboutExt.step3A}<span className="text-neon-cyan">{t.pages.aboutExt.step3B}</span>{t.pages.aboutExt.step3C}</li>
              <li>{t.pages.aboutExt.step4}</li>
            </ol>
          </div>
        </section>


        <section className="space-y-6">
          <h2 className="text-2xl font-header font-black text-neon-cyan">ANTICHEAT TRANSPARENTE</h2>
          <div className="bg-neon-cyan/5 border-2 border-neon-cyan/30 rounded-3xl p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 text-neon-cyan shrink-0">
                <Icon name="shield" size={40} />
              </div>
              <p className="text-gray-300 font-medium leading-relaxed">
                Ciszu Anti-Cheat analiza el resultado de tus partidas en el servidor para proteger los rankings. No instala controladores a nivel de kernel,
                no escanea archivos o procesos de tu dispositivo y no captura tu teclado fuera del juego.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Señales', desc: 'Puntuación, precisión, combo y dificultad contrastados con tu historial.' },
                { title: 'Umbral', desc: 'Permanece invisible hasta que la evidencia acumulada supera el límite.' },
                { title: 'Apelación', desc: 'Toda sanción automática puede revisarse desde Soporte.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <h3 className="text-xs font-header font-black text-neon-cyan uppercase italic">{item.title}</h3>
                  <p className="mt-2 text-[11px] text-gray-400 font-bold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/information#anticheat" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neon-cyan hover:text-white transition-colors">
              Cómo funciona el anticheat →
            </Link>
          </div>
        </section>

      </div>
      </div>
    </MainLayout>
  );
}
