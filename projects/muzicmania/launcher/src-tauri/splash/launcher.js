const $ = (id) => document.getElementById(id);
const API_BASE = 'https://muzicmania.vercel.app';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const state = {
  boot: null,
  settings: null,
  session: null,
  online: false,
  forcedOffline: false,
  update: null,
  updateFromBoot: false,
  loginPoll: null,
  tutorialIndex: 0,
  pendingLink: '',
  updating: false,
  autoApplying: false,
};

const TUTORIAL = [
  {
    icon: '✦',
    kicker: 'BIENVENIDO A MUZICMANIA',
    title: 'Tu nuevo punto de partida',
    text: 'Este launcher comprueba actualizaciones, valida tu cuenta y te deja elegir cómo entrar a MuzicMania. Todo empieza aquí.',
  },
  {
    icon: '◈',
    kicker: 'HUB PRE-GAME',
    title: 'Todo en un solo lugar',
    text: 'Desde el hub puedes jugar online, iniciar el modo offline, abrir tu cuenta, cambiar ajustes y acceder a soporte, comunidad y páginas oficiales.',
  },
  {
    icon: '◉',
    kicker: 'ONLINE / OFFLINE',
    title: 'Juega incluso sin conexión',
    text: 'Si no hay internet, el hub sigue disponible con una cuenta local de invitado y las pistas offline. Cuando vuelvas a conectarte podrás reiniciar el launcher para usar tu cuenta CISZU ID.',
  },
  {
    icon: '◇',
    kicker: 'CISZU ID',
    title: 'Una cuenta, todo tu progreso',
    text: 'Inicia sesión con CISZU ID para guardar tu progreso y ajustes. Si ya tienes sesión, el launcher la recordará la próxima vez.',
  },
];

function invoke(command, args = {}) {
  const internals = window.__TAURI_INTERNALS__;
  if (!internals || typeof internals.invoke !== 'function') {
    return Promise.reject(new Error('tauri_unavailable'));
  }
  return internals.invoke(command, args);
}

function show(id) {
  document.querySelectorAll('.view').forEach((view) => view.classList.remove('active'));
  const target = $(id);
  if (target) target.classList.add('active');
}

function setBar(id, value) {
  const bar = $(id);
  if (bar) bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function setPct(id, value) {
  setText(id, `${Math.round(Math.max(0, Math.min(100, value)))}%`);
}

function toast(message, type = '') {
  const element = $('toast');
  if (!element) return;
  element.textContent = message;
  element.className = type;
  element.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove('show'), 4200);
}

