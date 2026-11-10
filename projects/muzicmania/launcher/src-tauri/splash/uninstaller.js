var tauriInvoke = function(command, args) {
  if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === "function") {
    return window.__TAURI_INTERNALS__.invoke(command, args);
  }
  return Promise.resolve(null);
};
function $(id) { return document.getElementById(id); }
function setText(id, value) { var el = $(id); if (el) el.textContent = value; }
function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "—";
  var units = ["B", "KB", "MB", "GB", "TB"];
  var i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / Math.pow(1024, i)).toFixed(i > 2 ? 1 : 0) + " " + units[i];
}

var selectedReason = "";
var selectedRating = 0;
var isRunning = false;
var isDone = false;
var logConsumed = 0;
var targetPct = 0;
var shownPct = 0;
var pollTimer = null;
var progressTimer = null;
var actionLocks = {};

function allowAction(key, ms) {
  var now = Date.now();
  if (actionLocks[key] && now - actionLocks[key] < ms) return false;
  actionLocks[key] = now;
  return true;
}

function goView(id) {
  var host = $("stage-host");
  var next = $(id);
  if (!next) return;
  var active = document.querySelector(".view.active");
  if (active && active.id !== id) {
    active.classList.remove("active");
    active.classList.add("leaving");
    setTimeout(function() { active.classList.remove("leaving"); }, 220);
  }
  next.classList.add("active");
}

function setProgress(pct, label) {
  var value = Math.max(0, Math.min(100, parseInt(pct, 10) || 0));
  targetPct = Math.max(targetPct, value);
  if (label) setText("u-status", label);
  if (!progressTimer) {
    progressTimer = setInterval(function() {
      if (shownPct < targetPct) {
        shownPct = Math.min(targetPct, shownPct + Math.max(1, Math.ceil((targetPct - shownPct) / 8)));
        $("u-progress").style.width = shownPct + "%";
        setText("u-pct", shownPct + "%");
      }
    }, 45);
  }
}

function logLine(line) {
  var c = $("u-console");
  if (!c || !line) return;
  var d = document.createElement("div");
  d.textContent = line;
  c.appendChild(d);
  c.scrollTop = c.scrollHeight;
}

function readState() {
  return Promise.all([
    tauriInvoke("installer_read_status"),
    tauriInvoke("installer_read_progress"),
    tauriInvoke("installer_read_log")
  ]).then(function(values) {
    var status = String(values[0] || "READY").trim();
    var pct = values[1];
    var logText = String(values[2] || "");
    if (pct !== null && pct !== undefined && pct !== "") setProgress(pct, null);
    if (logText.length < logConsumed) logConsumed = 0;
    var chunk = logText.slice(logConsumed);
    logConsumed = logText.length;
    chunk.split(/\r?\n/).forEach(function(line) { if (line.trim()) logLine(line.trim()); });
    return status;
  });
}

function startUninstall() {
  if (isRunning || !allowAction("uninstall", 900)) return;
  isRunning = true;
  setProgress(5, "Preparing uninstallation...");
  window.MuzicRoadmap.complete("review");
  goView("v-progress");
  tauriInvoke("uninstaller_start", {
    deleteData: $("chk-delete").checked,
    reason: selectedReason,
    feedback: $("feedback-text").value || "",
    rating: selectedRating
  }).then(function() {
    var attempts = 0;
    var poll = function() {
      attempts += 1;
      if (attempts > 1800) {
        isRunning = false;
        setText("u-status", "Uninstallation did not respond. Close the window and try again.");
        return;
      }
      readState().then(function(status) {
        if (status === "DONE") {
          if (pollTimer) clearTimeout(pollTimer);
          if (progressTimer) clearInterval(progressTimer);
          isRunning = false;
          isDone = true;
          setProgress(100, "Uninstallation complete");
          window.MuzicRoadmap.setDone("uninstall");
          window.MuzicRoadmap.setDone("done");
          setText("u-detail", "Completed");
          $("u-done-note").textContent = $("chk-delete").checked
            ? "The application and local data were removed successfully."
            : "The application was removed and local settings were kept.";
          goView("v-done");
          return;
        }
        if (status === "ERROR") {
          if (pollTimer) clearTimeout(pollTimer);
          if (progressTimer) clearInterval(progressTimer);
          isRunning = false;
          window.MuzicRoadmap.setAllError("uninstall");
          setText("u-status", "Uninstallation failed. Close this window and try again.");
          return;
        }
        pollTimer = setTimeout(poll, 350);
      }).catch(function() { pollTimer = setTimeout(poll, 500); });
    };
    poll();
  }).catch(function() {
    isRunning = false;
    setText("u-status", "Could not start the uninstaller.");
  });
}

window.showUninstallerCloseModal = function() {
  if (isDone) { finishAndClose(); return; }
  var modal = $("close-modal");
  var yes = $("modal-yes");
  var no = $("modal-no");
  if (isRunning) {
    setText("u-status", "Uninstallation is already in progress. Please wait for it to finish.");
    modal.classList.add("active");
    if (yes) { yes.disabled = true; yes.textContent = "Please wait"; }
    if (no) no.textContent = "Continue";
    return;
  }
  if (yes) { yes.disabled = false; yes.textContent = "Cancel uninstall"; }
  if (no) no.textContent = "Keep installed";
  modal.classList.add("active");
};

