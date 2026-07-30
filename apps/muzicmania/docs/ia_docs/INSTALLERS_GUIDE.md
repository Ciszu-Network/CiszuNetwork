# Guía y Nomenclatura de Instaladores

Este documento establece las reglas estrictas de compilación, empaquetado y nomenclatura para los instaladores de la aplicación de escritorio de MuzicMania.

## 1. Nomenclatura de Archivos

Todos los ejecutables finales para descarga pública deben seguir estrictamente:

`MuzicMania(vAPPVERSION)_InstallerSetup(vINSTALLERVERSION)_OS_VERSION_xBITS.ext`

**Ejemplo actual (Windows):**
`MuzicMania(v2.0.1)_InstallerSetup(v2.1.3)_Windows10_x64.exe`
`MuzicMania(v2.0.1)_InstallerSetup(v2.1.3)_Windows11_x64.exe`

**Campos:**
- `APPVERSION` — Versión de la app desde `tauri.conf.json` (ej. 2.0.1)
- `INSTALLERVERSION` — Versión del instalador (independiente, ej. 2.1.3)
- `OS_VERSION` — Sistema operativo + versión sin paréntesis: `Windows10`, `Windows11`, `macOS15`, `Linux`
- `xBITS` — Arquitectura: `x64`, `x86`, `arm64`

## 2. Tecnologías por OS

### Windows (10 / 11)
- **Solo NSIS (`.exe`)**. NO generar `.msi` (Wix).
- `bundle.targets` en Tauri: solo `"nsis"`
- El mismo `.exe` sirve para W10 y W11 (el instalador detecta el OS automáticamente)

### macOS, Linux
- Planeado para futuro. Actualmente solo Windows.

## 3. Flujo Automatizado

El script `scripts/tauri-setup.ps1` maneja todo:

1. Verifica Rust, WebView2, iconos
2. Ejecuta `pnpm tauri build` → genera `.exe` en `bundle/nsis/`
3. Ejecuta `scripts/patch-nsis-lang.ps1` → parchea `installer.nsi` y recompila como `nsis-output.exe`
4. Copia `nsis-output.exe` a `public/downloads/` con el nombre oficial
5. El instalador se sirve públicamente desde `public/downloads/` por la API en `src/app/api/download/windows/route.ts`

## 4. Pipeline Completo (Build + Push)

```powershell
pnpm tauri build
powershell -ExecutionPolicy Bypass -File scripts/patch-nsis-lang.ps1
# Manual: copiar de src-tauri/target/release/nsis/x64/nsis-output.exe a public/downloads/
# O automático: ejecutar scripts/tauri-setup.ps1
```

## 5. Archivos Generados

| Archivo | Origen | Destino |
|---------|--------|---------|
| `nsis-output.exe` | NSIS recompilado tras patch | `src-tauri/target/release/nsis/x64/` |
| `MuzicMania(v...)_InstallerSetup(...).exe` | Copia renombrada | `public/downloads/` |
