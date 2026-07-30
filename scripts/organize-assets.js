#!/usr/bin/env node

/**
 * Sistema para organizar fuentes, logos y assets de Ciszu Network
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const SHARED_DIR = path.join(ROOT_DIR, 'shared');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`${COLORS.green}✅ Directorio creado: ${path.relative(ROOT_DIR, dirPath)}${COLORS.reset}`);
    return true;
  }
  return false;
}

function organizeFonts() {
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🔤 ORGANIZANDO FUENTES${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  const sharedFontsDir = path.join(SHARED_DIR, 'fonts');
  createDirectory(sharedFontsDir);
  
  // Buscar fuentes en todos los proyectos
  const fontDirs = [];
  
  // Buscar recursivamente directorios fonts
  function findFontDirs(startPath) {
    if (!fs.existsSync(startPath)) return;
    
    const items = fs.readdirSync(startPath);
    items.forEach(item => {
      const itemPath = path.join(startPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        if (item.toLowerCase() === 'fonts') {
          fontDirs.push(itemPath);
        } else {
          findFontDirs(itemPath);
        }
      }
    });
  }
  
  findFontDirs(APPS_DIR);
  
  console.log(`${COLORS.yellow}📁 Directorios de fuentes encontrados: ${fontDirs.length}${COLORS.reset}`);
  
  // Consolidar fuentes
  const consolidatedFonts = new Set();
  
  fontDirs.forEach(fontDir => {
    if (fs.existsSync(fontDir)) {
      const fonts = fs.readdirSync(fontDir);
      
      fonts.forEach(font => {
        const fontPath = path.join(fontDir, font);
        
        if (fs.statSync(fontPath).isFile()) {
          const destPath = path.join(sharedFontsDir, font);
          
          // Verificar si ya existe
          if (!fs.existsSync(destPath)) {
            fs.copyFileSync(fontPath, destPath);
            consolidatedFonts.add(font);
            console.log(`${COLORS.green}✅ Fuente consolidada: ${font}${COLORS.reset}`);
          }
        }
      });
    }
  });
  
  // Crear archivo de registro de fuentes
  const fontsManifest = path.join(sharedFontsDir, 'FONTS_MANIFEST.json');
  const manifestContent = {
    $schema: "../schema.json",
    consolidated_date: new Date().toISOString(),
    total_fonts: consolidatedFonts.size,
    fonts: Array.from(consolidatedFonts).sort(),
    source_directories: fontDirs.map(dir => path.relative(ROOT_DIR, dir)),
    usage_guide: {
      web: "Usar /shared/fonts/[nombre].ttf",
      css: "@font-face { font-family: 'FontName'; src: url('/shared/fonts/fontname.ttf'); }",
      nextjs: "Colocar en public/fonts/ o usar next/font"
    }
  };
  
  fs.writeFileSync(fontsManifest, JSON.stringify(manifestContent, null, 2), 'utf-8');
  
  console.log(`${COLORS.green}📊 Total fuentes consolidadas: ${consolidatedFonts.size}${COLORS.reset}`);
  console.log(`${COLORS.blue}📍 Ubicación: ${path.relative(ROOT_DIR, sharedFontsDir)}${COLORS.reset}`);
  
  return Array.from(consolidatedFonts);
}

function organizeLogos() {
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🖼️  ORGANIZANDO LOGOS${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  const sharedLogosDir = path.join(SHARED_DIR, 'logos');
  createDirectory(sharedLogosDir);
  
  // Crear estructura organizada
  const logoStructure = {
    ciszu: path.join(sharedLogosDir, 'ciszu'),
    projects: path.join(sharedLogosDir, 'projects'),
    banners: path.join(sharedLogosDir, 'banners'),
    thumbnails: path.join(sharedLogosDir, 'thumbnails'),
    variants: path.join(sharedLogosDir, 'variants')
  };
  
  Object.values(logoStructure).forEach(dir => createDirectory(dir));
  
  // Buscar logos en proyectos
  const logoKeywords = ['logo', 'logotipo', 'brand', 'marca', 'icon', 'favicon'];
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp'];
  
  const foundLogos = [];
  
  function searchLogos(startPath, baseProject = '') {
    if (!fs.existsSync(startPath)) return;
    
    const items = fs.readdirSync(startPath);
    items.forEach(item => {
      const itemPath = path.join(startPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Buscar en subdirectorios
        searchLogos(itemPath, baseProject || path.basename(startPath));
      } else if (stat.isFile()) {
        // Verificar si es un logo
        const lowerItem = item.toLowerCase();
        const isLogo = logoKeywords.some(keyword => lowerItem.includes(keyword));
        const isImage = imageExtensions.some(ext => lowerItem.endsWith(ext));
        
        if (isLogo && isImage) {
          foundLogos.push({
            path: itemPath,
            name: item,
            project: baseProject || 'unknown',
            relativePath: path.relative(ROOT_DIR, itemPath)
          });
        }
      }
    });
  }
  
  searchLogos(APPS_DIR);
  
  console.log(`${COLORS.yellow}📁 Logos encontrados: ${foundLogos.length}${COLORS.reset}`);
  
  // Organizar logos encontrados
  const organizedLogos = [];
  
  foundLogos.forEach(logo => {
    const logoName = logo.name.toLowerCase();
    let destDir = logoStructure.ciszu;
    
    // Determinar categoría
    if (logoName.includes('banner') || logoName.includes('header')) {
      destDir = logoStructure.banners;
    } else if (logoName.includes('thumbnail') || logoName.includes('thumb')) {
      destDir = logoStructure.thumbnails;
    } else if (logoName.includes('variant') || logoName.includes('version')) {
      destDir = logoStructure.variants;
    } else if (logo.project !== 'apps') {
      // Es logo de proyecto específico
      const projectDir = path.join(logoStructure.projects, logo.project);
      createDirectory(projectDir);
      destDir = projectDir;
    }
    
    // Copiar logo
    const destPath = path.join(destDir, logo.name);
    
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(logo.path, destPath);
      organizedLogos.push({
        original: logo.relativePath,
        destination: path.relative(ROOT_DIR, destPath),
        category: path.basename(destDir)
      });
      
      console.log(`${COLORS.green}✅ Logo organizado: ${logo.name} → ${path.basename(destDir)}${COLORS.reset}`);
    }
  });
  
  // Crear logos base si no existen
  const baseLogos = [
    { name: 'ciszu_logo.svg', content: '<!-- Logo base de Ciszu Network -->' },
    { name: 'ciszu_logo.png', content: 'PNG placeholder para logo de Ciszu' },
    { name: 'ciszu_favicon.ico', content: 'Favicon placeholder' },
    { name: 'ciszu_banner.png', content: 'Banner placeholder para Ciszu' }
  ];
  
  baseLogos.forEach(baseLogo => {
    const logoPath = path.join(logoStructure.ciszu, baseLogo.name);
    if (!fs.existsSync(logoPath)) {
      fs.writeFileSync(logoPath, baseLogo.content, 'utf-8');
      console.log(`${COLORS.yellow}📄 Logo base creado: ${baseLogo.name}${COLORS.reset}`);
    }
  });
  
  // Crear manifiesto de logos
  const logosManifest = path.join(sharedLogosDir, 'LOGOS_MANIFEST.json');
  const manifestContent = {
    $schema: "../schema.json",
    organized_date: new Date().toISOString(),
    total_logos: organizedLogos.length,
    categories: {
      ciszu: "Logos principales de Ciszu Network",
      projects: "Logos de proyectos específicos",
      banners: "Banners y cabeceras",
      thumbnails: "Miniaturas y previews",
      variants: "Variantes de logos"
    },
    logos: organizedLogos,
    structure: {
      ciszu: "Logos base de la organización",
      projects: "Subdirectorios por proyecto",
      banners: "Imágenes para banners",
      thumbnails: "Miniaturas para preview",
      variants: "Diferentes versiones de logos"
    }
  };
  
  fs.writeFileSync(logosManifest, JSON.stringify(manifestContent, null, 2), 'utf-8');
  
  console.log(`${COLORS.green}📊 Logos organizados: ${organizedLogos.length}${COLORS.reset}`);
  console.log(`${COLORS.blue}📍 Ubicación: ${path.relative(ROOT_DIR, sharedLogosDir)}${COLORS.reset}`);
  
  return organizedLogos;
}

function cleanDuplicateAssets() {
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🧹 LIMPIANDO ASSETS DUPLICADOS${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  // Directorios que pueden contener duplicados
  const potentialDupDirs = [
    'documents/fonts',
    'docs/fonts',
    'public/fonts',
    'website/public/fonts'
  ];
  
  let cleanedCount = 0;
  
  // Recorrer proyectos
  const projects = fs.readdirSync(APPS_DIR).filter(item => {
    const itemPath = path.join(APPS_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  projects.forEach(project => {
    const projectPath = path.join(APPS_DIR, project);
    
    potentialDupDirs.forEach(dir => {
      const dirPath = path.join(projectPath, dir);
      
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        // Verificar si está vacío o casi vacío
        const files = fs.readdirSync(dirPath);
        
        if (files.length <= 1) { // Directorio casi vacío
          try {
            // Mover contenido útil primero
            files.forEach(file => {
              const filePath = path.join(dirPath, file);
              const stat = fs.statSync(filePath);
              
              if (stat.isFile() && stat.size > 0) {
                // Mover a shared si es fuente
                if (dir.includes('fonts')) {
                  const sharedFontsDir = path.join(SHARED_DIR, 'fonts');
                  createDirectory(sharedFontsDir);
                  
                  const destPath = path.join(sharedFontsDir, file);
                  if (!fs.existsSync(destPath)) {
                    fs.copyFileSync(filePath, destPath);
                  }
                }
              }
            });
            
            // Eliminar directorio
            fs.rmdirSync(dirPath, { recursive: true });
            console.log(`${COLORS.green}✅ Limpiado: ${path.relative(ROOT_DIR, dirPath)}${COLORS.reset}`);
            cleanedCount++;
          } catch (error) {
            console.log(`${COLORS.yellow}⚠️  No se pudo limpiar ${dirPath}: ${error.message}${COLORS.reset}`);
          }
        }
      }
    });
  });
  
  console.log(`${COLORS.green}📊 Directorios limpiados: ${cleanedCount}${COLORS.reset}`);
  return cleanedCount;
}

function updateProjectAssetReferences() {
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🔗 ACTUALIZANDO REFERENCIAS A ASSETS${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  // Crear archivo de configuración para assets
  const assetsConfigPath = path.join(SHARED_DIR, 'assets-config.json');
  const configContent = {
    $schema: "./schema.json",
    version: "1.0.0",
    updated: new Date().toISOString(),
    assets: {
      fonts: {
        path: "/shared/fonts",
        cdn_path: "https://cdn.ciszu.net/fonts",
        manifest: "FONTS_MANIFEST.json"
      },
      logos: {
        path: "/shared/logos",
        cdn_path: "https://cdn.ciszu.net/logos",
        manifest: "LOGOS_MANIFEST.json",
        structure: {
          ciszu: "Logos principales",
          projects: "Proyectos específicos",
          banners: "Banners",
          thumbnails: "Thumbnails",
          variants: "Variantes"
        }
      },
      icons: {
        path: "/shared/icons",
        cdn_path: "https://cdn.ciszu.net/icons",
        styles: ["outline", "filled", "flag"],
        formats: ["svg", "png"],
        manifest: "README.md"
      }
    },
    usage: {
      local_development: "Usar rutas /shared/...",
      production: "Usar CDN cuando NEXT_PUBLIC_CDN_URL esté configurado",
      offline_mode: "Siempre usar rutas locales"
    },
    projects: fs.readdirSync(APPS_DIR).filter(item => {
      const itemPath = path.join(APPS_DIR, item);
      return fs.statSync(itemPath).isDirectory();
    })
  };
  
  fs.writeFileSync(assetsConfigPath, JSON.stringify(configContent, null, 2), 'utf-8');
  console.log(`${COLORS.green}✅ Configuración de assets creada${COLORS.reset}`);
  
  // Crear README para shared
  const sharedReadmePath = path.join(SHARED_DIR, 'README.md');
  const sharedReadmeContent = `# 🗂️ Recursos Compartidos - Ciszu Network

## 📁 Estructura

\`\`\`
shared/
├── 📂 icons/              # Sistema de iconos (351 iconos únicos)
│   ├── outline/          # Iconos outline (170)
│   ├── filled/           # Iconos filled (151)
│   └── flag/             # Banderas (30)
├── 📂 fonts/             # Fuentes tipográficas consolidadas
├── 📂 logos/             # Logos organizados por categoría
├── 📂 documentation/     # Documentación compartida
├── assets-config.json    # Configuración centralizada
└── README.md            # Este archivo
\`\`\`

## 🎨 Sistema de Iconos

### Estadísticas
- **Total iconos**: 351 únicos
- **Estilos**: Outline (170), Filled (151), Flag (30)
- **Formatos**: SVG (web), PNG (preview)
- **Ubicación CDN**: https://cdn.ciszu.net/icons

### Uso en Proyectos
\`\`\`typescript
// Importar desde cualquier proyecto
import { IconComponent } from './src/utils/icons';

// Uso básico
<IconComponent name="home" style="outline" />
<IconComponent name="search" style="filled" format="png" size={64} />
\`\`\`

## 🔤 Sistema de Fuentes

### Características
- Fuentes consolidadas en un solo lugar
- Referencia única para todos los proyectos
- Soporte para CDN en producción

### Uso
\`\`\`css
/* En CSS */
@font-face {
  font-family: 'MiFuente';
  src: url('/shared/fonts/mifuente.ttf');
}

