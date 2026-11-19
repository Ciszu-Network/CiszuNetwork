import { ReactNode } from 'react';

export type ChangelogType = 
  | 'hotfix' | 'add' | 'ui' | 'bugfix' | 'perf' | 'ux' 
  | 'sec' | 'refactor' | 'build' | 'test' | 'docs' | 'chore' 
  | 'feat' | 'style' | 'rework' | 'sync' | 'node'
  | 'delete' | 'ci' | 'revert' | 'fix' | 'bump';

export interface ChangelogDetail {
  text: string;
  type: ChangelogType;
}

export interface ChangelogItem {
  id: string;
  version: string;
  code: string;
  title: string;
  description: string;
  date: string;
  types: ChangelogType[];
  author: string;
  likes: number;
  details: ChangelogDetail[];
}

export const CHANGELOG_DATA: ChangelogItem[] = [
  {
    id: 'launcher-v2.4.2-beta',
    version: 'LAUNCHER V2.4.2 BETA',
    code: 'L-242-BETA',
    title: 'Telemetría del Ecosistema',
    description: 'Launcher, instaladores, webs y bot envían eventos técnicos verificables para analítica, seguridad y soporte, con opt-out en launcher y web.',
    date: '2026-11-18',
    author: 'CiszukoAntony',
    types: ['add', 'build', 'sec', 'ux'],
    likes: 0,
    details: [
      { text: 'Endpoint central de telemetría con validación, rate limit, IP/país y almacenamiento server-only.', type: 'build' },
      { text: 'Launcher con heartbeat, online/offline, sesión y cola de eventos; se puede desactivar en ajustes.', type: 'add' },
      { text: 'Setup y desinstalador registran instalación, actualización y motivo de desinstalación sin opt-out.', type: 'sec' },
      { text: 'Webs y bot envían uso, dispositivo, versión y comandos; la web permite desactivar telemetría en cuenta.', type: 'add' },
    ],
  },
  {
    id: 'launcher-v2.4.1-beta',
    version: 'LAUNCHER V2.4.1 BETA',
    code: 'L-241-BETA',
    title: 'Bienvenida, Tutorial y Login CISZU ID',
    description: 'El primer arranque estrena bienvenida exclusiva, tutorial guiado y acceso CISZU ID con sesión recordada; el hub distingue primera vez.',
    date: '2026-11-18',
    author: 'CiszukoAntony',
    types: ['ui', 'ux', 'add'],
    likes: 0,
    details: [
      { text: 'Pantalla de bienvenida exclusiva antes del tutorial en el primer inicio.', type: 'ui' },
      { text: 'El login aparece después del tutorial, antes del hub; solo inicio de sesión, sin registro local.', type: 'add' },
      { text: 'CISZU ID conserva OAuth, recuperación, 2FA, CAPTCHA, soporte y opción Recordarme.', type: 'add' },
      { text: 'El hub muestra un mensaje especial de primera vez y vuelve a “bienvenido de vuelta” en sesiones posteriores.', type: 'ux' },
      { text: 'La sesión se guarda si Recordarme está activo; si no, se mantiene solo durante la sesión actual.', type: 'add' },
    ],
  },
  {
    id: 'launcher-v2.4.0-beta',
    version: 'LAUNCHER V2.4.0 BETA',
    code: 'L-240-BETA',
    title: 'Política de Versiones y Bloqueos de Seguridad',
    description: 'El launcher incorpora manifiesto firmado, canales, rangos de actualización, bloqueos obligatorios y avisos con elección del usuario.',
    date: '2026-11-18',
    author: 'CiszukoAntony',
    types: ['sec', 'build', 'add', 'ui', 'ux'],
    likes: 0,
    details: [
      { text: 'Manifiesto firmado Ed25519 con caché local y política embebida para funcionar sin conexión.', type: 'sec' },
      { text: 'Actualizaciones opcionales con opción de quedarse, ir a la más nueva, a la más cercana o elegir del rango.', type: 'ux' },
      { text: 'Bloqueos obligatorios por soporte o seguridad: hub, online y offline quedan desactivados hasta actualizar.', type: 'sec' },
      { text: 'Canales beta/release con aviso de cambio, elección recordada y opción automática configurable.', type: 'add' },
      { text: 'Validación de OS/arquitectura, checksum de descargas, error con reintento, descarga manual y soporte.', type: 'build' },
    ],
  },
  {
    id: 'launcher-v2.3.2-beta',
    version: 'LAUNCHER V2.3.2 BETA',
    code: 'L-232-BETA',
    title: 'Launcher Beta con Versiones y Hub Inteligente',
    description: 'El launcher estrena registro de versiones por canal, comparación de builds en el hub y una interfaz más limpia con isotipo y barra propia.',
    date: '2026-11-18',
    author: 'CiszukoAntony',
    types: ['build', 'add', 'ui', 'ux'],
    likes: 0,
    details: [
      { text: 'Cada build se archiva por versión de launcher, canal y sistema operativo, con metadatos, SHA256 y changelog.', type: 'build' },
      { text: 'La web de descargas muestra el historial con búsqueda, filtros por canal y orden por fecha o versión.', type: 'add' },
      { text: 'El hub compara la versión instalada con la del instalador y bloquea reinstalaciones que degraden la app.', type: 'ux' },
      { text: 'El launcher y los setups usan el isotipo y una barra de ventana personalizada; se eliminaron logos y textos duplicados.', type: 'ui' },
      { text: 'El updater distingue entre conexión fallida, versión del repositorio más nueva y versión local más reciente, sin degradar.', type: 'add' },
    ],
  },
  {
    id: 'patch-v2.7.0',
    version: 'PATCH V2.7.0',
    code: 'P-270-LB',
    title: 'Icono de Biblioteca con Identidad Propia',
    description: 'La Biblioteca deja la nota musical genérica y usa el isotipo de MuzicMania en gris.',
    date: '2026-09-28',
    author: 'CiszukoAntony',
    types: ['ui', 'ux'],
    likes: 0,
    details: [
      { text: 'El enlace Biblioteca del navbar y del footer usa el isotipo de MuzicMania en gris en lugar de la nota musical.', type: 'ui' },
      { text: 'El icono se resuelve por el CDN del ecosistema, con la misma estrategia que el resto de assets.', type: 'ux' },
    ],
  },
  {
    id: 'patch-v2.6.0',
    version: 'PATCH V2.6.0',
    code: 'P-260-MX',
    title: 'Registro Compartido y Changelogs en Vivo',
    description: 'El registro del ecosistema adopta la lógica compartida (@ciszunetwork/utils/changelog) y acepta entradas publicadas en vivo desde el devcon.',
    date: '2026-09-16',
    author: 'CiszukoAntony',
    types: ['refactor', 'add', 'build'],
    likes: 0,
    details: [
      { text: 'La búsqueda, el filtrado, el orden y la paginación pasan al paquete compartido, con tests unitarios.', type: 'refactor' },
      { text: 'Las entradas publicadas desde el devcon se fusionan con las declaradas en el código.', type: 'add' },
      { text: 'Icono propio por entrada (32 SVG disponibles) con el catálogo extendido de la web.', type: 'add' },
      { text: 'Modo local de previsualización leído por /api/changelogs/debug.', type: 'build' },
    ],
  },
  {
    id: 'patch-v2.5.0',
    version: 'PATCH V2.5.0',
    code: 'P-250-MX',
    title: 'Internacionalización, Tema Claro y Rutas en Inglés',
    description: 'La web se vuelve bilingüe, estrena tema claro y unifica sus rutas en inglés con redirecciones permanentes.',
    date: '2026-09-10',
    author: 'CiszukoAntony',
    types: ['add', 'ux', 'refactor'],
    likes: 0,
    details: [
      { text: 'Sistema i18n completo con persistencia del idioma elegido.', type: 'add' },
      { text: 'Tema claro terminado con contrastes revisados en toda la interfaz.', type: 'ux' },
      { text: 'Rutas unificadas en inglés con redirects permanentes desde las antiguas.', type: 'refactor' },
      { text: 'Navbar con dropdown Information al final y etiquetas al pasar el cursor.', type: 'ux' },
    ],
  },
  {
    id: 'patch-v2.4.6',
    version: 'PATCH V2.4.6',
    code: 'P-246-MX',
    title: 'Sección del Ecosistema y Marca Ciszu Network',
    description: 'Se estandariza la sección Project provided by CiszuNetwork en las cuatro webs y se refuerza la identidad visual del reproductor.',
    date: '2026-09-12',
    author: 'CiszukoAntony',
    types: ['ui', 'style', 'feat'],
    likes: 0,
    details: [
      { text: 'Componente EcosystemSection compartido y desplegado en todas las webs.', type: 'ui' },
      { text: 'Isotipos, botones degradados y modales con el nuevo estilo de marca.', type: 'style' },
      { text: 'Home con secciones de novedades y accesos directos renovados.', type: 'feat' },
    ],
  },
  {
    id: 'patch-v2.4.5',
    version: 'PATCH V2.4.5',
    code: 'P-245-MX',
    title: 'Estadísticas y Contacto Sin Maps',
    description: 'Las páginas de estadísticas y contacto se reescriben: gráficos reparados y formulario de contacto propio como referencia del ecosistema.',
    date: '2026-09-11',
    author: 'CiszukoAntony',
    types: ['rework', 'perf', 'fix'],
    likes: 0,
    details: [
      { text: 'El formulario de contacto se convierte en la referencia replicada por las demás webs.', type: 'rework' },
      { text: 'Retirada la dependencia de Google Maps y reducido el peso de la página.', type: 'perf' },
      { text: 'Iconos de estadísticas reparados (chart-bar) y gráficos sin desbordes.', type: 'fix' },
    ],
  },
  {
    id: 'patch-v2.4.0',
    version: 'PATCH V2.4.0',
    code: 'P-240-CD',
    title: 'CDN Unificado y Seguridad de Base de Datos',
    description: 'Integración del sistema híbrido CDN/local en todos los websites, corrección de advertencias de seguridad en Supabase, protección contra XSS y SQL injection, y sistema de backup de base de datos.',
    date: '2026-07-29',
    author: 'CiszukoAntony',
    types: ['build', 'sec', 'refactor'],
    likes: 0,
    details: [
      { text: 'Nuevo paquete @ciszunetwork/cdn con resolveIcon() y AssetResolver para resolución híbrida CDN/local.', type: 'build' },
      { text: 'Integración CDN en los 4 websites: ciszunetwork, ciszukoantony, muzicmania y ciszubot.', type: 'build' },
      { text: 'Corrección de 27 advertencias Security Advisor en Supabase (funciones SECURITY INVOKER, permisos anon).', type: 'sec' },
      { text: 'Protección XSS implementada en formularios de búsqueda y autenticación (escapeHtml).', type: 'sec' },
      { text: 'Validación de seguridad contra SQL injection en scripts de migración y herramientas de desarrollo.', type: 'sec' },
      { text: 'Sistema de backup de base de datos vía Management API + pg_dump.', type: 'refactor' },
      { text: 'Upload inteligente al CDN con diff-check (solo archivos nuevos o modificados).', type: 'refactor' },
      { text: 'Migraciones 08-10: initplan wrapping, policies mergeadas, duplicate policies eliminadas.', type: 'sec' },
    ]
  },
  {
    id: 'patch-v2.3.0',
    version: 'PATCH V2.3.0',
    code: 'P-230-DL',
    title: 'Sincronización de Descargas',
    description: 'Corrección de arquitectura de descargas multiplataforma, regeneración de documentación y ajustes en la lógica de caché de instaladores.',
    date: '2026-06-10',
    author: 'CiszukoAntony',
    types: ['hotfix', 'build', 'docs'],
    likes: 0,
    details: [
      { text: 'Eliminación de arquitectura x86 del selector de descargas.', type: 'hotfix' },
      { text: 'Sincronización de instaladores Tauri compilados con la página de descargas.', type: 'build' },
      { text: 'Actualización de licencias con marca Ciszu Network.', type: 'docs' },
      { text: 'Generación masiva de documentación (txt, md, pdf, docx) con branding oficial.', type: 'docs' }
    ]
  },
  {
    id: 'patch-v2.3.1',
    version: 'PATCH V2.3.1',
    code: 'P-231-BR',
    title: 'Consistencia de Contenido Legal',
    description: 'Sincronización profunda de documentos legales entre todas las páginas web y formatos descargables, corrección de fechas y regeneración de paquetes comprimidos.',
    date: '2026-06-10',
    author: 'CiszukoAntony',
    types: ['docs', 'bugfix', 'build'],
    likes: 0,
    details: [
      { text: 'Sincronización de Términos, Licencia y Reglas entre web (14/9/17 artículos) y todos los formatos descargables.', type: 'docs' },
      { text: 'Corrección de fecha desactualizada en la página de Reglas (2026-04-18 → 2026-06-10).', type: 'bugfix' },
      { text: 'Regeneración completa de PDF, DOCX, ZIP, RAR y 7z con contenido consistente.', type: 'build' },
      { text: 'Mejora en el parseo de documentos para preservar estructura de artículos numerados.', type: 'docs' }
    ]
  },
  {
    id: 'patch-v2.2.8',
    version: 'PATCH V2.2.8',
    code: 'P-228-FX',
    title: 'Estabilización de Producción',
    description: 'Resolución de bloqueos de despliegue en Vercel, corrección del motor de audio y ajuste de interfaces para diversas resoluciones.',
    date: '2026-05-04',
    author: 'CiszukoAntony',
    types: ['hotfix', 'bugfix', 'ui'],
    likes: 0,
    details: [
      { text: 'Eliminación de la cabecera X-Frame-Options para restaurar la vista previa en Vercel.', type: 'hotfix' },
      { text: 'Implementación de audioContext.resume() en Zustand para saltar la política de Autoplay.', type: 'bugfix' },
      { text: 'Redimensionamiento fluido del imagotipo en la página de información.', type: 'ui' }
    ]
  },
  {
    id: 'beta-v2.0.4',
    version: 'BETA V2.0.4',
    code: 'B-204-NX',
    title: 'Sincronización del Nexo',
    description: 'Optimización crítica de protocolos de comunicación y refinamiento de la interfaz de usuario para el lanzamiento público.',
    date: '2024-04-25',
    author: 'CiszukoAntony',
    types: ['hotfix', 'perf', 'ui'],
    likes: 0,
    details: [
      { text: 'Implementación de compresión de datos Gzip para respuestas del servidor.', type: 'perf' },
      { text: 'Corrección de desbordamiento visual en el panel de navegación móvil.', type: 'hotfix' },
      { text: 'Nuevos efectos de cristalografía en botones de acción principal.', type: 'ui' },
      { text: 'Sincronización de estados de carga con Supabase.', type: 'node' }
    ]
  },
  {
    id: 'beta-v2.0.3',
    version: 'BETA V2.0.3',
    code: 'B-203-DB',
    title: 'Arquitectura de Datos',
    description: 'Migración completa a Supabase y fortalecimiento de esquemas de seguridad.',
    date: '2024-04-20',
    author: 'CiszukoAntony',
    types: ['sec', 'refactor', 'build'],
    likes: 0,
    details: [
      { text: 'Refactorización de controladores de autenticación.', type: 'refactor' },
      { text: 'Implementación de RLS (Row Level Security) en todas las tablas.', type: 'sec' },
      { text: 'Optimización de scripts de despliegue en Vercel.', type: 'build' },
      { text: 'Nueva validación de integridad de archivos en subida.', type: 'sec' }
    ]
  },
  {
    id: 'beta-v2.0.2',
    version: 'BETA V2.0.2',
    code: 'B-202-FE',
    title: 'Interacción Sonora',
    description: 'Mejoras profundas en la experiencia del usuario y sistema de audio-reactividad.',
    date: '2024-04-15',
    author: 'CiszukoAntony',
    types: ['feat', 'ux', 'style'],
    likes: 0,
    details: [
      { text: 'Nuevo motor de partículas reactivas al ritmo de la música.', type: 'feat' },
      { text: 'Mejora en la latencia de respuesta táctil en dispositivos móviles.', type: 'ux' },
      { text: 'Paleta de colores neón expandida con soporte para temas personalizados.', type: 'style' },
      { text: 'Integración de pre-escucha de tracks sin recarga de página.', type: 'ux' }
    ]
  },
  {
    id: 'beta-v2.0.1',
    version: 'BETA V2.0.1',
    code: 'B-201-UX',
    title: 'Protocolos de Experiencia',
    description: 'Ajustes de flujo y corrección de comportamientos anómalos en el sistema de búsqueda.',
    date: '2024-04-10',
    author: 'CiszukoAntony',
    types: ['bugfix', 'ux', 'docs'],
    likes: 0,
    details: [
      { text: 'Corrección de bucle infinito en resultados de búsqueda vacíos.', type: 'bugfix' },
      { text: 'Añadida documentación técnica inicial para contribuyentes.', type: 'docs' },
      { text: 'Mejorado el contraste de texto en áreas de baja visibilidad.', type: 'ux' },
      { text: 'Soporte para navegación por teclado en la galería de tracks.', type: 'ux' }
    ]
  },
  {
    id: 'v1.9.9',
    version: 'LEGACY V1.9.9',
    code: 'L-199-SY',
    title: 'Cierre del Sistema Alpha',
    description: 'Preparación para la gran transición a la arquitectura Beta V2.0.',
    date: '2024-03-30',
    author: 'CiszukoAntony',
    types: ['chore', 'sync', 'node'],
    likes: 0,
    details: [
      { text: 'Limpieza de dependencias obsoletas del motor Alpha.', type: 'chore' },
      { text: 'Sincronización final de bases de datos heredadas.', type: 'sync' },
      { text: 'Ajuste de límites de memoria en nodos de procesamiento.', type: 'node' },
      { text: 'Backup integral del historial de transacciones.', type: 'chore' }
    ]
  },
  {
    id: 'perf-ref-001',
    version: 'CORE UPDATE',
    code: 'C-001-PF',
    title: 'Motores de Alto Rendimiento',
    description: 'Actualización masiva de rendimiento enfocada en la carga de activos pesados.',
    date: '2024-04-26',
    author: 'CiszukoAntony',
    types: ['perf', 'refactor', 'test'],
    likes: 0,
    details: [
      { text: 'Reducción del 40% en el tiempo de carga inicial de la aplicación.', type: 'perf' },
      { text: 'Migración de lógica pesada a Web Workers para evitar bloqueos del hilo principal.', type: 'refactor' },
      { text: 'Suite de tests automatizados para validar estabilidad de carga.', type: 'test' }
    ]
  }
];




