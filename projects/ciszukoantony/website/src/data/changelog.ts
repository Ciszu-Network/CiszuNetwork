/**
 * Registro de cambios del portfolio de Ciszuko Antony.
 *
 * Los tipos, el estado de despliegue y la lógica de filtrado viven en el
 * paquete compartido `@ciszunetwork/utils/changelog` para que las 4 webs
 * (ciszu, ciszukoantony, ciszubot, muzicmania) usen exactamente el mismo
 * contrato. Aquí solo se declaran los datos del proyecto.
 */
import type {
  ChangelogItem,
  ChangelogStatus,
  ChangelogType,
} from '@ciszunetwork/utils/changelog';

export type {
  ChangelogDetail,
  ChangelogItem,
  ChangelogNode,
  ChangelogNodeStatus,
  ChangelogPhase,
  ChangelogPhaseStatus,
  ChangelogStatus,
  ChangelogType,
} from '@ciszunetwork/utils/changelog';

export const CHANGELOG_DATA: ChangelogItem[] = [
  {
    id: 'patch-v2.6.0',
    version: 'PATCH V2.6.0',
    code: 'P-260-CL',
    title: 'Registro de Cambios con Estado y Página Interna',
    description: 'El changelog deja de ser una lista: suma hoja de ruta, glosario, protocolos de documentación, filtros funcionales, likes y una página interna por versión con información enlazada.',
    date: '2026-09-16',
    author: 'CiszukoAntony',
    types: ['feat', 'ux', 'docs'],
    likes: 0,
    details: [
      { text: 'Barra de progreso con el estado actual y diagrama de Próximos Nodos (hecho / actual / bloqueado).', type: 'feat' },
      { text: 'Página interna /changelog/<slug> por versión, con bitácora completa e info enlazada por etiquetas.', type: 'feat' },
      { text: 'El botón DETALLES abre la página real de la entrada (antes era un aviso sin acción).', type: 'ux' },
      { text: 'Likes persistidos por dispositivo y guardados para usuarios autenticados.', type: 'ux' },
      { text: 'Filtros reparados: chips clicables, contador Mostrando X–Y de Z, limpiar todo y búsqueda por versión, código o slug.', type: 'ux' },
      { text: 'Hoja de ruta, glosario y aviso interrogativo de protocolos de documentación antes de QuickDocks.', type: 'docs' },
    ],
  },
  {
    id: 'patch-v2.5.5',
    version: 'PATCH V2.5.5',
    code: 'P-255-CL',
    title: 'Changelogs Globales desde el DevConsole',
    description: 'Las entradas pueden publicarse en vivo desde la consola de desarrollo, con kill switch, entregas por web y previsualización local antes de tocar producción.',
    date: '2026-09-16',
    author: 'CiszukoAntony',
    types: ['add', 'build', 'docs'],
    likes: 0,
    details: [
      { text: 'Tablas global_changelogs, global_changelogs_settings y global_changelog_deliveries con RLS y kill switch propio.', type: 'add' },
      { text: 'Script scripts/changelogs.js: crear, editar, listar, resumir, eliminar y esperar la entrega por web.', type: 'build' },
      { text: 'Nueva sección CHANGELOGS en el devcon con alcances LOCAL, GLOBAL e HÍBRIDO y casillas para elegir webs.', type: 'add' },
      { text: 'Modo local en JSON (changelogs_debug.json) leído por /api/changelogs/debug solo en desarrollo.', type: 'build' },
      { text: 'Catálogo de 32 iconos SVG para el preview de cada entrada, compartido por las 4 webs.', type: 'docs' },
    ],
  },
  {
    id: 'patch-v2.5.4',
    version: 'PATCH V2.5.4',
    code: 'P-254-FL',
    title: 'Flyers Optimizados y /downloads Reparado',
    description: 'Los flyers se regeneran en WebP/AVIF y se corrige el 404 de /downloads en producción: un .vercelignore demasiado amplio excluía la página del build.',
    date: '2026-09-15',
    author: 'CiszukoAntony',
    types: ['perf', 'bugfix', 'build'],
    likes: 0,
    details: [
      { text: '13 flyers regenerados en WebP/AVIF y renombrado ASCII (diseñografico → disenografico) por el límite de Storage.', type: 'perf' },
      { text: 'Corregido el 404 de /downloads: .vercelignore excluía src/app/downloads/ y Next.js nunca compilaba la ruta.', type: 'bugfix' },
      { text: 'La misma regla amplia se retiró del .vercelignore raíz del monorepo.', type: 'build' },
    ],
  },
  {
    id: 'patch-v2.5.3',
    version: 'PATCH V2.5.3',
    code: 'P-253-CE',
    title: 'Certificados Verificables con Tag de Posesión',
    description: 'Todos los documentos quedan respaldados por FRANCISCO ANTONIO GARCIA MENOLASCINA, con previews que muestran el texto real, logos oficiales y filtros personalizados.',
    date: '2026-09-14',
    author: 'CiszukoAntony',
    types: ['feat', 'ux', 'build'],
    likes: 0,
    details: [
      { text: 'Tag de posesión Owned by FRANCISCO ANTONIO GARCIA MENOLASCINA en cada tarjeta y en el modal.', type: 'feat' },
      { text: 'Previews regeneradas con las fuentes del PDF embebidas: antes solo se dibujaba el fondo y el texto se perdía.', type: 'build' },
      { text: 'Logos oficiales en SVG (Cisco, IBM, Microsoft, HP) servidos desde el CDN, sin emojis ni rutas inventadas.', type: 'feat' },
      { text: 'Nombres de preview ASCII-safe: Supabase Storage rechazaba claves con acentos.', type: 'bugfix' },
      { text: 'Filtros renovados con dropdowns por categoría y proveedor, selector de orden y chips de filtros activos.', type: 'ux' },
    ],
  },
  {
    id: 'patch-v2.5.2',
    version: 'PATCH V2.5.2',
    code: 'P-252-NA',
    title: 'Navegación Unificada en las Cuatro Webs',
    description: 'Navbars con el patrón de Ciszubot, sección Information al final como dropdown con página propia y Turnstile más rápido.',
    date: '2026-09-14',
    author: 'CiszukoAntony',
    types: ['ui', 'ux', 'perf'],
    likes: 0,
    details: [
      { text: 'Iconos con etiqueta bajo el cursor y dropdown Information al final del navbar.', type: 'ui' },
      { text: 'Nuevas páginas /information sin navbar duplicado ni props incompatibles con Next.js 15.', type: 'ui' },
      { text: 'Turnstile optimizado: no recarga api.js en los reintentos y usa un helper compartido con AbortController.', type: 'perf' },
    ],
  },
  {
    id: 'patch-v2.5.1',
    version: 'PATCH V2.5.1',
    code: 'P-251-RT',
    title: 'Rutas en Inglés y Entregas sin 401',
    description: 'Todas las rutas pasan a inglés (/downloads, /terms, /privacy) y se corrigen los 401 de la telemetría de entregas.',
    date: '2026-09-14',
    author: 'CiszukoAntony',
    types: ['refactor', 'sec', 'fix'],
    likes: 0,
    details: [
      { text: 'Rutas unificadas en inglés en las 4 webs con redirects permanentes desde las antiguas.', type: 'refactor' },
      { text: 'RLS y grants de las tablas de entregas corregidos: 401 Unauthorized resuelto.', type: 'sec' },
      { text: 'Retirado el redirect /downloads que impedía servir la página real.', type: 'fix' },
    ],
  },
  {
    id: 'patch-v2.5.0',
    version: 'PATCH V2.5.0',
    code: 'P-250-AC',
    title: 'Sección AC3/C3L y Página de Donación',
    description: 'Se publica la sección educativa AC3/C3L con kit gratuito y manifiesto, y se estrena la página de donación del portfolio.',
    date: '2026-09-12',
    author: 'CiszukoAntony',
    types: ['add', 'docs', 'ui'],
    likes: 0,
    details: [
      { text: 'Sección AC3/C3L con dogfooding, kit gratuito y manifiesto documentado.', type: 'add' },
      { text: 'Página de donación con el icono de trofeo corregido y enlaces en navbar y footer.', type: 'add' },
      { text: 'Estandarizada la sección Project provided by CiszuNetwork en las 4 webs.', type: 'ui' },
    ],
  },
  {
    id: 'patch-v2.4.0',
    version: 'PATCH V2.4.0',
    code: 'P-240-ME',
    title: 'Motor Multimedia y Estabilidad',
    description: 'Optimización del motor de audio y video en el portfolio, corrección de vulnerabilidades XSS en galerías y sincronización de assets multimedia con el CDN unificado.',
    date: '2026-07-29',
    author: 'CiszukoAntony',
    types: ['build', 'sec', 'refactor'],
    likes: 0,
    details: [
      { text: 'Integración del paquete @ciszunetwork/cdn para resolución híbrida de assets multimedia.', type: 'build' },
      { text: 'Protección XSS implementada en galerías de imágenes y reproductores de video.', type: 'sec' },
      { text: 'Corrección de vulnerabilidades Security Advisor en Supabase.', type: 'sec' },
      { text: 'Sincronización de logos, banners y artwork con el CDN.', type: 'refactor' },
      { text: 'Optimización de carga de imágenes con lazy loading nativo.', type: 'perf' },
    ]
  },
  {
    id: 'patch-v2.3.0',
    version: 'PATCH V2.3.0',
    code: 'P-230-PO',
    title: 'Portfolio Profesional',
    description: 'Rediseño completo de la sección de portfolio, integración de galerías dinámicas y mejora de la experiencia de visualización de proyectos.',
    date: '2026-06-10',
    author: 'CiszukoAntony',
    types: ['hotfix', 'build', 'docs'],
    likes: 0,
    details: [
      { text: 'Nueva estructura de portfolio con categorías: logos, medios, música.', type: 'build' },
      { text: 'Galería de imágenes con lightbox y navegación por teclado.', type: 'ui' },
      { text: 'Integración de reproductores de audio embebidos.', type: 'feat' },
      { text: 'Actualización de documentación de assets multimedia.', type: 'docs' }
    ]
  },
  {
    id: 'patch-v2.2.0',
    version: 'PATCH V2.2.0',
    code: 'P-220-UX',
    title: 'Experiencia Visual',
    description: 'Mejora de la experiencia de usuario en la navegación del portfolio, optimización de animaciones y corrección de bugs visuales.',
    date: '2026-05-01',
    author: 'CiszukoAntony',
    types: ['ux', 'ui', 'bugfix'],
    likes: 0,
    details: [
      { text: 'Animaciones de entrada suaves para proyectos del portfolio.', type: 'ux' },
      { text: 'Corrección de overflow en tarjetas de proyecto en móvil.', type: 'bugfix' },
      { text: 'Mejora del contraste en modo oscuro para texto sobre imágenes.', type: 'ui' },
      { text: 'Optimización de animaciones con will-change y transform.', type: 'perf' }
    ]
  },
  {
    id: 'beta-v2.0.1',
    version: 'BETA V2.0.1',
    code: 'B-201-AR',
    title: 'Arquitectura del Portfolio',
    description: 'Migración a Next.js 15, implementación de Tailwind 4 y establecimiento de la arquitectura base del portfolio personal.',
    date: '2024-04-10',
    author: 'CiszukoAntony',
    types: ['build', 'refactor', 'sec'],
    likes: 0,
    details: [
      { text: 'Migración completa a Next.js 15 con App Router.', type: 'build' },
      { text: 'Implementación de Tailwind 4 con tema neón personalizado.', type: 'refactor' },
      { text: 'Configuración de ESLint y TypeScript estricto.', type: 'build' },
      { text: 'Establecimiento de estructura de carpetas y convenciones.', type: 'chore' }
    ]
  }
];

