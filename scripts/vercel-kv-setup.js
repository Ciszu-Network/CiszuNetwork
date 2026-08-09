#!/usr/bin/env node
/**
 * vercel-kv-setup.js — automatiza la parte de Vercel KV del sistema de caché (Fase 2).
 *
 * Qué hace (idempotente y seguro):
 *   1. Busca el KV store creado (por defecto "ciszu-kv") en la cuenta/team de Vercel.
 *   2. Para cada proyecto del ecosistema (muzicmania, ciszubot): si ya tiene
 *      KV_REST_API_URL/KV_REST_API_TOKEN en production, lo salta.
 *   3. Si faltan, toma los valores del proyecto que ya los tenga (via GET con
 *      decrypt=true) y los inyecta en los demás (POST /v9/projects/{name}/env).
 *   4. Si ningún proyecto tiene los valores todavía (el store no se ha conectado
 *      a ninguno en el dashboard), imprime los pasos manuales mínimos y sale.
 *
 * Requiere: VERCEL_TOKEN (Settings → Tokens) y opcionalmente VERCEL_TEAM_ID/SLUG.
 *   $env:VERCEL_TOKEN="vcp_..." ; node scripts/vercel-kv-setup.js
 * Flags: --store <nombre> (default ciszu-kv), --dry-run (no escribe), --show-values
 *
 * Nota: la API de Vercel NO devuelve los valores del store recién creado (solo el
 * dashboard los genera), por eso la primera conexión es manual; el resto se replica.
 */

const TOKEN = process.env.VERCEL_TOKEN || '';
const TEAM = process.env.VERCEL_TEAM_ID || process.env.VERCEL_TEAM_SLUG || '';
const API = 'https://api.vercel.com';

const args = process.argv.slice(2);
const storeName = args.includes('--store') ? args[args.indexOf('--store') + 1] : 'ciszu-kv';
const dryRun = args.includes('--dry-run');
const showValues = args.includes('--show-values');

const PROJECTS = ['muzicmania', 'ciszubot'];
const KEYS = ['KV_REST_API_URL', 'KV_REST_API_TOKEN'];
const TARGETS = ['production', 'preview', 'development'];

function redact(v) {
  if (!v) return '(vacio)';
  if (showValues) return v;
  return `(${v.length} chars)`;
}

async function api(path, opts = {}) {
  const qs = TEAM ? (path.includes('?') ? '&' : '?') + `teamId=${encodeURIComponent(TEAM)}` : '';
  const res = await fetch(`${API}${path}${qs}`, {
    ...opts,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* no JSON */ }
  if (!res.ok) {
    throw new Error(`API ${res.status} ${path}: ${json?.error?.message || json?.error?.code || text.slice(0, 200)}`);
  }
  return json;
}

async function findKvStore() {
  // API nueva (storage)
  try {
    const { stores } = await api('/v1/storage/stores');
    if (Array.isArray(stores)) {
      const found = stores.find((s) => s.name === storeName || String(s.name).toLowerCase().includes('kv'));
      if (found) return found;
    }
  } catch { /* fallback a API legacy */ }
  try {
    const { stores } = await api('/v1/stores');
    if (Array.isArray(stores)) {
      const found = stores.find((s) => s.name === storeName || String(s.name).toLowerCase().includes('kv'));
      if (found) return found;
    }
  } catch { /* no stores */ }
  return null;
}

async function getProjectEnv(project) {
  const { envs } = await api(`/v9/projects/${project}/env`);
  return Array.isArray(envs) ? envs : [];
}

async function decryptEnv(project, envId) {
  const { value } = await api(`/v9/projects/${project}/env/${envId}?decrypt=true`);
  return value ?? null;
}

async function setEnv(project, key, value) {
  await api(`/v9/projects/${project}/env`, {
    method: 'POST',
    body: JSON.stringify({ key, value, type: 'encrypted', target: TARGETS }),
  });
}

async function main() {
  if (!TOKEN) {
    console.error('Falta VERCEL_TOKEN: Settings → Tokens → crear; luego $env:VERCEL_TOKEN="vcp_..."');
    process.exit(1);
  }
  console.log(`→ Buscando KV store "${storeName}"…`);
  const store = await findKvStore();
  if (!store) {
    console.log('✗ Store no encontrado. Primera creación manual (una sola vez):');
    console.log('  1. Vercel → cualquier proyecto → Storage → Create Database → KV → "ciszu-kv" → Create');
    console.log('  2. En el store → "Connect to project" → marcar ' + PROJECTS.join(' y ') + ' → Connect');
    console.log('  3. Volver a ejecutar este script (replica los valores al resto).');
    process.exit(0);
  }
  console.log(`✓ Store: ${store.name} (${store.id || store.externalResourceId || '?'})`);

  // 1) Recolectar valores existentes (del primer proyecto que los tenga)
  const values = {};
  for (const project of PROJECTS) {
    let envs;
    try { envs = await getProjectEnv(project); } catch (e) { console.warn(`⚠ ${project}: ${e.message}`); continue; }
    for (const env of envs) {
      if (KEYS.includes(env.key) && !values[env.key]) {
        const value = env.value ?? (env.id ? await decryptEnv(project, env.id).catch(() => null) : null);
        if (value) values[env.key] = { value, source: `${project}/${env.key}` };
      }
    }
  }

  // 2) Inyectar en proyectos que no los tengan en production
  for (const project of PROJECTS) {
    let envs;
    try { envs = await getProjectEnv(project); } catch { continue; }
    const existing = envs.filter((e) => KEYS.includes(e.key) && (e.target?.includes('production') || e.target?.includes('preview'))).map((e) => e.key);
    for (const key of KEYS) {
      if (existing.includes(key)) {
        console.log(`= ${project}: ${key} ya existe — ok`);
        continue;
      }
      if (!values[key]) {
        console.log(`⚠ ${project}: falta ${key} y no hay valor fuente (conecta el store a un proyecto en el dashboard).`);
        continue;
      }
      if (dryRun) {
        console.log(`(dry-run) ${project}: pondría ${key}=${redact(values[key].value)} (de ${values[key].source})`);
        continue;
      }
      await setEnv(project, key, values[key].value);
      console.log(`✓ ${project}: ${key} añadido (${redact(values[key].value)}, de ${values[key].source})`);
    }
  }

  console.log('\nRecuerda redesplegar: push a main (dispara los workflows) o botón "Redeploy" en Deployments.');
  if (dryRun) console.log('(modo --dry-run: no se escribió nada)');
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});