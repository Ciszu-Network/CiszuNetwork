const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SERVER = process.env.NOTIFY_SERVER || 'https://ntfy.sh';
const PRIORITIES = { min: 1, low: 2, default: 3, high: 4, urgent: 5 };

function readEnvFiles() {
  const files = [
    path.join(ROOT, '.env.local'),
    path.join(ROOT, 'services', 'supabase', '.env'),
  ];
  const vars = {};
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
      const idx = line.indexOf('=');
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in vars)) vars[key] = value;
    }
  }
  return vars;
}

const FILE_ENV = readEnvFiles();

function env(name, fallback = '') {
  return process.env[name] || FILE_ENV[name] || fallback;
}

function isDryRun() {
  return process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';
}

function fmtDuration(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}

function timeout(ms = 15000) {
  return AbortSignal.timeout(ms);
}

async function publish({ title, message, tags = 'robot', priority = 'default', click = '', markdown = true }) {
  if (isDryRun()) {
    console.log(`[dry-run] ${title}\n${message}\n---`);
    return true;
  }
  const topic = env('NOTIFY_TOPIC');
  if (!topic) throw new Error('Falta NOTIFY_TOPIC');

  const params = new URLSearchParams({
    title,
    message,
    tags,
    priority: String(PRIORITIES[priority] ?? 3),
  });
  if (markdown) params.set('markdown', 'yes');
  if (click) params.set('click', click);

  const headers = {};
  const token = env('NOTIFY_TOKEN');
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${SERVER}/${topic}?${params}`, {
    method: 'POST',
    body: '',
    headers,
    signal: timeout(15000),
  });
  if (!res.ok) throw new Error(`ntfy HTTP ${res.status}`);
  console.log(`[notify] ${title}`);
  return true;
}

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, { ...options, signal: timeout(15000) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}${text ? `: ${text.slice(0, 160)}` : ''}`);
  }
  return res;
}

module.exports = {
  ROOT,
  env,
  isDryRun,
  fmtDuration,
  publish,
  jsonFetch,
  timeout,
};
