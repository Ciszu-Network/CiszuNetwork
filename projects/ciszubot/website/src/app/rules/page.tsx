import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

export const metadata: Metadata = {
  title: 'CiszuBot | RULES',
  description:
    'Reglas de convivencia y uso aceptable de CiszuBot y de las comunidades de Ciszu Network en Discord.',
};

const ARTICLES: LegalArticle[] = [
  {
    id: 1,
    title: 'CONDUCTA Y RESPETO MUTUO',
    content:
      'El respeto hacia otros usuarios, administradores y miembros del Staff es la base de la comunidad. Se prohíbe cualquier forma de acoso, hostigamiento, discriminación o ataque personal, dentro de los servidores donde opera CiszuBot y en los canales oficiales de Ciszu Network.',
  },
  {
    id: 2,
    title: 'TOLERANCIA CERO A LA TOXICIDAD',
    content:
      'No se permite el discurso de odio, las amenazas, la incitación a la violencia ni el comportamiento tóxico reiterado. Las bromas pesadas o el «troleo» que incomoden a otros usuarios serán evaluados por el Staff y sancionados según su gravedad.',
  },
  {
    id: 3,
    title: 'PROHIBICIÓN DE SPAM Y AUTOPROMOCIÓN',
    content:
      'El spam, el flooding de canales, el uso excesivo de mayúsculas, la repetición de comandos y la autopromoción no autorizada (otros bots, servidores, productos o enlaces de referidos) están prohibidos. La promoción solo se permite en los canales habilitados para ello y con autorización del Staff.',
  },
  {
    id: 4,
    title: 'CONTENIDO NSFW Y SENSIBLE',
    content:
      'Queda prohibido compartir contenido sexual, violento, gore, ilegal o inapropiado para menores, así como enlaces hacia él, tanto en los servidores del ecosistema como a través de los comandos del bot. El contenido debe mantenerse apto para todo público.',
  },
  {
    id: 5,
    title: 'PROHIBICIÓN DE EXPLOITS Y BUGS',
    content:
      'El uso deliberado de errores de programación de CiszuBot o de las plataformas de Ciszu Network para obtener ventajas, manipular métricas, duplicar recompensas o acceder a datos ajenos está estrictamente prohibido. Los fallos deben reportarse por los canales oficiales.',
  },
  {
    id: 6,
    title: 'MULTICUENTAS Y EVASIÓN DE SANCIONES',
    content:
      'Cada persona debe usar una única cuenta principal de Discord en la comunidad. La creación de cuentas alternativas para evadir sanciones, manipular sorteos o inflar métricas conlleva el bloqueo de todas las cuentas implicadas.',
  },
  {
    id: 7,
    title: 'SUPLANTACIÓN DE IDENTIDAD',
    content:
      'Queda prohibido hacerse pasar por Ciszuko Antony, por miembros del Staff, por moderadores o por otros usuarios. La suplantación de identidad, incluyendo el uso de nombres o avatares oficiales sin autorización, es una falta grave.',
  },
  {
    id: 8,
    title: 'PRIVACIDAD Y DOXXING',
    content:
      'Compartir, difundir o solicitar información personal de otros miembros (nombre real, dirección, teléfono, documentos, ubicación exacta o capturas privadas) está terminantemente prohibido y será sancionado de inmediato, con las acciones legales que correspondan.',
  },
  {
    id: 9,
    title: 'USO DE COMANDOS Y CANALES',
    content:
      'Los comandos de CiszuBot deben usarse en los canales destinados a ello y de forma razonable. Los canales oficiales de soporte, reportes y sugerencias deben utilizarse solo para su propósito. El uso indebido reiterado puede conllevar la restricción de comandos.',
  },
  {
    id: 10,
    title: 'MODERACIÓN Y AUTORIDAD DEL STAFF',
    content:
      'Las decisiones de moderación del Staff de Ciszu Network son finales y se aplican para proteger a la comunidad. El desacato sistemático a las instrucciones de los moderadores, la provocación deliberada o la discusión pública de sanciones serán motivo de sanción disciplinaria progresiva.',
  },
  {
    id: 11,
    title: 'APELACIONES Y REVISIÓN DE CASOS',
    content:
      'Todo usuario sancionado tiene derecho a solicitar una revisión de su caso por los canales oficiales de apelación, con evidencia válida y un tono respetuoso. Las apelaciones presentadas con agresividad, spam o cuentas alternativas serán rechazadas.',
  },
  {
    id: 12,
    title: 'PROPIEDAD INTELECTUAL Y MARCAS',
    content:
      'Queda prohibido el uso de los logotipos, nombres e imágenes oficiales de CiszuBot y Ciszu Network para fines comerciales, de representación engañosa o de afiliación inexistente sin el consentimiento explícito de Ciszu Network y de Ciszuko Antony.',
  },
  {
    id: 13,
    title: 'CONSECUENCIAS Y SANCIONES',
    content:
      'El incumplimiento de estas reglas puede conllevar advertencias, silencios temporales, expulsión de los servidores o bloqueo permanente del acceso a CiszuBot y a los servicios del ecosistema, según la gravedad y la reincidencia. Las sanciones buscan proteger a la comunidad, no castigar por castigar.',
  },
];

export default function RulesPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <PageReveal>
            <LegalDocument
              icon="shield"
              title="REGLAS"
              subtitle="Código de conducta y uso aceptable"
              docLabel="Reglamento Oficial de CiszuBot"
              articles={ARTICLES}
              signOff={{ title: 'Convivencia de la Comunidad CiszuBot', subtitle: 'Actualizado 2026 — Ciszu Network' }}
              theme={THEME}
            />
          </PageReveal>
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
