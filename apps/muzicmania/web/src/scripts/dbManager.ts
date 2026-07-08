import { supabaseAdmin } from './supabaseAdmin';
import pc from 'picocolors';
import prompts from 'prompts';

export const dbMenu = async () => {
  let back = false;
  while (!back) {
    console.clear();
    console.log(pc.magenta('   ╔═══════════════════════════════════════════════════════════════════════════╗'));
    console.log(`${pc.magenta('   ║ ')}${pc.white('GESTOR DE BASE DE DATOS MUZICMANIA ')}${pc.dim('v1.0')}${pc.magenta('                      ║')}`);
    console.log(pc.magenta('   ╠═══════════════════════════════════════════════════════════════════════════╣'));
    console.log(`${pc.magenta('   ║ ')}${pc.dim('Comandos disponibles:')}${pc.magenta('                                              ║')}`);
    console.log(`${pc.magenta('   ║ ')}${pc.white('- Listar Usuarios: Muestra todos los perfiles registrados.')}${pc.magenta('         ║')}`);
    console.log(`${pc.magenta('   ║ ')}${pc.white('- Gestionar Admin: Otorga/quita permisos de administrador.')}${pc.magenta('         ║')}`);
    console.log(`${pc.magenta('   ║ ')}${pc.white('- Banear Usuario: Desactiva el acceso de una cuenta.')}${pc.magenta('               ║')}`);
    console.log(`${pc.magenta('   ║ ')}${pc.white('- Ver Métricas: Consulta estadísticas reales de uso.')}${pc.magenta('               ║')}`);
    console.log(`${pc.magenta('   ║ ')}${pc.red('- Ejecutar SQL: Ejecución de consultas crudas (AVANZADO).')}${pc.magenta('          ║')}`);
    console.log(pc.magenta('   ╚═══════════════════════════════════════════════════════════════════════════╝'));

    const { action } = await prompts({
      type: 'select',
      name: 'action',
      message: pc.cyan('DB MANAGER » ') + 'Selecciona una acción:',
      choices: [
        { title: '👤 Listar Usuarios (Perfiles)', value: 'list' },
        { title: '🔑 Listar Usuarios (Auth)', value: 'listAuth' },
        { title: '🛡️ Dar Permisos de Admin', value: 'admin' },
        { title: '🚫 Banear Usuario', value: 'ban' },
        { title: '🎖️ Otorgar Emblema/Badge', value: 'badge' },
        { title: '📊 Ver Estadísticas Reales', value: 'stats' },
        { title: '🐚 Shell Interactiva (JS/TS)', value: 'shell' },
        { title: '🔥 Ejecutar SQL Manual', value: 'sql' },
        { title: '🔙 Volver al Menú Principal', value: 'back' },
      ],
    });

    if (!action || action === 'back') {
      back = true;
      break;
    }

    switch (action) {
      case 'list': await listUsers(); break;
      case 'listAuth': await listAuthUsers(); break;
      case 'admin': await toggleAdmin(); break;
      case 'ban': await banUser(); break;
      case 'badge': await addBadge(); break;
      case 'stats': await showStats(); break;
      case 'shell': await interactiveShell(); break;
      case 'sql': await runManualSQL(); break;
    }
  }
};

async function listUsers() {
  console.log(pc.yellow('\n--- LISTADO DE CIUDADANOS ---'));
  const { data, error } = await supabaseAdmin.from('profiles').select('id, username, display_name, is_admin');
  if (error) return console.error(pc.red('Error: ' + error.message));
  
  data?.forEach((u: any) => {
    console.log(`${u.is_admin ? pc.bgMagenta(pc.white(' ADMIN ')) : pc.bgBlue(pc.white(' USER '))} ${pc.cyan(u.username)} (${u.display_name}) - ID: ${u.id}`);
  });
  await waitForKey();
}

async function toggleAdmin() {
  const { username } = await prompts({ type: 'text', name: 'username', message: 'Username del usuario:' });
  const { data: user } = await supabaseAdmin.from('profiles').select('id, is_admin').eq('username', username).single();
  
  if (!user) return console.log(pc.red('Usuario no encontrado.'));
  
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `¿Deseas ${user.is_admin ? 'quitar' : 'dar'} permisos de ADMIN a ${username}?`
  });

  if (confirm) {
    const { error } = await supabaseAdmin.from('profiles').update({ is_admin: !user.is_admin }).eq('id', user.id);
    if (error) console.error(pc.red(error.message));
    else console.log(pc.green(`Permisos actualizados para ${username}`));
  }
  await waitForKey();
}