function bytes(value) {
  if (!value) return '0 MB';
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function avatarLetter(session) {
  const source = session?.display_name || session?.username || '?';
  return source.trim().charAt(0).toUpperCase() || '?';
}

function setAvatar(session) {
  const element = $('hub-avatar');
  if (!element) return;
  if (session?.avatar_url) {
    element.innerHTML = '';
    const image = document.createElement('img');
    image.src = session.avatar_url;
    image.alt = '';
    element.appendChild(image);
  } else {
    element.textContent = avatarLetter(session);
  }
}

async function checkOnline() {
  try {
    const code = Number(await invoke('server_status', { url: API_BASE })) || 0;
    return code >= 200 && code < 400;
  } catch {
    return false;
  }
}

async function boot() {
  show('view-splash');
  setBar('splash-bar', 4);
  setPct('splash-pct', 4);
  await sleep(220);
  setText('splash-status', 'LEYENDO CONFIGURACIÓN...');
  setBar('splash-bar', 14);
  setPct('splash-pct', 14);

  try {
    state.boot = await invoke('launcher_boot');
    state.settings = await invoke('get_settings');
    state.session = state.boot?.session || null;
    setText('splash-version', `V${state.boot?.version || '2.1.1'}`);
    setText('hub-version', state.boot?.version || '2.1.1');
  } catch (error) {
    setText('splash-status', 'ERROR DE INICIALIZACIÓN');
    setText('splash-note', 'No se pudo leer la configuración local. Revisa la instalación.');
    setBar('splash-bar', 100);
    setPct('splash-pct', 100);
    toast(`Launcher: ${error}`, 'error');
    return;
  }

  setText('splash-status', 'VERIFICANDO CONEXIÓN...');
  setBar('splash-bar', 28);
  setPct('splash-pct', 28);
  state.online = await checkOnline();

  setText('splash-status', 'PREPARANDO EL HUB...');
  setBar('splash-bar', 46);
  setPct('splash-pct', 46);

  if (state.settings?.auto_update !== false) {
    const shouldContinue = await runUpdateFlow(true);
    if (!shouldContinue) return;
  } else {
    setText('splash-status', 'ACTUALIZACIONES AUTOMÁTICAS DESACTIVADAS');
    await sleep(420);
  }

  setBar('splash-bar', 76);
  setPct('splash-pct', 76);
  await afterInitialization();
}

async function runUpdateFlow(fromBoot) {
  state.updateFromBoot = Boolean(fromBoot);
  await invoke('launcher_show_small');
  show('view-update');
  setText('update-title', 'Buscando actualizaciones');
  setText('update-desc', 'MuzicMania comprueba la última versión antes de abrir el hub.');
  setText('update-note', '');
  setBar('update-bar', 6);
  setPct('update-pct', 6);
  $('update-notes')?.classList.add('hidden');
  $('update-install')?.classList.add('hidden');
  $('update-skip')?.classList.add('hidden');
  $('update-retry')?.classList.add('hidden');

  let info = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      info = await invoke('launcher_check_update');
    } catch (error) {
      info = { error: String(error) };
    }
    if (!info?.error) break;
    setText('update-desc', 'No se pudo comprobar la actualización. Reintentando…');
    setText('update-note', `Intento ${attempt + 1} de 3`);
    setBar('update-bar', 12 + attempt * 12);
    setPct('update-pct', 12 + attempt * 12);
    await sleep(1100);
  }

  if (!info || info.error) {
    setText('update-title', 'Sin conexión con el actualizador');
    setText('update-desc', 'Windows no pudo consultar la actualización. Puedes reintentar o continuar en modo offline forzado.');
    setText('update-note', info?.error || 'Error de red');
    setBar('update-bar', 100);
    setPct('update-pct', 100);
    $('update-skip')?.classList.remove('hidden');
    $('update-retry')?.classList.remove('hidden');
    $('update-spinner')?.classList.add('hidden');
    return false;
  }

  if (!info.available) {
    setText('update-title', 'MuzicMania está actualizado');
    setText('update-desc', `Versión instalada: ${info.current}. No hay actualizaciones pendientes.`);
    setBar('update-bar', 100);
    setPct('update-pct', 100);
    $('update-spinner')?.classList.add('hidden');
    await sleep(700);
    if (fromBoot) {
      await afterInitialization();
    } else {
      showHub();
    }
    return false;
  }

  state.update = info;
  setText('update-title', `Actualización ${info.latest}`);
  setText('update-desc', `Preparando ${bytes(info.size)} para actualizar desde ${info.current}.`);
  setText('update-note', 'La descarga se reanudará automáticamente si falla la red.');
  $('update-spinner')?.classList.remove('hidden');
  $('update-notes')?.classList.remove('hidden');
  setText('update-notes', info.notes || 'Notas de la versión disponibles en GitHub.');
  setBar('update-bar', 16);
  setPct('update-pct', 16);

  try {
    await invoke('launcher_start_update', {
      url: info.url,
      size: info.size,
      version: info.latest,
    });
    await waitForDownload();
  } catch (error) {
    setText('update-title', 'Error al descargar');
    setText('update-desc', 'La descarga no pudo iniciarse. Reintenta o continúa en modo offline forzado.');
    setText('update-note', String(error));
    $('update-skip')?.classList.remove('hidden');
    $('update-retry')?.classList.remove('hidden');
    $('update-spinner')?.classList.add('hidden');
  }
  return false;
}