/* En Next.js */
import localFont from 'next/font/local';
const myFont = localFont({ src: '../shared/fonts/mifuente.ttf' });
\`\`\`

## 🖼️ Sistema de Logos

### Estructura
\`\`\`
logos/
├── ciszu/              # Logos principales de Ciszu
├── projects/           # Logos por proyecto
├── banners/            # Banners y cabeceras
├── thumbnails/         # Miniaturas
└── variants/           # Variantes de logos
\`\`\`

### Uso
\`\`\`javascript
// Logo principal
const mainLogo = '/shared/logos/ciszu/ciszu_logo.svg';

// Logo de proyecto específico
const projectLogo = '/shared/logos/projects/muzicmania/logo.png';
\`\`\`

## 📄 Documentación Compartida

### Contenido
- **ACTA_CONSTITUTIVA**: Documento base para todos los proyectos
- **Plantillas**: Estructuras estándar para documentación
- **Guías**: Instrucciones para uso de recursos compartidos

## ⚙️ Configuración

### Variables de Entorno
\`\`\`bash
# Modo de assets
NEXT_PUBLIC_ASSET_MODE=hybrid  # hybrid, local, cdn

# URL del CDN
NEXT_PUBLIC_CDN_URL=https://cdn.ciszu.net

# Modo de iconos
NEXT_PUBLIC_ICON_MODE=hybrid
\`\`\`

### Modos de Operación
1. **Local**: Para desarrollo sin internet
2. **CDN**: Para producción con internet
3. **Híbrido**: CDN con fallback a local

## 🔄 Mantenimiento

### Agregar Nuevos Recursos
1. Colocar el recurso en la carpeta correspondiente de \`shared/\`
2. Actualizar el manifiesto correspondiente
3. Ejecutar \`node scripts/organize-assets.js\`

### Actualizar desde Proyectos
\`\`\`bash
# Consolida fuentes y logos de todos los proyectos
node scripts/organize-assets.js

# Actualiza referencias en proyectos
node scripts/update-asset-references.js
\`\`\`

## 📊 Monitoreo

### Archivos de Manifiesto
- \`shared/fonts/FONTS_MANIFEST.json\` - Registro de fuentes
- \`shared/logos/LOGOS_MANIFEST.json\` - Registro de logos
- \`shared/icons/README.md\` - Documentación de iconos

## 🚀 Implementación en CDN

### Subida a CDN
\`\`\`bash
# Script para subir recursos al CDN
node scripts/upload-to-cdn.js --assets icons fonts logos
\`\`\`

### Referencia en Código
Los proyectos deben usar las rutas relativas \`/shared/\` durante desarrollo
y cambiar automáticamente al CDN en producción cuando corresponda.

---

*Última actualización: ${new Date().toISOString().split('T')[0]}*`;
  
  fs.writeFileSync(sharedReadmePath, sharedReadmeContent, 'utf-8');
  console.log(`${COLORS.green}✅ README de recursos compartidos creado${COLORS.reset}`);
  
  return configContent;
}

