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
    id: 'patch-v2.5.0',
    version: 'PATCH V2.5.0',
    code: 'P-250-CL',
    title: 'Registro de Cambios con Estado y Página Interna',
    description: 'El changelog del bot suma hoja de ruta, glosario, protocolos de documentación, filtros funcionales, likes y una página interna por versión.',
    date: '2026-09-16',
    author: 'CiszukoAntony',
    types: ['feat', 'ux', 'docs'],
    likes: 0,
    details: [
      { text: 'Barra de progreso con el estado actual y diagrama de Próximos Nodos (hecho / actual / bloqueado).', type: 'feat' },
      { text: 'Página interna /changelog/<slug> por versión, con bitácora completa e info enlazada por etiquetas.', type: 'feat' },
      { text: 'Filtros reparados: chips clicables, contador Mostrando X–Y de Z, limpiar todo y búsqueda por versión, código o slug.', type: 'ux' },
      { text: 'El botón DETALLES abre la página real de la entrada y los likes se guardan por dispositivo.', type: 'ux' },
      { text: 'Hoja de ruta, glosario y aviso interrogativo de protocolos antes de QuickDocks.', type: 'docs' },
    ],
  },
  {
    id: 'patch-v2.4.5',
    version: 'PATCH V2.4.5',
    code: 'P-245-CL',
    title: 'Changelogs Globales desde el DevConsole',
    description: 'Las entradas del registro pueden publicarse en vivo desde la consola de desarrollo, con kill switch y confirmación de entrega por web.',
    date: '2026-09-16',
    author: 'CiszukoAntony',
    types: ['add', 'build', 'docs'],
    likes: 0,
    details: [
      { text: 'Tablas global_changelogs, global_changelogs_settings y global_changelog_deliveries con RLS y kill switch.', type: 'add' },
      { text: 'Sección CHANGELOGS en el devcon (LOCAL / GLOBAL / HÍBRIDO) con casillas por web y resumen de entregas.', type: 'add' },
      { text: 'Las entradas publicadas se fusionan con las del código al vuelo en las 4 webs.', type: 'build' },
      { text: 'Catálogo de 32 iconos SVG para el preview de cada entrada.', type: 'docs' },
    ],
  },
  {
    id: 'patch-v2.4.4',
    version: 'PATCH V2.4.4',
    code: 'P-244-2F',
    title: 'Acceso Reforzado: Discord OAuth y 2FA',
    description: 'Inicio de sesión con Discord, verificación en dos pasos (TOTP) y gestión completa del estado de seguridad de la cuenta.',
    date: '2026-09-14',
    author: 'CiszukoAntony',
    types: ['sec', 'add', 'feat'],
    likes: 0,
    details: [
      { text: 'Callback de OAuth de Discord para vincular la cuenta del servidor.', type: 'sec' },
      { text: 'Rutas de 2FA: generar secreto, activar, verificar, consultar estado y desactivar.', type: 'sec' },
      { text: 'Panel de seguridad en la web con el estado de la verificación en dos pasos.', type: 'feat' },
    ],
  },
  {
    id: 'patch-v2.4.3',
    version: 'PATCH V2.4.3',
    code: 'P-243-NB',
    title: 'Navbar Reparada y Guías Traducidas',
    description: 'Se corrigen los iconos rotos y la superposición de etiquetas de la navbar, y se añaden las traducciones que faltaban.',
    date: '2026-09-12',
    author: 'CiszukoAntony',
    types: ['fix', 'ui', 'docs'],
    likes: 0,
    details: [
      { text: 'Traducciones faltantes de Information y FAQ incorporadas al diccionario.', type: 'docs' },
      { text: 'Iconos chart-bar y bar-chart corregidos, sin solapes de etiquetas.', type: 'fix' },
      { text: 'CSP actualizada para permitir los anuncios de Google en la web.', type: 'sec' },
    ],
  },
  {
    id: 'patch-v2.4.2',
    version: 'PATCH V2.4.2',
    code: 'P-242-CT',
    title: 'Contacto Estilo MuzicMania',
    description: 'El formulario de contacto se replantea con el patrón de MuzicMania y se retiran dependencias externas innecesarias.',
    date: '2026-09-11',
    author: 'CiszukoAntony',
    types: ['rework', 'ui', 'ux'],
    likes: 0,
    details: [
      { text: 'Sistema de contacto replicado desde la referencia de MuzicMania.', type: 'rework' },
      { text: 'Interfaz de contacto sin Google Maps y con validación en cliente.', type: 'ui' },
      { text: 'Botones de acción opcionales en los disclaimers (abrir enlace o cerrar).', type: 'ux' },
    ],
  },
  {
    id: 'patch-v2.4.1',
    version: 'PATCH V2.4.1',
    code: 'P-241-I18',
    title: 'Sistema i18n, Tema Claro y Rutas en Inglés',
    description: 'Internacionalización completa del panel, tema claro terminado y comandos y rutas unificados en inglés.',
    date: '2026-09-10',
    author: 'CiszukoAntony',
    types: ['add', 'refactor', 'ux'],
    likes: 0,
    details: [
      { text: 'Sistema i18n completo con persistencia de idioma.', type: 'add' },
      { text: 'Tema claro completado y contrastes revisados.', type: 'ux' },
      { text: 'Rutas en inglés (/commands, /terms, /privacy) con redirects permanentes desde las antiguas.', type: 'refactor' },
    ],
  },
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
  headline: 'CISZUBOT V2.5',
  progress: 84,
  progressStartLabel: 'Acceso reforzado (2FA)',
  progressEndLabel: 'Bot público',
  version: 'v2.5.0',
  deploy: 'OPERATIVO / DISCORD',
  developer: 'CiszukoAntony',
  nodes: [
    { label: 'Comandos Slash', desc: 'Permisos validados', status: 'done' },
    { label: 'Acceso Reforzado', desc: 'Discord OAuth + 2FA activos', status: 'done' },
    { label: 'Changelogs en Vivo', desc: 'Publicación desde el devcon', status: 'next' },
    { label: 'Bot Público', desc: 'Apertura a otros servidores', status: 'locked' },
  ],
  phases: [
    {
      id: 'patch-v2.5.0',
      name: 'PATCH V2.5.0',
      status: 'current',
      progress: 84,
      tasks: [
        { text: 'Discord OAuth y verificación en dos pasos (TOTP)', done: true },
        { text: 'Registro de cambios con estado y página interna', done: true },
        { text: 'Changelogs globales desde el devcon (Supabase + kill switch)', done: true },
        { text: 'Reconexión automática ante caídas de shards', done: false },
      ],
    },
    {
      id: 'patch-v2.6.0',
      name: 'PATCH V2.6.0',
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
