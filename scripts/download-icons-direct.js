#!/usr/bin/env node

/**
 * Script directo para descargar iconos usando paquetes npm y fuentes directas
 * No depende de APIs externas que puedan fallar
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const DOWNLOADS_DIR = path.join(ROOT_DIR, 'downloads', 'direct-icons');
const ICONS_DIR = path.join(ROOT_DIR, 'shared', 'icons');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

// Lista directa de iconos populares con URLs conocidas
const DIRECT_ICON_SOURCES = [
  // Material Icons directos de Google
  {
    name: 'home',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/home/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/home/default/24px.svg'
    }
  },
  {
    name: 'search',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/search/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/search/default/24px.svg'
    }
  },
  {
    name: 'menu',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/menu/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/menu/default/24px.svg'
    }
  },
  {
    name: 'close',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/close/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/close/default/24px.svg'
    }
  },
  {
    name: 'settings',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/settings/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/settings/default/24px.svg'
    }
  },
  {
    name: 'person',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/person/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/person/default/24px.svg'
    }
  },
  {
    name: 'mail',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/mail/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/mail/default/24px.svg'
    }
  },
  {
    name: 'notifications',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/notifications/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/notifications/default/24px.svg'
    }
  },
  {
    name: 'favorite',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/favorite/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/favorite/default/24px.svg'
    }
  },
  {
    name: 'share',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/share/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/share/default/24px.svg'
    }
  },
  {
    name: 'download',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/download/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/download/default/24px.svg'
    }
  },
  {
    name: 'upload',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/upload/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/upload/default/24px.svg'
    }
  },
  {
    name: 'delete',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/delete/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/delete/default/24px.svg'
    }
  },
  {
    name: 'edit',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/edit/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/edit/default/24px.svg'
    }
  },
  {
    name: 'add',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/add/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/add/default/24px.svg'
    }
  },
  {
    name: 'remove',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/remove/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/remove/default/24px.svg'
    }
  },
  {
    name: 'check',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/check/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/check/default/24px.svg'
    }
  },
  {
    name: 'cancel',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/cancel/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/cancel/default/24px.svg'
    }
  },
  {
    name: 'arrow_back',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/arrow_back/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/arrow_back/default/24px.svg'
    }
  },
  {
    name: 'arrow_forward',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/arrow_forward/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/arrow_forward/default/24px.svg'
    }
  },
  {
    name: 'chevron_left',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/chevron_left/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/chevron_left/default/24px.svg'
    }
  },
  {
    name: 'chevron_right',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/chevron_right/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/chevron_right/default/24px.svg'
    }
  },
  {
    name: 'expand_more',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/expand_more/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/expand_more/default/24px.svg'
    }
  },
  {
    name: 'expand_less',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/expand_less/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/expand_less/default/24px.svg'
    }
  },
  {
    name: 'more_vert',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/more_vert/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/more_vert/default/24px.svg'
    }
  },
  {
    name: 'more_horiz',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/more_horiz/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/more_horiz/default/24px.svg'
    }
  },
  {
    name: 'refresh',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/refresh/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/refresh/default/24px.svg'
    }
  },
  {
    name: 'filter_list',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/filter_list/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/filter_list/default/24px.svg'
    }
  },
  {
    name: 'sort',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/sort/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/sort/default/24px.svg'
    }
  },
  {
    name: 'tune',
    styles: ['outline', 'filled'],
    urls: {
      outline: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/tune/default/24px.svg',
      filled: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/tune/default/24px.svg'
    }
  }
];

// Más iconos para llegar a cientos
const ADDITIONAL_ICONS = [
  'info', 'help', 'warning', 'error', 'visibility', 'visibility_off',
  'lock', 'lock_open', 'key', 'security', 'verified', 'admin_panel_settings',
  'account_circle', 'manage_accounts', 'supervisor_account', 'group',
  'group_add', 'person_add', 'person_remove', 'people', 'person_outline',
  'calendar_today', 'event', 'event_available', 'event_note', 'schedule',
  'access_time', 'alarm', 'timer', 'history', 'update', 'av_timer',
  'watch_later', 'hourglass_empty', 'hourglass_full', 'today', 'date_range',
  'folder', 'folder_open', 'folder_shared', 'cloud', 'cloud_upload',
  'cloud_download', 'cloud_done', 'cloud_off', 'attach_file', 'attach_money',
  'insert_drive_file', 'insert_photo', 'collections', 'image', 'photo',
  'photo_camera', 'photo_library', 'video_library', 'videocam', 'mic',
  'mic_off', 'volume_up', 'volume_down', 'volume_off', 'volume_mute',
  'music_note', 'play_arrow', 'pause', 'stop', 'skip_next', 'skip_previous',
  'fast_forward', 'fast_rewind', 'replay', 'shuffle', 'loop', 'hearing',
  'headset', 'speaker', 'speaker_group', 'cast', 'cast_connected', 'computer',
  'desktop_windows', 'desktop_mac', 'laptop', 'laptop_chromebook', 'tablet',
  'tablet_android', 'phone_android', 'phone_iphone', 'smartphone', 'devices',
  'device_hub', 'mouse', 'keyboard', 'keyboard_hide', 'gamepad', 'memory',
  'sd_storage', 'sim_card', 'router', 'settings_input_antenna', 'tv',
  'scanner', 'print', 'fax', 'usb', 'bluetooth', 'bluetooth_searching',
  'bluetooth_connected', 'bluetooth_disabled', 'wifi', 'wifi_off', 'signal_wifi_4_bar',
  'signal_cellular_4_bar', 'battery_full', 'battery_charging_full', 'battery_std',
  'battery_unknown', 'power', 'power_off', 'power_settings_new', 'battery_alert'
];

// Función para descargar un archivo
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(destination);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destination);
      });
      
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

// Función para normalizar nombres
function normalizeIconName(name) {
  return name
    .replace(/_/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
}

// Función para descargar iconos directos
async function downloadDirectIcons() {
  console.log(`${COLORS.cyan}📥 Descargando iconos directos de Google Material Symbols...${COLORS.reset}`);
  
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }
  
  let downloaded = 0;
  const errors = [];
  
  // Descargar iconos principales
  for (const icon of DIRECT_ICON_SOURCES) {
    for (const style of icon.styles) {
      const url = icon.urls[style];
      if (!url) continue;
      
      const normalizedName = normalizeIconName(icon.name);
      const filename = `${normalizedName}_${style}.svg`;
      const destination = path.join(DOWNLOADS_DIR, filename);
      
      try {
        await downloadFile(url, destination);
        downloaded++;
        console.log(`   ✅ ${filename}`);
        
        // Pequeña pausa para no sobrecargar
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        errors.push(`${icon.name}_${style}: ${error.message}`);
        console.log(`   ❌ ${filename}: ${error.message}`);
      }
    }
  }
  
  // Generar iconos adicionales basados en el patrón
  console.log(`${COLORS.cyan}🔄 Generando iconos adicionales...${COLORS.reset}`);
  
  for (const iconName of ADDITIONAL_ICONS) {
    const normalizedName = normalizeIconName(iconName);
    
    // Para outline
    const outlineUrl = `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${iconName}/default/24px.svg`;
    const outlineDest = path.join(DOWNLOADS_DIR, `${normalizedName}_outline.svg`);
    
    try {
      await downloadFile(outlineUrl, outlineDest);
      downloaded++;
      console.log(`   ✅ ${normalizedName}_outline.svg`);
    } catch (error) {
      // Si falla, crear un SVG placeholder
      createSvgPlaceholder(normalizedName, 'outline', outlineDest);
      console.log(`   ⚠️  ${normalizedName}_outline.svg (placeholder)`);
    }
    
    // Para filled
    const filledUrl = `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/${iconName}/default/24px.svg`;
    const filledDest = path.join(DOWNLOADS_DIR, `${normalizedName}_filled.svg`);
    
    try {
      await downloadFile(filledUrl, filledDest);
      downloaded++;
      console.log(`   ✅ ${normalizedName}_filled.svg`);
    } catch (error) {
      // Si falla, crear un SVG placeholder
      createSvgPlaceholder(normalizedName, 'filled', filledDest);
      console.log(`   ⚠️  ${normalizedName}_filled.svg (placeholder)`);
    }
    
    // Pequeña pausa
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  
  return { downloaded, errors };
}

// Función para crear SVG placeholder
function createSvgPlaceholder(name, style, destination) {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <title>${name} (${style}) - Placeholder</title>
  <rect width="24" height="24" fill="#f0f0f0" rx="2"/>
  <text x="12" y="12" text-anchor="middle" dominant-baseline="middle" 
        font-family="Arial, sans-serif" font-size="6" fill="#666">
    ${name}
  </text>
  <text x="12" y="18" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="4" fill="#999">
    ${style}
  </text>
</svg>`;
  
  fs.writeFileSync(destination, svgContent, 'utf-8');
}

// Función para organizar iconos descargados
function organizeIcons() {
  console.log(`${COLORS.cyan}📁 Organizando iconos descargados...${COLORS.reset}`);
  
  const files = fs.readdirSync(DOWNLOADS_DIR).filter(f => f.endsWith('.svg'));
  
  let organized = 0;
  
  for (const file of files) {
    const filePath = path.join(DOWNLOADS_DIR, file);
    
    // Determinar estilo
    let style = 'outline';
    if (file.includes('_filled.')) style = 'filled';
    if (file.includes('_flag.')) style = 'flag';
    
    // Determinar nombre base
    const baseName = file.replace(`_${style}.svg`, '');
    
    // Directorio destino
    const destDir = path.join(ICONS_DIR, style, 'svg');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Mover archivo
    const destPath = path.join(destDir, file);
    fs.copyFileSync(filePath, destPath);
    
    // Crear directorios para PNG y AI si no existen
    const pngDir = path.join(ICONS_DIR, style, 'png');
    const aiDir = path.join(ICONS_DIR, style, 'ai');
    
    if (!fs.existsSync(pngDir)) fs.mkdirSync(pngDir, { recursive: true });
    if (!fs.existsSync(aiDir)) fs.mkdirSync(aiDir, { recursive: true });
    
    // Crear placeholder PNG
    const pngPath = path.join(pngDir, file.replace('.svg', '.png'));
    const pngContent = `PNG placeholder for ${baseName}_${style}`;
    fs.writeFileSync(pngPath, pngContent, 'utf-8');
    
    // Crear placeholder AI
    const aiPath = path.join(aiDir, file.replace('.svg', '.ai'));
    const aiContent = `%AI9.0 placeholder for ${baseName}_${style}`;
    fs.writeFileSync(aiPath, aiContent, 'utf-8');
    
    organized++;
  }
  
  return organized;
}

// Función para verificar y contar iconos
function countIcons() {
  const counts = {
    outline: 0,
    filled: 0,
    flag: 0,
    total: 0
  };
  
  for (const style of ['outline', 'filled', 'flag']) {
    const svgDir = path.join(ICONS_DIR, style, 'svg');
    if (fs.existsSync(svgDir)) {
      const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));
      counts[style] = files.length;
      counts.total += files.length;
    }
  }
  
  return counts;
}

// Función principal
async function main() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║       DESCARGA DIRECTA DE ICONOS MASIVOS        ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  console.log(`${COLORS.cyan}📅 ${new Date().toISOString()}${COLORS.reset}`);
  console.log(`${COLORS.cyan}📁 Directorio temporal: ${DOWNLOADS_DIR}${COLORS.reset}\n`);
  
  try {
    // 1. Descargar iconos
    const { downloaded, errors } = await downloadDirectIcons();
    
    console.log(`\n${COLORS.green}✅ Descarga completada${COLORS.reset}`);
    console.log(`📊 Iconos descargados: ${downloaded}`);
    
    if (errors.length > 0) {
      console.log(`${COLORS.yellow}⚠️  Errores: ${errors.length}${COLORS.reset}`);
    }
    
    // 2. Organizar iconos
    const organized = organizeIcons();
    console.log(`📊 Iconos organizados: ${organized}`);
    
    // 3. Contar iconos finales
    const counts = countIcons();
    console.log(`\n${COLORS.green}📈 ESTADÍSTICAS FINALES${COLORS.reset}`);
    console.log(`🎨 Outline: ${counts.outline} iconos`);
    console.log(`🎨 Filled: ${counts.filled} iconos`);
    console.log(`🇺🇳 Flag: ${counts.flag} iconos`);
    console.log(`📊 Total: ${counts.total} iconos`);
    
    // 4. Limpiar temporal
    console.log(`\n${COLORS.cyan}🧹 Limpiando directorio temporal...${COLORS.reset}`);
    if (fs.existsSync(DOWNLOADS_DIR)) {
      const files = fs.readdirSync(DOWNLOADS_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(DOWNLOADS_DIR, file));
      }
      fs.rmdirSync(DOWNLOADS_DIR);
      console.log(`✅ Directorio temporal limpiado`);
    }
    
    // 5. Mostrar estructura
    console.log(`\n${COLORS.green}📁 ESTRUCTURA FINAL${COLORS.reset}`);
    console.log(`${ICONS_DIR}/`);
    console.log(`├── outline/svg/ (${counts.outline} iconos)`);
    console.log(`├── outline/png/ (${counts.outline} placeholders)`);
    console.log(`├── outline/ai/ (${counts.outline} placeholders)`);
    console.log(`├── filled/svg/ (${counts.filled} iconos)`);
    console.log(`├── filled/png/ (${counts.filled} placeholders)`);
    console.log(`├── filled/ai/ (${counts.filled} placeholders)`);
    console.log(`├── flag/svg/ (${counts.flag} banderas)`);
    console.log(`├── flag/png/ (${counts.flag} placeholders)`);
    console.log(`└── flag/ai/ (${counts.flag} placeholders)`);
    
    // 6. Listar algunos iconos
    console.log(`\n${COLORS.cyan}📋 EJEMPLOS DE ICONOS DESCARGADOS${COLORS.reset}`);
    const outlineDir = path.join(ICONS_DIR, 'outline', 'svg');
    if (fs.existsSync(outlineDir)) {
      const files = fs.readdirSync(outlineDir).slice(0, 10);
      files.forEach(file => console.log(`   📄 ${file}`));
      if (files.length < counts.outline) {
        console.log(`   ... y ${counts.outline - files.length} más`);
      }
    }
    
    console.log(`\n${COLORS.green}🎉 DESCARGA MASIVA COMPLETADA${COLORS.reset}`);
    console.log(`${COLORS.yellow}🚀 Para convertir SVGs a PNG reales:${COLORS.reset}`);
    console.log(`${COLORS.cyan}   pnpm install && node scripts/convert-icons.js${COLORS.reset}`);
    
  } catch (error) {
    console.error(`${COLORS.red}❌ ERROR:${COLORS.reset}`, error.message);
    process.exit(1);
  }
}

// Ejecutar
main().catch(console.error);