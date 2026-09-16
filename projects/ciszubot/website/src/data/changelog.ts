/**
 * Registro de cambios de Ciszubot.
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
    code: 'P-240-BT',
    title: 'Bot Unificado y Seguridad',
    description: 'Integración del sistema híbrido de comandos, corrección de vulnerabilidades en el bot de Discord, protección contra spam y mejoras en la estabilidad del servicio.',
    date: '2026-07-29',
    author: 'CiszukoAntony',
    types: ['build', 'sec', 'refactor'],
    likes: 0,
    details: [
      { text: 'Nuevo sistema de comandos slash con validación de permisos.', type: 'build' },
      { text: 'Protección contra spam y rate limiting implementado.', type: 'sec' },
      { text: 'Corrección de memory leaks en el proceso del bot.', type: 'bugfix' },
      { text: 'Sistema de logs estructurados para debugging.', type: 'refactor' },
      { text: 'Mejora en la reconexión automática ante caídas.', type: 'perf' }
    ]
  },
  {
    id: 'patch-v2.3.0',
    version: 'PATCH V2.3.0',
    code: 'P-230-CM',
    title: 'Comandos Mejorados',
    description: 'Expansión del arsenal de comandos, optimización de respuestas y corrección de bugs en interacciones complejas.',
    date: '2026-06-10',
    author: 'CiszukoAntony',
    types: ['hotfix', 'build', 'docs'],
    likes: 0,
    details: [
      { text: 'Nuevo comando /stats con métricas en tiempo real.', type: 'feat' },
      { text: 'Optimización de respuestas embed con buttons.', type: 'ui' },
      { text: 'Corrección de timeout en comandos de larga duración.', type: 'bugfix' },
      { text: 'Actualización de documentación de comandos.', type: 'docs' }
    ]
  },
  {
    id: 'patch-v2.2.0',
    version: 'PATCH V2.2.0',
    code: 'P-220-SV',
    title: 'Estabilidad del Servicio',
    description: 'Mejora de la estabilidad del bot, optimización de recursos y corrección de bugs en eventos de Discord.',
    date: '2026-05-01',
    author: 'CiszukoAntony',
    types: ['ux', 'ui', 'bugfix'],
    likes: 0,
    details: [
      { text: 'Implementación de health checks automáticos.', type: 'perf' },
      { text: 'Corrección de duplicación de eventos en shards.', type: 'bugfix' },
      { text: 'Mejora en la presentación de mensajes interactivos.', type: 'ui' },
      { text: 'Optimización de memoria en cache de guilds.', type: 'perf' }
    ]
  },
  {
    id: 'beta-v2.0.1',
    version: 'BETA V2.0.1',
    code: 'B-201-AR',
    title: 'Arquitectura del Bot',
    description: 'Migración a Discord.js v14, implementación de TypeScript estricto y establecimiento de la arquitectura base del bot.',
    date: '2024-04-10',
    author: 'CiszukoAntony',
    types: ['build', 'refactor', 'sec'],
    likes: 0,
    details: [
      { text: 'Migración completa a Discord.js v14.', type: 'build' },
      { text: 'Implementación de TypeScript estricto.', type: 'refactor' },
      { text: 'Configuración de ESLint y Prettier.', type: 'build' },
      { text: 'Establecimiento de estructura de comandos y eventos.', type: 'chore' }
    ]
  }
];

/**
 * Estado de despliegue: alimenta la barra de progreso, las tarjetas de estado
 * y el diagrama de "Próximos Nodos" del encabezado.
 */
export const CHANGELOG_STATUS: ChangelogStatus = {
  headline: 'CISZUBOT V2.4',
  progress: 68,
  progressStartLabel: 'Bot unificado y seguro',
  progressEndLabel: 'Bot público',
  version: 'v2.4.0',
  deploy: 'OPERATIVO / DISCORD',
  developer: 'CiszukoAntony',
  nodes: [
    { label: 'Comandos Slash', desc: 'Permisos validados', status: 'done' },
    { label: 'Anti-spam Activo', desc: 'Rate limiting por guild', status: 'next' },
    { label: 'Dashboard Web', desc: 'Configuración desde la web', status: 'locked' },
    { label: 'Bot Público', desc: 'Apertura a otros servidores', status: 'locked' },
  ],
  phases: [
    {
      id: 'patch-v2.4.0',
      name: 'PATCH V2.4.0',
      status: 'current',
      progress: 68,
      tasks: [
        { text: 'Comandos slash con validación de permisos', done: true },
        { text: 'Protección anti-spam y rate limiting', done: true },
        { text: 'Logs estructurados para depuración', done: true },
        { text: 'Reconexión automática ante caídas de shards', done: false },
      ],
    },
    {
      id: 'patch-v2.5.0',
      name: 'PATCH V2.5.0',
      status: 'planned',
      progress: 0,
      tasks: [
        { text: 'Sistema de economía del servidor', done: false },
        { text: 'Niveles y leaderboard por guild', done: false },
        { text: 'Panel de configuración web por servidor', done: false },
        { text: 'Publicación en directorios públicos de bots', done: false },
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
