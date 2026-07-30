#!/usr/bin/env node

/**
 * Script para descargar iconos de Iconify y organizarlos en la estructura de Ciszu
 * 
 * Nota: Este script requiere conexión a internet y usa la API pública de Iconify
 * 
 * Uso:
 * node scripts/download-icons.js --category=navigation --count=20
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.join(__dirname, '..');
const ICONS_DIR = path.join(ROOT_DIR, 'shared', 'icons');

// Categorías de iconos populares para Ciszu Network
const CATEGORIES = {
  navigation: ['home', 'search', 'menu', 'close', 'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'external-link', 'settings', 'user', 'users', 'bell', 'star', 'heart'],
  ui: ['check', 'x', 'plus', 'minus', 'alert-circle', 'info', 'help-circle', 'mail', 'phone', 'globe', 'sun', 'moon', 'wifi', 'battery', 'download', 'upload', 'share', 'edit', 'trash', 'copy'],
  social: ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 'github', 'discord', 'whatsapp', 'tiktok', 'twitch', 'reddit', 'spotify', 'apple', 'google', 'microsoft'],
  actions: ['play', 'pause', 'stop', 'skip-forward', 'skip-back', 'volume', 'mute', 'camera', 'image', 'video', 'music', 'mic', 'headphones', 'gamepad', 'keyboard', 'mouse'],
  files: ['file', 'folder', 'document', 'image', 'video', 'audio', 'archive', 'pdf', 'word', 'excel', 'powerpoint'],
  commerce: ['shopping-cart', 'credit-card', 'tag', 'gift', 'package', 'truck', 'store', 'cart', 'cash', 'coin'],
  music: ['music', 'play-circle', 'pause-circle', 'stop-circle', 'skip-forward-circle', 'skip-back-circle', 'volume-2', 'headphones', 'mic', 'radio'],
};

// Sets de iconos populares de Iconify
const ICON_SETS = [
  'material-symbols', // Google Material Symbols
  'tabler', // Tabler Icons
  'heroicons', // Heroicons
  'lucide', // Lucide Icons
  'fa6-solid', // Font Awesome 6 Solid
];

function downloadIcon(iconSet, iconName, style = 'outline', format = 'svg') {
  return new Promise((resolve, reject) => {
    const url = `https://api.iconify.design/${iconSet}/${iconName}.svg`;
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

function saveIcon(iconName, svgContent, style, format) {
  const styleDir = path.join(ICONS_DIR, style, format);
  const filename = path.join(styleDir, `${iconName}_${style}.${format}`);
  
  // Asegurar que el directorio existe
  if (!fs.existsSync(styleDir)) {
    fs.mkdirSync(styleDir, { recursive: true });
  }
  
  fs.writeFileSync(filename, svgContent, 'utf-8');
  console.log(`✅ Guardado: ${iconName}_${style}.${format}`);
}

function generatePngPlaceholder(iconName, style) {
  // En un sistema real, usaríamos una librería como sharp o canvas
  // para convertir SVG a PNG. Por ahora, creamos un placeholder.
  const pngContent = `PNG placeholder for ${iconName}_${style}`;
  return pngContent;
}

function generateAiPlaceholder(iconName, style) {
  // Placeholder para archivos AI (Illustrator)
  return `%AI9.0 placeholder for ${iconName}_${style}`;
}

async function downloadCategory(category, count = 20) {
  console.log(`📥 Descargando iconos de categoría: ${category}`);
  console.log(`📊 Cantidad: ${count}`);
  
  const iconNames = CATEGORIES[category] || [];
  const iconsToDownload = iconNames.slice(0, count);
  
  let downloaded = 0;
  
  for (const iconName of iconsToDownload) {
    try {
      // Intentar diferentes sets de iconos
      for (const iconSet of ICON_SETS) {
        try {
          console.log(`🔍 Buscando ${iconName} en ${iconSet}...`);
          
          // Descargar SVG
          const svgContent = await downloadIcon(iconSet, iconName, 'outline', 'svg');
          
          // Guardar SVG
          saveIcon(iconName, svgContent, 'outline', 'svg');
          
          // Generar placeholder PNG
          const pngContent = generatePngPlaceholder(iconName, 'outline');
          saveIcon(iconName, pngContent, 'outline', 'png');
          
          // Generar placeholder AI
          const aiContent = generateAiPlaceholder(iconName, 'outline');
          saveIcon(iconName, aiContent, 'outline', 'ai');
          
          downloaded++;
          console.log(`✨ ${iconName} descargado correctamente\n`);
          break; // Salir del loop de sets si se encontró
          
        } catch (error) {
          // Icono no encontrado en este set, intentar siguiente
          continue;
        }
      }
      
    } catch (error) {
      console.log(`❌ Error con ${iconName}: ${error.message}`);
    }
    
    // Pequeña pausa para no sobrecargar la API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n🎉 Categoría ${category} completada!`);
  console.log(`✅ ${downloaded}/${iconsToDownload.length} iconos descargados`);
}

async function main() {
  console.log('🎨 Sistema de descarga de iconos para Ciszu Network\n');
  
  // Verificar que el directorio de iconos existe
  if (!fs.existsSync(ICONS_DIR)) {
    console.log('⚠️  Directorio de iconos no encontrado. Creando estructura...');
    fs.mkdirSync(ICONS_DIR, { recursive: true });
    
    // Crear estructura de carpetas
    const styles = ['outline', 'filled', 'flag'];
    const formats = ['svg', 'png', 'ai'];
    
    for (const style of styles) {
      for (const format of formats) {
        const dir = path.join(ICONS_DIR, style, format);
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }
  
  // Descargar iconos por categoría
  const categories = Object.keys(CATEGORIES);
  
  for (const category of categories) {
    await downloadCategory(category, 15); // 15 iconos por categoría
    console.log('\n---\n');
  }
  
  console.log('📋 Resumen de descargas:');
  console.log(`📁 Total categorías: ${categories.length}`);
  console.log(`🎯 Iconos por categoría: ~15`);
  console.log(`🎨 Total estimado: ~${categories.length * 15} iconos`);
  
  console.log('\n📝 Notas importantes:');
  console.log('1. Los archivos PNG y AI son placeholders');
  console.log('2. Para PNG reales: convertir SVG con Inkscape o Figma');
  console.log('3. Para AI reales: usar archivos originales de diseño');
  console.log('4. Revisar licencias de los iconos descargados');
  console.log('\n🔗 Recursos:');
  console.log('- Iconify: https://icon-sets.iconify.design/');
  console.log('- Flaticon: https://www.flaticon.com/');
  console.log('- Font Awesome: https://fontawesome.com/');
  console.log('- Heroicons: https://heroicons.com/');
}

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2);
const categoryArg = args.find(arg => arg.startsWith('--category='));
const countArg = args.find(arg => arg.startsWith('--count='));

if (categoryArg) {
  const category = categoryArg.split('=')[1];
  const count = countArg ? parseInt(countArg.split('=')[1]) : 20;
  
  if (CATEGORIES[category]) {
    downloadCategory(category, count).catch(console.error);
  } else {
    console.log(`❌ Categoría no válida: ${category}`);
    console.log(`📋 Categorías disponibles: ${Object.keys(CATEGORIES).join(', ')}`);
  }
} else {
  // Descargar todas las categorías
  main().catch(console.error);
}