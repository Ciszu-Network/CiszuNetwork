#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Mutex, OnceLock};
use std::time::Duration;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

#[cfg(feature = "local-db")]
mod db;
mod policy;

const LAUNCHER_VERSION: &str = env!("MUZIC_LAUNCHER_VERSION");
const GAME_VERSION: &str = env!("MUZIC_GAME_VERSION");
const BUILD_CHANNEL: &str = env!("MUZIC_CHANNEL");
const BUILD_DATE: &str = env!("MUZIC_BUILD_DATE");
const CHANGELOG_URL: &str = env!("MUZIC_CHANGELOG_URL");

static FORCE_CLOSE: AtomicBool = AtomicBool::new(false);
static LAUNCHER_FORCE_CLOSE: AtomicBool = AtomicBool::new(false);
static INSTALLER_FORCE_CLOSE: AtomicBool = AtomicBool::new(false);
static UNINSTALLER_FORCE_CLOSE: AtomicBool = AtomicBool::new(false);
static CLOSE_TIMEOUT_ACTIVE: AtomicBool = AtomicBool::new(false);
static POLICY_BLOCKED: AtomicBool = AtomicBool::new(false);
static INSTALLER_SETUP_PATH: OnceLock<String> = OnceLock::new();

fn default_true() -> bool {
    true
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct DesktopSettings {
    #[serde(default = "default_true")]
    close_confirm: bool,
    #[serde(default = "default_true")]
    link_confirm: bool,
    #[serde(default = "default_true")]
    auto_update: bool,
    #[serde(default = "default_true")]
    tutorial_done: bool,
    #[serde(default = "default_language")]
    language: String,
    #[serde(default)]
    launch_on_startup: bool,
    #[serde(default = "default_close_action")]
    close_action: String,
    #[serde(default)]
    update_channel: String,
    #[serde(default)]
    auto_switch_release: bool,
    #[serde(default)]
    release_prompted_version: String,
    #[serde(default = "default_true")]
    telemetry_enabled: bool,
}

fn default_language() -> String {
    "es".to_string()
}

fn default_close_action() -> String {
    "ask".to_string()
}

impl Default for DesktopSettings {
    fn default() -> Self {
        Self {
            close_confirm: true,
            link_confirm: true,
            auto_update: true,
            tutorial_done: false,
            language: default_language(),
            launch_on_startup: false,
            close_action: default_close_action(),
            update_channel: String::new(),
            auto_switch_release: false,
            release_prompted_version: String::new(),
            telemetry_enabled: true,
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
    #[serde(default = "default_true")]
    remember: bool,
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
        Some(session) if session.remember => {
            if let Ok(data) = serde_json::to_string(session) {
                let _ = std::fs::write(path, data);
            }
        }
        _ => {
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
        remember: true,
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
    let base = dirs::config_dir()?;
    let dir = base.join("MuzicMania");
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

fn center_window(window: &tauri::WebviewWindow) {
    let _ = window.center();
    let Ok(Some(monitor)) = window.current_monitor() else {
        return;
    };
    let Ok(size) = window.outer_size() else {
        return;
    };
    let monitor_position = monitor.position();
    let monitor_size = monitor.size();
    let x = monitor_position.x + (monitor_size.width as i32 - size.width as i32) / 2;
    let y = monitor_position.y + (monitor_size.height as i32 - size.height as i32) / 2;
    let _ = window.set_position(tauri::PhysicalPosition::new(x, y));
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
    if POLICY_BLOCKED.load(Ordering::SeqCst) {
        let _ = app.emit("launcher-blocked", ());
        return;
    }
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
    let _ = open::that(&url);
}

#[cfg(target_os = "windows")]
const NULL_DEVICE: &str = "NUL";
#[cfg(not(target_os = "windows"))]
const NULL_DEVICE: &str = "/dev/null";

#[tauri::command]
fn server_status(url: String) -> u16 {
    let output = hidden_command("curl")
        .args(["-sS", "-o", NULL_DEVICE, "-w", "%{http_code}", "--max-time", "6", "--head", &url])
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
    if POLICY_BLOCKED.load(Ordering::SeqCst) {
        return Err("launcher_update_required".to_string());
    }
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
fn offline_back_to_hub(app: tauri::AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("launcher")
        .ok_or_else(|| "launcher_window_missing".to_string())?;
    let current = window.url().map_err(|error| error.to_string())?;
    let target = current
        .join("index.html?offline=1")
        .map_err(|error| error.to_string())?;
    window.navigate(target).map_err(|error| error.to_string())
}

#[tauri::command]
fn offline_start_game(app: tauri::AppHandle) -> Result<(), String> {
    if POLICY_BLOCKED.load(Ordering::SeqCst) {
        return Err("launcher_update_required".to_string());
    }
    let window = app
        .get_webview_window("launcher")
        .ok_or_else(|| "launcher_window_missing".to_string())?;
    let current = window.url().map_err(|error| error.to_string())?;
    let target = current
        .join("offline-game.html")
        .map_err(|error| error.to_string())?;
    window.navigate(target).map_err(|error| error.to_string())
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
    app.exit(0);
}

#[tauri::command]
fn launcher_minimize(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("launcher") {
        let _ = window.minimize();
    }
}

#[tauri::command]
fn launcher_toggle_maximize(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("launcher") {
        if window.is_maximized().unwrap_or(false) {
            let _ = window.unmaximize();
        } else {
            let _ = window.maximize();
        }
    }
}

#[tauri::command]
fn launcher_start_drag(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("launcher") {
        let _ = window.start_dragging();
    }
}

#[tauri::command]
fn launcher_hide(app: tauri::AppHandle) {
    if let Some(launcher) = app.get_webview_window("launcher") {
        let _ = launcher.hide();
    }
}

#[tauri::command]
fn set_launch_on_startup(enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let exe = std::env::current_exe().map_err(|error| error.to_string())?;
        let value = format!("\"{}\"", exe.display());
        let key = r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run";
        let output = if enabled {
            hidden_command("reg")
                .args([
                    "add",
                    key,
                    "/v",
                    "MuzicMania",
                    "/t",
                    "REG_SZ",
                    "/d",
                    &value,
                    "/f",
                ])
                .output()
        } else {
            hidden_command("reg")
                .args(["delete", key, "/v", "MuzicMania", "/f"])
                .output()
        };
        let output = output.map_err(|error| error.to_string())?;
        if enabled && !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = enabled;
    }
    Ok(())
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
    game_version: String,
    channel: String,
    build_date: String,
    changelog_url: String,
    first_run: bool,
    tutorial_done: bool,
    auto_update: bool,
    update_channel: String,
    auto_switch_release: bool,
    release_prompted_version: String,
    session: Option<LauncherSession>,
}

#[tauri::command]
fn launcher_boot(state: tauri::State<LauncherState>) -> LauncherBoot {
    let settings = load_settings_from_disk();
    LauncherBoot {
        version: LAUNCHER_VERSION.to_string(),
        game_version: GAME_VERSION.to_string(),
        channel: BUILD_CHANNEL.to_string(),
        build_date: BUILD_DATE.to_string(),
        changelog_url: CHANGELOG_URL.to_string(),
        first_run: !settings_path().map(|path| path.exists()).unwrap_or(false),
        tutorial_done: settings.tutorial_done,
        auto_update: settings.auto_update,
        update_channel: settings_channel(&settings),
        auto_switch_release: settings.auto_switch_release,
        release_prompted_version: settings.release_prompted_version,
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
        let _ = window.set_title("MuzicMania");
        let _ = window.set_always_on_top(false);
        let _ = window.set_resizable(true);
        let _ = window.set_maximizable(true);
        let _ = window.maximize();
        let _ = window.set_focus();
    }
}

#[tauri::command]
fn launcher_pin_taskbar(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("launcher") {
        let _ = window.set_focus();
    }
    #[cfg(target_os = "windows")]
    request_taskbar_pin();
    #[cfg(not(target_os = "windows"))]
    let _ = app;
}

#[tauri::command]
fn launcher_show_small(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("launcher") {
        let _ = window.set_always_on_top(true);
        let _ = window.unmaximize();
        let _ = window.set_resizable(false);
        let _ = window.set_size(tauri::LogicalSize::new(560.0, 700.0));
        center_window(&window);
        let _ = window.set_focus();
    }
}

const LAUNCHER_AUTH_URL: &str = "https://muzicmania.vercel.app/login?launcher=1";

fn apply_launcher_session(app: &tauri::AppHandle, session: LauncherSession) {
    save_launcher_session(Some(&session));
    if let Some(state) = app.try_state::<LauncherState>() {
        *state.0.lock().unwrap() = Some(session);
    }
    let _ = app.emit("launcher-auth-finished", ());
}

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
        let exe = executable.to_string_lossy().to_string();
        let _ = hidden_command(&exe).spawn();
    }
    LAUNCHER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    app.exit(0);
}

fn version_tuple(value: &str) -> Vec<u32> {
    let core = value
        .trim()
        .trim_start_matches('v')
        .split(|c| c == '-' || c == '+')
        .next()
        .unwrap_or("0");
    let mut parts: Vec<u32> = core
        .split('.')
        .map(|part| part.parse::<u32>().unwrap_or(0))
        .collect();
    while parts.len() < 3 {
        parts.push(0);
    }
    parts
}

fn version_is_newer(latest: &str, current: &str) -> bool {
    version_tuple(latest) > version_tuple(current)
}

fn settings_channel(settings: &DesktopSettings) -> String {
    let channel = settings.update_channel.trim().to_lowercase();
    if channel == "beta" || channel == "release" {
        channel
    } else {
        BUILD_CHANNEL.to_string()
    }
}

fn check_policy(current: &str, preferred_channel: &str, allow_network: bool) -> policy::PolicyOutcome {
    let settings = load_settings_from_disk();
    let preferred = if preferred_channel.is_empty() {
        settings_channel(&settings)
    } else {
        preferred_channel.to_string()
    };
    policy::check(
        current,
        GAME_VERSION,
        BUILD_CHANNEL,
        &preferred,
        settings.auto_switch_release,
        allow_network,
    )
}

#[tauri::command]
fn launcher_check_update(online: Option<bool>) -> policy::PolicyOutcome {
    let outcome = check_policy(LAUNCHER_VERSION, "", online.unwrap_or(true));
    POLICY_BLOCKED.store(outcome.mandatory, Ordering::SeqCst);
    outcome
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
    if !version_is_newer(&version, LAUNCHER_VERSION) {
        return Err("update_version_not_newer".to_string());
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
    game_version: String,
    channel: String,
    build_date: String,
    changelog_url: String,
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

fn installer_selected_language() -> u32 {
    std::fs::read_to_string(ipc_dir().join("lang.txt"))
        .ok()
        .and_then(|value| value.trim().parse::<u32>().ok())
        .unwrap_or(1033)
}

fn installer_toast_text(lang: u32) -> (&'static str, &'static str) {
    match lang {
        1034 => ("MuzicMania instalado", "Gracias por elegir Ciszu Network. Tu launcher está listo."),
        2052 => ("MuzicMania 已安装", "感谢选择 Ciszu Network。你的启动器已准备就绪。"),
        1028 => ("MuzicMania 已安裝", "感謝選擇 Ciszu Network。你的啟動器已準備就緒。"),
        1046 => ("MuzicMania instalado", "Obrigado por escolher a Ciszu Network. Seu launcher está pronto."),
        1051 => ("MuzicMania установлена", "Спасибо за выбор Ciszu Network. Лаунчер готов."),
        1041 => ("MuzicMania をインストールしました", "Ciszu Network をお選びいただきありがとうございます。ランチャーの準備ができました。"),
        1050 => ("MuzicMania 설치 완료", "Ciszu Network를 선택해 주셔서 감사합니다. 런처가 준비되었습니다."),
        1036 => ("MuzicMania est installé", "Merci d'avoir choisi Ciszu Network. Votre launcher est prêt."),
        1031 => ("MuzicMania wurde installiert", "Danke, dass du Ciszu Network gewählt hast. Dein Launcher ist bereit."),
        1040 => ("MuzicMania è installato", "Grazie per aver scelto Ciszu Network. Il launcher è pronto."),
        1043 => ("MuzicMania is geïnstalleerd", "Bedankt voor het kiezen van Ciszu Network. Je launcher is klaar."),
        1045 => ("MuzicMania został zainstalowany", "Dziękujemy za wybór Ciszu Network. Launcher jest gotowy."),
        1025 => ("تم تثبيت MuzicMania", "شكرًا لاختيار Ciszu Network. مشغّلك جاهز."),
        1055 => ("MuzicMania yüklendi", "Ciszu Network'ü seçtiğiniz için teşekkürler. Başlatıcınız hazır."),
        1029 => ("MuzicMania bylo nainstalováno", "Děkujeme, že jste si vybrali Ciszu Network. Launcher je připraven."),
        1038 => ("A MuzicMania telepítve lett", "Köszönjük, hogy a Ciszu Networköt választottad. A launcher készen áll."),
        1053 => ("MuzicMania har installerats", "Tack för att du valde Ciszu Network. Din launcher är redo."),
        _ => ("MuzicMania installed", "Thanks for choosing Ciszu Network. Your launcher is ready."),
    }
}

fn launch_installed_app(install_dir: &str, run: bool, taskbar: bool) {
    if !run && !taskbar {
        return;
    }
    let exe_path = format!("{}\\muzicmania.exe", install_dir);
    let mut command = std::process::Command::new(&exe_path);
    if taskbar {
        command.arg("--pin-taskbar");
        if !run {
            command.arg("--pin-only");
        }
    }
    let _ = command.spawn();
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
fn window_minimize(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|error| format!("window_minimize: {error}"))
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
        version: LAUNCHER_VERSION.to_string(),
        game_version: GAME_VERSION.to_string(),
        channel: BUILD_CHANNEL.to_string(),
        build_date: BUILD_DATE.to_string(),
        changelog_url: CHANGELOG_URL.to_string(),
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
    let installed_exe = std::path::PathBuf::from(&clean).join("muzicmania.exe");
    if let Ok(current) = std::env::current_exe() {
        if current != installed_exe && installed_exe.exists() {
            let _ = std::fs::copy(current, &installed_exe);
        }
    }

    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("cmd.txt"), "ABORT");
    cleanup_stale_uninstaller();

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
    {
        let (toast_title, toast_body) = installer_toast_text(installer_selected_language());
        show_windows_toast(toast_title, toast_body);
    }
    launch_installed_app(&install_dir, run, taskbar);
    INSTALLER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(win) = app.get_webview_window("installer") {
        let _ = win.close();
    }
    let _ = std::fs::remove_dir_all(ipc_dir());
}

#[tauri::command]
fn installer_app_running() -> bool {
    #[cfg(target_os = "windows")]
    {
        let script = r#"$me=$PID; $p=Get-CimInstance Win32_Process -Filter "Name='muzicmania.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessId -ne $me -and $_.CommandLine -notmatch '(?i)--installer|--uninstaller' }; if (@($p).Count -gt 0) { '1' } else { '0' }"#;
        if let Ok(output) = hidden_command("powershell")
            .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", script])
            .output()
        {
            return String::from_utf8_lossy(&output.stdout).trim() == "1";
        }
    }
    false
}

fn cleanup_stale_uninstaller() {
    #[cfg(target_os = "windows")]
    {
        let script = r#"Get-CimInstance Win32_Process -Filter "Name='muzicmania.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match '(?i)--uninstaller' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; Get-CimInstance Win32_Process -Filter "Name='uninstall.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.ExecutablePath -like '*MuzicMania*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"#;
        let _ = hidden_command("powershell")
            .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", script])
            .output();
    }
}

fn abort_installer(app: tauri::AppHandle) {
    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("cmd.txt"), "ABORT");
    INSTALLER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(win) = app.get_webview_window("installer") {
        let _ = win.close();
    }
}

#[tauri::command]
fn installer_check_update() -> policy::PolicyOutcome {
    let detected = detect_installed();
    let current = if detected.installed && !detected.version.trim().is_empty() {
        detected.version.trim().to_string()
    } else {
        LAUNCHER_VERSION.to_string()
    };
    check_policy(&current, "", true)
}

#[tauri::command]
fn installer_start_update(
    app: tauri::AppHandle,
    url: String,
    size: u64,
    version: String,
) -> Result<(), String> {
    let detected = detect_installed();
    if detected.installed && !version_is_newer(&version, &detected.version) {
        return Err("update_version_not_newer".to_string());
    }
    launcher_start_update(app, url, size, version)
}

#[tauri::command]
fn installer_update_progress(state: tauri::State<UpdateState>) -> UpdateStatus {
    state.0.lock().unwrap().clone()
}

#[tauri::command]
fn installer_apply_update(app: tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<UpdateState>();
    let path = state.0.lock().unwrap().path.clone();
    if path.is_empty() || !std::path::Path::new(&path).exists() {
        return Err("update_not_downloaded".to_string());
    }
    let install_dir = detect_installed()
        .path
        .trim()
        .trim_end_matches(|c| c == '\\' || c == '/')
        .to_string();
    let target = if install_dir.is_empty() {
        default_install_path()
    } else {
        install_dir
    };
    let exe_path = format!("{}\\muzicmania.exe", target);
    let ps = format!(
        "$ErrorActionPreference='SilentlyContinue'; Start-Sleep -Milliseconds 1200; Start-Process -FilePath '{}' -ArgumentList @('/S','/D={}') -Wait; Start-Process -FilePath '{}'",
        ps_quote(&path),
        ps_quote(&target),
        ps_quote(&exe_path)
    );
    hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &ps])
        .spawn()
        .map_err(|error| error.to_string())?;
    abort_installer(app);
    Ok(())
}

#[derive(serde::Serialize, Clone, Default)]
struct ReinstallStatus {
    state: String,
    phase: u8,
    progress: u8,
    error: String,
}

static REINSTALL_STATE: Mutex<Option<ReinstallStatus>> = Mutex::new(None);

fn set_reinstall_status(state: &str, phase: u8, progress: u8, error: &str) {
    if let Ok(mut current) = REINSTALL_STATE.lock() {
        *current = Some(ReinstallStatus {
            state: state.to_string(),
            phase,
            progress,
            error: error.to_string(),
        });
    }
}

#[tauri::command]
fn installer_reinstall_progress() -> ReinstallStatus {
    REINSTALL_STATE
        .lock()
        .ok()
        .and_then(|value| value.clone())
        .unwrap_or_default()
}

#[tauri::command]
fn installer_open_app(app: tauri::AppHandle) -> Result<(), String> {
    let installed = detect_installed();
    if !installed.installed || installed.path.trim().is_empty() {
        return Err("not_installed".to_string());
    }
    launch_installed_app(&installed.path, true, false);
    INSTALLER_FORCE_CLOSE.store(true, Ordering::SeqCst);
    if let Some(window) = app.get_webview_window("installer") {
        let _ = window.close();
    }
    app.exit(0);
    Ok(())
}

fn reinstall_cache_path() -> Result<std::path::PathBuf, String> {
    let base = std::env::var("LOCALAPPDATA")
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir());
    let directory = base.join("MuzicMania").join("installer-cache");
    std::fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    Ok(directory.join("MuzicMania-Setup.exe"))
}

