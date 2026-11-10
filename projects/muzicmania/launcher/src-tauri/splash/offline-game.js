var TRACKS = [
  { id: "oled_darkness", name: "OLED Darkness", artist: "CiszukoAntony", duration: 301, bpm: 110, color: "#59b4ff", audio: "offline/music/oled_darkness.opus" },
  { id: "neon_dreams", name: "Neon Dreams", artist: "CiszukoAntony", duration: 225, bpm: 124, color: "#68cfff", audio: "offline/music/neon_dreams.opus" },
  { id: "digital_soul", name: "Digital Soul", artist: "CiszukoAntony", duration: 252, bpm: 128, color: "#b400ff", audio: "offline/music/digital_soul.opus" },
  { id: "cyber_beat", name: "Cyber Beat", artist: "CiszukoAntony", duration: 208, bpm: 140, color: "#ff33cc", audio: "offline/music/cyber_beat.opus" }
];

var selectedTrack = TRACKS[0];
var selectedDifficulty = "Normal";
var notes = [];
var isRunning = false;
var isPaused = false;
var audio = null;
var raf = 0;
var lastFrame = 0;
var score = 0;
var combo = 0;
var maxCombo = 0;
var misses = 0;
var hits = { Perfect: 0, Great: 0, Good: 0, Bad: 0 };
var bestKey = "";

function $(id) { return document.getElementById(id); }
function formatNumber(n) { return Number(n || 0).toLocaleString("en-US"); }
function difficultyLabel(value) { return value.toUpperCase(); }

function seededRandom(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateChart(trackId, durationSec, bpm, difficulty) {
  var events = [];
  var beatInterval = 60 / bpm;
  var density = 1;
  var chord = 0.05;
  var triple = 0;
  if (difficulty === "Easy") { density = 1; chord = 0.05; }
  if (difficulty === "Normal") { density = 0.5; chord = 0.15; }
  if (difficulty === "Hard") { density = 0.25; chord = 0.3; triple = 0.05; }
  if (difficulty === "Expert") { density = 0.125; chord = 0.4; triple = 0.15; }
  var seed = trackId.split("").reduce(function(acc, ch) { return acc + ch.charCodeAt(0); }, 0);
  for (var t = 3; t < durationSec - 2; t += beatInterval * density) {
    if (seededRandom(seed++) < 0.1) continue;
    var base = Math.floor(seededRandom(seed++) * 4);
    events.push({ time: t * 1000, lane: base, hit: false, missed: false });
    if (seededRandom(seed++) < chord) {
      var extra = Math.floor(seededRandom(seed++) * 4);
      while (extra === base) extra = Math.floor(seededRandom(seed++) * 4);
      events.push({ time: t * 1000, lane: extra, hit: false, missed: false });
      if (seededRandom(seed++) < triple) {
        var third = Math.floor(seededRandom(seed++) * 4);
        while (third === base || third === extra) third = Math.floor(seededRandom(seed++) * 4);
        events.push({ time: t * 1000, lane: third, hit: false, missed: false });
      }
    }
  }
  return events.sort(function(a, b) { return a.time - b.time; });
}

function bestScore(track, diff) {
  try { return parseInt(localStorage.getItem("muzicmania.offline.best." + track.id + "." + diff) || "0", 10) || 0; } catch (e) { return 0; }
}

function saveBest(track, diff, value) {
  try {
    var key = "muzicmania.offline.best." + track.id + "." + diff;
    if (value > bestScore(track, diff)) localStorage.setItem(key, String(value));
  } catch (e) {}
}

function renderTracks() {
  var list = $("track-list");
  list.innerHTML = "";
  TRACKS.forEach(function(track) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "track" + (track.id === selectedTrack.id ? " selected" : "");
    btn.style.setProperty("--accent", track.color);
    btn.innerHTML = '<span class="cover">♪</span><span><span class="tname">' + track.name + '</span><span class="tmeta">' + track.artist + ' · ' + track.bpm + ' BPM · ' + Math.floor(track.duration / 60) + ':' + String(track.duration % 60).padStart(2, "0") + '</span></span><span class="best">Local best<strong>' + (bestScore(track, selectedDifficulty) ? formatNumber(bestScore(track, selectedDifficulty)) : "—") + '</strong></span>';
    btn.addEventListener("click", function() { selectedTrack = track; renderTracks(); });
    list.appendChild(btn);
  });
  $("start-btn").disabled = !selectedTrack;
}

function resetState() {
  score = 0; combo = 0; maxCombo = 0; misses = 0;
  hits = { Perfect: 0, Great: 0, Good: 0, Bad: 0 };
  $("hud-score").textContent = "0";
  $("hud-combo").textContent = "0";
  $("hud-acc").textContent = "100%";
  $("hud-miss").textContent = "0";
  $("results").classList.remove("active");
}

