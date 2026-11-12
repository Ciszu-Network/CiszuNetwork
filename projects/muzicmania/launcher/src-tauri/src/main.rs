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
static UNINSTALLER_FORCE_CLOSE: AtomicBool = AtomicBool::new(false);
static CLOSE_TIMEOUT_ACTIVE: AtomicBool = AtomicBool::new(false);

fn default_true() -> bool {
    true
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct DesktopSettings {
    close_confirm: bool,
    link_confirm: bool,
    #[serde(default = "default_true")]
    auto_update: bool,
    #[serde(default = "default_true")]
    tutorial_done: bool,
}

impl Default for DesktopSettings {
    fn default() -> Self {
        Self {
            close_confirm: true,
            link_confirm: true,
            auto_update: true,
            tutorial_done: false,
        }
    }
}

struct SettingsState(Mutex<DesktopSettings>);

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, Default)]
struct LauncherSession {
    #[serde(default)]
    guest: bool,
    #[serde(default)]
    user_id: String,
    #[serde(default)]
    username: String,
    #[serde(default)]
    display_name: String,
    #[serde(default)]
    avatar_url: String,
    #[serde(default)]
    role: String,
}

struct LauncherState(Mutex<Option<LauncherSession>>);

#[derive(serde::Serialize, Clone, Debug, Default)]
struct UpdateStatus {
    state: String,
    downloaded: u64,
    total: u64,
    version: String,
    error: String,
    path: String,
}

struct UpdateState(Mutex<UpdateStatus>);

fn launcher_session_path() -> Option<std::path::PathBuf> {
    settings_path().map(|path| path.with_file_name("launcher_session.json"))
}

fn load_launcher_session() -> Option<LauncherSession> {
    let path = launcher_session_path()?;
    let data = std::fs::read_to_string(&path).ok()?;
    let session = serde_json::from_str::<LauncherSession>(&data).ok()?;
    // Reescribe el JSON sin campos heredados (tokens/email) de versiones anteriores.
    if let Ok(sanitized) = serde_json::to_string(&session) {
        let _ = std::fs::write(&path, sanitized);
    }
    Some(session)
}

fn save_launcher_session(session: Option<&LauncherSession>) {
    let Some(path) = launcher_session_path() else {
        return;
    };
    match session {
        Some(session) => {
            if let Ok(data) = serde_json::to_string(session) {
                let _ = std::fs::write(path, data);
            }
        }
        None => {
            let _ = std::fs::remove_file(path);
        }
    }
}

fn guest_session() -> LauncherSession {
    LauncherSession {
        guest: true,
        display_name: "Invitado".to_string(),
        username: "invitado".to_string(),
        role: "guest".to_string(),
        ..LauncherSession::default()
    }
}

#[cfg(target_os = "windows")]
fn hidden_command(program: &str) -> std::process::Command {
    use std::os::windows::process::CommandExt;
    let mut command = std::process::Command::new(program);
    command.creation_flags(0x08000000);
    command
}

#[cfg(not(target_os = "windows"))]
fn hidden_command(program: &str) -> std::process::Command {
    std::process::Command::new(program)
}

#[cfg(target_os = "windows")]
fn set_taskbar_identity() {
    use windows::Win32::UI::Shell::SetCurrentProcessExplicitAppUserModelID;
    let _ = unsafe {
        SetCurrentProcessExplicitAppUserModelID(windows::core::w!("com.ciszunetwork.muzicmania"))
    };
}

#[cfg(target_os = "windows")]
fn xml_escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

#[cfg(target_os = "windows")]
fn show_windows_toast(title: &str, body: &str) {
    use windows::core::HSTRING;
    use windows::Data::Xml::Dom::XmlDocument;
    use windows::UI::Notifications::{ToastNotification, ToastNotificationManager};

    let xml_text = format!(
        "<toast><visual><binding template=\"ToastGeneric\"><text>{}</text><text>{}</text></binding></visual></toast>",
        xml_escape(title),
        xml_escape(body)
    );
    let Ok(xml) = XmlDocument::new() else {
        return;
    };
    if xml.LoadXml(&HSTRING::from(xml_text)).is_err() {
        return;
    }
    let Ok(toast) = ToastNotification::CreateToastNotification(&xml) else {
        return;
    };
    let Ok(notifier) = ToastNotificationManager::CreateToastNotifierWithId(&HSTRING::from(
        "com.ciszunetwork.muzicmania",
    )) else {
        return;
    };
    let _ = notifier.Show(&toast);
}

fn windows_build_number() -> u32 {
    read_reg_value(
        r"HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion",
        "CurrentBuildNumber",
    )
    .and_then(|value| value.trim().parse::<u32>().ok())
    .unwrap_or(0)
}

fn write_pin_result(result: &str) {
    let path = std::env::var("APPDATA")
        .map(|base| std::path::PathBuf::from(base).join("MuzicMania"))
        .unwrap_or_else(|_| std::env::temp_dir());
    let _ = std::fs::create_dir_all(&path);
    let _ = std::fs::write(path.join("pin-result.txt"), result);
}

