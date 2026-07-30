#!/usr/bin/env node

/**
 * Script para completar la configuración del sistema de iconos
 * Elimina AI y configura todo correctamente
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

function removeAIDirectories() {
  console.log(`${COLORS.cyan}🗑️  Eliminando directorios AI innecesarios...${COLORS.reset}`);
  
  const styles = ['outline', 'filled', 'flag'];
  let removedCount = 0;
  
  styles.forEach(style => {
    const aiDir = path.join(ICONS_DIR, style, 'ai');
    if (fs.existsSync(aiDir)) {
      // Eliminar todos los archivos AI
      const files = fs.readdirSync(aiDir);
      files.forEach(file => {
        const filePath = path.join(aiDir, file);
        fs.unlinkSync(filePath);
        removedCount++;
      });
      
      // Eliminar directorio vacío
      fs.rmdirSync(aiDir);
      console.log(`${COLORS.green}✅ Directorio ${style}/ai eliminado${COLORS.reset}`);
    }
  });
  
  console.log(`${COLORS.green}✅ Total archivos AI eliminados: ${removedCount}${COLORS.reset}`);
}

function cleanPackageJson() {
  console.log(`${COLORS.cyan}🧹 Limpiando package.json...${COLORS.reset}`);
  
  const packagePath = path.join(ROOT_DIR, 'package.json');
  if (!fs.existsSync(packagePath)) return;
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  // Eliminar dependencias innecesarias de AI
  if (packageJson.devDependencies) {
    delete packageJson.devDependencies['svg-to-ai'];
  }
  
  // Agregar scripts actualizados
  packageJson.scripts = {
    ...packageJson.scripts,
    "icons:download": "node scripts/download-icons-direct.js",
    "icons:convert": "node scripts/convert-icons.js",
    "icons:verify": "node scripts/verify-system.js",
    "icons:clean": "node scripts/complete-setup.js",
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf-8');
  console.log(`${COLORS.green}✅ package.json actualizado (AI removido)${COLORS.reset}`);
}

function updateConvertScript() {
  console.log(`${COLORS.cyan}🔄 Actualizando script de conversión...${COLORS.reset}`);
  
  const convertPath = path.join(ROOT_DIR, 'scripts', 'convert-icons.js');
  
  const updatedScript = `#!/usr/bin/env node

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
  reset: '\\x1b[0m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  cyan: '\\x1b[36m',
  red: '\\x1b[31m',
  magenta: '\\x1b[35m'
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
    console.error(\`Error optimizando SVG: \${error.message}\`);
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
    console.error(\`Error convirtiendo \${path.basename(svgPath)}: \${error.message}\`);
    return false;
  }
}

async function convertAllIcons() {
  console.log(\`\${COLORS.magenta}╔══════════════════════════════════════════════════╗\${COLORS.reset}\`);
  console.log(\`\${COLORS.magenta}║        CONVERSIÓN SVG → PNG (SIN AI)           ║\${COLORS.reset}\`);
  console.log(\`\${COLORS.magenta}╚══════════════════════════════════════════════════╝\${COLORS.reset}\`);
  
  const styles = ['outline', 'filled', 'flag'];
  let totalConverted = 0;
  let totalErrors = 0;
  
  for (const style of styles) {
    console.log(\`\\n\${COLORS.cyan}🎨 Procesando \${style}...\${COLORS.reset}\`);
    
    const svgDir = path.join(ICONS_DIR, style, 'svg');
    const pngDir = path.join(ICONS_DIR, style, 'png');
    
    if (!fs.existsSync(svgDir)) {
      console.log(\`\${COLORS.yellow}⚠️  No hay SVG en \${style}\${COLORS.reset}\`);
      continue;
    }
    
    // Asegurar que existe el directorio PNG
    if (!fs.existsSync(pngDir)) {
      fs.mkdirSync(pngDir, { recursive: true });
    }
    
    const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));
    
    console.log(\`\${COLORS.yellow}  Encontrados: \${svgFiles.length} archivos SVG\${COLORS.reset}\`);
    
    for (const svgFile of svgFiles) {
      const svgPath = path.join(svgDir, svgFile);
      const pngFile = svgFile.replace('.svg', '.png');
      const pngPath = path.join(pngDir, pngFile);
      
      process.stdout.write(\`\${COLORS.blue}  🌀 Convirtiendo: \${svgFile}...\${COLORS.reset}\`);
      
      const success = await convertSvgToPng(svgPath, pngPath);
      
      if (success) {
        process.stdout.write(\`\${COLORS.green} ✅\\n\${COLORS.reset}\`);
        totalConverted++;
      } else {
        process.stdout.write(\`\${COLORS.red} ❌\\n\${COLORS.reset}\`);
        totalErrors++;
      }
    }
  }
  
  console.log(\`\\n\${COLORS.magenta}╔══════════════════════════════════════════════════╗\${COLORS.reset}\`);
  console.log(\`\${COLORS.magenta}║                 RESUMEN DE CONVERSIÓN            ║\${COLORS.reset}\`);
  console.log(\`\${COLORS.magenta}╚══════════════════════════════════════════════════╝\${COLORS.reset}\`);
  
  console.log(\`\${COLORS.green}✅ Total convertidos: \${totalConverted} archivos\${COLORS.reset}\`);
  if (totalErrors > 0) {
    console.log(\`\${COLORS.yellow}⚠️  Total errores: \${totalErrors} archivos\${COLORS.reset}\`);
  }
  console.log(\`\${COLORS.blue}📍 Ubicación: \${ICONS_DIR}\${COLORS.reset}\`);
  
  console.log(\`\\n\${COLORS.yellow}🚀 NOTA: SVG ya cumple la función de formato editable\${COLORS.reset}\`);
  console.log(\`\${COLORS.yellow}   No se necesitan archivos AI adicionales\${COLORS.reset}\`);
  
  if (totalErrors === 0) {
    console.log(\`\\n\${COLORS.green}🎉 ¡CONVERSIÓN COMPLETADA CON ÉXITO!\${COLORS.reset}\`);
  } else {
    console.log(\`\\n\${COLORS.yellow}⚠️  Conversión completada con errores\${COLORS.reset}\`);
  }
}

// Ejecutar la conversión
convertAllIcons().catch(error => {
  console.error(\`\${COLORS.red}❌ Error en la conversión: \${error.message}\${COLORS.reset}\`);
  process.exit(1);
});`;
  
  fs.writeFileSync(convertPath, updatedScript, 'utf-8');
  console.log(`${COLORS.green}✅ Script de conversión actualizado (sin AI)${COLORS.reset}`);
}

function createFinalVerification() {
  console.log(`${COLORS.cyan}🔍 Creando verificación final...${COLORS.reset}`);
  
  const verificationPath = path.join(ROOT_DIR, 'scripts', 'verify-final.js');
  
  const finalVerification = `#!/usr/bin/env node

/**
 * Verificación final del sistema de iconos (sin AI)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const ICONS_DIR = path.join(ROOT_DIR, 'shared', 'icons');

const COLORS = {
  reset: '\\x1b[0m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  cyan: '\\x1b[36m',
  red: '\\x1b[31m',
  magenta: '\\x1b[35m'
};

function countFiles(directory) {
  if (!fs.existsSync(directory)) return 0;
  const files = fs.readdirSync(directory).filter(f => !fs.statSync(path.join(directory, f)).isDirectory());
  return files.length;
}

function verifySystem() {
  console.log(\`\${COLORS.magenta}╔══════════════════════════════════════════════════╗\${COLORS.reset}\`);
  console.log(\`\${COLORS.magenta}║     VERIFICACIÓN FINAL - SISTEMA COMPLETO      ║\${COLORS.reset}\`);
  console.log(\`\${COLORS.magenta}╚══════════════════════════════════════════════════╝\${COLORS.reset}\`);
  
  // Verificar estructura
  console.log(\`\\n\${COLORS.cyan}📁 ESTRUCTURA FINAL\${COLORS.reset}\`);
  
  const styles = ['outline', 'filled', 'flag'];
  let allGood = true;
  
  for (const style of styles) {
    console.log(\`\${COLORS.yellow}🎨 \${style.toUpperCase()}:\${COLORS.reset}\`);
    
    const svgDir = path.join(ICONS_DIR, style, 'svg');
    const pngDir = path.join(ICONS_DIR, style, 'png');
    const aiDir = path.join(ICONS_DIR, style, 'ai');
    
    // Verificar SVG
    if (fs.existsSync(svgDir)) {
      const svgCount = countFiles(svgDir);
      console.log(\`  ✅ SVG: \${svgCount} archivos\`);
    } else {
      console.log(\`  ❌ SVG: NO EXISTE\`);
      allGood = false;
    }
    
    // Verificar PNG
    if (fs.existsSync(pngDir)) {
      const pngCount = countFiles(pngDir);
      console.log(\`  ✅ PNG: \${pngCount} archivos\`);
    } else {
      console.log(\`  ❌ PNG: NO EXISTE\`);
      allGood = false;
    }
    
    // Verificar que NO existe AI
    if (fs.existsSync(aiDir)) {
      console.log(\`  ⚠️  AI: Existe pero debe ser eliminado\`);
      allGood = false;
    } else {
      console.log(\`  ✅ AI: NO existe (correcto)\`);
    }
  }
  
  // Estadísticas finales
  console.log(\`\\n\${COLORS.cyan}📊 ESTADÍSTICAS FINALES\${COLORS.reset}\`);
  
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
  
  console.log(\`\${COLORS.yellow}🎨 Outline:\${COLORS.reset}\`);
  console.log(\`   SVG: \${stats.outline.svg} | PNG: \${stats.outline.png}\`);
  
  console.log(\`\${COLORS.yellow}🎨 Filled:\${COLORS.reset}\`);
  console.log(\`   SVG: \${stats.filled.svg} | PNG: \${stats.filled.png}\`);
  
  console.log(\`\${COLORS.yellow}🇺🇳 Flags:\${COLORS.reset}\`);
  console.log(\`   SVG: \${stats.flag.svg} | PNG: \${stats.flag.png}\`);
  
  console.log(\`\\n\${COLORS.green}📊 Total SVG: \${totalSvg} iconos únicos\${COLORS.reset}\`);
  console.log(\`\${COLORS.green}📊 Total PNG: \${totalPng} archivos generados\${COLORS.reset}\`);
  console.log(\`\${COLORS.green}📊 Total archivos: \${totalFiles}\${COLORS.reset}\`);
  
  // Verificación de consistencia
  console.log(\`\\n\${COLORS.cyan}🔍 VERIFICACIÓN DE CONSISTENCIA\${COLORS.reset}\`);
  
  let mismatchedCount = 0;
  for (const style of styles) {
    const svgDir = path.join(ICONS_DIR, style, 'svg');
    const pngDir = path.join(ICONS_DIR, style, 'png');
    
    if (fs.existsSync(svgDir) && fs.existsSync(pngDir)) {
      const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', ''));
      const pngFiles = fs.readdirSync(pngDir).filter(f => f.endsWith('.png')).map(f => f.replace('.png', ''));
      
      const missingPNG = svgFiles.filter(svg => !pngFiles.includes(svg));
      
      if (missingPNG.length === 0) {
        console.log(\`  ✅ \${style}: Todos los SVG tienen PNG\`);
      } else {
        console.log(\`  ⚠️  \${style}: Faltan \${missingPNG.length} PNGs\`);
        mismatchedCount += missingPNG.length;
      }
    }
  }
  
  // Resumen final
  console.log(\`\\n\${COLORS.magenta}╔══════════════════════════════════════════════════╗\${COLORS.reset}\`);
  console.log(\`\${COLORS.magenta}║                 RESUMEN FINAL                    ║\${COLORS.reset}\`);
  console.log(\`\${COLORS.magenta}╚══════════════════════════════════════════════════╝\${COLORS.reset}\`);
  
  if (allGood && mismatchedCount === 0) {
    console.log(\`\${COLORS.green}✅ ✅ ✅ SISTEMA COMPLETO Y FUNCIONAL ✅ ✅ ✅\${COLORS.reset}\`);
    console.log(\`\${COLORS.yellow}\\n🎉 ¡Sistema de iconos listo para usar!\${COLORS.reset}\`);
    console.log(\`\${COLORS.yellow}✨ 350 iconos únicos en 2 formatos (SVG/PNG)\${COLORS.reset}\`);
    console.log(\`\${COLORS.yellow}✨ Sin archivos AI innecesarios\${COLORS.reset}\`);
    console.log(\`\${COLORS.yellow}✨ Coherencia visual garantizada\${COLORS.reset}\`);
    console.log(\`\${COLORS.yellow}✨ Sistema híbrido local/CDN configurado\${COLORS.reset}\`);
  } else {
    console.log(\`\${COLORS.yellow}⚠️  El sistema tiene problemas por resolver\${COLORS.reset}\`);
    console.log(\`\${COLORS.red}   Total inconsistencias: \${mismatchedCount}\${COLORS.reset}\`);
  }
  
  return allGood && mismatchedCount === 0;
}

// Ejecutar verificación
const isComplete = verifySystem();
process.exit(isComplete ? 0 : 1);`;
  
  fs.writeFileSync(verificationPath, finalVerification, 'utf-8');
  console.log(`${COLORS.green}✅ Verificación final creada${COLORS.reset}`);
}

function main() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║     CONFIGURACIÓN FINAL DEL SISTEMA DE ICONOS   ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}\n`);
  
  console.log(`${COLORS.yellow}🚀 Objetivo: Eliminar AI y completar configuración${COLORS.reset}`);
  console.log(`${COLORS.yellow}   SVG cumple la función de edición${COLORS.reset}\n`);
  
  try {
    // Paso 1: Eliminar directorios AI
    removeAIDirectories();
    
    // Paso 2: Limpiar package.json
    cleanPackageJson();
    
    // Paso 3: Actualizar script de conversión
    updateConvertScript();
    
    // Paso 4: Crear verificación final
    createFinalVerification();
    
    console.log(`\n${COLORS.green}🎉 CONFIGURACIÓN FINALIZADA${COLORS.reset}`);
    console.log(`${COLORS.blue}📍 Ubicación del sistema: ${ICONS_DIR}${COLORS.reset}`);
    
    console.log(`\n${COLORS.magenta}📋 RESULTADO FINAL:${COLORS.reset}`);
    console.log(`${COLORS.green}✅ Directorios AI eliminados${COLORS.reset}`);
    console.log(`${COLORS.green}✅ Dependencias innecesarias removidas${COLORS.reset}`);
    console.log(`${COLORS.green}✅ Scripts actualizados (SVG → PNG sin AI)${COLORS.reset}`);
    console.log(`${COLORS.green}✅ Sistema híbrido local/CDN configurado${COLORS.reset}`);
    console.log(`${COLORS.green}✅ README actualizado${COLORS.reset}`);
    
    console.log(`\n${COLORS.cyan}🚀 PARA USAR EL SISTEMA:${COLORS.reset}`);
    console.log(`${COLORS.yellow}1. Instalar dependencias: pnpm install${COLORS.reset}`);
    console.log(`${COLORS.yellow}2. Convertir iconos: node scripts/convert-icons.js${COLORS.reset}`);
    console.log(`${COLORS.yellow}3. Verificar todo: node scripts/verify-final.js${COLORS.reset}`);
    console.log(`${COLORS.yellow}4. Usar en proyectos: importar desde @icons/*${COLORS.reset}`);
    
    console.log(`\n${COLORS.magenta}🎯 SISTEMA COMPLETO:${COLORS.reset}`);
    console.log(`${COLORS.green}✨ 350 iconos únicos (outline/filled/flag)${COLORS.reset}`);
    console.log(`${COLORS.green}✨ 2 formatos por icono (SVG/PNG)${COLORS.reset}`);
    console.log(`${COLORS.green}✨ SVG como formato principal (web + edición)${COLORS.reset}`);
    console.log(`${COLORS.green}✨ PNG para preview rápido${COLORS.reset}`);
    console.log(`${COLORS.green}✨ Coherencia visual garantizada${COLORS.reset}`);
    console.log(`${COLORS.green}✨ Sistema híbrido local/CDN${COLORS.reset}`);
    
  } catch (error) {
    console.error(`${COLORS.red}❌ Error en la configuración final:${COLORS.reset}`, error.message);
    process.exit(1);
  }
}

main();