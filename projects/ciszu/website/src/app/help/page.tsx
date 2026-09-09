import { HelpCircle } from "lucide-react";
import QuickDocks from "@/components/molecules/QuickDocks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | HELP',
  description: 'Centro de ayuda de Ciszu Network: FAQ, soporte y recursos.',
};

const faqs = [
  { q: "¿Cómo contacto con soporte?", a: "Puedes contactarnos por email en ciszunetwork@outlook.com o a través de nuestro servidor de Discord." },
  { q: "¿Dónde está la documentación?", a: "La documentación técnica está disponible en la sección de Documentation de esta web." },
  { q: "¿Cómo reporto un bug?", a: "Usa el formulario de Feedback o abre un issue en GitHub." },
  { q: "¿Ofrecen soporte 24/7?", a: "Sí, operamos 24/7 con respuesta prioritaria para clientes y comunidad." },
  { q: "¿Puedo colaborar en los proyectos?", a: "Claro, revisa nuestros repositorios en GitHub para ver cómo contribuir." },
  { q: "¿Cómo donar al proyecto?", a: "Puedes donar a través de Patreon, Ko-fi o criptomonedas en la sección de Donate." },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Help
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Centro de ayuda / Help Center
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <details key={i} className="group p-5 rounded-2xl bg-brand/5 border border-brand/20 open:border-brand-light/30 transition-all">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                <span className="text-white font-bold text-sm font-header">{item.q}</span>
                <span className="text-brand-light text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
