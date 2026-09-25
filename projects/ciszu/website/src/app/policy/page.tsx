import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { CISZU_NETWORK } from '@/config/site';

export const metadata: Metadata = {
  title: 'Ciszu Network | POLICY',
  description: 'Políticas de privacidad, uso de datos, cookies, anuncios y propiedad intelectual de Ciszu Network.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-purple',
  accentBg: 'bg-neon-purple/10',
  accentBorder: 'border-neon-purple/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-neon-purple via-brand-light to-neon-purple',
};

const ARTICLES: LegalArticle[] = [
  {
    id: 1,
    title: 'PRIVACIDAD',
    content:
      'Ciszu Network respeta tu privacidad. No recopilamos información personal sin tu consentimiento explícito. Los datos proporcionados a través de formularios de contacto, registro o uso de los servicios se utilizan únicamente para el fin para el que fueron dados y nunca se comparten con terceros sin autorización, salvo obligación legal o para la operación técnica de los servicios (proveedores de hosting, análisis y anuncios descritos en esta política).',
  },
  {
    id: 2,
    title: 'USO DE DATOS',
    content:
      'La información recopilada se utiliza para: (1) mejorar nuestros servicios y su rendimiento, (2) personalizar tu experiencia, (3) recomendar contenido y anuncios relevantes, (4) comunicarnos contigo y (5) cumplir obligaciones legales. Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos. No vendemos datos personales a terceros.',
  },
  {
    id: 3,
    title: 'ANUNCIOS Y PUBLICIDAD',
    content:
      'Ciszu Network muestra anuncios propios (promoción del ecosistema) y, en el futuro, de terceros. Todos los anuncios son opcionales y cerrables. Los datos de interacción con anuncios (impresiones, clics, cierres) se miden de forma agregada para mejorar la experiencia y la relevancia, y pueden incluir señales de audiencia (idioma, ubicación aproximada). Nunca vinculamos anuncios a datos sensibles.',
  },
  {
    id: 4,
    title: 'BLOQUEADORES DE ANUNCIOS',
    content:
      'Para mantener Ciszu Network y todas sus páginas funcionando dependemos de la publicidad (autopatrocinio del ecosistema, monetización y mantenimiento). Si detectamos un bloqueador de anuncios te lo haremos saber con un aviso claro y respetuoso, pidiéndote que lo desactives en nuestro sitio. Puedes elegir desactivarlo (con contador de recarga) o seguir usando la página sin anuncios; esta elección se guarda solo en tu navegador y se renueva cada 12 horas.',
  },
  {
    id: 5,
    title: 'DATOS PARA RECOMENDACIÓN DE ANUNCIOS',
    content:
      'Para recomendar mejores anuncios, Ciszu Network puede usar datos de navegación y de audiencia agregados (páginas visitadas, idioma del navegador, región aproximada) recogidos por Google Analytics 4. Estos datos se tratan de forma agregada y anónima; no se utilizan para identificar a una persona concreta fuera de lo necesario para el servicio. El usuario puede bloquear las cookies de análisis desde su navegador o desde las preferencias del sitio.',
  },
  {
    id: 6,
    title: 'GEOLOCALIZACIÓN',
    content:
      'Podemos estimar tu ubicación aproximada (región/país) a partir de tu dirección IP para: (1) ofrecer contenido y anuncios relevantes a tu región, (2) cumplir requisitos legales locales y (3) mejorar la seguridad (detección de accesos sospechosos). La geolocalización precisa (GPS) solo se utiliza si una funcionalidad la requiere explícitamente y con tu consentimiento; nunca se usa para anuncios.',
  },
  {
    id: 7,
    title: 'CUENTAS Y REGISTRO (CISZU ID)',
    content:
      'La creación de cuentas (CISZU ID) es opcional y sirve para sincronizar tu progreso, perfil y preferencias entre los servicios del ecosistema. Al crear una cuenta aceptas esta política, eres responsable de mantener la confidencialidad de tus credenciales y de la actividad realizada con tu cuenta. Puedes eliminar tu cuenta contactándonos; los datos asociados se suprimirán salvo retención legal.',
  },
  {
    id: 8,
    title: 'COOKIES Y ANALÍTICA',
    content:
      'Nuestros sitios utilizan cookies esenciales para el funcionamiento básico y para recordar tus preferencias (tema, idioma). Además, usamos cookies de analítica (Google Analytics 4 y Cloudflare Web Analytics) para medir el tráfico y el rendimiento de los anuncios. Las cookies de terceros solo se activan con tu consentimiento; puedes gestionarlas o rechazarlas desde las preferencias del sitio o tu navegador.',
  },
  {
    id: 9,
    title: 'ENLACES EXTERNOS',
    content:
      'Este sitio contiene enlaces a sitios externos como YouTube, Discord, GitHub y otros. No nos responsabilizamos por el contenido ni las políticas de privacidad de dichos sitios; al visitarlos aplican sus propios términos.',
  },
  {
    id: 10,
    title: 'PROPIEDAD INTELECTUAL',
    content:
      'Todo el contenido, logos, marcas y diseños mostrados en este sitio son propiedad de Ciszu Network y Ciszuko Antony, salvo que se indique lo contrario. Queda prohibida su reproducción o uso sin autorización. Los términos de licencia del software se detallan en la página de Licencia.',
  },
  {
    id: 11,
    title: 'RESEÑAS Y CALIFICACIONES',
    content:
      "Las calificaciones públicas de Ciszu Network incorporan una reseña base fantasma de 5.0 para reflejar un estándar de calidad objetivo. Cuando no existen reseñas reales de usuarios se muestra 5.0 y se indica expresamente que no hay reseñas para analizar. Cuando existen reseñas reales, la calificación pública es la media aritmética entre las reseñas de usuarios y la reseña base 5.0. No se falsifican reseñas: todas las reseñas visibles son reales.",
  },
  {
    id: 12,
    title: 'CONTACTO LEGAL',
    content: `Para asuntos legales o solicitudes formales (acceso, rectificación, supresión de datos) escríbenos a: ${CISZU_NETWORK.email}`,
  },
];

export default function PolicyPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-4xl">
        <LegalDocument
          icon="lock"
          title="POLÍTICA"
          subtitle="Privacidad, datos y transparencia"
          docLabel={`Política Oficial de ${CISZU_NETWORK.name}`}
          articles={ARTICLES}
          signOff={{ title: 'Compromiso de Privacidad', subtitle: 'Actualizado 2026 — Ciszu Network' }}
          theme={THEME}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
