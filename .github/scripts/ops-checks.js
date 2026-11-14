const { env, timeout } = require('./ops-lib');

const SUPABASE_URL = env('SUPABASE_URL', 'https://obwzzmbvkrcscqwptlqo.supabase.co');
const ANON_KEY = env('SUPABASE_ANON_KEY') || env('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const CDN_URL = env(
  'CDN_CHECK_URL',
  'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg',
);

const WEBSITES = [
  { id: 'ciszunetwork', name: 'CiszuNetwork', url: 'https://ciszunetwork.vercel.app' },
  { id: 'ciszukoantony', name: 'CiszukoAntony', url: 'https://ciszukoantony.vercel.app' },
  { id: 'muzicmania', name: 'MuzicMania', url: 'https://muzicmania.vercel.app' },
  { id: 'ciszubot', name: 'CiszuBot web', url: 'https://ciszubot.vercel.app' },
];

function cleanError(error) {
  return String(error?.message || error || 'error').replace(/\s+/g, ' ').slice(0, 180);
}

async function checkWebsite(site) {
  try {
    let res = await fetch(site.url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: timeout(15000),
      headers: { 'user-agent': 'Ciszu-Ops/1.0' },
    });
    if (res.status === 405) {
      res = await fetch(site.url, {
        method: 'GET',
        redirect: 'follow',
        signal: timeout(15000),
        headers: { 'user-agent': 'Ciszu-Ops/1.0' },
      });
    }
    const vercelError = res.headers.get('x-vercel-error') || '';
    if (res.status === 402 || vercelError === 'DEPLOYMENT_DISABLED') {
      return {
        id: site.id,
        name: site.name,
        kind: 'web',
        status: 'paused',
        detail: 'Vercel: DEPLOYMENT_DISABLED',
      };
    }
    return {
      id: site.id,
      name: site.name,
      kind: 'web',
      status: res.ok ? 'up' : 'down',
      detail: `HTTP ${res.status}`,
    };
  } catch (error) {
    return {
      id: site.id,
      name: site.name,
      kind: 'web',
      status: 'down',
      detail: cleanError(error),
    };
  }
}

async function checkSupabase() {
  if (!ANON_KEY) {
    return {
      id: 'supabase',
      name: 'Supabase REST',
      kind: 'data',
      status: 'unknown',
      detail: 'falta SUPABASE_ANON_KEY',
    };
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bot_status?id=eq.1&select=last_seen,version,guilds`,
      {
        signal: timeout(15000),
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          'Accept-Profile': 'ciszubot',
        },
      },
    );
    if (!res.ok) {
      return {
        id: 'supabase',
        name: 'Supabase REST',
        kind: 'data',
        status: 'down',
        detail: `HTTP ${res.status}`,
      };
    }
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    return {
      id: 'supabase',
      name: 'Supabase REST',
      kind: 'data',
      status: 'up',
      detail: row?.version ? `bot ${row.version} · ${row.guilds ?? '?'} guilds` : 'REST OK',
    };
  } catch (error) {
    return {
      id: 'supabase',
      name: 'Supabase REST',
      kind: 'data',
      status: 'down',
      detail: cleanError(error),
    };
  }
}

async function checkCdn() {
  try {
    const res = await fetch(CDN_URL, {
      method: 'HEAD',
      signal: timeout(15000),
      headers: { 'user-agent': 'Ciszu-Ops/1.0' },
    });
    return {
      id: 'cdn',
      name: 'CDN Supabase',
      kind: 'assets',
      status: res.ok ? 'up' : 'down',
      detail: `HTTP ${res.status}`,
    };
  } catch (error) {
    return {
      id: 'cdn',
      name: 'CDN Supabase',
      kind: 'assets',
      status: 'down',
      detail: cleanError(error),
    };
  }
}

async function collectSystems() {
  const systems = await Promise.all([
    ...WEBSITES.map(checkWebsite),
    checkSupabase(),
    checkCdn(),
  ]);
  return systems.map((system) => ({ ...system, checkedAt: new Date().toISOString() }));
}

function summarize(systems) {
  return systems.reduce(
    (acc, system) => {
      acc[system.status] = (acc[system.status] || 0) + 1;
      return acc;
    },
    { up: 0, paused: 0, down: 0, degraded: 0, unknown: 0 },
  );
}

module.exports = {
  WEBSITES,
  collectSystems,
  summarize,
};
