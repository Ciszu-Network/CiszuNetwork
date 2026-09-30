/**
 * Moderación del ecosistema (ban/mute/edición/borrado) — uso desde devcon.
 *
 * Uso:
 *   node scripts/moderation.js status <website> <username>
 *   node scripts/moderation.js ban   <website> <username> --actor=<quien> --reason=<motivo> [--hours=<n>]
 *   node scripts/moderation.js mute  <website> <username> --actor=<quien> --reason=<motivo> [--hours=<n>]
 *   node scripts/moderation.js unban <website> <username> --actor=<quien>
 *   node scripts/moderation.js unmute <website> <username> --actor=<quien>
 *   node scripts/moderation.js delete-reviews <website> <username> --actor=<quien> --reason=<motivo>
 *   node scripts/moderation.js edit-bio <website> <username> --actor=<quien> --text=<bio>
 *   node scripts/moderation.js ip-ban <ip> --actor=<quien> --reason=<motivo> [--hours=<n>]
 *
 * - Sin `--hours` la sanción es PERMANENTE hasta quitarla manualmente.
 * - TODA acción mutadora exige `--actor` y queda registrada en
 *   `public.moderation_actions` (fecha, autor, motivo, objetivo, expiración).
 * - Las mismas tablas alimentan la web: lo aplicado aquí se refleja allí.
 *
 * Jerarquía (aplicada también en el API web): owner > admin > mod = bot;
 * bots protegidos (solo el owner los toca); nadie actúa sobre rango mayor o
 * igual (el owner sí puede sobre owner). Los bots moderan (permisos de staff)
 * pero no son staff ni llevan tag de staff.
 */
const path = require('path');
const fs = require('fs');

const envCandidates = [
  path.resolve(__dirname, '..', 'services', 'supabase', '.env.local'),
  path.resolve(__dirname, 'services', 'supabase', '.env.local'),
  path.join(process.cwd(), 'services', 'supabase', '.env.local'),
  path.resolve(__dirname, '..', 'services', 'supabase', '.env'),
  path.resolve(__dirname, 'services', 'supabase', '.env'),
  path.join(process.cwd(), 'services', 'supabase', '.env'),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const eq = trimmed.indexOf('=');
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
    break;
  }
}

const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN not found');
  process.exit(1);
}

const WEBSITES = ['ciszunetwork', 'ciszubot', 'ciszukoantony', 'muzicmania'];
const RANK = { owner: 100, admin: 50, mod: 30, bot: 30 };

const q = (value) => String(value).replace(/'/g, "''");

async function sql(query) {
  const res = await fetch(API + '/projects/' + REF + '/database/query', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok && res.status !== 201) throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 500));
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

function parseFlags(args) {
  const flags = {};
  for (const a of args) {
    const m = /^--([a-zA-Z-]+)=(.*)$/.exec(a);
    if (m) flags[m[1]] = m[2];
  }
  return flags;
}

function usage() {
  console.log('Comandos: status | ban | mute | unban | unmute | delete-reviews | edit-bio | ip-ban');
  console.log('Lee la cabecera de scripts/moderation.js para el uso completo.');
}

async function findUser(username) {
  const rows = await sql(
    `select u.id, u.email, coalesce(u.raw_user_meta_data->>'username','') as username,
            (u.email_confirmed_at is not null) as confirmado
     from auth.users u
     where lower(coalesce(u.raw_user_meta_data->>'username','')) = lower('${q(username)}')
     limit 1;`,
  );
  return Array.isArray(rows) ? rows[0] : null;
}

async function userRank(userId, website) {
  const rows = await sql(
    `select role from public.user_roles where user_id = '${q(userId)}' and website = '${q(website)}' limit 1;`,
  );
  const role = Array.isArray(rows) ? rows[0]?.role : null;
  return { role: role ?? null, rank: role ? RANK[role] ?? 0 : 0 };
}

function assertActor(flags) {
  const actor = (flags.actor ?? '').trim();
  if (!actor) {
    console.error('Falta --actor=<quien> (obligatorio: queda registrado en la auditoría).');
    process.exit(1);
  }
  return actor;
}

function expiry(hours) {
  if (!hours) return null;
  const n = Number(hours);
  if (!Number.isFinite(n) || n <= 0) {
    console.error('--hours inválido.');
    process.exit(1);
  }
  return new Date(Date.now() + n * 3600 * 1000).toISOString();
}

async function logAction(row) {
  await sql(`
    insert into public.moderation_actions (website, target_user_id, actor, action, reason, details, expires_at)
    values (
      '${q(row.website)}', '${q(row.target)}', '${q(row.actor)}', '${q(row.action)}',
      '${q(row.reason ?? '')}', '${q(JSON.stringify(row.details ?? {}))}'::jsonb,
      ${row.expiresAt ? `'${q(row.expiresAt)}'` : 'null'}
    );
  `);
}

