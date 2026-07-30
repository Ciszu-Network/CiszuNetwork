#!/usr/bin/env node

/**
 * Verificación final del sistema completo
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

function checkSystem() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║     VERIFICACIÓN FINAL DEL SISTEMA             ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  const checks = [];
  
  // 1. Verificar sistema de iconos
  console.log(`\n${COLORS.cyan}🎨 VERIFICANDO SISTEMA DE ICONOS${COLORS.reset}`);
  
  const iconsDir = path.join(SHARED_DIR, 'icons');
  if (fs.existsSync(iconsDir)) {
    const styles = ['outline', 'filled', 'flag'];
    let totalIcons = 0;
    
    styles.forEach(style => {
      const svgDir = path.join(iconsDir, style, 'svg');
      const pngDir = path.join(iconsDir, style, 'png');
      
      const svgCount = fs.existsSync(svgDir) ? fs.readdirSync(svgDir).filter(f => f.endsWith('.svg')).length : 0;
      const pngCount = fs.existsSync(pngDir) ? fs.readdirSync(pngDir).filter(f => f.endsWith('.png')).length : 0;
      
      totalIcons += svgCount;
      
      console.log(`  ${style}: ${svgCount} SVG, ${pngCount} PNG`);
      
      if (svgCount > 0 && pngCount >= svgCount * 0.9) { // 90% de PNG generados
        checks.push({ component: `iconos_${style}`, status: '✅', message: `${svgCount} iconos` });
      } else {
        checks.push({ component: `iconos_${style}`, status: '⚠️', message: `Faltan PNGs para ${style}` });
      }
    });
    
    checks.push({ component: 'sistema_iconos', status: '✅', message: `${totalIcons} iconos totales` });
  } else {
    checks.push({ component: 'sistema_iconos', status: '❌', message: 'No existe' });
  }
  
  // 2. Verificar documentación
  console.log(`\n${COLORS.cyan}📄 VERIFICANDO SISTEMA DE DOCUMENTACIÓN${COLORS.reset}`);
  
  const projects = fs.readdirSync(APPS_DIR).filter(item => {
    const itemPath = path.join(APPS_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  let projectsWithDocs = 0;
  projects.forEach(project => {
    const docsPath = path.join(APPS_DIR, project, 'docs');
    
    if (fs.existsSync(docsPath)) {
      const subdirs = ['txt', 'docx', 'md', 'pdf', 'ia_docs'];
      const hasAllDirs = subdirs.every(dir => fs.existsSync(path.join(docsPath, dir)));
      
      if (hasAllDirs) {
        projectsWithDocs++;
        const actaPath = path.join(docsPath, 'txt', 'ACTA_CONSTITUTIVA.txt');
        if (fs.existsSync(actaPath)) {
          console.log(`  ${project}: ✅ Estructura completa + ACTA`);
        } else {
          console.log(`  ${project}: ⚠️  Estructura OK pero sin ACTA`);
        }
      } else {
        console.log(`  ${project}: ❌ Estructura incompleta`);
      }
    } else {
      console.log(`  ${project}: ❌ Sin docs/`);
    }
  });
  
  if (projectsWithDocs === projects.length) {
    checks.push({ component: 'documentacion', status: '✅', message: `${projects.length} proyectos configurados` });
  } else {
    checks.push({ component: 'documentacion', status: '⚠️', message: `${projectsWithDocs}/${projects.length} proyectos configurados` });
  }
  
  // 3. Verificar recursos compartidos
  console.log(`\n${COLORS.cyan}🗂️ VERIFICANDO RECURSOS COMPARTIDOS${COLORS.reset}`);
  
  const sharedComponents = [
    { name: 'icons', path: 'icons', required: true },
    { name: 'documentation', path: 'documentation', required: true },
    { name: 'fonts', path: 'fonts', required: false },
    { name: 'logos', path: 'logos', required: false }
  ];
  
  sharedComponents.forEach(comp => {
    const compPath = path.join(SHARED_DIR, comp.path);
    const exists = fs.existsSync(compPath);
    
    if (exists) {
      const itemCount = fs.readdirSync(compPath).length;
      console.log(`  ${comp.path}/: ✅ (${itemCount} items)`);
      checks.push({ component: `shared_${comp.path}`, status: '✅', message: `${itemCount} items` });
    } else if (comp.required) {
      console.log(`  ${comp.path}/: ❌ FALTANTE`);
      checks.push({ component: `shared_${comp.path}`, status: '❌', message: 'No existe' });
    } else {
      console.log(`  ${comp.path}/: ⚠️  Opcional (no creado)`);
      checks.push({ component: `shared_${comp.path}`, status: '⚠️', message: 'Opcional' });
    }
  });
  
  // 4. Verificar scripts
  console.log(`\n${COLORS.cyan}🛠️ VERIFICANDO SCRIPTS${COLORS.reset}`);
  
  const requiredScripts = [
    'setup-documentation-system.js',
    'setup-icons-system.js', 
    'convert-icons.js',
    'verify-system.js'
  ];
  
  const scriptsDir = path.join(ROOT_DIR, 'scripts');
  let scriptsFound = 0;
  
  requiredScripts.forEach(script => {
    const scriptPath = path.join(scriptsDir, script);
    if (fs.existsSync(scriptPath)) {
      console.log(`  ${script}: ✅`);
      scriptsFound++;
    } else {
      console.log(`  ${script}: ❌`);
    }
  });
  
  if (scriptsFound === requiredScripts.length) {
    checks.push({ component: 'scripts', status: '✅', message: `${scriptsFound} scripts` });
  } else {
    checks.push({ component: 'scripts', status: '⚠️', message: `${scriptsFound}/${requiredScripts.length} scripts` });
  }
  
  // 5. Verificar proyectos programables
  console.log(`\n${COLORS.cyan}💻 VERIFICANDO CONFIGURACIÓN DE PROYECTOS${COLORS.reset}`);
  
  let projectsWithIcons = 0;
  projects.forEach(project => {
    const projectPath = path.join(APPS_DIR, project);
    const hasWebsite = fs.existsSync(path.join(projectPath, 'website'));
    
    // Verificar configuración de iconos
    let hasIconConfig = false;
    if (hasWebsite) {
      const iconUtils = path.join(projectPath, 'website', 'src', 'utils', 'icons.ts');
      hasIconConfig = fs.existsSync(iconUtils);
    }
    
    const iconConfig = path.join(projectPath, 'icon-config.json');
    hasIconConfig = hasIconConfig || fs.existsSync(iconConfig);
    
    if (hasIconConfig) {
      projectsWithIcons++;
      console.log(`  ${project}: ✅ Iconos configurados`);
    } else {
      console.log(`  ${project}: ⚠️  Sin configuración de iconos`);
    }
  });
  
  if (projectsWithIcons >= projects.length * 0.75) { // 75% configurados
    checks.push({ component: 'config_proyectos', status: '✅', message: `${projectsWithIcons}/${projects.length} con iconos` });
  } else {
    checks.push({ component: 'config_proyectos', status: '⚠️', message: `${projectsWithIcons}/${projects.length} con iconos` });
  }
  
  // Resumen final
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║               RESUMEN DE VERIFICACIÓN           ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  const totalChecks = checks.length;
  const successChecks = checks.filter(c => c.status === '✅').length;
  const warningChecks = checks.filter(c => c.status === '⚠️').length;
  const errorChecks = checks.filter(c => c.status === '❌').length;
  
  console.log(`${COLORS.cyan}📊 Resultados:${COLORS.reset}`);
  console.log(`  ✅ Correctos: ${successChecks}/${totalChecks}`);
  console.log(`  ⚠️  Advertencias: ${warningChecks}`);
  console.log(`  ❌ Errores: ${errorChecks}`);
  
  console.log(`\n${COLORS.cyan}🔍 Detalles:${COLORS.reset}`);
  checks.forEach(check => {
    const color = check.status === '✅' ? COLORS.green : 
                  check.status === '⚠️' ? COLORS.yellow : COLORS.red;
    console.log(`  ${check.status} ${check.component}: ${check.message}`);
  });
  
  // Recomendaciones finales
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║           RECOMENDACIONES FINALES               ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  if (errorChecks === 0 && warningChecks <= 3) {
    console.log(`${COLORS.green}🎉 ¡SISTEMA COMPLETO Y FUNCIONAL!${COLORS.reset}`);
    console.log(`${COLORS.yellow}\n🚀 Próximos pasos:${COLORS.reset}`);
    console.log(`${COLORS.cyan}1. Configurar variables de entorno en proyectos${COLORS.reset}`);
    console.log(`${COLORS.cyan}2. Probar el sistema de iconos en desarrollo${COLORS.reset}`);
    console.log(`${COLORS.cyan}3. Configurar CDN para producción${COLORS.reset}`);
    console.log(`${COLORS.cyan}4. Revisar documentación generada${COLORS.reset}`);
    
    return true;
  } else if (errorChecks > 0) {
    console.log(`${COLORS.red}⚠️  EL SISTEMA TIENE PROBLEMAS POR RESOLVER${COLORS.reset}`);
    console.log(`${COLORS.yellow}\n🔧 Acciones necesarias:${COLORS.reset}`);
    console.log(`${COLORS.cyan}1. Resolver los componentes marcados con ❌${COLORS.reset}`);
    console.log(`${COLORS.cyan}2. Ejecutar scripts de configuración nuevamente${COLORS.reset}`);
    console.log(`${COLORS.cyan}3. Verificar permisos de archivos${COLORS.reset}`);
    
    return false;
  } else {
    console.log(`${COLORS.yellow}⚠️  EL SISTEMA ESTÁ MAYORMENTE COMPLETO${COLORS.reset}`);
    console.log(`${COLORS.yellow}\n🔧 Mejoras recomendadas:${COLORS.reset}`);
    console.log(`${COLORS.cyan}1. Resolver las advertencias restantes${COLORS.reset}`);
    console.log(`${COLORS.cyan}2. Completar configuración en proyectos faltantes${COLORS.reset}`);
    console.log(`${COLORS.cyan}3. Verificar que todos los scripts funcionen${COLORS.reset}`);
    
    return true;
  }
}

// Ejecutar verificación
try {
  const isSystemComplete = checkSystem();
  
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}📋 DOCUMENTACIÓN DISPONIBLE:${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  console.log(`${COLORS.yellow}• RESUMEN_TRABAJO_COMPLETADO.md${COLORS.reset} - Resumen detallado del sistema`);
  console.log(`${COLORS.yellow}• shared/icons/README.md${COLORS.reset} - Documentación de iconos`);
  console.log(`${COLORS.yellow}• shared/README.md${COLORS.reset} - Guía de recursos compartidos`);
  console.log(`${COLORS.yellow}• scripts/*.js${COLORS.reset} - Scripts de automatización`);
  
  console.log(`\n${COLORS.green}💡 Para más detalles, revisa los archivos de documentación${COLORS.reset}`);
  
  process.exit(isSystemComplete ? 0 : 1);
} catch (error) {
  console.error(`${COLORS.red}❌ Error en la verificación: ${error.message}${COLORS.reset}`);
  process.exit(1);
}