function finishAndClose() {
  if (!allowAction("finish", 700)) return;
  tauriInvoke("uninstaller_finish").then(function() { window.close(); });
}

function cancelAndClose() {
  if (!allowAction("cancel", 700)) return;
  tauriInvoke("uninstaller_cancel").then(function() { window.close(); });
}

var UN_STAGES = [
  { id: "review", label: "Review", icon: "i-file", viewId: "v-confirm" },
  { id: "uninstall", label: "Uninstall", icon: "i-trash", viewId: "" },
  { id: "done", label: "Complete", icon: "i-check", viewId: "" }
];

function unRoadmapNavigate(viewId) {
  if (isRunning || isDone) {
    window.MuzicRoadmap.setActive(isDone ? "done" : "uninstall");
    return;
  }
  goView(viewId);
}
var eggClicks = 0;
var eggTimer = null;

function bindEasterEgg() {
  var logo = $("brand-logo");
  var cat = $("easter-cat");
  if (!logo) return;
  logo.addEventListener("click", function() {
    if (document.body.classList.contains("easter-egg")) {
      document.body.classList.remove("easter-egg");
      eggClicks = 0;
      return;
    }
    eggClicks += 1;
    clearTimeout(eggTimer);
    eggTimer = setTimeout(function() { eggClicks = 0; }, 1400);
    if (eggClicks >= 5) document.body.classList.add("easter-egg");
  });
  if (cat) cat.addEventListener("click", function() { document.body.classList.remove("easter-egg"); eggClicks = 0; });
}

function init() {
  bindEasterEgg();
  tauriInvoke("uninstaller_info").then(function(info) {
    if (!info) return;
    window.MuzicRoadmap.init("roadmap", UN_STAGES, "review", unRoadmapNavigate);
    if (!info.installed) {
      goView("v-missing");
      window.MuzicRoadmap.setError("review");
      return;
    }
    setText("u-version", "v" + (info.version || "—"));
    setText("u-path", info.install_path || "—");
    setText("u-size", formatBytes(info.size_bytes));
    setText("u-data", info.data_path || "—");
    if (info.size_bytes) setText("u-size", formatBytes(info.size_bytes));
  });

  var reasons = document.querySelectorAll(".reason");
  for (var i = 0; i < reasons.length; i++) {
    reasons[i].addEventListener("click", function() {
      for (var j = 0; j < reasons.length; j++) reasons[j].classList.remove("selected");
      this.classList.add("selected");
      selectedReason = this.getAttribute("data-reason") || "";
    });
  }
  var stars = document.querySelectorAll(".star");
  for (var s = 0; s < stars.length; s++) {
    stars[s].addEventListener("click", function() {
      selectedRating = parseInt(this.getAttribute("data-rating"), 10) || 0;
      for (var k = 0; k < stars.length; k++) stars[k].classList.toggle("active", k < selectedRating);
    });
  }
  $("btn-welcome-continue").addEventListener("click", function() {
    window.MuzicRoadmap.setActive("review");
    goView("v-confirm");
  });
  $("btn-welcome-close").addEventListener("click", cancelAndClose);
  $("btn-uninstall").addEventListener("click", startUninstall);
  $("btn-redownload").addEventListener("click", function() { tauriInvoke("open_url", { url: "https://github.com/Ciszu-Network/CiszuNetwork/releases/tag/muzicmania-v2.1.0" }); });
  $("btn-missing-support").addEventListener("click", function() { tauriInvoke("open_url", { url: "https://wa.me/584126858111" }); });
  $("btn-missing-close").addEventListener("click", cancelAndClose);
  $("btn-cancel").addEventListener("click", cancelAndClose);
  $("btn-close").addEventListener("click", finishAndClose);
  $("modal-no").addEventListener("click", function() { $("close-modal").classList.remove("active"); });
  $("modal-yes").addEventListener("click", function() {
    if (isRunning) { $("close-modal").classList.remove("active"); return; }
    cancelAndClose();
  });

  document.addEventListener("click", function(event) {
    var link = event.target.closest && event.target.closest("a[data-external]");
    if (link) { event.preventDefault(); tauriInvoke("open_url", { url: link.href }); }
  });
  document.addEventListener("contextmenu", function(e) { e.preventDefault(); });
  document.addEventListener("keydown", function(e) {
    var k = (e.key || "").toLowerCase();
    if (e.key === "F3" || e.key === "F5" || e.key === "F11" || e.key === "F12" ||
        (e.ctrlKey && ["p","r","f","s","u","w"].indexOf(k) !== -1) ||
        (e.ctrlKey && e.shiftKey && ["i","j","c"].indexOf(k) !== -1) ||
        (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight"))) e.preventDefault();
  });
}

if (document.readyState === "complete" || document.readyState === "interactive") init();
else document.addEventListener("DOMContentLoaded", init);
