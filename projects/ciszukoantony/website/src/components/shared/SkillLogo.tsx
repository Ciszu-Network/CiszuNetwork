'use client';

import React from 'react';
import { getIcon } from '@ciszu/ui';

/**
 * Logo oficial de un lenguaje/tecnología.
 *
 * Los SVGs de marca viven en `shared/icons/svg/brands/` (descargados de fuentes
 * oficiales: Simple Icons, devicon y c-language.org; ver
 * `scripts/fetch-brand-icons.js`) y se registran en la categoría `brand` del
 * icon registry de @ciszu/ui (`scripts/generate-icon-registry.js`).
 *
 * Resolución en dos pasos:
 *  1. Icono de marca oficial.
 *  2. Iconos UI del ecosistema (`outline`/`filled`) para tecnologías sin logo
 *     de marca propio: ASM usa el glifo de chip (lenguaje de bajo nivel) y SQL
 *     el de base de datos.
 *
 * Los logos cuyo color oficial es negro (GitHub, Next.js, Rust, Express,
 * Django, JSON) se pintan con `currentColor` para ser legibles tanto en tema
 * oscuro como claro; el resto conserva su color de marca.
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
  sql: 'database',
  sqlite: 'sqlite',
  java: 'java',
  c: 'c',
  cpp: 'cplusplus',
  csharp: 'csharp',
  lua: 'lua',
  luau: 'luau',
  julia: 'julia',
  ruby: 'ruby',
  perl: 'perl',
  rlang: 'r',
  rust: 'rust',
  asm: 'chip',
  kotlin: 'kotlin',
  swift: 'swift',
  docker: 'docker',
  linux: 'linux',
  git: 'git',
  github: 'github',
  npm: 'npm',
  pnpm: 'pnpm',
  bash: 'bash',
  prettier: 'prettier',
  eslint: 'eslint',
  ruff: 'ruff',
  toml: 'toml',
  json: 'json',
  yaml: 'yaml',
};

/** Colores de marca oficiales (tomados de los propios SVGs de cada logo). */
const BRAND_COLOR: Record<string, string> = {
  python: '#3776AB', javascript: '#F7DF1E', typescript: '#3178C6',
  html5: '#E34F26', css: '#663399', xml: '#005FAD', sass: '#CC6699',
  react: '#61DAFB', nodedotjs: '#5FA04E', express: 'currentColor',
  django: 'currentColor', nextdotjs: 'currentColor', java: '#0074BD',
  c: '#A8B9CC', cplusplus: '#00599C', csharp: '#68217A', lua: '#000080',
  luau: '#00A2FF', julia: '#9558B2', ruby: '#CC342D', perl: '#0073A1',
  r: '#276DC3', rust: 'currentColor', kotlin: '#7F52FF', swift: '#F05138',
  docker: '#2496ED', linux: '#FCC624', git: '#F03C2E', github: 'currentColor',
  npm: '#CB3837', pnpm: '#F69220', bash: '#4EAA25', ruff: '#D7FF64',
  toml: '#9C4121', json: 'currentColor', yaml: '#CB171E',
  sqlite: '#0F7FCC', prettier: '#F7B93E', eslint: '#4B32C3',
};

export function SkillLogo({ icon, className = 'h-6 w-6' }: { icon: string; className?: string }) {
  const name = ICON_MAP[icon] ?? icon;

  // 1. Logo de marca oficial.
  const brand = getIcon('brand', name);
  if (brand) {
    const color = BRAND_COLOR[name] ?? 'currentColor';
    return (
      <svg viewBox={brand.viewBox} className={className} role="img" aria-hidden fill={color}>
        <g dangerouslySetInnerHTML={{ __html: brand.inner }} />
      </svg>
    );
  }

  // 2. Icono UI del ecosistema (sin logo de marca: ASM, SQL).
  const ui = getIcon('outline', name) ?? getIcon('filled', name);
  if (!ui) return null;
  return (
    <svg
      viewBox={ui.viewBox}
      className={className}
      role="img"
      aria-hidden
      fill={ui.stroke ? 'none' : 'currentColor'}
      stroke={ui.stroke ? 'currentColor' : undefined}
      strokeWidth={ui.stroke ? 2 : undefined}
    >
      <g dangerouslySetInnerHTML={{ __html: ui.inner }} />
    </svg>
  );
}

export default SkillLogo;
