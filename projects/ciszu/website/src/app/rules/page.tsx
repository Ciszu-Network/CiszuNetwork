import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszu Network | RULES',
  description:
    'Reglas de convivencia, fair play y uso aceptable de los servicios y comunidades de Ciszu Network.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-pink',
  accentBg: 'bg-neon-pink/10',
  accentBorder: 'border-neon-pink/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-neon-pink via-white to-neon-pink',
};

const ARTICLES: LegalArticle[] = [
  {
    id: 1,
    title: 'CONDUCTA Y RESPETO MUTUO',
    content:
      'Se prohíbe terminantemente cualquier forma de acoso, discurso de odio o toxicidad dentro del ecosistema de Ciszu Network. El respeto hacia otros usuarios, clientes y miembros del Staff es la base fundamental de nuestra comunidad.',
  },
  {
    id: 2,
    title: 'INTEGRIDAD DE LOS SERVICIOS',
    content:
      'Ciszu Network mantiene tolerancia cero ante el uso de bots maliciosos, scripts de automatización abusiva, scraping masivo o cualquier software que degrade el rendimiento de las plataformas. El incumplimiento conlleva el bloqueo inmediato y permanente.',
  },
  {
    id: 3,
    title: 'IDENTIDAD DE USUARIO Y PERFILES',
    content:
      'Los nombres de usuario no deben contener lenguaje ofensivo, discriminatorio o contenido sensible. Ciszu Network se reserva el derecho de modificar nombres inapropiados o suspender cuentas infractoras.',
  },
  {
    id: 4,
    title: 'SUPLANTACIÓN DE IDENTIDAD',
    content:
      'Queda prohibido fingir ser otro usuario, colaborador o miembro oficial del equipo de Ciszu Network. La suplantación de identidad es considerada una falta grave contra la confianza de la comunidad y la marca.',
  },
  {
    id: 5,
    title: 'REPORTE RESPONSABLE DE FALLOS',
    content:
      'Los usuarios tienen el deber ético de informar cualquier bug crítico o vulnerabilidad técnica mediante los canales oficiales (Soporte o Discord). Reportar fallos de forma responsable contribuye a la estabilidad del ecosistema; explotarlos está prohibido.',
  },
  {
    id: 6,
    title: 'PROHIBICIÓN DE EXPLOITS Y ABUSO',
    content:
      'El uso deliberado de errores de programación para obtener ventajas, manipular métricas o acceder a datos ajenos está estrictamente prohibido y será sancionado según la gravedad del acto, incluyendo acciones legales cuando corresponda.',
  },
  {
    id: 7,
    title: 'CUENTA ÚNICA E IDENTIDAD CISZU ID',
    content:
      'Para garantizar la equidad y la trazabilidad, cada persona deberá utilizar una única cuenta principal de CISZU ID. El uso de cuentas múltiples para evadir sanciones o manipular sistemas no está permitido.',
  },
  {
    id: 8,
    title: 'PRIVACIDAD Y DATOS PERSONALES',
    content:
      'Está prohibido compartir, difundir o solicitar información personal (doxxing) de otros miembros de la comunidad. La seguridad de los datos de nuestros usuarios es una prioridad absoluta y se rige por nuestra Política de Privacidad.',
  },
  {
    id: 9,
    title: 'AUTORIDAD Y MODERACIÓN',
    content:
      'Las decisiones tomadas por el equipo de Moderación y Staff son finales. El desacato sistemático a las instrucciones de los moderadores será motivo de sanción disciplinaria progresiva.',
  },
  {
    id: 10,
    title: 'COMUNICACIÓN Y USO DE CANALES',
    content:
      'El spam, la difusión de enlaces maliciosos o el uso excesivo de mayúsculas y elementos disruptivos en los canales de comunicación (Discord, foros, soporte) están prohibidos para asegurar una convivencia fluida.',
  },
  {
    id: 11,
    title: 'INTEGRIDAD TÉCNICA E INFRAESTRUCTURA',
    content:
      'Cualquier intento de ingeniería inversa, inyección de código, ataques de denegación de servicio (DDoS) o acceso no autorizado contra la infraestructura de Ciszu Network será perseguido mediante medidas técnicas y legales.',
  },
  {
    id: 12,
    title: 'REPRESENTACIÓN DE MARCA Y LOGOTIPOS',
    content:
      'Queda prohibido el uso de los logotipos e imágenes oficiales de Ciszu Network para fines comerciales o de representación engañosa sin el consentimiento explícito de la compañía y de Ciszuko Antony.',
  },
  {
    id: 13,
    title: 'TRANSPARENCIA Y APELACIONES',
    content:
      'Todo usuario sancionado tiene derecho a solicitar una revisión de su caso mediante el sistema oficial de apelaciones, siempre y cuando se proporcione evidencia válida y se mantenga un tono respetuoso.',
  },
];

export default function RulesPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-4xl">
        <LegalDocument
          icon="shield"
          title="REGLAS"
          subtitle="Código de conducta y uso aceptable"
          docLabel="Reglamento Oficial de Ciszu Network"
          articles={ARTICLES}
          signOff={{ title: 'Jurisdicción de la Red Ciszu', subtitle: 'Actualizado 2026 — Ciszu Network' }}
          officialLink={{ label: 'Ver versión oficial', href: 'https://ciszunetwork.vercel.app/rules' }}
          theme={THEME}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
