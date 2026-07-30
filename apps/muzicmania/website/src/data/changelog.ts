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