#[cfg(target_os = "windows")]
fn find_start_menu_shortcut(root: &std::path::Path, depth: u8) -> Option<std::path::PathBuf> {
    let entries = std::fs::read_dir(root).ok()?;
    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_ascii_lowercase();
        if name == "muzicmania.lnk" {
            return Some(path);
        }
        if depth > 0 && path.is_dir() {
            if let Some(found) = find_start_menu_shortcut(&path, depth - 1) {
                return Some(found);
            }
        }
    }
    None
}

#[cfg(target_os = "windows")]
fn remove_user_start_menu_shortcut() {
    let Some(roaming) = std::env::var("APPDATA").ok() else {
        return;
    };
    let shortcut = std::path::PathBuf::from(roaming)
        .join("Microsoft")
        .join("Windows")
        .join("Start Menu")
        .join("Programs")
        .join("MuzicMania.lnk");
    let _ = std::fs::remove_file(shortcut);
}

#[cfg(target_os = "windows")]
fn ensure_user_start_menu_shortcut() {
    let Some(common) = std::env::var("PROGRAMDATA").ok() else {
        return;
    };
    let Some(roaming) = std::env::var("APPDATA").ok() else {
        return;
    };
    let common_programs = std::path::PathBuf::from(common)
        .join("Microsoft")
        .join("Windows")
        .join("Start Menu")
        .join("Programs");
    let Some(source) = find_start_menu_shortcut(&common_programs, 2) else {
        return;
    };
    let user_programs = std::path::PathBuf::from(roaming)
        .join("Microsoft")
        .join("Windows")
        .join("Start Menu")
        .join("Programs");
    if std::fs::create_dir_all(&user_programs).is_ok() {
        let _ = std::fs::copy(source, user_programs.join("MuzicMania.lnk"));
    }
}

#[cfg(target_os = "windows")]
fn pin_taskbar_win11() -> Result<bool, String> {
    use windows::core::factory;
    use windows::UI::Shell::{ITaskbarManagerDesktopAppSupportStatics, TaskbarManager};

    let _: ITaskbarManagerDesktopAppSupportStatics =
        factory::<TaskbarManager, ITaskbarManagerDesktopAppSupportStatics>()
            .map_err(|error| format!("desktop_support: {error}"))?;

    let manager = TaskbarManager::GetDefault().map_err(|error| error.to_string())?;
    if !manager.IsSupported().map_err(|error| error.to_string())? {
        return Err("taskbar_not_supported".to_string());
    }
    if manager
        .IsCurrentAppPinnedAsync()
        .map_err(|error| error.to_string())?
        .get()
        .map_err(|error| error.to_string())?
    {
        return Ok(true);
    }
    if !manager
        .IsPinningAllowed()
        .map_err(|error| error.to_string())?
    {
        return Err("pinning_not_allowed".to_string());
    }

    manager
        .RequestPinCurrentAppAsync()
        .map_err(|error| error.to_string())?
        .get()
        .map_err(|error| error.to_string())
}

#[cfg(target_os = "windows")]
fn pin_taskbar_legacy() -> Result<(), String> {
    let script = r#"$ErrorActionPreference = 'SilentlyContinue';
$roots = @(
  [Environment]::GetFolderPath('CommonStartMenu'),
  [Environment]::GetFolderPath('StartMenu')
);
$shortcut = @($roots | Where-Object { $_ } | ForEach-Object {
  Get-ChildItem -LiteralPath $_ -Filter 'MuzicMania.lnk' -Recurse -ErrorAction SilentlyContinue
}) | Select-Object -First 1;
if (-not $shortcut) { Write-Output 'NO_SHORTCUT'; exit 0 }
$shell = New-Object -ComObject Shell.Application;
$folder = $shell.NameSpace($shortcut.DirectoryName);
$item = $folder.ParseName($shortcut.Name);
$verbs = @($item.Verbs());
$pin = $verbs | Where-Object { $_.Name -match '(?i)taskbar|barra de tareas|tálc|tálca|taskleiste|barre des tâches|barra delle applicazioni|taakbalk|pasek zadań|görev çubuğu|شريط المهام|タスク バー|작업 표시줄|任务栏|工作列' } | Select-Object -First 1;
if ($pin) { $pin.DoIt(); Write-Output 'PINNED'; exit 0 }
try { $item.InvokeVerb('taskbarpin'); Write-Output 'PINNED'; exit 0 } catch {}
Write-Output 'NO_VERB';"#;
    let output = hidden_command("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-WindowStyle",
            "Hidden",
            "-Command",
            script,
        ])
        .output()
        .map_err(|error| error.to_string())?;
    let stdout = String::from_utf8_lossy(&output.stdout);
    if stdout.lines().any(|line| line.trim() == "PINNED") {
        Ok(())
    } else {
        Err(stdout.trim().to_string())
    }
}