async function banUser() {
  const { username } = await prompts({ type: 'text', name: 'username', message: 'Username a BANEAR:' });
  const { data: user } = await supabaseAdmin.from('profiles').select('id').eq('username', username).single();
  
  if (!user) return console.log(pc.red('Usuario no encontrado.'));
  const userId = user.id;

  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `¿Estás seguro de que deseas banear al usuario ${userId}?`,
    initial: false
  });

  if (confirm) {
    await supabaseAdmin.from('profiles').update({ is_banned: true }).eq('id', userId);
    console.log(pc.green(`[EXITO] Usuario ${userId} ha sido marcado como baneado.`));
  }
  await waitForKey();
}

async function addBadge() {
  const { username } = await prompts({ type: 'text', name: 'username', message: 'Username del usuario:' });
  const { badge } = await prompts({ type: 'text', name: 'badge', message: 'Nombre del Emblema (ej: VETERANO, ALPHA_TESTER):' });

  const { data: user } = await supabaseAdmin.from('profiles').select('id, badges').eq('username', username).single();
  if (!user) return console.log(pc.red('Usuario no encontrado.'));

  const newBadges = [...(user.badges || []), badge.toUpperCase()];
  const { error } = await supabaseAdmin.from('profiles').update({ badges: newBadges }).eq('id', user.id);
  
  if (error) console.error(pc.red(error.message));
  else console.log(pc.green(`Emblema ${badge} otorgado a ${username}`));
  await waitForKey();
}

async function showStats() {
  console.log(pc.cyan('\n--- MÉTRICAS REALES SUPABASE ---'));
  const { count: users } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
  const { count: scores } = await supabaseAdmin.from('scores').select('*', { count: 'exact', head: true });
  const { data: top } = await supabaseAdmin.from('profiles').select('username, high_score').order('high_score', { ascending: false }).limit(3);

  console.log(`${pc.white('Usuarios Totales:')} ${pc.green(users)}`);
  console.log(`${pc.white('Partidas Jugadas:')} ${pc.green(scores)}`);
  console.log(pc.yellow('\nTop Leaderboard:'));
  top?.forEach((u: any, i: number) => console.log(`${i+1}. ${u.username} - ${u.high_score} pts`));
  await waitForKey();
}

async function listAuthUsers() {
  console.log(pc.yellow('\n--- USUARIOS REGISTRADOS EN AUTH ---'));
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) return console.error(pc.red('Error: ' + error.message));
  
  users.forEach((u: any) => {
    console.log(`${pc.green('•')} ${pc.cyan(u.email)} - ID: ${u.id} - Creado: ${u.created_at}`);
  });
  await waitForKey();
}

async function interactiveShell() {
  console.log(pc.magenta('\n--- SHELL INTERACTIVA MUZICMANIA ---'));
  console.log(pc.dim('Puedes ejecutar comandos JS/TS usando el cliente "supabaseAdmin".'));
  console.log(pc.dim('Ejemplo: await supabaseAdmin.from("profiles").select("*")'));
  console.log(pc.dim('Escribe "exit" para salir.\n'));

  let inShell = true;
  while (inShell) {
    const { command } = await prompts({
      type: 'text',
      name: 'command',
      message: pc.magenta('SHELL > ')
    });

    if (!command || command.toLowerCase() === 'exit') {
      inShell = false;
      break;
    }

    try {
      // Intentar ejecutar el comando
      // Usamos una función asíncrona autoejecutable para permitir 'await'
      const result = await eval(`(async () => { return ${command}; })()`);
      console.log(pc.green('\nResultado:'));
      if (Array.isArray(result)) console.table(result);
      else console.log(result);
    } catch (err: any) {
      console.error(pc.red('\n[SHELL ERROR]: ' + err.message));
    }
  }
}

async function runManualSQL() {
  console.log(pc.red('\n--- EJECUCIÓN SQL MANUAL (AVANZADO/PELIGROSO) ---'));
  console.log(pc.dim('Nota: El Service Role Key permite bypass de RLS. Ten cuidado.\n'));
  
  const { query } = await prompts({
    type: 'text',
    name: 'query',
    message: 'Escribe tu consulta SQL (o escribe "exit" para cancelar):'
  });

  if (!query || query.toLowerCase() === 'exit') return;

  try {
    const { data, error } = await supabaseAdmin.rpc('execute_sql_query', { sql_command: query });
    
    if (error) throw error;
    console.log(pc.green('\n[EXITO] Resultado:'));
    if (data && Array.isArray(data)) console.table(data);
    else console.log(data);
  } catch (err: any) {
    console.error(pc.red('\n[ERROR]: ' + err.message));
    console.log(pc.yellow('\nTip: Asegúrate de tener la función RPC "execute_sql_query" configurada en Supabase o usa el Shell Interactiva para consultas ORM.'));
  }
  await waitForKey();
}

const waitForKey = () => new Promise<void>(resolve => {
  console.log(pc.dim('\nPresiona Enter para continuar...'));
  process.stdin.once('data', () => resolve());
});