function accuracy() {
  var total = hits.Perfect + hits.Great + hits.Good + hits.Bad + misses;
  if (!total) return 100;
  var points = hits.Perfect * 100 + hits.Great * 80 + hits.Good * 55 + hits.Bad * 25;
  return Math.max(0, Math.round((points / (total * 100)) * 100));
}

function grade() {
  var acc = accuracy();
  if (acc >= 98 && !misses) return "S";
  if (acc >= 92) return "A";
  if (acc >= 82) return "B";
  if (acc >= 65) return "C";
  return "D";
}

function resizeCanvas() {
  var canvas = $("game-canvas");
  var rect = canvas.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  var ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: ctx, width: rect.width, height: rect.height };
}

function drawBoard(ctx, width, height, time) {
  var laneWidth = Math.min(112, Math.max(62, width / 7));
  var boardWidth = laneWidth * 4;
  var x0 = (width - boardWidth) / 2;
  var hitY = height - 84;
  var speed = 0.52;
  ctx.clearRect(0, 0, width, height);
  var bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "rgba(8,10,20,.2)");
  bg.addColorStop(1, "rgba(15,158,255,.035)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  for (var i = 0; i < 4; i++) {
    var x = x0 + i * laneWidth;
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,.018)" : "rgba(255,255,255,.035)";
    ctx.fillRect(x, 0, laneWidth, height);
    ctx.strokeStyle = "rgba(255,255,255,.07)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,.1)";
  ctx.beginPath(); ctx.moveTo(x0 + boardWidth, 0); ctx.lineTo(x0 + boardWidth, height); ctx.stroke();
  var laneColors = ["#0f9eff", "#b026ff", "#ff20bf", "#59b4ff"];
  for (var n = 0; n < notes.length; n++) {
    var note = notes[n];
    if (note.hit || note.missed) continue;
    var y = hitY - ((note.time - time) / 1000) * speed * 1000;
    if (y < -26 || y > height + 30) continue;
    var nx = x0 + note.lane * laneWidth;
    var cx = nx + laneWidth / 2;
    ctx.shadowBlur = 18;
    ctx.shadowColor = laneColors[note.lane];
    ctx.fillStyle = laneColors[note.lane];
    ctx.beginPath();
    ctx.moveTo(cx, y - 16); ctx.lineTo(cx + 14, y); ctx.lineTo(cx, y + 16); ctx.lineTo(cx - 14, y);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.strokeStyle = "rgba(255,255,255,.8)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, hitY); ctx.lineTo(x0 + boardWidth, hitY); ctx.stroke();
  for (var l = 0; l < 4; l++) {
    var lx = x0 + l * laneWidth + laneWidth / 2;
    ctx.fillStyle = "rgba(255,255,255,.32)";
    ctx.font = "700 10px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(["D", "F", "J", "K"][l], lx, hitY + 20);
    ctx.strokeStyle = laneColors[l] + "55";
    ctx.strokeRect(x0 + l * laneWidth + 8, hitY - 3, laneWidth - 16, 6);
  }
}

function updateHud() {
  $("hud-score").textContent = formatNumber(score);
  $("hud-combo").textContent = combo;
  $("hud-acc").textContent = accuracy() + "%";
  $("hud-miss").textContent = misses;
}

function showJudgement(label, color) {
  var el = $("judgement");
  el.textContent = label;
  el.style.color = color;
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
}

function pressLane(lane) {
  if (!isRunning || isPaused) return;
  var time = audio ? audio.currentTime * 1000 : 0;
  var best = null;
  var bestDelta = Infinity;
  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];
    if (note.lane !== lane || note.hit || note.missed) continue;
    var delta = Math.abs(note.time - time);
    if (delta < bestDelta) { bestDelta = delta; best = note; }
  }
  if (!best || bestDelta > 170) return;
  best.hit = true;
  var label = "Bad", color = "#9ba1b8", value = 100;
  if (bestDelta <= 45) { label = "Perfect"; color = "#2ED573"; value = 1000; }
  else if (bestDelta <= 85) { label = "Great"; color = "#0f9eff"; value = 700; }
  else if (bestDelta <= 125) { label = "Good"; color = "#b026ff"; value = 450; }
  hits[label] += 1;
  score += value;
  combo += 1;
  maxCombo = Math.max(maxCombo, combo);
  showJudgement(label, color);
  updateHud();
}

