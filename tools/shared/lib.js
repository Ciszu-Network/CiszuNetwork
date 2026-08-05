// lib.js — helpers comunes a los generadores IA (env, argv, retry, ffmpeg).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

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

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'untitled';
}

function slugifyModel(model) {
  return String(model).toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'model';
}

function noLogWarn() {}

async function withRetry(fn, label, attempts = 4) {
  const delays = [2000, 6000, 15000];
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      const status = e?.status || e?.code || '';
      if (status === 404 || status === 401 || status === 403) throw e;
      if (attempt < delays.length) {
        console.warn(`  [retry ${attempt + 1}/${delays.length}] ${label}: ${status || e.message} → reintento en ${delays[attempt]}ms`);
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
  }
  throw new Error(`${label} falló tras ${attempts} intentos: ${lastError?.message || lastError}`);
}

// ffmpeg del bundle de voz (openvoice) — local, sin red
let _ffmpeg = null;
function findFfmpeg() {
  if (_ffmpeg) return { ..._ffmpeg };
  const base = path.join(ROOT, 'tools', 'tts-stt-ai', 'runtime');
  if (fs.existsSync(base)) {
    for (const dir of fs.readdirSync(base)) {
      if (!/^ffmpeg-/.test(dir)) continue;
      const bin = path.join(base, dir, 'bin');
      const ff = path.join(bin, 'ffmpeg.exe');
      const fp = path.join(bin, 'ffprobe.exe');
      if (fs.existsSync(ff)) {
        _ffmpeg = { ffmpeg: ff, ffprobe: fp, bin };
        return { ..._ffmpeg };
      }
    }
  }
  // PATH fallback
  return { ffmpeg: 'ffmpeg', ffprobe: 'ffprobe', bin: null };
}

function probeDuration(file) {
  const { ffprobe } = findFfmpeg();
  const { execFileSync } = require('child_process');
  try {
    const out = execFileSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
    return parseFloat(out.trim());
  } catch {
    return null;
  }
}

module.exports = {
  ROOT,
  readEnvFiles,
  parseArgs,
  slugify,
  slugifyModel,
  withRetry,
  findFfmpeg,
  probeDuration,
};