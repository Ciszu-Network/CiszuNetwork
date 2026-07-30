#!/usr/bin/env node

/**
 * Script de inicio rápido para el sistema de iconos
 * 
 * Proporciona comandos rápidos para comenzar a usar el sistema
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${COLORS.cyan}🚀 Inicio Rápido - Sistema de Iconos Ciszu Network${COLORS.reset}\n`);

function showCommand(description, command) {
  console.log(`${COLORS.blue}📌 ${description}${COLORS.reset}`);
  console.log(`   ${COLORS.yellow}${command}${COLORS.reset}\n`);
}

// Mostrar opciones disponibles
console.log(`${COLORS.green}🔧 Configuración Inicial:${COLORS.reset}\n`);

showCommand(
  '1. Verificar sistema actual',
  'node scripts/verify-system.js'
);

showCommand(
  '2. Extraer iconos inline del código existente',
  'node scripts/extract-icons.js'
);

showCommand(
  '3. Descargar iconos adicionales (ej: navegación)',
  'node scripts/download-icons.js --category=navigation --count=20'
);

showCommand(
  '4. Ver iconos disponibles',
  'Get-ChildItem "shared/icons/outline/svg/" | Select-Object -First 10'
);

console.log(`${COLORS.green}🔄 Migración:${COLORS.reset}\n`);

showCommand(
  '5. Migrar código antiguo a nuevo sistema',
  'node scripts/migrate-icons.js'
);

showCommand(
  '6. Probar migración en un archivo específico',
  'node scripts/migrate-icons.js --file=apps/muzicmania/website/src/components/ui/example.tsx'
);

console.log(`${COLORS.green}🎨 Uso en Código:${COLORS.reset}\n`);

console.log(`${COLORS.blue}📝 Ejemplo de importación:${COLORS.reset}`);
console.log(`${COLORS.yellow}`)
console.log(`import { Icon, IconButton } from '@ciszu/ui';`);
console.log(`import { resolveIcon, ICON_NAMES } from '@ciszu/cdn';`);
console.log(`${COLORS.reset}`);

console.log(`${COLORS.blue}🎯 Ejemplo de componente:${COLORS.reset}`);
console.log(`${COLORS.yellow}`)
console.log(`function Navbar() {`);
console.log(`  return (`);
console.log(`    <nav>`);
console.log(`      <Icon name="home" size={24} />`);
console.log(`      <IconButton name="search" label="Buscar" />`);
console.log(`    </nav>`);
console.log(`  );`);
console.log(`}`);
console.log(`${COLORS.reset}`);

console.log(`${COLORS.green}⚙️ Configuración de Bundlers:${COLORS.reset}\n`);

showCommand(
  'Next.js - Agregar a next.config.js',
  `// En next.config.js
webpack: (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@shared': path.resolve(__dirname, 'shared'),
    '@cdn': path.resolve(__dirname, 'packages/cdn'),
  };
  return config;
}`
);

showCommand(
  'Vite - Agregar a vite.config.ts',
  `// En vite.config.ts
resolve: {
  alias: {
    '@shared': path.resolve(__dirname, 'shared'),
    '@cdn': path.resolve(__dirname, 'packages/cdn'),
  },
}`
);

console.log(`${COLORS.green}🔍 Verificación Final:${COLORS.reset}\n`);

showCommand(
  'Verificar que todo funciona',
  `// Crear archivo de prueba
// apps/muzicmania/website/src/test-icons.tsx
import { Icon } from '@ciszu/ui';
export function TestIcons() {
  return <Icon name="home" size={32} />;
}`
);

showCommand(
  'Verificar build',
  'cd apps/muzicmania/website && npm run build'
);

console.log(`${COLORS.green}📚 Documentación:${COLORS.reset}\n`);

console.log(`${COLORS.blue}📖 Archivos de documentación disponibles:${COLORS.reset}`);
console.log(`   📄 docs/icons-system.md - Guía completa del sistema`);
console.log(`   📄 docs/bundler-config.md - Configuración de bundlers`);
console.log(`   📄 shared/icons/README.md - Estructura de iconos`);
console.log(`   📄 README.md - Documentación general\n`);

console.log(`${COLORS.green}🆘 Solución de Problemas:${COLORS.reset}\n`);

console.log(`${COLORS.blue}❌ "Module not found: @ciszu/ui"${COLORS.reset}`);
console.log(`   → Verificar aliases en tsconfig.json y config del bundler\n`);

console.log(`${COLORS.blue}❌ "Cannot find icon: home"${COLORS.reset}`);
console.log(`   → Verificar que el icono existe en shared/icons/outline/svg/\n`);

console.log(`${COLORS.blue}❌ "SVG not loading"${COLORS.reset}`);
console.log(`   → Configurar @svgr/webpack o vite-svg-loader\n`);

console.log(`${COLORS.cyan}🎯 Comando Recomendado para Comenzar:${COLORS.reset}\n`);
console.log(`${COLORS.yellow}node scripts/extract-icons.js && node scripts/verify-system.js${COLORS.reset}\n`);

console.log(`${COLORS.green}✅ Sistema listo para usar!${COLORS.reset}`);
console.log(`Comienza con el paso 1 o ejecuta el comando recomendado.`);