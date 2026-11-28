/*
 * Motor del modo local de MuzicMania.
 *
 * Replica las constantes y el flujo de `useGameEngine` de la web: ventanas de
 * juicio, puntuación, vida, holds, minas, KPS, precisión, pausa con cuenta
 * atrás y auto-pausa al perder el foco. El chart oficial se genera con el
 * mismo algoritmo y la misma semilla que `src/data/charts.ts`.
 */
var TRACKS = [
  { id: "oled_darkness", name: "OLED Darkness", artist: "CiszukoAntony", duration: 301, bpm: 110, color: "#59b4ff", audio: "offline/music/oled_darkness.opus" },
  { id: "neon_dreams", name: "Neon Dreams", artist: "CiszukoAntony", duration: 225, bpm: 124, color: "#68cfff", audio: "offline/music/neon_dreams.opus" },
  { id: "digital_soul", name: "Digital Soul", artist: "CiszukoAntony", duration: 252, bpm: 128, color: "#b400ff", audio: "offline/music/digital_soul.opus" },
  { id: "cyber_beat", name: "Cyber Beat", artist: "CiszukoAntony", duration: 208, bpm: 140, color: "#ff33cc", audio: "offline/music/cyber_beat.opus" }
];

var isRunning = false;
var isPaused = false;
var selectedTrack = TRACKS[0];
var selectedDifficulty = "Normal";
var inputMode = "dfjk";

var GAME_CONFIG = {
  lanes: 4,
  hitZoneRatio: 0.82,
  laneColors: ["#ff33cc", "#68cfff", "#b400ff", "#59b4ff"]
};

var HIT_TOLERANCES = { perfect: 45, great: 80, good: 120, meh: 165, bad: 215, veryBad: 265, miss: 320 };
var SCORE_VALUES = { perfect: 300, great: 200, good: 100, meh: 50, bad: 10, veryBad: -50, miss: -100 };
var JUDGMENT_COLORS = { perfect: "#68cfff", great: "#b400ff", good: "#00ff88", meh: "#ffd900", bad: "#ff6600", veryBad: "#ff2244", miss: "#ff4444" };
var JUDGMENT_LABELS = { perfect: "PERFECT", great: "GREAT", good: "GOOD", meh: "MEH", bad: "BAD", veryBad: "VERY BAD", miss: "MISS" };
var JUDGMENT_WEIGHTS = { perfect: 1, great: 0.8, good: 0.6, meh: 0.4, bad: 0.2, veryBad: 0.1, miss: 0 };
var JUDGMENT_ORDER = ["perfect", "great", "good", "meh", "bad", "veryBad", "miss"];

var game = null;
var audio = null;
var raf = 0;
var pausedAt = 0;
var countdownTimer = null;
var lastFrame = 0;

function $(id) { return document.getElementById(id); }
function formatNumber(n) { return Number(n || 0).toLocaleString("en-US"); }
function escapeHtml(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]; }); }
function formatTime(seconds) {
  var safe = Math.max(0, Math.floor(Number(seconds) || 0));
  return Math.floor(safe / 60) + ":" + String(safe % 60).padStart(2, "0");
}