#[cfg(target_os = "windows")]
fn show_taskbar_pin_help() {
    use windows::Win32::UI::Shell::ShellExecuteW;
    use windows::Win32::UI::WindowsAndMessaging::{
        MessageBoxW, IDYES, MB_ICONINFORMATION, MB_SETFOREGROUND, MB_TOPMOST, MB_YESNO,
        SW_SHOWNORMAL,
    };

    let message = windows::core::w!(
        "MuzicMania no pudo anclarse automáticamente.\n\n\
         Abre Inicio > MuzicMania, clic derecho > Anclar a la barra de tareas.\n\n\
         Windows couldn't pin MuzicMania automatically. Open Start > MuzicMania, right-click > Pin to taskbar.\n\n\
         ¿Abrir la lista de aplicaciones? / Open the app list?"
    );
    let caption = windows::core::w!("MuzicMania");
    let result = unsafe {
        MessageBoxW(
            None,
            message,
            caption,
            MB_YESNO | MB_ICONINFORMATION | MB_SETFOREGROUND | MB_TOPMOST,
        )
    };
    if result == IDYES {
        unsafe {
            let _ = ShellExecuteW(
                None,
                windows::core::w!("open"),
                windows::core::w!("shell:AppsFolder"),
                windows::core::PCWSTR::null(),
                windows::core::PCWSTR::null(),
                SW_SHOWNORMAL,
            );
        }
    }
}

#[cfg(target_os = "windows")]
fn request_taskbar_pin() {
    ensure_user_start_menu_shortcut();
    if windows_build_number() >= 22000 {
        match pin_taskbar_win11() {
            Ok(_) => {
                write_pin_result("pin:win11");
            }
            Err(error) => {
                write_pin_result(&format!("manual:win11:{error}"));
                show_taskbar_pin_help();
            }
        }
        return;
    }

    match pin_taskbar_legacy() {
        Ok(()) => {
            write_pin_result("pin:legacy");
        }
        Err(error) => {
            write_pin_result(&format!("manual:legacy:{error}"));
            show_taskbar_pin_help();
        }
    }
}

fn settings_path() -> Option<std::path::PathBuf> {
    let base = std::env::var("APPDATA")
        .or_else(|_| std::env::var("AppData"))
        .ok()?;
    let dir = std::path::PathBuf::from(base).join("MuzicMania");
    let _ = std::fs::create_dir_all(&dir);
    Some(dir.join("desktop_settings.json"))
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

    LAUNCHER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(launcher) = app.get_webview_window("launcher") {
        let _ = launcher.close();
    }
}

#[tauri::command]
fn open_url(url: String) {
    if !url.starts_with("https://") && !url.starts_with("http://") {
        return;
    }
    let ps = format!(
        "$ErrorActionPreference='SilentlyContinue'; Start-Process '{}'",
        ps_quote(&url)
    );
    let _ = hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &ps])
        .output();
}

#[tauri::command]
fn server_status(url: String) -> u16 {
    let output = hidden_command("curl")
        .args(["-sS", "-o", "NUL", "-w", "%{http_code}", "--max-time", "6", "--head", &url])
        .output();
    if let Ok(output) = output {
        let text = String::from_utf8_lossy(&output.stdout);
        if let Ok(code) = text.trim().parse::<u16>() {
            return code;
        }
    }
    0
}

