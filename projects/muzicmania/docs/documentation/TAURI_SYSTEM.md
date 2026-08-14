# TAURI_SYSTEM — Sistema de Integración Desktop Tauri (MuzicMania)

Versión: 1.0.0
Actualización: 2026-08-13
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
| `@tauri-apps/cli v2.11.2` | Instalado | En devDependencies del workspace |
| Scripts npm (`tauri:build`) | Listos | `pnpm tauri:build` |
| Página `/download` | Lista | `src/app/download/page.tsx` con link a GitHub Releases |
| Rust / Cargo / rustup | PENDIENTE | Único prerequisito faltante en la máquina de build |

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
  - **Binario ultra-ligero**: instalador final de ~3–4 MB porque no empaqueta assets estáticos.
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
version = "2.0.0"
description = "MuzicMania 2.0 - Ecosistema Rítmico de Alto Rendimiento"
authors = ["Ciszuko Antony"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2.0.0", features = [] }

[dependencies]
tauri = { version = "2.0.0", features = ["devtools"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

### 4.2 `tauri.conf.json`

Contiene la configuración de ventanas, dimensiones, comportamiento del webview y seguridad.
La ventana es redimensionable, centrada y con tema oscuro; el CSP se deja a cargo de la web.

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
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis", "msi"],
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

```bash
# Opción 1: script automático (recomendado)
powershell -ExecutionPolicy Bypass -File scripts/tauri-setup.ps1

# Opción 2: comando directo del workspace
pnpm tauri:build

# Build solo NSIS + parche de idiomas
pnpm tauri:build:nsis
```

### 5.3 Output esperado

```
launcher/src-tauri/target/release/bundle/
├── msi/MuzicMania_2.0.0_x64_en-US.msi   # Instalador MSI (recomendado)
└── nsis/MuzicMania_2.0.0_x64-setup.exe  # Instalador NSIS
```

## 6. Instaladores: MSI y NSIS

| Instalador | Ventaja | Uso |
|---|---|---|
| **MSI** | Instalación a nivel de sistema, Windows Installer nativo | Recomendado para distribución general |
| **NSIS** | Personalizable (splash, idiomas, extras), compresión potente | Alternativa con branding propio |

El flujo NSIS de MuzicMania se complementa con scripts de post-proceso:

| Script | Función |
|---|---|
| `scripts/patch-nsis-lang.ps1` | Parchea el instalador NSIS para inyectar idiomas (`nsis-lang/`) |
| `scripts/patch-nsis-fix.ps1` | Correcciones de configuración del instalador NSIS |
| `scripts/patch-simple.ps1` | Variante de parcheo para builds simples |

El bundle NSIS puede incluir splash screens (`splash/index.html`, `splash/installer.html`) y
plantillas en `templates/`. Ver las reglas globales de packaging en
`` `INSTALLERS_SYSTEM.md` `` (ver ciszu).

## 7. Distribución vía GitHub Releases

1. Crear un nuevo Release en GitHub: `v2.0.0`.
2. Subir el `.msi` como asset con el nombre exacto: **`MuzicMania_x64_en-US.msi`**.
3. La página `/download` ya tiene el link configurado a ese nombre.

> Alternativa de referencia: la carpeta `launcher/downloads/` almacena builds locales
> (`MuzicMania(v2.0.1)_InstallerSetup(v2.1.3)_Windows10_x64.exe`), ignorados por git.

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
~3–4 MB, porque no incluye los assets del juego (se sirven desde la web/CDN).

**¿Soporta macOS o Linux?**
La configuración actual apunta a `nsis`/`msi` (Windows). Tauri v2 es multiplataforma, así que
los targets macOS/Linux podrían añadirse ajustando `bundle.targets` y generando iconos
adicionales.

**¿Dónde está el código del launcher?**
En `launcher/src-tauri/` dentro del proyecto MuzicMania.

## 12. Referencias

- `` `FULL_STACK_SYSTEM.md` `` (ver ciszu) — stack global del ecosistema.
- `` `INSTALLERS_SYSTEM.md` `` (ver ciszu) — packaging e instaladores corporativos.
- `` `DOC_EXPORT_PROTOCOLS.md` `` — exportación de la documentación oficial del juego.
- `launcher/src-tauri/` — código fuente de la integración.
- `scripts/tauri-setup.ps1` — script de setup de Tauri.