function seededRandom(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/* Mismo generador que la web (src/data/charts.ts + generateNotes de levels/index.ts). */
function generateChart(trackId, durationSec, bpm, difficulty) {
  var events = [];
  var beatInterval = 60 / bpm;
  var noteDensity = 1;
  var chordProbability = 0;
  var tripleProbability = 0;
  if (difficulty === "Normal") { noteDensity = 0.5; chordProbability = 0.15; }
  if (difficulty === "Hard") { noteDensity = 0.25; chordProbability = 0.3; tripleProbability = 0.05; }
  if (difficulty === "Expert") { noteDensity = 0.125; chordProbability = 0.4; tripleProbability = 0.15; }
  if (difficulty === "Easy") { noteDensity = 1; chordProbability = 0.05; }

  var seed = trackId.split("").reduce(function (acc, ch) { return acc + ch.charCodeAt(0); }, 0);
  for (var t = 3; t < durationSec - 2; t += beatInterval * noteDensity) {
    if (seededRandom(seed++) < 0.1) continue;
    var baseLane = Math.floor(seededRandom(seed++) * 4);
    events.push({ time: t, lane: baseLane });
    if (seededRandom(seed++) < chordProbability) {
      var extraLane = Math.floor(seededRandom(seed++) * 4);
      while (extraLane === baseLane) extraLane = Math.floor(seededRandom(seed++) * 4);
      events.push({ time: t, lane: extraLane });
      if (seededRandom(seed++) < tripleProbability) {
        var thirdLane = Math.floor(seededRandom(seed++) * 4);
        while (thirdLane === baseLane || thirdLane === extraLane) thirdLane = Math.floor(seededRandom(seed++) * 4);
        events.push({ time: t, lane: thirdLane });
      }
    }
  }

  var holdChance = difficulty === "Easy" ? 0 : difficulty === "Normal" ? 0.12 : difficulty === "Hard" ? 0.28 : 0.42;
  return events.map(function (event, index) {
    var type = "tap";
    var endTime;
    if (holdChance > 0 && seededRandom(seed + index) < holdChance) {
      type = "hold";
      endTime = Math.round((event.time + 0.5 + seededRandom(seed + index + 999) * 1.0) * 100) / 100;
    }
    return {
      time: Math.round(event.time * 100) / 100 * 1000,
      lane: event.lane,
      type: type,
      endTime: endTime ? Math.round(endTime * 100) / 100 * 1000 : undefined
    };
  });
}

function bestScore(track, diff) {
  try { return parseInt(localStorage.getItem("muzicmania.offline.best." + track.id + "." + diff) || "0", 10) || 0; } catch (e) { return 0; }
}

function saveBest(track, diff, value) {
  try {
    if (value > bestScore(track, diff)) localStorage.setItem("muzicmania.offline.best." + track.id + "." + diff, String(value));
  } catch (e) {}
}

function renderTracks() {
  var list = $("track-list");
  if (!list) return;
  list.innerHTML = "";
  TRACKS.forEach(function (track) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "track" + (selectedTrack && track.id === selectedTrack.id ? " selected" : "");
    button.style.setProperty("--accent", track.color);
    var best = bestScore(track, selectedDifficulty);
    button.innerHTML = '<span class="cover">♪</span><span><span class="tname">' + escapeHtml(track.name) + '</span><span class="tmeta">' + escapeHtml(track.artist) + ' · ' + Number(track.bpm) + ' BPM · ' + formatTime(track.duration) + '</span></span><span class="best">Local best<strong>' + (best ? formatNumber(best) : "—") + '</strong></span>';
    button.addEventListener("click", function () { selectedTrack = track; renderTracks(); if (window.MuzicLocalShell) window.MuzicLocalShell.selectedDifficulty = selectedDifficulty; });
    list.appendChild(button);
  });
  if ($("start-btn")) $("start-btn").disabled = !selectedTrack;
}

function resetGameState() {
  return {
    notes: [], totalNotes: 0, notesHit: 0,
    score: 0, combo: 0, maxCombo: 0, mistakes: 0, life: 100, deaths: 0,
    accuracy: 100, kps: 0, progress: 0,
    hits: { perfect: 0, great: 0, good: 0, meh: 0, bad: 0, veryBad: 0, miss: 0 },
    isRunning: false, isPaused: false, isGameOver: false,
    startTime: 0, pausedTotal: 0, duration: 0, kpsWindow: [],
    holding: null, lastJudgement: null
  };
}

function getElapsed() {
  if (!game) return 0;
  if (audio && audio.currentTime > 0) return audio.currentTime;
  if (!game.startTime) return 0;
  return Math.max(0, (performance.now() - game.startTime - game.pausedTotal) / 1000);
}

function accuracy() {
  if (!game) return 100;
  var total = 0;
  var weight = 0;
  JUDGMENT_ORDER.forEach(function (key) {
    total += game.hits[key];
    weight += game.hits[key] * JUDGMENT_WEIGHTS[key];
  });
  return total ? Math.max(0, Math.round((weight / total) * 1000) / 10) : 100;
}

function grade(acc) {
  if (acc >= 98) return "S";
  if (acc >= 92) return "A";
  if (acc >= 82) return "B";
  if (acc >= 65) return "C";
  return "D";
}

