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

var U18N = {
  es: {
    welcomeTitle: "Hasta pronto",
    welcomeDesc: "Vamos a desinstalar MuzicMania. Lamentamos verte partir; tu cuenta online seguirá segura y podrás volver cuando quieras.",
    languageLabel: "Idioma de la interfaz",
    languageHint: "Puedes cambiar el idioma ahora o desde el botón rápido de la barra superior.",
    cancel: "Cancelar",
    continue: "Continuar",
    confirmTitle: "Desinstalar MuzicMania",
    confirmDesc: "Esto eliminará la aplicación de tu equipo. Tu cuenta de MuzicMania está guardada online y no se borrará.",
    installedVersion: "Versión instalada",
    application: "Aplicación",
    diskUsed: "Espacio usado",
    localData: "Datos locales",
    deleteData: "Eliminar también ajustes, caché y datos offline",
    deleteHint: "Si no lo marcas, tus ajustes y caché se conservarán para una futura instalación. La cuenta nunca se modifica.",
    feedbackTitle: "Comentario opcional",
    reasonBugs: "Demasiados errores",
    reasonPerformance: "Rendimiento",
    reasonFeatures: "Faltan funciones",
    reasonOther: "Otro motivo",
    feedbackPlaceholder: "Cuéntanos qué podríamos mejorar (opcional)",
    uninstall: "Desinstalar",
    missingTitle: "MuzicMania no está instalado",
    missingDesc: "No se encontró una instalación válida en este equipo. Instala MuzicMania de nuevo desde la página oficial.",
    download: "Descargar MuzicMania",
    support: "Soporte",
    close: "Cerrar",
    progressTitle: "Desinstalando MuzicMania...",
    preparing: "Preparando la desinstalación...",
    removing: "Eliminando archivos",
    doneTitle: "MuzicMania se ha eliminado",
    doneNote: "La aplicación se eliminó correctamente.",
    doneNoteData: "La aplicación y los datos locales se eliminaron correctamente.",
    doneNoteKept: "La aplicación se eliminó y los ajustes locales se conservaron.",
    doneMessage: "Lamentamos verte partir. Gracias por haber sido parte de MuzicMania; tu cuenta y tus recuerdos siguen aquí. Vuelve cuando quieras.",
    accountSafe: "Tu cuenta sigue segura. Los ajustes locales se conservaron.",
    needHelp: "¿Necesitas ayuda?",
    supportPage: "Página de soporte",
    footerSafe: "Desinstalador oficial",
    footerSupport: "Soporte:",
    modalTitle: "¿Cancelar la desinstalación?",
    modalDesc: "Si cierras ahora, MuzicMania seguirá instalado.",
    keepInstalled: "Seguir con la desinstalación",
    cancelUninstall: "Cancelar desinstalación",
    alreadyRunning: "La desinstalación ya está en curso. Espera a que termine.",
    pleaseWait: "Espera",
    continueAction: "Continuar",
    preparingAction: "Preparando la desinstalación...",
    removingAction: "Eliminando archivos...",
    complete: "Desinstalación completada",
    failed: "La desinstalación falló. Cierra esta ventana e inténtalo de nuevo.",
    noStart: "No se pudo iniciar el desinstalador.",
    noResponse: "La desinstalación no respondió. Cierra la ventana e inténtalo de nuevo.",
    runningTitle: "MuzicMania está en ejecución",
    runningDesc: "Cierra MuzicMania desde la bandeja del sistema o el administrador de tareas antes de continuar.",
    runningClose: "Entendido",
  },
  en: {
    welcomeTitle: "See you soon",
    welcomeDesc: "We are about to uninstall MuzicMania. We are sorry to see you go; your online account will stay safe and you can come back whenever you want.",
    languageLabel: "Interface language",
    languageHint: "You can change the language now or from the quick button in the title bar.",
    cancel: "Cancel",
    continue: "Continue",
    confirmTitle: "Uninstall MuzicMania",
    confirmDesc: "This will remove the application from your computer. Your MuzicMania account is stored online and will not be deleted.",
    installedVersion: "Installed version",
    application: "Application",
    diskUsed: "Disk used",
    localData: "Local data",
    deleteData: "Also delete local settings, cache and offline data",
    deleteHint: "If unchecked, your local settings and cache will be kept for a future installation. Account data is never affected.",
    feedbackTitle: "Optional feedback",
    reasonBugs: "Too many bugs",
    reasonPerformance: "Performance",
    reasonFeatures: "Missing features",
    reasonOther: "Other reason",
    feedbackPlaceholder: "Tell us what could be better (optional)",
    uninstall: "Uninstall",
    missingTitle: "MuzicMania is not installed",
    missingDesc: "No valid installation was found on this computer. Install MuzicMania again from the official download page.",
    download: "Download MuzicMania",
    support: "Support",
    close: "Close",
    progressTitle: "Uninstalling MuzicMania...",
    preparing: "Preparing uninstallation...",
    removing: "Removing files",
    doneTitle: "MuzicMania has been removed",
    doneNote: "The application was removed successfully.",
    doneNoteData: "The application and local data were removed successfully.",
    doneNoteKept: "The application was removed and local settings were kept.",
    doneMessage: "We are sorry to see you go. Thank you for being part of MuzicMania; your account and memories are still here. Come back whenever you want.",
    accountSafe: "Your account data remains safe. Local settings were kept.",
    needHelp: "Need help?",
    supportPage: "Support page",
    footerSafe: "Official uninstaller",
    footerSupport: "Support:",
    modalTitle: "Cancel uninstallation?",
    modalDesc: "If you close now, MuzicMania will stay installed.",
    keepInstalled: "Continue uninstallation",
    cancelUninstall: "Cancel uninstall",
    alreadyRunning: "Uninstallation is already in progress. Please wait for it to finish.",
    pleaseWait: "Please wait",
    continueAction: "Continue",
    preparingAction: "Preparing uninstallation...",
    removingAction: "Removing files...",
    complete: "Uninstallation complete",
    failed: "Uninstallation failed. Close this window and try again.",
    noStart: "Could not start the uninstaller.",
    noResponse: "Uninstallation did not respond. Close the window and try again.",
    runningTitle: "MuzicMania is running",
    runningDesc: "Close MuzicMania from the system tray or Task Manager before continuing.",
    runningClose: "Understood",
  }
};
var currentLang = "1033";
try {
  var savedLang = localStorage.getItem("muzicmania-installer-lang-v2");
  if (!savedLang) savedLang = localStorage.getItem("muzicmania-uninstaller-lang");
  if (savedLang) currentLang = savedLang === "es" ? "1034" : savedLang === "en" ? "1033" : savedLang;
} catch (e) {}
if (currentLang === "1033" && (navigator.language || "en").toLowerCase().indexOf("es") === 0) currentLang = "1034";