(async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === 'help') {
    usage();
    process.exit(0);
  }

  try {
    // ip-ban no necesita website/username
    if (cmd === 'ip-ban') {
      const [ip] = rest.filter((a) => !a.startsWith('--'));
      const flags = parseFlags(rest);
      const actor = assertActor(flags);
      if (!ip) {
        console.error('Falta la IP.');
        process.exit(1);
      }
      const expiresAt = expiry(flags.hours);
      await sql(`
        insert into public.banned_ips (ip, reason, actor, expires_at)
        values ('${q(ip)}', '${q(flags.reason ?? '')}', '${q(actor)}', ${expiresAt ? `'${q(expiresAt)}'` : 'null'})
        on conflict (ip) do update set reason = excluded.reason, actor = excluded.actor,
          created_at = now(), expires_at = excluded.expires_at;
      `);
      console.log(`OK: IP ${ip} bloqueada ${expiresAt ? 'hasta ' + expiresAt : '(permanente)'} por ${actor}.`);
      return;
    }

    const [website, username] = rest.filter((a) => !a.startsWith('--'));
    const flags = parseFlags(rest);
    if (!website || !WEBSITES.includes(website)) {
      console.error('Website inválido. Usa: ' + WEBSITES.join(' | '));
      process.exit(1);
    }

    const user = await findUser(username);
    if (!user) {
      console.error(`Usuario @${username} no encontrado.`);
      process.exit(1);
    }
    const target = await userRank(user.id, website);

    if (cmd === 'status') {
      const sanctions = await sql(`
        select type, reason, actor, created_at::date as desde, expires_at,
               (expires_at is null or expires_at > now()) as activa
        from public.sanctions
        where user_id = '${q(user.id)}'
        order by created_at desc limit 10;
      `);
      const actions = await sql(`
        select action, actor, reason, created_at::date as desde
        from public.moderation_actions
        where target_user_id = '${q(user.id)}' and website = '${q(website)}'
        order by created_at desc limit 5;
      `);
      console.log(`@${user.username} (${website}) rol=${target.role ?? 'usuario'} confirmado=${user.confirmado}`);
      console.log('Sanciones:');
      for (const s of sanctions) {
        console.log(`  ${s.activa ? '[ACTIVA]' : '[hist]  '} ${s.type} · ${s.reason} · por ${s.actor} · ${s.desde}${s.expires_at ? ' hasta ' + s.expires_at : ' (permanente)'}`);
      }
      console.log('Últimas acciones de moderación:');
      for (const a of actions) {
        console.log(`  ${a.desde} ${a.action} · ${a.reason} · por ${a.actor}`);
      }
      return;
    }

    const actor = assertActor(flags);

    // Jerarquía: nadie actúa sobre rango >= propio (el owner sí sobre owner);
    // los bots solo los toca el owner. El script registra la acción igual.
    if (cmd !== 'edit-bio') {
      const actorRankSelf = flags.actorRank ? RANK[flags.actorRank] ?? 0 : null;
      if (actorRankSelf !== null) {
        if (target.role === 'owner' && actorRankSelf < 100) {
          console.error('Protegido: solo el owner puede moderar a otro owner.');
          process.exit(1);
        }
        if (target.role === 'bot' && actorRankSelf < 100) {
          console.error('Protegido: las cuentas bot solo las toca el owner.');
          process.exit(1);
        }
        if (RANK[target.role] !== undefined && actorRankSelf <= RANK[target.role] && actorRankSelf < 100) {
          console.error('Jerarquía: no puedes moderar a un rango igual o superior.');
          process.exit(1);
        }
      }
    }

    const reason = flags.reason ?? '';
    const expiresAt = expiry(flags.hours);

    if (cmd === 'ban' || cmd === 'mute') {
      if (!reason) {
        console.error('La sanción exige --reason=<motivo>.');
        process.exit(1);
      }
      await sql(`
        insert into public.sanctions (user_id, type, scope, reason, actor, expires_at)
        values ('${q(user.id)}', '${cmd === 'ban' ? 'ban' : 'mute'}', 'global',
                '${q(reason)}', '${q('staff:' + actor)}', ${expiresAt ? `'${q(expiresAt)}'` : 'null'});
      `);
      await logAction({ website, target: user.id, actor: 'staff:' + actor, action: cmd, reason, expiresAt });
      console.log(`OK: @${user.username} ${cmd === 'ban' ? 'BANEADO' : 'MUTEADO'} en ${website} ${expiresAt ? 'hasta ' + expiresAt : '(permanente)'} por ${actor}.`);
      return;
    }

    if (cmd === 'unban' || cmd === 'unmute') {
      const type = cmd === 'unban' ? 'ban' : 'mute';
      const rows = await sql(`
        update public.sanctions set expires_at = now()
        where user_id = '${q(user.id)}' and type = '${type}'
          and (expires_at is null or expires_at > now())
        returning id;
      `);
      await logAction({ website, target: user.id, actor: 'staff:' + actor, action: cmd, reason });
      console.log(`OK: ${type} activo(s) de @${user.username}: ${Array.isArray(rows) ? rows.length : 0} levantados.`);
      return;
    }

    if (cmd === 'delete-reviews') {
      const rows = await sql(`
        delete from ${q(website)}.reviews where user_id = '${q(user.id)}' returning id;
      `);
      await logAction({ website, target: user.id, actor: 'staff:' + actor, action: 'delete_review', reason, details: { all: true } });
      console.log(`OK: ${Array.isArray(rows) ? rows.length : 0} reviews de @${user.username} eliminadas en ${website}.`);
      return;
    }

    if (cmd === 'edit-bio') {
      const text = flags.text ?? '';
      try {
        await sql(`update ${q(website)}.profiles set bio = ${text ? `'${q(text)}'` : 'null'} where id = '${q(user.id)}';`);
      } catch (err) {
        console.error('No se pudo editar la bio (¿la web no tiene campo bio?): ' + err.message);
        process.exit(1);
      }
      await logAction({ website, target: user.id, actor: 'staff:' + actor, action: 'edit_bio', reason, details: { text } });
      console.log(`OK: bio de @${user.username} actualizada en ${website}.`);
      return;
    }

    usage();
    process.exit(1);
  } catch (err) {
    console.error('ERR: ' + err.message);
    process.exit(1);
  }
})();
