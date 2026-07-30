#!/usr/bin/env node

/**
 * Script para limpiar y sincronizar documentación completa
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

// Archivos que deben ser eliminados por ser innecesarios
const FILES_TO_REMOVE = [
  'fonts.md',
  'icons.md', 
  'fasttext.md',
  'to_doo.md',
  'LINKS.md'
];

// Archivos que deben ser renombrados a mayúsculas
const FILES_TO_RENAME = {
  'mod_guidelines': 'MOD_GUIDELINES',
  'rules': 'RULES',
  'acta_constitutiva': 'ACTA'
};

function cleanProjectDocs(projectPath, projectName) {
  const docsPath = path.join(projectPath, 'docs');
  
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🧹 LIMPIANDO: ${projectName.toUpperCase()}${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  if (!fs.existsSync(docsPath)) {
    console.log(`${COLORS.red}❌ No existe docs/ en ${projectName}${COLORS.reset}`);
    return false;
  }
  
  // 1. Limpiar archivos MD innecesarios
  const mdPath = path.join(docsPath, 'md');
  if (fs.existsSync(mdPath)) {
    let removedCount = 0;
    FILES_TO_REMOVE.forEach(fileName => {
      const filePath = path.join(mdPath, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`${COLORS.green}✅ Eliminado (innecesario): md/${fileName}${COLORS.reset}`);
        removedCount++;
      }
    });
    
    console.log(`${COLORS.yellow}📊 Archivos MD eliminados: ${removedCount}${COLORS.reset}`);
  }
  
  // 2. Renombrar archivos a mayúsculas
  const txtPath = path.join(docsPath, 'txt');
  const docxPath = path.join(docsPath, 'docx');
  const pdfPath = path.join(docsPath, 'pdf');
  
  Object.entries(FILES_TO_RENAME).forEach(([oldName, newName]) => {
    // TXT
    const oldTxtPath = path.join(txtPath, `${oldName}.txt`);
    const newTxtPath = path.join(txtPath, `${newName}.txt`);
    
    if (fs.existsSync(oldTxtPath)) {
      fs.renameSync(oldTxtPath, newTxtPath);
      console.log(`${COLORS.green}✅ Renombrado: txt/${oldName}.txt → txt/${newName}.txt${COLORS.reset}`);
    }
    
    // DOCX
    const oldDocxPath = path.join(docxPath, `${oldName}.docx`);
    const newDocxPath = path.join(docxPath, `${newName}.docx`);
    
    if (fs.existsSync(oldDocxPath)) {
      fs.renameSync(oldDocxPath, newDocxPath);
      console.log(`${COLORS.green}✅ Renombrado: docx/${oldName}.docx → docx/${newName}.docx${COLORS.reset}`);
    }
    
    // PDF
    const oldPdfPath = path.join(pdfPath, `${oldName}.pdf`);
    const newPdfPath = path.join(pdfPath, `${newName}.pdf`);
    
    if (fs.existsSync(oldPdfPath)) {
      fs.renameSync(oldPdfPath, newPdfPath);
      console.log(`${COLORS.green}✅ Renombrado: pdf/${oldName}.pdf → pdf/${newName}.pdf${COLORS.reset}`);
    }
    
    // MD
    const oldMdPath = path.join(mdPath, `${oldName}.md`);
    const newMdPath = path.join(mdPath, `${newName}.md`);
    
    if (fs.existsSync(oldMdPath)) {
      fs.renameSync(oldMdPath, newMdPath);
      console.log(`${COLORS.green}✅ Renombrado: md/${oldName}.md → md/${newName}.md${COLORS.reset}`);
    }
  });
  
  // 3. Verificar y crear versiones faltantes de ACTA
  const actaTxtPath = path.join(txtPath, 'ACTA.txt');
  const actaMdPath = path.join(mdPath, 'ACTA.md');
  
  if (fs.existsSync(actaTxtPath) && !fs.existsSync(actaMdPath)) {
    const txtContent = fs.readFileSync(actaTxtPath, 'utf-8');
    
    // Convertir TXT a MD
    const mdContent = `# ACTA CONSTITUTIVA

## Información del Documento
- **Proyecto**: ${projectName}
- **Tipo**: ACTA
- **Versión**: 1.0.0
- **Actualización**: ${new Date().toISOString().split('T')[0]}

## Contenido
\`\`\`
${txtContent}
\`\`\`

---

*Documento generado automáticamente desde txt/ACTA.txt*`;
    
    fs.writeFileSync(actaMdPath, mdContent, 'utf-8');
    console.log(`${COLORS.green}✅ Creado: md/ACTA.md (desde txt/ACTA.txt)${COLORS.reset}`);
  }
  
  // 4. Buscar documentos de ciszugamens (MOD_GUIDELINES y RULES)
  // y crear versiones TXT y MD si solo existen DOCX/PDF
  const docxFiles = fs.existsSync(docxPath) ? fs.readdirSync(docxPath) : [];
  const pdfFiles = fs.existsSync(pdfPath) ? fs.readdirSync(pdfPath) : [];
  const txtFiles = fs.existsSync(txtPath) ? fs.readdirSync(txtPath) : [];
  
  // Buscar MOD_GUIDELINES
  const hasModGuidelinesDocx = docxFiles.includes('MOD_GUIDELINES.docx');
  const hasModGuidelinesPdf = pdfFiles.includes('MOD_GUIDELINES.pdf');
  const hasModGuidelinesTxt = txtFiles.includes('MOD_GUIDELINES.txt');
  const hasModGuidelinesMd = fs.existsSync(path.join(mdPath, 'MOD_GUIDELINES.md'));
  
  if ((hasModGuidelinesDocx || hasModGuidelinesPdf) && !hasModGuidelinesTxt) {
    // Crear placeholder TXT
    const txtContent = `${projectName.toUpperCase()} - MOD_GUIDELINES

[ESPAÑOL]
Última actualización: ${new Date().toISOString().split('T')[0]}

Este documento contiene las directrices de moderación para ${projectName}.
La versión completa está disponible en docx/MOD_GUIDELINES.docx y pdf/MOD_GUIDELINES.pdf.

----------------------------------------------------------------

[ENGLISH]
Last updated: ${new Date().toISOString().split('T')[0]}

This document contains moderation guidelines for ${projectName}.
The complete version is available in docx/MOD_GUIDELINES.docx and pdf/MOD_GUIDELINES.pdf.`;
    
    fs.writeFileSync(path.join(txtPath, 'MOD_GUIDELINES.txt'), txtContent, 'utf-8');
    console.log(`${COLORS.green}✅ Creado: txt/MOD_GUIDELINES.txt (placeholder)${COLORS.reset}`);
  }
  
  if ((hasModGuidelinesDocx || hasModGuidelinesPdf) && !hasModGuidelinesMd) {
    // Crear placeholder MD
    const mdContent = `# MOD_GUIDELINES

## Directrices de Moderación - ${projectName}

### Información
- **Proyecto**: ${projectName}
- **Tipo**: MOD_GUIDELINES
- **Versión**: 1.0.0
- **Actualización**: ${new Date().toISOString().split('T')[0]}

### Contenido
Este documento contiene las directrices de moderación para ${projectName}.

### Disponibilidad
- Versión DOCX: docx/MOD_GUIDELINES.docx
- Versión PDF: pdf/MOD_GUIDELINES.pdf

---

*Documento generado automáticamente*`;
    
    fs.writeFileSync(path.join(mdPath, 'MOD_GUIDELINES.md'), mdContent, 'utf-8');
    console.log(`${COLORS.green}✅ Creado: md/MOD_GUIDELINES.md (placeholder)${COLORS.reset}`);
  }
  
  // Buscar RULES
  const hasRulesDocx = docxFiles.includes('RULES.docx');
  const hasRulesPdf = pdfFiles.includes('RULES.pdf');
  const hasRulesTxt = txtFiles.includes('RULES.txt');
  const hasRulesMd = fs.existsSync(path.join(mdPath, 'RULES.md'));
  
  if ((hasRulesDocx || hasRulesPdf) && !hasRulesTxt) {
    // Crear placeholder TXT
    const txtContent = `${projectName.toUpperCase()} - RULES

[ESPAÑOL]
Última actualización: ${new Date().toISOString().split('T')[0]}

Este documento contiene las reglas y normativas para ${projectName}.
La versión completa está disponible en docx/RULES.docx y pdf/RULES.pdf.

----------------------------------------------------------------

[ENGLISH]
Last updated: ${new Date().toISOString().split('T')[0]}

This document contains rules and regulations for ${projectName}.
The complete version is available in docx/RULES.docx and pdf/RULES.pdf.`;
    
    fs.writeFileSync(path.join(txtPath, 'RULES.txt'), txtContent, 'utf-8');
    console.log(`${COLORS.green}✅ Creado: txt/RULES.txt (placeholder)${COLORS.reset}`);
  }
  
  if ((hasRulesDocx || hasRulesPdf) && !hasRulesMd) {
    // Crear placeholder MD
    const mdContent = `# RULES

## Reglas y Normativas - ${projectName}

### Información
- **Proyecto**: ${projectName}
- **Tipo**: RULES
- **Versión**: 1.0.0
- **Actualización**: ${new Date().toISOString().split('T')[0]}

### Contenido
Este documento contiene las reglas y normativas para ${projectName}.

### Disponibilidad
- Versión DOCX: docx/RULES.docx
- Versión PDF: pdf/RULES.pdf

---

*Documento generado automáticamente*`;
    
    fs.writeFileSync(path.join(mdPath, 'RULES.md'), mdContent, 'utf-8');
    console.log(`${COLORS.green}✅ Creado: md/RULES.md (placeholder)${COLORS.reset}`);
  }
  
  // 5. Eliminar carpetas de documents si existen
  const oldDocumentsPath = path.join(projectPath, 'documents');
  if (fs.existsSync(oldDocumentsPath)) {
    console.log(`${COLORS.yellow}🗑️  Eliminando carpeta documents/ antigua...${COLORS.reset}`);
    
    try {
      // Primero mover cualquier contenido especial a docs/
      const specialItems = fs.readdirSync(oldDocumentsPath);
      specialItems.forEach(item => {
        const itemPath = path.join(oldDocumentsPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !['txt', 'docx', 'md', 'pdf', 'ia_docs', 'backups'].includes(item.toLowerCase())) {
          // Es una carpeta especial, moverla a docs/
          const destPath = path.join(docsPath, item);
          if (!fs.existsSync(destPath)) {
            fs.renameSync(itemPath, destPath);
            console.log(`${COLORS.green}✅ Movida carpeta especial: ${item} → docs/${item}${COLORS.reset}`);
          }
        }
      });
      
      // Ahora eliminar documents/
      fs.rmSync(oldDocumentsPath, { recursive: true, force: true });
      console.log(`${COLORS.green}✅ Carpeta documents/ eliminada${COLORS.reset}`);
    } catch (error) {
      console.log(`${COLORS.red}❌ Error eliminando documents/: ${error.message}${COLORS.reset}`);
    }
  }
  
  return true;
}

function syncActaAcrossProjects() {
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🔄 SINCRONIZANDO ACTA ENTRE PROYECTOS${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  // ACTA base desde shared
  const sharedActaPath = path.join(ROOT_DIR, 'shared', 'documentation', 'ACTA.txt');
  
  if (!fs.existsSync(sharedActaPath)) {
    console.log(`${COLORS.red}❌ No existe ACTA base en shared/documentation/${COLORS.reset}`);
    return false;
  }
  
  const baseActaContent = fs.readFileSync(sharedActaPath, 'utf-8');
  
  // Sincronizar en todos los proyectos
  const projects = fs.readdirSync(APPS_DIR).filter(item => {
    const itemPath = path.join(APPS_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  let syncedCount = 0;
  
  projects.forEach(project => {
    const projectPath = path.join(APPS_DIR, project);
    const docsPath = path.join(projectPath, 'docs');
    const txtPath = path.join(docsPath, 'txt');
    
    if (fs.existsSync(txtPath)) {
      const actaPath = path.join(txtPath, 'ACTA.txt');
      
      // Personalizar ACTA para el proyecto
      let projectActa = baseActaContent.replace(/ciszunetwork/g, project.toLowerCase());
      projectActa = projectActa.replace(/CISZU NETWORK/g, project.toUpperCase());
      
      fs.writeFileSync(actaPath, projectActa, 'utf-8');
      
      // Crear también MD si no existe
      const mdPath = path.join(docsPath, 'md', 'ACTA.md');
      if (!fs.existsSync(mdPath)) {
        const mdContent = `# ACTA CONSTITUTIVA - ${project.toUpperCase()}

## Información del Documento
- **Proyecto**: ${project}
- **Tipo**: ACTA
- **Versión**: 1.0.0
- **Actualización**: ${new Date().toISOString().split('T')[0]}

## Contenido
\`\`\`
${projectActa}
\`\`\`

---

*Documento sincronizado automáticamente*`;
        
        fs.writeFileSync(mdPath, mdContent, 'utf-8');
      }
      
      console.log(`${COLORS.green}✅ ACTA sincronizada en: ${project}${COLORS.reset}`);
      syncedCount++;
    }
  });
  
  console.log(`${COLORS.yellow}📊 Proyectos sincronizados: ${syncedCount}${COLORS.reset}`);
  return syncedCount > 0;
}

function main() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║   LIMPIEZA Y SINCRONIZACIÓN DE DOCUMENTACIÓN    ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  // Listar proyectos
  const projects = fs.readdirSync(APPS_DIR).filter(item => {
    const itemPath = path.join(APPS_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  console.log(`${COLORS.cyan}📋 Proyectos encontrados: ${projects.length}${COLORS.reset}`);
  
  // 1. Limpiar cada proyecto
  projects.forEach(project => {
    const projectPath = path.join(APPS_DIR, project);
    cleanProjectDocs(projectPath, project);
  });
  
  // 2. Sincronizar ACTA entre proyectos
  syncActaAcrossProjects();
  
  // 3. Resumen final
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║               RESUMEN FINAL                      ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  console.log(`${COLORS.green}🎯 LIMPIEZA COMPLETADA${COLORS.reset}`);
  console.log(`${COLORS.cyan}📊 Acciones realizadas:${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Archivos MD innecesarios eliminados${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Nombres estandarizados a mayúsculas${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • ACTA sincronizada en todos los proyectos${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Versiones TXT/MD creadas para documentos faltantes${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Carpetas documents/ eliminadas${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Carpetas especiales movidas a docs/${COLORS.reset}`);
  
  console.log(`\n${COLORS.cyan}📁 Estructura final:${COLORS.reset}`);
  console.log(`${COLORS.yellow}  docs/txt/    - Documentos base en texto${COLORS.reset}`);
  console.log(`${COLORS.yellow}  docs/docx/   - Versiones Word${COLORS.reset}`);
  console.log(`${COLORS.yellow}  docs/md/     - Markdown (limpio)${COLORS.reset}`);
  console.log(`${COLORS.yellow}  docs/pdf/    - PDF${COLORS.reset}`);
  console.log(`${COLORS.yellow}  docs/ia_docs/ - Para IAs${COLORS.reset}`);
  console.log(`${COLORS.yellow}  [+ carpetas especiales por proyecto]${COLORS.reset}`);
  
  console.log(`\n${COLORS.green}✅ Documentación limpia y sincronizada${COLORS.reset}`);
}

// Ejecutar limpieza
try {
  main();
} catch (error) {
  console.error(`${COLORS.red}❌ Error en la limpieza: ${error.message}${COLORS.reset}`);
  process.exit(1);
}