#[tauri::command]
fn launcher_offline_game(app: tauri::AppHandle) -> Result<(), String> {
    let win = app
        .get_webview_window("launcher")
        .ok_or_else(|| "launcher_window_missing".to_string())?;
    win.set_title("MuzicMania — Offline").map_err(|e| e.to_string())?;
    win.set_resizable(true).map_err(|e| e.to_string())?;
    win.set_maximizable(true).map_err(|e| e.to_string())?;
    win.maximize().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn offline_game_close(app: tauri::AppHandle) {
    LAUNCHER_FORCE_CLOSE.store(true, Ordering::SeqCst);
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
struct LauncherBoot {
    version: String,
    first_run: bool,
    tutorial_done: bool,
    auto_update: bool,
    session: Option<LauncherSession>,
}

#[tauri::command]
fn launcher_boot(state: tauri::State<LauncherState>) -> LauncherBoot {
    let settings = load_settings_from_disk();
    LauncherBoot {
        version: env!("CARGO_PKG_VERSION").to_string(),
        first_run: !settings_path().map(|path| path.exists()).unwrap_or(false),
        tutorial_done: settings.tutorial_done,
        auto_update: settings.auto_update,
        session: state.0.lock().unwrap().clone(),
    }
}

#[tauri::command]
fn launcher_session(state: tauri::State<LauncherState>) -> Option<LauncherSession> {
    state.0.lock().unwrap().clone()
}

#[tauri::command]
fn launcher_guest(state: tauri::State<LauncherState>) -> LauncherSession {
    let session = guest_session();
    save_launcher_session(Some(&session));
    *state.0.lock().unwrap() = Some(session.clone());
    session
}

#[tauri::command]
fn launcher_logout(app: tauri::AppHandle, state: tauri::State<LauncherState>) {
    save_launcher_session(None);
    *state.0.lock().unwrap() = None;
    if let Some(window) = app.get_webview_window("launcher") {
        let _ = window.clear_all_browsing_data();
    }
}

#[tauri::command]
fn launcher_mark_tutorial_done(state: tauri::State<SettingsState>) {
    let mut settings = state.0.lock().unwrap();
    settings.tutorial_done = true;
    save_settings_to_disk(&settings);
}

#[tauri::command]
fn launcher_show_hub(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("launcher") {
        let _ = window.set_always_on_top(false);
        let _ = window.set_resizable(true);
        let _ = window.set_maximizable(true);
        let _ = window.maximize();
        let _ = window.set_focus();
    }
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn launcher_pin_taskbar(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("launcher") {
        let _ = window.set_focus();
    }
    request_taskbar_pin();
}

#[tauri::command]
fn launcher_show_small(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("launcher") {
        let _ = window.set_always_on_top(true);
        let _ = window.unmaximize();
        let _ = window.set_resizable(false);
        let _ = window.set_size(tauri::LogicalSize::new(560.0, 700.0));
        let _ = window.center();
        let _ = window.set_focus();
    }
}

#[cfg(target_os = "windows")]
const LAUNCHER_AUTH_URL: &str = "https://muzicmania.vercel.app/login?launcher=1";

#[cfg(target_os = "windows")]
fn apply_launcher_session(app: &tauri::AppHandle, session: LauncherSession) {
    save_launcher_session(Some(&session));
    if let Some(state) = app.try_state::<LauncherState>() {
        *state.0.lock().unwrap() = Some(session);
    }
    let _ = app.emit("launcher-auth-finished", ());
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn launcher_open_login(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("launcher-auth") {
        let _ = window.set_focus();
        return Ok(());
    }
    let auth_url = LAUNCHER_AUTH_URL
        .parse()
        .map_err(|error| format!("auth_url: {error}"))?;
    let auth_app = app.clone();
    WebviewWindowBuilder::new(&app, "launcher-auth", WebviewUrl::External(auth_url))
        .inner_size(560.0, 760.0)
        .min_inner_size(460.0, 620.0)
        .center()
        .resizable(true)
        .title("MuzicMania — CISZU ID")
        .on_navigation(move |url| {
            if url.host_str() == Some("muzicmania.vercel.app")
                && url.path() == "/launcher-auth"
            {
                let session = url
                    .query_pairs()
                    .find(|(key, _)| key == "session")
                    .and_then(|(_, value)| serde_json::from_str::<LauncherSession>(&value).ok());
                if let Some(session) = session {
                    apply_launcher_session(&auth_app, session);
                }
                if let Some(window) = auth_app.get_webview_window("launcher-auth") {
                    let _ = window.close();
                }
                false
            } else {
                true
            }
        })
        .build()
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn launcher_restart(app: tauri::AppHandle) {
    if let Ok(executable) = std::env::current_exe() {
        let _ = hidden_command("cmd")
            .args(["/C", "start", "", &executable.to_string_lossy()])
            .spawn();
    }
    LAUNCHER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    app.exit(0);
}

#[derive(serde::Serialize)]
struct UpdateInfo {
    available: bool,
    current: String,
    latest: String,
    url: String,
    size: u64,
    notes: String,
    error: String,
}

fn version_tuple(value: &str) -> Vec<u32> {
    value
        .trim_start_matches('v')
        .split('.')
        .map(|part| part.parse::<u32>().unwrap_or(0))
        .collect()
}

fn version_is_newer(latest: &str, current: &str) -> bool {
    version_tuple(latest) > version_tuple(current)
}

#[tauri::command]
fn launcher_check_update() -> UpdateInfo {
    let current = env!("CARGO_PKG_VERSION").to_string();
    let output = hidden_command("curl")
        .args([
            "-sS",
            "-L",
            "--max-time",
            "15",
            "-H",
            "User-Agent: MuzicMania-Launcher",
            "https://api.github.com/repos/Ciszu-Network/CiszuNetwork/releases/latest",
        ])
        .output();
    let Ok(output) = output else {
        return UpdateInfo {
            available: false,
            current,
            latest: String::new(),
            url: String::new(),
            size: 0,
            notes: String::new(),
            error: "No se pudo comprobar la actualización.".to_string(),
        };
    };
    if !output.status.success() {
        return UpdateInfo {
            available: false,
            current,
            latest: String::new(),
            url: String::new(),
            size: 0,
            notes: String::new(),
            error: "No se pudo comprobar la actualización.".to_string(),
        };
    }
    let Ok(release) = serde_json::from_slice::<serde_json::Value>(&output.stdout) else {
        return UpdateInfo {
            available: false,
            current,
            latest: String::new(),
            url: String::new(),
            size: 0,
            notes: String::new(),
            error: "Respuesta de actualización inválida.".to_string(),
        };
    };
    let latest = release
        .get("tag_name")
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .trim_start_matches("muzicmania-")
        .to_string();
    let notes = release
        .get("body")
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .to_string();
    let wanted = if windows_build_number() >= 22000 {
        "Windows11_x64.exe"
    } else {
        "Windows10_x64.exe"
    };
    let assets = release
        .get("assets")
        .and_then(|value| value.as_array())
        .cloned()
        .unwrap_or_default();
    let asset = assets
        .iter()
        .find(|asset| {
            asset
                .get("name")
                .and_then(|value| value.as_str())
                .map(|name| name.ends_with(wanted))
                .unwrap_or(false)
        })
        .or_else(|| {
            assets.iter().find(|asset| {
                asset
                    .get("name")
                    .and_then(|value| value.as_str())
                    .map(|name| name.ends_with("Windows11_x64.exe"))
                    .unwrap_or(false)
            })
        });
    let url = asset
        .and_then(|asset| asset.get("browser_download_url"))
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .to_string();
    let size = asset
        .and_then(|asset| asset.get("size"))
        .and_then(|value| value.as_u64())
        .unwrap_or(0);
    UpdateInfo {
        available: !latest.is_empty() && !url.is_empty() && version_is_newer(&latest, &current),
        current,
        latest,
        url,
        size,
        notes,
        error: String::new(),
    }
}

#[tauri::command]
fn launcher_update_progress(state: tauri::State<UpdateState>) -> UpdateStatus {
    state.0.lock().unwrap().clone()
}

#[tauri::command]
fn launcher_start_update(
    app: tauri::AppHandle,
    url: String,
    size: u64,
    version: String,
) -> Result<(), String> {
    if !url.starts_with("https://github.com/Ciszu-Network/CiszuNetwork/releases/download/") {
        return Err("update_url_invalid".to_string());
    }
    let state = app.state::<UpdateState>();
    {
        let mut status = state.0.lock().unwrap();
        if status.state == "downloading" {
            return Ok(());
        }
        *status = UpdateStatus {
            state: "downloading".to_string(),
            downloaded: 0,
            total: size,
            version,
            error: String::new(),
            path: String::new(),
        };
    }

    let update_app = app.clone();
    std::thread::spawn(move || {
        let update_state = update_app.state::<UpdateState>();
        let Some(local) = std::env::var("LOCALAPPDATA").ok() else {
            let mut status = update_state.0.lock().unwrap();
            status.state = "error".to_string();
            status.error = "LOCALAPPDATA no disponible.".to_string();
            return;
        };
        let update_dir = std::path::PathBuf::from(local).join("MuzicMania").join("update");
        let _ = std::fs::create_dir_all(&update_dir);
        let setup_path = update_dir.join("MuzicMania-update.exe");
        let _ = std::fs::remove_file(&setup_path);
        {
            let mut status = update_state.0.lock().unwrap();
            status.path = setup_path.to_string_lossy().to_string();
        }

        let mut child = match hidden_command("curl")
            .args([
                "-L",
                "--fail",
                "--retry",
                "3",
                "--retry-delay",
                "2",
                "--silent",
                "--show-error",
                "--output",
                &setup_path.to_string_lossy(),
                &url,
            ])
            .spawn()
        {
            Ok(child) => child,
            Err(error) => {
                let mut status = update_state.0.lock().unwrap();
                status.state = "error".to_string();
                status.error = format!("No se pudo iniciar la descarga: {error}");
                return;
            }
        };

        loop {
            let downloaded = std::fs::metadata(&setup_path)
                .map(|metadata| metadata.len())
                .unwrap_or(0);
            {
                let mut status = update_state.0.lock().unwrap();
                status.downloaded = downloaded;
                if status.total == 0 {
                    status.total = downloaded;
                }
            }
            match child.try_wait() {
                Ok(Some(exit)) => {
                    let mut status = update_state.0.lock().unwrap();
                    if exit.success() && downloaded > 0 {
                        status.state = "ready".to_string();
                        status.downloaded = downloaded;
                        if status.total < downloaded {
                            status.total = downloaded;
                        }
                    } else {
                        status.state = "error".to_string();
                        status.error = format!("La descarga terminó con código {exit}.");
                    }
                    return;
                }
                Ok(None) => std::thread::sleep(Duration::from_millis(250)),
                Err(error) => {
                    let mut status = update_state.0.lock().unwrap();
                    status.state = "error".to_string();
                    status.error = format!("Descarga interrumpida: {error}");
                    return;
                }
            }
        }
    });
    Ok(())
}

#[tauri::command]
fn launcher_apply_update(app: tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<UpdateState>();
    let path = state.0.lock().unwrap().path.clone();
    if path.is_empty() || !std::path::Path::new(&path).exists() {
        return Err("update_not_downloaded".to_string());
    }
    let ps = format!(
        "$ErrorActionPreference='SilentlyContinue'; Start-Process -FilePath '{}' -Verb RunAs",
        ps_quote(&path)
    );
    let _ = hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &ps])
        .spawn();
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_millis(900));
        LAUNCHER_FORCE_CLOSE.store(true, Ordering::SeqCst);
        app.exit(0);
    });
    Ok(())
}

