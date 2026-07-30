const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '..', 'services', 'supabase', '.env.local');
  if (!fs.existsSync(envPath)) {
    // Fallback: try CWD-relative
    const altPath = path.resolve(process.cwd(), 'services', 'supabase', '.env.local');
    if (fs.existsSync(altPath)) {
      return loadFile(altPath);
    }
    return;
  }
  return loadFile(envPath);
}

function loadFile(envPath) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const eq = trimmed.indexOf('=');
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

module.exports = { loadEnv };