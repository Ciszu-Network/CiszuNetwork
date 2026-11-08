#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

#[cfg(feature = "local-db")]
mod db;

static FORCE_CLOSE: AtomicBool = AtomicBool::new(false);
static LAUNCHER_FORCE_CLOSE: AtomicBool = AtomicBool::new(false);
static INSTALLER_FORCE_CLOSE: AtomicBool = AtomicBool::new(false);
static CLOSE_TIMEOUT_ACTIVE: AtomicBool = AtomicBool::new(false);

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct DesktopSettings {
    close_confirm: bool,
    link_confirm: bool,
}

impl Default for DesktopSettings {
    fn default() -> Self {
        Self {
            close_confirm: true,
            link_confirm: true,
        }
    }
}

struct SettingsState(Mutex<DesktopSettings>);

fn settings_path() -> Option<std::path::PathBuf> {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.join("desktop_settings.json")))
}

fn load_settings_from_disk() -> DesktopSettings {
    if let Some(path) = settings_path() {
        if let Ok(data) = std::fs::read_to_string(&path) {
            if let Ok(s) = serde_json::from_str(&data) {
                return s;
            }
        }
    }
    DesktopSettings::default()
}

fn save_settings_to_disk(settings: &DesktopSettings) {
    if let Some(path) = settings_path() {
        if let Ok(data) = serde_json::to_string(settings) {
            let _ = std::fs::write(&path, &data);
        }
    }
}

#[tauri::command]
fn close_window(app: tauri::AppHandle) {
    CLOSE_TIMEOUT_ACTIVE.store(false, Ordering::SeqCst);
    FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.close();
    }
}

#[tauri::command]
fn cancel_close() {
    CLOSE_TIMEOUT_ACTIVE.store(false, Ordering::SeqCst);
}

#[tauri::command]
fn launcher_ready(app: tauri::AppHandle) {
    let main = WebviewWindowBuilder::new(
        &app,
        "main",
        WebviewUrl::External("https://muzicmania.vercel.app".parse().unwrap()),
    )
    .maximized(true)
    .title("MuzicMania")
    .decorations(true)
    .build()
    .expect("Failed to create main window");

    let main_handle = main.clone();
    let _ = main.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            if FORCE_CLOSE.load(Ordering::SeqCst) {
                FORCE_CLOSE.store(false, Ordering::SeqCst);
                return;
            }
            api.prevent_close();
            let _ = main_handle.emit("close-requested", ());
            if CLOSE_TIMEOUT_ACTIVE
                .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
                .is_ok()
            {
                let app_handle = main_handle.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(Duration::from_secs(5));
                    if CLOSE_TIMEOUT_ACTIVE.load(Ordering::SeqCst) {
                        FORCE_CLOSE.store(true, Ordering::SeqCst);
                        if let Some(win) = app_handle.get_webview_window("main") {
                            let _ = win.close();
                        }
                    }
                });
            }
        }
    });

    if let Some(launcher) = app.get_webview_window("launcher") {
        let _ = launcher.close();
    }
}

#[tauri::command]
fn launcher_close(app: tauri::AppHandle) {
    LAUNCHER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(launcher) = app.get_webview_window("launcher") {
        let _ = launcher.close();
    }
}

#[tauri::command]
fn launcher_cancel_close() {}

#[tauri::command]
fn get_settings(state: tauri::State<SettingsState>) -> DesktopSettings {
    state.0.lock().unwrap().clone()
}

#[tauri::command]
fn is_first_run() -> bool {
    !settings_path()
        .map(|p| p.exists())
        .unwrap_or(false)
}

#[tauri::command]
fn mark_first_run_done() {
    if let Some(path) = settings_path() {
        let settings = DesktopSettings::default();
        if let Ok(data) = serde_json::to_string(&settings) {
            let _ = std::fs::write(&path, &data);
        }
    }
}

#[derive(serde::Serialize)]
struct InstallerInfo {
    version: String,
    os: String,
    arch: String,
    dir: String,
    install_path: String,
}

fn default_install_path() -> String {
    let local = std::env::var("LOCALAPPDATA")
        .or_else(|_| std::env::var("LocalAppData"))
        .unwrap_or_else(|_| "C:\\Users\\Public".to_string());
    format!("{}\\MuzicMania", local)
}

fn installer_default_path() -> String {
    std::fs::read_to_string(ipc_dir().join("default_dir.txt"))
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(default_install_path)
}

fn current_install_path() -> String {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.to_string_lossy().to_string()))
        .unwrap_or_else(default_install_path)
}

#[tauri::command]
fn installer_info() -> InstallerInfo {
    let installer_mode = std::env::args().any(|a| a == "--installer");
    let dir = if installer_mode {
        installer_default_path()
    } else {
        current_install_path()
    };
    InstallerInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        os: detect_windows_version(),
        arch: detect_architecture(),
        dir: dir.clone(),
        install_path: dir,
    }
}