#[derive(serde::Serialize)]
struct DiskInfo {
    drive: String,
    free_bytes: u64,
    total_bytes: u64,
}

#[derive(serde::Serialize, Default, Clone)]
struct InstalledState {
    installed: bool,
    version: String,
    path: String,
}

#[derive(serde::Serialize)]
struct InstallerInfo {
    version: String,
    os: String,
    arch: String,
    dir: String,
    install_path: String,
    installed: bool,
    installed_version: String,
    installed_path: String,
    webview2: String,
}

fn read_reg_value(key: &str, value: &str) -> Option<String> {
    for arch in ["/reg:64", "/reg:32"] {
        let output = hidden_command("reg")
            .args(["query", key, "/v", value, arch])
            .output()
            .ok()?;
        if !output.status.success() {
            continue;
        }
        let text = String::from_utf8_lossy(&output.stdout);
        for line in text.lines() {
            if let Some(index) = line.find("REG_SZ") {
                let v = line[index + 6..].trim().trim_matches('"').to_string();
                if !v.is_empty() {
                    return Some(v);
                }
            }
        }
    }
    None
}

fn detect_installed() -> InstalledState {
    let keys = [
        r"HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\MuzicMania",
        r"HKLM\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\MuzicMania",
        r"HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\MuzicMania",
    ];
    for key in keys {
        let Some(path) = read_reg_value(key, "InstallLocation") else {
            continue;
        };
        let clean = path.trim().trim_matches('"').trim_end_matches(|c| c == '\\' || c == '/');
        if clean.is_empty() {
            continue;
        }
        let dir = std::path::PathBuf::from(clean);
        if dir.join("muzicmania.exe").exists() || dir.join("uninstall.exe").exists() {
            let version = read_reg_value(key, "DisplayVersion")
                .or_else(|| std::fs::read_to_string(dir.join("version.txt")).ok())
                .map(|v| v.trim().to_string())
                .filter(|v| !v.is_empty())
                .unwrap_or_else(|| "unknown".to_string());
            return InstalledState {
                installed: true,
                version,
                path: clean.to_string(),
            };
        }
    }

    let fallbacks = [
        default_install_path(),
        std::env::var("LOCALAPPDATA")
            .map(|p| format!("{}\\MuzicMania", p))
            .unwrap_or_default(),
    ];
    for path in fallbacks {
        if path.is_empty() {
            continue;
        }
        let dir = std::path::PathBuf::from(&path);
        if dir.join("muzicmania.exe").exists() || dir.join("uninstall.exe").exists() {
            let version = std::fs::read_to_string(dir.join("version.txt"))
                .ok()
                .map(|v| v.trim().to_string())
                .filter(|v| !v.is_empty())
                .unwrap_or_else(|| "unknown".to_string());
            return InstalledState {
                installed: true,
                version,
                path,
            };
        }
    }

    InstalledState::default()
}

