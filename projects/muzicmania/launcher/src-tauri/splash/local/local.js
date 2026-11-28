/* MuzicMania Offline · shell local.
 * Reutiliza el motor de offline-game.js y añade hub, niveles locales,
 * canciones locales, inventario y almacenamiento persistente.
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var STORE_KEY = 'muzicmania.local.v1';
  var AUDIO_DB = 'muzicmania-local-audio';
  var AUDIO_STORE = 'audio';
  var MAX_NOTES = 10000;
  var MAX_AUDIO_BYTES = 50 * 1024 * 1024;

  var store = { levels: [], settings: {}, createdAt: Date.now() };
  var statusTimer = null;

  function safeParse(value, fallback) {
    try { return JSON.parse(value); } catch (e) { return fallback; }
  }

  function loadStore() {
    var parsed = safeParse(localStorage.getItem(STORE_KEY) || 'null', null);
    if (parsed && Array.isArray(parsed.levels)) {
      store = { levels: parsed.levels, settings: parsed.settings || {}, createdAt: parsed.createdAt || Date.now() };
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      return true;
    } catch (e) {
      setStatus('No se pudieron guardar los datos locales. Revisa el espacio del equipo.', true);
      return false;
    }
  }

  function setStatus(text, error) {
    var elements = [$('local-status'), $('editor-status')];
    elements.forEach(function (el) {
      if (!el) return;
      el.textContent = text || '';
      el.style.color = error ? '#ff6b7a' : '';
    });
    clearTimeout(statusTimer);
    if (text) statusTimer = setTimeout(function () {
      elements.forEach(function (el) { if (el) el.textContent = ''; });
    }, 6000);
  }

  function openAudioDb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('IndexedDB no disponible'));
      var req = indexedDB.open(AUDIO_DB, 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains(AUDIO_STORE)) req.result.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('No se pudo abrir IndexedDB')); };
    });
  }

  async function putAudio(id, blob) {
    var db = await openAudioDb();
    await new Promise(function (resolve, reject) {
      var tx = db.transaction(AUDIO_STORE, 'readwrite');
      tx.objectStore(AUDIO_STORE).put({ id: id, blob: blob });
      tx.oncomplete = resolve;
      tx.onerror = function () { reject(tx.error || new Error('No se pudo guardar el audio')); };
    });
    db.close();
  }

  async function getAudio(id) {
    var db = await openAudioDb();
    var value = await new Promise(function (resolve, reject) {
      var tx = db.transaction(AUDIO_STORE, 'readonly');
      var req = tx.objectStore(AUDIO_STORE).get(id);
      req.onsuccess = function () { resolve(req.result ? req.result.blob : null); };
      req.onerror = function () { reject(req.error); };
    });
    db.close();
    return value;
  }

  async function clearAudio() {
    var db = await openAudioDb();
    await new Promise(function (resolve, reject) {
      var tx = db.transaction(AUDIO_STORE, 'readwrite');
      tx.objectStore(AUDIO_STORE).clear();
      tx.oncomplete = resolve;
      tx.onerror = function () { reject(tx.error); };
    });
    db.close();
  }

  function slug(value) {
    return String(value || 'local').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'local';
  }

  function uid() {
    return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  // Los audios oficiales viven en ../offline/music desde local/.
  var OFFICIAL_TRACKS = TRACKS.map(function (track) {
    return Object.assign({}, track, { audio: '../' + track.audio, kind: 'official' });
  });

  function officialById(id) {
    return OFFICIAL_TRACKS.filter(function (track) { return track.id === id; })[0] || null;
  }

  function normalizeNotes(raw) {
    if (!Array.isArray(raw) || raw.length === 0) throw new Error('El nivel no contiene notas.');
    if (raw.length > MAX_NOTES) throw new Error('El nivel supera el límite de ' + MAX_NOTES + ' notas.');
    var maxTime = 0;
    raw.forEach(function (note) {
      var t = Number(note && note.time);
      if (!isFinite(t) || t < 0) throw new Error('Hay una nota con tiempo inválido.');
      maxTime = Math.max(maxTime, t);
    });
    var factor = maxTime > 1000 ? 0.001 : 1;
    return raw.map(function (note) {
      var lane = Number(note.lane);
      if (!isFinite(lane) || lane < 0 || lane > 3) throw new Error('Hay una nota con carril inválido.');
      var type = note.type === 'hold' || note.type === 'mine' ? note.type : 'tap';
      var out = {
        time: Math.round(Number(note.time) * factor * 1000) / 1000,
        lane: Math.round(lane),
        type: type
      };
      if (type === 'hold' && note.endTime != null) out.endTime = Math.round(Number(note.endTime) * factor * 1000) / 1000;
      return out;
    }).sort(function (a, b) { return a.time - b.time; });
  }

  function normalizeLevel(raw, fallbackTrack) {
    if (!raw || typeof raw !== 'object') throw new Error('El archivo no es un nivel válido.');
    var notes = normalizeNotes(raw.chart && raw.chart.notes ? raw.chart.notes : raw.notes);
    var trackId = typeof raw.trackId === 'string' ? raw.trackId : (fallbackTrack ? fallbackTrack.id : null);
    var base = trackId ? officialById(trackId) : fallbackTrack || null;
    var title = String(raw.title || raw.name || 'Nivel local').trim().slice(0, 80) || 'Nivel local';
    var artist = String(raw.artist || (base ? base.artist : 'Local')).trim().slice(0, 80) || 'Local';
    var bpm = Number(raw.bpm || (base ? base.bpm : 120));
    if (!isFinite(bpm) || bpm < 40 || bpm > 320) bpm = 120;
    var duration = Number(raw.duration || (base ? base.duration : 0));
    if (!isFinite(duration) || duration <= 0) {
      duration = notes[notes.length - 1].time + 2;
    }
    var difficulty = ['Easy', 'Normal', 'Hard', 'Expert'].indexOf(raw.difficulty) >= 0 ? raw.difficulty : selectedDifficulty;
    return {
      id: uid(),
      title: title,
      artist: artist,
      trackId: trackId,
      difficulty: difficulty,
      bpm: bpm,
      duration: Math.max(5, Math.min(900, duration)),
      chart: { formatVersion: '1.0', offset: 0, notes: notes },
      createdAt: Date.now()
    };
  }

  async function trackFromLevel(level) {
    var base = level.trackId ? officialById(level.trackId) : null;
    var audio = base ? base.audio : '';
    if (level.audioId) {
      try {
        var blob = await getAudio(level.audioId);
        if (blob) audio = URL.createObjectURL(blob);
      } catch (e) {
        audio = '';
      }
    }
    if (!audio) return null;
    return {
      id: level.id,
      name: level.title,
      artist: level.artist,
      duration: level.duration,
      bpm: level.bpm,
      color: base ? base.color : '#0f9eff',
      audio: audio,
      chart: level.chart,
      kind: 'local',
      local: true
    };
  }

  async function rebuildTracks() {
    TRACKS.length = 0;
    OFFICIAL_TRACKS.forEach(function (track) { TRACKS.push(Object.assign({}, track)); });
    for (var i = 0; i < store.levels.length; i += 1) {
      var track = await trackFromLevel(store.levels[i]);
      if (track) TRACKS.push(track);
    }
    if (!selectedTrack || TRACKS.indexOf(selectedTrack) === -1) selectedTrack = TRACKS[0] || null;
    renderTracks();
    updateStats();
  }

  function updateStats() {
    var songs = store.levels.filter(function (level) { return level.audioId; }).length;
    if ($('stat-levels')) $('stat-levels').textContent = String(store.levels.length);
    if ($('stat-songs')) $('stat-songs').textContent = String(songs);
    if ($('hub-stat-levels')) $('hub-stat-levels').textContent = String(store.levels.length);
    if ($('hub-stat-songs')) $('hub-stat-songs').textContent = String(songs);
    if ($('hub-stat-official')) $('hub-stat-official').textContent = String(typeof OFFICIAL_TRACKS !== 'undefined' ? OFFICIAL_TRACKS.length : 0);
  }

  var identity = { name: 'Invitado', guest: true, avatar: '' };
  var hubNoticeTimer = null;
  var easter = {
    clicks: Number(localStorage.getItem('muzic_local_logo_clicks') || 0) || 0,
    cat: localStorage.getItem('muzic_local_cat_mode') === '1'
  };

  function readIdentity() {
    var params = new URLSearchParams(location.search);
    var queryGuest = params.get('guest');
    var storedGuest = localStorage.getItem('muzic_launcher_guest');
    if (queryGuest && /^Guest\d{6}$/.test(queryGuest)) {
      identity.guest = true;
      identity.name = queryGuest;
      try { localStorage.setItem('muzic_launcher_guest', queryGuest); } catch (e) {}
    } else if (storedGuest && /^Guest\d{6}$/.test(storedGuest)) {
      identity.guest = true;
      identity.name = storedGuest;
    } else if (!params.get('name')) {
      identity.guest = true;
      identity.name = 'Guest' + String(Math.floor(100000 + Math.random() * 900000));
      try { localStorage.setItem('muzic_launcher_guest', identity.name); } catch (e) {}
    }
    var display = params.get('name');
    if (display) {
      identity.guest = false;
      identity.name = display.slice(0, 48);
    }
    var avatar = params.get('avatar');
    if (avatar && /^https:\/\//.test(avatar)) identity.avatar = avatar;
  }

  function applyIdentity() {
    var name = identity.name || 'Invitado';
    var hubName = $('hub-guest-name');
    if (hubName) hubName.textContent = name;
    var setupName = $('setup-guest-name');
    if (setupName) setupName.textContent = name;
    var welcomeName = $('welcome-guest-name');
    if (welcomeName) welcomeName.textContent = name;
    var guestId = $('hub-guest-id');
    if (guestId) guestId.textContent = identity.guest ? '@' + name.toLowerCase() : '@' + (identity.name || '').toLowerCase();
    var p1 = $('vs-p1-name');
    if (p1) p1.textContent = name;
    var p2 = $('vs-p2-name');
    if (p2) p2.textContent = name + ' · J2';
    ['hub-avatar', 'setup-guest-avatar', 'welcome-guest-avatar'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      if (identity.avatar) {
        el.innerHTML = '';
        var image = document.createElement('img');
        image.src = identity.avatar;
        image.alt = '';
        el.appendChild(image);
      } else {
        el.textContent = name.trim().charAt(0).toUpperCase() || 'G';
      }
    });
  }

  function hubNotice(text) {
    var el = $('hub-notice');
    if (!el) return;
    clearTimeout(hubNoticeTimer);
    if (!text) { el.classList.add('hidden'); return; }
    el.textContent = text;
    el.classList.remove('hidden');
    hubNoticeTimer = setTimeout(function () { el.classList.add('hidden'); }, 6500);
  }

  function openExternalUrl(url) {
    if (!url) return;
    try {
      if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
        window.__TAURI_INTERNALS__.invoke('open_url', { url: url });
        return;
      }
    } catch (e) {}
    window.open(url, '_blank', 'noopener');
  }

  function setLocalTheme(theme) {
    var next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('muzic_launcher_theme', next); } catch (e) {}
  }

  function panelHtml(panel) {
    if (panel === 'ayuda') {
      return '<div class="kicker">AYUDA LOCAL</div><h2>Cómo jugar sin conexión</h2>'
        + '<h3>Controles</h3><ul><li><code>D F J K</code> o <code>← ↓ ↑ →</code> para las notas.</li>'
        + '<li><code>Esc</code> pausa o sale de la partida.</li><li>En 1 vs 1: J1 usa flechas y J2 usa D F J K.</li></ul>'
        + '<h3>Niveles y canciones</h3><p>Desde <strong>Modo solo</strong> puedes cargar un nivel JSON o una canción local. '
        + 'Todo queda en este equipo, dentro de IndexedDB y localStorage.</p>'
        + '<h3>Sin conexión</h3><p>La tienda, el ranking online, el foro y las salas online no están disponibles. '
        + 'Los récords locales son independientes de los online.</p>';
    }
    if (panel === 'info') {
      return '<div class="kicker">ACERCA DE</div><h2>MuzicMania Local</h2>'
        + '<p>Shell offline de MuzicMania para jugar sin internet. Reutiliza el motor de la web y guarda niveles, '
        + 'canciones, récords y ajustes en el equipo.</p>'
        + '<h3>Privacidad</h3><p>No se envía nada a ningún servidor mientras juegas en local. La telemetría del launcher '
        + 'se controla desde sus Opciones y puede desactivarse.</p>'
        + '<h3>Versión</h3><p>Launcher y motor local comparten la versión instalada de MuzicMania.</p>';
    }
    if (panel === 'creditos') {
      return '<div class="kicker">CRÉDITOS</div><h2>Hecho por Ciszu Network</h2>'
        + '<p>Dirección, diseño y desarrollo: <strong>Ciszuko Antony</strong>.</p>'
        + '<p>MuzicMania forma parte del ecosistema Ciszu Network. Motor rítmico, editor local y modo 1 vs 1 '
        + 'pensados para funcionar incluso sin conexión.</p>'
        + '<h3>Agradecimientos</h3><p>A la comunidad de MuzicMania y a todos los que prueban los niveles locales.</p>';
    }
    if (panel === 'redes') {
      return '<div class="kicker">COMUNIDAD</div><h2>Redes oficiales</h2>'
        + '<p>Estos enlaces necesitan conexión y se abren fuera del modo local.</p>'
        + '<button class="modal-link" data-external="https://discord.gg/W3kMtMMj6E">Discord <span>Comunidad</span></button>'
        + '<button class="modal-link" data-external="https://www.youtube.com/@CiszuNetwork">YouTube <span>Vídeos</span></button>'
        + '<button class="modal-link" data-external="https://x.com/CiszukoAntony">X <span>Noticias</span></button>'
        + '<button class="modal-link" data-external="https://wa.me/584126858111">WhatsApp <span>Soporte</span></button>'
        + '<button class="modal-link" data-external="https://github.com/Ciszu-Network">GitHub <span>Código</span></button>';
    }
    if (panel === 'cambios') {
      return '<div class="kicker">CAMBIOS</div><h2>Novedades del modo local</h2>'
        + '<ul><li>Hub con la misma estructura de <code>/play</code>: modos, opciones y cuenta.</li>'
        + '<li>Editor TAP/HOLD/MINE, canciones locales y 1 vs 1 en el mismo equipo.</li>'
        + '<li>Tema claro por defecto y tema oscuro desde Opciones.</li>'
        + '<li>Notificaciones y logs del launcher con búsqueda, filtros y actualizaciones.</li></ul>'
        + '<p>El historial completo está en la web oficial.</p>'
        + '<button class="modal-link" data-external="https://muzicmania.vercel.app/changelog">Abrir changelog <span>Web</span></button>';
    }
    if (panel === 'leaderboard') {
      return '<div class="kicker">RANKING</div><h2>Ranking online</h2>'
        + '<p>El ranking global requiere conexión y una cuenta CISZU ID. En modo local solo existen récords guardados en este equipo.</p>'
        + '<button class="modal-link" data-external="https://muzicmania.vercel.app/leaderboard">Abrir ranking online <span>Requiere red</span></button>';
    }
    if (panel === 'forum') {
      return '<div class="kicker">FORO</div><h2>Foro de la comunidad</h2>'
        + '<p>El foro es una función online. Puedes abrirlo en la web cuando tengas conexión.</p>'
        + '<button class="modal-link" data-external="https://muzicmania.vercel.app/forum">Abrir foro <span>Requiere red</span></button>';
    }
    if (panel === 'otros') {
      return '<div class="kicker">OTROS</div><h2>Ajustes rápidos</h2>'
        + '<div class="modal-theme-row"><span>Tema del shell local</span><button class="secondary" data-theme-toggle type="button">'
        + (document.documentElement.dataset.theme === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro') + '</button></div>'
        + '<p style="margin-top:12px">El tema también se configura en las Opciones del launcher y se aplica al abrir el modo local.</p>'
        + '<div class="modal-actions"><button class="secondary" data-panel-action="settings" type="button">Abrir configuración</button>'
        + '<button class="secondary" data-panel-action="inventory" type="button">Abrir inventario</button></div>';
    }
    if (panel === 'perfil') {
      return '<div class="kicker">PERFIL LOCAL</div><h2>' + identity.name + '</h2>'
        + '<p>' + (identity.guest ? 'Invitado local con numeración persistente.' : 'Sesión de cuenta en este equipo.') + '</p>'
        + '<p><code>' + (identity.guest ? '@' + identity.name.toLowerCase() : '@' + identity.name.toLowerCase()) + '</code></p>'
        + '<div class="modal-actions"><button class="secondary" data-panel-action="settings" type="button">Configuración</button>'
        + '<button class="secondary" data-panel-action="launcher" type="button">Volver al launcher</button></div>';
    }
    if (panel === 'idioma') {
      return '<div class="kicker">IDIOMA</div><h2>Idioma del shell local</h2>'
        + '<p>El shell local hereda el idioma configurado en las Opciones del launcher. Cambia el idioma allí y vuelve a abrir el modo local.</p>'
        + '<div class="modal-actions"><button class="secondary" data-panel-action="launcher" type="button">Abrir Opciones del launcher</button></div>';
    }
    return '<h2>—</h2>';
  }

  function closeLocalModal() {
    $('local-modal')?.classList.add('hidden');
  }

  function openLocalModal(panel) {
    var modal = $('local-modal');
    var body = $('local-modal-body');
    if (!modal || !body) return;
    body.innerHTML = panelHtml(panel);
    modal.classList.remove('hidden');
    body.querySelectorAll('[data-external]').forEach(function (button) {
      button.addEventListener('click', function () { openExternalUrl(button.getAttribute('data-external')); });
    });
    body.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        setLocalTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
        closeLocalModal();
      });
    });
    body.querySelectorAll('[data-panel-action]').forEach(function (button) {
      button.addEventListener('click', function () {
        closeLocalModal();
        var action = button.getAttribute('data-panel-action');
        if (action === 'settings') showView('settings');
        if (action === 'inventory') showView('inventory');
        if (action === 'launcher') leaveToLauncher();
      });
    });
  }

  function openHubPanel(panel) {
    if (panel === 'inventario') { showView('inventory'); return; }
    if (panel === 'historia') { hubNotice('Historia estará disponible próximamente.'); return; }
    if (panel === 'eventos') { hubNotice('Los eventos requieren conexión y estarán disponibles próximamente.'); return; }
    if (panel === 'tienda') { hubNotice('La tienda requiere conexión. En local no hay compras.'); return; }
    openLocalModal(panel);
  }

  function renderEaster() {
    var indicator = $('hub-easter');
    if (!indicator) return;
    var visible = easter.clicks > 0 || easter.cat;
    indicator.classList.toggle('hidden', !visible);
    var label = $('hub-easter-label');
    if (label) label.textContent = easter.cat ? 'MODO GATO' : 'EASTER EGG';
    var dots = document.querySelectorAll('#easter-dots i');
    dots.forEach(function (dot, index) { dot.classList.toggle('on', index < easter.clicks || easter.cat); });
    var state = $('hub-easter-state');
    if (state) state.textContent = easter.cat ? '😺 ACTIVADO' : (easter.clicks >= 3 ? '✨ COMPLETADO' : '');
    var brand = $('hub-isotipo');
    if (brand) brand.title = easter.cat ? 'MuzicMania · modo gato' : 'MuzicMania';
    renderHubNotes();
  }

  function renderHubNotes() {
    var host = $('hub-notes');
    if (!host) return;
    host.innerHTML = '';
    var symbols = easter.cat ? ['🐱', '😺', '🐈', '🐾'] : ['♪', '♫', '♬', '◆', '●', '✦'];
    for (var i = 0; i < 16; i += 1) {
      var note = document.createElement('span');
      note.className = 'hub-note' + (easter.cat ? ' cat' : '');
      note.textContent = symbols[i % symbols.length];
      note.style.left = (4 + Math.random() * 92) + '%';
      note.style.top = (8 + Math.random() * 84) + '%';
      note.style.animationDuration = (5 + Math.random() * 6).toFixed(1) + 's';
      note.style.animationDelay = (-Math.random() * 6).toFixed(1) + 's';
      host.appendChild(note);
    }
  }

  function registerEasterClick() {
    easter.clicks += 1;
    if (easter.clicks >= 3) {
      easter.cat = !easter.cat;
      easter.clicks = 0;
    }
    try {
      localStorage.setItem('muzic_local_logo_clicks', String(easter.clicks));
      localStorage.setItem('muzic_local_cat_mode', easter.cat ? '1' : '0');
    } catch (e) {}
    renderEaster();
  }

  var HUB_MODE_PREVIEWS = {
    historia: { icon: 'i-book', title: 'HISTORIA', color: '#9ca3af', desc: 'Sumérgete en la historia de MuzicMania. Descubre secretos, desbloquea canciones y avanza por capítulos.', stats: [['CAPÍTULOS', 'Sin definir'], ['SECRETOS', 'Por descubrir'], ['CANON', 'Historia principal']] },
    solo: { icon: 'i-music', title: 'MODO SOLO', color: '#68cfff', desc: 'Demuestra tu habilidad rítmica en partidas individuales. Elige entre 4 dificultades y completa cada canción al ritmo perfecto.', stats: [['ESTILO', 'Individual'], ['PRECISIÓN', 'Descripción'], ['SUPERVIVENCIA', 'Descripción']] },
    local: { icon: 'i-monitor', title: 'MODO LOCAL', color: '#68cfff', desc: 'Juega con tus niveles y configuración guardados en este equipo. Sin restricciones online; es un modo más del hub.', stats: [['ESTILO', 'Individual'], ['DATOS', 'Equipo'], ['ESTADO', 'Sin restricciones']] },
    multijugador: { icon: 'i-radio', title: 'MULTIJUGADOR', color: '#ff33cc', desc: 'Compite en el mismo equipo contra otro jugador. 1 vs 1 local con J1 y J2, sin salas ni internet.', stats: [['ESTILO', 'Competitivo'], ['MODOS', '1v1 local'], ['ESTADO', 'LOCAL']] },
    crear: { icon: 'i-customize', title: 'CREAR', color: '#10b981', desc: 'Diseña tus propios niveles con el editor integrado. Guarda, exporta y juega tus creaciones sin conexión.', stats: [['EDITOR', 'TAP · HOLD · MINE'], ['GUARDADO', 'Local'], ['SELECTORES', 'Tus niveles']] },
    eventos: { icon: 'i-trophy', title: 'EVENTOS', color: '#ff6600', desc: 'Participa en eventos por tiempo limitado. Consigue recompensas exclusivas y compite por el podio.', stats: [['RECOMPENSAS', 'Por definir'], ['DURACIÓN', 'Tiempo limitado'], ['PODIO', 'Próximamente']] },
    tienda: { icon: 'i-store', title: 'TIENDA', color: '#ffd900', desc: 'Consigue nuevos ítems y skins exclusivos. Personaliza tu experiencia al máximo.', stats: [['SKINS', 'Próximamente'], ['CANCIONES', 'Próximamente'], ['OFERTAS', 'Próximamente']] }
  };
  var HUB_OPTION_PREVIEWS = {
    inventario: { icon: 'i-backpack', title: 'INVENTARIO', color: '#ffd900', desc: 'Gestiona tus skins, efectos y objetos coleccionables.' },
    ayuda: { icon: 'i-help', title: 'AYUDA', color: '#68cfff', desc: 'Guía de controles, puntuación y mecánicas del juego.' },
    info: { icon: 'i-about', title: 'INFORMACIÓN', color: '#59b4ff', desc: 'Información general sobre MuzicMania.' },
    creditos: { icon: 'i-star', title: 'CRÉDITOS', color: '#ff33cc', desc: 'Conoce al equipo detrás de MuzicMania.' },
    leaderboard: { icon: 'i-trophy', title: 'LEADERBOARD', color: '#ffd900', desc: 'Clasificación global de los mejores jugadores.' },
    forum: { icon: 'i-forum', title: 'FORUM', color: '#68cfff', desc: 'Comunidad, discusiones y contenido del equipo.' },
    redes: { icon: 'i-discord', title: 'REDES', color: '#00ff88', desc: 'Síguenos en todas las plataformas.' },
    cambios: { icon: 'i-clock', title: 'CHANGELOG', color: '#ff6600', desc: 'Últimas actualizaciones y cambios del juego.' },
    otros: { icon: 'i-sliders', title: 'OTROS', color: '#b400ff', desc: 'Enlaces rápidos a otras secciones de la plataforma.' },
    config: { icon: 'i-settings', title: 'CONFIGURACIÓN', color: '#a855f7', desc: 'Ajusta la configuración del juego, audio, controles y apariencia.' }
  };

  function setHubPreview(kind, key) {
    var lockup = $('hub-lockup');
    var preview = $('hub-preview');
    var prompt = $('hub-prompt');
    var guest = $('hub-guest-note');
    if (!preview || !lockup) return;
    if (!key) {
      lockup.classList.remove('dimmed');
      preview.classList.add('hidden');
      prompt?.classList.remove('hidden');
      guest?.classList.remove('hidden');
      return;
    }
    var data = (kind === 'mode' ? HUB_MODE_PREVIEWS : HUB_OPTION_PREVIEWS)[key];
    if (!data) return;
    lockup.classList.add('dimmed');
    prompt?.classList.add('hidden');
    guest?.classList.add('hidden');
    preview.classList.remove('hidden');
    var icon = $('hub-preview-icon');
    if (icon) {
      icon.innerHTML = '<svg class="icon"><use href="#' + data.icon + '"></use></svg>';
      icon.style.color = data.color;
      icon.style.borderColor = data.color + '44';
      icon.style.background = data.color + '18';
    }
    var title = $('hub-preview-title');
    if (title) {
      title.textContent = data.title;
      title.style.background = 'none';
      title.style.color = data.color;
      title.style.webkitTextFillColor = data.color;
    }
    var desc = $('hub-preview-desc');
    if (desc) desc.textContent = data.desc;
    var stats = $('hub-preview-stats');
    if (stats) {
      stats.innerHTML = '';
      (data.stats || []).forEach(function (pair) {
        var item = document.createElement('div');
        var label = document.createElement('small');
        label.textContent = pair[0];
        var value = document.createElement('strong');
        value.textContent = pair[1];
        item.append(label, value);
        stats.appendChild(item);
      });
    }
  }

  function selectHubMode(mode) {
    var target = document.querySelector('.hub-mode[data-hub-mode="' + mode + '"]');
    if (target && target.classList.contains('locked')) {
      if (mode === 'historia') hubNotice('Historia estará disponible próximamente.');
      else if (mode === 'eventos') hubNotice('Los eventos requieren conexión y estarán disponibles próximamente.');
      else if (mode === 'tienda') hubNotice('La tienda requiere conexión. En local no hay compras.');
      return;
    }
    document.querySelectorAll('.hub-mode').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-hub-mode') === mode);
    });
    if (mode === 'solo' || mode === 'local') {
      showView('solo');
    } else if (mode === 'multijugador') {
      showView('versus');
    } else if (mode === 'crear') {
      openEditor();
    } else if (mode === 'historia') {
      hubNotice('Historia estará disponible próximamente.');
    } else if (mode === 'eventos') {
      hubNotice('Los eventos requieren conexión y estarán disponibles próximamente.');
    } else if (mode === 'tienda') {
      hubNotice('La tienda requiere conexión. En local no hay compras.');
    }
  }

  function updateNowPlaying() {
    var element = $('hub-nowplaying');
    if (!element) return;
    var track = selectedTrack || (typeof OFFICIAL_TRACKS !== 'undefined' ? OFFICIAL_TRACKS[0] : null);
    element.textContent = track ? track.name : 'Sin pista';
  }

  function downloadJson(payload, name) {
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function exportSelectedLevel() {
    if (!selectedTrack) return;
    var notes = selectedTrack.chart && Array.isArray(selectedTrack.chart.notes)
      ? selectedTrack.chart.notes
      : generateChart(selectedTrack.id, selectedTrack.duration, selectedTrack.bpm, selectedDifficulty).map(function (note) {
          return { time: note.time / 1000, lane: note.lane, type: 'tap' };
        });
    downloadJson({
      schemaVersion: 1,
      title: selectedTrack.name,
      artist: selectedTrack.artist,
      trackId: selectedTrack.kind === 'official' ? selectedTrack.id : null,
      difficulty: selectedDifficulty,
      bpm: selectedTrack.bpm,
      duration: selectedTrack.duration,
      chart: { formatVersion: '1.0', offset: 0, notes: notes }
    }, 'muzicmania-' + slug(selectedTrack.name) + '.json');
    setStatus('Nivel exportado. El archivo se guardó en tu equipo.');
  }

  async function importLevelFile(file) {
    if (!file) return;
    try {
      var text = await file.text();
      var raw = JSON.parse(text);
      var level = normalizeLevel(raw, selectedTrack && selectedTrack.kind === 'official' ? selectedTrack : null);
      store.levels.push(level);
      if (!saveStore()) { store.levels.pop(); return; }
      await rebuildTracks();
      setStatus('Nivel local cargado: ' + level.title);
    } catch (error) {
      setStatus('No se pudo cargar el nivel: ' + (error && error.message ? error.message : error), true);
    } finally {
      $('level-file').value = '';
    }
  }

  function readAudioDuration(url) {
    return new Promise(function (resolve) {
      var audio = new Audio();
      audio.preload = 'metadata';
      audio.onloadedmetadata = function () {
        var duration = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
        audio.src = '';
        resolve(duration);
      };
      audio.onerror = function () { resolve(0); };
      audio.src = url;
    });
  }

  async function importSongFile(file) {
    if (!file) return;
    if (!file.type || file.type.indexOf('audio/') !== 0) {
      setStatus('El archivo no es un audio válido.', true);
      $('song-file').value = '';
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      setStatus('La canción supera el límite de 50 MB para el modo local.', true);
      $('song-file').value = '';
      return;
    }
    try {
      var audioId = uid();
      await putAudio(audioId, file);
      var url = URL.createObjectURL(file);
      var duration = await readAudioDuration(url);
      URL.revokeObjectURL(url);
      if (!duration) duration = 180;
      store.levels.push({
        id: uid(),
        title: file.name.replace(/\.[^.]+$/, '').slice(0, 80) || 'Canción local',
        artist: 'Local',
        trackId: null,
        audioId: audioId,
        difficulty: selectedDifficulty,
        bpm: 120,
        duration: Math.max(5, Math.min(900, duration)),
        chart: null,
        createdAt: Date.now()
      });
      if (!saveStore()) { store.levels.pop(); return; }
      await rebuildTracks();
      setStatus('Canción local cargada. Se guardó en este equipo.');
    } catch (error) {
      setStatus('No se pudo cargar la canción: ' + (error && error.message ? error.message : error), true);
    } finally {
      $('song-file').value = '';
    }
  }

  function stopLocalGame() {
    if (typeof stopGame === 'function') stopGame();
    isRunning = false;
    isPaused = false;
    cancelAnimationFrame(raf);
    if (audio) { audio.pause(); audio = null; }
    $('results').classList.remove('active');
    $('game').classList.remove('active');
    $('menu').style.display = 'flex';
  }

  function showView(name) {
    if (name !== 'solo' && name !== 'game') stopLocalGame();
    document.querySelectorAll('.view').forEach(function (view) { view.classList.remove('active'); });
    var target = $('view-' + name);
    if (target) target.classList.add('active');
    if (name === 'solo') {
      $('menu').style.display = 'flex';
      renderTracks();
      updateStats();
    }
    if (name === 'hub') {
      setHubPreview(null, null);
      updateNowPlaying();
      updateStats();
    }
  }

  function backToHub() {
    stopLocalGame();
    $('menu').style.display = 'flex';
    showView('hub');
  }

  function leaveToLauncher() {
    try {
      if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
        window.__TAURI_INTERNALS__.invoke('offline_back_to_hub');
        return;
      }
    } catch (e) {}
    window.location.href = '../index.html?offline=1';
  }

  var editor = { notes: [], trackId: '', type: 'tap', editingId: null };
  var fileTarget = 'solo';

  function editorElements() {
    return {
      title: $('editor-title'),
      artist: $('editor-artist'),
      track: $('editor-track'),
      difficulty: $('editor-difficulty'),
      bpm: $('editor-bpm'),
      existing: $('editor-existing'),
      grid: $('editor-grid'),
      status: $('editor-status')
    };
  }

  function editorBpm() {
    var value = Number(editorElements().bpm.value);
    return isFinite(value) && value >= 40 && value <= 320 ? value : 120;
  }

  function editorStepSec() {
    return 60 / editorBpm() / 2;
  }

  function renderEditorTrackOptions() {
    var el = editorElements().track;
    if (!el) return;
    el.innerHTML = '';
    OFFICIAL_TRACKS.forEach(function (track) {
      var option = document.createElement('option');
      option.value = track.id;
      option.textContent = track.name + ' · ' + track.bpm + ' BPM';
      el.appendChild(option);
    });
    if (!editor.trackId) editor.trackId = OFFICIAL_TRACKS[0] ? OFFICIAL_TRACKS[0].id : '';
    el.value = editor.trackId;
  }

  function renderEditorExisting() {
    var el = editorElements().existing;
    if (!el) return;
    el.innerHTML = '<option value="">Nuevo nivel</option>';
    store.levels.filter(function (level) { return Boolean(level.trackId); }).forEach(function (level) {
      var option = document.createElement('option');
      option.value = level.id;
      option.textContent = level.title;
      el.appendChild(option);
    });
    if (editor.editingId) el.value = editor.editingId;
  }

  function renderEditorGrid() {
    var grid = editorElements().grid;
    if (!grid) return;
    var base = officialById(editor.trackId) || OFFICIAL_TRACKS[0];
    var stepSec = editorStepSec();
    var duration = base ? base.duration : 180;
    var steps = Math.max(1, Math.min(1200, Math.floor(duration / stepSec) + 1));
    grid.innerHTML = '';
    var fragment = document.createDocumentFragment();
    var noteMap = new Map();
    editor.notes.forEach(function (note) {
      noteMap.set(Math.round(note.time / stepSec) + ':' + note.lane, note);
    });
    for (let step = 0; step < steps; step += 1) {
      var row = document.createElement('div');
      row.className = 'editor-row';
      var time = document.createElement('span');
      time.className = 'editor-time';
      time.textContent = Math.floor(step * stepSec / 60) + ':' + String(Math.floor(step * stepSec % 60)).padStart(2, '0');
      row.appendChild(time);
      for (let lane = 0; lane < 4; lane += 1) {
        var cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'editor-cell';
        cell.dataset.step = String(step);
        cell.dataset.lane = String(lane);
        var note = noteMap.get(step + ':' + lane);
        if (note) {
          cell.classList.add('active');
          if (note.type && note.type !== 'tap') cell.classList.add(note.type);
          cell.textContent = note.type === 'hold' ? 'H' : note.type === 'mine' ? 'M' : '·';
        }
        cell.addEventListener('click', function () { toggleEditorNote(step, lane); });
        row.appendChild(cell);
      }
      fragment.appendChild(row);
    }
    grid.appendChild(fragment);
  }

  function toggleEditorNote(step, lane) {
    var stepSec = editorStepSec();
    var time = Math.round(step * stepSec * 1000) / 1000;
    var index = -1;
    for (var i = 0; i < editor.notes.length; i += 1) {
      var note = editor.notes[i];
      if (note.lane === lane && Math.abs(note.time - time) < 0.001) { index = i; break; }
    }
    if (index >= 0) {
      editor.notes.splice(index, 1);
    } else {
      if (editor.notes.length >= MAX_NOTES) {
        setStatus('El nivel alcanzó el límite de notas.', true);
        return;
      }
      var entry = { time: time, lane: lane, type: editor.type };
      if (editor.type === 'hold') entry.endTime = Math.round((time + stepSec * 2) * 1000) / 1000;
      editor.notes.push(entry);
      editor.notes.sort(function (a, b) { return a.time - b.time; });
    }
    renderEditorGrid();
  }

  function editorPayload() {
    var el = editorElements();
    var base = officialById(editor.trackId) || OFFICIAL_TRACKS[0];
    return {
      schemaVersion: 1,
      title: (el.title.value || 'Mi nivel').trim().slice(0, 80),
      artist: (el.artist.value || 'Invitado').trim().slice(0, 80),
      trackId: editor.trackId,
      difficulty: el.difficulty.value || 'Normal',
      bpm: editorBpm(),
      duration: base ? base.duration : 180,
      chart: { formatVersion: '1.0', offset: 0, notes: editor.notes }
    };
  }

  function loadEditorLevel(level) {
    if (!level) return;
    var el = editorElements();
    editor.editingId = level.id || null;
    editor.trackId = level.trackId || editor.trackId || (OFFICIAL_TRACKS[0] && OFFICIAL_TRACKS[0].id);
    editor.notes = Array.isArray(level.chart && level.chart.notes) ? level.chart.notes.slice() : [];
    el.title.value = level.title || 'Mi nivel';
    el.artist.value = level.artist || 'Invitado';
    el.difficulty.value = level.difficulty || 'Normal';
    el.bpm.value = String(level.bpm || 120);
    el.track.value = editor.trackId;
    renderEditorExisting();
    renderEditorGrid();
  }

  async function saveEditorLevel() {
    var el = editorElements();
    if (!editor.notes.length) {
      setStatus('Añade al menos una nota antes de guardar.', true);
      return null;
    }
    if (!editor.trackId) {
      setStatus('Elige una pista oficial.', true);
      return null;
    }
    var payload = editorPayload();
    var level;
    if (editor.editingId) {
      level = store.levels.filter(function (item) { return item.id === editor.editingId; })[0];
      if (!level) return null;
      Object.assign(level, payload, { updatedAt: Date.now() });
    } else {
      level = Object.assign({ id: uid(), createdAt: Date.now() }, payload);
      store.levels.push(level);
      editor.editingId = level.id;
    }
    if (!saveStore()) return null;
    await rebuildTracks();
    renderEditorExisting();
    setStatus('Nivel guardado: ' + level.title);
    return level;
  }

  function exportEditorLevel() {
    var payload = editorPayload();
    if (!payload.chart.notes.length) {
      setStatus('Añade notas antes de exportar.', true);
      return;
    }
    downloadJson(payload, 'muzicmania-' + slug(payload.title) + '.json');
    setStatus('Nivel exportado.');
  }

  async function loadEditorFile(file) {
    if (!file) return;
    try {
      var raw = JSON.parse(await file.text());
      var fallback = officialById(editor.trackId) || OFFICIAL_TRACKS[0];
      var level = normalizeLevel(raw, fallback);
      level.id = null;
      loadEditorLevel(level);
      setStatus('Nivel cargado en el editor: ' + level.title);
    } catch (error) {
      setStatus('No se pudo cargar en el editor: ' + (error && error.message ? error.message : error), true);
    } finally {
      $('level-file').value = '';
    }
  }

  function openEditor() {
    editor.trackId = editor.trackId || (OFFICIAL_TRACKS[0] && OFFICIAL_TRACKS[0].id);
    renderEditorTrackOptions();
    renderEditorExisting();
    var el = editorElements();
    if (!el.title.value) el.title.value = 'Mi nivel';
    if (!el.artist.value) el.artist.value = 'Invitado';
    renderEditorGrid();
    showView('editor');
  }

  function applyInputMode(mode) {
    var allowed = { arrows: true, wasd: true, dfjk: true };
    var selected = allowed[mode] ? mode : 'dfjk';
    inputMode = selected;
    store.settings = store.settings || {};
    store.settings.inputMode = selected;
    saveStore();
    var labels = { arrows: ['←', '↓', '↑', '→'], wasd: ['A', 'S', 'W', 'D'], dfjk: ['D', 'F', 'J', 'K'] }[selected];
    document.querySelectorAll('.input-choice').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-input') === selected);
    });
    var hint = $('control-hint');
    if (hint) hint.textContent = 'Controles: ' + labels.join(' ') + ' · Esc pausa';
    var label = $('setup-input-label');
    if (label) label.textContent = selected.toUpperCase() + ' · ' + (selected === 'arrows' ? 'flechas' : selected === 'wasd' ? 'WASD' : 'configuración clásica');
    document.querySelectorAll('.keys .key').forEach(function (element, index) {
      if (labels[index]) element.textContent = labels[index];
    });
  }

  function bind() {
    loadStore();
    $('welcome-enter').addEventListener('click', function () { showView('setup'); });
    $('welcome-exit').addEventListener('click', leaveToLauncher);
    $('setup-back').addEventListener('click', function () { showView('welcome'); });
    $('setup-exit').addEventListener('click', leaveToLauncher);
    $('setup-continue').addEventListener('click', function () { showView('hub'); });
    $('settings-controls').addEventListener('click', function () { showView('setup'); });
    document.querySelectorAll('#input-choices .input-choice').forEach(function (button) {
      button.addEventListener('click', function () { applyInputMode(button.getAttribute('data-input')); });
    });
    document.querySelectorAll('#editor-note-tools .input-choice').forEach(function (button) {
      button.addEventListener('click', function () {
        editor.type = button.getAttribute('data-note') || 'tap';
        document.querySelectorAll('#editor-note-tools .input-choice').forEach(function (item) { item.classList.toggle('active', item === button); });
      });
    });
    $('hub-settings')?.addEventListener('click', function () { showView('settings'); });
    $('hub-isotipo')?.addEventListener('click', registerEasterClick);
    $('hub-profile-card')?.addEventListener('click', function () { openHubPanel('perfil'); });
    $('hub-latest')?.addEventListener('click', function () { openHubPanel('cambios'); });
    $('hub-theme-bottom')?.addEventListener('click', function () {
      setLocalTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    $('hub-lang-bottom')?.addEventListener('click', function () { openHubPanel('idioma'); });
    document.querySelectorAll('.hub-mode').forEach(function (button) {
      var mode = button.getAttribute('data-hub-mode');
      button.addEventListener('mouseenter', function () { setHubPreview('mode', mode); });
      button.addEventListener('mouseleave', function () { setHubPreview(null, null); });
      button.addEventListener('focus', function () { setHubPreview('mode', mode); });
      button.addEventListener('blur', function () { setHubPreview(null, null); });
      button.addEventListener('click', function () { selectHubMode(mode); });
    });
    document.querySelectorAll('[data-hub-panel]').forEach(function (button) {
      var panel = button.getAttribute('data-hub-panel');
      button.addEventListener('mouseenter', function () { setHubPreview('option', panel); });
      button.addEventListener('mouseleave', function () { setHubPreview(null, null); });
      button.addEventListener('focus', function () { setHubPreview('option', panel); });
      button.addEventListener('blur', function () { setHubPreview(null, null); });
      button.addEventListener('click', function () { openHubPanel(panel); });
    });
    document.querySelectorAll('[data-external]').forEach(function (button) {
      button.addEventListener('click', function () { openExternalUrl(button.getAttribute('data-external')); });
    });
    $('local-modal-close')?.addEventListener('click', closeLocalModal);
    $('local-modal')?.addEventListener('click', function (event) {
      if (event.target === $('local-modal')) closeLocalModal();
    });
    $('solo-back').addEventListener('click', backToHub);
    $('inventory-back').addEventListener('click', function () { showView('hub'); });
    $('settings-back').addEventListener('click', function () { showView('hub'); });
    $('editor-back').addEventListener('click', function () { showView('hub'); });
    $('back-launcher').addEventListener('click', leaveToLauncher);
    $('import-level').addEventListener('click', function () { fileTarget = 'solo'; $('level-file').click(); });
    $('editor-import').addEventListener('click', function () { fileTarget = 'editor'; $('level-file').click(); });
    $('import-song').addEventListener('click', function () { $('song-file').click(); });
    $('export-level').addEventListener('click', exportSelectedLevel);
    $('level-file').addEventListener('change', function (event) {
      var file = event.target.files && event.target.files[0];
      if (fileTarget === 'editor') loadEditorFile(file);
      else importLevelFile(file);
    });
    $('song-file').addEventListener('change', function (event) { importSongFile(event.target.files && event.target.files[0]); });
    $('editor-track').addEventListener('change', function () { editor.trackId = $('editor-track').value; renderEditorGrid(); });
    $('editor-bpm').addEventListener('change', renderEditorGrid);
    $('editor-existing').addEventListener('change', function () {
      var id = $('editor-existing').value;
      if (!id) {
        editor.editingId = null;
        editor.notes = [];
        $('editor-title').value = 'Mi nivel';
        $('editor-artist').value = 'Invitado';
        renderEditorGrid();
        return;
      }
      var level = store.levels.filter(function (item) { return item.id === id; })[0];
      if (level) loadEditorLevel(level);
    });
    $('editor-clear').addEventListener('click', function () { editor.notes = []; renderEditorGrid(); setStatus('Editor limpio.'); });
    $('editor-save').addEventListener('click', function () { saveEditorLevel(); });
    $('editor-export').addEventListener('click', exportEditorLevel);
    $('editor-play').addEventListener('click', async function () {
      var level = await saveEditorLevel();
      if (!level) return;
      await rebuildTracks();
      var track = TRACKS.filter(function (item) { return item.id === level.id; })[0];
      if (!track) { setStatus('No se pudo preparar el nivel para jugar.', true); return; }
      selectedTrack = track;
      selectedDifficulty = level.difficulty || 'Normal';
      showView('solo');
      startGame();
    });
    $('editor-track').value = (OFFICIAL_TRACKS[0] && OFFICIAL_TRACKS[0].id) || '';
    $('editor-track').dispatchEvent(new Event('change'));
    $('clear-records').addEventListener('click', function () {
      Object.keys(localStorage).filter(function (key) { return key.indexOf('muzicmania.offline.best.') === 0; }).forEach(function (key) { localStorage.removeItem(key); });
      renderTracks();
      setStatus('Récords locales borrados.');
    });
    $('clear-local').addEventListener('click', async function () {
      if (!window.confirm('¿Borrar todos los niveles, canciones y récords locales? No se puede deshacer.')) return;
      localStorage.removeItem(STORE_KEY);
      try { await clearAudio(); } catch (e) {}
      store = { levels: [], settings: {}, createdAt: Date.now() };
      await rebuildTracks();
      setStatus('Datos locales borrados.');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !$('local-modal')?.classList.contains('hidden')) closeLocalModal();
    });
    $('net-badge').textContent = 'LOCAL · SIN RED';
  }

  window.MuzicLocalShell = {
    showView: showView,
    stopLocalGame: stopLocalGame,
    getTracks: function () { return TRACKS; },
    get selectedDifficulty() { return selectedDifficulty; },
    set selectedDifficulty(value) { selectedDifficulty = value; },
    refreshTracks: rebuildTracks,
    setStatus: setStatus
  };

  async function boot() {
    const embedded = window.self !== window.top;
    document.documentElement.dataset.embedded = embedded ? 'true' : 'false';
    document.body.classList.toggle('embedded', embedded);
    const queryTheme = new URLSearchParams(location.search).get('theme');
    const storedTheme = (() => { try { return localStorage.getItem('muzic_launcher_theme'); } catch { return null; } })();
    const theme = queryTheme === 'dark' || queryTheme === 'light' ? queryTheme : (storedTheme === 'dark' ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('muzic_launcher_theme', theme); } catch {}
    window.addEventListener('message', (event) => {
      if (event.data?.type !== 'muzic-theme') return;
      const next = event.data.theme === 'dark' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('muzic_launcher_theme', next); } catch {}
    });
    readIdentity();
    applyIdentity();
    bind();
    renderEaster();
    applyInputMode((store.settings && store.settings.inputMode) || 'dfjk');
    await rebuildTracks();
    updateNowPlaying();
    showView('welcome');
    if (!store.levels.length) setStatus('Modo local listo. Puedes cargar un nivel JSON o una canción desde “Modo local”.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
