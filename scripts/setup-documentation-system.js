#!/usr/bin/env node

/**
 * Sistema de gestión de documentación para Ciszu Network
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const SHARED_DOCS = path.join(ROOT_DIR, 'shared', 'documentation');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`${COLORS.green}✅ Directorio creado: ${path.relative(ROOT_DIR, dirPath)}${COLORS.reset}`);
    return true;
  }
  return false;
}

function copyActaToProject(projectPath, projectName) {
  const docsPath = path.join(projectPath, 'docs');
  const txtPath = path.join(docsPath, 'txt');
  
  createDirectory(docsPath);
  createDirectory(txtPath);
  
  const actaSource = path.join(SHARED_DOCS, 'ACTA_CONSTITUTIVA.txt');
  const actaDest = path.join(txtPath, 'ACTA_CONSTITUTIVA.txt');
  
  if (fs.existsSync(actaSource)) {
    const content = fs.readFileSync(actaSource, 'utf-8');
    const updatedContent = content.replace(/ciszunetwork/g, projectName.toLowerCase());
    
    fs.writeFileSync(actaDest, updatedContent, 'utf-8');
    console.log(`${COLORS.green}✅ ACTA copiada a ${projectName}/docs/txt/${COLORS.reset}`);
    return true;
  }
  return false;
}

function createStandardDocument(docsPath, docType, projectName) {
  const docTypes = {
    'ABOUT': `Acerca de ${projectName} - Información general del proyecto`,
    'CHANGELOG': `Registro de cambios de ${projectName}`,
    'CONTACT': `Información de contacto para ${projectName}`,
    'CREDITS': `Créditos y reconocimientos de ${projectName}`,
    'DOCUMENTATION': `Documentación técnica de ${projectName}`,
    'FAQ': `Preguntas frecuentes sobre ${projectName}`,
    'GUIDELINES': `Directrices y normas de ${projectName}`,
    'HELP': `Guía de ayuda de ${projectName}`,
    'LICENSE': `Licencia de uso de ${projectName}`,
    'POLICY': `Políticas de ${projectName}`,
    'RULES': `Reglas de ${projectName}`,
    'SECURITY': `Política de seguridad de ${projectName}`,
    'SUPPORT': `Soporte técnico de ${projectName}`,
    'TEAM': `Equipo de desarrollo de ${projectName}`,
    'TERMS_AND_CONDITIONS': `Términos y condiciones de ${projectName}`
  };
  
  if (!docTypes[docType]) return false;
  
  const txtPath = path.join(docsPath, 'txt');
  const docxPath = path.join(docsPath, 'docx');
  const mdPath = path.join(docsPath, 'md');
  const pdfPath = path.join(docsPath, 'pdf');
  const iaPath = path.join(docsPath, 'ia_docs');
  
  // Crear directorios si no existen
  createDirectory(txtPath);
  createDirectory(docxPath);
  createDirectory(mdPath);
  createDirectory(pdfPath);
  createDirectory(iaPath);
  
  // Contenido base para TXT
  const content = `${projectName.toUpperCase()} - DOCUMENTACIÓN OFICIAL
Nombre: ${docType}
Versión: 1.0.0
Actualización: 2026-07-14
Identificador: ${docType}_V1.0.0_2026_07_14_${projectName.toLowerCase()}
${'-'.repeat(160)}

${docTypes[docType].toUpperCase()}

[ESPAÑOL]
Última actualización: 14 de Julio, 2026

Este documento forma parte de la documentación oficial de ${projectName}.
Para más información, consulta la documentación completa en docs/${projectName.toLowerCase()}.

----------------------------------------------------------------------------------------------------------------

[ENGLISH]
Last updated: July 14, 2026

This document is part of the official documentation for ${projectName}.
For more information, see the complete documentation at docs/${projectName.toLowerCase()}.

----------------------------------------------------------------------------------------------------------------

NOTAS / NOTES:
- Documento generado automáticamente por el sistema de documentación de Ciszu Network.
- Actualizado: ${new Date().toISOString().split('T')[0]}
- Proyecto: ${projectName}
- Tipo: ${docType}`;
  
  // Crear archivo TXT
  const txtFile = path.join(txtPath, `${docType}.txt`);
  fs.writeFileSync(txtFile, content, 'utf-8');
  
  // Crear archivo MD
  const mdContent = `# ${docTypes[docType]}

## Información del Documento
- **Proyecto**: ${projectName}
- **Tipo**: ${docType}
- **Versión**: 1.0.0
- **Actualización**: 2026-07-14

## Contenido
Este documento forma parte de la documentación oficial de ${projectName}.

## [ESPAÑOL]
Última actualización: 14 de Julio, 2026

Este documento forma parte de la documentación oficial de ${projectName}.
Para más información, consulta la documentación completa.

## [ENGLISH]
Last updated: July 14, 2026

This document is part of the official documentation for ${projectName}.
For more information, see the complete documentation.

---

*Documento generado por el sistema de documentación de Ciszu Network*`;
  
  const mdFile = path.join(mdPath, `${docType}.md`);
  fs.writeFileSync(mdFile, mdContent, 'utf-8');
  
  // Crear placeholder para DOCX
  const docxFile = path.join(docxPath, `${docType}.docx`);
  if (!fs.existsSync(docxFile)) {
    fs.writeFileSync(docxFile, `Placeholder para ${docType}.docx de ${projectName}`, 'utf-8');
  }
  
  // Crear placeholder para PDF
  const pdfFile = path.join(pdfPath, `${docType}.pdf`);
  if (!fs.existsSync(pdfFile)) {
    fs.writeFileSync(pdfFile, `Placeholder para ${docType}.pdf de ${projectName}`, 'utf-8');
  }
  
  // Crear contenido para IA
  const iaContent = `# Documentación para IA - ${docType}

## Contexto
Proyecto: ${projectName}
Tipo de documento: ${docType}
Fecha de generación: ${new Date().toISOString()}

## Metadatos
\`\`\`json
{
  "project": "${projectName}",
  "document_type": "${docType}",
  "version": "1.0.0",
  "generated_date": "${new Date().toISOString()}",
  "language": ["es", "en"],
  "status": "active"
}
\`\`\`

## Contenido principal
${docTypes[docType]}

## Información adicional
Este archivo ayuda a las IAs a entender la estructura y contenido de la documentación de ${projectName}.
`;
  
  const iaFile = path.join(iaPath, `${docType}_IA.md`);
  fs.writeFileSync(iaFile, iaContent, 'utf-8');
  
  return true;
}

function setupProjectDocumentation(projectName) {
  const projectPath = path.join(APPS_DIR, projectName);
  const docsPath = path.join(projectPath, 'docs');
  
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}📁 CONFIGURANDO: ${projectName.toUpperCase()}${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  // Migrar de documents a docs si es necesario
  const oldDocsPath = path.join(projectPath, 'documents');
  if (fs.existsSync(oldDocsPath) && !fs.existsSync(docsPath)) {
    console.log(`${COLORS.yellow}🔄 Migrando documents/ → docs/${COLORS.reset}`);
    
    // Copiar estructura existente
    try {
      // Crear docs primero
      createDirectory(docsPath);
      
      // Copiar subdirectorios
      const subdirs = fs.readdirSync(oldDocsPath);
      subdirs.forEach(subdir => {
        const source = path.join(oldDocsPath, subdir);
        const dest = path.join(docsPath, subdir);
        
        if (fs.statSync(source).isDirectory()) {
          // Copiar directorio
          createDirectory(dest);
          
          // Copiar archivos
          const files = fs.readdirSync(source);
          files.forEach(file => {
            const fileSource = path.join(source, file);
            const fileDest = path.join(dest, file);
            
            if (fs.statSync(fileSource).isFile()) {
              fs.copyFileSync(fileSource, fileDest);
            }
          });
          
          console.log(`${COLORS.green}✅ Copiado: ${subdir}/ (${files.length} archivos)${COLORS.reset}`);
        }
      });
    } catch (error) {
      console.log(`${COLORS.red}❌ Error migrando: ${error.message}${COLORS.reset}`);
    }
  } else if (!fs.existsSync(docsPath)) {
    console.log(`${COLORS.yellow}📄 Creando estructura docs/ nueva${COLORS.reset}`);
    createDirectory(docsPath);
  }
  
  // Copiar ACTA constitutiva
  copyActaToProject(projectPath, projectName);
  
  // Crear documentos estándar
  const standardDocs = [
    'ABOUT', 'CHANGELOG', 'CONTACT', 'CREDITS', 'DOCUMENTATION',
    'FAQ', 'GUIDELINES', 'HELP', 'LICENSE', 'POLICY',
    'RULES', 'SECURITY', 'SUPPORT', 'TEAM', 'TERMS_AND_CONDITIONS'
  ];
  
  let createdCount = 0;
  standardDocs.forEach(docType => {
    if (createStandardDocument(docsPath, docType, projectName)) {
      createdCount++;
    }
  });
  
  console.log(`${COLORS.green}✅ Documentos creados: ${createdCount}${COLORS.reset}`);
  
  // Crear README del proyecto
  const readmePath = path.join(projectPath, 'README.md');
  const readmeContent = `# ${projectName}

## Descripción
${projectName} es un proyecto de Ciszu Network.

## Estructura del Proyecto
\`\`\`
${projectName}/
├── docs/                    # Documentación del proyecto
│   ├── txt/                # Documentos en texto plano
│   ├── docx/               # Documentos en formato Word
│   ├── md/                 # Documentos en Markdown
│   ├── pdf/                # Documentos en PDF
│   └── ia_docs/            # Documentación para IAs
├── website/                # Sitio web (si aplica)
└── README.md               # Este archivo
\`\`\`

## Documentación
La documentación completa se encuentra en la carpeta \`docs/\` y sigue la estructura estándar de Ciszu Network.

## Uso
Para más información, consulta los documentos en \`docs/txt/\` o visita el sitio web del proyecto.

## Licencia
© ${new Date().getFullYear()} Ciszu Network. Todos los derechos reservados.`;
  
  if (!fs.existsSync(readmePath) || fs.readFileSync(readmePath, 'utf-8').includes('shigamens') || fs.readFileSync(readmePath, 'utf-8').includes('Shigamens')) {
    fs.writeFileSync(readmePath, readmeContent, 'utf-8');
    console.log(`${COLORS.green}✅ README actualizado${COLORS.reset}`);
  }
  
  return {
    projectName,
    docsPath: path.relative(ROOT_DIR, docsPath),
    hasStructure: fs.existsSync(docsPath)
  };
}

function main() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║  SISTEMA DE DOCUMENTACIÓN - CISZU NETWORK       ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  // Crear directorio de documentación compartida
  createDirectory(SHARED_DOCS);
  
  // Listar proyectos
  const projects = fs.readdirSync(APPS_DIR).filter(item => {
    const itemPath = path.join(APPS_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  console.log(`${COLORS.cyan}📋 Proyectos encontrados: ${projects.length}${COLORS.reset}`);
  
  const results = [];
  projects.forEach(project => {
    const result = setupProjectDocumentation(project);
    results.push(result);
  });
  
  // Resumen final
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║             RESUMEN DE CONFIGURACIÓN             ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  const successCount = results.filter(r => r.hasStructure).length;
  
  console.log(`${COLORS.green}✅ Proyectos configurados: ${successCount}/${projects.length}${COLORS.reset}`);
  
  results.forEach(result => {
    console.log(`${result.hasStructure ? '✅' : '❌'} ${result.projectName}: ${result.docsPath}`);
  });
  
  // Crear script para convertir documentos
  console.log(`\n${COLORS.cyan}🚀 Próximos pasos:${COLORS.reset}`);
  console.log(`${COLORS.yellow}1. Instalar dependencias para manejo de documentos${COLORS.reset}`);
  console.log(`${COLORS.yellow}2. Ejecutar scripts de conversión de formatos${COLORS.reset}`);
  console.log(`${COLORS.yellow}3. Configurar sistema de iconos en proyectos${COLORS.reset}`);
  console.log(`${COLORS.yellow}4. Organizar fuentes y logos${COLORS.reset}`);
  
  console.log(`\n${COLORS.green}🎉 Sistema de documentación configurado${COLORS.reset}`);
}

// Ejecutar configuración
try {
  main();
} catch (error) {
  console.error(`${COLORS.red}❌ Error en la configuración: ${error.message}${COLORS.reset}`);
  process.exit(1);
}