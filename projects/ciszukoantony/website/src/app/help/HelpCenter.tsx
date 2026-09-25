'use client';

import {
  InfoHelpExplorer,
  type InfoHelpCard,
  type InfoHelpCategory,
  type InfoHelpCopy,
  type InfoTheme,
} from '@ciszu/ui';

/**
 * Contenido del centro de ayuda del portfolio de Ciszuko Antony.
 *
 * La lógica (buscador, chips por categoría, grid y modal central) vive en
 * `InfoHelpExplorer`; aquí solo van las 24 ayudas reales del sitio y su paleta,
 * con las clases literales para que Tailwind las extraiga.
 */
const CATEGORIES: InfoHelpCategory[] = [
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: 'home',
    accent: 'text-neon-blue',
    accentBg: 'bg-neon-blue/10',
    accentBorder: 'border-neon-blue/40',
    cta: 'bg-neon-blue text-white hover:bg-neon-blue/90',
  },
  {
    id: 'certificados',
    label: 'Certificados',
    icon: 'certificates',
    accent: 'text-neon-cyan',
    accentBg: 'bg-neon-cyan/10',
    accentBorder: 'border-neon-cyan/40',
    cta: 'bg-neon-cyan text-black hover:bg-neon-cyan/90',
  },
  {
    id: 'contenido',
    label: 'Contenido y descargas',
    icon: 'download',
    accent: 'text-neon-purple',
    accentBg: 'bg-neon-purple/10',
    accentBorder: 'border-neon-purple/40',
    cta: 'bg-neon-purple text-white hover:bg-neon-purple/90',
  },
  {
    id: 'contacto',
    label: 'Contacto',
    icon: 'mail',
    accent: 'text-neon-pink',
    accentBg: 'bg-neon-pink/10',
    accentBorder: 'border-neon-pink/40',
    cta: 'bg-neon-pink text-black hover:bg-neon-pink/90',
  },
  {
    id: 'colaboracion',
    label: 'Colaboración',
    icon: 'hand',
    accent: 'text-neon-green',
    accentBg: 'bg-neon-green/10',
    accentBorder: 'border-neon-green/40',
    cta: 'bg-neon-green text-black hover:bg-neon-green/90',
  },
  {
    id: 'privacidad',
    label: 'Privacidad',
    icon: 'lock',
    accent: 'text-neon-yellow',
    accentBg: 'bg-neon-yellow/10',
    accentBorder: 'border-neon-yellow/40',
    cta: 'bg-neon-yellow text-black hover:bg-neon-yellow/90',
  },
  {
    id: 'soporte',
    label: 'Soporte',
    icon: 'support',
    accent: 'text-neon-orange',
    accentBg: 'bg-neon-orange/10',
    accentBorder: 'border-neon-orange/40',
    cta: 'bg-neon-orange text-black hover:bg-neon-orange/90',
  },
  {
    id: 'legal',
    label: 'Uso y legal',
    icon: 'policies',
    accent: 'text-brand-light',
    accentBg: 'bg-brand-light/10',
    accentBorder: 'border-brand-light/40',
    cta: 'bg-brand-light text-black hover:bg-brand-light/90',
  },
];

const COPY: InfoHelpCopy = {
  searchPlaceholder: 'Busca una ayuda: certificados, descargas, contacto...',
  allCategories: 'Todas',
  results: 'Mostrando {n} de {total} ayudas',
  emptyTitle: 'Sin resultados',
  emptyHint: 'Prueba con otra palabra o cambia de categoría.',
  clear: 'Reiniciar búsqueda',
  stepsTitle: 'Pasos rápidos',
  open: 'Abrir ayuda',
  close: 'Cerrar',
};