function tick() {
  if (!isRunning) return;
  var canvas = $("game-canvas");
  var rect = canvas.getBoundingClientRect();
  var ctx = canvas.getContext("2d");
  var dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
    var r = resizeCanvas(); ctx = r.ctx;
  }
  var time = audio ? audio.currentTime * 1000 : 0;
  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];
    if (!note.hit && !note.missed && time > note.time + 170) {
      note.missed = true;
      misses += 1;
      combo = 0;
      updateHud();
    }
  }
  drawBoard(ctx, rect.width, rect.height, time);
  if (audio && (audio.ended || (audio.duration && audio.currentTime >= audio.duration - 0.05))) {
    finishGame();
    return;
  }
  raf = requestAnimationFrame(tick);
}

function startGame() {
  if (!selectedTrack) return;
  resetState();
  notes = generateChart(selectedTrack.id, selectedTrack.duration, selectedTrack.bpm, selectedDifficulty);
  bestKey = "muzicmania.offline.best." + selectedTrack.id + "." + selectedDifficulty;
  audio = new Audio(selectedTrack.audio);
  audio.volume = 0.8;
  audio.addEventListener("error", function() { showJudgement("AUDIO ERROR", "#ff4757"); });
  audio.play().catch(function() {});
  $("menu").style.display = "none";
  $("game").classList.add("active");
  isRunning = true;
  isPaused = false;
  resizeCanvas();
  updateHud();
  lastFrame = performance.now();
  raf = requestAnimationFrame(tick);
}

function finishGame() {
  if (!isRunning) return;
  isRunning = false;
  cancelAnimationFrame(raf);
  if (audio) { audio.pause(); }
  var acc = accuracy();
  var finalScore = score;
  var previous = bestScore(selectedTrack, selectedDifficulty);
  saveBest(selectedTrack, selectedDifficulty, finalScore);
  $("result-track").textContent = selectedTrack.name + " · " + selectedDifficulty;
  $("result-grade").textContent = grade();
  $("result-score").textContent = formatNumber(finalScore);
  $("result-acc").textContent = acc + "%";
  $("result-combo").textContent = maxCombo;
  $("result-miss").textContent = misses;
  $("results").classList.add("active");
  if (finalScore > previous) $("result-track").textContent += " · New local best";
}

function backToMenu() {
  isRunning = false;
  isPaused = false;
  cancelAnimationFrame(raf);
  if (audio) { audio.pause(); audio = null; }
  $("results").classList.remove("active");
  $("game").classList.remove("active");
  $("menu").style.display = "flex";
  renderTracks();
}

function togglePause() {
  if (!isRunning) return;
  isPaused = !isPaused;
  if (isPaused) {
    if (audio) audio.pause();
    cancelAnimationFrame(raf);
    showJudgement("PAUSED", "#9ba1b8");
    $("pause-btn").textContent = "Resume";
  } else {
    if (audio) audio.play().catch(function() {});
    $("pause-btn").textContent = "Pause";
    raf = requestAnimationFrame(tick);
  }
}

window.showCloseDialog = function() {
  try { window.__TAURI_INTERNALS__.invoke("offline_game_close"); } catch (e) { window.close(); }
};

function init() {
  var diffs = document.querySelectorAll(".diff");
  var i;
  for (i = 0; i < diffs.length; i++) {
    diffs[i].addEventListener("click", function() {
      for (var j = 0; j < diffs.length; j++) diffs[j].classList.remove("active");
      this.classList.add("active");
      selectedDifficulty = this.getAttribute("data-diff");
      renderTracks();
    });
  }
  renderTracks();
  $("start-btn").addEventListener("click", startGame);
  $("retry-btn").addEventListener("click", function() { $("results").classList.remove("active"); startGame(); });
  $("back-btn").addEventListener("click", backToMenu);
  $("pause-btn").addEventListener("click", togglePause);
  $("close-app").addEventListener("click", function() {
    try {
      if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) window.__TAURI_INTERNALS__.invoke("offline_game_close");
      else window.close();
    } catch (e) { window.close(); }
  });
  window.addEventListener("resize", function() { if (isRunning) resizeCanvas(); });
  document.addEventListener("contextmenu", function(e) { e.preventDefault(); });
  document.addEventListener("keydown", function(e) {
    var key = e.key.toLowerCase();
    var keyLane = { d: 0, f: 1, j: 2, k: 3, arrowleft: 0, arrowdown: 1, arrowup: 2, arrowright: 3 }[key];
    if (keyLane !== undefined) {
      e.preventDefault();
      pressLane(keyLane);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (isRunning) togglePause();
    }
    if (e.key === "F5" || e.key === "F12" || (e.ctrlKey && ["p", "r", "f", "s", "u"].indexOf(key) !== -1)) e.preventDefault();
  });
}

if (document.readyState === "complete" || document.readyState === "interactive") init();
else document.addEventListener("DOMContentLoaded", init);
