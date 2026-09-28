// Comisiones personales de Ciszuko Antony.
//
// El catálogo se apoya en los servicios REALES de Ciszu Network (los mismos
// flyers oficiales que se publican en ciszunetwork.vercel.app/services), pero
// está planteado en primera persona: trabajo directamente contigo y la empresa
// Ciszu Network es el canal con el que se propagan y facturan los servicios.
//
// Los flyers viven en el CDN del ecosistema (ciszu-cdn), bajo la ruta de ciszu;
// aquí solo se resuelven por `assetUrl` para no duplicar los archivos.

import { assetUrl } from '@ciszunetwork/cdn';

export type CommissionGroupId = 'design' | 'docs' | 'security' | 'digital' | 'experience';

export interface CommissionGroup {
  id: CommissionGroupId;
  label: string;
  kicker: string;
  icon: string;
  color: string;
}

export interface CommissionProcessStep {
  title: string;
  body: string;
}

export interface CommissionService {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  group: CommissionGroupId;
  flyer: string;
  flyerAlt: string;
  programs: string[];
  includes: string[];
  process: CommissionProcessStep[];
  deliverables: string[];
}

/** Contacto personal (comisiones directas con Ciszuko Antony). */
export const COMMISSIONS_CONTACT = {
  name: 'Ciszuko Antony',
  email: 'fplayersoffcial@gmail.com',
  phone: '+58 412 6858111',
  whatsapp: 'https://wa.me/584126858111',
  /** Catálogo oficial de la empresa por la que se propagan los servicios. */
  companyCatalog: 'https://ciszunetwork.vercel.app/services',
  companyName: 'Ciszu Network',
} as const;

export const PRICE_LABEL = 'Consultar';
export const PRICE_TAG = 'Negociable';
export const PRICE_NOTE =
  'No publico precios fijos porque cada proyecto es distinto: la cotización se ajusta al alcance, la complejidad y los tiempos. Escríbeme y la conversamos sin compromiso.';

export const FLYER_WIDTH = 1414;
export const FLYER_HEIGHT = 2000;
export const FLYER_RATIO = `${FLYER_WIDTH} / ${FLYER_HEIGHT}`;

function flyerPath(slug: string): string {
  return assetUrl(`projects/ciszu/content/flyers/images/ciszu_flayer_vertical_${slug}.webp`);
}

export function commissionWhatsappUrl(service?: CommissionService): string {
  const message = service
    ? `Hola ${COMMISSIONS_CONTACT.name}, quiero información sobre la comisión de ${service.name}.`
    : `Hola ${COMMISSIONS_CONTACT.name}, quiero información sobre tus comisiones.`;
  return `https://wa.me/584126858111?text=${encodeURIComponent(message)}`;
}

export const COMMISSIONS_WHATSAPP_URL = commissionWhatsappUrl();

export const COMMISSION_GROUPS: CommissionGroup[] = [
  {
    id: 'design',
    label: 'Diseño y contenido',
    kicker: 'Marca, imagen y piezas visuales',
    icon: 'palette',
    color: '#f472b6',
  },
  {
    id: 'docs',
    label: 'Documentos y ofimática',
    kicker: 'Textos, tablas y presentaciones',
    icon: 'certificates',
    color: '#22d3ee',
  },
  {
    id: 'security',
    label: 'Seguridad y calidad',
    kicker: 'Auditoría, pruebas y monitoreo',
    icon: 'shield',
    color: '#34d399',
  },
  {
    id: 'digital',
    label: 'Presencia digital',
    kicker: 'Discord, comunidades y redes',
    icon: 'globe',
    color: '#60a5fa',
  },
  {
    id: 'experience',
    label: 'Experiencias',
    kicker: 'Servidores, torneos y eventos',
    icon: 'gamepad',
    color: '#a855f7',
  },
];

