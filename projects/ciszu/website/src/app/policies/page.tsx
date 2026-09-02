import { FileText } from "lucide-react";
import { CISZU_NETWORK } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | POLICIES',
  description: 'Políticas de privacidad, uso de datos, cookies y propiedad intelectual de Ciszu Network.',
};

const sections = [
  {
    title: "Privacidad",
    content: "Ciszu Network respeta tu privacidad. No recopilamos información personal sin tu consentimiento explícito. Los datos proporcionados a través de formularios de contacto, registro o uso de los servicios se utilizan únicamente para el fin para el que fueron dados y nunca se comparten con terceros sin autorización, salvo obligación legal o para la operación técnica de los servicios (proveedores de hosting, análisis y anuncios descritos en estas políticas).",
  },
  {
    title: "Uso de Datos",
    content: "La información recopilada se utiliza para: (1) mejorar nuestros servicios y su rendimiento, (2) personalizar tu experiencia, (3) recomendar contenido y anuncios relevantes, (4) comunicarnos contigo, y (5) cumplir obligaciones legales. Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos. No vendemos datos personales a terceros.",
  },
  {
    id: "anuncios",
    title: "Anuncios y Publicidad",
    content: "Ciszu Network muestra anuncios propios (promoción del ecosistema) y, en el futuro, de terceros. Todos los anuncios son opcionales y cerrables. Los datos de interacción con anuncios (impresiones, clics, cierres) se miden de forma agregada para mejorar la experiencia y la relevancia, y pueden incluir señales de audiencia (idioma, ubicación aproximada). Nunca vinculamos anuncios a datos sensibles.",
  },
  {
    id: "adblockers",
    title: "Bloqueadores de Anuncios",
    content: "Para mantener Ciszu Network y todas sus páginas funcionando, dependemos de la publicidad (autopatrocinio del ecosistema, monetización y mantenimiento). Si detectamos un bloqueador de anuncios, te lo haremos saber con un aviso claro y respetuoso, pidiéndote por favor que lo desactives en nuestro sitio. Puedes elegir desactivar el bloqueador (con contador de recarga) o seguir usando la página sin anuncios; esta elección se guarda solo en tu navegador y se renueva cada 24 horas. Si usas un bloqueador, los anuncios pueden no mostrarse o dar error, y no nos hacemos cargo de mal funcionamiento relacionado con el bloqueo.",
  },
  {
    title: "Datos para Recomendación de Anuncios",
    content: "Para recomendar mejores anuncios, Ciszu Network puede usar datos de navegación y de audiencia agregados (páginas visitadas, idioma del navegador, región aproximada) recogidos por Google Analytics 4. Estos datos se tratan de forma agregada y anónima; no se utilizan para identificar a una persona concreta fuera de lo necesario para el servicio. El usuario puede bloquear las cookies de análisis desde su navegador o desde las preferencias del sitio.",
  },
  {
    title: "Geolocalización",
    content: "Podemos estimar tu ubicación aproximada (región/país) a partir de tu dirección IP para: (1) ofrecer contenido y anuncios relevantes a tu región, (2) cumplir requisitos legales locales y (3) mejorar la seguridad (detección de accesos sospechosos). La geolocalización precisa (GPS) solo se utiliza si una funcionalidad la requiere explícitamente y con tu consentimiento; nunca se usa para anuncios.",
  },
  {
    title: "Cuentas y Registro",
    content: "La creación de cuentas (CISZU ID) es opcional y sirve para sincronizar tu progreso, perfil y preferencias entre los servicios del ecosistema. Al crear una cuenta aceptas estas políticas, eres responsable de mantener la confidencialidad de tus credenciales y de la actividad realizada con tu cuenta. Puedes eliminar tu cuenta contactándonos; los datos asociados se suprimirán salvo retención legal.",
  },
  {
    title: "Cookies y Analítica",
    content: "Nuestros sitios utilizan cookies esenciales para el funcionamiento básico y para recordar tus preferencias (tema, idioma). Además, usamos cookies de analítica (Google Analytics 4 y Cloudflare Web Analytics) para medir el tráfico y el rendimiento de los anuncios. Las cookies de terceros solo se activan con tu consentimiento; puedes gestionarlas o rechazarlas desde las preferencias del sitio o tu navegador.",
  },
  {
    title: "Enlaces Externos",
    content: "Este sitio contiene enlaces a sitios externos como YouTube, Discord, GitHub y otros. No nos responsabilizamos por el contenido ni las políticas de privacidad de dichos sitios; al visitarlos aplican sus propios términos.",
  },
  {
    title: "Propiedad Intelectual",
    content: "Todo el contenido, logos, marcas y diseños mostrados en este sitio son propiedad de Ciszu Network y Ciszuko Antony, salvo que se indique lo contrario. Queda prohibida su reproducción o uso sin autorización.",
  },
  {
    title: "Contacto Legal",
    content: `Para asuntos legales o solicitudes formales (acceso, rectificación, supresión de datos), escríbenos a: ${CISZU_NETWORK.email}`,
  },
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
            <div key={i} id={s.id} className="p-6 rounded-2xl bg-brand/5 border border-brand/20">
              <h2 className="text-lg font-header font-bold text-white mb-3">{s.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