#[tauri::command]
fn installer_set_lang(lang: u32) {
    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("lang.txt"), lang.to_string());
}

#[tauri::command]
fn installer_set_dir(dir: String) {
    let dir_path = ipc_dir();
    let _ = std::fs::create_dir_all(&dir_path);
    let clean = dir
        .trim()
        .trim_end_matches(|c| c == '\\' || c == '/')
        .to_string();
    let value = if clean.is_empty() {
        default_install_path()
    } else {
        clean
    };
    let _ = std::fs::write(dir_path.join("dir.txt"), value);
}

#[tauri::command]
fn installer_start_install() {
    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("cmd.txt"), "INSTALL");
}

#[tauri::command]
fn installer_read_progress() -> String {
    let path = ipc_dir().join("progress.txt");
    std::fs::read_to_string(&path)
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "0".to_string())
}

#[tauri::command]
fn installer_read_log() -> String {
    let path = ipc_dir().join("log.txt");
    std::fs::read_to_string(&path).unwrap_or_default()
}

#[tauri::command]
fn installer_pick_dir() -> String {
    let ps = r#"
Add-Type -AssemblyName System.Windows.Forms
$d = New-Object System.Windows.Forms.FolderBrowserDialog
$d.Description = "Select installation directory"
$d.ShowNewFolderButton = $true
$r = $d.ShowDialog()
if ($r -eq [System.Windows.Forms.DialogResult]::OK) { $d.SelectedPath }
"#;
    std::process::Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-STA", "-Command", ps])
        .output()
        .ok()
        .and_then(|o| {
            let s = String::from_utf8(o.stdout).ok()?;
            let t = s.trim().to_string();
            if t.is_empty() { None } else { Some(t) }
        })
        .unwrap_or_default()
}

#[tauri::command]
fn installer_force_close(app: tauri::AppHandle) {
    installer_cancel(app);
}

#[tauri::command]
fn installer_cancel(app: tauri::AppHandle) {
    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("cmd.txt"), "ABORT");
    INSTALLER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(win) = app.get_webview_window("installer") {
        let _ = win.close();
    }
}

fn ipc_dir() -> std::path::PathBuf {
    std::env::temp_dir().join("muzicmania-ipc")
}

fn ps_quote(value: &str) -> String {
    value.replace('\'', "''")
}

#[tauri::command]
fn installer_finish(app: tauri::AppHandle, run: bool, desktop: bool, taskbar: bool, changelog: bool) {
    let dir_path = ipc_dir();
    let install_dir = std::fs::read_to_string(dir_path.join("dir.txt"))
        .ok()
        .map(|s| s.trim().trim_end_matches(|c| c == '\\' || c == '/').to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(default_install_path);
    let exe_path = format!("{}\\muzicmania.exe", install_dir);
    let exe_quoted = ps_quote(&exe_path);
    let dir_quoted = ps_quote(&install_dir);

    if desktop {
        let ps = format!(
            "$WshShell = New-Object -comObject WScript.Shell; \
             $Shortcut = $WshShell.CreateShortcut(\"$([Environment]::GetFolderPath('Desktop'))\\MuzicMania.lnk\"); \
             $Shortcut.TargetPath = '{}'; \
             $Shortcut.WorkingDirectory = '{}'; \
             $Shortcut.IconLocation = '{}'; \
             $Shortcut.Save()",
            exe_quoted, dir_quoted, exe_quoted
        );
        let _ = std::process::Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &ps])
            .output();
    }

    if taskbar {
        let ps = format!(
            "$Shell = New-Object -ComObject Shell.Application; \
             $Folder = $Shell.NameSpace('{}'); \
             $File = $Folder.ParseName('muzicmania.exe'); \
             if ($File) {{ $Verb = $File.Verbs() | Where-Object {{ $_.Name -match 'taskbar' -or $_.Name -match 'barra de tareas' }}; if ($Verb) {{ $Verb.DoIt() }} }}",
            dir_quoted
        );
        let _ = std::process::Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &ps])
            .output();
    }

    if changelog {
        let _ = std::process::Command::new("cmd")
            .args(["/c", "start", "https://muzicmania.vercel.app/changelog"])
            .output();
    }

    let cmd = if run { "LAUNCH" } else { "DONE" };
    let _ = std::fs::write(dir_path.join("cmd.txt"), cmd);
    INSTALLER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(win) = app.get_webview_window("installer") {
        let _ = win.close();
    }
}

#[tauri::command]
fn installer_ipc_dir() -> String {
    ipc_dir().to_string_lossy().to_string()
}

#[tauri::command]
fn installer_write_cmd(cmd: String) {
    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("cmd.txt"), &cmd);
}