function main() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║   ORGANIZACIÓN DE ASSETS - CISZU NETWORK        ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  // 1. Organizar fuentes
  const fonts = organizeFonts();
  
  // 2. Organizar logos
  const logos = organizeLogos();
  
  // 3. Limpiar duplicados
  const cleaned = cleanDuplicateAssets();
  
  // 4. Actualizar referencias
  const config = updateProjectAssetReferences();
  
  // Resumen final
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║               RESUMEN FINAL                      ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  console.log(`${COLORS.green}🎯 ORGANIZACIÓN COMPLETADA${COLORS.reset}`);
  console.log(`${COLORS.cyan}📊 Estadísticas:${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Fuentes consolidadas: ${fonts.length}${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Logos organizados: ${logos.length}${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Directorios limpiados: ${cleaned}${COLORS.reset}`);
  
  console.log(`\n${COLORS.cyan}📁 Estructura creada:${COLORS.reset}`);
  console.log(`${COLORS.yellow}  shared/fonts/ - ${fonts.length} fuentes${COLORS.reset}`);
  console.log(`${COLORS.yellow}  shared/logos/ - Logos organizados por categoría${COLORS.reset}`);
  console.log(`${COLORS.yellow}  shared/icons/ - 351 iconos en 2 formatos${COLORS.reset}`);
  console.log(`${COLORS.yellow}  shared/documentation/ - Documentos base${COLORS.reset}`);
  
  console.log(`\n${COLORS.cyan}🚀 Próximos pasos:${COLORS.reset}`);
  console.log(`${COLORS.yellow}1. Configurar variables de entorno en cada proyecto${COLORS.reset}`);
  console.log(`${COLORS.yellow}2. Actualizar imports en código para usar shared/assets${COLORS.reset}`);
  console.log(`${COLORS.yellow}3. Configurar CDN para producción${COLORS.reset}`);
  console.log(`${COLORS.yellow}4. Ejecutar scripts de conversión de documentos${COLORS.reset}`);
  
  console.log(`\n${COLORS.green}🎉 Sistema de assets organizado y centralizado${COLORS.reset}`);
}

// Ejecutar organización
try {
  main();
} catch (error) {
  console.error(`${COLORS.red}❌ Error en la organización: ${error.message}${COLORS.reset}`);
  process.exit(1);
}