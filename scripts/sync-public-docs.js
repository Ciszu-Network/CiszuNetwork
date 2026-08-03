/// <reference types="script" />
// Syncc docs/ → public/docs/ para cada website
// Uso: node scripts/sync-public-docs.js

const fs = require('fs');
const path = require('path');

const ROOT = 'E:\\Ciszu Network';

const targets = [
  { src: 'projects/ciszubot/docs',       dest: 'projects/ciszubot/website/public/docs' },
  { src: 'projects/ciszukoantony/docs',  dest: 'projects/ciszukoantony/website/public/docs' },
  { src: 'projects/ciszu/docs',           dest: 'projects/ciszu/website/public/docs' },
  { src: 'projects/muzicmania/docs',     dest: 'projects/muzicmania/website/public/docs' },
  // Launcher (desktop) version — has no public/ but we can put docs alongside
  { src: 'projects/muzicmania/docs',     dest: 'projects/muzicmania/launcher/public/docs' },
  // Mobile version — placeholder
  { src: 'projects/muzicmania/docs',     dest: 'projects/muzicmania/mobile/public/docs' },
];

const FORMATS = ['txt', 'md', 'docx', 'pdf'];

function sync(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) { console.log(`  SKIP: source ${srcDir} no existe`); return; }
  
  // Create dest subdirs for each format
  for (const fmt of FORMATS) {
    const srcFmt = path.join(srcDir, fmt);
    const dstFmt = path.join(destDir, fmt);
    if (!fs.existsSync(srcFmt)) { console.log(`  SKIP: ${fmt}/ no existe en source`); continue; }
    fs.mkdirSync(dstFmt, { recursive: true });
    
    const files = fs.readdirSync(srcFmt).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ext === '.' + fmt || (fmt === 'md' && ext === '.md');
    });
    
    for (const file of files) {
      const srcFile = path.join(srcFmt, file);
      const dstFile = path.join(dstFmt, file);
      fs.copyFileSync(srcFile, dstFile);
    }
    console.log(`  OK ${fmt}/ (${files.length} files)`);
  }
}

for (const t of targets) {
  const srcPath = path.join(ROOT, t.src);
  const dstPath = path.join(ROOT, t.dest);
  console.log(`\n${t.src} → ${t.dest}`);
  sync(srcPath, dstPath);
}

console.log('\nDone');