export const COMMISSIONS: CommissionService[] = [
  {
    slug: 'branding',
    name: 'Branding y Rebranding',
    tagline: 'Identidad visual profesional',
    description:
      'Diseño o renuevo la identidad visual de tu negocio, campaña o marca: logotipos, imagotipos, isologos e isotipos, más la marca completa lista para web, impresión y redes.',
    icon: 'palette',
    color: '#ffcc00',
    group: 'design',
    flyer: flyerPath('branding'),
    flyerAlt: 'Flyer de branding y rebranding',
    programs: ['Adobe Illustrator', 'Adobe Photoshop'],
    includes: [
      'Logotipo, imagotipo, isologo e isotipo',
      'Versión principal y variantes de contraste',
      'Paleta de color y tipografías de marca',
      'Aplicación en web, print y redes sociales',
    ],
    process: [
      { title: 'Brief y referencias', body: 'Levanto la información del negocio, el público y las referencias visuales que definen el rumbo.' },
      { title: 'Propuesta de conceptos', body: 'Presento propuestas de identidad con su justificación y muestras de aplicación.' },
      { title: 'Refinamiento', body: 'Ajustamos la propuesta elegida hasta la versión final aprobada.' },
      { title: 'Entrega de archivos', body: 'Entrego fuentes, vectores y exportaciones listas para cada uso.' },
    ],
    deliverables: ['Logo vectorial (SVG)', 'Exportaciones PNG/WebP', 'Variantes de color y contraste', 'Guía básica de uso'],
  },
  {
    slug: 'disenografico',
    name: 'Diseño Gráfico',
    tagline: 'Vectoriza, grafica y digitaliza tu esfuerzo',
    description:
      'Convierto tu esfuerzo en piezas gráficas listas para presentar: presentaciones, gráficas, infografías, estadísticas y flyers con acabado profesional.',
    icon: 'monitor',
    color: '#f472b6',
    group: 'design',
    flyer: flyerPath('disenografico'),
    flyerAlt: 'Flyer de diseño gráfico',
    programs: ['Adobe Illustrator', 'Adobe After Effects', 'Adobe Photoshop', 'Adobe Lightroom'],
    includes: [
      'Presentaciones y diapositivas',
      'Gráficas y estadísticas',
      'Infografías',
      'Flyers y piezas promocionales',
      'Vectorización de imágenes',
    ],
    process: [
      { title: 'Contenido', body: 'Recibo la información y definimos el objetivo de la pieza.' },
      { title: 'Diseño', body: 'Maqueto la pieza con la identidad visual correspondiente.' },
      { title: 'Entrega', body: 'Exporto en los formatos que necesites (web, print, redes).' },
    ],
    deliverables: ['Pieza final en PNG/PDF', 'Fuente vectorial', 'Exportaciones para redes'],
  },
  {
    slug: 'ilustracion',
    name: 'Ilustración, Dibujos y Arte',
    tagline: 'Comisiones abiertas a diversos estilos',
    description:
      'Ilustración digital y arte por comisión: trabajo diversos estilos, desde el boceto hasta el acabado final, para personajes, campañas y marcas.',
    icon: 'hand',
    color: '#c084fc',
    group: 'design',
    flyer: flyerPath('ilustracion'),
    flyerAlt: 'Flyer de ilustración, dibujos y arte',
    programs: ['Adobe Illustrator', 'Adobe Photoshop', 'Pixel art'],
    includes: [
      'Ilustración de personajes',
      'Arte para campañas y marcas',
      'Diversos estilos y acabados',
      'Pixel art',
    ],
    process: [
      { title: 'Concepto', body: 'Definimos el estilo, la composición y las referencias de la comisión.' },
      { title: 'Boceto', body: 'Presento el boceto para aprobación antes de dar color.' },
      { title: 'Acabado', body: 'Aplico color, luces y detalle final; entrego en alta resolución.' },
    ],
    deliverables: ['Ilustración final en alta resolución', 'Versión para redes', 'Archivo fuente por capas'],
  },
  {
    slug: 'photoeditor',
    name: 'Edición de Imagen y Fotografías',
    tagline: 'Retoque y edición profesional',
    description:
      'Edito tus imágenes y fotografías con flujo profesional: edición RAW, gestión de color, máscaras y acabados de estudio, incluidas miniaturas.',
    icon: 'camera',
    color: '#fb923c',
    group: 'design',
    flyer: flyerPath('photoeditor'),
    flyerAlt: 'Flyer de edición de imagen y fotografías',
    programs: ['Adobe Lightroom', 'Adobe Photoshop', 'Adobe Illustrator'],
    includes: [
      'Edición RAW',
      'Colores HSV, RGB y CMYK',
      'Efectos FX, fusiones y contrastes',
      'Quita-fondos, máscaras, contornos y sombras',
      'Brillo, difuminados, degradados y resplandores',
      'Saturación, gamma, sepias y viñetas',
      'Miniaturas',
    ],
    process: [
      { title: 'Recepción', body: 'Recibo las imágenes originales y el objetivo de cada pieza.' },
      { title: 'Edición', body: 'Aplico color, retoque y composición según el estilo pedido.' },
      { title: 'Entrega', body: 'Exporto en la resolución y formato requeridos.' },
    ],
    deliverables: ['Imágenes editadas en alta resolución', 'Versiones para web/redes', 'Miniaturas listas para publicar'],
  },
  {
    slug: 'videoeditor',
    name: 'Edición de Video',
    tagline: 'Corto, medio y largo metraje',
    description:
      'Edito videos de corto, medio y largo metraje con acabado profesional: transiciones, subtítulos, animaciones, efectos y postproducción completa.',
    icon: 'play',
    color: '#f43f5e',
    group: 'design',
    flyer: flyerPath('videoeditor'),
    flyerAlt: 'Flyer de edición de videos',
    programs: ['Adobe Premiere Pro', 'Adobe After Effects', 'DaVinci Resolve'],
    includes: [
      'Recortes y transiciones',
      'Autosubtítulos',
      'SFX, FX y componentes',
      'Textos con estilos y animaciones',
      'Zoom, contornos, figuras y degradados',
      'Conversión de formatos y compresión',
    ],
    process: [
      { title: 'Material', body: 'Recibo el material bruto y la referencia del resultado esperado.' },
      { title: 'Edición', body: 'Monto, animo y aplico efectos y subtítulos.' },
      { title: 'Entrega', body: 'Exporto en el formato y la resolución acordados.' },
    ],
    deliverables: ['Video final exportado', 'Subtítulos', 'Versión para redes verticales', 'Archivo de proyecto'],
  },
  {
    slug: 'curriculum',
    name: 'Creación de Currículums',
    tagline: 'CVs con diseño personalizable',
    description:
      'Creo currículums con diseño totalmente personalizable: colores de énfasis, tipografías de familias de texto y más, listos para imprimir o enviar en digital.',
    icon: 'certificates',
    color: '#22d3ee',
    group: 'docs',
    flyer: flyerPath('curriculum'),
    flyerAlt: 'Flyer de creación de currículums',
    programs: ['Google Suite', 'Microsoft Office', 'Adobe PDF'],
    includes: [
      'Diseño totalmente personalizable',
      'Colores de énfasis y jerarquía visual',
      'Tipografías de familias de texto',
      'Versión PDF lista para enviar',
    ],
    process: [
      { title: 'Datos y objetivo', body: 'Recopilo tu experiencia, logros y el puesto o sector al que apuntas.' },
      { title: 'Propuesta de diseño', body: 'Definimos estructura, énfasis y estilo según el perfil.' },
      { title: 'Ajustes finales', body: 'Corregimos y pulimos contenido y diseño contigo.' },
    ],
    deliverables: ['CV en PDF de alta calidad', 'Versión editable', 'Adaptación a una oferta específica'],
  },
  {
    slug: 'ofimatica',
    name: 'Ofimática y Documentación',
    tagline: 'Documentos, presentaciones e investigaciones',
    description:
      'Redacto y doy formato profesional a documentos de texto, investigaciones, presentaciones, diapositivas y tablas de datos para tu negocio o estudio.',
    icon: 'keyboard',
    color: '#60a5fa',
    group: 'docs',
    flyer: flyerPath('ofimatica'),
    flyerAlt: 'Flyer de ofimática y documentación',
    programs: ['Google Suite', 'Microsoft Office', 'Adobe Acrobat', 'PDF'],
    includes: [
      'Documentos de texto e investigaciones',
      'Presentaciones y diapositivas',
      'Tablas de datos, valores, columnas y filas',
      'Formato profesional y exportación a PDF',
    ],
    process: [
      { title: 'Contenido', body: 'Recibo el material y definimos la estructura del documento.' },
      { title: 'Redacción y formato', body: 'Redacto, ordeno y doy formato con estilos consistentes.' },
      { title: 'Entrega', body: 'Entrego la versión editable y el PDF final.' },
    ],
    deliverables: ['Documento editable', 'PDF final', 'Tablas y gráficas de apoyo'],
  },
  {
    slug: 'ciberseguridad',
    name: 'Ciberseguridad',
    tagline: 'Protección, auditoría y monitoreo',
    description:
      'Audito y protejo tu infraestructura digital con herramientas ofensivas y defensivas: OSINT, auditoría de malware, monitoreo y rastreo de credenciales, con informes claros y accionables.',
    icon: 'shield',
    color: '#34d399',
    group: 'security',
    flyer: flyerPath('ciberseguridad'),
    flyerAlt: 'Flyer de ciberseguridad',
    programs: ['Kali Linux', 'Terminal'],
    includes: [
      'Open Source Intelligence (OSINT)',
      'Antivirus y protección de virus',
      'Malware Auditor',
      'Security Operations Center (SOC)',
      'Monitoring y Pentester Uptime',
      'Rastreo de credenciales',
    ],
    process: [
      { title: 'Reconocimiento', body: 'Mapeo la superficie expuesta: dominios, cuentas, servicios y credenciales filtradas.' },
      { title: 'Auditoría', body: 'Ejecuto análisis de malware, escaneos y pruebas controladas sobre lo autorizado.' },
      { title: 'Informe', body: 'Entrego informes con gráficas interactivas, analíticas y estadísticas.' },
      { title: 'Mitigación', body: 'Te guío en la corrección de hallazgos y el monitoreo continuo.' },
    ],
    deliverables: ['Informe de auditoría', 'Gráficas interactivas', 'Analíticas y estadísticas', 'Recomendaciones de mitigación'],
  },
  {
    slug: 'fulltesting',
    name: 'Full Testing',
    tagline: 'Probador de sistemas e interfaces',
    description:
      'Pruebo tu producto como usuario real: detecto bugs, evalúo UX/UI, mido calidad y busco mejoras de posicionamiento en buscadores.',
    icon: 'target',
    color: '#a3e635',
    group: 'security',
    flyer: flyerPath('fulltesting'),
    flyerAlt: 'Flyer del servicio de full testing',
    programs: ['QA', 'SEO'],
    includes: [
      'Beta field tester and taster',
      'UX/UI and bugs researcher',
      'Search Engine Optimization improvement',
      'Quality control inspector',
    ],
    process: [
      { title: 'Alcance', body: 'Definimos qué sistemas e interfaces se van a probar y con qué criterios.' },
      { title: 'Pruebas', body: 'Recorro el producto en dispositivos reales y registro cada hallazgo.' },
      { title: 'Reporte', body: 'Entrego bugs priorizados, hallazgos UX/UI y mejoras SEO.' },
    ],
    deliverables: ['Reporte de bugs priorizado', 'Hallazgos UX/UI', 'Recomendaciones SEO', 'Revisión de calidad'],
  },
  {
    slug: 'discord',
    name: 'Discord: Servidores y Bots',
    tagline: 'Creación y gestión, como tú quieras',
    description:
      'Creo y gestiono servidores y bots de Discord a tu medida: administración de bots, canales y roles, moderación, organización y staff.',
    icon: 'discord',
    color: '#5865F2',
    group: 'digital',
    flyer: flyerPath('discord'),
    flyerAlt: 'Flyer de creación y gestión de Discord',
    programs: ['Discord', 'Discord.js'],
    includes: [
      'Creación de servidores y bots',
      'Administración de bots, canales y roles',
      'Moderación, organización y staff',
      'Seguridad y permisos',
    ],
    process: [
      { title: 'Diseño del servidor', body: 'Definimos categorías, canales, roles y normas junto a ti.' },
      { title: 'Montaje y bots', body: 'Configuramos el servidor y los bots con sus automatizaciones.' },
      { title: 'Traspaso', body: 'Te dejo el staff capacitado y la documentación de moderación.' },
    ],
    deliverables: ['Servidor configurado', 'Bots y automatizaciones', 'Guía de moderación y staff'],
  },
  {
    slug: 'publisingmarketing',
    name: 'Publishing Marketing y Social Media',
    tagline: 'Gestión de redes y campañas',
    description:
      'Gestiono tu presencia en redes sociales: sugerencias de actualidad, contexto de público objetivo para patrocinios, publicación de contenido y gestión de mensajería, notificaciones y emails.',
    icon: 'globe',
    color: '#38bdf8',
    group: 'digital',
    flyer: flyerPath('publisingmarketing'),
    flyerAlt: 'Flyer de publishing marketing y social media',
    programs: ['YouTube', 'Instagram', 'TikTok', 'X'],
    includes: [
      'Gestión de sugerencias de la actualidad',
      'Contexto de público objetivo para patrocinar',
      'Publisher en redes sociales',
      'Gestión de mensajería, notificación y emails',
    ],
    process: [
      { title: 'Diagnóstico', body: 'Reviso tus redes, público y objetivos de comunicación.' },
      { title: 'Plan de contenido', body: 'Propongo calendario, temas de actualidad y oportunidades de patrocinio.' },
      { title: 'Gestión', body: 'Publico, atiendo mensajería y reporto resultados.' },
    ],
    deliverables: ['Calendario de contenido', 'Publicaciones gestionadas', 'Reporte de alcance', 'Atención de mensajería'],
  },
  {
    slug: 'minecraft',
    name: 'Minecraft',
    tagline: 'Servidores, mods y packs',
    description:
      'Monto y administro servidores de Minecraft para todas las versiones: servidores 24/7 con IP propia, modificaciones, resource packs, texture packs y skins.',
    icon: 'server',
    color: '#4ade80',
    group: 'experience',
    flyer: flyerPath('minecraft'),
    flyerAlt: 'Flyer de servicios de Minecraft',
    programs: ['Minecraft', 'Adobe Photoshop'],
    includes: [
      'Servidores 24/7 e IP propia',
      'Modificaciones (mods)',
      'Resource y texture packs',
      'Skins personalizadas',
    ],
    process: [
      { title: 'Modalidad', body: 'Definimos versión, modalidad de juego y mods del servidor.' },
      { title: 'Montaje', body: 'Despliego el servidor con IP propia y configuración optimizada.' },
      { title: 'Contenido', body: 'Creo o adapto packs, texturas y skins.' },
    ],
    deliverables: ['Servidor operativo 24/7', 'IP propia', 'Mods instalados', 'Packs y skins personalizados'],
  },
  {
    slug: 'eventostorneos',
    name: 'Eventos y Torneos',
    tagline: 'Competencias online y presenciales',
    description:
      'Organizo eventos y torneos de videojuegos online o presenciales: reglamento, brackets, difusión y premiación para el 1.º, 2.º y 3.º puesto.',
    icon: 'gamepad',
    color: '#a855f7',
    group: 'experience',
    flyer: flyerPath('eventostorneos'),
    flyerAlt: 'Flyer de organización de eventos y torneos',
    programs: ['Online', 'Presencial'],
    includes: [
      'Planificación y reglamento del torneo',
      'Brackets y gestión de participantes',
      'Difusión en redes y canales',
      'Premiación 1.º, 2.º y 3.º puesto',
      'Modalidad online o presencial',
    ],
    process: [
      { title: 'Formato', body: 'Definimos juego, modalidad, reglas y calendario del evento.' },
      { title: 'Convocatoria', body: 'Abro inscripciones y difundo en los canales del ecosistema.' },
      { title: 'Ejecución', body: 'Opero el evento, resuelvo incidencias y publico resultados.' },
    ],
    deliverables: ['Reglamento oficial', 'Brackets y resultados', 'Piezas de difusión', 'Premiación gestionada'],
  },
];

export function getCommission(slug: string): CommissionService | undefined {
  return COMMISSIONS.find((commission) => commission.slug === slug);
}

export function commissionsByGroup(group: CommissionGroupId): CommissionService[] {
  return COMMISSIONS.filter((commission) => commission.group === group);
}
