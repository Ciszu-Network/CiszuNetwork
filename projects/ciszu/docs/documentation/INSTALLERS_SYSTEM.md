# INSTALLERS_SYSTEM — Sistema de Instaladores y Distribución de Escritorio (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: INSTALLERS_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema que documenta cómo se generan y distribuyen los **instaladores**
> de aplicaciones de escritorio del ecosistema (actualmente MuzicMania con Tauri): tipos de
> instalador, cadena de build, formato de releases, ubicación de archivos y distribución.

---

## 1. ¿Qué es un instalador? (concepto)

Un **instalador** es un ejecutable que empaqueta una app y la coloca en el sistema del
usuario (crea accesos directos, registra la app, copia archivos). Formas comunes:

| Tipo | Extensión | Sistema | Qué hace |
|---|---|---|---|
| **NSIS** | `.exe` (setup) | Windows | Asistente de instalación |
| **MSI** | `.msi` | Windows | Instalador de Microsoft (Windows Installer) |
| **AppImage** | `.AppImage` | Linux | Portable sin instalación |
| **DMG** | `.dmg` | macOS | Disco de instalación |
| **Portable/ZIP** | `.zip` | Cualquiera | Descomprimir y ejecutar |

## 2. Framework de instalación: Tauri bundler

- Tauri 2 incluye **bundling nativo** (no hace falta herramienta externa).
- Genera instaladores de la plataforma desde `tauri build`.
- MuzicMania: **NSIS (`.exe`)** como instalador de Windows.

### 2.1 Cadena de build del instalador

```
pnpm --filter muzicmania-website tauri build
  → compila frontend (Next build/export)
  → compila binario Rust (release)
  → empaqueta en src-tauri/target/release/
     ├── bundle/nsis/*-setup.exe      (instalador NSIS)
     ├── bundle/msi/*.msi             (opcional)
     └── <app>.exe                    (binario portable)
```

### 2.2 Configuración del bundle

En `projects/muzicmania/website/src-tauri/tauri.conf.json`:

```json
{
  "productName": "MuzicMania",
  "version": "2.0.1",
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "identifier": "com.ciszunetwork.muzicmania",
    "publisher": "Ciszuko Antony"
  }
}
```

- `identifier` (bundle id) es único por app.
- Se puede activar `msi` añadiendo al array `targets`.
- Para Linux/macOS se añaden los targets correspondientes.

## 3. Distribución de instaladores

### 3.1 Ubicación en el repo

- Los instaladores se sirven vía **CDN / `public/downloads/`** de la web de MuzicMania.
- NO se suben al repo de Git (binarios grandes excluidos por `.gitignore`).

### 3.2 Ruta de descarga pública

```
https://muzicmania.vercel.app/downloads/MuzicMania-Setup-2.0.1.exe
```

- Se actualiza al publicar cada versión (cambiar `2.0.1` por la nueva versión).
- Ver `CDN_SYSTEM.md` para cómo sirven los assets.

### 3.3 Publicar una nueva versión

| Paso | Acción |
|---|---|
| 1 | Cambiar versión en `tauri.conf.json` (y `package.json`) |
| 2 | `pnpm --filter muzicmania-website tauri build` |
| 3 | Comprobar que se generó el `.exe` en `target/release/bundle/nsis/` |
| 4 | Subir a `public/downloads/` (o CDN) con el nuevo nombre/versión |
| 5 | Actualizar la página de descarga de MuzicMania |
| 6 | Actualizar `STATUS_SYSTEM.md` / changelog |

## 4. Verificación de instaladores (integridad)

- Probar instalación en Windows limpio (o máquina virtual).
- Comprobar que la app abre, la versión es correcta y el acceso directo se crea.
- Opcional: calcular **hash** (SHA-256) para publicarlo junto al enlace:

```powershell
Get-FileHash "MuzicMania-Setup-2.0.1.exe" -Algorithm SHA256
```

## 5. Firmas y reputación