fn cache_reinstall_setup(source: &str) -> Result<String, String> {
    let destination = reinstall_cache_path()?;
    std::fs::copy(source, &destination).map_err(|error| error.to_string())?;
    Ok(destination.to_string_lossy().to_string())
}

fn download_reinstall_setup() -> Result<String, String> {
    let info = check_policy(LAUNCHER_VERSION, "", true);
    if info.url.is_empty() {
        return Err("installer_setup_missing".to_string());
    }
    let destination = reinstall_cache_path()?;
    let _ = std::fs::remove_file(&destination);
    let output = hidden_command("curl")
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
            &destination.to_string_lossy(),
            &info.url,
        ])
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() || destination.metadata().map(|m| m.len()).unwrap_or(0) == 0 {
        return Err("setup_download_failed".to_string());
    }
    Ok(destination.to_string_lossy().to_string())
}

#[tauri::command]
fn installer_reinstall_start() -> Result<(), String> {
    let installed = detect_installed();
    if !installed.installed || installed.path.trim().is_empty() {
        return Err("not_installed".to_string());
    }
    let initial_setup = INSTALLER_SETUP_PATH
        .get()
        .cloned()
        .filter(|path| std::path::Path::new(path).exists());
    let install_dir = installed
        .path
        .trim()
        .trim_end_matches(|c| c == '\\' || c == '/')
        .to_string();
    let uninstaller = format!("{}\\uninstall.exe", install_dir);
    if !std::path::Path::new(&uninstaller).exists() {
        return Err("uninstaller_not_found".to_string());
    }

    cleanup_stale_uninstaller();
    set_reinstall_status("running", 0, 5, "");
    let dir = ipc_dir();
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join("cmd.txt"), "ABORT");

    let target_dir = install_dir.clone();
    let uninstaller_path = uninstaller.clone();
    std::thread::spawn(move || {
        let mut setup_path = match initial_setup {
            Some(path) => cache_reinstall_setup(&path).unwrap_or(path),
            None => {
                set_reinstall_status("running", 0, 8, "");
                match download_reinstall_setup() {
                    Ok(path) => path,
                    Err(error) => {
                        set_reinstall_status("error", 0, 8, &error);
                        return;
                    }
                }
            }
        };
        set_reinstall_status("running", 1, 15, "");
        let uninstall_status = hidden_command(&uninstaller_path)
            .env("MUZICMANIA_REINSTALL", "1")
            .args(["/S", &format!("_?={}", target_dir)])
            .status();
        match uninstall_status {
            Ok(status) if status.success() => {}
            Ok(status) => {
                set_reinstall_status("error", 1, 15, &format!("uninstall_exit:{}", status.code().unwrap_or(-1)));
                return;
            }
            Err(error) => {
                set_reinstall_status("error", 1, 15, &error.to_string());
                return;
            }
        }

        if !std::path::Path::new(&setup_path).exists() {
            set_reinstall_status("running", 0, 10, "");
            setup_path = match download_reinstall_setup() {
                Ok(path) => path,
                Err(error) => {
                    set_reinstall_status("error", 0, 10, &error);
                    return;
                }
            };
        }

        set_reinstall_status("running", 2, 55, "");
        let setup_status = hidden_command(&setup_path)
            .env("MUZICMANIA_REINSTALL", "1")
            .args(["/S", &format!("/D={}", target_dir)])
            .status();
        match setup_status {
            Ok(status) if status.success() => {}
            Ok(status) => {
                set_reinstall_status("error", 2, 55, &format!("install_exit:{}", status.code().unwrap_or(-1)));
                return;
            }
            Err(error) => {
                set_reinstall_status("error", 2, 55, &error.to_string());
                return;
            }
        }

        set_reinstall_status("done", 3, 100, "");
    });

    Ok(())
}

