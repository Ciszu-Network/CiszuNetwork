# TAURI_SYSTEM — Sistema de Integración Desktop Tauri (MuzicMania)

Versión: 1.0.0
Actualización: 2026-11-10
Identificador: TAURI_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema que documenta la integración de **MuzicMania PC Edition**, la
> aplicación de escritorio nativa para Windows construida con **Tauri v2** que envuelve la
> web `muzicmania.vercel.app` en una ventana WebView2. Cubre el análisis de viabilidad, la
> arquitectura de `src-tauri/`, la compilación del ejecutable, los instaladores MSI/NSIS y la
> distribución vía GitHub Releases.

---

## 1. Propósito y alcance

MuzicMania es un juego de ritmo desplegado como web Next.js 15 (SSR + Supabase Auth). Para
ofrecer una experiencia **nativa de escritorio** en Windows sin duplicar el código del juego,
se eligió **Tauri v2**: un framework que empaqueta la app con un ejecutable Rust y la renderiza
en el WebView2 de Windows (motor Chromium).

Este documento es la fuente de verdad técnica de la integración desktop del juego:

- Estado actual de la implementación.
- Análisis de viabilidad (webview shell vs. compilación estática).
- Arquitectura de `src-tauri/` (Cargo.toml, tauri.conf.json, main.rs, iconos).
- Procedimiento de compilación y generación de instaladores (MSI y NSIS).
- Distribución vía GitHub Releases y la página `/download`.
- Troubleshooting y FAQ.

> Relacionado: los instaladores del ecosistema completo (NSIS, packaging corporativo) se
> documentan en `` `INSTALLERS_SYSTEM.md` `` (ver ciszu). Este doc cubre **solo** la
> integración Tauri de MuzicMania.

## 2. Estado de la implementación

| Componente | Estado | Notas |
|---|---|---|
| `src-tauri/Cargo.toml` | Listo | Tauri v2, perfil release optimizado |
| `src-tauri/tauri.conf.json` | Listo | Schema v2, Webview Shell URL producción |
| `src-tauri/src/main.rs` | Listo | Tauri v2 builder con `.setup()` |
| `src-tauri/build.rs` | Listo | `tauri_build::build()` |
| `src-tauri/icons/` | Listo | 32x32, 128x128, 128x128@2x, icon.ico, icon.icns, PNG de Windows Store |
| `@tauri-apps/cli v2.11.4` | Instalado | En devDependencies del workspace |
| Script de build | Listo | `launcher/build-installer.ps1` compila NSIS y publica el artefacto |
| Instalador custom NSIS | Listo | UI WebView2 multiidioma, progreso, licencia, ruta, atajos y desinstalador |
| Página `/download` | Lista | `src/app/download/page.tsx`; fallback a GitHub Releases |
| Rust / Cargo / rustup | Listo | Rust 1.96.1; compilación release verificada |

> La carpeta `src-tauri/` vive actualmente en **`launcher/src-tauri/`** dentro del proyecto
> (código del launcher de escritorio), con `splash/`, `nsis-lang/`, `templates/` y los iconos
> de Windows/móvil.

## 3. Análisis de viabilidad: webview directa vs. compilación estática

Para encapsular Next.js 15 en Tauri se analizaron dos enfoques arquitectónicos.

### 3.1 Alternativa A: Compilación estática local (SSG wrapper)

- **Cómo funciona**: se configura Next.js para compilar a HTML/CSS/JS estático
  (`output: 'export'`) y Tauri empaqueta físicamente todos esos archivos dentro del binario.
- **Ventajas**:
  - Funciona 100% offline (sin internet).
  - Latencia de carga interna nula.
- **Desventajas**:
  - **Incompatible con Next.js dinámico**: no soporta Server Actions, middleware de rutas,
    SSR ni APIs basadas en Node.
  - **Distribución de actualizaciones compleja**: cada cambio de diseño, música o lógica
    exige re-descargar y reinstalar el ejecutable `.exe`.
  - **Binario mayor**: debe incluir canciones y assets físicos de antemano.

### 3.2 Alternativa B: Envoltura webview directa (production webview shell) — IMPLEMENTADA

- **Cómo funciona**: el ejecutable nativo actúa como un "cascarón inteligente". Al iniciarse
  levanta una ventana nativa de Windows que carga la URL de producción del juego
  (`https://muzicmania.vercel.app`).
