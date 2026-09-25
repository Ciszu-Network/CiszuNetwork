import type { Metadata } from 'next';
import { LegalDocument, type LegalArticle } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

export const metadata: Metadata = {
  title: 'CiszuBot | GUIDELINES',
  description:
    'Lineamientos de uso de CiszuBot: invitación, permisos, comandos, identidad visual, privacidad e integración en servidores.',
};

const ARTICLES: LegalArticle[] = [
  {
    id: 1,
    title: 'OBJETO DEL PRESENTE DOCUMENTO',
    content:
      'Estos lineamientos definen las normas de uso correcto de CiszuBot, el bot oficial de Discord de Ciszu Network. Aplican a administradores, moderadores y miembros de cualquier servidor donde el bot esté presente, y buscan garantizar una experiencia estable, segura y coherente con la identidad del ecosistema.',
  },
  {
    id: 2,
    title: 'INVITACIÓN Y PERMISOS',
    content:
      'CiszuBot debe añadirse únicamente mediante el enlace de invitación oficial publicado en ciszubot.vercel.app. Quien invita al bot declara contar con el permiso «Gestionar servidor» y con autorización de la administración del servidor. Se prohíbe reinvitar, clonar o redistribuir el bot con credenciales ajenas.',
  },
  {
    id: 3,
    title: 'USO DE COMANDOS Y RATE LIMITS',
    content:
      'Los comandos deben usarse de forma razonable. El bot aplica límites automáticos por usuario y por servidor (rate limits) para proteger la API de Discord y la infraestructura. El abuso de comandos, el flooding en canales o la automatización masiva de invocaciones puede conllevar la restricción temporal o permanente del acceso al bot.',
  },
  {
    id: 4,
    title: 'CONTENIDO Y LENGUAJE EN SERVIDORES',
    content:
      'CiszuBot no genera ni aloja contenido de los usuarios. Aun así, el uso del bot para difundir spam, enlaces maliciosos, discurso de odio, contenido NSFW o material ilegal está terminantemente prohibido y puede ser reportado. La moderación del contenido de cada servidor corresponde a su propio staff.',
  },
  {
    id: 5,
    title: 'IDENTIDAD VISUAL Y MARCA',
    content:
      'El nombre, logotipo, isotipo y paleta de CiszuBot pertenecen a Ciszu Network. Se permite referenciar al bot en contenido informativo, banners o publicaciones de servidores, pero no alterar el logotipo, recolorear la marca, cambiar su nombre ni presentarlo como un producto propio o de terceros.',
  },
  {
    id: 6,
    title: 'INTEGRACIÓN EN SERVIDORES',
    content:
      'Cada servidor puede activar o desactivar módulos, elegir canales de avisos y fijar el idioma mediante los comandos de configuración o el panel web. Se recomienda revisar los permisos del bot tras cada actualización del servidor y no otorgar permisos de administrador cuando no sean necesarios.',
  },
  {
    id: 7,
    title: 'PRIVACIDAD Y DATOS',
    content:
      'CiszuBot solo registra contadores de comandos, estado de conexión y la configuración definida por cada servidor. No lee ni almacena el contenido de los mensajes. Queda prohibido usar el bot para extraer, cruzar o solicitar datos personales de otros usuarios (doxxing); el detalle completo vive en la Política de Privacidad.',
  },
  {
    id: 8,
    title: 'REPORTES Y CANALES OFICIALES',
    content:
      'Los errores, abusos y vulnerabilidades deben reportarse por los canales oficiales: la página de Soporte, el servidor de Discord de Ciszu Network o el correo de contacto. Se prohíbe explotar fallos antes de su corrección o divulgarlos sin dar tiempo razonable a su solución.',
  },
  {
    id: 9,
    title: 'ACTUALIZACIONES Y VERSIONES',
    content:
      'El bot se actualiza periódicamente con nuevas funciones, mejoras y correcciones. Cada versión se publica en el changelog oficial con su fecha. Algunos comandos pueden cambiar de nombre, comportamiento o retirarse; el uso continuado del bot implica aceptar dichas actualizaciones.',
  },
  {
    id: 10,
    title: 'DISPONIBILIDAD Y MANTENIMIENTO',
    content:
      'CiszuBot se ofrece «tal cual», con el mejor esfuerzo por mantenerlo en línea 24/7. Pueden existir ventanas de mantenimiento, reinicios o interrupciones por causas de Discord o de los proveedores cloud. No se garantiza disponibilidad ininterrumpida ni ausencia total de errores.',
  },
  {
    id: 11,
    title: 'APORTES Y COLABORACIÓN',
    content:
      'Cualquier persona puede proponer ideas, reportar bugs o contribuir código a través del repositorio público en GitHub y de la página de Feedback. Los aportes aceptados se acreditan en la página de Créditos. No se permite usar los canales oficiales para publicidad ajena al ecosistema.',
  },
  {
    id: 12,
    title: 'VIGENCIA Y ACTUALIZACIONES DEL DOCUMENTO',
    content:
      'Estos lineamientos pueden actualizarse conforme evoluciona el bot y el ecosistema. La versión vigente es siempre la publicada en esta página; los cambios relevantes se anuncian en el changelog y en el servidor oficial de Ciszu Network.',
  },
];

export default function GuidelinesPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <PageReveal>
            <LegalDocument
              icon="policies"
              title="LINEAMIENTOS"
              subtitle="Uso, integración y estándares de CiszuBot"
              docLabel="Guía Oficial de CiszuBot"
              articles={ARTICLES}
              signOff={{ title: 'Lineamientos Oficiales de CiszuBot', subtitle: 'Actualizado 2026 — Ciszu Network' }}
              theme={THEME}
            />
          </PageReveal>
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
