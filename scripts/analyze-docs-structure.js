#!/usr/bin/env node

/**
 * Script para analizar la estructura de documentación de todos los proyectos
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');

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
  const items = fs.readdirSync(directory);
  return items.filter(item => {
    const itemPath = path.join(directory, item);
    return fs.statSync(itemPath).isFile();
  }).length;
}

function analyzeProject(projectName) {
  const projectPath = path.join(APPS_DIR, projectName);
  const docsPath = path.join(projectPath, 'documents');
  const docsAltPath = path.join(projectPath, 'docs');
  
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}📁 PROYECTO: ${projectName.toUpperCase()}${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  // Verificar existencia de documentos
  const hasDocuments = fs.existsSync(docsPath);
  const hasDocs = fs.existsSync(docsAltPath);
  
  console.log(`${COLORS.yellow}📄 Estructura de documentos:${COLORS.reset}`);
  console.log(`  documents/: ${hasDocuments ? '✅' : '❌'}`);
  console.log(`  docs/: ${hasDocs ? '✅' : '❌'}`);
  
  let mainDocsPath = null;
  if (hasDocuments && hasDocs) {
    console.log(`${COLORS.yellow}⚠️  Ambos directorios existen (documents y docs)${COLORS.reset}`);
    mainDocsPath = docsPath; // Preferir documents según el usuario
  } else if (hasDocuments) {
    mainDocsPath = docsPath;
  } else if (hasDocs) {
    mainDocsPath = docsAltPath;
  }
  
  if (mainDocsPath) {
    console.log(`${COLORS.blue}📍 Usando: ${path.relative(projectPath, mainDocsPath)}${COLORS.reset}`);
    
    // Analizar subdirectorios
    const subdirs = fs.existsSync(mainDocsPath) ? 
      fs.readdirSync(mainDocsPath).filter(item => {
        const itemPath = path.join(mainDocsPath, item);
        return fs.statSync(itemPath).isDirectory();
      }) : [];
    
    console.log(`${COLORS.yellow}📂 Subdirectorios encontrados:${COLORS.reset}`);
    
    const expectedDirs = ['txt', 'docx', 'md', 'pdf', 'ia_docs'];
    const foundDirs = [];
    
    subdirs.forEach(dir => {
      const dirPath = path.join(mainDocsPath, dir);
      const fileCount = countFiles(dirPath);
      const isExpected = expectedDirs.includes(dir);
      
      foundDirs.push(dir);
      
      if (isExpected) {
        console.log(`  ✅ ${dir}/: ${fileCount} archivos`);
      } else {
        console.log(`  ⚠️  ${dir}/: ${fileCount} archivos (no esperado)`);
      }
    });
    
    // Mostrar directorios faltantes
    const missingDirs = expectedDirs.filter(dir => !foundDirs.includes(dir));
    if (missingDirs.length > 0) {
      console.log(`${COLORS.yellow}📭 Directorios faltantes:${COLORS.reset}`);
      missingDirs.forEach(dir => {
        console.log(`  ❌ ${dir}/`);
      });
    }
    
    // Verificar estructura de MuzicMania
    console.log(`\n${COLORS.yellow}🔍 Comparación con estructura MuzicMania:${COLORS.reset}`);
    const hasIaDocs = foundDirs.includes('ia_docs');
    const hasTxt = foundDirs.includes('txt');
    const hasDocx = foundDirs.includes('docx');
    const hasMd = foundDirs.includes('md');
    const hasPdf = foundDirs.includes('pdf');
    
    const muzicmaniaStructure = {
      ia_docs: true,
      txt: true,
      docx: true,
      md: true,
      pdf: true
    };
    
    const projectStructure = {
      ia_docs: hasIaDocs,
      txt: hasTxt,
      docx: hasDocx,
      md: hasMd,
      pdf: hasPdf
    };
    
    let matches = 0;
    Object.keys(muzicmaniaStructure).forEach(key => {
      if (projectStructure[key] === muzicmaniaStructure[key]) {
        matches++;
        console.log(`  ✅ ${key}: OK`);
      } else {
        console.log(`  ❌ ${key}: FALTA`);
      }
    });
    
    const similarity = (matches / Object.keys(muzicmaniaStructure).length) * 100;
    console.log(`  ${COLORS.blue}📊 Similitud: ${similarity.toFixed(0)}%${COLORS.reset}`);
    
  } else {
    console.log(`${COLORS.red}❌ No se encontró estructura de documentos${COLORS.reset}`);
  }
  
  // Verificar si tiene página web
  const hasWebsite = fs.existsSync(path.join(projectPath, 'website'));
  console.log(`\n${COLORS.yellow}🌐 Tiene sitio web: ${hasWebsite ? '✅' : '❌'}${COLORS.reset}`);
  
  // Verificar si es proyecto programable
  const hasPackageJson = fs.existsSync(path.join(projectPath, 'package.json'));
  const hasWebsitePackage = fs.existsSync(path.join(projectPath, 'website', 'package.json'));
  const isProgrammable = hasPackageJson || hasWebsitePackage;
  
  console.log(`${COLORS.yellow}💻 Es programable: ${isProgrammable ? '✅' : '❌'}${COLORS.reset}`);
  
  return {
    projectName,
    hasDocuments,
    hasDocs,
    mainDocsPath,
    isProgrammable,
    hasWebsite
  };
}

function analyzeAllProjects() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║    ANÁLISIS DE ESTRUCTURA DE DOCUMENTACIÓN      ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  // Listar proyectos
  const projects = fs.readdirSync(APPS_DIR).filter(item => {
    const itemPath = path.join(APPS_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  console.log(`${COLORS.cyan}📋 Proyectos encontrados: ${projects.length}${COLORS.reset}`);
  projects.forEach((project, index) => {
    console.log(`${COLORS.yellow}  ${index + 1}. ${project}${COLORS.reset}`);
  });
  
  const projectAnalyses = [];
  
  // Analizar cada proyecto
  projects.forEach(project => {
    const analysis = analyzeProject(project);
    projectAnalyses.push(analysis);
  });
  
  // Resumen general
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║                RESUMEN GENERAL                   ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  const stats = {
    totalProjects: projects.length,
    withDocuments: projectAnalyses.filter(p => p.hasDocuments).length,
    withDocs: projectAnalyses.filter(p => p.hasDocs).length,
    programmable: projectAnalyses.filter(p => p.isProgrammable).length,
    withWebsite: projectAnalyses.filter(p => p.hasWebsite).length
  };
  
  console.log(`${COLORS.cyan}📊 Estadísticas:${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Total proyectos: ${stats.totalProjects}${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Con documents/: ${stats.withDocuments}${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Con docs/: ${stats.withDocs}${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Programables: ${stats.programmable}${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Con sitio web: ${stats.withWebsite}${COLORS.reset}`);
  
  // Proyectos que necesitan atención
  const needsAttention = projectAnalyses.filter(p => !p.hasDocuments && !p.hasDocs);
  if (needsAttention.length > 0) {
    console.log(`\n${COLORS.red}⚠️  Proyectos sin estructura de documentos:${COLORS.reset}`);
    needsAttention.forEach(project => {
      console.log(`  • ${project.projectName}`);
    });
  }
  
  // Proyectos con estructura inconsistente
  const inconsistent = projectAnalyses.filter(p => p.hasDocuments && p.hasDocs);
  if (inconsistent.length > 0) {
    console.log(`\n${COLORS.yellow}⚠️  Proyectos con estructura inconsistente (documents y docs):${COLORS.reset}`);
    inconsistent.forEach(project => {
      console.log(`  • ${project.projectName}`);
    });
  }
  
  console.log(`\n${COLORS.green}🚀 Próximos pasos recomendados:${COLORS.reset}`);
  console.log(`${COLORS.cyan}1. Unificar directorios (documents → docs)${COLORS.reset}`);
  console.log(`${COLORS.cyan}2. Implementar estructura MuzicMania completa${COLORS.reset}`);
  console.log(`${COLORS.cyan}3. Crear scripts de conversión automática${COLORS.reset}`);
  console.log(`${COLORS.cyan}4. Configurar sistema de iconos en proyectos programables${COLORS.reset}`);
  
  return projectAnalyses;
}

// Ejecutar análisis
analyzeAllProjects().catch(error => {
  console.error(`${COLORS.red}❌ Error en el análisis: ${error.message}${COLORS.reset}`);
  process.exit(1);
});