#[derive(serde::Serialize)]
struct UninstallerInfo {
    installed: bool,
    version: String,
    game_version: String,
    channel: String,
    build_date: String,
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
    let detected = detect_installed();
    let install_path = if detected.installed && !detected.path.trim().is_empty() {
        detected.path
    } else {
        installer_default_path()
    };
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
        game_version: GAME_VERSION.to_string(),
        channel: BUILD_CHANNEL.to_string(),
        build_date: BUILD_DATE.to_string(),
        install_path: install_path.clone(),
        data_path: appdata,
        webview_data_path: webview_data,
        size_bytes: directory_size(install_dir),
    }
}

#[tauri::command]
fn uninstaller_start(delete_data: bool, reason: String, feedback: String, rating: u8) {
    #[cfg(target_os = "windows")]
    {
        remove_user_start_menu_shortcut();
        let _ = hidden_command("reg")
            .args([
                "delete",
                r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                "/v",
                "MuzicMania",
                "/f",
            ])
            .output();
    }
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
    let _ = std::fs::remove_dir_all(ipc_dir());
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
                if let Some(index) = args.iter().position(|arg| arg == "--installer") {
                    if let Some(path) = args.get(index + 1) {
                        if !path.trim().is_empty() {
                            let _ = INSTALLER_SETUP_PATH.set(path.clone());
                            let _ = cache_reinstall_setup(path);
                        }
                    }
                }
                app.manage(UpdateState(Mutex::new(UpdateStatus::default())));
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
                .decorations(false)
                .data_directory(std::env::temp_dir().join("muzicmania-installer-webview"))
                .build()
                .expect("Failed to create installer window");
                center_window(&installer);

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
                .decorations(false)
                .data_directory(std::env::temp_dir().join("muzicmania-uninstaller-webview"))
                .build()
                .expect("Failed to create uninstaller window");
                center_window(&uninstaller);

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
            let tray_spanish = settings.language != "en";
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
            .decorations(false)
            .build()
            .expect("Failed to create launcher window");
            center_window(&launcher);

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

            if let Some(icon) = app.default_window_icon().cloned() {
                let show_label = if tray_spanish { "Abrir MuzicMania" } else { "Open MuzicMania" };
                let info_label = if tray_spanish { "Información" } else { "Information" };
                let quit_label = if tray_spanish { "Salir completamente" } else { "Quit completely" };
                let show = MenuItem::with_id(app, "tray-show", show_label, true, None::<&str>)?;
                let info = MenuItem::with_id(app, "tray-info", info_label, true, None::<&str>)?;
                let quit = MenuItem::with_id(app, "tray-quit", quit_label, true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&show, &info, &quit])?;
                let tray = TrayIconBuilder::new()
                    .icon(icon)
                    .tooltip("MuzicMania")
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id.as_ref() {
                        "tray-show" => {
                            if let Some(window) = app.get_webview_window("launcher") {
                                let _ = window.show();
                                let _ = window.unminimize();
                                let _ = window.set_focus();
                            }
                        }
                        "tray-info" => {
                            let _ = open::that("https://muzicmania.vercel.app");
                        }
                        "tray-quit" => {
                            LAUNCHER_FORCE_CLOSE.store(true, Ordering::SeqCst);
                            app.exit(0);
                        }
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("launcher") {
                                let _ = window.show();
                                let _ = window.unminimize();
                                let _ = window.set_focus();
                            }
                        }
                    })
                    .build(app)?;
                let _ = tray;
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
            offline_back_to_hub,
            offline_start_game,
            launcher_close,
            launcher_hide,
            launcher_minimize,
            launcher_toggle_maximize,
            launcher_start_drag,
            launcher_cancel_close,
            set_launch_on_startup,
            get_settings,
            update_settings,
            window_minimize,
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
            installer_app_running,
            installer_check_update,
            installer_start_update,
            installer_update_progress,
            installer_apply_update,
            installer_reinstall_start,
            installer_reinstall_progress,
            installer_open_app,
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