/**
 * Estado de despliegue: alimenta la barra de progreso, las tarjetas de estado
 * y el diagrama de "Próximos Nodos" del encabezado.
 */
export const CHANGELOG_STATUS: ChangelogStatus = {
  headline: 'PORTFOLIO ANTONY V2.6',
  progress: 91,
  progressStartLabel: 'Certificados verificables',
  progressEndLabel: 'Portfolio público',
  version: 'v2.6.0',
  deploy: 'OPERATIVO / SUPABASE',
  developer: 'CiszukoAntony',
  nodes: [
    { label: 'Certificados Verificables', desc: 'Previews con texto y tag de posesión', status: 'done' },
    { label: 'Registro con Estado', desc: 'Roadmap, glosario y página interna', status: 'done' },
    { label: 'Fichas Multi-idioma', desc: 'Portfolio navegable por proyecto', status: 'next' },
    { label: 'Portfolio Público', desc: 'Apertura del escaparate', status: 'locked' },
  ],
  phases: [
    {
      id: 'patch-v2.6.0',
      name: 'PATCH V2.6.0',
      status: 'current',
      progress: 91,
      tasks: [
        { text: 'Certificados con previews verificadas y tag de posesión', done: true },
        { text: 'Registro de cambios con estado, roadmap y página interna', done: true },
        { text: 'Changelogs publicables desde el devcon (local, global e híbrido)', done: true },
        { text: 'Lightbox con zoom y descarga de certificados', done: false },
      ],
    },
    {
      id: 'patch-v2.7.0',
      name: 'PATCH V2.7.0',
      status: 'planned',
      progress: 0,
      tasks: [
        { text: 'Lightbox con zoom y descarga directa de cada certificado', done: false },
        { text: 'Soporte multi-idioma de las fichas de proyecto', done: false },
        { text: 'Analíticas de visitas por proyecto', done: false },
        { text: 'Modo claro accesible del portfolio', done: false },
      ],
    },
  ],
};

/** Glosario canónico de etiquetas del registro de cambios. */
export const CHANGELOG_GLOSSARY: { type: ChangelogType; desc: string }[] = [
  { type: 'add', desc: 'Inyección de nuevos módulos, funciones o activos.' },
  { type: 'hotfix', desc: 'Intervención de emergencia para errores críticos.' },
  { type: 'rework', desc: 'Reestructuración profunda de mecánicas existentes.' },
  { type: 'bugfix', desc: 'Erradicación de anomalías y comportamientos erróneos.' },
  { type: 'perf', desc: 'Optimización de recursos y velocidad de respuesta.' },
  { type: 'ux', desc: 'Mejoras en el flujo de interacción y accesibilidad.' },
  { type: 'sec', desc: 'Fortalecimiento de protocolos de seguridad.' },
  { type: 'refactor', desc: 'Limpieza y reestructuración de la base de código.' },
  { type: 'build', desc: 'Mejoras en el sistema de compilación y despliegue.' },
];
