# 🖥️ Integración de Tauri Desktop (MuzicMania PC Edition)

Este documento detalla el análisis arquitectónico, diseño técnico y plan de implementación para compilar e integrar **MuzicMania 2.0** en una aplicación de escritorio nativa para **Windows** utilizando **Tauri v2** y tecnología Webview.

---

## ✅ Estado de la Implementación (31/05/2026)

| Componente | Estado | Notas |
|---|---|---|
| `src-tauri/Cargo.toml` | ✅ Listo | Tauri v2, perfil release optimizado |
| `src-tauri/tauri.conf.json` | ✅ Listo | Schema v2, Webview Shell URL producción |
| `src-tauri/src/main.rs` | ✅ Listo | Tauri v2 builder con .setup() |
| `src-tauri/build.rs` | ✅ Listo | tauri_build::build() |
| `src-tauri/icons/` | ✅ Listo | 32x32, 128x128, 128x128@2x, icon.ico, icon.icns |
| `@tauri-apps/cli v2.11.2` | ✅ Instalado | En devDependencies |
| Scripts npm (`tauri:build`) | ✅ Listos | `pnpm tauri:build` |
| `src/app/download/page.tsx` | ✅ Listo | Página de descargas con link a GitHub Releases |
| **Rust / Cargo / rustup** | ❌ PENDIENTE | **Único prerequisito faltante** |

---

## 🔍 Análisis de Viabilidad: ¿Webview Directa vs. Compilación Estática?

Para encapsular Next.js 15 en Tauri, analizamos dos enfoques arquitectónicos:

### Alternativa A: Compilación Estática Local (SSG Wrapper)
* **Cómo funciona:** Se configura Next.js para compilar a HTML/CSS/JS estático (`output: 'export'`) y Tauri empaqueta físicamente todos estos archivos dentro del binario.
* **Desventajas:**
  - **Incompatible con Next.js Dinámico:** No soporta Server Actions, Middleware de Rutas, SSR ni APIs basadas en Node.
  - Cada actualización requiere re-descargar el ejecutable completo.

### Alternativa B: Envoltura Webview Directa (Production Webview Shell) — 🟢 IMPLEMENTADA
* **Cómo funciona:** El ejecutable nativo actúa como un cascarón que carga `https://muzicmania.vercel.app` directamente.
* **Ventajas:**
  - **Actualizaciones Inmediatas:** Sin necesidad de redistribuir el ejecutable.
  - **Soporte Dinámico Total:** SSR, APIs, Server Actions, Supabase Auth funcionan normalmente.
  - **Binario Ultra-Ligero:** ~3.5 MB.
  - **WebView2 de Windows:** Motor Chromium nativo con aceleración por hardware.

---

## 🛠️ Arquitectura Final de `src-tauri/`

```
src-tauri/
├── Cargo.toml          # Dependencias Rust (Tauri v2)
├── build.rs            # Script de build de Tauri
├── tauri.conf.json     # Config: ventana, bundle, iconos, URL
├── icons/
│   ├── 32x32.png
│   ├── 128x128.png
│   ├── 128x128@2x.png
│   ├── icon.ico
│   ├── icon.icns
│   └── app-icon-source.png  (fuente para regenerar iconos)
└── src/
    └── main.rs         # Punto de entrada Rust
```

---

## 🚀 Cómo Compilar el Ejecutable

### Prerequisito ÚNICO: Instalar Rust

1. Ir a **https://rustup.rs/** y descargar `rustup-init.exe`
2. Ejecutar el instalador (opción por defecto: `stable`)
3. Reiniciar el terminal/IDE
4. Verificar: `rustc --version` (debe mostrar versión)

> ⚡ Tu PC ya tiene todo lo demás listo:
> - ✅ WebView2 Runtime 149.0.4022.33
> - ✅ Visual Studio Community 2022 (MSVC)
> - ✅ Node.js 24.6.0, pnpm 11.2.2

### Compilar el Ejecutable

Una vez instalado Rust, ejecutar:

```bash
# Opción 1: Script automático (recomendado)
powershell -ExecutionPolicy Bypass -File scripts/tauri-setup.ps1

# Opción 2: Comando directo
pnpm tauri:build
```

### Output esperado

```
src-tauri/target/release/bundle/
├── msi/MuzicMania_2.0.0_x64_en-US.msi   # Instalador MSI (recomendado)
└── nsis/MuzicMania_2.0.0_x64-setup.exe  # Instalador NSIS
```

### Subir a GitHub Releases

1. Crear un nuevo Release en GitHub: `v2.0.0`
2. Subir el `.msi` como asset llamado exactamente: **`MuzicMania_x64_en-US.msi`**
3. La página `/download` ya tiene el link configurado a ese nombre.