const CARDS: InfoHelpCard[] = [
  {
    title: 'Navegar por el portfolio',
    category: 'portfolio',
    icon: 'home',
    summary: 'Cómo moverse entre secciones, proyectos y contenido.',
    detail:
      'El portfolio reúne la trayectoria profesional, los proyectos y los certificados. La navegación superior da acceso a cada sección y el pie concentra los enlaces secundarios.',
    steps: [
      'Usa la barra superior para las secciones principales.',
      'Entra en Proyectos para ver cada trabajo con su ficha.',
      'Si te pierdes, vuelve al inicio desde el logotipo.',
    ],
    tags: 'navegación secciones menu portfolio inicio estructura',
    cta: { label: 'Ir a About', href: '/about' },
  },
  {
    title: 'Sobre Ciszuko Antony',
    category: 'portfolio',
    icon: 'user',
    summary: 'Quién es, qué hace y cuál es la trayectoria del autor.',
    detail:
      'La sección About presenta a Ciszuko Antony (Francisco García): su perfil profesional, áreas de trabajo y el ecosistema digital que lidera desde Ciszu Network.',
    steps: [
      'Abre la sección About.',
      'Recorre la trayectoria y las áreas de especialización.',
      'Sigue los enlaces a los proyectos que aparecen mencionados.',
    ],
    tags: 'sobre about biografía autor ciszuko antony perfil trayectoria',
    cta: { label: 'Ver About', href: '/about' },
  },
  {
    title: 'Proyectos y casos',
    category: 'portfolio',
    icon: 'rocket',
    summary: 'Los trabajos y productos del ecosistema, con su ficha.',
    detail:
      'Cada proyecto tiene una página con su descripción, estado y enlaces. Los proyectos del ecosistema incluyen CiszuBot, MuzicMania y CiszuGamens, entre otros.',
    steps: [
      'Abre la sección de proyectos.',
      'Elige el trabajo que quieras conocer.',
      'Usa los enlaces para visitar su web o su documentación.',
    ],
    tags: 'proyectos trabajos casos portfolio productos apps',
    cta: { label: 'Ver proyectos', href: '/projects' },
  },
  {
    title: 'Changelog del portfolio',
    category: 'portfolio',
    icon: 'history',
    summary: 'Novedades y versiones del sitio, entrada por entrada.',
    detail:
      'El changelog documenta cada cambio del portfolio con su versión y estado. Es la forma más rápida de saber si un problema que tenías ya se corrigió.',
    steps: [
      'Abre el changelog desde la navegación.',
      'Filtra por estado o busca el cambio que te interesa.',
      'Entra en la entrada para ver el detalle completo.',
    ],
    tags: 'changelog novedades versiones cambios historial actualizaciones',
    cta: { label: 'Ver changelog', href: '/changelog' },
  },
  {
    title: 'Catálogo de certificados',
    category: 'certificados',
    icon: 'certificates',
    summary: 'Todos los certificados, con emisor, fecha y referencia.',
    detail:
      'El catálogo agrupa los certificados por categoría y muestra en cada ficha el emisor, la fecha real extraída del documento y la referencia. Se puede filtrar y buscar.',
    steps: [
      'Abre la página de certificados.',
      'Filtra por categoría o usa el buscador.',
      'Abre una ficha para ver el detalle y las vistas previas.',
    ],
    tags: 'certificados catálogo certificaciones cisco microsoft ibm hp formación',
    cta: { label: 'Ver certificados', href: '/certificates' },
  },
  {
    title: 'Verificar un certificado',
    category: 'certificados',
    icon: 'verified',
    summary: 'Comprueba un certificado contra su documento original.',
    detail:
      'Cada ficha muestra la referencia, el emisor y la fecha real. Desde ella puedes abrir el documento original alojado en el CDN para comprobarlo con la entidad emisora.',
    steps: [
      'Abre la ficha del certificado que quieras verificar.',
      'Revisa referencia, emisor y fecha.',
      'Abre el documento original y contrástalo con el emisor.',
    ],
    tags: 'verificar verificación autenticidad certificado original referencia emisor',
    cta: { label: 'Ver certificados', href: '/certificates' },
  },
  {
    title: 'Certificados sin fecha visible',
    category: 'certificados',
    icon: 'clock',
    summary: 'Por qué algunas fichas indican que el documento no tiene fecha.',
    detail:
      'Cuando el documento no incluye una fecha legible (por ejemplo, una imagen con datos censurados) no se inventa ninguna: la ficha lo indica explícitamente en lugar de mostrar un dato falso.',
    steps: [
      'Abre la ficha del certificado.',
      'Si aparece la indicación de que no hay fecha en el documento, no es un error.',
      'Verifica el resto de datos en el documento original.',
    ],
    tags: 'sin fecha no date documento certificado censurado transparencia',
    cta: { label: 'Ver certificados', href: '/certificates' },
  },
  {
    title: 'Descargar medios y recursos',
    category: 'contenido',
    icon: 'download',
    summary: 'Logos, imágenes y recursos listos para usar.',
    detail:
      'La página de descargas reúne los recursos publicados del portfolio, incluida la instalación como aplicación de escritorio. Todo el contenido descargable está servido desde el CDN.',
    steps: [
      'Abre la página de descargas.',
      'Elige el recurso que necesites.',
      'Descárgalo desde el enlace del CDN.',
    ],
    tags: 'descargas downloads recursos logos imágenes medios cdn',
    cta: { label: 'Ver descargas', href: '/downloads' },
  },
  {
    title: 'Formatos y calidad de los medios',
    category: 'contenido',
    icon: 'camera',
    summary: 'Qué formatos se publican y cómo se optimizan las imágenes.',
    detail:
      'Las imágenes se sirven en formatos modernos con variantes de tamaño según el dispositivo. Los documentos se ofrecen en su formato original para no perder calidad.',
    steps: [
      'Abre el recurso o certificado que te interese.',
      'Consulta la variante disponible del archivo.',
      'Si necesitas otro formato, pídelo por contacto.',
    ],
    tags: 'formatos calidad imágenes webp svg pdf medios optimización',
    cta: { label: 'Ver descargas', href: '/downloads' },
  },
  {
    title: 'Instalar el portfolio como PDWA',
    category: 'contenido',
    icon: 'monitor',
    summary: 'Úsalo como app de escritorio, sin pestañas ni barra de dirección.',
    detail:
      'La PDWA abre el portfolio en su propia ventana con acceso directo. Chrome y Microsoft Edge la instalan de forma nativa; en Opera se usa un acceso directo con --app.',
    steps: [
      'Abre la página de descargas en Chrome o Edge.',
      'Pulsa "Instalar PDWA" y confirma el diálogo.',
      'Abre la app desde el menú Inicio o el escritorio.',
    ],
    tags: 'pdwa pwa instalar app escritorio chrome edge opera acceso directo',
    cta: { label: 'Ver descargas', href: '/downloads' },
  },
  {
    title: 'Documentación del ecosistema',
    category: 'contenido',
    icon: 'terminal',
    summary: 'Guías técnicas de los sistemas de Ciszu Network.',
    detail:
      'La documentación del ecosistema explica la arquitectura, la base de datos, la seguridad y los flujos de trabajo de los proyectos. Es material técnico de referencia.',
    steps: [
      'Abre la documentación.',
      'Busca el sistema que quieras entender.',
      'Sigue los enlaces relacionados de cada guía.',
    ],
    tags: 'documentación docs técnica arquitectura guías sistemas',
    cta: { label: 'Abrir documentación', href: '/documentation' },
  },
  {
    title: 'Contacto directo',
    category: 'contacto',
    icon: 'mail',
    summary: 'Correo, WhatsApp y canales publicados para escribir.',
    detail:
      'La página de contacto lista los canales oficiales: correo, WhatsApp y redes. Es la vía para propuestas, prensa o consultas profesionales.',
    steps: [
      'Abre la página de contacto.',
      'Elige el canal según el motivo.',
      'Escribe un mensaje claro con tus datos de respuesta.',
    ],
    tags: 'contacto correo email whatsapp mensaje escribir',
    cta: { label: 'Ir a contacto', href: '/contact' },
  },
  {
    title: 'Redes oficiales',
    category: 'contacto',
    icon: 'globe',
    summary: 'Los perfiles verificados donde se publica contenido.',
    detail:
      'Las redes oficiales (GitHub, YouTube, X, Instagram, Facebook y Discord) aparecen enlazadas desde el sitio. Desconfía de cuentas que no estén publicadas aquí.',
    steps: [
      'Baja al pie de la página o abre Contacto.',
      'Elige la red que quieras seguir.',
      'Comprueba que el perfil coincide con el enlazado.',
    ],
    tags: 'redes sociales github youtube x instagram facebook discord oficial',
    cta: { label: 'Ver contacto', href: '/contact' },
  },
  {
    title: 'Enviar feedback',
    category: 'contacto',
    icon: 'message',
    summary: 'Sugerencias y mejoras para el portfolio.',
    detail:
      'El formulario de feedback recoge sugerencias y errores del sitio. Los mensajes llegan directamente al equipo y se responden por orden de llegada.',
    steps: [
      'Abre la página de feedback.',
      'Describe tu sugerencia o el problema.',
      'Incluye tu correo si esperas respuesta.',
    ],
    tags: 'feedback sugerencias mejora formulario mensaje opinión',
    cta: { label: 'Enviar feedback', href: '/feedback' },
  },
  {
    title: 'Reseñas y opiniones',
    category: 'contacto',
    icon: 'star',
    summary: 'Opiniones publicadas y cómo dejar la tuya.',
    detail:
      'La página de reseñas muestra las opiniones de Google del negocio y permite dejar una nueva. Las reseñas se moderan antes de publicarse.',
    steps: [
      'Abre la página de reseñas.',
      'Lee las opiniones publicadas.',
      'Pulsa para escribir la tuya y complétala en Google.',
    ],
    tags: 'reseñas reviews opiniones google estrellas valoración',
    cta: { label: 'Ver reseñas', href: '/reviews' },
  },
  {
    title: 'Proponer una colaboración',
    category: 'colaboracion',
    icon: 'hand',
    summary: 'Cómo enviar una propuesta para trabajar juntos.',
    detail:
      'Las propuestas de colaboración se reciben por contacto o Discord. Incluir el área de interés y un enlace a trabajo previo acelera la respuesta; todas las propuestas se responden.',
    steps: [
      'Abre la página de contacto o el servidor de Discord.',
      'Indica el área en la que quieres colaborar.',
      'Adjunta un enlace a trabajo previo o portafolio.',
    ],
    tags: 'colaboración colaborar propuesta partnership trabajo equipo',
    cta: { label: 'Proponer', href: '/contact' },
  },
  {
    title: 'Citar el contenido del sitio',
    category: 'colaboracion',
    icon: 'share',
    summary: 'Cómo reutilizar contenido citando correctamente la autoría.',
    detail:
      'El código de los proyectos es público y puede consultarse. Los textos, certificados y piezas visuales pertenecen a Ciszuko Antony: se pueden citar con atribución, no reclamar como propios.',
    steps: [
      'Indica siempre la autoría y el enlace original.',
      'No presentes el contenido como propio ni lo alteres para engañar.',
      'Para uso comercial, pide permiso por contacto.',
    ],
    tags: 'citar citar contenido atribución autoría reutilizar copyright',
    cta: { label: 'Ver licencia', href: '/license' },
  },
  {
    title: 'Donaciones y apoyo',
    category: 'colaboracion',
    icon: 'heart',
    summary: 'Vías publicadas para apoyar económicamente el proyecto.',
    detail:
      'Las donaciones financian el hosting y el mantenimiento del ecosistema. Todas las vías están listadas en la página de donar y no desbloquean funciones exclusivas.',
    steps: [
      'Abre la página de donar.',
      'Elige la vía disponible.',
      'Completa el proceso en la plataforma elegida.',
    ],
    tags: 'donar donaciones apoyo ko-fi patreon cripto financiar',
    cta: { label: 'Ir a donar', href: '/donate' },
  },
  {
    title: 'Privacidad de datos',
    category: 'privacidad',
    icon: 'lock',
    summary: 'Qué datos recoge el sitio y con qué finalidad.',
    detail:
      'La política de privacidad detalla qué datos se recogen (por ejemplo, al usar formularios o iniciar sesión), su finalidad y el tiempo de conservación. No se venden datos a terceros.',
    steps: [
      'Lee la política de privacidad completa.',
      'Revisa el consentimiento de cookies en las preferencias.',
      'Para ejercer tus derechos, escribe por contacto.',
    ],
    tags: 'privacidad datos privacy gdpr rgpd política consentimiento',
    cta: { label: 'Leer política', href: '/policy' },
  },
  {
    title: 'Cookies en esta web',
    category: 'privacidad',
    icon: 'check',
    summary: 'Qué guarda el sitio en tu navegador y cómo cambiarlo.',
    detail:
      'Las cookies técnicas guardan preferencias como el tema o el idioma. Puedes aceptar, rechazar o retirar el consentimiento desde el aviso de cookies o las preferencias locales.',
    steps: [
      'Lee el aviso de cookies al entrar por primera vez.',
      'Elige aceptar o rechazar según prefieras.',
      'Cambia la decisión cuando quieras desde las preferencias.',
    ],
    tags: 'cookies consentimiento navegador preferencias aceptar rechazar',
    cta: { label: 'Ver política', href: '/policy' },
  },
  {
    title: 'Reportar un problema del sitio',
    category: 'soporte',
    icon: 'warning',
    summary: 'Abre una incidencia con los datos del fallo.',
    detail:
      'La página de soporte registra incidencias del sitio con seguimiento. Cuanto más concretos sean los datos (página, navegador, dispositivo), más rápido se reproduce el problema.',
    steps: [
      'Abre la página de soporte.',
      'Describe la página y el paso exacto que falló.',
      'Añade navegador, dispositivo y captura si puedes.',
    ],
    tags: 'soporte incidencia problema error reportar fallo sitio',
    cta: { label: 'Abrir incidencia', href: '/support' },
  },
  {
    title: 'Errores comunes',
    category: 'soporte',
    icon: 'error',
    summary: 'Soluciones rápidas a los fallos más frecuentes.',
    detail:
      'La mayoría de incidencias son caché desactualizada, sesión caducada o cookies rechazadas que afectan a formularios. La FAQ recoge cada caso con su solución.',
    steps: [
      'Recarga con Ctrl+F5 para descartar la caché.',
      'Comprueba que las cookies están permitidas.',
      'Si persiste, abre una incidencia con los detalles.',
    ],
    tags: 'errores fallos caché sesión cookies solución faq troubleshooting',
    cta: { label: 'Ver la FAQ', href: '/faq' },
  },
  {
    title: 'Estado del sitio',
    category: 'soporte',
    icon: 'signal',
    summary: 'Conexión, latencia y estado de la infraestructura.',
    detail:
      'La página de estado mide en tu navegador la conexión y la latencia, y muestra el estado de la base de datos. Lo que no se puede medir se indica claramente.',
    steps: [
      'Abre la página de estado.',
      'Revisa el indicador de conexión y la latencia.',
      'Si algo aparece caído, prueba de nuevo en unos minutos.',
    ],
    tags: 'estado status servidor latencia conexión uptime stats',
    cta: { label: 'Ver estado', href: '/stats' },
  },
  {
    title: 'Licencia y uso de marca',
    category: 'legal',
    icon: 'terms',
    summary: 'Qué se puede hacer con el código, la marca y los medios.',
    detail:
      'La licencia explica el uso permitido del software y de los contenidos. El código de los proyectos es público; la marca, los logos y la identidad visual pertenecen a Ciszuko Antony.',
    steps: [
      'Consulta la licencia antes de reutilizar material.',
      'Cita la autoría en cualquier uso permitido.',
      'Para marcas o usos comerciales, contacta primero.',
    ],
    tags: 'licencia marca logo copyright uso comercial código legal',
    cta: { label: 'Ver licencia', href: '/license' },
  },
  {
    title: 'Términos y políticas',
    category: 'legal',
    icon: 'policies',
    summary: 'El conjunto de políticas y condiciones del sitio.',
    detail:
      'La página de políticas reúne los documentos legales del sitio: privacidad, términos, reglas de la comunidad y licencias, cada uno en su apartado.',
    steps: [
      'Abre la página de políticas.',
      'Elige el documento que quieras consultar.',
      'Usa los enlaces internos para saltar entre documentos.',
    ],
    tags: 'términos políticas legal condiciones documentos reglas licencia',
    cta: { label: 'Ver políticas', href: '/policies' },
  },
];

export default function HelpCenter({ theme }: { theme: InfoTheme }) {
  return <InfoHelpExplorer cards={CARDS} categories={CATEGORIES} copy={COPY} theme={theme} />;
}
