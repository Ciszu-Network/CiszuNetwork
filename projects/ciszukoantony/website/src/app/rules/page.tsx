import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszuko Antony | RULES',
  description:
    'Reglas de conducta y uso aceptable de la comunidad de Ciszuko Antony y Ciszugamens: respeto, moderación, reportes y apelaciones.',
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
    title: 'RESPETO Y CONVIVENCIA',
    content:
      'Se prohíbe cualquier forma de acoso, discurso de odio, discriminación o toxicidad dentro de la comunidad de Ciszuko Antony y Ciszugamens. El respeto hacia otros usuarios, visitantes y colaboradores es la base de una comunidad sana y es exigible en todos los canales oficiales.',
  },
  {
    id: 2,
    title: 'SUPLANTACIÓN DE IDENTIDAD',
    content:
      'Queda prohibido fingir ser Ciszuko Antony, un miembro del equipo o cualquier otra persona de la comunidad. La suplantación de identidad es una falta grave contra la confianza del público y puede conllevar la expulsión inmediata y permanente.',
  },
  {
    id: 3,
    title: 'PRIVACIDAD Y DOXXING',
    content:
      'Está terminantemente prohibido compartir, difundir o solicitar información personal de terceros (doxxing), incluidos nombres reales, direcciones, teléfonos, correos privados o documentos. La seguridad de los datos de la comunidad es una prioridad absoluta.',
  },
  {
    id: 4,
    title: 'USO DE LOS CANALES OFICIALES',
    content:
      'Los canales del proyecto (Discord, YouTube, foro, soporte y redes oficiales) deben usarse para los fines previstos. El spam, la publicidad no autorizada, el uso excesivo de mayúsculas y cualquier conducta que entorpezca la conversación están prohibidos.',
  },
  {
    id: 5,
    title: 'ENLACES Y CONTENIDO MALICIOSO',
    content:
      'No se permite difundir enlaces a sitios maliciosos, archivos infectados, estafas, esquemas de fraude ni contenido ilegal. Los moderadores pueden eliminar cualquier mensaje con enlaces sospechosos para proteger a la comunidad.',
  },
  {
    id: 6,
    title: 'REPORTE RESPONSABLE DE FALLOS',
    content:
      'Los usuarios tienen el deber ético de informar bugs, fallos o vulnerabilidades mediante los canales oficiales de soporte. Reportar de forma responsable ayuda a mejorar el ecosistema; explotar los fallos o difundirlos públicamente sin dar tiempo a corregirlos está prohibido.',
  },
  {
    id: 7,
    title: 'PROHIBICIÓN DE EXPLOITS Y ABUSO',
    content:
      'El uso deliberado de errores de programación para obtener ventajas, manipular métricas, evadir sanciones o acceder a datos ajenos será sancionado según su gravedad, incluyendo medidas legales cuando corresponda.',
  },
  {
    id: 8,
    title: 'CONTENIDO INAPROPIADO',
    content:
      'No se permite publicar contenido sexual explícito, violento, difamatorio o que incite al odio en los canales vinculados al proyecto. La comunidad es un espacio apto para todo público y el material compartido debe respetar ese estándar.',
  },
  {
    id: 9,
    title: 'AUTORIDAD Y MODERACIÓN',
    content:
      'Las decisiones del equipo de moderación son finales y buscan proteger la convivencia. El desacato sistemático a las instrucciones de los moderadores, la provocación constante o la reincidencia darán lugar a sanciones disciplinarias progresivas.',
  },
  {
    id: 10,
    title: 'PROPIEDAD Y DERECHOS DE AUTOR',
    content:
      'No se permite reclamar como propios los proyectos, artes, música, logos o textos de Ciszuko Antony publicados en la comunidad. Toda obra de terceros compartida debe contar con su crédito correspondiente y respetar la licencia de su autor.',
  },
  {
    id: 11,
    title: 'APELACIONES Y TRANSPARENCIA',
    content:
      'Todo usuario sancionado tiene derecho a solicitar una revisión de su caso mediante el sistema oficial de apelaciones, aportando evidencia válida y manteniendo un tono respetuoso. Las apelaciones se revisan en un plazo razonable y su resolución se comunica por los canales privados correspondientes.',
  },
  {
    id: 12,
    title: 'SANCIONES PROGRESIVAS',
    content:
      'Las infracciones se sancionan de forma proporcional: aviso, silencio temporal, suspensión y, en casos graves o reincidentes, expulsión permanente. Las faltas graves (doxxing, suplantación, explotación de fallos o amenazas) pueden sancionarse directamente con la expulsión.',
  },
];

export default function RulesPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <LegalDocument
          icon="shield"
          title="REGLAS"
          subtitle="Código de conducta de la comunidad"
          docLabel="Reglamento de Ciszuko Antony y Ciszugamens"
          articles={ARTICLES}
          signOff={{ title: 'Convivencia y Respeto', subtitle: 'Actualizado 2026 — Ciszuko Antony' }}
          theme={THEME}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
