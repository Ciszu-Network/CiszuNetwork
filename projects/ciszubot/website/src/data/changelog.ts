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