function langKey(code) { return String(code) === "1034" ? "es" : "en"; }
function uT(key) {
  var keyLang = langKey(currentLang);
  return (U18N[keyLang] && U18N[keyLang][key]) || U18N.en[key] || key;
}

function applyLanguage(lang) {
  currentLang = String(lang || "1033");
  document.documentElement.lang = langKey(currentLang);
  var nodes = document.querySelectorAll("[data-u18n]");
  for (var i = 0; i < nodes.length; i++) nodes[i].textContent = uT(nodes[i].getAttribute("data-u18n"));
  var placeholders = document.querySelectorAll("[data-u18n-placeholder]");
  for (var j = 0; j < placeholders.length; j++) placeholders[j].placeholder = uT(placeholders[j].getAttribute("data-u18n-placeholder"));
  var selected = document.querySelector("#u-language-grid .language-option[data-lang='" + currentLang + "']");
  var flag = selected ? selected.querySelector("img") : null;
  var label = selected ? selected.querySelector("span").textContent : "English";
  var currentFlag = $("u-language-flag");
  var currentName = $("u-language-name");
  if (currentFlag && flag) currentFlag.src = flag.src;
  if (currentName) currentName.textContent = label;
  var footerFlag = $("u-footer-lang-flag");
  var footerLabel = $("u-footer-lang-label");
  if (footerFlag && flag) footerFlag.src = flag.src;
  if (footerLabel) footerLabel.textContent = label;
  var options = document.querySelectorAll("#u-language-grid .language-option");
  for (var k = 0; k < options.length; k++) options[k].classList.toggle("selected", options[k].getAttribute("data-lang") === currentLang);
  try { localStorage.setItem("muzicmania-installer-lang-v2", currentLang); } catch (e) {}
  if (isDone) setText("u-done-note", $("chk-delete") && $("chk-delete").checked ? uT("doneNoteData") : uT("doneNoteKept"));
}

function openLanguageModal() { $("u-language-modal").classList.add("active"); }
function closeLanguageModal() { $("u-language-modal").classList.remove("active"); }

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

function showRunningModal() {
  $("running-modal").classList.add("active");
}

function ensureAppClosed(callback) {
  tauriInvoke("installer_app_running").then(function(running) {
    if (running) {
      showRunningModal();
      return;
    }
    callback();
  }).catch(function() { callback(); });
}

function startUninstall() {
  if (isRunning || !allowAction("uninstall", 900)) return;
  ensureAppClosed(beginUninstall);
}

