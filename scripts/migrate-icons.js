#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para migrar iconos inline a imports del nuevo sistema
 * 
 * Busca archivos TypeScript/JavaScript que contengan iconos inline
 * y los reemplaza por imports del sistema de iconos compartidos.
 */

const ROOT_DIR = path.join(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const SHARED_ICONS_DIR = path.join(ROOT_DIR, 'shared', 'icons');

// Mapeo de iconos existentes en código a sus nombres en el nuevo sistema
const ICON_MAPPING = {
  // Del archivo navigation.tsx
  'home': 'home_outline',
  'projects': 'projects_outline',
  'about': 'about_outline',
  'info': 'info_outline',
  'faq': 'faq_outline',
  'policies': 'policies_outline',
  'support': 'support_outline',
  'certificates': 'certificates_outline',
  'team': 'team_outline',
  'contact': 'contact_outline',
  'search': 'search_outline',
  'menu': 'menu_outline',
  'close': 'close_outline',
  'sun': 'sun_outline',
  'moon': 'moon_outline',
  'globe': 'globe_outline',
  'chevronDown': 'chevron_down_outline',
  'chevronRight': 'chevron_right_outline',
  'external': 'external_outline',
  'guidelines': 'guidelines_outline',
  'help': 'help_outline',
  'terms': 'terms_outline',
  'whatsapp': 'whatsapp_outline',
  'discord': 'discord_outline',
};

// Patrones para buscar iconos inline
const INLINE_ICON_PATTERNS = [
  /<svg[^>]*>[\s\S]*?<\/svg>/g, // SVG completo
  /icon:\s*<svg/g, // Propiedad icon con SVG
  /I\.(\w+)/g, // Referencias a I.home, I.search, etc.
];

function findInlineIcons(content) {
  const icons = new Set();
  
  // Buscar referencias como I.home, I.search, etc.
  const iconRefs = content.match(/I\.(\w+)/g);
  if (iconRefs) {
    iconRefs.forEach(ref => {
      const match = ref.match(/I\.(\w+)/);
      if (match && match[1]) {
        icons.add(match[1]);
      }
    });
  }
  
  // Buscar SVGs inline
  const svgMatches = content.match(/<svg[^>]*>[\s\S]*?<\/svg>/g);
  if (svgMatches) {
    // Podríamos analizar los SVGs para identificar iconos específicos
    // Por ahora, marcamos que hay SVGs inline
    if (svgMatches.length > 0) {
      icons.add('INLINE_SVG_DETECTED');
    }
  }
  
  return Array.from(icons);
}

function generateImportStatement(iconNames) {
  const imports = iconNames
    .filter(name => ICON_MAPPING[name])
    .map(name => {
      const iconFile = ICON_MAPPING[name];
      return `import ${name}Icon from '@shared/icons/outline/svg/${iconFile}.svg';`;
    });
  
  return imports.join('\n');
}

function replaceIconReferences(content, iconNames) {
  let newContent = content;
  
  // Reemplazar I.home por homeIcon
  iconNames.forEach(name => {
    if (ICON_MAPPING[name]) {
      const regex = new RegExp(`I\\.${name}`, 'g');
      newContent = newContent.replace(regex, `${name}Icon`);
    }
  });
  
  return newContent;
}

async function migrateFile(filePath) {
  console.log(`📁 Procesando: ${path.relative(ROOT_DIR, filePath)}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const iconNames = findInlineIcons(content);
  
  if (iconNames.length === 0) {
    console.log('  ⏭️  No se encontraron iconos inline');
    return false;
  }
  
  console.log(`  🔍 Iconos encontrados: ${iconNames.join(', ')}`);
  
  // Generar imports
  const imports = generateImportStatement(iconNames);
  if (!imports) {
    console.log('  ⚠️  No hay iconos mapeados para importar');
    return false;
  }
  
  // Reemplazar contenido
  let newContent = content;
  
  // Agregar imports después del último import
  const lastImportIndex = newContent.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const nextLine = newContent.indexOf('\n', lastImportIndex);
    newContent = newContent.slice(0, nextLine) + '\n' + imports + newContent.slice(nextLine);
  } else {
    // Si no hay imports, agregar al inicio
    newContent = imports + '\n' + newContent;
  }
  
  // Reemplazar referencias
  newContent = replaceIconReferences(newContent, iconNames);
  
  // Guardar archivo
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log('  ✅ Migración completada');
  return true;
}

async function findFilesToMigrate(dir) {
  const files = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      
      if (item.isDirectory()) {
        // Ignorar node_modules y .next
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item.name)) {
          walk(fullPath);
        }
      } else if (item.isFile()) {
        // Buscar archivos TypeScript/JavaScript
        if (/\.(ts|tsx|js|jsx)$/.test(item.name)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

async function main() {
  console.log('🚀 Iniciando migración de iconos inline...\n');
  
  // Buscar archivos en apps/
  const files = await findFilesToMigrate(APPS_DIR);
  console.log(`📂 Encontrados ${files.length} archivos para procesar\n`);
  
  let migratedCount = 0;
  
  for (const file of files) {
    try {
      const migrated = await migrateFile(file);
      if (migrated) migratedCount++;
    } catch (error) {
      console.error(`❌ Error procesando ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Migración completada!`);
  console.log(`✅ ${migratedCount} archivos migrados de ${files.length} procesados`);
  console.log(`\n📋 Pasos manuales necesarios:`);
  console.log(`1. Actualizar tsconfig.json para incluir alias @shared`);
  console.log(`2. Configurar Vite/Next.js para procesar archivos SVG`);
  console.log(`3. Verificar que los imports funcionen correctamente`);
  console.log(`\n💡 Para agregar más iconos:`);
  console.log(`- Descarga de Iconify: https://icon-sets.iconify.design/`);
  console.log(`- Organiza en shared/icons/ según estilo y formato`);
}

// Ejecutar migración
main().catch(console.error);