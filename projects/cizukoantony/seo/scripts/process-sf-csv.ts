#!/usr/bin/env node
/**
 * process-sf-csv.ts
 * Procesa exports CSV de Screaming Frog y genera reportes priorizados
 * Uso: npx tsx scripts/seo/process-sf-csv.ts <project> <crawl-date>
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface SFRow {
  Address: string;
  'Title 1'?: string;
  'Title 1 Length'?: string;
  'Meta Description 1'?: string;
  'Meta Description 1 Length'?: string;
  'H1-1'?: string;
  'H1-1 Length'?: string;
  'Status Code'?: string;
  'Indexability'?: string;
  'Canonical Link Element 1'?: string;
  'Alt Text'?: string;
  'File Size'?: string;
  'Redirect URL'?: string;
  'Crawl Depth'?: string;
  'Level'?: string;
  'Content Type'?: string;
  [key: string]: string | undefined;
}

interface Issue {
  type: 'title' | 'meta' | 'h1' | 'image' | 'response' | 'canonical' | 'redirect' | 'directive';
  severity: 'error' | 'warning' | 'info';
  url: string;
  message: string;
  currentValue?: string;
  recommendation: string;
}

const thresholds = JSON.parse(fs.readFileSync('projects/ciszu/seo/config/thresholds.json', 'utf-8'));

function analyzeTitles(rows: SFRow[]): Issue[] {
  const issues: Issue[] = [];
  const seen = new Map<string, string[]>();

  for (const row of rows) {
    const url = row.Address;
    const title = row['Title 1']?.trim() || '';
    const length = parseInt(row['Title 1 Length'] || '0', 10);

    if (!title) {
      issues.push({
        type: 'title',
        severity: 'error',
        url,
        message: 'Título vacío',
        recommendation: 'Agregar title único y descriptivo (< 60 chars)'
      });
    } else if (length > 60) {
      issues.push({
        type: 'title',
        severity: 'warning',
        url,
        message: `Título muy largo (${length} chars)`,
        currentValue: title,
        recommendation: 'Recortar a < 60 chars, keyword principal al inicio'
      });
    } else if (length < 30) {
      issues.push({
        type: 'title',
        severity: 'info',
        url,
        message: `Título muy corto (${length} chars)`,
        currentValue: title,
        recommendation: 'Expandir a 30-60 chars con keyword secundaria'
      });
    }

    // Duplicados
    if (title) {
      if (!seen.has(title)) seen.set(title, []);
      seen.get(title)!.push(url);
    }
  }

  for (const [title, urls] of seen) {
    if (urls.length > 1) {
      for (const url of urls) {
        issues.push({
          type: 'title',
          severity: 'error',
          url,
          message: `Título duplicado en ${urls.length} páginas`,
          currentValue: title,
          recommendation: 'Diferenciar titles por página'
        });
      }
    }
  }

  return issues;
}

function analyzeMeta(rows: SFRow[]): Issue[] {
  const issues: Issue[] = [];
  const seen = new Map<string, string[]>();

  for (const row of rows) {
    const url = row.Address;
    const meta = row['Meta Description 1']?.trim() || '';
    const length = parseInt(row['Meta Description 1 Length'] || '0', 10);

    if (!meta) {
      issues.push({
        type: 'meta',
        severity: 'error',
        url,
        message: 'Meta description vacía',
        recommendation: 'Agregar meta description 150-160 chars con CTA'
      });
    } else if (length > 160) {
      issues.push({
        type: 'meta',
        severity: 'warning',
        url,
        message: `Meta muy larga (${length} chars)`,
        currentValue: meta,
        recommendation: 'Recortar a < 160 chars'
      });
    } else if (length < 120) {
      issues.push({
        type: 'meta',
        severity: 'info',
        url,
        message: `Meta muy corta (${length} chars)`,
        currentValue: meta,
        recommendation: 'Expandir a 120-160 chars'
      });
    }

    if (meta) {
      if (!seen.has(meta)) seen.set(meta, []);
      seen.get(meta)!.push(url);
    }
  }

  for (const [meta, urls] of seen) {
    if (urls.length > 1) {
      for (const url of urls) {
        issues.push({
          type: 'meta',
          severity: 'warning',
          url,
          message: `Meta duplicada en ${urls.length} páginas`,
          currentValue: meta,
          recommendation: 'Diferenciar meta descriptions'
        });
      }
    }
  }

  return issues;
}

function analyzeH1(rows: SFRow[]): Issue[] {
  const issues: Issue[] = [];
  const h1Count = new Map<string, number>();

  for (const row of rows) {
    const url = row.Address;
    const h1 = row['H1-1']?.trim() || '';
    const count = (parseInt(row['H1-1 Length'] || '0', 10) > 0) ? 1 : 0;

    // Contar H1s por URL (aproximado)
    h1Count.set(url, (h1Count.get(url) || 0) + count);

    if (!h1) {
      issues.push({
        type: 'h1',
        severity: 'error',
        url,
        message: 'H1 vacío o ausente',
        recommendation: 'Agregar H1 único coincidente con title'
      });
    }
  }

  // Múltiples H1 por página (aproximado via crawl depth)
  for (const [url, count] of h1Count) {
    if (count > 1) {
      issues.push({
        type: 'h1',
        severity: 'warning',
        url,
        message: `Múltiples H1 detectados (${count})`,
        recommendation: 'Un solo H1 por página, usar H2-H6 para subsecciones'
      });
    }
  }

  return issues;
}

function analyzeImages(rows: SFRow[]): Issue[] {
  const issues: Issue[] = [];

  for (const row of rows) {
    // Screaming Frog exporta imágenes en filas separadas en "Images" export
    // Aquí procesamos desde el export general si tiene datos de imagen
    const alt = row['Alt Text']?.trim() || '';
    const size = parseInt(row['File Size'] || '0', 10);
    const url = row.Address;

    if (row['Content Type']?.startsWith('image/') || url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      if (!alt) {
        issues.push({
          type: 'image',
          severity: 'warning',
          url,
          message: 'Imagen sin alt text',
          recommendation: 'Agregar alt descriptivo con keyword relevante'
        });
      }
      if (size > 100 * 1024) {
        issues.push({
          type: 'image',
          severity: 'info',
          url,
          message: `Imagen pesada (${Math.round(size / 1024)} KB)`,
          recommendation: 'Optimizar a WebP/AVIF, comprimir < 100KB'
        });
      }
    }
  }

  return issues;
}

function analyzeResponses(rows: SFRow[]): Issue[] {
  const issues: Issue[] = [];

  for (const row of rows) {
    const url = row.Address;
    const status = parseInt(row['Status Code'] || '200', 10);
    const indexability = row['Indexability'] || '';
    const canonical = row['Canonical Link Element 1']?.trim() || '';
    const redirectUrl = row['Redirect URL']?.trim() || '';

    if (status >= 400 && status < 500) {
      issues.push({
        type: 'response',
        severity: 'error',
        url,
        message: `Error ${status} ${status === 404 ? '(Not Found)' : ''}`,
        recommendation: status === 404 ? 'Fix 404: restore page o redirect 301' : 'Investigar error servidor'
      });
    } else if (status >= 500) {
      issues.push({
        type: 'response',
        severity: 'error',
        url,
        message: `Error servidor ${status}`,
        recommendation: 'Revisar logs de Vercel/servidor'
      });
    } else if (status >= 300 && status < 400) {
      issues.push({
        type: 'redirect',
        severity: 'warning',
        url,
        message: `Redirect ${status} → ${redirectUrl}`,
        recommendation: 'Verificar cadena de redirects (máx 1 hop)'
      });
    }

    if (indexability === 'Non-Indexable') {
      issues.push({
        type: 'directive',
        severity: 'warning',
        url,
        message: 'Página no indexable',
        currentValue: indexability,
        recommendation: 'Verificar noindex accidental, robots.txt, canonical'
      });
    }

    if (canonical && canonical !== url) {
      issues.push({
        type: 'canonical',
        severity: 'warning',
        url,
        message: `Canonical apunta a otra URL: ${canonical}`,
        currentValue: canonical,
        recommendation: 'Verificar canonical correcto (self-referencing ideal)'
      });
    }
  }

  return issues;
}

function processSite(siteName: string, crawlDate: string): void {
  const basePath = `projects/${siteName}/seo/audits/screaming-frog/crawl-${crawlDate}`;
  const exportsPath = `${basePath}/exports`;

  if (!fs.existsSync(exportsPath)) {
    console.log(`❌ No existe ${exportsPath}. Ejecuta crawl en SF y exporta CSVs a esa carpeta.`);
    return;
  }

  const files = fs.readdirSync(exportsPath).filter(f => f.endsWith('.csv'));
  if (files.length === 0) {
    console.log(`❌ No hay CSVs en ${exportsPath}`);
    return;
  }

  console.log(`\n📊 Procesando ${siteName} - ${files.length} archivos CSV`);

  const allIssues: Issue[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(exportsPath, file), 'utf-8');
    const rows = parse(content, { columns: true, skip_empty_lines: true }) as SFRow[];

    let issues: Issue[] = [];

    if (file.includes('Title') || file.includes('All')) {
      issues = issues.concat(analyzeTitles(rows));
    }
    if (file.includes('Meta') || file.includes('All')) {
      issues = issues.concat(analyzeMeta(rows));
    }
    if (file.includes('H1') || file.includes('All')) {
      issues = issues.concat(analyzeH1(rows));
    }
    if (file.includes('Image') || file.includes('All')) {
      issues = issues.concat(analyzeImages(rows));
    }
    if (file.includes('Response') || file.includes('Redirect') || file.includes('Canonical') || file.includes('Directives') || file.includes('All')) {
      issues = issues.concat(analyzeResponses(rows));
    }

    allIssues.push(...issues);
    console.log(`  ${file}: ${issues.length} issues`);
  }

  // Ordenar por severidad
  const severityOrder = { error: 0, warning: 1, info: 2 };
  allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Generar reporte markdown
  const reportPath = `projects/${siteName}/seo/reports/sf-analysis-${crawlDate}.md`;
  const errorCount = allIssues.filter(i => i.severity === 'error').length;
  const warningCount = allIssues.filter(i => i.severity === 'warning').length;
  const infoCount = allIssues.filter(i => i.severity === 'info').length;

  const md = `# Screaming Frog Analysis - ${siteName} - ${crawlDate}

**Resumen:** ${errorCount} errores, ${warningCount} advertencias, ${infoCount} info

## 🔴 Errores (${errorCount})
${allIssues.filter(i => i.severity === 'error').map(i => `- **${i.url}** [${i.type}]: ${i.message} → ${i.recommendation}`).join('\n') || 'Ninguno'}

## 🟡 Advertencias (${warningCount})
${allIssues.filter(i => i.severity === 'warning').map(i => `- **${i.url}** [${i.type}]: ${i.message} → ${i.recommendation}`).join('\n') || 'Ninguna'}

## 🔵 Info (${infoCount})
${allIssues.filter(i => i.severity === 'info').map(i => `- **${i.url}** [${i.type}]: ${i.message} → ${i.recommendation}`).join('\n') || 'Ninguna'}

---

*Generado: ${new Date().toISOString()}*
`;

  fs.writeFileSync(reportPath, md);
  console.log(`\n✅ Reporte generado: ${reportPath}`);
  console.log(`   Errores: ${errorCount} | Warnings: ${warningCount} | Info: ${infoCount}`);
}

// CLI
const [,, site, crawlDate] = process.argv;
if (!site || !crawlDate) {
  console.log('Uso: npx tsx scripts/seo/process-sf-csv.ts <site> <crawl-date>');
  console.log('Ejemplo: npx tsx scripts/seo/process-sf-csv.ts ciszu 2026-08-22');
  process.exit(1);
}

const sites = ['ciszu', 'cizukoantony', 'muzicmania', 'ciszubot'];
if (!sites.includes(site)) {
  console.log(`Sitio inválido. Opciones: ${sites.join(', ')}`);
  process.exit(1);
}

processSite(site, crawlDate);