fn default_install_path() -> String {
    let program_files = std::env::var("PROGRAMFILES")
        .or_else(|_| std::env::var("ProgramFiles"))
        .unwrap_or_else(|_| "C:\\Program Files".to_string());
    format!("{}\\MuzicMania", program_files)
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
    let installed = detect_installed();
    let dir = if installer_mode {
        if installed.installed && !installed.path.is_empty() {
            installed.path.clone()
        } else {
            installer_default_path()
        }
    } else {
        current_install_path()
    };
    InstallerInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        os: detect_windows_version(),
        arch: detect_architecture(),
        dir: dir.clone(),
        install_path: dir,
        installed: installed.installed,
        installed_version: installed.version,
        installed_path: installed.path,
        webview2: read_reg_value(r"HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}", "pv").or_else(|| read_reg_value(r"HKCU\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}", "pv")).unwrap_or_default(),
    }
}

#[tauri::command]
fn installer_disk_info(path: String) -> DiskInfo {
    let drive = if path.len() >= 2 && path.as_bytes()[1] == b':' {
        path[..2].to_string()
    } else {
        "C:".to_string()
    };
    let ps = format!(
        "$d=[System.IO.DriveInfo]::new('{}'); Write-Output ($d.Name + '|' + $d.AvailableFreeSpace + '|' + $d.TotalSize)",
        ps_quote(&drive)
    );
    let output = hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", &ps])
        .output();
    if let Ok(output) = output {
        let text = String::from_utf8_lossy(&output.stdout);
        let parts: Vec<&str> = text.trim().split('|').collect();
        if parts.len() == 3 {
            return DiskInfo {
                drive: parts[0].to_string(),
                free_bytes: parts[1].parse().unwrap_or(0),
                total_bytes: parts[2].parse().unwrap_or(0),
            };
        }
    }
    DiskInfo {
        drive,
        free_bytes: 0,
        total_bytes: 0,
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
    hidden_command("powershell")
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
fn installer_run_uninstaller(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let clean = path
        .trim()
        .trim_end_matches(|c| c == '\\' || c == '/')
        .to_string();
    if clean.is_empty() {
        return Err("invalid_install_path".to_string());
    }
    let uninstaller = std::path::PathBuf::from(&clean).join("uninstall.exe");
    if !uninstaller.exists() {
        return Err("uninstaller_not_found".to_string());
    }

    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("cmd.txt"), "ABORT");

    let ps = format!(
        "$ErrorActionPreference = 'SilentlyContinue'; Start-Sleep -Milliseconds 1800; Start-Process -FilePath '{}' -WorkingDirectory '{}'",
        ps_quote(&uninstaller.to_string_lossy()),
        ps_quote(&clean)
    );
    hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &ps])
        .spawn()
        .map_err(|e| e.to_string())?;

    INSTALLER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(win) = app.get_webview_window("installer") {
        let _ = win.close();
    }
    Ok(())
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
        let _ = hidden_command("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &ps])
            .output();
    }

    if changelog {
        let ps = "$ErrorActionPreference = 'SilentlyContinue'; Start-Process 'https://muzicmania.vercel.app/changelog'";
        let _ = hidden_command("powershell")
            .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", ps])
            .output();
    }

    let cmd = match (run, taskbar) {
        (true, true) => "LAUNCH_PIN",
        (false, true) => "PIN_ONLY",
        (true, false) => "LAUNCH",
        (false, false) => "DONE",
    };
    let _ = std::fs::write(dir_path.join("cmd.txt"), cmd);
    #[cfg(target_os = "windows")]
    show_windows_toast(
        "MuzicMania instalado",
        "Gracias por elegir Ciszu Network. Tu launcher está listo.",
    );
    INSTALLER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(win) = app.get_webview_window("installer") {
        let _ = win.close();
    }
}

