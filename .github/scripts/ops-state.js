const { env, timeout } = require('./ops-lib');

const SUPABASE_URL = env('SUPABASE_URL', 'https://obwzzmbvkrcscqwptlqo.supabase.co');
const SERVICE_KEY = env('SUPABASE_SERVICE_ROLE_KEY');

function headers() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Accept-Profile': 'ciszu',
    'Content-Profile': 'ciszu',
    'Content-Type': 'application/json',
  };
}

async function readState() {
  if (!SERVICE_KEY) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/ops_monitor_state?select=id,name,status,detail,checked_at`,
    { headers: headers(), signal: timeout(15000) },
  );
  if (!res.ok) throw new Error(`ops_monitor_state HTTP ${res.status}`);
  const rows = await res.json();
  return Object.fromEntries((rows || []).map((row) => [row.id, row]));
}

async function writeState(systems) {
  if (!SERVICE_KEY) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');
  const body = systems.map((system) => ({
    id: system.id,
    name: system.name,
    status: system.status,
    detail: system.detail,
    checked_at: system.checkedAt,
    updated_at: new Date().toISOString(),
  }));
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ops_monitor_state?on_conflict=id`, {
    method: 'POST',
    headers: {
      ...headers(),
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(body),
    signal: timeout(15000),
  });
  if (!res.ok) throw new Error(`ops_monitor_state upsert HTTP ${res.status}`);
}

module.exports = { readState, writeState };
