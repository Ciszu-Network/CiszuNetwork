import { HelpCircle, ChevronDown } from "lucide-react";

const faqs = [
  { q: "¿Qué es Ciszu Network?", a: "Ciszu Network es una compañía de innovación digital fundada por Ciszuko Antony. Desarrollamos soluciones web, infraestructura cloud, bots, servidores de juego y experiencias digitales." },
  { q: "¿Qué servicios ofrecen?", a: "Ofrecemos desarrollo web (Next.js, React, TypeScript), infraestructura cloud (Vercel, AWS), diseño UI/UX, bots para Discord/WhatsApp/Telegram, servidores de Minecraft, y consultoría tecnológica." },
  { q: "¿Cómo puedo contactarlos?", a: "Puedes contactarnos a través de nuestro formulario en la página de Contacto, por correo a ciszunetowork@gmail.com, o directamente por WhatsApp al +58 412 6858111." },
  { q: "¿MuzicMania es parte de Ciszu Network?", a: "Sí, MuzicMania es un proyecto de juego de ritmo desarrollado por Ciszu Network. Puedes probarlo en muzicmania.vercel.app." },
  { q: "¿Tienen servidores de Minecraft?", a: "Sí, desarrollamos texture packs, mods y administramos servidores Minecraft con identidad Ciszu. Consulta nuestra sección de proyectos para más información." },
  { q: "¿Ofrecen bots para Discord?", a: "Sí, creamos bots personalizados para Discord con diversas funcionalidades. También administramos servidores comunitarios." },
  { q: "¿Dónde están ubicados?", a: "Nuestra sede está en Coro, Falcón, Venezuela. Operamos en horario GMT-4 con disponibilidad 24/7." },
  { q: "¿Cuál es el horario de atención?", a: "Estamos disponibles 24/7, todos los días del año. Puedes contactarnos en cualquier momento." },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            FAQ
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Preguntas frecuentes sobre Ciszu Network
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <details key={i} className="group p-5 rounded-2xl bg-brand/5 border border-brand/20 open:border-brand-light/30 transition-all">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                <span className="text-white font-bold text-sm font-header">{item.q}</span>
                <ChevronDown className="w-4 h-4 text-brand-light shrink-0 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
