import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszuko Antony | GUIDELINES',
  description:
    'Lineamientos de uso, contenido multimedia, identidad visual y estándares del portfolio de Ciszuko Antony.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const ARTICLES: LegalArticle[] = [
  {
    id: 1,
    title: 'OBJETO DEL PRESENTE DOCUMENTO',
    content:
      'Estos lineamientos definen cómo debe usarse y citarse el portfolio de Ciszuko Antony: sus páginas, su contenido multimedia, sus certificados y su identidad visual. Aplican a visitantes, colaboradores, medios y proyectos que referencien este sitio, y buscan garantizar un uso coherente, respetuoso y veraz de la obra del autor.',
  },
  {
    id: 2,
    title: 'NAVEGACIÓN Y COMPATIBILIDAD',
    content:
      'Para una experiencia óptima se recomienda mantener actualizado el navegador (Chrome, Edge, Firefox o Safari en sus últimas versiones), habilitar JavaScript y permitir las conexiones necesarias hacia los servicios del sitio (Supabase, Vercel y CDN). El portfolio funciona además como aplicación web progresiva (PDWA) instalable en escritorio.',
  },
  {
    id: 3,
    title: 'USO DEL CONTENIDO MULTIMEDIA',
    content:
      'Las fotografías, ilustraciones, vídeos, música, animaciones y piezas gráficas publicadas en este portfolio son obra de Ciszuko Antony y están protegidas por derechos de autor. Se prohíbe su venta, redistribución, remezcla o uso comercial sin autorización previa y por escrito, así como su publicación sin crédito al autor.',
  },
  {
    id: 4,
    title: 'CITAS Y ATRIBUCIÓN',
    content:
      'Se permite citar fragmentos de texto, capturas o piezas del portfolio con fines informativos, educativos o periodísticos, siempre que se atribuya de forma visible a "Ciszuko Antony" y se incluya un enlace a este sitio. Las citas no pueden alterar el sentido del contenido original ni sugerir patrocinio o afiliación inexistente.',
  },
  {
    id: 5,
    title: 'CERTIFICADOS COMO REFERENCIA',
    content:
      'Los certificados y logros mostrados en la página de Certificates se publican como referencia verificable de la formación del autor. No se permite alterarlos, falsificarlos, reclamarlos como propios ni presentarlos como acreditaciones oficiales de terceros; la verificación final corresponde siempre a la entidad emisora.',
  },
  {
    id: 6,
    title: 'IDENTIDAD VISUAL Y LOGOTIPO',
    content:
      'El logotipo, isotipo y símbolos de Ciszuko Antony son de uso exclusivo de su autor. No se permite deformarlos, recolorearlos ni combinarlos con marcas de terceros, ni usarlos de forma que sugiera afiliación, patrocinio o representación oficial sin consentimiento expreso.',
  },
  {
    id: 7,
    title: 'PALETA Y ESTILO VISUAL',
    content:
      'La identidad del portfolio combina azules corporativos (brand) sobre fondos oscuros con acentos neón azul, rosa, cian y morado. Toda integración visual que referencie al proyecto debe respetar esta paleta y no introducir variantes que distorsionen la imagen de la marca.',
  },
  {
    id: 8,
    title: 'TIPOGRAFÍA OFICIAL',
    content:
      'El sitio utiliza Exo 2 como tipografía base y Rajdhani para titulares, servidas como fuentes web mediante next/font. Las piezas derivadas, capturas o material promocional que reproduzcan la interfaz deben conservar estas tipografías y sus jerarquías originales.',
  },
  {
    id: 9,
    title: 'SEMÁNTICA DE CÓDIGO Y COMPONENTES',
    content:
      'El portfolio sigue un enfoque de componentes compartidos y tipado estricto con TypeScript sobre Next.js (App Router). Las implementaciones nuevas deben reutilizar los bloques de @ciszu/ui (InfoBlocks, LegalDocument, CreditsRoll, UI primitives) antes de crear variantes locales, y mantener las páginas institucionales como Server Components.',
  },
  {
    id: 10,
    title: 'PRIVACIDAD Y DATOS',
    content:
      'El tratamiento de datos personales, cookies, analítica y anuncios se rige por la Política de Privacidad del sitio. Estos lineamientos no sustituyen esa política: cualquier duda sobre datos de navegación debe consultarse en la página de Política.',
  },
  {
    id: 11,
    title: 'INTEGRACIÓN Y COLABORACIÓN',
    content:
      'Un proyecto, medio o creador que quiera integrar contenido de este portfolio en su plataforma debe solicitar autorización por los canales oficiales de contacto, indicar el uso previsto y respetar la licencia vigente. Las colaboraciones aprobadas se acreditan siempre en la página de Créditos.',
  },
  {
    id: 12,
    title: 'VIGENCIA Y ACTUALIZACIONES',
    content:
      'Estos lineamientos pueden actualizarse conforme evoluciona el portfolio. La versión vigente es siempre la publicada en esta página, y su fecha de actualización se refleja en el cierre del documento y en el registro de cambios del ecosistema.',
  },
];

export default function GuidelinesPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <LegalDocument
          icon="policies"
          title="LINEAMIENTOS"
          subtitle="Uso, contenido y estándares del portfolio"
          docLabel="Guía Oficial de Ciszuko Antony"
          articles={ARTICLES}
          signOff={{ title: 'Estándares del Portfolio', subtitle: 'Actualizado 2026 — Ciszuko Antony' }}
          theme={THEME}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
