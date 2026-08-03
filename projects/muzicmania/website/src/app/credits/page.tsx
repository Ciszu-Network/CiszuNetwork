'use client';

import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { motion } from 'framer-motion';

const CreditSection = ({ title, credits }: { title: string, credits: { role: string, name: string, link?: string }[] }) => (
  <div className="space-y-8 mb-24">
    <h2 className="text-xl md:text-2xl font-black text-white/50 tracking-[0.4em] uppercase text-center mb-12">
      {title}
    </h2>
    <div className="flex flex-col items-center gap-10">
      {credits.map((item, i) => (
        <div key={i} className="text-center flex flex-col gap-2">
          <span className="text-[10px] md:text-xs font-bold text-neon-cyan tracking-[0.3em] uppercase">
            {item.role}
          </span>
          {item.link ? (
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-lg md:text-xl font-bold text-white hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all cursor-pointer inline-block"
            >
              {item.name}
            </a>
          ) : (
            <span className="text-lg md:text-xl font-bold text-white tracking-widest uppercase">
              {item.name}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default function CreditsPage() {
  const devCredits = [
    { role: 'Fundador & Director General', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Arquitecto de Software & Lead Developer', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Diseñador Principal de Interfaz (UI)', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Especialista en Experiencia de Usuario (UX)', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Composición Musical & Producción de Audio', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Ingeniero de Sonido & Masterización', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Desarrollador de Sistemas Core (Mania Engine)', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Administrador de Infraestructura Cloud', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Arquitecto de Base de Datos (Supabase)', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Dirección de Arte & Concepto Visual', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Director de Animación & Motion Graphics', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Copywriting & Narrative Designer', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Estratega de Producto & Roadmap', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'QA Lead & Beta Testing Manager', name: 'Ciszuko Antony (Francisco Garcia)' },
    { role: 'Soporte Técnico & Documentación IA', name: 'Ciszuko Antony (Francisco Garcia)' },
  ];

  const techCredits = [
    { role: 'Framework Principal', name: 'Next.js (Vercel)', link: 'https://nextjs.org' },
    { role: 'Librería de Componentes', name: 'React (Meta Platforms)', link: 'https://react.dev' },
    { role: 'Estilización y Diseño Visual', name: 'Tailwind CSS (Tailwind Labs)', link: 'https://tailwindcss.com' },
    { role: 'Infraestructura Backend y Base de Datos', name: 'Supabase (Supabase Inc.)', link: 'https://supabase.com' },
    { role: 'Motor de Animaciones', name: 'Framer Motion (Framer)', link: 'https://www.framer.com/motion/' },
    { role: 'Control de Estado Global', name: 'Zustand', link: 'https://zustand-demo.pmnd.rs/' },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        {/* TITULO VISUAL ESTILO CINE */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="text-center mb-32"
        >
          <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue to-white bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
            CRÉDITOS Y <span className="text-white [-webkit-text-stroke:0px]">CONTRIBUCIONES</span>
          </h1>
          <p className="mt-6 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-[0.5em]">
            Desarrollo del Ecosistema MuzicMania
          </p>
        </motion.div>

        {/* LISTADO DE CRÉDITOS ANIMADO COMO ROLL CINE (SUAVE) */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 2, delay: 0.5 }}
           className="w-full"
        >
           <CreditSection title="Desarrollo Principal" credits={devCredits} />
           
           <CreditSection title="Motores y Tecnologías Base" credits={techCredits} />

           <div className="space-y-8 mt-40">
             <div className="flex flex-col items-center gap-6">
                <span className="text-[10px] md:text-xs font-bold text-white/40 tracking-[0.3em] uppercase max-w-lg text-center leading-loose">
                  Este es un proyecto dedicado a la fusión del ritmo interactivo y arte visual retrofuturista. Desarrollado y forjado línea por línea desde cero.
                </span>
                <span className="text-xl md:text-3xl font-black text-white italic tracking-tighter uppercase mt-12">
                  &quot;Keep the Rhythm Alive&quot;
                </span>
             </div>
           </div>

        </motion.div>

        <QuickDocks />

      </div>
    </MainLayout>
  );
}