- **Sin firma de código** por ahora → Windows muestra aviso SmartScreen ("Unknown
  publisher"). Se documenta en la página de descarga.
- Firmar con certificado (EV/OV) es un coste futuro; se evaluará cuando la empresa esté
  registrada (ver `COMPANY_REGISTRATION_PLAN.md`).

## 6. Actualizaciones automáticas (auto-update)

- **Tauri updater** permite actualizar la app sin reinstalar.
- Requiere: endpoints de versión + firmado (generar clave con `tauri signer`).
- Estado actual: **pendiente** (no configurado). MuzicMania se actualiza descargando la
  nueva versión desde la web.
- Plan: cuando haya dominio propio, publicar `latest.json` + binarios y activar updater.

## 7. Plataformas objetivo

| Plataforma | Instalador | Estado |
|---|---|---|
| Windows | NSIS `.exe` | ✅ Actual |
| Windows MSI | `.msi` | ⏳ Opcional |
| Linux | AppImage/DEB | ⏳ Futuro |
| macOS | DMG | ⏳ Futuro (requiere Apple) |

## 8. Comparativa de generadores de instaladores (evaluación)

| Herramienta | Windows | Linux | macOS | Notas |
|---|---|---|---|---|
| **Tauri bundler** | ✅ NSIS/MSI | ✅ AppImage/DEB | ✅ DMG | Elegido (integrado) |
| electron-builder | ✅ | ✅ | ✅ | Requiere Electron (rechazado) |
| WiX Toolset | ✅ MSI | ❌ | ❌ | Solo Windows, complejo |
| Inno Setup | ✅ | ❌ | ❌ | Solo Windows, manual |
| pkg (JS) | ✅ | ✅ | ✅ | Solo apps Node |

## 9. Checklist de release de instalador

- [ ] Versión actualizada en `tauri.conf.json` y web.
- [ ] `tauri build` completo y sin errores.
- [ ] `.exe` generado en `bundle/nsis/`.
- [ ] Probado en Windows (instalación + apertura).
- [ ] Subido a `public/downloads/` y página de descarga actualizada.
- [ ] Hash SHA-256 publicado (opcional).
- [ ] Changelog + `STATUS_SYSTEM.md` actualizados.

## 10. Terminología de instaladores (contexto informático)

| Término | Definición |
|---|---|
| **Instalador** | Programa que coloca la app en el sistema del usuario |
| **Bundle** | Empaquetado de la app lista para instalar |
| **Build** | Compilación del binario ejecutable |
| **Target** | Formato de salida del bundle (nsis, msi, appimage, dmg) |
| **ProductName** | Nombre visible de la app instalada |
| **Identifier** | ID único de la app (inversa de dominio) |
| **Publisher** | Nombre del publicador (firma) |
| **Setup** | Asistente de instalación de Windows |
| **Portable** | Ejecutable que no requiere instalación |
| **Checksum/hash** | Huella del archivo para verificar integridad |

## 11. Estructura de `src-tauri` (MuzicMania)

```
src-tauri/
├── Cargo.toml          # dependencias Rust
├── tauri.conf.json     # config de la app y bundle
├── capabilities/       # permisos del WebView
├── icons/              # iconos de la app
└── src/
    ├── main.rs         # entry point
    └── lib.rs          # lógica del backend Tauri
```

- Los comandos Rust (`#[tauri::command]`) se invocan desde el frontend con `invoke()`.
- La app embebe la web de MuzicMania (build previo).

## 12. Relación con el CDN y `public/downloads/`

- El binario NO se sube a Git (gitignored por tamaño).
- Se sirve desde `public/downloads/` de la web MuzicMania o desde el CDN Supabase.
- Ver `CDN_SYSTEM.md` para subir assets y `MEDIA_FORMATS_SYSTEM.md` para pesos.

## 13. Seguridad de instaladores

- Verificar que el binario generado corresponde al build oficial (hash).
- Publicar el hash SHA-256 junto al enlace para que el usuario pueda validar.
- SmartScreen: sin firma aparece advertencia; documentar en la página de descarga.
- No distribuir binarios externos/no oficiales.

## 14. Preguntas frecuentes

**¿Por qué Tauri y no Electron?** Tauri genera binarios de 5-10 MB y usa menos RAM;
Electron supera los 100 MB. Decisión fijada en `ARCHITECTURE.md`.

**¿MuzicMania se actualiza solo?** Aún no (updater pendiente); el usuario descarga la
nueva versión desde la web.

**¿Hay versión para Linux/macOS?** No actualmente; es Windows-first (NSIS). En roadmap.

**¿El instalador requiere WebView2?** Windows 11 lo trae; Windows 10 puede necesitar
instalarlo (aviso en la página de descarga).

## 15. Resumen ejecutivo

- Instalador actual: **NSIS `.exe`** generado por **Tauri bundler**.
- Se distribuye desde `public/downloads/` + página de descarga.
- Auto-update (Tauri updater) es el siguiente paso cuando haya dominio/CDN estable.

_Última revisión: 13 ago 2026._ Relacionado: `FRAMEWORKS_SYSTEM.md`, `CDN_SYSTEM.md`,
`PROJECTS_SYSTEM.md`, `FULL_STACK_SYSTEM.md`.
