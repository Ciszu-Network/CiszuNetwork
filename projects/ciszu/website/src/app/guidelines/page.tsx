import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszu Network | GUIDELINES',
  description:
    'Lineamientos de uso, navegación, identidad visual y estándares técnicos del ecosistema Ciszu Network.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light via-brand-accent to-brand-light',
};

const ARTICLES: LegalArticle[] = [
  {
    id: 1,
    title: 'OBJETO DEL PRESENTE DOCUMENTO',
    content:
      'Estos lineamientos definen los estándares de uso, navegación y presentación del ecosistema Ciszu Network. Aplican a visitantes, colaboradores y proyectos integrados, y buscan garantizar una experiencia coherente, segura y de alto rendimiento en todas las propiedades digitales de la marca.',
  },
  {
    id: 2,
    title: 'ESTÁNDARES DE NAVEGACIÓN',
    content:
      'Para una experiencia óptima se recomienda mantener actualizado el navegador (Chrome, Edge, Firefox o Safari en sus últimas versiones), habilitar JavaScript y permitir las conexiones necesarias hacia nuestros servicios (Supabase, Vercel y CDN). El ecosistema está diseñado como aplicación web progresiva (PDWA) e instalable en escritorio.',
  },
  {
    id: 3,
    title: 'RENDIMIENTO Y CONECTIVIDAD',
    content:
      'Las webs priorizan la carga por rutas y el cacheado agresivo de assets. Una conexión estable de al menos 5 Mbps garantiza animaciones fluidas y carga de medios. Los contenidos pesados (vídeo, audio, documentos) se sirven bajo demanda para no penalizar la navegación general.',
  },
  {
    id: 4,
    title: 'ACCESIBILIDAD Y USO RESPONSABLE',
    content:
      'Se recomienda un zoom de interfaz entre 80% y 125%, contraste suficiente y navegación por teclado en formularios críticos. El uso de herramientas automatizadas (scrapers, bots de terceros) debe respetar los límites de peticiones y no degradar el servicio para el resto de usuarios.',
  },
  {
    id: 5,
    title: 'IDENTIDAD VISUAL Y NEÓN',
    content:
      'Toda integración visual debe adherirse a la paleta oficial de Ciszu Network: azules corporativos (brand) sobre fondos oscuros, con acentos neón cian/rosa y tipografía Geomanist. No se permite alterar proporciones del logotipo, recolorear la marca sin autorización ni combinarla con elementos que sugieran afiliación inexistente.',
  },
  {
    id: 6,
    title: 'ICONOGRAFÍA Y VECTORES',
    content:
      'El sistema de interfaz utiliza exclusivamente iconos vectoriales del registro oficial (@ciszu/ui) y logos SVG oficiales servidos desde el CDN de Ciszu Network. Se prohíbe el uso de emojis como sustitutos de iconos de marca en interfaces de producto y la mezcla de sets iconográficos inconsistentes.',
  },
  {
    id: 7,
    title: 'TIPOGRAFÍA OFICIAL',
    content:
      "Se establece 'Geomanist' (o su alternativa IBM Plex Sans según la propiedad) como fuente principal de titulares, y una sans legible para cuerpo de texto. Los pesos y espaciados deben respetar las escalas del sistema de diseño compartido.",
  },
  {
    id: 8,
    title: 'SEMÁNTICA DE CÓDIGO Y COMPONENTES',
    content:
      'Toda estructura de la plataforma sigue un enfoque de componentes compartidos y tipado estricto con TypeScript. Las implementaciones nuevas deben reutilizar los bloques de @ciszu/ui (InfoBlocks, LegalDocument, UI primitives) antes de crear variantes locales.',
  },
  {
    id: 9,
    title: 'PROPIEDAD INTELECTUAL DE TERCEROS',
    content:
      'Ciszu Network respeta las licencias de las tecnologías que utiliza (MIT/Apache) y de los contenidos multimedia de sus proyectos. Cualquier asset de terceros incorporado debe contar con licencia compatible y su atribución correspondiente en la página de créditos.',
  },
  {
    id: 10,
    title: 'SEGURIDAD Y CONDUCTA DIGITAL',
    content:
      'Se prohíbe cualquier intento de ingeniería inversa maliciosa, inyección de código, denegación de servicio o extracción masiva de datos contra la infraestructura. Los reportes de vulnerabilidades deben canalizarse de forma responsable vía soporte antes de su divulgación pública.',
  },
  {
    id: 11,
    title: 'INTEGRACIÓN DE NUEVOS PROYECTOS',
    content:
      'Un proyecto se considera parte del ecosistema cuando: usa la identidad visual oficial, se despliega desde el repositorio compartido, respeta los sistemas de auth/datos (RLS obligatorio) y se indexa en el catálogo de proyectos de la web principal.',
  },
  {
    id: 12,
    title: 'VIGENCIA Y ACTUALIZACIONES',
    content:
      'Estos lineamientos pueden actualizarse conforme evoluciona el ecosistema. La versión vigente es siempre la publicada en esta página y su fecha de actualización se refleja en el changelog del ecosistema.',
  },
];

export default function GuidelinesPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-4xl">
        <LegalDocument
          icon="policies"
          title="LINEAMIENTOS"
          subtitle="Uso, identidad y estándares del ecosistema"
          docLabel="Guía Oficial de Ciszu Network"
          articles={ARTICLES}
          signOff={{ title: 'Estándares de la Red Ciszu', subtitle: 'Actualizado 2026 — Ciszu Network' }}
          version={{ label: 'v2026.1 · Guía Oficial de Estándares del Ecosistema', date: '2026', status: 'Vigente' }}
          theme={THEME}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
