const { env, publish, fmtDuration, timeout } = require('./ops-lib');
const { collectSystems, summarize } = require('./ops-checks');

const SUPABASE_URL = env('SUPABASE_URL', 'https://obwzzmbvkrcscqwptlqo.supabase.co');
const ANON_KEY = env('SUPABASE_ANON_KEY') || env('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const REPO = env('GITHUB_REPOSITORY', 'Ciszu-Network/CiszuNetwork');

async function getBot() {
  if (!ANON_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bot_status?id=eq.1&select=online,last_seen,version,guilds,commands_total`,
      {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          'Accept-Profile': 'ciszubot',
        },
        signal: timeout(15000),
      },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

async function getRecentFailures() {
  const token = env('GITHUB_TOKEN');
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/actions/runs?per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: timeout(15000),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return (data.workflow_runs || []).filter(
      (run) =>
        Date.parse(run.created_at) >= since &&
        !['success', 'skipped'].includes(run.conclusion),
    );
  } catch {
    return null;
  }
}

async function main() {
  const systems = await collectSystems();
  const counts = summarize(systems);
  const bot = await getBot();
  const failures = await getRecentFailures();
  const age = bot?.last_seen ? Math.max(0, (Date.now() - Date.parse(bot.last_seen)) / 1000) : null;
  const botOnline = Boolean(bot?.online && age !== null && age < 300);

  const date = new Date().toLocaleDateString('es-VE', {
    timeZone: 'America/Caracas',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const lines = [
    `## Estado semanal — ${date}`,
    '',
    `**Sistemas:** ${counts.up} up · ${counts.paused} paused · ${counts.down} down · ${counts.unknown} sin datos`,
    '',
    ...systems.map((system) => `- **${system.name}:** ${system.status} — ${system.detail}`),
    '',
    `**CiszuBot:** ${botOnline ? 'online' : 'offline'} · ${bot?.version || '?'} · ${bot?.guilds ?? '?'} guilds · heartbeat ${age === null ? 'sin datos' : `hace ${fmtDuration(age)}`}`,
  ];

  if (failures) {
    lines.push('', `**GitHub Actions (7 días):** ${failures.length} fallo(s)`);
    for (const run of failures.slice(0, 6)) {
      lines.push(`- ${run.name}: ${run.conclusion} — ${run.html_url}`);
    }
    if (failures.length > 6) lines.push(`- +${failures.length - 6} más`);
  }

  await publish({
    title: 'Estado semanal de Ciszu Network',
    message: lines.join('\n'),
    tags: counts.down > 0 ? 'rotating_light' : 'clipboard',
    priority: counts.down > 0 ? 'high' : 'default',
    markdown: true,
  });
}

main().catch((error) => {
  console.error(`[status-report] ${error.message}`);
  process.exit(1);
});
