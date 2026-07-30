#!/usr/bin/env node

/**
 * Script específico para organizar ciszugamens
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const CISZUGAMENS_DIR = path.join(ROOT_DIR, 'ciszugamens');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function organizeCiszugamens() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║        ORGANIZANDO CISZUGAMENS                  ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  const oldDocsPath = path.join(CISZUGAMENS_DIR, 'documents');
  const newDocsPath = path.join(CISZUGAMENS_DIR, 'docs');
  
  if (!fs.existsSync(oldDocsPath)) {
    console.log(`${COLORS.red}❌ No existe documents/ en ciszugamens${COLORS.reset}`);
    return false;
  }
  
  console.log(`${COLORS.yellow}📁 Migrando documents/ → docs/${COLORS.reset}`);
  
  // Crear docs si no existe
  if (!fs.existsSync(newDocsPath)) {
    fs.mkdirSync(newDocsPath, { recursive: true });
  }
  
  // Mover subdirectorios estándar
  const standardDirs = ['txt', 'docx', 'md', 'pdf', 'ia_docs', 'xlsx'];
  
  standardDirs.forEach(dir => {
    const sourceDir = path.join(oldDocsPath, dir);
    const destDir = path.join(newDocsPath, dir);
    
    if (fs.existsSync(sourceDir)) {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Mover archivos
      const files = fs.readdirSync(sourceDir);
      let movedCount = 0;
      
      files.forEach(file => {
        const sourceFile = path.join(sourceDir, file);
        const destFile = path.join(destDir, file);
        
        if (fs.statSync(sourceFile).isFile()) {
          fs.renameSync(sourceFile, destFile);
          movedCount++;
        }
      });
      
      console.log(`${COLORS.green}✅ ${dir}/: ${movedCount} archivos movidos${COLORS.reset}`);
    }
  });
  
  // Mover backups como carpeta especial
  const backupsSource = path.join(oldDocsPath, 'backups');
  const backupsDest = path.join(newDocsPath, 'backups');
  
  if (fs.existsSync(backupsSource)) {
    if (!fs.existsSync(backupsDest)) {
      fs.mkdirSync(backupsDest, { recursive: true });
    }
    
    // Mover todo el contenido
    const items = fs.readdirSync(backupsSource);
    items.forEach(item => {
      const sourceItem = path.join(backupsSource, item);
      const destItem = path.join(backupsDest, item);
      
      fs.renameSync(sourceItem, destItem);
    });
    
    console.log(`${COLORS.green}✅ backups/ movida como carpeta especial${COLORS.reset}`);
  }
  
  // Eliminar documents/ vacío
  fs.rmdirSync(oldDocsPath);
  console.log(`${COLORS.green}✅ Carpeta documents/ eliminada${COLORS.reset}`);
  
  // Ahora verificar y crear versiones faltantes
  console.log(`\n${COLORS.cyan}🔍 VERIFICANDO VERSIONES FALTANTES${COLORS.reset}`);
  
  const txtPath = path.join(newDocsPath, 'txt');
  const docxPath = path.join(newDocsPath, 'docx');
  const mdPath = path.join(newDocsPath, 'md');
  const pdfPath = path.join(newDocsPath, 'pdf');
  
  // Buscar MOD_GUIDELINES
  const hasModGuidelinesDocx = fs.existsSync(path.join(docxPath, 'MOD_GUIDELINES.docx'));
  const hasModGuidelinesPdf = fs.existsSync(path.join(pdfPath, 'MOD_GUIDELINES.pdf'));
  const hasModGuidelinesTxt = fs.existsSync(path.join(txtPath, 'MOD_GUIDELINES.txt'));
  const hasModGuidelinesMd = fs.existsSync(path.join(mdPath, 'MOD_GUIDELINES.md'));
  
  // Buscar RULES
  const hasRulesDocx = fs.existsSync(path.join(docxPath, 'RULES.docx'));
  const hasRulesPdf = fs.existsSync(path.join(pdfPath, 'RULES.pdf'));
  const hasRulesTxt = fs.existsSync(path.join(txtPath, 'RULES.txt'));
  const hasRulesMd = fs.existsSync(path.join(mdPath, 'RULES.md'));
  
  // Crear MOD_GUIDELINES.txt si no existe
  if ((hasModGuidelinesDocx || hasModGuidelinesPdf) && !hasModGuidelinesTxt) {
    const txtContent = `CISZUGAMENS - MOD_GUIDELINES

[ESPAÑOL]
Última actualización: ${new Date().toISOString().split('T')[0]}

DIRECTRICES DE MODERACIÓN PARA CISZUGAMENS

1. RESPETO MUTUO
Todos los miembros deben tratarse con respeto, independientemente de sus opiniones.

2. CONTENIDO APROPIADO
No se permite contenido ofensivo, discriminatorio o inapropiado.

3. SPAM Y PUBLICIDAD
El spam y la publicidad no solicitada están prohibidos.

4. CONFIDENCIALIDAD
Respetar la privacidad y confidencialidad de otros miembros.

5. INCUMPLIMIENTO
El incumplimiento de estas directrices puede resultar en advertencias o expulsión.

----------------------------------------------------------------

[ENGLISH]
Last updated: ${new Date().toISOString().split('T')[0]}

MODERATION GUIDELINES FOR CISZUGAMENS

1. MUTUAL RESPECT
All members must treat each other with respect, regardless of opinions.

2. APPROPRIATE CONTENT
Offensive, discriminatory, or inappropriate content is not allowed.

3. SPAM AND ADVERTISING
Spam and unsolicited advertising are prohibited.

4. CONFIDENTIALITY
Respect the privacy and confidentiality of other members.

5. NON-COMPLIANCE
Failure to comply may result in warnings or expulsion.`;
    
    fs.writeFileSync(path.join(txtPath, 'MOD_GUIDELINES.txt'), txtContent, 'utf-8');
    console.log(`${COLORS.green}✅ Creado: txt/MOD_GUIDELINES.txt${COLORS.reset}`);
  }
  
  // Crear MOD_GUIDELINES.md si no existe
  if ((hasModGuidelinesDocx || hasModGuidelinesPdf) && !hasModGuidelinesMd) {
    const mdContent = `# MOD_GUIDELINES

## Directrices de Moderación - CISZUGAMENS

### Información
- **Proyecto**: CISZUGAMENS
- **Tipo**: MOD_GUIDELINES
- **Versión**: 1.0.0
- **Actualización**: ${new Date().toISOString().split('T')[0]}

### Contenido

#### 1. RESPETO MUTUO
Todos los miembros deben tratarse con respeto, independientemente de sus opiniones.

#### 2. CONTENIDO APROPIADO
No se permite contenido ofensivo, discriminatorio o inapropiado.

#### 3. SPAM Y PUBLICIDAD
El spam y la publicidad no solicitada están prohibidos.

#### 4. CONFIDENCIALIDAD
Respetar la privacidad y confidencialidad de otros miembros.

#### 5. INCUMPLIMIENTO
El incumplimiento de estas directrices puede resultar en advertencias o expulsión.

---

*Documento generado automáticamente*`;
    
    fs.writeFileSync(path.join(mdPath, 'MOD_GUIDELINES.md'), mdContent, 'utf-8');
    console.log(`${COLORS.green}✅ Creado: md/MOD_GUIDELINES.md${COLORS.reset}`);
  }
  
  // Crear RULES.txt si no existe
  if ((hasRulesDocx || hasRulesPdf) && !hasRulesTxt) {
    const txtContent = `CISZUGAMENS - RULES

[ESPAÑOL]
Última actualización: ${new Date().toISOString().split('T')[0]}

REGLAS Y NORMATIVAS PARA CISZUGAMENS

1. REGLAS GENERALES
- Respetar a todos los miembros y administradores.
- No compartir contenido ilegal o inapropiado.
- Mantener conversaciones en los canales adecuados.

2. REGLAS DE CONTENIDO
- Contenido original o con atribución adecuada.
- Sin spam, flood o autopromoción excesiva.
- Contenido NSFW solo en canales designados.

3. REGLAS DE CONDUCTA
- Sin acoso, bullying o discriminación.
- Sin spoilers sin advertencia.
- Sin suplantación de identidad.

4. SANCIONES
- Advertencia verbal
- Mute temporal
- Expulsión permanente

----------------------------------------------------------------

[ENGLISH]
Last updated: ${new Date().toISOString().split('T')[0]}

RULES AND REGULATIONS FOR CISZUGAMENS

1. GENERAL RULES
- Respect all members and administrators.
- Do not share illegal or inappropriate content.
- Keep conversations in appropriate channels.

2. CONTENT RULES
- Original content or with proper attribution.
- No spam, flood, or excessive self-promotion.
- NSFW content only in designated channels.

3. CONDUCT RULES
- No harassment, bullying, or discrimination.
- No spoilers without warning.
- No identity impersonation.

4. SANCTIONS
- Verbal warning
- Temporary mute
- Permanent expulsion`;
    
    fs.writeFileSync(path.join(txtPath, 'RULES.txt'), txtContent, 'utf-8');
    console.log(`${COLORS.green}✅ Creado: txt/RULES.txt${COLORS.reset}`);
  }
  
  // Crear RULES.md si no existe
  if ((hasRulesDocx || hasRulesPdf) && !hasRulesMd) {
    const mdContent = `# RULES

## Reglas y Normativas - CISZUGAMENS

### Información
- **Proyecto**: CISZUGAMENS
- **Tipo**: RULES
- **Versión**: 1.0.0
- **Actualización**: ${new Date().toISOString().split('T')[0]}

### Contenido

#### 1. REGLAS GENERALES
- Respetar a todos los miembros y administradores.
- No compartir contenido ilegal o inapropiado.
- Mantener conversaciones en los canales adecuados.

#### 2. REGLAS DE CONTENIDO
- Contenido original o con atribución adecuada.
- Sin spam, flood o autopromoción excesiva.
- Contenido NSFW solo en canales designados.

#### 3. REGLAS DE CONDUCTA
- Sin acoso, bullying o discriminación.
- Sin spoilers sin advertencia.
- Sin suplantación de identidad.

#### 4. SANCIONES
- Advertencia verbal
- Mute temporal
- Expulsión permanente

---

*Documento generado automáticamente*`;
    
    fs.writeFileSync(path.join(mdPath, 'RULES.md'), mdContent, 'utf-8');
    console.log(`${COLORS.green}✅ Creado: md/RULES.md${COLORS.reset}`);
  }
  
  // Crear ACTA para ciszugamens
  const actaTxtPath = path.join(txtPath, 'ACTA.txt');
  const actaMdPath = path.join(mdPath, 'ACTA.md');
  
  if (!fs.existsSync(actaTxtPath)) {
    const sharedActaPath = path.join(ROOT_DIR, 'shared', 'documentation', 'ACTA.txt');
    
    if (fs.existsSync(sharedActaPath)) {
      const baseActa = fs.readFileSync(sharedActaPath, 'utf-8');
      const ciszugamensActa = baseActa
        .replace(/ciszunetwork/g, 'ciszugamens')
        .replace(/CISZU NETWORK/g, 'CISZUGAMENS');
      
      fs.writeFileSync(actaTxtPath, ciszugamensActa, 'utf-8');
      
      // Crear MD también
      const mdContent = `# ACTA CONSTITUTIVA - CISZUGAMENS

## Información del Documento
- **Proyecto**: CISZUGAMENS
- **Tipo**: ACTA
- **Versión**: 1.0.0
- **Actualización**: ${new Date().toISOString().split('T')[0]}

## Contenido
\`\`\`
${ciszugamensActa}
\`\`\`

---

*Documento generado automáticamente*`;
      
      fs.writeFileSync(actaMdPath, mdContent, 'utf-8');
      
      console.log(`${COLORS.green}✅ Creado: ACTA para CISZUGAMENS${COLORS.reset}`);
    }
  }
  
  // Renombrar archivos a mayúsculas si es necesario
  const filesToRename = [
    { old: 'mod_guidelines', new: 'MOD_GUIDELINES' },
    { old: 'rules', new: 'RULES' },
    { old: 'acta_constitutiva', new: 'ACTA' }
  ];
  
  filesToRename.forEach(({ old, new: newName }) => {
    [txtPath, docxPath, mdPath, pdfPath].forEach(dir => {
      const oldPath = path.join(dir, `${old}.${path.extname(old) ? '' : path.basename(dir).slice(0, 3)}`);
      const newPath = path.join(dir, `${newName}.${path.extname(newName) ? '' : path.basename(dir).slice(0, 3)}`);
      
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`${COLORS.green}✅ Renombrado: ${path.basename(dir)}/${old} → ${newName}${COLORS.reset}`);
      }
    });
  });
  
  // Eliminar archivos antiguos de shigamens
  console.log(`\n${COLORS.cyan}🗑️  ELIMINANDO ARCHIVOS ANTIGUOS DE SHIGAMENS${COLORS.reset}`);
  
  const searchTerms = ['shigamens', 'Shigamens'];
  let removedCount = 0;
  
  [txtPath, docxPath, mdPath, pdfPath].forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const lowerFile = file.toLowerCase();
        if (searchTerms.some(term => lowerFile.includes(term.toLowerCase()))) {
          const filePath = path.join(dir, file);
          fs.unlinkSync(filePath);
          console.log(`${COLORS.green}✅ Eliminado (antiguo): ${path.basename(dir)}/${file}${COLORS.reset}`);
          removedCount++;
        }
      });
    }
  });
  
  console.log(`${COLORS.yellow}📊 Archivos antiguos eliminados: ${removedCount}${COLORS.reset}`);
  
  // Crear README para ciszugamens
  const readmePath = path.join(CISZUGAMENS_DIR, 'README.md');
  const readmeContent = `# CISZUGAMENS

## Descripción
Ciszugamens es una comunidad de gaming y contenido social de Ciszu Network.

## Estructura
\`\`\`
ciszugamens/
├── 📁 channels/           # Canales de la comunidad
├── 📁 content/           # Contenido multimedia
├── 📁 docs/              # Documentación organizada
│   ├── txt/             # Documentos base
│   ├── docx/            # Versiones Word
│   ├── md/              # Markdown
│   ├── pdf/             # PDF
│   ├── ia_docs/         # Para IAs
│   ├── xlsx/            # Hojas de cálculo
│   └── backups/         # Copias de seguridad
└── README.md            # Este archivo
\`\`\`

## Documentación
La documentación sigue la estructura estándar de Ciszu Network:
- **ACTA**: Acta constitutiva del proyecto
- **RULES**: Reglas y normativas de la comunidad
- **MOD_GUIDELINES**: Directrices de moderación

## Uso
Para más información, consulta los documentos en \`docs/txt/\`.

---

*Proyecto mantenido por Ciszu Network*`;
  
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, readmeContent, 'utf-8');
    console.log(`${COLORS.green}✅ README creado para CISZUGAMENS${COLORS.reset}`);
  }
  
  console.log(`\n${COLORS.green}🎉 CISZUGAMENS ORGANIZADO CORRECTAMENTE${COLORS.reset}`);
  console.log(`${COLORS.blue}📍 Estructura final: ciszugamens/docs/${COLORS.reset}`);
  
  return true;
}

// Ejecutar organización
try {
  organizeCiszugamens();
} catch (error) {
  console.error(`${COLORS.red}❌ Error organizando ciszugamens: ${error.message}${COLORS.reset}`);
  process.exit(1);
}