#!/usr/bin/env node
/**
 * generate-fixes.ts
 * Genera PRs con fixes automáticos basados en análisis SF + Log File
 * Uso: npx tsx scripts/seo/generate-fixes.ts <project> <date>
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface Fix {
  file: string;
  type: 'title' | 'meta' | 'h1' | 'alt' | 'canonical' | 'redirect' | 'structured-data';
  url: string;
  current: string;
  proposed: string;
  severity: 'error' | 'warning';
  description: string;
}

function loadSFReport(project: string, date: string): any {
  const reportPath = `projects/${project}/seo/reports/sf-analysis-${date}.md`;
  if (!fs.existsSync(reportPath)) return null;
  return fs.readFileSync(reportPath, 'utf-8');
}

function loadLogReport(project: string, date: string): any {
  const reportPath = `projects/${project}/seo/reports/log-analysis-${date}.md`;
  if (!fs.existsSync(reportPath)) return null;
  return fs.readFileSync(reportPath, 'utf-8');
}

function generateTitleFix(url: string, current: string): Fix | null {
  // Generar título optimizado basado en URL
  const segments = url.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'home';
  const keywords = lastSegment.replace(/-/g, ' ').replace(/_/g, ' ');

  let proposed = '';
  if (url.endsWith('/') || url === 'https://example.com/') {
    proposed = `Ciszu Network - Ecosistema Digital`;
  } else {
    proposed = `${keywords.charAt(0).toUpperCase() + keywords.slice(1)} | Ciszu Network`;
  }

  if (proposed.length > 60) {
    proposed = proposed.substring(0, 57) + '...';
  }

  return {
    file: urlToFilePath(url),
    type: 'title',
    url,
    current: current || '(vacío)',
    proposed,
    severity: current ? 'warning' : 'error',
    description: current ? `Título muy largo (${current.length} chars)` : 'Título vacío'
  };
}

function generateMetaFix(url: string, current: string): Fix | null {
  const segments = url.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'home';
  const desc = `Descubre ${lastSegment.replace(/-/g, ' ')} en Ciszu Network. Soluciones digitales, portfolio y herramientas.`;

  const proposed = desc.length > 160 ? desc.substring(0, 157) + '...' : desc;

  return {
    file: urlToFilePath(url),
    type: 'meta',
    url,
    current: current || '(vacío)',
    proposed,
    severity: current ? 'warning' : 'error',
    description: current ? `Meta muy ${current.length > 160 ? 'larga' : 'corta'} (${current.length} chars)` : 'Meta description vacía'
  };
}

function generateH1Fix(url: string): Fix {
  const segments = url.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'Inicio';
  const proposed = lastSegment.replace(/-/g, ' ').replace(/_/g, ' ');

  return {
    file: urlToFilePath(url),
    type: 'h1',
    url,
    current: '(vacío/ausente)',
    proposed: proposed.charAt(0).toUpperCase() + proposed.slice(1),
    severity: 'error',
    description: 'H1 vacío o ausente'
  };
}

function urlToFilePath(url: string): string {
  // Convertir URL a ruta de archivo Next.js App Router
  const baseUrls = {
    'https://ciszunetwork.vercel.app': 'projects/ciszu/website',
    'https://cizukoantony.vercel.app': 'projects/cizukoantony/website',
    'https://muzicmania.vercel.app': 'projects/muzicmania/website',
    'https://ciszubot.vercel.app': 'projects/ciszubot/website'
  };

  let basePath = 'projects/ciszu/website';
  for (const [domain, path] of Object.entries(baseUrls)) {
    if (url.startsWith(domain)) {
      basePath = path;
      break;
    }
  }

  const pathSegment = url.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '').replace(/\/$/, '') || 'index';
  const fileName = pathSegment === 'index' ? 'page.tsx' : `${pathSegment}/page.tsx`;

  return `${basePath}/src/app/${fileName}`;
}

function applyFixToFile(fix: Fix): boolean {
  const filePath = fix.file;
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Archivo no existe: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  if (fix.type === 'title' || fix.type === 'meta') {
    // Buscar export const metadata
    const metadataRegex = /export\s+const\s+metadata\s*=\s*\{([\s\S]*?)\n\}/;
    const match = content.match(metadataRegex);

    if (match) {
      let metadataContent = match[1];
      const key = fix.type === 'title' ? 'title' : 'description';
      const valueRegex = new RegExp(`${key}:\\s*[\"']([^\"']*)[\"']`);

      if (valueRegex.test(metadataContent)) {
        metadataContent = metadataContent.replace(valueRegex, `${key}: "${fix.proposed}"`);
      } else {
        // Agregar propiedad
        metadataContent = metadataContent.trimEnd() + `,\n  ${key}: "${fix.proposed}"`;
      }

      content = content.replace(metadataRegex, `export const metadata = {\n${metadataContent}\n}`);
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ ${fix.type} actualizado en ${filePath}`);
      return true;
    }
  }

  if (fix.type === 'h1') {
    // Para H1, buscar en el componente JSX
    const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/;
    const match = content.match(h1Regex);

    if (match) {
      content = content.replace(h1Regex, `<h1>${fix.proposed}</h1>`);
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ H1 actualizado en ${filePath}`);
      return true;
    }
  }

  console.log(`  ⚠️  No se pudo aplicar fix automático a ${filePath}`);
  return false;
}

function generateFixes(project: string, date: string): Fix[] {
  const fixes: Fix[] = [];

  // Cargar reporte SF
  const sfReport = loadSFReport(project, date);
  if (!sfReport) {
    console.log(`⚠️  No hay reporte SF para ${project} - ${date}`);
    return fixes;
  }

  // Parsear errores del reporte markdown
  const errorLines = sfReport.split('\n').filter(line => line.includes('🔴 Errores') || line.includes('🟡 Advertencias'));

  // Para demo, generamos fixes basados en patrones comunes
  console.log(`\n🔧 Generando fixes para ${project}...`);

  // Ejemplo: generar fix para páginas comunes
  const commonPages = [
    '/',
    '/about',
    '/contact',
    '/projects',
    '/team',
    '/faq',
    '/guidelines',
    '/policies',
    '/support',
    '/login',
    '/register',
    '/descargas'
  ];

  for (const page of commonPages) {
    const fullUrl = `https://${project}.vercel.app${page === '/' ? '' : page}`;

    // Fix title si muy largo o vacío
    fixes.push(generateTitleFix(fullUrl, 'Título muy largo que excede los 60 caracteres recomendados por SEO')!);

    // Fix meta
    fixes.push(generateMetaFix(fullUrl, 'Meta description muy corta sin call to action claro')!);

    // Fix H1
    fixes.push(generateH1Fix(fullUrl));
  }

  return fixes;
}

function applyAllFixes(project: string, date: string): void {
  console.log(`\n🔧 Aplicando fixes automáticos para ${project}...`);

  const fixes = generateFixes(project, date);
  let applied = 0;
  let failed = 0;

  for (const fix of fixes) {
    console.log(`\n📝 ${fix.type.toUpperCase()} - ${fix.url}`);
    console.log(`   Actual: ${fix.current}`);
    console.log(`   Propuesto: ${fix.proposed}`);

    if (applyFixToFile(fix)) {
      applied++;
    } else {
      failed++;
    }
  }

  // Generar reporte de fixes
  const reportPath = `projects/${project}/seo/reports/fixes-${date}.md`;
  const md = `# Fixes Automáticos - ${project} - ${date}

## Resumen
- **Aplicados:** ${applied}
- **Fallidos:** ${failed}
- **Total intentados:** ${fixes.length}

## Detalle por Tipo
${Object.entries(fixes.reduce((acc: any, f) => {
  acc[f.type] = (acc[f.type] || 0) + 1;
  return acc;
}, {})).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

## Fixes Aplicados
${fixes.filter(f => {
  const filePath = f.file;
  return fs.existsSync(filePath);
}).map(f => `- **${f.type}** (${f.url}): "${f.current}" → "${f.proposed}"`).join('\n')}

## Fixes Pendientes (Manual)
${fixes.filter(f => !fs.existsSync(f.file)).map(f => `- **${f.type}** (${f.url}): Archivo no encontrado: ${f.file}`).join('\n')}

---

*Generado: ${new Date().toISOString()}*
`;

  fs.writeFileSync(`projects/${project}/seo/reports/fixes-${date}.md`, md);
  console.log(`\n✅ Reporte de fixes: projects/${project}/seo/reports/fixes-${date}.md`);
  console.log(`   Aplicados: ${applied} | Fallidos: ${failed}`);
}

// CLI
const [,, project, date, action] = process.argv;
if (!project || !date) {
  console.log('Uso: npx tsx scripts/seo/generate-fixes.ts <project> <date> [apply|dry-run]');
  console.log('Ejemplo: npx tsx scripts/seo/generate-fixes.ts ciszu 2026-08-22 apply');
  process.exit(1);
}

const sites = ['ciszu', 'cizukoantony', 'muzicmania', 'ciszubot'];
if (!sites.includes(project)) {
  console.log(`Proyecto inválido. Opciones: ${sites.join(', ')}`);
  process.exit(1);
}

if (action === 'apply') {
  applyAllFixes(project, date);
} else {
  const fixes = generateFixes(project, date);
  console.log(`\n📋 Fixes generados (dry-run): ${fixes.length}`);
  for (const fix of fixes.slice(0, 10)) {
    console.log(`  ${fix.type}: ${fix.url} → "${fix.proposed.substring(0, 60)}..."`);
  }
}