#[derive(serde::Serialize)]
struct UninstallerInfo {
    installed: bool,
    version: String,
    install_path: String,
    data_path: String,
    webview_data_path: String,
    size_bytes: u64,
}

fn directory_size(path: &std::path::Path) -> u64 {
    let mut total = 0u64;
    let Ok(entries) = std::fs::read_dir(path) else {
        return 0;
    };
    for entry in entries.flatten() {
        let p = entry.path();
        if p.is_dir() {
            total += directory_size(&p);
        } else if let Ok(meta) = entry.metadata() {
            total += meta.len();
        }
    }
    total
}

#[tauri::command]
fn uninstaller_info() -> UninstallerInfo {
    let install_path = installer_default_path();
    let install_dir = std::path::Path::new(&install_path);
    let version = std::fs::read_to_string(install_dir.join("version.txt"))
        .ok()
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
        .unwrap_or_else(|| env!("CARGO_PKG_VERSION").to_string());
    let appdata = std::env::var("APPDATA")
        .map(|p| format!("{}\\MuzicMania", p))
        .unwrap_or_default();
    let webview_data = std::env::var("LOCALAPPDATA")
        .map(|p| format!("{}\\com.ciszunetwork.muzicmania", p))
        .unwrap_or_default();
    UninstallerInfo {
        installed: install_dir.join("uninstall.exe").exists() || install_dir.join("muzicmania.exe").exists(),
        version,
        install_path: install_path.clone(),
        data_path: appdata,
        webview_data_path: webview_data,
        size_bytes: directory_size(install_dir),
    }
}

#[tauri::command]
fn uninstaller_start(delete_data: bool, reason: String, feedback: String, rating: u8) {
    #[cfg(target_os = "windows")]
    remove_user_start_menu_shortcut();
    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("delete_data.txt"), if delete_data { "1" } else { "0" });
    let payload = format!(
        "rating={}\nreason={}\nfeedback={}\n",
        rating,
        reason.replace('\n', " "),
        feedback.replace('\r', " ").replace('\n', "\\n")
    );
    let _ = std::fs::write(dir.join("feedback.txt"), payload.clone());
    if let Ok(program_data) = std::env::var("PROGRAMDATA") {
        let log_dir = std::path::PathBuf::from(program_data).join("CiszuNetwork");
        let _ = std::fs::create_dir_all(&log_dir);
        if let Ok(mut file) = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(log_dir.join("uninstall-feedback.log"))
        {
            use std::io::Write;
            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);
            let _ = writeln!(file, "{} {}", timestamp, payload.replace('\n', " | "));
        }
    }
    let _ = std::fs::write(dir.join("cmd.txt"), "UNINSTALL");
}

#[tauri::command]
fn uninstaller_cancel(app: tauri::AppHandle) {
    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("cmd.txt"), "ABORT");
    UNINSTALLER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(win) = app.get_webview_window("uninstaller") {
        let _ = win.close();
    }
}