- **Ventajas**:
  - **Actualizaciones inmediatas**: cualquier cambio en la web (Next.js en Vercel) se refleja
    al instante en la app de escritorio, sin re-descargar el `.exe`.
  - **Soporte dinámico total**: conserva SSR, APIs, Server Actions y Supabase Auth/cookies.
  - **Binario ultra-ligero**: instalador final de ~11.6 MB: incluye launcher, UIs custom y 4 pistas offline; el juego online completo se sirve desde la web.
  - **Rendimiento**: WebView2 (Chromium) con aceleración por hardware por defecto, ideal para
    un juego rítmico.

## 4. Arquitectura de `src-tauri/`

```
launcher/src-tauri/
├── Cargo.toml          # Dependencias Rust (Tauri v2)
├── build.rs            # Script de build de Tauri
├── tauri.conf.json     # Config: ventana, bundle, iconos, URL
├── icons/
│   ├── 32x32.png
│   ├── 128x128.png
│   ├── 128x128@2x.png
│   ├── 256x256.png
│   ├── 512x512.png
│   ├── icon.icns
│   ├── icon.ico
│   ├── app-icon-source.png       # fuente para regenerar iconos
│   ├── Square*Logo.png           # iconos Windows Store
│   └── android/ · ios/           # iconos móviles (generados por `tauri icon`)
├── splash/             # pantallas splash/instalador/offline (HTML/JS)
├── nsis-lang/          # traducciones NSIS (Czech, Hungarian, Polish…)
├── templates/          # plantillas del instalador
└── src/
    └── main.rs         # Punto de entrada Rust
```

### 4.1 `Cargo.toml`

Define el paquete Rust, las dependencias de Tauri y las características habilitadas.

