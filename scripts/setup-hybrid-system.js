#!/usr/bin/env node

/**
 * Script para configurar el sistema híbrido de assets de Ciszu Network
 * 
 * Configura:
 * 1. pnpm workspace optimizado
 * 2. Sistema de assets híbrido (local/CDN)
 * 3. Configuración de Tauri
 * 4. Configuración de Vercel para Turborepo
 * 5. Limpieza de archivos desactualizados
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
  red: '\x1b[31m',
};

console.log(`${COLORS.cyan}🔧 Configurando Sistema Híbrido de Ciszu Network${COLORS.reset}\n`);

// 1. Verificar y optimizar pnpm workspace
function optimizePnpmWorkspace() {
  console.log(`${COLORS.blue}1. Optimizando pnpm workspace...${COLORS.reset}`);
  
  const workspacePath = path.join(ROOT_DIR, 'pnpm-workspace.yaml');
  const optimizedConfig = `packages:
  # Apps principales
  - apps/ciszubot
  - apps/ciszukoantony
  - apps/muzicmania
  - apps/ciszugamens
  
  # Sub-apps y websites
  - apps/ciszubot/website
  - apps/ciszubot/discord
  - apps/ciszukoantony/website
  - apps/muzicmania/website
  - apps/muzicmania/launcher
  
  # Paquetes compartidos
  - packages/*
  
  # Recursos compartidos
  - shared

# Dependencias que deben ser construidas
onlyBuiltDependencies:
  - esbuild
  - sharp
  - swc
  - @swc/core
  - canvas
  - sass`;

  fs.writeFileSync(workspacePath, optimizedConfig, 'utf-8');
  console.log(`✅ pnpm-workspace.yaml optimizado\n`);
}

// 2. Configurar sistema de assets híbrido
function setupHybridAssetSystem() {
  console.log(`${COLORS.blue}2. Configurando sistema de assets híbrido...${COLORS.reset}`);
  
  // Crear configuración de entorno
  const envExample = `# Sistema de Assets Híbrido - Ciszu Network
# ===========================================

# Entorno
NODE_ENV=development

# Estrategia de assets (local|cdn|hybrid)
ASSET_STRATEGY=hybrid

# URLs de CDN
NEXT_PUBLIC_CDN_URL=http://localhost:3000/assets
PRODUCTION_CDN_URL=https://cdn.ciszunetwork.com

# Supabase (opcional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Cloudflare R2 (opcional)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=ciszu-assets

# Tauri
TAURI_DEBUG=true
TAURI_PLATFORM=windows

# Build
NEXT_PUBLIC_BUILD_ID=local
NEXT_PUBLIC_VERCEL_URL=http://localhost:3000`;

  fs.writeFileSync(path.join(ROOT_DIR, '.env.example'), envExample, 'utf-8');
  console.log(`✅ .env.example creado\n`);
}

// 3. Configurar git para assets híbridos
function setupGitForHybridAssets() {
  console.log(`${COLORS.blue}3. Configurando Git para assets híbridos...${COLORS.reset}`);
  
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  let gitignore = fs.existsSync(gitignorePath) 
    ? fs.readFileSync(gitignorePath, 'utf-8') 
    : '';
  
  // Agregar reglas para assets híbridos
  const hybridRules = `

# Sistema de Assets Híbrido - Ciszu Network
# ===========================================

# Assets dinámicos (van a CDN, no a Git)
content/**/*
apps/*/content/**/*
shared/icons/**/ai/*
shared/icons/**/png/*
shared/images/**/*.jpg
shared/images/**/*.png
shared/images/**/*.gif

# Solo mantener SVGs de iconos en Git (críticos)
!shared/icons/**/svg/*.svg

# Build artifacts
dist/
build/
.next/
out/
*.exe
*.app
*.dmg
*.deb
*.rpm

# Tauri
src-tauri/target/
src-tauri/**/*.exe

# Logs
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
.nuxt-build

# Storybook build outputs
.out
.storybook-out

# rollup.js default build output
dist/