function registerJudgments(keys, hitCount) {
  if (!game) return;
  var lifeDelta = 0;
  var hasBreak = false;
  var comboBefore = game.combo;
  keys.forEach(function (key) {
    game.hits[key] += 1;
    if (key === "perfect") lifeDelta += 3;
    else if (key === "great") lifeDelta += 1;
    else if (key === "good") lifeDelta += 0;
    else if (key === "meh") { lifeDelta -= 1; hasBreak = true; }
    else if (key === "bad") { lifeDelta -= 2; hasBreak = true; }
    else if (key === "veryBad") { lifeDelta -= 4; hasBreak = true; }
    else if (key === "miss") { lifeDelta -= 6; hasBreak = true; }
    if (key !== "perfect" && key !== "great" && key !== "good") game.mistakes += 1;
  });
  var bonus = hasBreak ? 0 : Math.floor(comboBefore / 10) * 10;
  var flow = hitCount >= 4 ? 4 : hitCount >= 3 ? 3 : hitCount >= 2 ? 2 : 1;
  keys.forEach(function (key) {
    game.score += (SCORE_VALUES[key] + bonus) * flow;
  });
  game.life = Math.max(0, Math.min(100, game.life + lifeDelta));
  if (game.life <= 0 && game.life - lifeDelta > 0) game.deaths += 1;
  game.combo = hasBreak ? 0 : game.combo + hitCount;
  game.maxCombo = Math.max(game.maxCombo, game.combo);
  game.accuracy = accuracy();
  game.kpsWindow.push(performance.now());
  game.kpsWindow = game.kpsWindow.filter(function (stamp) { return performance.now() - stamp < 1000; });
  game.kps = game.kpsWindow.length;
  updateHud();
  if (game.life <= 0) finishGame();
}

function showJudgement(label, color) {
  var element = $("judgement");
  if (!element) return;
  element.textContent = label;
  element.style.color = color;
  element.classList.remove("show");
  void element.offsetWidth;
  element.classList.add("show");
}

function judgeFromDelta(deltaMs) {
  var abs = Math.abs(deltaMs);
  if (abs <= HIT_TOLERANCES.perfect) return "perfect";
  if (abs <= HIT_TOLERANCES.great) return "great";
  if (abs <= HIT_TOLERANCES.good) return "good";
  if (abs <= HIT_TOLERANCES.meh) return "meh";
  if (abs <= HIT_TOLERANCES.bad) return "bad";
  if (abs <= HIT_TOLERANCES.veryBad) return "veryBad";
  return "miss";
}

function nearestNote(lane) {
  var elapsed = getElapsed();
  var best = null;
  var bestDelta = Infinity;
  game.notes.forEach(function (note) {
    if (note.lane !== lane || note.hit || note.missed) return;
    var delta = (note.time - elapsed) * 1000;
    if (Math.abs(delta) < Math.abs(bestDelta)) { bestDelta = delta; best = note; }
  });
  return { note: best, delta: bestDelta };
}

function pressLane(lane) {
  if (!game || !game.isRunning || game.isPaused) return;
  var found = nearestNote(lane);
  var note = found.note;
  if (!note) return;
  if (note.type === "mine") {
    if (Math.abs(found.delta) <= HIT_TOLERANCES.good) {
      note.hit = true;
      game.life = Math.max(0, game.life - 10);
      game.combo = 0;
      game.mistakes += 1;
      game.score -= 100;
      showJudgement("MINE", "#ff2244");
      updateHud();
      if (game.life <= 0) finishGame();
    }
    return;
  }
  if (Math.abs(found.delta) > HIT_TOLERANCES.miss) return;
  var key = judgeFromDelta(found.delta);
  if (key === "miss") return;
  note.hit = true;
  game.notesHit += 1;
  if (note.type === "hold" && note.endTime) {
    note.holding = true;
    game.holding = note;
  }
  registerJudgments([key], 1);
  showJudgement(JUDGMENT_LABELS[key], JUDGMENT_COLORS[key]);
}

function releaseLane(lane) {
  if (!game || !game.holding) return;
  var note = game.holding;
  if (note.lane !== lane) return;
  game.holding = null;
  if (getElapsed() < note.endTime - 0.08) {
    game.life = Math.max(0, game.life - 6);
    game.combo = 0;
    game.mistakes += 1;
    game.hits.miss += 1;
    game.accuracy = accuracy();
    showJudgement("HOLD MISS", "#ff4444");
    updateHud();
    if (game.life <= 0) finishGame();
  }
}

