import { BookOpen } from "lucide-react";
import { CISZU_NETWORK } from "@/config/site";

const guidelines = [
  { title: "Comunidad", content: "Mantén un trato respetuoso en todos nuestros espacios. No toleramos discriminación, acoso o spam. La comunidad Ciszu Network es un lugar para compartir, aprender y crear." },
  { title: "Contribuciones", content: "Las contribuciones a proyectos open-source de Ciszu Network son bienvenidas. Sigue los lineamientos de cada repositorio en GitHub y respeta los códigos de conducta establecidos." },
  { title: "Uso de Marca", content: "El nombre y logotipo de Ciszu Network no pueden ser utilizados sin autorización previa. Para uso comercial o promocional, contáctanos." },
  { title: "Reportes", content: "Si encuentras contenido inapropiado, bugs o problemas de seguridad en nuestros proyectos, repórtalo a través de nuestros canales oficiales o directamente en GitHub." },
  { title: "Recomendaciones Técnicas", content: "Para una mejor experiencia en nuestro sitio, recomendamos usar navegadores actualizados (Chrome, Firefox, Edge) con JavaScript habilitado y zoom entre 100-120%." },
];

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Guías
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Lineamientos de {CISZU_NETWORK.name}
          </p>
        </div>

        <div className="space-y-6">
          {guidelines.map((g, i) => (
            <div key={i} className="p-6 rounded-2xl bg-brand/5 border border-brand/20">
              <h2 className="text-lg font-header font-bold text-white mb-3">{g.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{g.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