# Gatsby files
.cache/
public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/`;

  // Si ya existe, agregar solo las reglas que faltan
  if (!gitignore.includes('# Sistema de Assets Híbrido')) {
    gitignore += hybridRules;
    fs.writeFileSync(gitignorePath, gitignore, 'utf-8');
    console.log(`✅ .gitignore actualizado con reglas híbridas\n`);
  } else {
    console.log(`⏭️  .gitignore ya tiene reglas híbridas\n`);
  }
}

// 4. Configurar scripts de package.json raíz
function setupRootPackageScripts() {
  console.log(`${COLORS.blue}4. Configurando scripts del monorepo...${COLORS.reset}`);
  
  const packagePath = path.join(ROOT_DIR, 'package.json');
  let packageJson = { scripts: {} };
  
  if (fs.existsSync(packagePath)) {
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  }
  
  packageJson.name = 'ciszu-network-monorepo';
  packageJson.version = '1.0.0';
  packageJson.private = true;
  packageJson.scripts = {
    // Desarrollo
    "dev": "turbo dev",
    "dev:ciszubot": "turbo dev --filter=@ciszu/ciszubot...",
    "dev:ciszukoantony": "turbo dev --filter=@ciszu/ciszukoantony...",
    "dev:muzicmania": "turbo dev --filter=@ciszu/muzicmania...",
    
    // Build
    "build": "turbo build",
    "build:web": "turbo build --filter=./apps/*/website",
    "build:tauri": "cd apps/muzicmania/launcher && npm run tauri build",
    
    // Assets
    "assets:extract": "node scripts/extract-icons.js",
    "assets:migrate": "node scripts/migrate-icons.js",
    "assets:download": "node scripts/download-icons.js",
    "assets:verify": "node scripts/verify-system.js",
    "assets:setup": "node scripts/setup-hybrid-system.js",
    
    // Limpieza
    "clean": "turbo clean && rimraf node_modules",
    "clean:build": "turbo clean",
    "clean:modules": "rimraf node_modules && find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +",
    
    // Linting y testing
    "lint": "turbo lint",
    "lint:fix": "turbo lint -- --fix",
    "type-check": "turbo type-check",
    "test": "turbo test",
    
    // Sistema
    "setup": "pnpm install && node scripts/setup-hybrid-system.js",
    "verify": "node scripts/verify-system.js",
    "doctor": "pnpm -v && node -v && npm -v"
  };
  
  packageJson.packageManager = 'pnpm@8.15.0';
  packageJson.engines = {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf-8');
  console.log(`✅ package.json raíz configurado\n`);
}

// 5. Limpiar archivos desactualizados y residuos
function cleanupOldFiles() {
  console.log(`${COLORS.blue}5. Limpiando archivos desactualizados...${COLORS.reset}`);
  
  // Lista de patrones a buscar y limpiar/renombrar
  const cleanupTasks = [
    {
      pattern: /shigamens/gi,
      replacement: 'ciszugamens',
      description: 'Renombrar shigamens a ciszugamens'
    },
    {
      pattern: /ciscobot/gi,
      replacement: 'ciszubot',
      description: 'Renombrar ciscobot a ciszubot'
    },
    {
      pattern: /placeholder\.txt$/i,
      action: 'update',
      description: 'Actualizar archivos placeholder.txt'
    }
  ];
  
  let filesUpdated = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      
      if (item.isDirectory()) {
        // Ignorar node_modules, .git, etc.
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item.name)) {
          walkDir(fullPath);
        }
      } else if (item.isFile()) {
        // Solo procesar archivos de texto
        if (/\.(txt|md|json|js|ts|tsx|jsx)$/.test(item.name)) {
          try {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let updated = false;
            
            for (const task of cleanupTasks) {
              if (task.pattern && content.match(task.pattern)) {
                content = content.replace(task.pattern, task.replacement);
                updated = true;
              }
            }
            
            // Actualizar archivos placeholder.txt
            if (item.name.toLowerCase() === 'placeholder.txt' && content.includes('placeholder')) {
              const newContent = `# Archivo de configuración - Ciszu Network
# ======================================
# Este archivo está en proceso de configuración.
# Última actualización: ${new Date().toISOString()}
# Sistema: Monorepo con assets híbridos

ℹ️  Este es un archivo temporal que será remplazado con configuración real.`;
              
              if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf-8');
                filesUpdated++;
                console.log(`   📄 Actualizado: ${path.relative(ROOT_DIR, fullPath)}`);
              }
            }
            
            if (updated) {
              fs.writeFileSync(fullPath, content, 'utf-8');
              filesUpdated++;
            }
          } catch (error) {
            // Ignorar errores de lectura
          }
        }
      }
    }
  }
  
  walkDir(ROOT_DIR);
  console.log(`✅ ${filesUpdated} archivos actualizados/limpiados\n`);
}

// 6. Crear documentación del sistema híbrido
function createHybridSystemDocs() {
  console.log(`${COLORS.blue}6. Creando documentación del sistema híbrido...${COLORS.reset}`);
  
  const docsDir = path.join(ROOT_DIR, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // Documentación del sistema híbrido
  const hybridSystemDoc = `# Sistema Híbrido de Assets - Ciszu Network

## Visión General

Sistema que combina assets locales (críticos) con CDN (dinámicos) según el entorno y plataforma.

## Estrategias por Entorno