function updateHud() {
  if (!game) return;
  var set = function (id, text) { if ($(id)) $(id).textContent = text; };
  set("hud-score", formatNumber(game.score));
  set("hud-combo", game.combo + "x");
  set("hud-maxcombo", game.maxCombo + "x");
  set("hud-kps", String(game.kps));
  set("hud-miss", String(game.mistakes));
  set("hud-acc", game.accuracy + "%");
  set("hud-life-label", Math.round(game.life) + "%");
  if ($("hud-life")) $("hud-life").style.width = Math.max(0, Math.min(100, game.life)) + "%";
  var duration = game.duration || (selectedTrack ? selectedTrack.duration : 0) || 1;
  var elapsed = getElapsed();
  set("hud-time", formatTime(elapsed));
  set("hud-time-left", "-" + formatTime(Math.max(0, duration - elapsed)));
  if ($("hud-progress")) $("hud-progress").style.width = Math.max(0, Math.min(100, (elapsed / duration) * 100)) + "%";
  var counts = $("hud-judgements");
  if (counts) {
    counts.innerHTML = "";
    JUDGMENT_ORDER.forEach(function (key) {
      var row = document.createElement("div");
      row.className = key;
      var label = document.createElement("span");
      label.textContent = JUDGMENT_LABELS[key];
      var value = document.createElement("strong");
      value.textContent = String(game.hits[key]);
      row.append(label, value);
      counts.appendChild(row);
    });
  }
}

