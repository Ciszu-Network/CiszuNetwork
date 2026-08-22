#!/usr/bin/env node
/**
 * process-log-file.ts
 * Procesa access logs (Vercel/Apache/Nginx) para análisis de bots
 * Uso: npx tsx scripts/seo/process-log-file.ts <project> <log-file-path>
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface LogEntry {
  ip: string;
  timestamp: string;
  method: string;
  url: string;
  protocol: string;
  status: number;
  size: number;
  referrer: string;
  userAgent: string;
  responseTime?: number;
}

interface BotStats {
  bot: string;
  hits: number;
  uniqueUrls: Set<string>;
  statusCodes: Map<number, number>;
  totalBytes: number;
  avgResponseTime: number;
  ips: Set<string>;
}

const BOT_PATTERNS = [
  { name: 'Googlebot', regex: /Googlebot/i },
  { name: 'Bingbot', regex: /bingbot/i },
  { name: 'YandexBot', regex: /YandexBot/i },
  { name: 'AhrefsBot', regex: /AhrefsBot/i },
  { name: 'SemrushBot', regex: /SemrushBot/i },
  { name: 'MJ12bot', regex: /MJ12bot/i },
  { name: 'DotBot', regex: /DotBot/i },
  { name: 'SemrushBot-SA', regex: /SemrushBot-SA/i },
  { name: 'SemrushBot-BM', regex: /SemrushBot-BM/i },
  { name: 'AppleBot', regex: /AppleBot/i },
  { name: 'DuckDuckBot', regex: /DuckDuckBot/i },
  { name: 'facebookexternalhit', regex: /facebookexternalhit/i },
  { name: 'Twitterbot', regex: /Twitterbot/i },
  { name: 'LinkedInBot', regex: /LinkedInBot/i },
  { name: 'Pinterestbot', regex: /Pinterestbot/i },
  { name: 'Slackbot', regex: /Slackbot/i },
  { name: 'Discordbot', regex: /Discordbot/i },
  { name: 'TelegramBot', regex: /TelegramBot/i },
];

function identifyBot(userAgent: string): string | null {
  for (const bot of BOT_PATTERNS) {
    if (bot.regex.test(userAgent)) return bot.name;
  }
  return null;
}

function parseLogLine(line: string): LogEntry | null {
  // Formato combinado Apache/Nginx común
  // 127.0.0.1 - - [22/Aug/2026:03:58:12 +0000] "GET / HTTP/1.1" 200 1234 "-" "Mozilla/5.0..."
  const regex = /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+|-) "([^"]*)" "([^"]*)"(?: (\d+))?$/;
  const match = line.match(regex);

  if (!match) return null;

  const [, ip, timestamp, method, url, protocol, statusStr, sizeStr, referrer, userAgent, responseTimeStr] = match;

  return {
    ip,
    timestamp,
    method,
    url,
    protocol,
    status: parseInt(statusStr, 10),
    size: sizeStr === '-' ? 0 : parseInt(sizeStr, 10),
    referrer,
    userAgent,
    responseTime: responseTimeStr ? parseInt(responseTimeStr, 10) : undefined
  };
}

function parseLogFile(filePath: string): LogEntry[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const entries: LogEntry[] = [];

  for (const line of lines) {
    const parsed = parseLogLine(line.trim());
    if (parsed) entries.push(parsed);
  }

  return entries;
}

function analyzeLogs(entries: LogEntry[]): BotStats[] {
  const botMap = new Map<string, BotStats>();

  for (const entry of entries) {
    const bot = identifyBot(entry.userAgent);
    if (!bot) continue;

    let stats = botMap.get(bot);
    if (!stats) {
      stats = {
        bot,
        hits: 0,
        uniqueUrls: new Set(),
        statusCodes: new Map(),
        totalBytes: 0,
        avgResponseTime: 0,
        ips: new Set()
      };
      botMap.set(bot, stats);
    }

    stats.hits++;
    stats.uniqueUrls.add(entry.url);
    stats.statusCodes.set(entry.status, (stats.statusCodes.get(entry.status) || 0) + 1);
    stats.totalBytes += entry.size;
    stats.ips.add(entry.ip);

    if (entry.responseTime) {
      stats.avgResponseTime = (stats.avgResponseTime * (stats.hits - 1) + entry.responseTime) / stats.hits;
    }
  }

  return Array.from(botMap.values()).sort((a, b) => b.hits - a.hits);
}

function generateReport(project: string, stats: BotStats[], dateRange: string): string {
  const totalHits = stats.reduce((sum, s) => sum + s.hits, 0);
  const totalUniqueUrls = new Set(stats.flatMap(s => Array.from(s.uniqueUrls))).size;

  let md = `# Log File Analysis - ${project} - ${dateRange}

**Resumen:** ${stats.length} bots detectados, ${totalHits} hits totales, ${totalUniqueUrls} URLs únicas rastreadas

## 📊 Resumen por Bot

| Bot | Hits | URLs Únicas | IPs Únicas | Bytes Totales | Avg Resp (ms) | Status Codes |
|-----|------|-------------|------------|---------------|---------------|--------------|`;

  for (const stat of stats) {
    const statusStr = Array.from(stats.statusCodes.entries())
      .map(([code, count]: [number, number]) => `${code}:${count}`)
      .join(', ');

    md += `\n| ${stat.bot} | ${stat.hits} | ${stat.uniqueUrls.size} | ${stat.ips.size} | ${(stat.totalBytes / 1024 / 1024).toFixed(2)} MB | ${stat.avgResponseTime.toFixed(0)}ms | ${statusStr} |`;
  }

  // Análisis de salud
  md += `\n\n## 🔍 Análisis de Salud

### Googlebot
`;

  const googlebot = stats.find(s => s.bot === 'Googlebot');
  if (googlebot) {
    const errorRate = ((googlebot.statusCodes.get(500) || 0) + (googlebot.statusCodes.get(502) || 0) + (googlebot.statusCodes.get(503) || 0)) / googlebot.hits;
    const notFoundRate = (googlebot.statusCodes.get(404) || 0) / googlebot.hits;

    md += `- **Hits/semana:** ${Math.round(googlebot.hits * 7 / 30)} (extrapolado 30 días)
- **URLs únicas rastreadas:** ${googlebot.uniqueUrls.size}
- **Tasa 5xx:** ${(errorRate * 100).toFixed(2)}% ${errorRate > 0.01 ? '⚠️ ALTO' : '✅ OK'}
- **Tasa 404:** ${(notFoundRate * 100).toFixed(2)}% ${notFoundRate > 0.05 ? '⚠️ ALTO' : '✅ OK'}
- **Avg response time:** ${googlebot.avgResponseTime.toFixed(0)}ms ${googlebot.avgResponseTime > 1000 ? '⚠️ LENTO' : '✅ OK'}
`;
  } else {
    md += `- ❌ **Googlebot NO detectado en logs** - Revisar configuración Vercel/CDN\n`;
  }

  md += `\n### Otros Bots Principales
`;

  for (const stat of stats.filter(s => s.bot !== 'Googlebot').slice(0, 10)) {
    md += `- **${stat.bot}:** ${stat.hits} hits, ${stat.uniqueUrls.size} URLs, ${stat.avgResponseTime.toFixed(0)}ms avg\n`;
  }

  // URLs más rastreadas
  md += `\n## 🎯 Top 20 URLs Más Rastreadas\n\n| URL | Hits | Bots |\n|-----|------|------|\n`;

  const urlHits = new Map<string, { hits: number; bots: Set<string> }>();
  for (const stat of stats) {
    for (const url of stat.uniqueUrls) {
      const existing = urlHits.get(url) || { hits: 0, bots: new Set() };
      existing.hits += stat.hits;
      existing.bots.add(stat.bot);
      urlHits.set(url, existing);
    }
  }

  const topUrls = Array.from(urlHits.entries())
    .sort((a, b) => b[1].hits - a[1].hits)
    .slice(0, 20);

  for (const [url, data] of topUrls) {
    md += `| ${url} | ${data.hits} | ${Array.from(data.bots).join(', ')} |\n`;
  }

  md += `\n---\n*Generado: ${new Date().toISOString()}*`;

  return md;
}

function processLogFile(project: string, logFilePath: string): void {
  if (!fs.existsSync(logFilePath)) {
    console.log(`❌ Archivo no encontrado: ${logFilePath}`);
    console.log('Descarga logs de Vercel: Dashboard → Logs → Download');
    return;
  }

  console.log(`\n📊 Procesando logs para ${project}...`);
  const entries = parseLogFile(logFilePath);
  console.log(`  Entradas parseadas: ${entries.length}`);

  const stats = analyzeLogs(entries) as BotStats[];
  console.log(`  Bots detectados: ${stats.length}`);

  const dateRange = new Date().toISOString().split('T')[0];
  const reportPath = `projects/${project}/seo/reports/log-analysis-${dateRange}.md`;
  const md = generateReport(project, stats, dateRange);

  fs.writeFileSync(reportPath, md);
  console.log(`\n✅ Reporte generado: ${reportPath}`);

  // Guardar CSV detallado para análisis posterior
  const csvPath = `projects/${project}/seo/audits/log-file-analyzer/exports/bot-hits-${dateRange}.csv`;
  const csvHeader = 'Bot,Hits,UniqueURLs,UniqueIPs,TotalBytesMB,AvgResponseMs,StatusCodes\n';
  const csvRows = stats.map(s => {
    const statusStr = Array.from(s.statusCodes.entries()).map(([c, n]) => `${c}:${n}`).join(';');
    return `${s.bot},${s.hits},${s.uniqueUrls.size},${s.ips.size},${(s.totalBytes / 1024 / 1024).toFixed(2)},${s.avgResponseTime.toFixed(0)},"${statusStr}"`;
  }).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  console.log(`✅ CSV exportado: ${csvPath}`);
}

// CLI
const [,, project, logFile] = process.argv;
if (!project || !logFile) {
  console.log('Uso: npx tsx scripts/seo/process-log-file.ts <project> <log-file-path>');
  console.log('Ejemplo: npx tsx scripts/seo/process-log-file.ts ciszu ./access.log');
  process.exit(1);
}

const sites = ['ciszu', 'cizukoantony', 'muzicmania', 'ciszubot'];
if (!sites.includes(project)) {
  console.log(`Proyecto inválido. Opciones: ${sites.join(', ')}`);
  process.exit(1);
}

processLogFile(project, logFile);