async function waitForDownload() {
  while (true) {
    const status = await invoke('launcher_update_progress');
    const total = Number(status.total) || 0;
    const downloaded = Number(status.downloaded) || 0;
    const percent = total > 0 ? (downloaded / total) * 100 : 20;
    setBar('update-bar', Math.max(16, Math.min(96, percent)));
    setPct('update-pct', Math.max(16, Math.min(99, percent)));
    setText('update-desc', `Descargando actualización… ${bytes(downloaded)}${total ? ` / ${bytes(total)}` : ''}`);
    if (status.state === 'ready') {
      setBar('update-bar', 100);
      setPct('update-pct', 100);
      setText('update-title', 'Actualización lista');
      setText('update-desc', 'Cierra el launcher y aplica la actualización. Windows puede pedir permisos de administrador.');
      setText('update-note', 'Se descargó de forma segura desde GitHub Releases.');
      $('update-spinner')?.classList.add('hidden');
      $('update-install')?.classList.remove('hidden');
      $('update-retry')?.classList.add('hidden');
      $('update-skip')?.classList.add('hidden');
      await maybeAutoInstall();
      return;
    }
    if (status.state === 'error') {
      setText('update-title', 'Error al descargar');
      setText('update-desc', 'La descarga se interrumpió. Puedes reintentar o continuar en modo offline forzado.');
      setText('update-note', status.error || 'Error de red');
      setBar('update-bar', 100);
      setPct('update-pct', 100);
      $('update-spinner')?.classList.add('hidden');
      $('update-skip')?.classList.remove('hidden');
      $('update-retry')?.classList.remove('hidden');
      return;
    }
    await sleep(350);
  }
}

async function maybeAutoInstall() {
  if (!state.updateFromBoot || state.settings?.auto_update === false || state.autoApplying) {
    return;
  }
  state.autoApplying = true;
  for (let seconds = 5; seconds > 0; seconds -= 1) {
    setText('update-note', `Actualización automática: instalando en ${seconds}s…`);
    await sleep(1000);
  }
  if (!state.autoApplying) return;
  await invoke('launcher_apply_update').catch((error) => {
    state.autoApplying = false;
    toast(String(error), 'error');
  });
}

async function skipUpdate() {
  state.forcedOffline = true;
  state.online = false;
  setText('update-title', 'Modo offline forzado');
  setText('update-desc', 'El launcher continuará sin comprobar red. Podrás reiniciarlo en modo online desde el hub.');
  await sleep(500);
  if (state.updateFromBoot) {
    await afterInitialization();
  } else {
    showHub();
  }
}

async function afterInitialization() {
  setBar('splash-bar', 90);
  setPct('splash-pct', 90);
  if (state.boot?.first_run && !state.boot?.tutorial_done) {
    showTutorial();
    return;
  }
  await afterTutorial();
}

async function afterTutorial() {
  state.session = await invoke('launcher_session').catch(() => state.session);
  if (!state.online || state.forcedOffline) {
    if (!state.session) {
      state.session = await invoke('launcher_guest').catch(() => null);
    }
    showHub();
    return;
  }
  if (!state.session || state.session.guest) {
    showLogin();
    return;
  }
  showHub();
}

function showTutorial() {
  invoke('launcher_show_small').catch(() => {});
  state.tutorialIndex = 0;
  renderTutorial();
  show('view-tutorial');
}

function renderTutorial() {
  const step = TUTORIAL[state.tutorialIndex];
  if (!step) return;
  setText('tutorial-icon', step.icon);
  setText('tutorial-kicker', step.kicker);
  setText('tutorial-title', step.title);
  setText('tutorial-text', step.text);
  const dots = $('tutorial-dots');
  if (dots) {
    dots.innerHTML = '';
    TUTORIAL.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = index === state.tutorialIndex ? 'active' : '';
      dot.setAttribute('aria-label', `Paso ${index + 1}`);
      dot.addEventListener('click', () => {
        state.tutorialIndex = index;
        renderTutorial();
      });
      dots.appendChild(dot);
    });
  }
  $('tutorial-back')?.classList.toggle('hidden', state.tutorialIndex === 0);
  $('tutorial-next').textContent = state.tutorialIndex === TUTORIAL.length - 1 ? 'Entrar al hub' : 'Continuar';
}

async function finishTutorial() {
  await invoke('launcher_mark_tutorial_done').catch(() => {});
  if (state.boot) state.boot.tutorial_done = true;
  await afterTutorial();
}

function showLogin() {
  invoke('launcher_show_small').catch(() => {});
  stopLoginPoll();
  show('view-login');
  const chip = $('login-online-chip');
  if (chip) {
    chip.textContent = state.online ? 'Servicio disponible' : 'Sin conexión';
    chip.className = `login-chip ${state.online ? 'online' : 'offline'}`;
  }
  setText('login-status', state.online
    ? 'Se abrirá el login oficial de CISZU ID. No necesitas registrarte de nuevo.'
    : 'No hay conexión. Puedes continuar como invitado local o reintentar desde el hub.');
  $('login-open')?.toggleAttribute('disabled', !state.online);
}

