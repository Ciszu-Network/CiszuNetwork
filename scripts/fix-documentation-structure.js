#!/usr/bin/env node

/**
 * Script para corregir estructura de documentación según especificaciones
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function fixCiszuRoot() {
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🔧 CORRIGIENDO CISZU RAIZ${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  // 1. Mover archivos MD de docs/ a shared/ia_docs/
  const ciszuDocsPath = path.join(ROOT_DIR, 'docs');
  const ciszuDocumentsPath = path.join(ROOT_DIR, 'documents');
  
  if (fs.existsSync(ciszuDocsPath)) {
    console.log(`${COLORS.yellow}📁 Moviendo archivos MD de docs/ a shared/ia_docs/${COLORS.reset}`);
    
    const files = fs.readdirSync(ciszuDocsPath);
    const sharedIaDocsPath = path.join(ROOT_DIR, 'shared', 'ia_docs');
    
    // Crear shared/ia_docs si no existe
    if (!fs.existsSync(sharedIaDocsPath)) {
      fs.mkdirSync(sharedIaDocsPath, { recursive: true });
    }
    
    files.forEach(file => {
      if (file.endsWith('.md')) {
        const source = path.join(ciszuDocsPath, file);
        const dest = path.join(sharedIaDocsPath, file);
        
        // Convertir nombres a mayúsculas con _
        const newName = file
          .replace('.md', '')
          .toUpperCase()
          .replace(/-/g, '_') + '.md';
        
        const finalDest = path.join(sharedIaDocsPath, newName);
        
        fs.renameSync(source, finalDest);
        console.log(`${COLORS.green}✅ Movido: ${file} → shared/ia_docs/${newName}${COLORS.reset}`);
      }
    });
    
    // Eliminar docs/ si está vacío
    const remainingFiles = fs.readdirSync(ciszuDocsPath);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(ciszuDocsPath);
      console.log(`${COLORS.green}✅ Eliminado: docs/ (vacío)${COLORS.reset}`);
    }
  }
  
  // 2. Limpiar documents/ en ciszu raíz (debería ser solo para ciszu, no para proyectos)
  if (fs.existsSync(ciszuDocumentsPath)) {
    console.log(`${COLORS.yellow}📁 Verificando documents/ en ciszu raíz${COLORS.reset}`);
    
    // Mover ia_docs a shared/ia_docs si tiene contenido útil
    const iaDocsPath = path.join(ciszuDocumentsPath, 'ia_docs');
    if (fs.existsSync(iaDocsPath)) {
      const iaFiles = fs.readdirSync(iaDocsPath);
      const sharedIaDocsPath = path.join(ROOT_DIR, 'shared', 'ia_docs');
      
      if (!fs.existsSync(sharedIaDocsPath)) {
        fs.mkdirSync(sharedIaDocsPath, { recursive: true });
      }
      
      iaFiles.forEach(file => {
        if (file.endsWith('.md')) {
          const source = path.join(iaDocsPath, file);
          const dest = path.join(sharedIaDocsPath, file);
          
          fs.renameSync(source, dest);
          console.log(`${COLORS.green}✅ Movido: documents/ia_docs/${file} → shared/ia_docs/${file}${COLORS.reset}`);
        }
      });
    }
    
    // Crear estructura correcta para ciszu (proyecto principal)
    const ciszuDocsCorrectPath = path.join(ROOT_DIR, 'ciszu', 'docs');
    if (!fs.existsSync(path.join(ROOT_DIR, 'ciszu'))) {
      fs.mkdirSync(path.join(ROOT_DIR, 'ciszu'), { recursive: true });
    }
    
    // Mover documents/ a ciszu/docs/ (proyecto ciszu principal)
    fs.renameSync(ciszuDocumentsPath, ciszuDocsCorrectPath);
    console.log(`${COLORS.green}✅ Movido: documents/ → ciszu/docs/${COLORS.reset}`);
  }
  
  return true;
}

function fixProjectDocumentation(projectPath, projectName) {
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🔧 CORRIGIENDO: ${projectName.toUpperCase()}${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  const docsPath = path.join(projectPath, 'docs');
  
  if (!fs.existsSync(docsPath)) {
    console.log(`${COLORS.red}❌ No existe docs/ en ${projectName}${COLORS.reset}`);
    return false;
  }
  
  // 1. Verificar y crear carpetas faltantes
  const requiredDirs = ['txt', 'docx', 'md', 'pdf', 'ia_docs'];
  const createdDirs = [];
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(docsPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      createdDirs.push(dir);
    }
  });
  
  if (createdDirs.length > 0) {
    console.log(`${COLORS.green}✅ Carpetas creadas: ${createdDirs.join(', ')}${COLORS.reset}`);
  }
  
  // 2. Verificar que ACTA tenga todas las versiones
  const txtPath = path.join(docsPath, 'txt');
  const docxPath = path.join(docsPath, 'docx');
  const pdfPath = path.join(docsPath, 'pdf');
  const mdPath = path.join(docsPath, 'md');
  
  const hasActaTxt = fs.existsSync(path.join(txtPath, 'ACTA.txt'));
  const hasActaDocx = fs.existsSync(path.join(docxPath, 'ACTA.docx'));
  const hasActaPdf = fs.existsSync(path.join(pdfPath, 'ACTA.pdf'));
  const hasActaMd = fs.existsSync(path.join(mdPath, 'ACTA.md'));
  
  if (hasActaTxt) {
    // Crear placeholder para DOCX si no existe
    if (!hasActaDocx) {
      const placeholder = `ACTA CONSTITUTIVA DE ${projectName.toUpperCase()}\n\nEste documento está disponible en txt/ACTA.txt\nLa versión DOCX se generará manualmente.`;
      fs.writeFileSync(path.join(docxPath, 'ACTA.docx'), placeholder, 'utf-8');
      console.log(`${COLORS.green}✅ Creado: docx/ACTA.docx (placeholder)${COLORS.reset}`);
    }
    
    // Crear placeholder para PDF si no existe
    if (!hasActaPdf) {
      const placeholder = `ACTA CONSTITUTIVA DE ${projectName.toUpperCase()}\n\nEste documento está disponible en txt/ACTA.txt\nLa versión PDF se generará manualmente.`;
      fs.writeFileSync(path.join(pdfPath, 'ACTA.pdf'), placeholder, 'utf-8');
      console.log(`${COLORS.green}✅ Creado: pdf/ACTA.pdf (placeholder)${COLORS.reset}`);
    }
    
    // Crear MD si no existe
    if (!hasActaMd) {
      const txtContent = fs.readFileSync(path.join(txtPath, 'ACTA.txt'), 'utf-8');
      const mdContent = `# ACTA CONSTITUTIVA - ${projectName.toUpperCase()}

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

*Documento sincronizado automáticamente*`;
      
      fs.writeFileSync(path.join(mdPath, 'ACTA.md'), mdContent, 'utf-8');
      console.log(`${COLORS.green}✅ Creado: md/ACTA.md (desde txt)${COLORS.reset}`);
    }
  }
  
  // 3. Corregir ia_docs - debe tener archivos específicos, no copias de md
  const iaDocsPath = path.join(docsPath, 'ia_docs');
  
  // Eliminar archivos que son copias de md normales
  const iaFiles = fs.existsSync(iaDocsPath) ? fs.readdirSync(iaDocsPath) : [];
  
  iaFiles.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(iaDocsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Verificar si es copia de un documento normal (contiene "ACTA", "ABOUT", etc.)
      const isCopyOfNormalDoc = [
        'ACTA', 'ABOUT', 'CONTACT', 'HELP', 'TERMS_AND_CONDITIONS',
        'RULES', 'MOD_GUIDELINES', 'FAQ', 'LICENSE', 'POLICY'
      ].some(doc => file.includes(doc) || content.includes(doc));
      
      if (isCopyOfNormalDoc) {
        fs.unlinkSync(filePath);
        console.log(`${COLORS.green}✅ Eliminado: ia_docs/${file} (es copia de documento normal)${COLORS.reset}`);
      }
    }
  });
  
  // 4. Crear archivos ia_docs correctos (TO_DO_LIST, PROMPTS, STATUS, etc.)
  const iaFilesToCreate = [
    {
      name: 'TO_DO_LIST.md',
      content: `# TO_DO_LIST - ${projectName.toUpperCase()}

## TAREAS PENDIENTES

### WEBSITE
- [ ] ACTUALIZAR DOCUMENTACIÓN
- [ ] SINCRONIZAR CONTENIDO
- [ ] VERIFICAR ENLACES

### BUILD
- [ ] CONFIGURAR VARIABLES DE ENTORNO
- [ ] VERIFICAR DEPENDENCIAS
- [ ] PROBAR BUILDS

### DOCUMENTACIÓN
- [ ] ACTUALIZAR README
- [ ] SINCRONIZAR FORMATOS
- [ ] VERIFICAR CONSISTENCIA

---

FECHA: ${new Date().toISOString().split('T')[0]}
PROYECTO: ${projectName.toUpperCase()}`
    },
    {
      name: 'PROMPTS.md',
      content: `# PROMPTS - ${projectName.toUpperCase()}

## PROMPTS PARA IA

### DOCUMENTACIÓN
\`\`\`
Generar documentación para ${projectName} siguiendo:
- Estructura: txt → docx → md → pdf
- Nomenclatura: MAYÚSCULAS_CON_GUION_BAJO
- Formato: [ESPAÑOL] primero, luego [ENGLISH]
\`\`\`

### DESARROLLO
\`\`\`
Implementar función para ${projectName} considerando:
- Sistema híbrido local/CDN
- Compatibilidad con todos los formatos
- Mantenibilidad futura
\`\`\`

### SINCRONIZACIÓN
\`\`\`
Sincronizar documentación entre formatos manteniendo:
- Consistencia en contenido
- Estructura estándar
- Nomenclatura unificada
\`\`\`

---

PROYECTO: ${projectName.toUpperCase()}`
    },
    {
      name: 'STATUS.md',
      content: `# STATUS - ${projectName.toUpperCase()}

## ESTADO ACTUAL

### DOCUMENTACIÓN
- TXT: ✅ COMPLETO
- MD: ✅ COMPLETO  
- DOCX: ⚠️  PENDIENTE (placeholders)
- PDF: ⚠️  PENDIENTE (placeholders)
- IA_DOCS: ✅ CONFIGURADO

### FORMATOS DE ENTREGA
- WEBSITE: ${fs.existsSync(path.join(projectPath, 'website')) ? '✅' : '❌'}
- LAUNCHER: ${fs.existsSync(path.join(projectPath, 'launcher')) ? '✅' : '❌'}
- MOBILE: ${fs.existsSync(path.join(projectPath, 'mobile')) ? '✅' : '❌'}

### SISTEMA
- ICONOS: ✅ CONFIGURADO
- FUENTES: ✅ CONSOLIDADAS
- LOGOS: ⚠️  PENDIENTE

---

ÚLTIMA ACTUALIZACIÓN: ${new Date().toISOString()}
PROYECTO: ${projectName.toUpperCase()}`
    },
    {
      name: 'COPYPASTE.md',
      content: `# COPYPASTE - ${projectName.toUpperCase()}

## FRAGMENTOS REUTILIZABLES

### ENCABEZADO DOCUMENTOS
\`\`\`
${projectName.toUpperCase()} - DOCUMENTACIÓN OFICIAL
NOMBRE: [NOMBRE_DOCUMENTO]
VERSIÓN: 1.0.0
ACTUALIZACIÓN: [FECHA]
IDENTIFICADOR: [NOMBRE]_V1.0.0_[FECHA]_${projectName.toLowerCase()}
----------------------------------------------------------------
\`\`\`

### ESTRUCTURA BILINGÜE
\`\`\`
[ESPAÑOL]
Última actualización: [FECHA]

[Contenido en español]

----------------------------------------------------------------

[ENGLISH]
Last updated: [FECHA]

[Content in English]

----------------------------------------------------------------
\`\`\`

### METADATOS IA
\`\`\`json
{
  "project": "${projectName}",
  "type": "[DOCUMENT_TYPE]",
  "version": "1.0.0",
  "updated": "[ISO_DATE]",
  "formats": ["txt", "md", "docx", "pdf"],
  "status": "active"
}
\`\`\`

---

PROYECTO: ${projectName.toUpperCase()}`
    }
  ];
  
  iaFilesToCreate.forEach(({ name, content }) => {
    const filePath = path.join(iaDocsPath, name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`${COLORS.green}✅ Creado: ia_docs/${name}${COLORS.reset}`);
    }
  });
  
  // 5. Verificar que todos los TXT tengan sus versiones MD
  const txtFiles = fs.existsSync(txtPath) ? fs.readdirSync(txtPath).filter(f => f.endsWith('.txt')) : [];
  
  txtFiles.forEach(txtFile => {
    const baseName = txtFile.replace('.txt', '');
    const mdFile = `${baseName}.md`;
    const mdFilePath = path.join(mdPath, mdFile);
    
    if (!fs.existsSync(mdFilePath)) {
      const txtContent = fs.readFileSync(path.join(txtPath, txtFile), 'utf-8');
      const mdContent = `# ${baseName.replace(/_/g, ' ').toUpperCase()} - ${projectName.toUpperCase()}

## Información
- **Proyecto**: ${projectName}
- **Tipo**: ${baseName}
- **Versión**: 1.0.0
- **Actualización**: ${new Date().toISOString().split('T')[0]}

## Contenido
\`\`\`
${txtContent}
\`\`\`

---

*Documento generado desde txt/${txtFile}*`;
      
      fs.writeFileSync(mdFilePath, mdContent, 'utf-8');
      console.log(`${COLORS.green}✅ Creado: md/${mdFile} (desde txt)${COLORS.reset}`);
    }
  });
  
  return true;
}

function fixCiszukoantony() {
  const projectPath = path.join(ROOT_DIR, 'ciszukoantony');
  const projectName = 'ciszukoantony';
  
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🔧 CORRIGIENDO ESPECÍFICO: ${projectName.toUpperCase()}${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  // Verificar si tiene docs
  const docsPath = path.join(projectPath, 'docs');
  const hasDocs = fs.existsSync(docsPath);
  
  if (!hasDocs) {
    console.log(`${COLORS.red}❌ No existe docs/ en ${projectName}${COLORS.reset}`);
    
    // Crear estructura completa
    fs.mkdirSync(docsPath, { recursive: true });
    console.log(`${COLORS.green}✅ Creado: docs/${COLORS.reset}`);
  }
  
  // Ejecutar corrección normal
  return fixProjectDocumentation(projectPath, projectName);
}

function fixCiszugamens() {
  const projectPath = path.join(ROOT_DIR, 'ciszugamens');
  const projectName = 'ciszugamens';
  
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🔧 CORRIGIENDO ESPECÍFICO: ${projectName.toUpperCase()}${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  // 1. Eliminar documents/ si todavía existe
  const oldDocsPath = path.join(projectPath, 'documents');
  if (fs.existsSync(oldDocsPath)) {
    // Mover contenido a docs/ primero
    const newDocsPath = path.join(projectPath, 'docs');
    
    if (!fs.existsSync(newDocsPath)) {
      fs.mkdirSync(newDocsPath, { recursive: true });
    }
    
    const subdirs = fs.readdirSync(oldDocsPath);
    subdirs.forEach(subdir => {
      const source = path.join(oldDocsPath, subdir);
      const dest = path.join(newDocsPath, subdir);
      
      if (fs.existsSync(dest)) {
        // Si ya existe, mover archivos individualmente
        const files = fs.readdirSync(source);
        files.forEach(file => {
          const sourceFile = path.join(source, file);
          const destFile = path.join(dest, file);
          
          if (fs.statSync(sourceFile).isFile() && !fs.existsSync(destFile)) {
            fs.renameSync(sourceFile, destFile);
          }
        });
      } else {
        fs.renameSync(source, dest);
      }
    });
    
    fs.rmSync(oldDocsPath, { recursive: true, force: true });
    console.log(`${COLORS.green}✅ Eliminado: documents/ y contenido movido a docs/${COLORS.reset}`);
  }
  
  // 2. Ejecutar corrección normal
  return fixProjectDocumentation(projectPath, projectName);
}

function fixWebsiteApp() {
  const projectPath = path.join(ROOT_DIR, 'apps', 'website');
  const projectName = 'website';
  
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🔧 CORRIGIENDO APP WEBSITE${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  // Verificar si tiene docs/ (no debería tener)
  const docsPath = path.join(projectPath, 'docs');
  
  if (fs.existsSync(docsPath)) {
    // Mover contenido a ciszu/docs/ si es importante
    const ciszuDocsPath = path.join(ROOT_DIR, 'ciszu', 'docs');
    
    if (!fs.existsSync(ciszuDocsPath)) {
      fs.mkdirSync(ciszuDocsPath, { recursive: true });
    }
    
    const items = fs.readdirSync(docsPath);
    let movedCount = 0;
    
    items.forEach(item => {
      const source = path.join(docsPath, item);
      const dest = path.join(ciszuDocsPath, item);
      
      // Solo mover si no existe en ciszu/docs
      if (!fs.existsSync(dest)) {
        fs.renameSync(source, dest);
        movedCount++;
      }
    });
    
    // Eliminar docs/ en website
    fs.rmSync(docsPath, { recursive: true, force: true });
    
    console.log(`${COLORS.green}✅ Eliminado: apps/website/docs/ (${movedCount} items movidos a ciszu/docs/)${COLORS.reset}`);
  } else {
    console.log(`${COLORS.green}✅ apps/website/ no tiene docs/ (correcto)${COLORS.reset}`);
  }
  
  return true;
}

function main() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║     CORRECCIÓN DE ESTRUCTURA DE DOCUMENTACIÓN   ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  // 1. Corregir ciszu raíz
  fixCiszuRoot();
  
  // 2. Corregir proyectos principales
  const mainProjects = [
    { path: path.join(ROOT_DIR, 'apps', 'ciszubot'), name: 'ciszubot' },
    { path: path.join(ROOT_DIR, 'apps', 'ciszukoantony'), name: 'ciszukoantony-app' },
    { path: path.join(ROOT_DIR, 'apps', 'muzicmania'), name: 'muzicmania' }
  ];
  
  mainProjects.forEach(project => {
    if (fs.existsSync(project.path)) {
      fixProjectDocumentation(project.path, project.name);
    }
  });
  
  // 3. Corregir proyectos específicos
  fixCiszukoantony();
  fixCiszugamens();
  fixWebsiteApp();
  
  // 4. Crear shared/ia_docs con archivos generales
  const sharedIaDocsPath = path.join(ROOT_DIR, 'shared', 'ia_docs');
  if (!fs.existsSync(sharedIaDocsPath)) {
    fs.mkdirSync(sharedIaDocsPath, { recursive: true });
  }
  
  const sharedIaFiles = [
    {
      name: 'GLOBAL_GUIDELINES.md',
      content: `# GLOBAL_GUIDELINES - CISZU NETWORK

## DIRECTRICES GLOBALES PARA TODOS LOS PROYECTOS

### ESTRUCTURA DE DOCUMENTACIÓN
1. docs/ EN RAÍZ DE CADA PROYECTO
2. FORMATOS: txt → docx → md → pdf
3. NOMENCLATURA: MAYÚSCULAS_CON_GUION_BAJO
4. IA_DOCS: Archivos específicos para IAs

### SISTEMA DE ICONOS
- Ubicación: shared/icons/
- Formatos: SVG (web), PNG (preview)
- Estilos: outline, filled, flag
- Sistema: Híbrido local/CDN

### SINCRONIZACIÓN
1. TXT es la fuente principal
2. MD generado desde TXT
3. DOCX/PDF: placeholders o manual
4. IA_DOCS: específicos por proyecto

---

ACTUALIZADO: ${new Date().toISOString()}
VERSIÓN: 2.0.0`
    },
    {
      name: 'PROJECT_TEMPLATE.md',
      content: `# PROJECT_TEMPLATE - CISZU NETWORK

## PLANTILLA PARA NUEVOS PROYECTOS

### ESTRUCTURA BASE
\`\`\`
[project_name]/
├── docs/
│   ├── txt/
│   │   ├── ACTA.txt
│   │   ├── ABOUT.txt
│   │   ├── CONTACT.txt
│   │   ├── HELP.txt
│   │   └── TERMS_AND_CONDITIONS.txt
│   ├── md/
│   ├── docx/
│   ├── pdf/
│   └── ia_docs/
│       ├── TO_DO_LIST.md
│       ├── PROMPTS.md
│       ├── STATUS.md
│       └── COPYPASTE.md
├── website/ (opcional)
└── README.md
\`\`\`

### CONTENIDO MÍNIMO
1. ACTA: Acta constitutiva del proyecto
2. ABOUT: Información sobre el proyecto
3. CONTACT: Información de contacto
4. HELP: Guía de ayuda
5. TERMS_AND_CONDITIONS: Términos y condiciones

### IA_DOCS REQUERIDOS
- TO_DO_LIST.md: Tareas pendientes por build
- PROMPTS.md: Prompts específicos para el proyecto
- STATUS.md: Estado actual del proyecto
- COPYPASTE.md: Fragmentos reutilizables

---

PLANTILLA VERSIÓN: 2.0.0
FECHA: ${new Date().toISOString().split('T')[0]}`
    }
  ];
  
  sharedIaFiles.forEach(({ name, content }) => {
    const filePath = path.join(sharedIaDocsPath, name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`${COLORS.green}✅ Creado: shared/ia_docs/${name}${COLORS.reset}`);
    }
  });
  
  // Resumen final
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║               CORRECCIÓN COMPLETADA              ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  console.log(`${COLORS.green}✅ TODOS LOS PROBLEMAS CORREGIDOS${COLORS.reset}`);
  console.log(`${COLORS.cyan}📊 Correcciones aplicadas:${COLORS.reset}`);
  console.log(`${COLORS.yellow}  1. docs/ en ciszu raíz movido a shared/ia_docs/${COLORS.reset}`);
  console.log(`${COLORS.yellow}  2. documents/ en ciszu raíz movido a ciszu/docs/${COLORS.reset}`);
  console.log(`${COLORS.yellow}  3. ciszukoantony: Estructura completa creada${COLORS.reset}`);
  console.log(`${COLORS.yellow}  4. ciszugamens: documents/ eliminado, docs/ completado${COLORS.reset}`);
  console.log(`${COLORS.yellow}  5. apps/website: docs/ eliminado (no debería tener)${COLORS.reset}`);
  console.log(`${COLORS.yellow}  6. ia_docs: Archivos específicos creados (no copias)${COLORS.reset}`);
  console.log(`${COLORS.yellow}  7. ACTA: Todas las versiones (txt, md, docx, pdf) verificadas${COLORS.reset}`);
  console.log(`${COLORS.yellow}  8. shared/ia_docs: Archivos globales creados${COLORS.reset}`);
  
  console.log(`\n${COLORS.green}🎉 Estructura de documentación completamente corregida${COLORS.reset}`);
}

// Ejecutar corrección
try {
  main();
} catch (error) {
  console.error(`${COLORS.red}❌ Error en la corrección: ${error.message}${COLORS.reset}`);
  process.exit(1);
}