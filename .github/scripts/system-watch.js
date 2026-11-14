const { publish, isDryRun } = require('./ops-lib');
const { collectSystems, summarize } = require('./ops-checks');
const { readState, writeState } = require('./ops-state');

const STYLE = {
  down: { title: 'Sistema caído', tags: 'rotating_light', priority: 'urgent' },
  degraded: { title: 'Sistema degradado', tags: 'warning', priority: 'high' },
  paused: { title: 'Sistema pausado', tags: 'pause_button', priority: 'default' },
  unknown: { title: 'Sistema sin datos', tags: 'question', priority: 'default' },
  up: { title: 'Sistema recuperado', tags: 'white_check_mark', priority: 'low' },
};

async function main() {
  const systems = await collectSystems();
  const counts = summarize(systems);
  let previousSystems = null;
  try {
    previousSystems = await readState();
  } catch (error) {
    console.error(`[system-watch] estado no disponible: ${error.message}`);
  }

  console.log(`[system-watch] ${systems.map((s) => `${s.name}=${s.status}`).join(' · ')}`);

  if (!previousSystems || Object.keys(previousSystems).length === 0) {
    console.log('[system-watch] primer run: baseline sin notificaciones.');
    if (!isDryRun()) await writeState(systems);
    return;
  }

  const changes = systems
    .map((system) => {
      const old = previousSystems[system.id];
      if (!old || old.status === system.status) return null;
      return { system, old };
    })
    .filter(Boolean);

  if (!changes.length) {
    console.log(`[system-watch] sin cambios (${counts.up} up, ${counts.paused} paused, ${counts.down} down).`);
    if (!isDryRun()) await writeState(systems);
    return;
  }

  if (changes.length > 2) {
    const lines = changes.map(
      ({ system, old }) => `- ${system.name}: ${old.status} → ${system.status} (${system.detail})`,
    );
    await publish({
      title: `Sistemas: ${changes.length} cambios de estado`,
      message: lines.join('\n'),
      tags: 'warning',
      priority: 'high',
    });
  } else {
    for (const { system, old } of changes) {
      const style = STYLE[system.status] || STYLE.unknown;
      await publish({
        title: `${style.title}: ${system.name}`,
        message: `${system.name}: ${old.status} → ${system.status}\n${system.detail}\nComprobado: ${system.checkedAt}`,
        tags: style.tags,
        priority: style.priority,
      });
    }
  }

  if (!isDryRun()) await writeState(systems);
}

main().catch((error) => {
  console.error(`[system-watch] ${error.message}`);
  process.exit(1);
});