```toml
[package]
name = "muzicmania"
version = "2.1.1"
description = "MuzicMania 2.0 - Ecosistema Rítmico de Alto Rendimiento"
authors = ["Ciszuko Antony"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

### 4.2 `tauri.conf.json`

Contiene la configuración de ventanas, dimensiones, comportamiento del webview y seguridad.
La ventana es redimensionable, centrada y con tema oscuro; Tauri define un CSP base y la web aplica su propia política. El splash local conserva su meta CSP.

```json
{
  "build": {
    "beforeDevCommand": "",
    "beforeBuildCommand": "",
    "devUrl": "http://localhost:3000",
    "frontendDist": "../out"
  },
  "app": {
    "windows": [
      {
        "title": "MuzicMania",
        "width": 1280,
        "height": 720,
        "resizable": true,
        "fullscreen": false,
        "decorations": true,
        "center": true,
        "theme": "Dark"
      }
    ],
    "security": {
      "csp": "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: asset: http://asset.localhost; connect-src 'self' ipc: http://ipc.localhost https: wss:; frame-src 'self' https:;"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "identifier": "com.ciszunetwork.muzicmania",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

### 4.3 `src/main.rs`

Punto de entrada Rust que inicializa la ventana del webview nativo.

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("Error al inicializar el ejecutable de MuzicMania");
}
```

### 4.4 `build.rs`

```rust
fn main() {
    tauri_build::build()
}
```

## 5. Compilar el ejecutable

### 5.1 Prerequisito: instalar Rust

1. Descargar `rustup-init.exe` desde **https://rustup.rs/**.
2. Ejecutar el instalador (opción por defecto: `stable`).
3. Reiniciar terminal/IDE.
4. Verificar con `rustc --version` (debe mostrar la versión).

> La máquina de build ya dispone del resto:
> - WebView2 Runtime (Chromium).
> - Visual Studio Community 2022 (MSVC) como toolchain de C++.
> - Node.js 24+ y pnpm (workspace del monorepo).

### 5.2 Compilar

```powershell
# Compila NSIS, aplica el parche de UI custom y copia a descargas
powershell -ExecutionPolicy Bypass -File launcher/build-installer.ps1

# Alternativa desde el launcher
launcher\src-tauri\BUILD.bat
```

El script usa el CLI de Tauri del workspace (`@tauri-apps/cli 2.11.4`), el target
`x86_64-pc-windows-msvc`, `NSIS` y `--no-sign`. El parche se aplica con
`website/scripts/patch-nsis-lang.ps1`.

### 5.3 Output esperado

```
launcher/src-tauri/target/x86_64-pc-windows-msvc/release/
├── muzicmania.exe
├── bundle/nsis/MuzicMania_2.1.1_x64-setup.exe
└── nsis/x64/nsis-output.exe
```

El artefacto final pesa ~11.6 MB comprimido. `build-installer.ps1` lo publica en
`website/public/downloads/` y `launcher/downloads/` con los nombres
`MuzicMania(v2.1.1)_InstallerSetup(v2.3.1)_Windows10/11_x64.exe`.

## 6. Instaladores: MSI y NSIS

| Instalador | Estado | Uso |
|---|---|---|
| **MSI** | No compilado | No se distribuye actualmente |
| **NSIS** | Activo | Instalador custom multiidioma para Windows 10/11 x64 |

El NSIS usa `installMode: perMachine` (requiere UAC) y una UI WebView2 embebida
(`splash/installer.html` + `installer.js`) con 18 idiomas (selector custom con banderas, inglés por defecto), licencia, detección de instalación existente, selección de
directorio, progreso, desinstalador y post-acciones. El flujo oculto de NSIS copia los
archivos; la UI escribe `dir.txt` y recibe estado por `%TEMP%\muzicmania-ipc`.

El check **Anclar a la barra de tareas** no se ejecuta desde el instalador. `installer_finish`
escribe `LAUNCH_PIN` o `PIN_ONLY` y el NSIS arranca el launcher como usuario con
`--pin-taskbar` (y `--pin-only` si no se pidió ejecutar). El proceso establece su AUMID
(`com.ciszunetwork.muzicmania`), copia el acceso directo del Menú Inicio al perfil del usuario
y solicita el anclaje desde la app en primer plano:

- **Windows 11:** `TaskbarManager.RequestPinCurrentAppAsync`; Windows muestra su diálogo de
  confirmación. Si el build es anterior a la API de escritorio o la política/foreground no lo
  permite, se ofrece el anclaje manual.
- **Windows 10 y anteriores:** se invoca el verbo clásico `Shell.Application` sobre el acceso
  directo; si no existe, se muestra un diálogo nativo con instrucciones y acceso a
  `shell:AppsFolder`.
- **Fallback:** `MessageBoxW` topmost bilingüe; no se simulan clics ni se usan utilidades
  externas.

| Script | Función |
|---|---|
| `website/scripts/patch-nsis-lang.ps1` | Parchea `installer.nsi`, inyecta la UI custom y recompila con `makensis` |
| `launcher/build-installer.ps1` | Build completo, parche y copia del instalador final |

Los splash y plantillas viven en `launcher/src-tauri/splash/`. Ver las reglas globales de
packaging en `` `INSTALLERS_SYSTEM.md` `` (ver ciszu).

### 6.4 Launcher pre-game y autenticación

La SPA local `splash/launcher.js` + `launcher.css` reemplaza al antiguo splash que abría
la web directamente. El flujo es:

1. Splash compacto (estado, versión y progreso).
2. `launcher_check_update` contra GitHub Releases; descarga el asset Windows10/11
   adecuado con `curl`, progreso por tamaño, tres reintentos y opción de omitir solo
   cuando falla la red (fuerza modo offline). Si la actualización automática está activa,
   tras descargar hace una cuenta atrás e instala con UAC; el instalador emite una
   notificación nativa de Windows al completar.
3. Inicializador y tutorial de primera ejecución.
4. Login CISZU ID si hay red y no hay sesión; si no hay red o el usuario elige invitado,
   se crea una sesión local `guest`.
5. Hub maximizado con cuenta, estado online/offline, jugar online/offline, reinicio
   online, ajustes, actualización manual, comunidad, soporte y enlaces.

La sesión se guarda en `%APPDATA%\MuzicMania\launcher_session.json`; solo contiene identidad pública (id, usuario, nombre, avatar y rol), nunca tokens ni email. El invitado usa el mismo archivo sin tokens. El login se abre en una ventana CISZU ID real (`/login?launcher=1`) y la web devuelve la sesión a `/launcher-auth?session=...`; el callback `on_navigation` de Tauri la intercepta, la valida y emite `launcher-auth-finished`. Al cargar una sesión antigua, el launcher la reescribe sin campos heredados. `launcher_logout` limpia la sesión y los datos de navegación del WebView. La planificación Android/iOS está en `MOBILE_LAUNCHER_PLAN.md`.

Los comandos principales son `launcher_boot`, `launcher_check_update`,
`launcher_start_update`, `launcher_update_progress`, `launcher_apply_update`, `launcher_pin_taskbar`,
`launcher_open_login`, `launcher_session`, `launcher_guest`, `launcher_logout`,
`launcher_show_small`, `launcher_show_hub`, `launcher_restart`, `launcher_ready` y
`launcher_offline_game`.

## 7. Distribución vía GitHub Releases

Release activo: `muzicmania-v2.1.1` en
`Ciszu-Network/CiszuNetwork`. GitHub normaliza los paréntesis del nombre a puntos
(`MuzicMania.v2.1.1._InstallerSetup.v2.3.1._Windows10_x64.exe`). El API route
`/api/download/windows` sirve el archivo local si existe y, si no, redirige al asset del
release con esa normalización. Se puede cambiar la base con
`MUZICMANIA_INSTALLER_RELEASE_URL`.

Asset final: **11.692.682 bytes** (`11.15 MiB`), SHA256
`E04C694194E776CD6E12BE879076A12985D34A1D97D2CFD0D02F70316B68F3BC`.

> `website/public/downloads/` y `launcher/downloads/` están ignorados por git. En Vercel se
> usa el redirect al release; para pruebas locales el archivo real queda en ambas carpetas.
> El instalador no está firmado: SmartScreen puede pedir confirmación.

## 8. Implementación frontend

### 8.1 Página de descarga (`src/app/download/page.tsx`)

Interfaz retro-futurista con:

- Tarjetas de descarga interactivas con efectos neon reactivos al hover.
- Información del instalador de Windows (peso, versión, arquitectura x64).
- Requisitos mínimos y recomendados del sistema.
- Instrucciones de instalación paso a paso.

### 8.2 Navegación (`src/config/navigation.tsx`)

Link `/download` en el Navbar y el Sidebar principal para que los usuarios identifiquen la
versión nativa de escritorio.

## 9. Beneficios a futuro

- **Aislamiento del navegador**: sin distracciones de pestañas ni atajos del browser;
  mejora el rendimiento en FPS durante el gameplay.
- **Integración OS**: atajos de teclado globales, notificaciones de Windows para
  torneos/eventos, lectura/escritura de configuraciones locales de audio.
- **GitHub Actions CI**: automatizar el build en cada push a `main` con runners Windows.

## 10. Troubleshooting

| Problema | Causa probable | Solución |
|---|---|---|
| `rustc` no reconocido | Rust no instalado o PATH sin recargar | Instalar rustup y reiniciar terminal |
| Error de toolchain MSVC | Faltan componentes C++ de VS Build Tools | Instalar "Desktop development with C++" en VS 2022 |
| `tauri` no es un comando | CLI no instalado | Verificar `@tauri-apps/cli` en devDependencies y `pnpm install` |
| Webview en blanco al abrir | Sin conexión o CSP bloqueando recursos | Cargar la URL de producción y verificar la consola del webview |
| NSIS muestra idioma por defecto | Faltó el parche de idiomas | Ejecutar `pnpm nsis:patch` o `tauri:build:nsis` |
| El instalador no firma | No hay certificado de firma configurado | Añadir `signingIdentity`/tool de firma en el CI o local |
| Antivirus marca el `.exe` | Binario sin firmar y de descarga reciente | Firmar el binario y/o subir a VirusTotal para solicitar allowlist |

## 11. FAQ

**¿Por qué no compilar la web estática dentro del binario?**
Porque MuzicMania usa SSR, Server Actions y Supabase Auth; un bundle estático rompería esas
funcionalidades y obligaría a re-descargar el ejecutable en cada actualización.

**¿El juego funciona offline en la app de escritorio?**
Con la estrategia de webview shell, no de forma completa: requiere red para cargar la web y
consultar Supabase. Es un trade-off aceptado por el modelo de actualizaciones instantáneas.

**¿Cuánto pesa el instalador?**
~11.6 MB comprimido: incluye el launcher, instalador/desinstalador custom y las 4 pistas locales del modo offline. El resto de assets online se sirven desde la web/CDN.

**¿Soporta macOS o Linux?**
La configuración actual apunta a `nsis` (Windows). Tauri v2 es multiplataforma, así que
los targets macOS/Linux podrían añadirse ajustando `bundle.targets` y generando iconos
adicionales.

**¿Dónde está el código del launcher?**
En `launcher/src-tauri/` dentro del proyecto MuzicMania.

## 12. Referencias

- `` `FULL_STACK_SYSTEM.md` `` (ver ciszu) — stack global del ecosistema.
- `` `INSTALLERS_SYSTEM.md` `` (ver ciszu) — packaging e instaladores corporativos.
- `` `DOC_EXPORT_PROTOCOLS.md` `` — exportación de la documentación oficial del juego.
- `launcher/src-tauri/` — código fuente de la integración.
- `launcher/build-installer.ps1` — build y publicación del instalador.