#[tauri::command]
fn uninstaller_finish(app: tauri::AppHandle) {
    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("cmd.txt"), "CLOSE");
    UNINSTALLER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(win) = app.get_webview_window("uninstaller") {
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
    let output = hidden_command("cmd")
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
    #[cfg(target_os = "windows")]
    set_taskbar_identity();

    tauri::Builder::default()
        .setup(|app| {
            let args: Vec<String> = std::env::args().collect();
            let is_installer = args.iter().any(|arg| arg == "--installer");
            let pin_taskbar = args.iter().any(|arg| arg == "--pin-taskbar");
            let pin_only = args.iter().any(|arg| arg == "--pin-only");

            if is_installer {
                let installer = WebviewWindowBuilder::new(
                    app,
                    "installer",
                    WebviewUrl::App("installer.html".into()),
                )
                .inner_size(700.0, 760.0)
                .min_inner_size(520.0, 560.0)
                .center()
                .resizable(true)
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

            let is_uninstaller = std::env::args().any(|a| a == "--uninstaller");

            if is_uninstaller {
                let uninstaller = WebviewWindowBuilder::new(
                    app,
                    "uninstaller",
                    WebviewUrl::App("uninstaller.html".into()),
                )
                .inner_size(700.0, 760.0)
                .min_inner_size(520.0, 560.0)
                .center()
                .resizable(true)
                .maximizable(false)
                .title("MuzicMania — Desinstalación")
                .decorations(true)
                .data_directory(std::env::temp_dir().join("muzicmania-uninstaller-webview"))
                .build()
                .expect("Failed to create uninstaller window");

                let uninstaller_handle = uninstaller.clone();
                let _ = uninstaller.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        if UNINSTALLER_FORCE_CLOSE.load(Ordering::SeqCst) {
                            UNINSTALLER_FORCE_CLOSE.store(false, Ordering::SeqCst);
                            return;
                        }
                        api.prevent_close();
                        let js = r#"(function(){try{window.showUninstallerCloseModal()}catch(e){var m=document.getElementById('close-modal');if(m)m.classList.add('active')}})()"#;
                        if let Err(e) = uninstaller_handle.eval(js) {
                            eprintln!("uninstaller eval showCloseModal failed: {}", e);
                        }
                    }
                });

                #[cfg(target_os = "windows")]
                disable_context_menu(&uninstaller);

                return Ok(());
            }
            let settings = load_settings_from_disk();
            let session = load_launcher_session();
            app.manage(SettingsState(Mutex::new(settings)));
            app.manage(LauncherState(Mutex::new(session)));
            app.manage(UpdateState(Mutex::new(UpdateStatus::default())));

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

            #[cfg(target_os = "windows")]
            if pin_taskbar {
                let pin_handle = app.handle().clone();
                std::thread::spawn(move || {
                    std::thread::sleep(Duration::from_millis(1400));
                    let ui_handle = pin_handle.clone();
                    let _ = pin_handle.run_on_main_thread(move || {
                        if let Some(window) = ui_handle.get_webview_window("launcher") {
                            let _ = window.set_focus();
                            if let Ok(hwnd) = window.hwnd() {
                                unsafe {
                                    use windows::Win32::UI::WindowsAndMessaging::{
                                        BringWindowToTop, SetForegroundWindow, ShowWindow, SW_RESTORE,
                                    };
                                    let _ = ShowWindow(hwnd, SW_RESTORE);
                                    let _ = BringWindowToTop(hwnd);
                                    let _ = SetForegroundWindow(hwnd);
                                }
                            }
                        }
                        std::thread::sleep(Duration::from_millis(250));
                        request_taskbar_pin();
                        if pin_only {
                            LAUNCHER_FORCE_CLOSE.store(true, Ordering::SeqCst);
                            if let Some(window) = ui_handle.get_webview_window("launcher") {
                                let _ = window.close();
                            }
                            ui_handle.exit(0);
                        }
                    });
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            close_window,
            cancel_close,
            server_status,
            open_url,
            launcher_ready,
            launcher_offline_game,
            offline_game_close,
            launcher_close,
            launcher_cancel_close,
            get_settings,
            update_settings,
            installer_info,
            installer_disk_info,
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
            installer_run_uninstaller,
            installer_finish,
            uninstaller_info,
            uninstaller_start,
            uninstaller_cancel,
            uninstaller_finish,
            is_first_run,
            mark_first_run_done,
            launcher_boot,
            launcher_session,
            launcher_guest,
            launcher_logout,
            launcher_mark_tutorial_done,
            launcher_show_hub,
            launcher_show_small,
            launcher_pin_taskbar,
            launcher_open_login,
            launcher_restart,
            launcher_check_update,
            launcher_start_update,
            launcher_update_progress,
            launcher_apply_update,
        ])
        .run(tauri::generate_context!())
        .expect("Error al inicializar el ejecutable de MuzicMania");
}