function startLoginPoll() {
  stopLoginPoll();
  state.loginPoll = setInterval(async () => {
    try {
      const session = await invoke('launcher_session');
      if (session && !session.guest) {
        state.session = session;
        stopLoginPoll();
        showHub();
      }
    } catch {}
  }, 1000);
}

function stopLoginPoll() {
  if (state.loginPoll) {
    clearInterval(state.loginPoll);
    state.loginPoll = null;
  }
}

async function showHub() {
  stopLoginPoll();
  await invoke('launcher_show_hub').catch(() => {});
  show('view-hub');
  renderHub();
}

function renderHub() {
  const online = state.online && !state.forcedOffline;
  const session = state.session;
  const status = $('hub-status');
  if (status) {
    status.textContent = online ? 'Online' : 'Offline';
    status.className = `status-pill ${online ? 'online' : 'offline'}`;
  }
  setText('hub-kicker', state.boot?.first_run ? 'BIENVENIDO A MUZICMANIA' : 'BIENVENIDO DE VUELTA');
  const name = session?.display_name || session?.username || 'Invitado';
  setText('hub-welcome', state.boot?.first_run
    ? 'Tu launcher está listo. Elige cómo quieres entrar al juego.'
    : `Hola de nuevo, ${name}. Elige cómo quieres entrar al juego.`);
  setText('hub-account-name', session?.guest ? 'Invitado' : name);
  setText('account-who', session?.guest ? 'Invitado' : name);
  setText('account-sub', session?.guest
    ? (online ? 'Sesión local · inicia sesión cuando quieras' : 'Sesión local offline')
    : `@${session?.username || 'usuario'} · CISZU ID`);
  setAvatar(session);

  $('account-login')?.classList.toggle('hidden', !session?.guest || !online);
  $('account-profile')?.classList.toggle('hidden', Boolean(session?.guest));
  $('account-logout')?.classList.toggle('hidden', Boolean(session?.guest));

  const playOnline = $('hub-play-online');
  if (playOnline) {
    playOnline.disabled = !online;
    playOnline.textContent = online ? 'Jugar online' : 'Online no disponible';
  }
  $('hub-restart-online')?.classList.toggle('hidden', online);
  setText('hub-disclaimer', online
    ? 'Conexión disponible. El modo online sincroniza tu cuenta; el offline usa las pistas locales.'
    : 'Sin conexión con el servicio. El modo offline está disponible y no requiere internet.');
  setText('hub-session-note', session?.guest
    ? 'Invitado local. No hay cuenta online vinculada.'
    : `Sesión recordada: ${session?.email || name}.`);
  setText('hub-version', state.boot?.version || '2.1.1');

  if (state.settings) {
    const auto = $('setting-auto-update');
    if (auto) auto.checked = state.settings.auto_update !== false;
    const close = $('setting-close-confirm');
    if (close) close.checked = state.settings.close_confirm !== false;
    const link = $('setting-link-confirm');
    if (link) link.checked = state.settings.link_confirm !== false;
  }
}

async function persistSettings(patch = {}) {
  state.settings = { ...(state.settings || {}), ...patch };
  try {
    await invoke('update_settings', { settings: state.settings });
  } catch (error) {
    toast(`No se pudieron guardar los ajustes: ${error}`, 'error');
  }
}

async function logout() {
  await invoke('launcher_logout').catch(() => {});
  state.session = null;
  if (!state.online || state.forcedOffline) {
    state.session = await invoke('launcher_guest').catch(() => null);
    showHub();
    return;
  }
  showLogin();
}

function openExternal(url) {
  if (state.settings?.link_confirm === false) {
    invoke('open_url', { url }).catch(() => {});
    return;
  }
  state.pendingLink = url;
  setText('link-dialog-url', url);
  $('link-dialog')?.classList.remove('hidden');
}

async function restartLauncher() {
  await invoke('launcher_restart').catch(() => {});
}

window.showCloseDialog = function () {
  if (state.settings && state.settings.close_confirm === false) {
    invoke('launcher_close').catch(() => {});
    return;
  }
  $('close-dialog')?.classList.remove('hidden');
};

