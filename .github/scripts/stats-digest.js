const { env, publish, fmtDuration } = require('./ops-lib');

const SUPABASE_URL = env('SUPABASE_URL', 'https://obwzzmbvkrcscqwptlqo.supabase.co');
const SERVICE_KEY = env('SUPABASE_SERVICE_ROLE_KEY');
const SCHEMAS = ['ciszunetwork', 'ciszukoantony', 'ciszubot', 'muzicmania'];

function headers(schema) {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Accept-Profile': schema,
  };
}

async function count(schema, table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    method: 'HEAD',
    headers: {
      ...headers(schema),
      Prefer: 'count=exact',
      Range: '0-0',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${schema}.${table} HTTP ${res.status}`);
  const range = res.headers.get('content-range') || '';
  const total = Number(range.split('/')[1]);
  return Number.isFinite(total) ? total : 0;
}

async function rows(schema, table, query = 'select=*') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: headers(schema),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${schema}.${table} HTTP ${res.status}`);
  return res.json();
}

async function safeCount(schema, table) {
  try {
    return await count(schema, table);
  } catch (error) {
    console.error(`[stats] ${error.message}`);
    return null;
  }
}

async function safeRows(schema, table, query) {
  try {
    return await rows(schema, table, query);
  } catch (error) {
    console.error(`[stats] ${error.message}`);
    return [];
  }
}

function n(value) {
  return value === null || value === undefined ? '?' : new Intl.NumberFormat('es-VE').format(value);
}

async function main() {
  if (!SERVICE_KEY) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');

  const [profileCounts, reviewCounts, walletCounts, scores, levels, trackStats, botRows] =
    await Promise.all([
      Promise.all(SCHEMAS.map((schema) => safeCount(schema, 'profiles'))),
      Promise.all(SCHEMAS.map((schema) => safeCount(schema, 'reviews'))),
      Promise.all([
        safeCount('ciszubot', 'wallets'),
        safeCount('muzicmania', 'wallets'),
      ]),
      safeCount('muzicmania', 'scores'),
      safeCount('muzicmania', 'custom_levels'),
      safeRows('muzicmania', 'track_stats', 'select=play_count,like_count'),
      safeRows('ciszubot', 'bot_status', 'select=online,last_seen,version,guilds,commands_total&id=eq.1'),
    ]);

  const totalProfiles = profileCounts.reduce((sum, value) => sum + (value || 0), 0);
  const totalReviews = reviewCounts.reduce((sum, value) => sum + (value || 0), 0);
  const totalWallets = walletCounts.reduce((sum, value) => sum + (value || 0), 0);
  const totalPlays = trackStats.reduce((sum, row) => sum + Number(row.play_count || 0), 0);
  const totalLikes = trackStats.reduce((sum, row) => sum + Number(row.like_count || 0), 0);
  const bot = botRows[0];
  const age = bot?.last_seen ? Math.max(0, (Date.now() - Date.parse(bot.last_seen)) / 1000) : null;
  const botOnline = Boolean(bot?.online && age !== null && age < 300);

  const date = new Date().toLocaleDateString('es-VE', {
    timeZone: 'America/Caracas',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const message = [
    `## Resumen diario — ${date}`,
    '',
    `**Cuentas:** ${n(totalProfiles)} (${profileCounts.map((c) => n(c)).join(' · ')})`,
    `**Reseñas:** ${n(totalReviews)} · **Wallets:** ${n(totalWallets)}`,
    `**MuzicMania:** ${n(scores)} scores · ${n(levels)} niveles · ${n(totalPlays)} plays · ${n(totalLikes)} likes`,
    `**CiszuBot:** ${botOnline ? 'online' : 'offline'} · ${bot?.version || '?'} · ${n(bot?.guilds)} guilds · ${n(bot?.commands_total)} comandos`,
    `**Último heartbeat:** ${age === null ? 'sin datos' : `hace ${fmtDuration(age)}`}`,
    '',
    '_Datos de Supabase; sin cifras estimadas._',
  ].join('\n');

  await publish({
    title: 'Resumen diario de Ciszu Network',
    message,
    tags: 'bar_chart',
    priority: 'low',
    markdown: true,
  });
}

main().catch((error) => {
  console.error(`[stats-digest] ${error.message}`);
  process.exit(1);
});
