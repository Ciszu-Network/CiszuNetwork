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
