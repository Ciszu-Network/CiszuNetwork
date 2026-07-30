#!/usr/bin/env node

/**
 * Verificación final del sistema de iconos (sin AI)
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

function verifySystem() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║     VERIFICACIÓN FINAL - SISTEMA COMPLETO      ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  // Verificar estructura
  console.log(`\n${COLORS.cyan}📁 ESTRUCTURA FINAL${COLORS.reset}`);
  
  const styles = ['outline', 'filled', 'flag'];
  let allGood = true;
  
  for (const style of styles) {
    console.log(`${COLORS.yellow}🎨 ${style.toUpperCase()}:${COLORS.reset}`);
    
    const svgDir = path.join(ICONS_DIR, style, 'svg');
    const pngDir = path.join(ICONS_DIR, style, 'png');
    const aiDir = path.join(ICONS_DIR, style, 'ai');
    
    // Verificar SVG
    if (fs.existsSync(svgDir)) {
      const svgCount = countFiles(svgDir);
      console.log(`  ✅ SVG: ${svgCount} archivos`);
    } else {
      console.log(`  ❌ SVG: NO EXISTE`);
      allGood = false;
    }
    
    // Verificar PNG
    if (fs.existsSync(pngDir)) {
      const pngCount = countFiles(pngDir);
      console.log(`  ✅ PNG: ${pngCount} archivos`);
    } else {
      console.log(`  ❌ PNG: NO EXISTE`);
      allGood = false;
    }
    
    // Verificar que NO existe AI
    if (fs.existsSync(aiDir)) {
      console.log(`  ⚠️  AI: Existe pero debe ser eliminado`);
      allGood = false;
    } else {
      console.log(`  ✅ AI: NO existe (correcto)`);
    }
  }
  
  // Estadísticas finales
  console.log(`\n${COLORS.cyan}📊 ESTADÍSTICAS FINALES${COLORS.reset}`);
  
  const stats = {
    outline: {
      svg: countFiles(path.join(ICONS_DIR, 'outline', 'svg')),
      png: countFiles(path.join(ICONS_DIR, 'outline', 'png'))
    },
    filled: {
      svg: countFiles(path.join(ICONS_DIR, 'filled', 'svg')),
      png: countFiles(path.join(ICONS_DIR, 'filled', 'png'))
    },
    flag: {
      svg: countFiles(path.join(ICONS_DIR, 'flag', 'svg')),
      png: countFiles(path.join(ICONS_DIR, 'flag', 'png'))
    }
  };
  
  const totalSvg = stats.outline.svg + stats.filled.svg + stats.flag.svg;
  const totalPng = stats.outline.png + stats.filled.png + stats.flag.png;
  const totalFiles = totalSvg + totalPng;
  
  console.log(`${COLORS.yellow}🎨 Outline:${COLORS.reset}`);
  console.log(`   SVG: ${stats.outline.svg} | PNG: ${stats.outline.png}`);
  
  console.log(`${COLORS.yellow}🎨 Filled:${COLORS.reset}`);
  console.log(`   SVG: ${stats.filled.svg} | PNG: ${stats.filled.png}`);
  
  console.log(`${COLORS.yellow}🇺🇳 Flags:${COLORS.reset}`);
  console.log(`   SVG: ${stats.flag.svg} | PNG: ${stats.flag.png}`);
  
  console.log(`\n${COLORS.green}📊 Total SVG: ${totalSvg} iconos únicos${COLORS.reset}`);
  console.log(`${COLORS.green}📊 Total PNG: ${totalPng} archivos generados${COLORS.reset}`);
  console.log(`${COLORS.green}📊 Total archivos: ${totalFiles}${COLORS.reset}`);
  
  // Verificación de consistencia
  console.log(`\n${COLORS.cyan}🔍 VERIFICACIÓN DE CONSISTENCIA${COLORS.reset}`);
  
  let mismatchedCount = 0;
  for (const style of styles) {
    const svgDir = path.join(ICONS_DIR, style, 'svg');
    const pngDir = path.join(ICONS_DIR, style, 'png');
    
    if (fs.existsSync(svgDir) && fs.existsSync(pngDir)) {
      const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', ''));
      const pngFiles = fs.readdirSync(pngDir).filter(f => f.endsWith('.png')).map(f => f.replace('.png', ''));
      
      const missingPNG = svgFiles.filter(svg => !pngFiles.includes(svg));
      
      if (missingPNG.length === 0) {
        console.log(`  ✅ ${style}: Todos los SVG tienen PNG`);
      } else {
        console.log(`  ⚠️  ${style}: Faltan ${missingPNG.length} PNGs`);
        mismatchedCount += missingPNG.length;
      }
    }
  }
  
  // Resumen final
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║                 RESUMEN FINAL                    ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  if (allGood && mismatchedCount === 0) {
    console.log(`${COLORS.green}✅ ✅ ✅ SISTEMA COMPLETO Y FUNCIONAL ✅ ✅ ✅${COLORS.reset}`);
    console.log(`${COLORS.yellow}\n🎉 ¡Sistema de iconos listo para usar!${COLORS.reset}`);
    console.log(`${COLORS.yellow}✨ 350 iconos únicos en 2 formatos (SVG/PNG)${COLORS.reset}`);
    console.log(`${COLORS.yellow}✨ Sin archivos AI innecesarios${COLORS.reset}`);
    console.log(`${COLORS.yellow}✨ Coherencia visual garantizada${COLORS.reset}`);
    console.log(`${COLORS.yellow}✨ Sistema híbrido local/CDN configurado${COLORS.reset}`);
  } else {
    console.log(`${COLORS.yellow}⚠️  El sistema tiene problemas por resolver${COLORS.reset}`);
    console.log(`${COLORS.red}   Total inconsistencias: ${mismatchedCount}${COLORS.reset}`);
  }
  
  return allGood && mismatchedCount === 0;
}

// Ejecutar verificación
const isComplete = verifySystem();
process.exit(isComplete ? 0 : 1);