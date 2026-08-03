import { FileText } from "lucide-react";
import { CISZU_NETWORK } from "@/config/site";

const sections = [
  { title: "Privacidad", content: "Ciszu Network respeta tu privacidad. No recopilamos información personal sin tu consentimiento explícito. Los datos proporcionados a través de formularios de contacto se utilizan únicamente para responder a tus consultas y nunca se comparten con terceros sin autorización." },
  { title: "Uso de Datos", content: "La información recopilada se utiliza para mejorar nuestros servicios, personalizar tu experiencia y comunicarnos contigo. Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos." },
  { title: "Cookies", content: "Nuestro sitio utiliza cookies esenciales para el funcionamiento básico. No utilizamos cookies de rastreo de terceros sin tu consentimiento explícito." },
  { title: "Enlaces Externos", content: "Este sitio contiene enlaces a sitios externos como YouTube, Discord, GitHub y otros. No nos responsabilizamos por el contenido o las políticas de privacidad de dichos sitios." },
  { title: "Propiedad Intelectual", content: "Todo el contenido, logos, marcas y diseños mostrados en este sitio son propiedad de Ciszu Network y Ciszuko Antony, salvo que se indique lo contrario." },
  { title: "Contacto Legal", content: `Para asuntos legales o solicitudes formales, escríbenos a: ${CISZU_NETWORK.email}` },
];

export default function PoliciesPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Políticas
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Términos y condiciones de {CISZU_NETWORK.name}
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl bg-brand/5 border border-brand/20">
              <h2 className="text-lg font-header font-bold text-white mb-3">{s.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
