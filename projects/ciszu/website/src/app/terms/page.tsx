import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { CISZU_NETWORK } from '@/config/site';
import { cookies } from 'next/headers';
import { getDict, parseLang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Ciszu Network | TERMS',
  description: 'Términos y condiciones de uso de los servicios de Ciszu Network y sus webs.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-cyan',
  accentBg: 'bg-neon-cyan/10',
  accentBorder: 'border-neon-cyan/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-neon-cyan via-brand-light to-neon-purple',
};

const ARTICLES: LegalArticle[] = [
  {
    id: 1,
    title: 'ACEPTACIÓN DE LOS TÉRMINOS',
    content:
      'Al acceder o usar cualquiera de los servicios de Ciszu Network (webs, bot de Discord, juegos, aplicaciones y contenido) aceptas estos Términos y Condiciones y la Política de Privacidad. Si no estás de acuerdo, no uses los servicios.',
  },
  {
    id: 2,
    title: 'USO DE LOS SERVICIOS',
    content:
      'Los servicios se ofrecen "tal cual" y "según disponibilidad". Te comprometes a usarlos de forma legal, sin dañar, sobrecargar o intentar acceder sin autorización a sistemas, redes o cuentas del ecosistema. Queda prohibido el uso automatizado (bots, scraping) salvo autorización expresa.',
  },
  {
    id: 3,
    title: 'CUENTAS (CISZU ID)',
    content:
      'El registro es opcional y requiere verificación por código temporal. Eres responsable de la confidencialidad de tus credenciales y de toda actividad realizada con tu cuenta. Ciszu Network puede suspender o eliminar cuentas que violen estos términos o las políticas de seguridad, sin perjuicio de los derechos del usuario de solicitar la recuperación conforme a la política de cuentas.',
  },
  {
    id: 4,
    title: 'CONTENIDO Y PROPIEDAD INTELECTUAL',
    content:
      'Todo el contenido, logos, marcas, diseño y código de Ciszu Network es propiedad de Ciszu Network y Ciszuko Antony, salvo indicación contraria. No está permitida su reproducción, distribución o uso comercial sin autorización previa.',
  },
  {
    id: 5,
    title: 'EMPRESAS Y PRODUCTOS DE TERCEROS',
    content:
      'Algunos servicios integran productos de terceros (Google, Supabase, Vercel, Discord, YouTube, etc.). El uso de esos productos se rige por sus propios términos y políticas; Ciszu Network no es responsable de ellos.',
  },
  {
    id: 6,
    title: 'COMUNICACIONES ELECTRÓNICAS',
    content:
      'Al crear una cuenta o suscribirte, puedes recibir emails transaccionales (verificación, recuperación, avisos de seguridad) del ecosistema Ciszu Network. Estos emails no son publicidad. Los emails promocionales solo se envían con consentimiento explícito y siempre incluyen opción de baja.',
  },
  {
    id: 7,
    title: 'LIMITACIÓN DE RESPONSABILIDAD',
    content:
      'Ciszu Network no será responsable de daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de los servicios, incluida la pérdida de datos o interrupciones del servicio. La responsabilidad máxima se limita al importe pagado, en su caso, por el usuario en los últimos 12 meses.',
  },
  {
    id: 8,
    title: 'MODIFICACIONES',
    content:
      'Ciszu Network puede actualizar estos términos en cualquier momento. Los cambios se publicarán en esta página y, si son sustanciales, se notificarán por los canales del ecosistema. El uso continuado tras los cambios implica su aceptación.',
  },
  {
    id: 9,
    title: 'LEY APLICABLE Y JURISDICCIÓN',
    content:
      'Estos términos se rigen por la legislación de la República Bolivariana de Venezuela. Para cualquier controversia, las partes se someten a los tribunales competentes de Caracas, Venezuela, salvo que la ley disponga otra cosa.',
  },
  {
    id: 10,
    title: 'CONTACTO',
    content: `Para preguntas sobre estos términos escríbenos a: ${CISZU_NETWORK.email}`,
  },
];

export default async function TermsPage() {
  const t = getDict(parseLang((await cookies()).get('ciszu_lang')?.value));
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-4xl">
        <LegalDocument
          icon="file-text"
          title={t.legalPages.termsTitle}
          subtitle="Condiciones de uso de los servicios"
          docLabel={`Términos y Condiciones de ${CISZU_NETWORK.name}`}
          articles={ARTICLES}
          signOff={{ title: 'Compromiso de Transparencia', subtitle: 'Actualizado 2026 — Ciszu Network' }}
          officialLink={{ label: 'Ver versión oficial', href: 'https://ciszunetwork.vercel.app/terms' }}
          theme={THEME}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}