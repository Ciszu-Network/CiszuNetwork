#!/usr/bin/env node

/**
 * Script para limpiar y unificar documentación en raíz de proyectos
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

function cleanPublicDocs(projectPath, projectName) {
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🧹 LIMPIANDO PUBLIC/DOCS: ${projectName.toUpperCase()}${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  const websitePath = path.join(projectPath, 'website');
  if (!fs.existsSync(websitePath)) {
    console.log(`${COLORS.yellow}⏭️  No tiene website${COLORS.reset}`);
    return 0;
  }
  
  const publicDocsPath = path.join(websitePath, 'public', 'docs');
  if (!fs.existsSync(publicDocsPath)) {
    console.log(`${COLORS.yellow}⏭️  No tiene public/docs${COLORS.reset}`);
    return 0;
  }
  
  // Verificar si está vacío o tiene contenido importante
  const items = fs.readdirSync(publicDocsPath);
  if (items.length === 0) {
    fs.rmdirSync(publicDocsPath);
    console.log(`${COLORS.green}✅ Eliminado: public/docs/ (vacío)${COLORS.reset}`);
    return 1;
  }
  
  // Mover contenido importante a docs raíz si es necesario
  const rootDocsPath = path.join(projectPath, 'docs');
  
  let movedCount = 0;
  items.forEach(item => {
    const sourcePath = path.join(publicDocsPath, item);
    const destPath = path.join(rootDocsPath, item);
    
    // Solo mover si no existe en docs raíz y es importante
    if (!fs.existsSync(destPath)) {
      const stat = fs.statSync(sourcePath);
      
      // Verificar si es archivo importante (no solo placeholder)
      if (stat.isFile()) {
        const content = fs.readFileSync(sourcePath, 'utf-8');
        const isPlaceholder = content.includes('placeholder') || 
                             content.includes('Placeholder') ||
                             content.length < 100;
        
        if (!isPlaceholder) {
          fs.renameSync(sourcePath, destPath);
          movedCount++;
          console.log(`${COLORS.green}✅ Movido: ${item} → docs/${item}${COLORS.reset}`);
        }
      }
    }
  });
  
  // Eliminar public/docs
  fs.rmSync(publicDocsPath, { recursive: true, force: true });
  console.log(`${COLORS.green}✅ Eliminado: public/docs/${COLORS.reset}`);
  
  return movedCount + 1;
}

function verifyRootDocsStructure(projectPath, projectName) {
  const docsPath = path.join(projectPath, 'docs');
  
  if (!fs.existsSync(docsPath)) {
    console.log(`${COLORS.red}❌ No existe docs/ en raíz de ${projectName}${COLORS.reset}`);
    return false;
  }
  
  console.log(`${COLORS.green}✅ docs/ existe en raíz de ${projectName}${COLORS.reset}`);
  
  // Verificar estructura básica
  const requiredDirs = ['txt', 'md', 'ia_docs'];
  const optionalDirs = ['docx', 'pdf', 'backups', 'xlsx'];
  
  let hasRequired = true;
  requiredDirs.forEach(dir => {
    const dirPath = path.join(docsPath, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`${COLORS.yellow}⚠️  Faltante: docs/${dir}/${COLORS.reset}`);
      hasRequired = false;
    }
  });
  
  return hasRequired;
}

function syncProjectDocumentation(projectPath, projectName) {
  const docsPath = path.join(projectPath, 'docs');
  const websitePath = path.join(projectPath, 'website');
  
  console.log(`\n${COLORS.cyan}🔄 SINCRONIZANDO: ${projectName.toUpperCase()}${COLORS.reset}`);
  
  // Verificar si tiene website para extraer información
  const hasWebsite = fs.existsSync(websitePath);
  
  if (hasWebsite) {
    console.log(`${COLORS.yellow}🌐 Tiene website - verificando info extraíble${COLORS.reset}`);
    
    // Buscar archivos con info en website
    const websiteSrcPath = path.join(websitePath, 'src');
    let foundInfo = false;
    
    if (fs.existsSync(websiteSrcPath)) {
      // Buscar componentes, páginas, etc. que puedan tener info
      const searchTerms = ['about', 'contact', 'help', 'faq', 'terms', 'privacy', 'policy'];
      
      searchTerms.forEach(term => {
        // Buscar archivos relacionados
        try {
          const files = findFiles(websiteSrcPath, term);
          if (files.length > 0) {
            console.log(`${COLORS.blue}🔍 Encontrados archivos de ${term}: ${files.length}${COLORS.reset}`);
            foundInfo = true;
          }
        } catch (error) {
          // Ignorar errores
        }
      });
    }
    
    if (!foundInfo) {
      console.log(`${COLORS.yellow}⚠️  No se encontró info explícita en código${COLORS.reset}`);
    }
  } else {
    console.log(`${COLORS.yellow}📄 No tiene website - documentación manual${COLORS.reset}`);
  }
  
  // Asegurar documentos básicos
  const txtPath = path.join(docsPath, 'txt');
  const mdPath = path.join(docsPath, 'md');
  const iaPath = path.join(docsPath, 'ia_docs');
  
  // Documentos básicos requeridos
  const basicDocs = ['ACTA', 'ABOUT', 'CONTACT', 'HELP', 'TERMS_AND_CONDITIONS'];
  
  basicDocs.forEach(doc => {
    const txtFile = path.join(txtPath, `${doc}.txt`);
    const mdFile = path.join(mdPath, `${doc}.md`);
    
    // Crear TXT si no existe
    if (!fs.existsSync(txtFile)) {
      let content = '';
      
      switch(doc) {
        case 'ACTA':
          content = `${projectName.toUpperCase()} - ACTA CONSTITUTIVA\n\nDocumento base del proyecto.`;
          break;
        case 'ABOUT':
          content = `${projectName.toUpperCase()} - ABOUT\n\nInformación sobre ${projectName}.`;
          break;
        case 'CONTACT':
          content = `${projectName.toUpperCase()} - CONTACT\n\nInformación de contacto para ${projectName}.`;
          break;
        case 'HELP':
          content = `${projectName.toUpperCase()} - HELP\n\nGuía de ayuda para ${projectName}.`;
          break;
        case 'TERMS_AND_CONDITIONS':
          content = `${projectName.toUpperCase()} - TERMS AND CONDITIONS\n\nTérminos y condiciones de uso para ${projectName}.`;
          break;
      }
      
      fs.writeFileSync(txtFile, content, 'utf-8');
      console.log(`${COLORS.green}✅ Creado: txt/${doc}.txt${COLORS.reset}`);
    }
    
    // Crear MD si no existe
    if (!fs.existsSync(mdFile)) {
      const mdContent = `# ${doc.replace(/_/g, ' ')} - ${projectName.toUpperCase()}

## Información
- **Proyecto**: ${projectName}
- **Tipo**: ${doc}
- **Versión**: 1.0.0
- **Actualización**: ${new Date().toISOString().split('T')[0]}

## Contenido
Para más información, consulta el documento completo en \`txt/${doc}.txt\`.

---

*Documento de ${projectName}*`;
      
      fs.writeFileSync(mdFile, mdContent, 'utf-8');
      console.log(`${COLORS.green}✅ Creado: md/${doc}.md${COLORS.reset}`);
    }
  });
  
  // Crear to_do_list para IA
  const iaTodoPath = path.join(iaPath, 'to_do_list.md');
  if (!fs.existsSync(iaTodoPath)) {
    const todoContent = `# TO DO LIST - ${projectName.toUpperCase()}

## Tareas pendientes por formato de entrega

### Website
- [ ] Actualizar documentación
- [ ] Sincronizar contenido
- [ ] Verificar enlaces

### Build Tasks
- [ ] Configurar variables de entorno
- [ ] Verificar dependencias
- [ ] Probar builds

### Documentación
- [ ] Actualizar README
- [ ] Sincronizar formatos
- [ ] Verificar consistencia

---

*Actualizado: ${new Date().toISOString().split('T')[0]}*`;
    
    fs.writeFileSync(iaTodoPath, todoContent, 'utf-8');
    console.log(`${COLORS.green}✅ Creado: ia_docs/to_do_list.md${COLORS.reset}`);
  }
  
  return true;
}

function findFiles(dir, searchTerm) {
  const results = [];
  
  function search(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        search(itemPath);
      } else if (stat.isFile()) {
        const lowerItem = item.toLowerCase();
        const lowerSearch = searchTerm.toLowerCase();
        
        if (lowerItem.includes(lowerSearch) && 
            (item.endsWith('.tsx') || item.endsWith('.ts') || 
             item.endsWith('.jsx') || item.endsWith('.js') ||
             item.endsWith('.md'))) {
          results.push(path.relative(dir, itemPath));
        }
      }
    });
  }
  
  search(dir);
  return results;
}

function main() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║  LIMPIEZA Y UNIFICACIÓN DE DOCUMENTACIÓN        ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  // Proyectos principales
  const projects = [
    { name: 'ciszubot', path: path.join(APPS_DIR, 'ciszubot') },
    { name: 'ciszukoantony', path: path.join(APPS_DIR, 'ciszukoantony') },
    { name: 'muzicmania', path: path.join(APPS_DIR, 'muzicmania') },
    { name: 'website', path: path.join(APPS_DIR, 'website') }
  ];
  
  console.log(`${COLORS.cyan}📋 Proyectos a procesar: ${projects.length}${COLORS.reset}`);
  
  let totalCleaned = 0;
  let totalSynced = 0;
  
  // 1. Limpiar public/docs duplicados
  projects.forEach(project => {
    const cleaned = cleanPublicDocs(project.path, project.name);
    totalCleaned += cleaned;
  });
  
  // 2. Verificar estructura en raíz
  projects.forEach(project => {
    const hasStructure = verifyRootDocsStructure(project.path, project.name);
    if (hasStructure) {
      totalSynced++;
    }
  });
  
  // 3. Sincronizar documentación
  projects.forEach(project => {
    const synced = syncProjectDocumentation(project.path, project.name);
    if (synced) {
      console.log(`${COLORS.green}✅ ${project.name} sincronizado${COLORS.reset}`);
    }
  });
  
  // 4. Procesar ciszugamens (está en raíz, no en apps)
  const ciszugamensPath = path.join(ROOT_DIR, 'ciszugamens');
  if (fs.existsSync(ciszugamensPath)) {
    console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
    console.log(`${COLORS.cyan}🎮 PROCESANDO CISZUGAMENS${COLORS.reset}`);
    console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
    
    // Limpiar public/docs si existe
    const ciszugamensWebsite = path.join(ciszugamensPath, 'website');
    if (fs.existsSync(ciszugamensWebsite)) {
      cleanPublicDocs(ciszugamensPath, 'ciszugamens');
    }
    
    // Sincronizar documentación
    syncProjectDocumentation(ciszugamensPath, 'ciszugamens');
    
    // Verificar estructura
    verifyRootDocsStructure(ciszugamensPath, 'ciszugamens');
  }
  
  // Resumen final
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║               RESUMEN FINAL                      ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  console.log(`${COLORS.green}🎯 ORGANIZACIÓN COMPLETADA${COLORS.reset}`);
  console.log(`${COLORS.cyan}📊 Resultados:${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Carpetas public/docs limpiadas: ${totalCleaned}${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Proyectos con docs en raíz: ${totalSynced}/${projects.length}${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • Documentación básica creada/sincronizada${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • to_do_list.md creado para IA en cada proyecto${COLORS.reset}`);
  
  console.log(`\n${COLORS.cyan}📁 ESTRUCTURA FINAL UNIFICADA:${COLORS.reset}`);
  console.log(`${COLORS.yellow}  [proyecto]/${COLORS.reset}`);
  console.log(`${COLORS.yellow}  ├── docs/                    # Documentación raíz${COLORS.reset}`);
  console.log(`${COLors.yellow}  │   ├── txt/                # Documentos base${COLORS.reset}`);
  console.log(`${COLORS.yellow}  │   ├── md/                 # Markdown${COLORS.reset}`);
  console.log(`${COLORS.yellow}  │   ├── ia_docs/            # Para IAs (to_do_list, etc.)${COLORS.reset}`);
  console.log(`${COLORS.yellow}  │   ├── docx/               # Word (opcional)${COLORS.reset}`);
  console.log(`${COLORS.yellow}  │   ├── pdf/                # PDF (opcional)${COLORS.reset}`);
  console.log(`${COLORS.yellow}  │   └── [carpetas especiales]${COLORS.reset}`);
  console.log(`${COLORS.yellow}  ├── website/                # Sitio web (si aplica)${COLORS.reset}`);
  console.log(`${COLORS.yellow}  └── [otros directorios]${COLORS.reset}`);
  
  console.log(`\n${COLORS.cyan}🎯 DOCUMENTOS BÁSICOS EN CADA PROYECTO:${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • ACTA.txt/.md              # Acta constitutiva${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • ABOUT.txt/.md             # Información del proyecto${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • CONTACT.txt/.md           # Información de contacto${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • HELP.txt/.md              # Guía de ayuda${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • TERMS_AND_CONDITIONS.txt/.md # Términos y condiciones${COLORS.reset}`);
  console.log(`${COLORS.yellow}  • ia_docs/to_do_list.md     # Tareas pendientes por build${COLORS.reset}`);
  
  console.log(`\n${COLORS.green}✅ Documentación unificada y organizada en raíz de cada proyecto${COLORS.reset}`);
}

// Ejecutar
try {
  main();
} catch (error) {
  console.error(`${COLORS.red}❌ Error: ${error.message}${COLORS.reset}`);
  process.exit(1);
}