function resizeCanvas() {
  var canvas = $("game-canvas");
  if (!canvas) return;
  var rect = canvas.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  var ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function draw() {
  var canvas = $("game-canvas");
  if (!canvas) return;
  var rect = canvas.getBoundingClientRect();
  var ctx = canvas.getContext("2d");
  var dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) ctx = resizeCanvas();
  var width = rect.width;
  var height = rect.height;
  var laneWidth = Math.min(120, Math.max(64, width / 6.4));
  var boardWidth = laneWidth * 4;
  var x0 = (width - boardWidth) / 2;
  var hitY = height * GAME_CONFIG.hitZoneRatio;
  var elapsed = getElapsed();
  var speed = height * 0.55;
  ctx.clearRect(0, 0, width, height);
  var bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "rgba(5,5,10,.9)");
  bg.addColorStop(0.55, "rgba(8,12,26,.55)");
  bg.addColorStop(1, "rgba(24,0,44,.35)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  for (var lane = 0; lane < 4; lane += 1) {
    var x = x0 + lane * laneWidth;
    ctx.fillStyle = lane % 2 === 0 ? "rgba(255,255,255,.018)" : "rgba(255,255,255,.035)";
    ctx.fillRect(x, 0, laneWidth, height);
    ctx.strokeStyle = "rgba(255,255,255,.065)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,.08)";
  ctx.beginPath(); ctx.moveTo(x0 + boardWidth, 0); ctx.lineTo(x0 + boardWidth, height); ctx.stroke();

  game.notes.forEach(function (note) {
    if (note.hit || note.missed) return;
    var delta = note.time - elapsed;
    var y = hitY - delta * speed;
    if (y < -120 || y > height + 120) return;
    var nx = x0 + note.lane * laneWidth;
    var cx = nx + laneWidth / 2;
    var color = GAME_CONFIG.laneColors[note.lane];
    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = color;
    if (note.type === "mine") {
      ctx.fillStyle = "#ff2244";
      ctx.beginPath();
      ctx.arc(cx, y, laneWidth * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else if (note.type === "hold") {
      var endY = hitY - ((note.endTime || note.time + 0.5) - elapsed) * speed;
      var top = Math.min(y, endY);
      var bottom = Math.max(y, endY);
      ctx.fillStyle = color + "55";
      ctx.fillRect(cx - laneWidth * 0.16, top, laneWidth * 0.32, bottom - top);
      ctx.fillStyle = color;
      ctx.fillRect(cx - laneWidth * 0.22, y - 5, laneWidth * 0.44, 10);
      ctx.fillRect(cx - laneWidth * 0.22, endY - 7, laneWidth * 0.44, 14);
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, y - 18);
      ctx.lineTo(cx + 17, y);
      ctx.lineTo(cx, y + 18);
      ctx.lineTo(cx - 17, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  });

  ctx.strokeStyle = "rgba(255,255,255,.7)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, hitY); ctx.lineTo(x0 + boardWidth, hitY); ctx.stroke();
  var labels = inputMode === "arrows" ? ["←", "↓", "↑", "→"] : inputMode === "wasd" ? ["A", "S", "W", "D"] : ["D", "F", "J", "K"];
  for (var l = 0; l < 4; l += 1) {
    var lx = x0 + l * laneWidth + laneWidth / 2;
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.font = "700 11px Rajdhani, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels[l], lx, hitY + 24);
    ctx.strokeStyle = GAME_CONFIG.laneColors[l] + "66";
    ctx.strokeRect(x0 + l * laneWidth + 10, hitY - 4, laneWidth - 20, 8);
  }
}

function tick() {
  if (!game || !game.isRunning || game.isPaused || game.isGameOver) return;
  var elapsed = getElapsed();
  var changed = false;
  game.notes.forEach(function (note) {
    if (note.hit || note.missed) return;
    if (elapsed > note.time + HIT_TOLERANCES.miss / 1000) {
      note.missed = true;
      note.hit = true;
      game.hits.miss += 1;
      game.mistakes += 1;
      game.combo = 0;
      game.life = Math.max(0, game.life - 6);
      game.accuracy = accuracy();
      changed = true;
      if (game.life <= 0) finishGame();
    }
  });
  if (changed) updateHud();
  draw();
  updateHud();
  if (game.holding && elapsed >= (game.holding.endTime || 0)) game.holding = null;
  if (!game.isGameOver) {
    if (audio && audio.ended) { finishGame(); return; }
    if (elapsed >= game.duration || (game.notesHit >= game.totalNotes && elapsed > 2)) { finishGame(); return; }
  }
  if (game.isRunning && !game.isPaused) raf = requestAnimationFrame(tick);
}

function startGame() {
  if (!selectedTrack) return;
  stopGame();
  game = resetGameState();
  var track = selectedTrack;
  game.duration = Number(track.duration) || 180;
  var raw;
  if (track.chart && Array.isArray(track.chart.notes)) {
    raw = track.chart.notes.map(function (note) {
      return {
        time: Math.max(0, Number(note.time) || 0),
        lane: Math.max(0, Math.min(3, Number(note.lane) || 0)),
        type: note.type === "hold" || note.type === "mine" ? note.type : "tap",
        endTime: note.endTime ? Number(note.endTime) : undefined
      };
    });
  } else {
    raw = generateChart(track.id, track.duration, track.bpm, selectedDifficulty).map(function (note) {
      return { time: note.time / 1000, lane: note.lane, type: note.type, endTime: note.endTime ? note.endTime / 1000 : undefined };
    });
  }
  game.notes = raw.sort(function (a, b) { return a.time - b.time; }).map(function (note) {
    return Object.assign({ hit: false, missed: false }, note);
  });
  game.totalNotes = game.notes.length;
  game.startTime = performance.now();
  game.isRunning = true;
  game.isPaused = false;
  game.isGameOver = false;
  audio = track.audio ? new Audio(track.audio) : null;
  if (audio) {
    audio.volume = 0.8;
    audio.addEventListener("error", function () { if (game) game.audioFailed = true; });
    audio.play().catch(function () { if (game) game.audioFailed = true; });
  }
  $("menu").style.display = "none";
  $("game").classList.add("active");
  $("pause-screen").classList.add("hidden");
  $("countdown").classList.add("hidden");
  $("results").classList.remove("active");
  resizeCanvas();
  updateHud();
  lastFrame = performance.now();
  raf = requestAnimationFrame(tick);
}

function stopGame() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  clearInterval(countdownTimer);
  countdownTimer = null;
  if (audio) { audio.pause(); audio = null; }
  if (game) { game.isRunning = false; game.isPaused = false; }
}

function finishGame() {
  if (!game || game.isGameOver) return;
  game.isGameOver = true;
  game.isRunning = false;
  cancelAnimationFrame(raf);
  if (audio) audio.pause();
  var acc = accuracy();
  var previous = bestScore(selectedTrack, selectedDifficulty);
  saveBest(selectedTrack, selectedDifficulty, game.score);
  $("result-track").textContent = selectedTrack.name + " · " + selectedDifficulty;
  $("result-grade").textContent = grade(acc);
  $("result-score").textContent = formatNumber(game.score);
  $("result-acc").textContent = acc + "%";
  $("result-combo").textContent = game.maxCombo + "x";
  $("result-miss").textContent = String(game.mistakes);
  $("result-perfect").textContent = String(game.hits.perfect);
  $("result-great").textContent = String(game.hits.great);
  $("result-good").textContent = String(game.hits.good);
  $("results").classList.add("active");
  if (game.score > previous) $("result-track").textContent += " · New local best";
}

function backToMenu() {
  stopGame();
  $("results").classList.remove("active");
  $("game").classList.remove("active");
  $("pause-screen").classList.add("hidden");
  $("countdown").classList.add("hidden");
  if ($("menu")) $("menu").style.display = "flex";
  renderTracks();
}

function pauseGame() {
  if (!game || !game.isRunning || game.isPaused || game.isGameOver) return;
  game.isPaused = true;
  pausedAt = performance.now();
  if (audio) audio.pause();
  cancelAnimationFrame(raf);
  $("pause-screen").classList.remove("hidden");
  $("countdown").classList.add("hidden");
}

function resumeGame() {
  if (!game || !game.isPaused) return;
  $("pause-screen").classList.add("hidden");
  var countdown = $("countdown");
  var value = 3;
  countdown.textContent = String(value);
  countdown.classList.remove("hidden");
  clearInterval(countdownTimer);
  countdownTimer = setInterval(function () {
    value -= 1;
    if (value > 0) {
      countdown.textContent = String(value);
      return;
    }
    clearInterval(countdownTimer);
    countdownTimer = null;
    countdown.classList.add("hidden");
    game.pausedTotal += performance.now() - pausedAt;
    game.isPaused = false;
    if (audio) audio.play().catch(function () {});
    raf = requestAnimationFrame(tick);
  }, 1000);
}

function togglePause() {
  if (!game || !game.isRunning || game.isGameOver) return;
  if (game.isPaused) resumeGame();
  else pauseGame();
}

window.showCloseDialog = function () {
  try { window.__TAURI_INTERNALS__.invoke("offline_game_close"); } catch (e) { window.close(); }
};

function init() {
  if (window.self !== window.top) {
    var frameClose = $("close-app");
    if (frameClose) frameClose.style.display = "none";
  }
  document.querySelectorAll(".diff").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll(".diff").forEach(function (item) { item.classList.remove("active"); });
      button.classList.add("active");
      selectedDifficulty = button.getAttribute("data-diff");
      renderTracks();
    });
  });
  renderTracks();
  $("start-btn")?.addEventListener("click", startGame);
  $("retry-btn")?.addEventListener("click", startGame);
  $("back-btn")?.addEventListener("click", backToMenu);
  $("pause-btn")?.addEventListener("click", togglePause);
  $("pause-resume")?.addEventListener("click", resumeGame);
  $("pause-restart")?.addEventListener("click", function () { $("pause-screen").classList.add("hidden"); startGame(); });
  $("pause-config")?.addEventListener("click", function () { if (window.MuzicLocalShell) window.MuzicLocalShell.showView("settings"); });
  $("pause-exit")?.addEventListener("click", backToMenu);
  $("close-app")?.addEventListener("click", function () {
    try {
      if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) window.__TAURI_INTERNALS__.invoke("offline_game_close");
      else window.close();
    } catch (e) { window.close(); }
  });
  window.addEventListener("resize", function () { if (game && game.isRunning) draw(); });
  window.addEventListener("blur", function () { pauseGame(); });
  document.addEventListener("visibilitychange", function () { if (document.hidden) pauseGame(); });
  document.addEventListener("contextmenu", function (event) { event.preventDefault(); });
  document.addEventListener("keydown", function (event) {
    var key = event.key.toLowerCase();
    if (event.repeat) {
      if (key === "escape") event.preventDefault();
      return;
    }
    var lane;
    if (key.indexOf("arrow") === 0) lane = { arrowleft: 0, arrowdown: 1, arrowup: 2, arrowright: 3 }[key];
    else if (inputMode === "wasd") lane = { a: 0, s: 1, w: 2, d: 3 }[key];
    else lane = { d: 0, f: 1, j: 2, k: 3 }[key];
    if (lane !== undefined) {
      event.preventDefault();
      pressLane(lane);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      togglePause();
      return;
    }
    if (event.key === "F5" || event.key === "F12" || (event.ctrlKey && ["p", "r", "f", "s", "u"].indexOf(key) !== -1)) event.preventDefault();
  });
  document.addEventListener("keyup", function (event) {
    var key = event.key.toLowerCase();
    var lane;
    if (key.indexOf("arrow") === 0) lane = { arrowleft: 0, arrowdown: 1, arrowup: 2, arrowright: 3 }[key];
    else if (inputMode === "wasd") lane = { a: 0, s: 1, w: 2, d: 3 }[key];
    else lane = { d: 0, f: 1, j: 2, k: 3 }[key];
    if (lane !== undefined) releaseLane(lane);
  });
}

if (document.readyState === "complete" || document.readyState === "interactive") init();
else document.addEventListener("DOMContentLoaded", init);
