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
  headline: 'PORTFOLIO ANTONY V2.4',
  progress: 76,
  progressStartLabel: 'Motor multimedia CDN',
  progressEndLabel: 'Portfolio público',
  version: 'v2.4.0',
  deploy: 'OPERATIVO / SUPABASE',
  developer: 'CiszukoAntony',
  nodes: [
    { label: 'Motor Multimedia', desc: 'Audio y vídeo optimizados', status: 'done' },
    { label: 'Galerías CDN', desc: 'Assets oficiales servidos', status: 'next' },
    { label: 'CV Interactivo', desc: 'Trayectoria navegable', status: 'locked' },
    { label: 'Portfolio Público', desc: 'Apertura del escaparate', status: 'locked' },
  ],
  phases: [
    {
      id: 'patch-v2.4.0',
      name: 'PATCH V2.4.0',
      status: 'current',
      progress: 76,
      tasks: [
        { text: 'Resolución híbrida de assets multimedia en el CDN', done: true },
        { text: 'Protección XSS en galerías y reproductores', done: true },
        { text: 'Certificados con previews verificadas y tag de posesión', done: true },
        { text: 'Sincronización de logos y artwork restantes', done: false },
      ],
    },
    {
      id: 'patch-v2.5.0',
      name: 'PATCH V2.5.0',
      status: 'planned',
      progress: 0,
      tasks: [
        { text: 'Lightbox con zoom y descarga de certificados', done: false },
        { text: 'Modo claro accesible del portfolio', done: false },
        { text: 'Soporte multi-idioma de las fichas de proyecto', done: false },
        { text: 'Analíticas de visitas por proyecto', done: false },
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
