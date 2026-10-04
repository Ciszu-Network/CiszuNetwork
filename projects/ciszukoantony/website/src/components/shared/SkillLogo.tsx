'use client';

import React from 'react';
import { getIcon } from '@ciszu/ui';

/**
 * Logo oficial de un lenguaje/tecnología.
 *
 * Los SVGs viven en `shared/icons/svg/brands/` (descargados de Simple Icons,
 * oct 2026) y se registran en la categoría `brand` del icon registry de
 * @ciszu/ui. Este componente renderiza el path oficial con el color de marca.
 */
const ICON_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  html: 'html5',
  css: 'css',
  xml: 'xml',
  sass: 'sass',
  react: 'react',
  nodejs: 'nodedotjs',
  express: 'express',
  django: 'django',
  nextjs: 'nextdotjs',
  sql: 'sql',
  java: 'java',
  c: 'c',
  cpp: 'cplusplus',
  csharp: 'csharp',
  lua: 'lua',
  julia: 'julia',
  ruby: 'ruby',
  rust: 'rust',
  kotlin: 'kotlin',
  swift: 'swift',
  docker: 'docker',
  linux: 'linux',
  github: 'github',
  npm: 'npm',
  prettier: 'prettier',
  eslint: 'eslint',
  config: 'xml',
  asm: 'c',
};

/** Colores de marca oficiales (de los SVGs de Simple Icons). */
const BRAND_COLOR: Record<string, string> = {
  python: '#3776AB', javascript: '#F7DF1E', typescript: '#3178C6',
  html5: '#E34F26', css: '#663399', xml: '#005FAD', sass: '#CC6699',
  react: '#61DAFB', nodedotjs: '#5FA04E', express: '#0A0A0A', django: '#092E20',
  nextdotjs: '#000000', sql: '#4169E1', java: '#000000', c: '#A8B9CC',
  cplusplus: '#00599C', csharp: '#99CC00', lua: '#000080', julia: '#9558B2',
  ruby: '#CC342D', rust: '#000000', kotlin: '#7F52FF', swift: '#F05138',
  docker: '#2496ED', linux: '#FCC624', github: '#181717', npm: '#CB3837',
  prettier: '#F7B93E', eslint: '#4B32C3',
};

export function SkillLogo({ icon, className = 'h-6 w-6' }: { icon: string; className?: string }) {
  const brandName = ICON_MAP[icon] ?? icon;
  const entry = getIcon('brand', brandName);
  if (!entry) return null;
  const color = BRAND_COLOR[brandName] ?? 'currentColor';
  return (
    <svg viewBox={entry.viewBox} className={className} role="img" aria-hidden fill={color}>
      <g dangerouslySetInnerHTML={{ __html: entry.inner }} />
    </svg>
  );
}

export default SkillLogo;