function beginUninstall() {
  window.CiszuTelemetry?.track("uninstall_started", { reason: selectedReason, rating: selectedRating, delete_data: $("chk-delete").checked });
  isRunning = true;
  document.body.classList.add("uninstall-busy");
  setProgress(5, uT("preparingAction"));
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
        document.body.classList.remove("uninstall-busy");
        setText("u-status", uT("noResponse"));
        return;
      }
      readState().then(function(status) {
        if (status === "DONE") {
          if (pollTimer) clearTimeout(pollTimer);
          if (progressTimer) clearInterval(progressTimer);
          isRunning = false;
          isDone = true;
          window.CiszuTelemetry?.track("uninstall_completed", { reason: selectedReason, rating: selectedRating, delete_data: $("chk-delete").checked });
          document.body.classList.remove("uninstall-busy");
          setProgress(100, uT("complete"));
          window.MuzicRoadmap.setDone("uninstall");
          window.MuzicRoadmap.setDone("done");
          setText("u-detail", uT("complete"));
          $("u-done-note").textContent = $("chk-delete").checked
            ? uT("doneNoteData")
            : uT("doneNoteKept");
          goView("v-done");
          return;
        }
        if (status === "ERROR") {
          if (pollTimer) clearTimeout(pollTimer);
          if (progressTimer) clearInterval(progressTimer);
          isRunning = false;
          document.body.classList.remove("uninstall-busy");
          window.MuzicRoadmap.setAllError("uninstall");
          setText("u-status", uT("failed"));
          return;
        }
        pollTimer = setTimeout(poll, 350);
      }).catch(function() { pollTimer = setTimeout(poll, 500); });
    };
    poll();
  }).catch(function() {
    isRunning = false;
    document.body.classList.remove("uninstall-busy");
    setText("u-status", uT("noStart"));
  });
}

window.showUninstallerCloseModal = function() {
  if (isDone) { finishAndClose(); return; }
  var modal = $("close-modal");
  var yes = $("modal-yes");
  var no = $("modal-no");
  if (isRunning) {
    setText("u-status", uT("alreadyRunning"));
    modal.classList.add("active");
    if (yes) { yes.disabled = true; yes.textContent = uT("pleaseWait"); }
    if (no) no.textContent = uT("continueAction");
    return;
  }
  if (yes) { yes.disabled = false; yes.textContent = uT("cancelUninstall"); }
  if (no) no.textContent = uT("keepInstalled");
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
    eggTimer = setTimeout(function() { eggClicks = 0; }, 1600);
    if (eggClicks >= 3) {
      document.body.classList.add("easter-egg");
      if (cat) cat.title = langKey(currentLang) === "en"
        ? "Click the cat to disable the easter egg"
        : "Haz clic en el gato para desactivar el easter egg";
    }
  });
  if (cat) {
    cat.title = langKey(currentLang) === "en"
      ? "Click the cat to disable the easter egg"
      : "Haz clic en el gato para desactivar el easter egg";
    cat.setAttribute("aria-label", cat.title);
    cat.addEventListener("click", function() {
      document.body.classList.remove("easter-egg");
      eggClicks = 0;
    });
  }
}

function init() {
  applyLanguage(currentLang);
  if (window.CiszuTelemetry) {
    window.CiszuTelemetry.configure({ app: "muzicmania", source: "uninstaller", version: (window.MUZIC_BUILD || {}).launcherVersion || "unknown", channel: (window.MUZIC_BUILD || {}).channel || "beta" });
    window.CiszuTelemetry.start();
  }
  var setupBuild = window.MUZIC_BUILD || {};
  var setupChannel = String(setupBuild.channel || "beta").toUpperCase();
  setText("uninstaller-channel", setupChannel);
  setText("uninstaller-version", "Launcher v" + (setupBuild.launcherVersion || "2.3.2"));
  setText("uninstaller-version-footer", "Launcher v" + (setupBuild.launcherVersion || "2.3.2") + " · " + setupChannel);
  $("setup-minimize").addEventListener("click", function() { tauriInvoke("window_minimize").catch(function() {}); });
  $("setup-close").addEventListener("click", function() { if (window.showUninstallerCloseModal) window.showUninstallerCloseModal(); });
  bindEasterEgg();
  $("u-language-trigger").addEventListener("click", openLanguageModal);
  $("u-footer-lang").addEventListener("click", openLanguageModal);
  $("u-language-close").addEventListener("click", closeLanguageModal);
  var languageOptions = document.querySelectorAll("#u-language-grid .language-option");
  for (var l = 0; l < languageOptions.length; l++) {
    languageOptions[l].addEventListener("click", function() {
      applyLanguage(this.getAttribute("data-lang"));
      closeLanguageModal();
    });
  }
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
  $("running-close").addEventListener("click", function() { $("running-modal").classList.remove("active"); });
  $("btn-redownload").addEventListener("click", function() { tauriInvoke("open_url", { url: "https://github.com/Ciszu-Network/CiszuNetwork/releases/latest" }); });
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



