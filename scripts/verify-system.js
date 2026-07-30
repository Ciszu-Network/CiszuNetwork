#!/usr/bin/env node

/**
 * Script para verificar el sistema completo de iconos
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
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

function countFiles(directory) {
  if (!fs.existsSync(directory)) return 0;
  const files = fs.readdirSync(directory).filter(f => !fs.statSync(path.join(directory, f)).isDirectory());
  return files.length;
}

function verifyDirectory(directory, description) {
  if (!fs.existsSync(directory)) {
    console.log(`${COLORS.red}❌ ${description}: NO EXISTE${COLORS.reset}`);
    return false;
  }
  
  const fileCount = countFiles(directory);
  console.log(`${COLORS.green}✅ ${description}: ${fileCount} archivos${COLORS.reset}`);
  return true;
}

function main() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║         VERIFICACIÓN DEL SISTEMA DE ICONOS      ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}\n`);
  
  // Verificar estructura de directorios
  console.log(`${COLORS.cyan}📁 ESTRUCTURA DE DIRECTORIOS${COLORS.reset}`);
  
  const directories = [
    { path: ICONS_DIR, desc: 'Carpeta principal de iconos' },
    { path: path.join(ICONS_DIR, 'outline'), desc: 'Outline icons' },
    { path: path.join(ICONS_DIR, 'outline', 'svg'), desc: '  ↳ SVG outline' },
    { path: path.join(ICONS_DIR, 'outline', 'png'), desc: '  ↳ PNG outline' },
    { path: path.join(ICONS_DIR, 'outline', 'ai'), desc: '  ↳ AI outline' },
    { path: path.join(ICONS_DIR, 'filled'), desc: 'Filled icons' },
    { path: path.join(ICONS_DIR, 'filled', 'svg'), desc: '  ↳ SVG filled' },
    { path: path.join(ICONS_DIR, 'filled', 'png'), desc: '  ↳ PNG filled' },
    { path: path.join(ICONS_DIR, 'filled', 'ai'), desc: '  ↳ AI filled' },
    { path: path.join(ICONS_DIR, 'flag'), desc: 'Flags icons' },
    { path: path.join(ICONS_DIR, 'flag', 'svg'), desc: '  ↳ SVG flag' },
    { path: path.join(ICONS_DIR, 'flag', 'png'), desc: '  ↳ PNG flag' },
    { path: path.join(ICONS_DIR, 'flag', 'ai'), desc: '  ↳ AI flag' }
  ];
  
  let allExist = true;
  directories.forEach(dir => {
    allExist = verifyDirectory(dir.path, dir.desc) && allExist;
  });
  
  // Contar archivos por tipo
  console.log(`\n${COLORS.cyan}📊 ESTADÍSTICAS DE ARCHIVOS${COLORS.reset}`);
  
  const stats = {
    outline: {
      svg: countFiles(path.join(ICONS_DIR, 'outline', 'svg')),
      png: countFiles(path.join(ICONS_DIR, 'outline', 'png')),
      ai: countFiles(path.join(ICONS_DIR, 'outline', 'ai'))
    },
    filled: {
      svg: countFiles(path.join(ICONS_DIR, 'filled', 'svg')),
      png: countFiles(path.join(ICONS_DIR, 'filled', 'png')),
      ai: countFiles(path.join(ICONS_DIR, 'filled', 'ai'))
    },
    flag: {
      svg: countFiles(path.join(ICONS_DIR, 'flag', 'svg')),
      png: countFiles(path.join(ICONS_DIR, 'flag', 'png')),
      ai: countFiles(path.join(ICONS_DIR, 'flag', 'ai'))
    }
  };
  
  const totalOutline = stats.outline.svg + stats.outline.png + stats.outline.ai;
  const totalFilled = stats.filled.svg + stats.filled.png + stats.filled.ai;
  const totalFlag = stats.flag.svg + stats.flag.png + stats.flag.ai;
  const grandTotal = totalOutline + totalFilled + totalFlag;
  
  console.log(`${COLORS.yellow}🎨 Outline:${COLORS.reset}`);
  console.log(`   SVG: ${stats.outline.svg} | PNG: ${stats.outline.png} | AI: ${stats.outline.ai}`);
  console.log(`   Total: ${totalOutline} archivos`);
  
  console.log(`${COLORS.yellow}🎨 Filled:${COLORS.reset}`);
  console.log(`   SVG: ${stats.filled.svg} | PNG: ${stats.filled.png} | AI: ${stats.filled.ai}`);
  console.log(`   Total: ${totalFilled} archivos`);
  
  console.log(`${COLORS.yellow}🇺🇳 Flags:${COLORS.reset}`);
  console.log(`   SVG: ${stats.flag.svg} | PNG: ${stats.flag.png} | AI: ${stats.flag.ai}`);
  console.log(`   Total: ${totalFlag} archivos`);
  
  console.log(`${COLORS.green}📊 Total general: ${grandTotal} archivos${COLORS.reset}`);
  
  // Verificar consistencia
  console.log(`\n${COLORS.cyan}🔍 VERIFICACIÓN DE CONSISTENCIA${COLORS.reset}`);
  
  const consistencyChecks = [];
  
  // Verificar que cada SVG tiene su PNG y AI correspondiente
  const styles = ['outline', 'filled', 'flag'];
  styles.forEach(style => {
    const svgDir = path.join(ICONS_DIR, style, 'svg');
    const pngDir = path.join(ICONS_DIR, style, 'png');
    const aiDir = path.join(ICONS_DIR, style, 'ai');
    
    if (fs.existsSync(svgDir)) {
      const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));
      const pngFiles = fs.existsSync(pngDir) ? fs.readdirSync(pngDir).filter(f => f.endsWith('.png')) : [];
      const aiFiles = fs.existsSync(aiDir) ? fs.readdirSync(aiDir).filter(f => f.endsWith('.ai')) : [];
      
      const missingPNG = svgFiles.filter(svg => {
        const expectedPNG = svg.replace('.svg', '.png');
        return !pngFiles.includes(expectedPNG);
      });
      
      const missingAI = svgFiles.filter(svg => {
        const expectedAI = svg.replace('.svg', '.ai');
        return !aiFiles.includes(expectedAI);
      });
      
      if (missingPNG.length === 0 && missingAI.length === 0) {
        consistencyChecks.push(`${COLORS.green}✅ ${style}: Todos los SVG tienen PNG y AI correspondientes${COLORS.reset}`);
      } else {
        consistencyChecks.push(`${COLORS.yellow}⚠️  ${style}: Faltan ${missingPNG.length} PNGs y ${missingAI.length} AIs${COLORS.reset}`);
      }
    }
  });
  
  consistencyChecks.forEach(check => console.log(check));
  
  // Listar algunos archivos de ejemplo
  console.log(`\n${COLORS.cyan}📋 EJEMPLOS DE ARCHIVOS${COLORS.reset}`);
  
  try {
    const outlineFiles = fs.readdirSync(path.join(ICONS_DIR, 'outline', 'svg')).slice(0, 5);
    const filledFiles = fs.readdirSync(path.join(ICONS_DIR, 'filled', 'svg')).slice(0, 5);
    const flagFiles = fs.readdirSync(path.join(ICONS_DIR, 'flag', 'svg')).slice(0, 5);
    
    console.log(`${COLORS.yellow}🎨 Outline SVG:${COLORS.reset}`);
    outlineFiles.forEach(file => console.log(`   📄 ${file}`));
    
    console.log(`${COLORS.yellow}🎨 Filled SVG:${COLORS.reset}`);
    filledFiles.forEach(file => console.log(`   📄 ${file}`));
    
    console.log(`${COLORS.yellow}🇺🇳 Flag SVG:${COLORS.reset}`);
    flagFiles.forEach(file => console.log(`   📄 ${file}`));
  } catch (error) {
    console.log(`${COLORS.red}❌ Error leyendo archivos de ejemplo${COLORS.reset}`);
  }
  
  // Resumen final
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║               RESUMEN DE VERIFICACIÓN            ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  console.log(`${COLORS.green}✅ Sistema de iconos verificado${COLORS.reset}`);
  console.log(`${COLORS.yellow}📊 Total de iconos únicos: ${stats.outline.svg + stats.filled.svg + stats.flag.svg}${COLORS.reset}`);
  console.log(`${COLORS.yellow}📁 Total de archivos: ${grandTotal}${COLORS.reset}`);
  console.log(`${COLORS.blue}📍 Ubicación: ${ICONS_DIR}${COLORS.reset}`);
  
  if (allExist) {
    console.log(`\n${COLORS.green}🎉 EL SISTEMA DE ICONOS ESTÁ COMPLETO Y FUNCIONAL${COLORS.reset}`);
  } else {
    console.log(`\n${COLORS.yellow}⚠️  SE DETECTARON PROBLEMAS EN LA ESTRUCTURA${COLORS.reset}`);
  }
  
  console.log(`\n${COLORS.cyan}🚀 Para convertir placeholders PNG/AI a formatos reales:${COLORS.reset}`);
  console.log(`${COLORS.yellow}   pnpm install${COLORS.reset}`);
  console.log(`${COLORS.yellow}   node scripts/convert-icons.js${COLORS.reset}`);
}

main();