import { assetResolver } from '@ciszunetwork/cdn';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BookOpen,
  Bot,
  Boxes,
  Bug,
  FileText,
  Gamepad2,
  Layers,
  LayoutGrid,
  Palette,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ACCENT_STYLES, type EcosystemAccent } from '@/data/ecosystem';
import { CISZU_NETWORK } from '@/config/site';

export interface ServiceProcessStep {
  title: string;
  body: string;
}

export interface Service {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: EcosystemAccent;
  flyer: string;
  flyerAlt: string;
  programs: string[];
  includes: string[];
  process: ServiceProcessStep[];
  deliverables: string[];
}

export const PRICE_LABEL = 'Consultar';
export const PRICE_TAG = 'Negociable';
export const PRICE_NOTE =
  'Los precios son negociables: cada cotización se ajusta al alcance, la complejidad y los tiempos de tu proyecto. Escríbenos y la conversamos.';

export const FLYER_WIDTH = 1414;
export const FLYER_HEIGHT = 2000;
export const FLYER_RATIO = `${FLYER_WIDTH} / ${FLYER_HEIGHT}`;

function flyerPath(slug: string): string {
  return `projects/ciszu/content/flyers/images/ciszu_flayer_vertical_${slug}.webp`;
}

export function whatsappUrl(message = 'Hola Ciszu Network, quiero información sobre sus servicios.'): string {
  const phone = CISZU_NETWORK.phone.replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function serviceWhatsappUrl(service: Service): string {
  return whatsappUrl(`Hola Ciszu Network, quiero información sobre el servicio de ${service.name}.`);
}

export const SERVICES_WHATSAPP_URL = whatsappUrl();

export const SERVICES: Service[] = [
  {
    slug: 'branding',
    name: 'Branding y Rebranding',
    tagline: 'Identidad visual profesional',
    description:
      'Diseñamos o renovamos la identidad visual de tu negocio, campaña o empresa: logotipos, imagotipos, isologos e isotipos, más la marca completa lista para web, impresión y redes.',
    icon: Palette,
    accent: 'brand',
    flyer: assetResolver.resolve(flyerPath('branding')),
    flyerAlt: 'Flyer de branding y rebranding de Ciszu Network',
    programs: ['Adobe Illustrator', 'Adobe Photoshop'],
    includes: [
      'Logotipo, imagotipo, isologo e isotipo',
      'Versión principal y variantes de contraste',
      'Paleta de color y tipografías de marca',
      'Aplicación en web, print y redes sociales',
    ],
    process: [
      { title: 'Brief y referencias', body: 'Levantamos la información del negocio, el público y las referencias visuales que definen el rumbo.' },
      { title: 'Propuesta de conceptos', body: 'Presentamos propuestas de identidad con su justificación y muestras de aplicación.' },
      { title: 'Refinamiento', body: 'Ajustamos la propuesta elegida hasta la versión final aprobada.' },
      { title: 'Entrega de archivos', body: 'Entregamos fuentes, vectores y exportaciones listas para cada uso.' },
    ],
    deliverables: ['Logo vectorial (SVG)', 'Exportaciones PNG/WebP', 'Variantes de color y contraste', 'Guía básica de uso'],
  },
  {
    slug: 'ciberseguridad',
    name: 'Ciberseguridad',
    tagline: 'Protección, auditoría y monitoreo',
    description:
      'Auditamos y protegemos tu infraestructura digital con herramientas ofensivas y defensivas: OSINT, malware auditing, monitoreo y rastreo de credenciales, con informes claros y accionables.',
    icon: ShieldCheck,
    accent: 'green',
    flyer: assetResolver.resolve(flyerPath('ciberseguridad')),
    flyerAlt: 'Flyer de ciberseguridad de Ciszu Network',
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
      { title: 'Reconocimiento', body: 'Mapeamos la superficie expuesta: dominios, cuentas, servicios y credenciales filtradas.' },
      { title: 'Auditoría', body: 'Ejecutamos análisis de malware, escaneos y pruebas controladas sobre lo autorizado.' },
      { title: 'Informe', body: 'Entregamos informes estilo reporte con gráficas interactivas, analíticas y estadísticas.' },
      { title: 'Mitigación', body: 'Te guiamos en la corrección de hallazgos y el monitoreo continuo.' },
    ],
    deliverables: ['Informe de auditoría', 'Gráficas interactivas', 'Analíticas y estadísticas', 'Recomendaciones de mitigación'],
  },
  {
    slug: 'curriculum',
    name: 'Creación de Currículums',
    tagline: 'CVs con diseño personalizable',
    description:
      'Creamos currículums con diseño totalmente personalizable: colores de énfasis, tipografías de familias de texto y más, listos para imprimir o enviar en digital.',
    icon: FileText,
    accent: 'cyan',
    flyer: assetResolver.resolve(flyerPath('curriculum')),
    flyerAlt: 'Flyer de creación de currículums de Ciszu Network',
    programs: ['Google Suite', 'Microsoft Office', 'Adobe PDF'],
    includes: [
      'Diseño totalmente personalizable',
      'Colores de énfasis y jerarquía visual',
      'Tipografías de familias de texto',
      'Versión PDF lista para enviar',
    ],
    process: [
      { title: 'Datos y objetivo', body: 'Recopilamos tu experiencia, logros y el puesto o sector al que apuntas.' },
      { title: 'Propuesta de diseño', body: 'Definimos estructura, énfasis y estilo según el perfil.' },
      { title: 'Ajustes finales', body: 'Corregimos y pulimos contenido y diseño contigo.' },
    ],
    deliverables: ['CV en PDF de alta calidad', 'Versión editable', 'Adaptación a una oferta específica'],
  },
  {
    slug: 'discord',
    name: 'Discord: Servidores y Bots',
    tagline: 'Creación y gestión, como tú quieras',
    description:
      'Creamos y gestionamos servidores y bots de Discord a tu medida: administración de bots, canales y roles, moderación, organización y staff.',
    icon: Bot,
    accent: 'discord',
    flyer: assetResolver.resolve(flyerPath('discord')),
    flyerAlt: 'Flyer de creación y gestión de Discord de Ciszu Network',
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
      { title: 'Traspaso', body: 'Te dejamos el staff capacitado y la documentación de moderación.' },
    ],
    deliverables: ['Servidor configurado', 'Bots y automatizaciones', 'Guía de moderación y staff'],
  },
  {
    slug: 'disenografico',
    name: 'Diseño Gráfico',
    tagline: 'Vectoriza, grafica y digitaliza tu esfuerzo',
    description:
      'Convertimos tu esfuerzo en piezas gráficas listas para presentar: presentaciones, gráficas, diapositivas, infografías, estadísticas y flyers.',
    icon: LayoutGrid,
    accent: 'pink',
    flyer: assetResolver.resolve(flyerPath('disenografico')),
    flyerAlt: 'Flyer de diseño gráfico de Ciszu Network',
    programs: ['Adobe Illustrator', 'Adobe After Effects', 'Adobe Photoshop', 'Adobe Lightroom'],
    includes: [
      'Presentaciones y diapositivas',
      'Gráficas y estadísticas',
      'Infografías',
      'Flyers y piezas promocionales',
      'Vectorización de imágenes',
    ],
    process: [
      { title: 'Contenido', body: 'Recibimos la información y definimos el objetivo de la pieza.' },
      { title: 'Diseño', body: 'Maquetamos la pieza con la identidad visual correspondiente.' },
      { title: 'Entrega', body: 'Exportamos en los formatos que necesites (web, print, redes).' },
    ],
    deliverables: ['Pieza final en PNG/PDF', 'Fuente vectorial', 'Exportaciones para redes'],
  },
  {
    slug: 'eventostorneos',
    name: 'Eventos y Torneos',
    tagline: 'Competencias online y presenciales',
    description:
      'Organizamos eventos y torneos de videojuegos online o presenciales: reglamento, brackets, difusión y premiación para el 1.º, 2.º y 3.º puesto.',
    icon: Gamepad2,
    accent: 'purple',
    flyer: assetResolver.resolve(flyerPath('eventostorneos')),
    flyerAlt: 'Flyer de organización de eventos y torneos de Ciszu Network',
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
      { title: 'Convocatoria', body: 'Abrimos inscripciones y difundimos en los canales del ecosistema.' },
      { title: 'Ejecución', body: 'Operamos el evento, resolvemos incidencias y publicamos resultados.' },
    ],
    deliverables: ['Reglamento oficial', 'Brackets y resultados', 'Piezas de difusión', 'Premiación gestionada'],
  },
  {
    slug: 'fulltesting',
    name: 'Full Testing',
    tagline: 'Probador de sistemas e interfaces',
    description:
      'Probamos tu producto como usuario real: detectamos bugs, evaluamos UX/UI, medimos calidad y buscamos mejoras de posicionamiento en buscadores.',
    icon: Bug,
    accent: 'green',
    flyer: assetResolver.resolve(flyerPath('fulltesting')),
    flyerAlt: 'Flyer del servicio de full testing de Ciszu Network',
    programs: ['QA', 'SEO'],
    includes: [
      'Beta field tester and taster',
      'UX/UI and bugs researcher',
      'Search Engine Optimization improvement',
      'Quality control inspector',
    ],
    process: [
      { title: 'Alcance', body: 'Definimos qué sistemas e interfaces se van a probar y con qué criterios.' },
      { title: 'Pruebas', body: 'Recorremos el producto en dispositivos reales y registramos cada hallazgo.' },
      { title: 'Reporte', body: 'Entregamos bugs priorizados, hallazgos UX/UI y mejoras SEO.' },
    ],
    deliverables: ['Reporte de bugs priorizado', 'Hallazgos UX/UI', 'Recomendaciones SEO', 'Revisión de calidad'],
  },
  {
    slug: 'ilustracion',
    name: 'Ilustración, Dibujos y Arte',
    tagline: 'Comisiones abiertas a diversos estilos',
    description:
      'Ilustración digital y arte por comisión: trabajamos diversos estilos, desde el boceto hasta el acabado final, para personajes, campañas y marcas.',
    icon: Sparkles,
    accent: 'pink',
    flyer: assetResolver.resolve(flyerPath('ilustracion')),
    flyerAlt: 'Flyer de ilustración, dibujos y arte de Ciszu Network',
    programs: ['Adobe Illustrator', 'Adobe Photoshop', 'Pixel art'],
    includes: [
      'Ilustración de personajes',
      'Arte para campañas y marcas',
      'Diversos estilos y acabados',
      'Pixel art',
    ],
    process: [
      { title: 'Concepto', body: 'Definimos el estilo, la composición y las referencias de la comisión.' },
      { title: 'Boceto', body: 'Presentamos el boceto para aprobación antes de dar color.' },
      { title: 'Acabado', body: 'Aplicamos color, luces y detalle final; entregamos en alta resolución.' },
    ],
    deliverables: ['Ilustración final en alta resolución', 'Versión para redes', 'Archivo fuente por capas'],
  },
  {
    slug: 'minecraft',
    name: 'Minecraft',
    tagline: 'Servidores, mods y packs',
    description:
      'Montamos y administramos servidores de Minecraft para todas las versiones: servidores 24/7 con IP propia, modificaciones, resource packs, texture packs y skins.',
    icon: Boxes,
    accent: 'green',
    flyer: assetResolver.resolve(flyerPath('minecraft')),
    flyerAlt: 'Flyer de servicios de Minecraft de Ciszu Network',
    programs: ['Minecraft', 'Adobe Photoshop'],
    includes: [
      'Servidores 24/7 e IP propia',
      'Modificaciones (mods)',
      'Resource y texture packs',
      'Skins personalizadas',
    ],
    process: [
      { title: 'Modalidad', body: 'Definimos versión, modalidad de juego y mods del servidor.' },
      { title: 'Montaje', body: 'Desplegamos el servidor con IP propia y configuración optimizada.' },
      { title: 'Contenido', body: 'Creamos o adaptamos packs, texturas y skins.' },
    ],
    deliverables: ['Servidor operativo 24/7', 'IP propia', 'Mods instalados', 'Packs y skins personalizados'],
  },
  {
    slug: 'ofimatica',
    name: 'Ofimática y Documentación',
    tagline: 'Documentos, presentaciones e investigaciones',
    description:
      'Redactamos y damos formato profesional a documentos de texto, investigaciones, presentaciones, diapositivas y tablas de datos para tu negocio o estudio.',
    icon: BookOpen,
    accent: 'cyan',
    flyer: assetResolver.resolve(flyerPath('ofimatica')),
    flyerAlt: 'Flyer de ofimática y documentación de Ciszu Network',
    programs: ['Google Suite', 'Microsoft Office', 'Adobe Acrobat', 'PDF'],
    includes: [
      'Documentos de texto e investigaciones',
      'Presentaciones y diapositivas',
      'Tablas de datos, valores, columnas y filas',
      'Formato profesional y exportación a PDF',
    ],
    process: [
      { title: 'Contenido', body: 'Recibimos el material y definimos la estructura del documento.' },
      { title: 'Redacción y formato', body: 'Redactamos, ordenamos y damos formato con estilos consistentes.' },
      { title: 'Entrega', body: 'Entregamos la versión editable y el PDF final.' },
    ],
    deliverables: ['Documento editable', 'PDF final', 'Tablas y gráficas de apoyo'],
  },
  {
    slug: 'photoeditor',
    name: 'Edición de Imagen y Fotografías',
    tagline: 'Retoque y edición profesional',
    description:
      'Editamos tus imágenes y fotografías con flujo profesional: edición RAW, gestión de color, máscaras y acabados de estudio, incluidas miniaturas.',
    icon: Layers,
    accent: 'purple',
    flyer: assetResolver.resolve(flyerPath('photoeditor')),
    flyerAlt: 'Flyer de edición de imagen y fotografías de Ciszu Network',
    programs: ['Adobe Lightroom', 'Adobe Photoshop', 'Adobe Illustrator'],
    includes: [
      'Edición RAW',
      'Colores HSV, RGB y CMYK',
      'Efectos FX, fusiones y contrastes',
      'Recorte, transformación, rotación y deformación',
      'Quita-fondos, máscaras, contornos y sombras',
      'Brillo, difuminados, degradados y resplandores',
      'Saturación, gamma, sepias y viñetas',
      'Miniaturas',
    ],
    process: [
      { title: 'Recepción', body: 'Recibimos las imágenes originales y el objetivo de cada pieza.' },
      { title: 'Edición', body: 'Aplicamos color, retoque y composición según el estilo pedido.' },
      { title: 'Entrega', body: 'Exportamos en la resolución y formato requeridos.' },
    ],
    deliverables: ['Imágenes editadas en alta resolución', 'Versiones para web/redes', 'Miniaturas listas para publicar'],
  },
  {
    slug: 'publisingmarketing',
    name: 'Publishing Marketing y Social Media',
    tagline: 'Gestión de redes y campañas',
    description:
      'Gestionamos tu presencia en redes sociales: sugerencias de actualidad, contexto de público objetivo para patrocinios, publicación de contenido y gestión de mensajería, notificaciones y emails.',
    icon: TrendingUp,
    accent: 'cyan',
    flyer: assetResolver.resolve(flyerPath('publisingmarketing')),
    flyerAlt: 'Flyer de publishing marketing y social network manager de Ciszu Network',
    programs: ['YouTube', 'Instagram', 'TikTok', 'X'],
    includes: [
      'Gestión de sugerencias de la actualidad',
      'Contexto de público objetivo para patrocinar',
      'Publisher en redes sociales',
      'Gestión de mensajería, notificación y emails',
    ],
    process: [
      { title: 'Diagnóstico', body: 'Revisamos tus redes, público y objetivos de comunicación.' },
      { title: 'Plan de contenido', body: 'Proponemos calendario, temas de actualidad y oportunidades de patrocinio.' },
      { title: 'Gestión', body: 'Publicamos, atendemos mensajería y reportamos resultados.' },
    ],
    deliverables: ['Calendario de contenido', 'Publicaciones gestionadas', 'Reporte de alcance', 'Atención de mensajería'],
  },
  {
    slug: 'videoeditor',
    name: 'Edición de Video',
    tagline: 'Corto, medio y largo metraje',
    description:
      'Editamos videos de corto, medio y largo metraje con acabado profesional: transiciones, subtítulos, animaciones, efectos y postproducción completa.',
    icon: Activity,
    accent: 'pink',
    flyer: assetResolver.resolve(flyerPath('videoeditor')),
    flyerAlt: 'Flyer de edición de videos de Ciszu Network',
    programs: ['Adobe Premiere Pro', 'Adobe After Effects', 'DaVinci Resolve'],
    includes: [
      'Recortes y transiciones',
      'Autosubtítulos',
      'SFX, FX y componentes',
      'Textos con estilos y animaciones',
      'Rotaciones y transformaciones',
      'Zoom, contornos y figuras',
      'Conversión de formatos y compresión de archivos',
      'Degradados, desenfoques, opacidades y fusiones',
    ],
    process: [
      { title: 'Material', body: 'Recibimos el material bruto y la referencia del resultado esperado.' },
      { title: 'Edición', body: 'Montamos, animamos y aplicamos efectos y subtítulos.' },
      { title: 'Entrega', body: 'Exportamos en el formato y la resolución acordados.' },
    ],
    deliverables: ['Video final exportado', 'Subtítulos', 'Versión para redes verticales', 'Archivo de proyecto'],
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

export const SERVICE_SLUGS: string[] = SERVICES.map((service) => service.slug);