---

## 📈 Beneficios a Futuro
* **Aislamiento del Navegador:** Sin atajos de teclado del browser.
* **Integración OS (Futuro):** Notificaciones de Windows, atajos globales, autoarranque.
* **GitHub Actions CI:** Automatizar el build en cada push a main con runners de Windows.


---

## 🔍 Análisis de Viabilidad: ¿Webview Directa vs. Compilación Estática?

Para encapsular Next.js 15 en Tauri, analizamos dos enfoques arquitectónicos:

### Alternativa A: Compilación Estática Local (SSG Wrapper)
* **Cómo funciona:** Se configura Next.js para compilar a HTML/CSS/JS estático (`output: 'export'`) y Tauri empaqueta físicamente todos estos archivos dentro del binario.
* **Ventajas:** Funciona 100% offline (sin internet), latencia de carga interna nula.
* **Desventajas:** 
  - **Incompatible con Next.js Dinámico:** No soporta Server Actions, Middleware de Rutas, Server-Side Rendering (SSR) ni APIs basadas en Node.
  - **Distribución de Actualizaciones Compleja:** Cada cambio menor en el diseño, música o lógica requiere que el usuario descargue y reinstale un nuevo ejecutable `.exe`.
  - **Tamaño del ejecutable mayor:** El binario debe incluir todas las canciones y assets físicos de antemano.

### Alternativa B: Envoltura Webview Directa (Production Webview Shell) — 🟢 RECOMENDADA
* **Cómo funciona:** El ejecutable nativo de Tauri actúa como un "cascarón inteligente" de alto rendimiento. Al iniciarse, levanta una ventana nativa de Windows que carga de forma directa la URL de producción del juego en la web (ej: `https://muzicmania.vercel.app` o la URL final de producción).
* **Ventajas:**
  - **Actualizaciones Inmediatas:** Cualquier actualización realizada en la web (Next.js en Vercel) se refleja **instantáneamente** en la app de escritorio, sin que el usuario tenga que descargar un nuevo `.exe` cada vez.
  - **Soporte Dinámico Total:** Conserva toda la potencia de Next.js 15 (SSR, APIs, Server Actions) y Supabase Auth / Cookies sin ninguna limitación técnica.
  - **Tamaño de Binario Ultra-Ligero:** El instalador final pesa apenas **3 - 4 MB** porque no requiere empaquetar archivos estáticos pesados de antemano.
  - **Excelente Rendimiento:** Utiliza el motor nativo **WebView2** de Windows (basado en Chromium) que posee aceleración por hardware por defecto, ideal para un juego rítmico.

---

## 🛠️ Arquitectura de la Carpeta `src-tauri`

La integración requiere inicializar la carpeta `src-tauri` en la raíz del proyecto. Hemos definido los siguientes tres archivos base pre-configurados:

### 1. `Cargo.toml`
Define el paquete de Rust, las dependencias de Tauri y las características habilitadas.

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

### 2. `tauri.conf.json`
Contiene la configuración de ventanas, dimensiones, comportamiento de Webview y seguridad. Configuramos la ventana para que sea sin bordes personalizados, responsiva y con aceleración por hardware.

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

### 3. `src/main.rs`
El punto de entrada en Rust que inicializa la ventana del Webview nativo y configura el comportamiento de inicio.

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("Error al inicializar el ejecutable de MuzicMania");
}
```

---

## 🚀 Plan de Implementación de Descargas

Para que esta integración sea una realidad visible para los usuarios, implementamos los siguientes dos componentes en el Frontend:

### 1. Página de Descarga Directa (`src/app/download/page.tsx`)
Una interfaz cinematográfica estilo retro-futurista de MuzicMania con:
* Tarjetas de descarga interactivas con efectos neon reactivos al hover.
* Información detallada del instalador de Windows (peso de la descarga, versión, arquitectura x64).
* Requisitos mínimos y recomendados del sistema para jugar MuzicMania PC Edition.
* Instrucciones de instalación sencillas y paso a paso.

### 2. Integración en el Menú de Navegación (`src/config/navigation.tsx`)
Inclusión del link `/download` en el Navbar y Sidebar principal para garantizar que todos los usuarios identifiquen de forma instantánea la existencia de la versión nativa de escritorio para PC.

---

## 📈 Beneficios a Futuro
* **Aislamiento del Navegador:** Al ejecutarse en una ventana dedicada de WebView2, se eliminan las distracciones de pestañas y atajos de teclado del navegador convencional, mejorando el rendimiento en Fps del gameplay.
* **Integración OS (Futuro):** Posibilidad de añadir soporte para atajos de teclado globales nativos, notificaciones de Windows para torneos/eventos, y lectura/escritura de configuraciones locales de audio persistentes.
