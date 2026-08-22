#!/usr/bin/env node
/**
 * compare-crawls.ts
 * Compara dos crawls de Screaming Frog y detecta regresiones/progresos
 * Uso: npx tsx scripts/seo/compare-crawls.ts <project> <date-old> <date-new>
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface CrawlData {
  titles: Map<string, string>;
  metas: Map<string, string>;
  h1s: Map<string, string>;
  statuses: Map<string, number>;
  indexability: Map<string, string>;
  canonicals: Map<string, string>;
  redirects: Map<string, string>;
}

function loadCrawlData(project: string, date: string): CrawlData {
  const basePath = `projects/${project}/seo/audits/screaming-frog/crawl-${date}/exports`;
  const data: CrawlData = {
    titles: new Map(),
    metas: new Map(),
    h1s: new Map(),
    statuses: new Map(),
    indexability: new Map(),
    canonicals: new Map(),
    redirects: new Map()
  };

  if (!fs.existsSync(basePath)) return data;

  const files = fs.readdirSync(basePath).filter(f => f.endsWith('.csv'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(basePath, file), 'utf-8');
    const rows = parse(content, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

    for (const row of rows) {
      const url = row.Address;
      if (!url) continue;

      if (file.includes('Title') || file === 'internal_all.csv' || file === 'all.csv') {
        if (row['Title 1']) data.titles.set(url, row['Title 1'].trim());
      }
      if (file.includes('Meta') || file === 'internal_all.csv' || file === 'all.csv') {
        if (row['Meta Description 1']) data.metas.set(url, row['Meta Description 1'].trim());
      }
      if (file.includes('H1') || file === 'internal_all.csv' || file === 'all.csv') {
        if (row['H1-1']) data.h1s.set(url, row['H1-1'].trim());
      }
      if (file.includes('Response') || file.includes('Status') || file === 'internal_all.csv' || file === 'all.csv') {
        if (row['Status Code']) data.statuses.set(url, parseInt(row['Status Code'], 10));
      }
      if (file.includes('Index') || file === 'internal_all.csv' || file === 'all.csv') {
        if (row['Indexability']) data.indexability.set(url, row['Indexability'].trim());
      }
      if (file.includes('Canonical') || file === 'internal_all.csv' || file === 'all.csv') {
        if (row['Canonical Link Element 1']) data.canonicals.set(url, row['Canonical Link Element 1'].trim());
      }
      if (file.includes('Redirect') || file === 'internal_all.csv' || file === 'all.csv') {
        if (row['Redirect URL']) data.redirects.set(url, row['Redirect URL'].trim());
      }
    }
  }

  return data;
}

interface DiffResult {
  newErrors: string[];
  fixedErrors: string[];
  newWarnings: string[];
  fixedWarnings: string[];
  newPages: string[];
  removedPages: string[];
  changedTitles: Array<{ url: string; old: string; new: string }>;
  changedMetas: Array<{ url: string; old: string; new: string }>;
  changedH1s: Array<{ url: string; old: string; new: string }>;
  statusChanges: Array<{ url: string; old: number; new: number }>;
  indexabilityChanges: Array<{ url: string; old: string; new: string }>;
}

function compareCrawls(oldData: CrawlData, newData: CrawlData): DiffResult {
  const diff: DiffResult = {
    newErrors: [],
    fixedErrors: [],
    newWarnings: [],
    fixedWarnings: [],
    newPages: [],
    removedPages: [],
    changedTitles: [],
    changedMetas: [],
    changedH1s: [],
    statusChanges: [],
    indexabilityChanges: []
  };

  // URLs nuevas/eliminadas
  const oldUrls = new Set(oldData.titles.keys());
  const newUrls = new Set(newData.titles.keys());

  for (const url of newUrls) if (!oldUrls.has(url)) diff.newPages.push(url);
  for (const url of oldUrls) if (!newUrls.has(url)) diff.removedPages.push(url);

  // Comparar títulos
  for (const [url, newTitle] of newData.titles) {
    const oldTitle = oldData.titles.get(url);
    if (oldTitle && oldTitle !== newTitle) {
      diff.changedTitles.push({ url, old: oldTitle, new: newTitle });
    }
    if (!oldTitle && newTitle) {
      // Título nuevo en página existente
    }
    if (oldTitle && !newTitle) {
      diff.newErrors.push(`${url}: Título eliminado (era: "${oldTitle}")`);
    }
  }

  // Comparar meta descriptions
  for (const [url, newMeta] of newData.metas) {
    const oldMeta = oldData.metas.get(url);
    if (oldMeta && oldMeta !== newMeta) {
      diff.changedMetas.push({ url, old: oldMeta, new: newMeta });
    }
    if (!oldMeta && newMeta) {
      // Meta nueva
    }
    if (oldMeta && !newMeta) {
      diff.newWarnings.push(`${url}: Meta description eliminada`);
    }
  }

  // Comparar H1s
  for (const [url, newH1] of newData.h1s) {
    const oldH1 = oldData.h1s.get(url);
    if (oldH1 && oldH1 !== newH1) {
      diff.changedH1s.push({ url, old: oldH1, new: newH1 });
    }
    if (!oldH1 && newH1) {
      // H1 nuevo
    }
    if (oldH1 && !newH1) {
      diff.newErrors.push(`${url}: H1 eliminado (era: "${oldH1}")`);
    }
  }

  // Comparar status codes
  for (const [url, newStatus] of newData.statuses) {
    const oldStatus = oldData.statuses.get(url);
    if (oldStatus !== undefined && oldStatus !== newStatus) {
      diff.statusChanges.push({ url, old: oldStatus, new: newStatus });

      // Detectar regresiones graves
      if (oldStatus < 400 && newStatus >= 400) {
        diff.newErrors.push(`${url}: Status ${oldStatus} → ${newStatus} (REGRESIÓN)`);
      } else if (oldStatus >= 400 && newStatus < 400) {
        diff.fixedErrors.push(`${url}: Status ${oldStatus} → ${newStatus} (ARREGLADO)`);
      }
    }
  }

  // Comparar indexabilidad
  for (const [url, newIndex] of newData.indexability) {
    const oldIndex = oldData.indexability.get(url);
    if (oldIndex !== undefined && oldIndex !== newIndex) {
      diff.indexabilityChanges.push({ url, old: oldIndex, new: newIndex });

      if (oldIndex === 'Indexable' && newIndex === 'Non-Indexable') {
        diff.newWarnings.push(`${url}: Ahora NO indexable (era Indexable)`);
      } else if (oldIndex === 'Non-Indexable' && newIndex === 'Indexable') {
        diff.fixedWarnings.push(`${url}: Ahora indexable (era No Indexable)`);
      }
    }
  }

  return diff;
}

function generateDiffReport(project: string, oldDate: string, newDate: string, diff: DiffResult): string {
  const md = `# Comparación Crawls - ${project} (${oldDate} → ${newDate})

## 📊 Resumen
- **Páginas nuevas:** ${diff.newPages.length}
- **Páginas eliminadas:** ${diff.removedPages.length}
- **Títulos cambiados:** ${diff.changedTitles.length}
- **Metas cambiadas:** ${diff.changedMetas.length}
- **H1s cambiados:** ${diff.changedH1s.length}
- **Status changes:** ${diff.statusChanges.length}
- **Indexability changes:** ${diff.indexabilityChanges.length}
- **Nuevos errores:** ${diff.newErrors.length}
- **Errores arreglados:** ${diff.fixedErrors.length}
- **Nuevas warnings:** ${diff.newWarnings.length}
- **Warnings arreglados:** ${diff.fixedWarnings.length}

---

## 🔴 Nuevos Errores (${diff.newErrors.length})
${diff.newErrors.length > 0 ? diff.newErrors.map(e => `- ${e}`).join('\n') : 'Ninguno'}

## 🟢 Errores Arreglados (${diff.fixedErrors.length})
${diff.fixedErrors.length > 0 ? diff.fixedErrors.map(e => `- ${e}`).join('\n') : 'Ninguno'}

## 🟡 Nuevas Advertencias (${diff.newWarnings.length})
${diff.newWarnings.length > 0 ? diff.newWarnings.map(w => `- ${w}`).join('\n') : 'Ninguna'}

## 🔵 Warnings Arreglados (${diff.fixedWarnings.length})
${diff.fixedWarnings.length > 0 ? diff.fixedWarnings.map(w => `- ${w}`).join('\n') : 'Ninguna'}

---

## 📝 Cambios en Títulos (${diff.changedTitles.length})
${diff.changedTitles.length > 0 ? diff.changedTitles.slice(0, 20).map(c => `- **${c.url}**: "${c.old}" → "${c.new}"`).join('\n') : 'Ninguno'}

## 📝 Cambios en Meta Descriptions (${diff.changedMetas.length})
${diff.changedMetas.length > 0 ? diff.changedMetas.slice(0, 20).map(c => `- **${c.url}**: "${c.old}" → "${c.new}"`).join('\n') : 'Ninguno'}

## 📝 Cambios en H1 (${diff.changedH1s.length})
${diff.changedH1s.length > 0 ? diff.changedH1s.slice(0, 20).map(c => `- **${c.url}**: "${c.old}" → "${c.new}"`).join('\n') : 'Ninguno'}

## 🔄 Cambios de Status (${diff.statusChanges.length})
${diff.statusChanges.length > 0 ? diff.statusChanges.slice(0, 20).map(c => `- **${c.url}**: ${c.old} → ${c.new}`).join('\n') : 'Ninguno'}

## 🔄 Cambios Indexabilidad (${diff.indexabilityChanges.length})
${diff.indexabilityChanges.length > 0 ? diff.indexabilityChanges.slice(0, 20).map(c => `- **${c.url}**: ${c.old} → ${c.new}`).join('\n') : 'Ninguno'}

---

## 📋 Páginas Nuevas (${diff.newPages.length})
${diff.newPages.length > 0 ? diff.newPages.slice(0, 30).map(u => `- ${u}`).join('\n') : 'Ninguna'}

## 🗑️ Páginas Eliminadas (${diff.removedPages.length})
${diff.removedPages.length > 0 ? diff.removedPages.slice(0, 30).map(u => `- ${u}`).join('\n') : 'Ninguna'}

---

*Generado: ${new Date().toISOString()}*
`;

  return md;
}

function compare(project: string, oldDate: string, newDate: string): void {
  console.log(`\n🔍 Comparando crawls ${project}: ${oldDate} → ${newDate}`);

  const oldData = loadCrawlData(project, oldDate);
  const newData = loadCrawlData(project, newDate);

  console.log(`  Crawl ${oldDate}: ${oldData.titles.size} URLs`);
  console.log(`  Crawl ${newDate}: ${newData.titles.size} URLs`);

  const diff = compareCrawls(oldData, newData);
  const report = generateDiffReport(project, oldDate, newDate, diff);

  const reportPath = `projects/${project}/seo/reports/compare-${oldDate}-to-${newDate}.md`;
  fs.writeFileSync(reportPath, report);

  console.log(`\n✅ Reporte generado: ${reportPath}`);
  console.log(`   Errores nuevos: ${diff.newErrors.length} | Arreglados: ${diff.fixedErrors.length}`);
  console.log(`   Warnings nuevos: ${diff.newWarnings.length} | Arreglados: ${diff.fixedWarnings.length}`);
  console.log(`   Páginas nuevas: ${diff.newPages.length} | Eliminadas: ${diff.removedPages.length}`);
}

// CLI
const [,, project, oldDate, newDate] = process.argv;
if (!project || !oldDate || !newDate) {
  console.log('Uso: npx tsx scripts/seo/compare-crawls.ts <project> <old-date> <new-date>');
  console.log('Ejemplo: npx tsx scripts/seo/compare-crawls.ts ciszu 2026-08-21 2026-08-22');
  process.exit(1);
}

const sites = ['ciszu', 'cizukoantony', 'muzicmania', 'ciszubot'];
if (!sites.includes(project)) {
  console.log(`Proyecto inválido. Opciones: ${sites.join(', ')}`);
  process.exit(1);
}

compare(project, oldDate, newDate);