import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';

export const metadata: Metadata = {
  title: 'CiszuBot | POLICY',
  description:
    'Políticas de privacidad, uso de datos, cookies, anuncios y propiedad intelectual de CiszuBot y Ciszu Network.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-purple',
  accentBg: 'bg-neon-purple/10',
  accentBorder: 'border-neon-purple/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-neon-purple via-neon-blue to-neon-purple',
};

const ARTICLES: LegalArticle[] = [
  {
    id: 1,
    title: 'PRIVACIDAD',
    content:
      'Ciszu Network respeta tu privacidad. No recopilamos información personal sin tu consentimiento explícito. Los datos proporcionados a través del bot, formularios de contacto, registro o uso de los servicios se utilizan únicamente para el fin para el que fueron dados y nunca se comparten con terceros sin autorización, salvo obligación legal o para la operación técnica de los servicios.',
  },
  {
    id: 2,
    title: 'USO DE DATOS',
    content:
      'La información recopilada se utiliza para: (1) mantener el bot en funcionamiento y mejorar sus comandos, (2) personalizar tu experiencia y la de tu servidor, (3) mostrar anuncios e integraciones relevantes, (4) comunicarnos contigo y (5) cumplir obligaciones legales. Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos. No vendemos datos personales a terceros.',
  },
  {
    id: 3,
    title: 'DATOS QUE ALMACENA EL BOT',
    content:
      'CiszuBot solo registra un contador de comandos ejecutados, el estado de conexión del servidor y la configuración que tú defines (canales, módulos activos, idioma y avisos). No lee, guarda ni procesa el contenido de los mensajes, archivos ni datos personales de los usuarios de Discord.',
  },
  {
    id: 4,
    title: 'ANUNCIOS Y PUBLICIDAD',
    content:
      'Ciszu Network muestra anuncios propios (promoción del ecosistema) y, en el futuro, de terceros, tanto en las webs como en las respuestas del bot. Todos los anuncios son opcionales y cerrables. Los datos de interacción con anuncios (impresiones, clics, cierres) se miden de forma agregada para mejorar la experiencia y la relevancia, y pueden incluir señales de audiencia (idioma, ubicación aproximada).',
  },
  {
    id: 5,
    title: 'BLOQUEADORES DE ANUNCIOS',
    content:
      'Para mantener CiszuBot y todas sus páginas funcionando dependemos de la publicidad (autopatrocinio del ecosistema, monetización y mantenimiento). Si detectamos un bloqueador de anuncios te lo haremos saber con un aviso claro y respetuoso, pidiéndote que lo desactives en nuestro sitio. Puedes elegir desactivarlo (con contador de recarga) o seguir usando la página sin anuncios; esta elección se guarda solo en tu navegador y se renueva cada 12 horas.',
  },
  {
    id: 6,
    title: 'DATOS PARA RECOMENDACIÓN DE ANUNCIOS',
    content:
      'Para recomendar mejores anuncios, Ciszu Network puede usar datos de navegación y de audiencia agregados (páginas visitadas, idioma del navegador, región aproximada) recogidos por Google Analytics 4. Estos datos se tratan de forma agregada y anónima; no se utilizan para identificar a una persona concreta fuera de lo necesario para el servicio. El usuario puede bloquear las cookies de análisis desde su navegador o desde las preferencias del sitio.',
  },
  {
    id: 7,
    title: 'GEOLOCALIZACIÓN',
    content:
      'Podemos estimar tu ubicación aproximada (región/país) a partir de tu dirección IP para: (1) ofrecer contenido y anuncios relevantes a tu región, (2) cumplir requisitos legales locales y (3) mejorar la seguridad (detección de accesos sospechosos). La geolocalización precisa (GPS) solo se utiliza si una funcionalidad la requiere explícitamente y con tu consentimiento; nunca se usa para anuncios.',
  },
  {
    id: 8,
    title: 'CUENTAS Y REGISTRO (CISZU ID)',
    content:
      'La creación de cuentas (CISZU ID) es opcional y sirve para sincronizar tu perfil, tus preferencias y el acceso al dashboard del bot entre los servicios del ecosistema. Al crear una cuenta aceptas esta política, eres responsable de mantener la confidencialidad de tus credenciales y de la actividad realizada con tu cuenta. Puedes eliminar tu cuenta contactándonos; los datos asociados se suprimirán salvo retención legal.',
  },
  {
    id: 9,
    title: 'COOKIES Y ANALÍTICA',
    content:
      'Nuestros sitios utilizan cookies esenciales para el funcionamiento básico y para recordar tus preferencias (tema, idioma). Además, usamos cookies de analítica (Google Analytics 4 y Cloudflare Web Analytics) para medir el tráfico y el rendimiento de los anuncios. Las cookies de terceros solo se activan con tu consentimiento; puedes gestionarlas o rechazarlas desde las preferencias del sitio o tu navegador.',
  },
  {
    id: 10,
    title: 'ENLACES EXTERNOS',
    content:
      'Las webs y respuestas de CiszuBot pueden contener enlaces a sitios externos como Discord, YouTube, GitHub, Top.gg y otros. No nos responsabilizamos por el contenido ni las políticas de privacidad de dichos sitios; al visitarlos aplican sus propios términos.',
  },
  {
    id: 11,
    title: 'PROPIEDAD INTELECTUAL',
    content:
      'Todo el contenido, logotipos, marcas y diseños mostrados en este sitio y en el bot son propiedad de Ciszu Network y Ciszuko Antony, salvo que se indique lo contrario. Queda prohibida su reproducción o uso sin autorización. Los términos de licencia del software se detallan en la página de Licencia.',
  },
  {
    id: 12,
    title: 'CONTACTO LEGAL',
    content:
      'Para asuntos legales o solicitudes formales (acceso, rectificación, supresión de datos) escríbenos a ciszunetwork@outlook.com. También puedes abrir una incidencia desde la página de Soporte o contactarnos en el servidor oficial de Discord de Ciszu Network.',
  },
];

export default function PolicyPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <LegalDocument
            icon="lock"
            title="POLÍTICA"
            subtitle="Privacidad, datos y transparencia"
            docLabel="Política Oficial de CiszuBot"
            articles={ARTICLES}
            signOff={{ title: 'Compromiso de Privacidad', subtitle: 'Actualizado 2026 — Ciszu Network' }}
            theme={THEME}
          />
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