#[tauri::command]
fn installer_read_status() -> String {
    let path = ipc_dir().join("status.txt");
    std::fs::read_to_string(&path)
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "READY".to_string())
}

fn detect_windows_version() -> String {
    let output = std::process::Command::new("cmd")
        .args(["/c", "ver"])
        .output()
        .ok()
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .unwrap_or_default();
    let label = if let Some(ver_str) = output.split("Version").nth(1) {
        let ver_str = ver_str.trim().trim_end_matches(']').trim();
        let parts: Vec<&str> = ver_str.split('.').collect();
        if parts.len() >= 3 {
            let build: u32 = parts[2].parse().unwrap_or(0);
            if build >= 22000 {
                "Windows 11"
            } else {
                "Windows 10"
            }
        } else {
            "Windows"
        }
    } else {
        "Windows"
    };
    label.to_string()
}

fn detect_architecture() -> String {
    let arch = std::env::var("PROCESSOR_ARCHITECTURE").unwrap_or_default();
    if arch.contains("64") || arch == "AMD64" {
        "64 bits".to_string()
    } else if arch.contains("ARM") {
        "ARM".to_string()
    } else {
        "32 bits".to_string()
    }
}

#[cfg(target_os = "windows")]
fn disable_context_menu(window: &tauri::WebviewWindow) {
    let _ = window.with_webview(|pw| {
        let controller = pw.controller();
        unsafe {
            if let Ok(core) = controller.CoreWebView2() {
                if let Ok(settings) = core.Settings() {
                    let _ = settings.SetAreDefaultContextMenusEnabled(false);
                    let _ = settings.SetAreDevToolsEnabled(false);
                    let _ = settings.SetIsStatusBarEnabled(false);
                }
            }
        }
    });
}

#[tauri::command]
fn update_settings(state: tauri::State<SettingsState>, settings: DesktopSettings) {
    *state.0.lock().unwrap() = settings.clone();
    save_settings_to_disk(&settings);
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let is_installer = std::env::args().any(|a| a == "--installer");

            if is_installer {
                let installer = WebviewWindowBuilder::new(
                    app,
                    "installer",
                    WebviewUrl::App("installer.html".into()),
                )
                .inner_size(620.0, 620.0)
                .center()
                .resizable(false)
                .maximizable(false)
                .title("MuzicMania — Instalación")
                .decorations(true)
                .data_directory(std::env::temp_dir().join("muzicmania-installer-webview"))
                .build()
                .expect("Failed to create installer window");

                let installer_handle = installer.clone();
                let _ = installer.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        if INSTALLER_FORCE_CLOSE.load(Ordering::SeqCst) {
                            INSTALLER_FORCE_CLOSE.store(false, Ordering::SeqCst);
                            return;
                        }
                        api.prevent_close();
                        let js = r#"(function(){try{window.showCloseModal()}catch(e){var m=document.getElementById('close-modal');if(m)m.classList.add('active')}})()"#;
                        if let Err(e) = installer_handle.eval(js) {
                            eprintln!("installer eval showCloseModal failed: {}", e);
                        }
                    }
                });

                #[cfg(target_os = "windows")]
                disable_context_menu(&installer);

                return Ok(());
            }

            let settings = load_settings_from_disk();
            app.manage(SettingsState(Mutex::new(settings)));

            let launcher = WebviewWindowBuilder::new(
                app,
                "launcher",
                WebviewUrl::App("index.html".into()),
            )
            .inner_size(520.0, 560.0)
            .center()
            .resizable(false)
            .maximizable(false)
            .always_on_top(true)
            .title("MuzicMania")
            .decorations(true)
            .build()
            .expect("Failed to create launcher window");

            let launcher_handle = launcher.clone();
            let _ = launcher.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    if LAUNCHER_FORCE_CLOSE.load(Ordering::SeqCst) {
                        LAUNCHER_FORCE_CLOSE.store(false, Ordering::SeqCst);
                        return;
                    }
                    api.prevent_close();
                    let _ = launcher_handle.eval("showCloseDialog()");
                }
            });

            #[cfg(target_os = "windows")]
            disable_context_menu(&launcher);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            close_window,
            cancel_close,
            launcher_ready,
            launcher_close,
            launcher_cancel_close,
            get_settings,
            update_settings,
            installer_info,
            installer_ipc_dir,
            installer_write_cmd,
            installer_read_status,
            installer_set_lang,
            installer_set_dir,
            installer_start_install,
            installer_read_progress,
            installer_read_log,
            installer_pick_dir,
            installer_force_close,
            installer_cancel,
            installer_finish,
            is_first_run,
            mark_first_run_done,
        ])
        .run(tauri::generate_context!())
        .expect("Error al inicializar el ejecutable de MuzicMania");
}