function bind() {
  $('update-retry')?.addEventListener('click', () => {
    runUpdateFlow(state.updateFromBoot);
  });
  $('update-skip')?.addEventListener('click', skipUpdate);
  $('update-install')?.addEventListener('click', () => {
    if (state.autoApplying) return;
    state.autoApplying = true;
    invoke('launcher_apply_update').catch((error) => {
      state.autoApplying = false;
      toast(String(error), 'error');
    });
  });

  $('tutorial-back')?.addEventListener('click', () => {
    if (state.tutorialIndex > 0) {
      state.tutorialIndex -= 1;
      renderTutorial();
    }
  });
  $('tutorial-next')?.addEventListener('click', async () => {
    if (state.tutorialIndex < TUTORIAL.length - 1) {
      state.tutorialIndex += 1;
      renderTutorial();
      return;
    }
    await finishTutorial();
  });
  $('tutorial-skip')?.addEventListener('click', finishTutorial);

  $('login-open')?.addEventListener('click', async () => {
    if (!state.online) {
      toast('Sin conexión: inicia el launcher en modo online para usar CISZU ID.', 'error');
      return;
    }
    setText('login-status', 'Esperando el login oficial de CISZU ID…');
    $('login-open').disabled = true;
    try {
      await invoke('launcher_open_login');
      startLoginPoll();
    } catch (error) {
      setText('login-status', `No se pudo abrir CISZU ID: ${error}`);
      $('login-open').disabled = false;
    }
  });
  $('login-guest')?.addEventListener('click', async () => {
    state.session = await invoke('launcher_guest').catch(() => null);
    showHub();
  });

  $('hub-play-online')?.addEventListener('click', () => {
    if (!state.online || state.forcedOffline) {
      toast('El servicio online no está disponible. Usa el modo offline.', 'error');
      return;
    }
    invoke('launcher_ready').catch((error) => toast(String(error), 'error'));
  });
  $('hub-play-offline')?.addEventListener('click', async () => {
    await invoke('launcher_offline_game').catch(() => {});
    window.location.href = 'offline.html';
  });
  $('hub-restart-online')?.addEventListener('click', restartLauncher);
  $('settings-restart')?.addEventListener('click', restartLauncher);
  $('settings-pin')?.addEventListener('click', () => {
    invoke('launcher_pin_taskbar').catch((error) => toast(String(error), 'error'));
  });
  $('hub-refresh')?.addEventListener('click', async () => {
    state.online = await checkOnline();
    renderHub();
  });

  $('account-login')?.addEventListener('click', showLogin);
  $('account-profile')?.addEventListener('click', () => {
    const username = state.session?.username;
    openExternal(username
      ? `${API_BASE}/profile/@${encodeURIComponent(username)}`
      : `${API_BASE}/login`);
  });
  $('account-logout')?.addEventListener('click', logout);

  $('setting-auto-update')?.addEventListener('change', (event) => {
    persistSettings({ auto_update: Boolean(event.target.checked) });
  });
  $('setting-close-confirm')?.addEventListener('change', (event) => {
    persistSettings({ close_confirm: Boolean(event.target.checked) });
  });
  $('setting-link-confirm')?.addEventListener('change', (event) => {
    persistSettings({ link_confirm: Boolean(event.target.checked) });
  });
  $('settings-check-update')?.addEventListener('click', async () => {
    const result = await runUpdateFlow(false);
    if (result) showHub();
  });

  document.querySelectorAll('[data-url]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      openExternal(element.getAttribute('href') || '');
    });
  });

  $('link-cancel')?.addEventListener('click', () => {
    state.pendingLink = '';
    $('link-dialog')?.classList.add('hidden');
  });
  $('link-confirm')?.addEventListener('click', () => {
    const url = state.pendingLink;
    state.pendingLink = '';
    $('link-dialog')?.classList.add('hidden');
    if (url) invoke('open_url', { url }).catch(() => {});
  });

  $('close-cancel')?.addEventListener('click', () => {
    $('close-dialog')?.classList.add('hidden');
    invoke('launcher_cancel_close').catch(() => {});
  });
  $('close-confirm')?.addEventListener('click', () => {
    invoke('launcher_close').catch(() => {});
  });

  $('settings-close')?.addEventListener('click', () => $('settings-modal')?.classList.add('hidden'));
  $('settings-save')?.addEventListener('click', async () => {
    await persistSettings({
      auto_update: $('modal-auto-update')?.checked !== false,
      close_confirm: $('modal-close-confirm')?.checked !== false,
      link_confirm: $('modal-link-confirm')?.checked !== false,
    });
    $('settings-modal')?.classList.add('hidden');
    renderHub();
  });
}

bind();
boot();
