#!/usr/bin/env node

/**
 * Script para convertir SVG a PNG usando sharp
 * (Sin AI - SVG ya cumple esa función)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { optimize } = require('svgo');

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

// Configuración de SVGO para optimizar SVG
const svgoConfig = {
  multipass: true,
  plugins: [
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'mergeStyles',
    'inlineStyles',
    'minifyStyles',
    'convertStyleToAttrs',
    'cleanupIDs',
    'removeRasterImages',
    'removeUselessDefs',
    'cleanupNumericValues',
    'convertColors',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeViewBox',
    'cleanupEnableBackground',
    'removeHiddenElems',
    'removeEmptyText',
    'convertShapeToPath',
    'convertEllipseToCircle',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'convertPathData',
    'convertTransform',
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'mergePaths',
    'removeUnusedNS',
    'sortAttrs',
    'removeTitle',
    'removeDesc',
    'removeDimensions',
    'removeAttrs'
  ]
};

async function optimizeSvg(svgContent) {
  try {
    const result = optimize(svgContent, svgoConfig);
    return result.data;
  } catch (error) {
    console.error(`Error optimizando SVG: ${error.message}`);
    return svgContent;
  }
}

async function convertSvgToPng(svgPath, pngPath) {
  try {
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    
    // Optimizar SVG primero
    const optimizedSvg = await optimizeSvg(svgContent);
    
    // Convertir a PNG con sharp
    await sharp(Buffer.from(optimizedSvg))
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 90 })
      .toFile(pngPath);
    
    return true;
  } catch (error) {
    console.error(`Error convirtiendo ${path.basename(svgPath)}: ${error.message}`);
    return false;
  }
}

async function convertAllIcons() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║        CONVERSIÓN SVG → PNG (SIN AI)           ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  const styles = ['outline', 'filled', 'flag'];
  let totalConverted = 0;
  let totalErrors = 0;
  
  for (const style of styles) {
    console.log(`\n${COLORS.cyan}🎨 Procesando ${style}...${COLORS.reset}`);
    
    const svgDir = path.join(ICONS_DIR, style, 'svg');
    const pngDir = path.join(ICONS_DIR, style, 'png');
    
    if (!fs.existsSync(svgDir)) {
      console.log(`${COLORS.yellow}⚠️  No hay SVG en ${style}${COLORS.reset}`);
      continue;
    }
    
    // Asegurar que existe el directorio PNG
    if (!fs.existsSync(pngDir)) {
      fs.mkdirSync(pngDir, { recursive: true });
    }
    
    const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));
    
    console.log(`${COLORS.yellow}  Encontrados: ${svgFiles.length} archivos SVG${COLORS.reset}`);
    
    for (const svgFile of svgFiles) {
      const svgPath = path.join(svgDir, svgFile);
      const pngFile = svgFile.replace('.svg', '.png');
      const pngPath = path.join(pngDir, pngFile);
      
      process.stdout.write(`${COLORS.blue}  🌀 Convirtiendo: ${svgFile}...${COLORS.reset}`);
      
      const success = await convertSvgToPng(svgPath, pngPath);
      
      if (success) {
        process.stdout.write(`${COLORS.green} ✅\n${COLORS.reset}`);
        totalConverted++;
      } else {
        process.stdout.write(`${COLORS.red} ❌\n${COLORS.reset}`);
        totalErrors++;
      }
    }
  }
  
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║                 RESUMEN DE CONVERSIÓN            ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  console.log(`${COLORS.green}✅ Total convertidos: ${totalConverted} archivos${COLORS.reset}`);
  if (totalErrors > 0) {
    console.log(`${COLORS.yellow}⚠️  Total errores: ${totalErrors} archivos${COLORS.reset}`);
  }
  console.log(`${COLORS.blue}📍 Ubicación: ${ICONS_DIR}${COLORS.reset}`);
  
  console.log(`\n${COLORS.yellow}🚀 NOTA: SVG ya cumple la función de formato editable${COLORS.reset}`);
  console.log(`${COLORS.yellow}   No se necesitan archivos AI adicionales${COLORS.reset}`);
  
  if (totalErrors === 0) {
    console.log(`\n${COLORS.green}🎉 ¡CONVERSIÓN COMPLETADA CON ÉXITO!${COLORS.reset}`);
  } else {
    console.log(`\n${COLORS.yellow}⚠️  Conversión completada con errores${COLORS.reset}`);
  }
}

// Ejecutar la conversión
convertAllIcons().catch(error => {
  console.error(`${COLORS.red}❌ Error en la conversión: ${error.message}${COLORS.reset}`);
  process.exit(1);
});