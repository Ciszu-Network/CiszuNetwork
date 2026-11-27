/* MuzicMania Offline · 1 vs 1 local (mismo equipo, sin red). */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var shell = window.MuzicLocalShell;
  var selectedTrack = null;
  var selectedDifficulty = 'Normal';
  var running = false;
  var paused = false;
  var audio = null;
  var raf = 0;
  var p1 = null;
  var p2 = null;

  function newPlayer(name) {
    return {
      name: name,
      notes: [],
      score: 0,
      combo: 0,
      maxCombo: 0,
      misses: 0,
      hits: { Perfect: 0, Great: 0, Good: 0, Bad: 0 }
    };
  }

  function accuracy(player) {
    var total = player.hits.Perfect + player.hits.Great + player.hits.Good + player.hits.Bad + player.misses;
    if (!total) return 100;
    var points = player.hits.Perfect * 100 + player.hits.Great * 80 + player.hits.Good * 55 + player.hits.Bad * 25;
    return Math.max(0, Math.round((points / (total * 100)) * 100));
  }

  function renderLobby() {
    var tracks = shell ? shell.getTracks() : [];
    var list = $('versus-track-list');
    if (!list) return;
    list.innerHTML = '';
    if (!tracks.length) {
      list.innerHTML = '<p class="hint">No hay pistas locales disponibles.</p>';
      $('versus-start').disabled = true;
      return;
    }
    if (!selectedTrack || tracks.indexOf(selectedTrack) === -1) selectedTrack = tracks[0];
    tracks.forEach(function (track) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'track' + (selectedTrack && track.id === selectedTrack.id ? ' selected' : '');
      button.style.setProperty('--accent', track.color || '#0f9eff');
      var cover = document.createElement('span');
      cover.className = 'cover';
      cover.textContent = '♪';
      var copy = document.createElement('span');
      var name = document.createElement('span');
      name.className = 'tname';
      name.textContent = track.name;
      var meta = document.createElement('span');
      meta.className = 'tmeta';
      meta.textContent = (track.artist || 'Local') + ' · ' + (track.bpm || 120) + ' BPM · ' + Math.floor((track.duration || 0) / 60) + ':' + String(Math.floor((track.duration || 0) % 60)).padStart(2, '0');
      copy.appendChild(name);
      copy.appendChild(meta);
      var badge = document.createElement('span');
      badge.className = 'best';
      badge.textContent = track.local ? 'LOCAL' : 'OFICIAL';
      button.appendChild(cover);
      button.appendChild(copy);
      button.appendChild(badge);
      button.addEventListener('click', function () {
        selectedTrack = track;
        renderLobby();
      });
      list.appendChild(button);
    });
    $('versus-start').disabled = !selectedTrack;
  }

  function buildChart(track) {
    var base;
    if (track.chart && Array.isArray(track.chart.notes)) {
      base = track.chart.notes.map(function (note) {
        return { time: Number(note.time) * 1000, lane: Number(note.lane) || 0 };
      });
    } else {
      base = generateChart(track.id, track.duration, track.bpm, selectedDifficulty);
    }
    return base.map(function (note) {
      return { time: note.time, lane: note.lane, hit: false, missed: false };
    });
  }

  function resetPlayers(track) {
    p1 = newPlayer('J1');
    p2 = newPlayer('J2');
    p1.notes = buildChart(track);
    p2.notes = buildChart(track);
  }

  function updateHud() {
    $('vs-p1-score').textContent = formatNumber(p1.score);
    $('vs-p2-score').textContent = formatNumber(p2.score);
    $('vs-p1-combo').textContent = p1.combo;
    $('vs-p2-combo').textContent = p2.combo;
  }

  function showJudgement(player, label, color) {
    var element = $('vs-judgement');
    if (!element) return;
    element.textContent = player + ' · ' + label;
    element.style.color = color;
    element.classList.remove('show');
    void element.offsetWidth;
    element.classList.add('show');
  }

  function press(player, lane) {
    if (!running || paused || !audio) return;
    var state = player === 1 ? p1 : p2;
    var time = audio.currentTime * 1000;
    var best = null;
    var bestDelta = Infinity;
    for (var i = 0; i < state.notes.length; i += 1) {
      var note = state.notes[i];
      if (note.lane !== lane || note.hit || note.missed) continue;
      var delta = Math.abs(note.time - time);
      if (delta < bestDelta) { bestDelta = delta; best = note; }
    }
    if (!best || bestDelta > 170) return;
    best.hit = true;
    var label = 'Bad';
    var color = '#9ba1b8';
    var value = 100;
    if (bestDelta <= 45) { label = 'Perfect'; color = '#2ed573'; value = 1000; }
    else if (bestDelta <= 85) { label = 'Great'; color = '#0f9eff'; value = 700; }
    else if (bestDelta <= 125) { label = 'Good'; color = '#b026ff'; value = 450; }
    state.hits[label] += 1;
    state.score += value;
    state.combo += 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    showJudgement('J' + player, label, color);
    updateHud();
  }

  function resizeCanvas() {
    var canvas = $('versus-canvas');
    if (!canvas) return null;
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var width = Math.max(1, Math.floor(rect.width * dpr));
    var height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, width: rect.width, height: rect.height };
  }

  function drawHalf(ctx, startX, width, height, time, player, accent, label) {
    var laneWidth = Math.min(88, Math.max(46, width / 6.2));
    var boardWidth = laneWidth * 4;
    var x0 = startX + (width - boardWidth) / 2;
    var hitY = height - 62;
    var colors = player === 1
      ? ['#0f9eff', '#59b4ff', '#00d4ff', '#2ed573']
      : ['#ff20bf', '#b026ff', '#ff33cc', '#ff6b7a'];
    ctx.fillStyle = 'rgba(255,255,255,.015)';
    ctx.fillRect(startX, 0, width, height);
    for (var lane = 0; lane < 4; lane += 1) {
      var x = x0 + lane * laneWidth;
      ctx.fillStyle = lane % 2 === 0 ? 'rgba(255,255,255,.012)' : 'rgba(255,255,255,.026)';
      ctx.fillRect(x, 0, laneWidth, height);
      ctx.strokeStyle = 'rgba(255,255,255,.055)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.09)';
    ctx.beginPath(); ctx.moveTo(x0 + boardWidth, 0); ctx.lineTo(x0 + boardWidth, height); ctx.stroke();
    var state = player === 1 ? p1 : p2;
    for (var i = 0; i < state.notes.length; i += 1) {
      var note = state.notes[i];
      if (note.hit || note.missed) continue;
      var y = hitY - (note.time - time) * 0.52;
      if (y < -24 || y > height + 24) continue;
      var cx = x0 + note.lane * laneWidth + laneWidth / 2;
      ctx.shadowBlur = 16;
      ctx.shadowColor = colors[note.lane];
      ctx.fillStyle = colors[note.lane];
      ctx.beginPath();
      ctx.moveTo(cx, y - 13); ctx.lineTo(cx + 11, y); ctx.lineTo(cx, y + 13); ctx.lineTo(cx - 11, y);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.strokeStyle = accent + 'aa';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, hitY); ctx.lineTo(x0 + boardWidth, hitY); ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = '800 10px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(label, startX + width / 2, 18);
    var keys = player === 1 ? ['←', '↓', '↑', '→'] : ['D', 'F', 'J', 'K'];
    for (var k = 0; k < 4; k += 1) {
      var kx = x0 + k * laneWidth + laneWidth / 2;
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.font = '700 9px Segoe UI';
      ctx.fillText(keys[k], kx, hitY + 18);
      ctx.strokeStyle = colors[k] + '55';
      ctx.strokeRect(x0 + k * laneWidth + 6, hitY - 3, laneWidth - 12, 6);
    }
  }

  function draw() {
    var canvas = $('versus-canvas');
    if (!canvas || !running) return;
    var size = resizeCanvas();
    if (!size) return;
    var ctx = size.ctx;
    ctx.clearRect(0, 0, size.width, size.height);
    var time = audio ? audio.currentTime * 1000 : 0;
    [p1, p2].forEach(function (state) {
      for (var i = 0; i < state.notes.length; i += 1) {
        var note = state.notes[i];
        if (!note.hit && !note.missed && time > note.time + 170) {
          note.missed = true;
          state.misses += 1;
          state.combo = 0;
          updateHud();
        }
      }
    });
    var half = size.width / 2;
    drawHalf(ctx, 0, half, size.height, time, 1, '#0f9eff', 'J1 · INVITADO');
    drawHalf(ctx, half, half, size.height, time, 2, '#ff20bf', 'J2 · INVITADO');
    ctx.strokeStyle = 'rgba(255,255,255,.1)';
    ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, size.height); ctx.stroke();
    if (audio && (audio.ended || (audio.duration && audio.currentTime >= audio.duration - 0.05))) {
      finish();
      return;
    }
    raf = requestAnimationFrame(draw);
  }

  function start() {
    if (!selectedTrack || !shell) return;
    resetPlayers(selectedTrack);
    paused = false;
    running = true;
    audio = new Audio(selectedTrack.audio);
    audio.volume = 0.8;
    audio.addEventListener('error', function () { shell.setStatus('No se pudo reproducir el audio de la pista.', true); });
    audio.play().catch(function () {});
    $('versus-results').classList.remove('active');
    $('versus-game').classList.add('active');
    $('vs-pause').textContent = 'Pausa';
    updateHud();
    resizeCanvas();
    raf = requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    paused = false;
    cancelAnimationFrame(raf);
    if (audio) { audio.pause(); audio = null; }
    $('versus-results').classList.remove('active');
    $('versus-game').classList.remove('active');
    $('vs-pause').textContent = 'Pausa';
  }

  function finish() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    if (audio) audio.pause();
    var winner = p1.score === p2.score ? 'EMPATE' : p1.score > p2.score ? 'J1' : 'J2';
    $('vs-result-title').textContent = selectedTrack.name + ' · ' + selectedDifficulty;
    $('vs-winner').textContent = winner;
    $('vs-result-p1').textContent = formatNumber(p1.score) + ' · ' + accuracy(p1) + '%';
    $('vs-result-p2').textContent = formatNumber(p2.score) + ' · ' + accuracy(p2) + '%';
    $('versus-results').classList.add('active');
    try {
      localStorage.setItem('muzicmania.local.versus.' + selectedTrack.id + '.' + selectedDifficulty, JSON.stringify({
        p1: p1.score, p2: p2.score, winner: winner, date: new Date().toISOString()
      }));
    } catch (e) {}
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    if (paused) {
      if (audio) audio.pause();
      cancelAnimationFrame(raf);
      $('vs-pause').textContent = 'Continuar';
    } else {
      if (audio) audio.play().catch(function () {});
      $('vs-pause').textContent = 'Pausa';
      raf = requestAnimationFrame(draw);
    }
  }

  function bind() {
    if (!shell) return;
    var hub = $('hub-multi');
    if (hub) hub.addEventListener('click', function () { shell.showView('versus'); renderLobby(); });
    $('versus-back').addEventListener('click', function () { shell.showView('hub'); });
    document.querySelectorAll('.vs-diff').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('.vs-diff').forEach(function (item) { item.classList.remove('active'); });
        button.classList.add('active');
        selectedDifficulty = button.getAttribute('data-diff');
        renderLobby();
      });
    });
    $('versus-start').addEventListener('click', start);
    $('vs-pause').addEventListener('click', togglePause);
    $('vs-exit').addEventListener('click', function () { stop(); shell.showView('hub'); });
    $('vs-rematch').addEventListener('click', function () { $('versus-results').classList.remove('active'); start(); });
    $('vs-lobby').addEventListener('click', function () { stop(); shell.showView('versus'); renderLobby(); });
    $('vs-hub').addEventListener('click', function () { stop(); shell.showView('hub'); });
    window.addEventListener('resize', function () { if (running) resizeCanvas(); });
    document.addEventListener('keydown', function (event) {
      if (!running) return;
      var key = event.key.toLowerCase();
      var lane = null;
      var player = 1;
      if (key.indexOf('arrow') === 0) {
        lane = { arrowleft: 0, arrowdown: 1, arrowup: 2, arrowright: 3 }[key];
      } else {
        lane = { d: 0, f: 1, j: 2, k: 3 }[key];
        player = 2;
      }
      if (lane !== undefined && lane !== null) {
        event.preventDefault();
        press(player, lane);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        togglePause();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