### 🖥️ Desarrollo Local
\`\`\`
Assets: Local
CDN: Deshabilitado
Cache: Sin cache
\`\`\`

### 🌐 Producción Web
\`\`\`
Assets críticos: Local (SVG, fuentes)
Assets dinámicos: CDN (imágenes, audio)
Cache: 24 horas
\`\`\`

### 🖼️ Tauri (Desktop)
\`\`\`
Assets críticos: Empaquetados en .exe/.app
Assets dinámicos: CDN con fallback local
Offline: Soporte completo
\`\`\`

## Estructura de Assets

\`\`\`
ciszu-network/
├── shared/                 # Assets compartidos
│   ├── icons/            # Iconos (SVG en Git, PNG/AI ignorados)
│   ├── fonts/            # Fuentes tipográficas
│   └── images/           # Imágenes (ignoradas en Git, van a CDN)
├── content/              # Contenido multimedia (CDN)
└── apps/*/content/       # Contenido específico de apps (CDN)
\`\`\`

## Configuración de Git

### Incluir en Git (críticos):
- \`shared/icons/**/svg/*.svg\`
- \`shared/fonts/**/*.woff2\`
- Configuraciones esenciales

### Ignorar en Git (van a CDN):
- \`content/**/*\`
- \`apps/*/content/**/*\`
- \`shared/icons/**/ai/*\` (archivos de diseño)
- \`shared/icons/**/png/*\` (previews)
- Archivos multimedia grandes

## Flujo de Trabajo

### Desarrollo:
1. Los assets se sirven localmente
2. Cambios inmediatos sin deploy
3. Ideal para testing rápido

### Producción:
1. Build detecta assets críticos vs dinámicos
2. Assets críticos se incluyen en el bundle
3. Assets dinámicos se suben a CDN automáticamente
4. URLs se actualizan en tiempo de build

### Tauri:
1. Assets críticos se empaquetan en el ejecutable
2. Assets dinámicos usan CDN con cache local
3. Si no hay internet: usa assets locales empaquetados

## Scripts Disponibles

\`\`\`bash
# Configurar sistema completo
pnpm run setup

# Extraer iconos del código
pnpm run assets:extract

# Migrar sistema antiguo
pnpm run assets:migrate

# Verificar configuración
pnpm run assets:verify

# Build específico
pnpm run build:web      # Solo websites
pnpm run build:tauri    # Solo Tauri
\`\`\`

## Variables de Entorno

\`\`\`env
# Estrategia de assets
ASSET_STRATEGY=hybrid    # hybrid, local, cdn

# URLs
NEXT_PUBLIC_CDN_URL=http://localhost:3000/assets
PRODUCTION_CDN_URL=https://cdn.ciszunetwork.com

# Plataforma
TAURI_DEBUG=true
NODE_ENV=development
\`\`\`

## Solución de Problemas

### ❌ "Asset no encontrado en producción"
1. Verificar que el asset está en la carpeta correcta
2. Verificar que no está en .gitignore
3. Verificar upload a CDN

### ❌ "Tauri no muestra imágenes offline"
1. Verificar que el asset está marcado como crítico
2. Verificar que está incluido en el bundle
3. Verificar configuración de Tauri

### ❌ "CDN lento en desarrollo"
1. Cambiar ASSET_STRATEGY a 'local'
2. Verificar red
3. Usar assets locales

## Mejores Prácticas

### ✅ Hacer:
- Mantener SVGs de iconos en Git
- Usar CDN para archivos > 100KB
- Comprimir imágenes antes de subir
- Usar formatos modernos (WebP, AVIF)

### ❌ Evitar:
- Subir archivos grandes a Git
- Mix de estrategias sin razón
- Assets no optimizados
- Rutas hardcodeadas

---

*Documentación del Sistema Híbrido - Ciszu Network v1.0.0*`;

  fs.writeFileSync(path.join(docsDir, 'hybrid-system.md'), hybridSystemDoc, 'utf-8');
  console.log(`✅ Documentación creada: docs/hybrid-system.md\n`);
}

// Función principal
async function main() {
  try {
    console.log(`${COLORS.green}🚀 Iniciando configuración del sistema híbrido...${COLORS.reset}\n`);
    
    optimizePnpmWorkspace();
    setupHybridAssetSystem();
    setupGitForHybridAssets();
    setupRootPackageScripts();
    cleanupOldFiles();
    createHybridSystemDocs();
    
    console.log(`${COLORS.green}🎉 Configuración completada exitosamente!${COLORS.reset}\n`);
    
    console.log(`${COLORS.cyan}📋 Resumen:${COLORS.reset}`);
    console.log(`✅ pnpm workspace optimizado`);
    console.log(`✅ Sistema de assets híbrido configurado`);
    console.log(`✅ Git configurado para ignorar assets dinámicos`);
    console.log(`✅ Scripts del monorepo actualizados`);
    console.log(`✅ Archivos desactualizados limpiados`);
    console.log(`✅ Documentación creada\n`);
    
    console.log(`${COLORS.yellow}🚀 Próximos pasos:${COLORS.reset}`);
    console.log(`1. Instalar dependencias: ${COLORS.cyan}pnpm install${COLORS.reset}`);
    console.log(`2. Probar sistema: ${COLORS.cyan}pnpm run assets:verify${COLORS.reset}`);
    console.log(`3. Extraer iconos: ${COLORS.cyan}pnpm run assets:extract${COLORS.reset}`);
    console.log(`4. Iniciar desarrollo: ${COLORS.cyan}pnpm run dev:muzicmania${COLORS.reset}\n`);
    
    console.log(`${COLORS.green}✅ Sistema híbrido listo para usar!${COLORS.reset}`);
    
  } catch (error) {
    console.error(`${COLORS.red}❌ Error durante la configuración:${COLORS.reset}`, error.message);
    process.exit(1);
  }
}

// Ejecutar configuración
main();